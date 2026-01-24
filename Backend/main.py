import os
import json
import uuid
import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime, date, timezone
from typing import Any, Dict, List, Optional, Set, Tuple

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

try:
    from google.cloud import firestore  # type: ignore
except Exception:  # pragma: no cover
    firestore = None  # type: ignore


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
)
logger = logging.getLogger("realityhacks-backend")


app = FastAPI()

# CORS enabled for all origins (hackathon-friendly)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


def _parse_iso_datetime(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value
    if not isinstance(value, str):
        raise ValueError("timestamp must be an ISO8601 string")
    s = value.strip()
    # Support trailing Z
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    dt = datetime.fromisoformat(s)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _date_key_from_dt(dt: datetime) -> str:
    # stored as YYYY-MM-DD (Unity request format)
    return dt.astimezone(timezone.utc).date().isoformat()


@dataclass
class InMemoryDB:
    captures: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    processed_memories: Dict[Tuple[str, str], Dict[str, Any]] = field(default_factory=dict)


class FirestoreRepo:
    def __init__(self) -> None:
        self.project_id = os.environ.get("GCP_PROJECT_ID")
        self._mem = InMemoryDB()
        self._client = None

        if firestore is None:
            logger.warning("google-cloud-firestore not available; using in-memory DB")
            return

        try:
            # Uses ADC on Cloud Run. Locally, set GOOGLE_APPLICATION_CREDENTIALS.
            self._client = firestore.AsyncClient(project=self.project_id)
            logger.info("Firestore client initialized (project=%s)", self.project_id)
        except Exception:
            logger.exception("Failed to initialize Firestore; using in-memory DB")
            self._client = None

    @property
    def is_firestore(self) -> bool:
        return self._client is not None

    async def create_capture(self, doc: Dict[str, Any]) -> None:
        if not self._client:
            self._mem.captures[doc["id"]] = doc
            return

        await self._client.collection("memory_captures").document(doc["id"]).set(doc)

    async def update_capture(self, capture_id: str, updates: Dict[str, Any]) -> None:
        if not self._client:
            if capture_id in self._mem.captures:
                self._mem.captures[capture_id].update(updates)
            return

        await self._client.collection("memory_captures").document(capture_id).update(updates)

    async def list_captures_for_date(self, user_id: str, day: date) -> List[Dict[str, Any]]:
        if not self._client:
            out: List[Dict[str, Any]] = []
            for doc in self._mem.captures.values():
                if doc.get("userId") != user_id:
                    continue
                ts = doc.get("timestamp")
                if isinstance(ts, datetime):
                    d = ts.astimezone(timezone.utc).date()
                else:
                    try:
                        d = _parse_iso_datetime(ts).astimezone(timezone.utc).date()
                    except Exception:
                        continue
                if d == day:
                    out.append(doc)
            out.sort(key=lambda x: x.get("timestamp") or datetime.min)
            return out

        start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
        end = start.replace(hour=23, minute=59, second=59, microsecond=999999)

        q = (
            self._client.collection("memory_captures")
            .where("userId", "==", user_id)
            .where("timestamp", ">=", start)
            .where("timestamp", "<=", end)
            .order_by("timestamp")
        )

        snaps = [doc async for doc in q.stream()]
        return [s.to_dict() for s in snaps]

    async def get_processed_memory(self, user_id: str, date_key: str) -> Optional[Dict[str, Any]]:
        if not self._client:
            return self._mem.processed_memories.get((user_id, date_key))

        snap = await (
            self._client.collection("processed_memories")
            .document(f"{user_id}_{date_key}")
            .get()
        )
        if not snap.exists:
            return None
        return snap.to_dict()

    async def upsert_processed_memory(self, user_id: str, date_key: str, doc: Dict[str, Any]) -> None:
        if not self._client:
            self._mem.processed_memories[(user_id, date_key)] = doc
            return

        await (
            self._client.collection("processed_memories")
            .document(f"{user_id}_{date_key}")
            .set(doc)
        )


repo = FirestoreRepo()


class ConnectionManager:
    def __init__(self) -> None:
        self._ios: Dict[str, Set[WebSocket]] = {}
        self._unity: Dict[str, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, kind: str, user_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            bucket = self._ios if kind == "ios" else self._unity
            bucket.setdefault(user_id, set()).add(websocket)
        logger.info("WS connected kind=%s user=%s", kind, user_id)

    async def disconnect(self, kind: str, user_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            bucket = self._ios if kind == "ios" else self._unity
            if user_id in bucket:
                bucket[user_id].discard(websocket)
                if not bucket[user_id]:
                    del bucket[user_id]
        logger.info("WS disconnected kind=%s user=%s", kind, user_id)

    async def send_json(self, websocket: WebSocket, data: Dict[str, Any]) -> None:
        await websocket.send_text(json.dumps(data))

    async def broadcast_unity(self, user_id: str, data: Dict[str, Any]) -> None:
        async with self._lock:
            conns = list(self._unity.get(user_id, set()))
        if not conns:
            return
        payload = json.dumps(data)
        dead: List[WebSocket] = []
        for ws in conns:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        if dead:
            async with self._lock:
                for ws in dead:
                    self._unity.get(user_id, set()).discard(ws)


manager = ConnectionManager()


@app.get("/")
async def health_check() -> Dict[str, str]:
    return {"status": "ok"}


async def _mock_gemini_analyze_capture(capture: Dict[str, Any]) -> Dict[str, Any]:
    # Simulate latency
    await asyncio.sleep(0.3)

    t = (capture.get("transcription") or "").strip()
    location = capture.get("location") or {}

    analysis = {
        "title": "Mock memory analysis",
        "highlights": [
            (t[:120] + ("..." if len(t) > 120 else "")) if t else "No transcription provided",
        ],
        "mood": "positive",
        "locationHint": location.get("name") if isinstance(location, dict) else None,
    }

    # TODO: Replace this with real Gemini integration (async call + robust retries/timeouts).
    return analysis


def _mock_daily_summary(captures: List[Dict[str, Any]]) -> Tuple[str, List[str]]:
    themes = ["friends", "work", "travel"]
    if not captures:
        return "No captures for this day.", []
    return f"You captured {len(captures)} moments today.", themes


async def _process_capture_async(user_id: str, capture_id: str, capture_ts: datetime) -> None:
    try:
        capture_doc = None
        # In Firestore mode we re-fetch by date when building daily; for speed, just build analysis from known fields
        # NOTE: In-memory mode updates happen in-place.
        if not repo.is_firestore:
            capture_doc = repo._mem.captures.get(capture_id)  # type: ignore[attr-defined]

        analysis = await _mock_gemini_analyze_capture(capture_doc or {"id": capture_id})

        await repo.update_capture(
            capture_id,
            {
                "processed": True,
                "geminiAnalysis": analysis,
            },
        )

        day_key = _date_key_from_dt(capture_ts)
        day = capture_ts.astimezone(timezone.utc).date()

        captures = await repo.list_captures_for_date(user_id, day)
        summary, themes = _mock_daily_summary(captures)

        processed_doc = {
            "userId": user_id,
            "date": day_key,
            "summary": summary,
            "themes": themes,
            "captureIds": [c.get("id") for c in captures if c.get("id")],
        }
        await repo.upsert_processed_memory(user_id, day_key, processed_doc)

        # Push a lightweight notification to any connected Unity clients (optional convenience)
        await manager.broadcast_unity(
            user_id,
            {
                "type": "memory_processed",
                "date": day_key,
                "captureId": capture_id,
            },
        )

        logger.info("Processed capture=%s user=%s", capture_id, user_id)
    except Exception:
        logger.exception("Gemini processing failed for capture=%s user=%s", capture_id, user_id)
        try:
            await repo.update_capture(
                capture_id,
                {"processed": False, "geminiAnalysis": {"error": "processing_failed"}},
            )
        except Exception:
            logger.exception("Failed to mark capture processing failure")


@app.websocket("/ws/ios/{user_id}")
async def ws_ios(websocket: WebSocket, user_id: str) -> None:
    await manager.connect("ios", user_id, websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await manager.send_json(websocket, {"ok": False, "error": "invalid_json"})
                continue

            try:
                capture_id = str(msg.get("id") or uuid.uuid4())
                ts = _parse_iso_datetime(msg.get("timestamp"))

                doc = {
                    "id": capture_id,
                    "userId": user_id,
                    "timestamp": ts,
                    "photoURL": msg.get("photoURL"),
                    "audioURL": msg.get("audioURL"),
                    "transcription": msg.get("transcription"),
                    "location": msg.get("location"),
                    "processed": False,
                    "geminiAnalysis": None,
                }

                await repo.create_capture(doc)

                await manager.send_json(
                    websocket,
                    {
                        "ok": True,
                        "type": "ack",
                        "id": capture_id,
                    },
                )

                # Non-blocking processing
                asyncio.create_task(_process_capture_async(user_id, capture_id, ts))

            except Exception as e:
                logger.exception("Failed to handle iOS message user=%s", user_id)
                await manager.send_json(
                    websocket,
                    {
                        "ok": False,
                        "error": "failed_to_save",
                        "detail": str(e),
                    },
                )

    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("iOS websocket error user=%s", user_id)
    finally:
        await manager.disconnect("ios", user_id, websocket)


def _serialize_capture(doc: Dict[str, Any]) -> Dict[str, Any]:
    out = dict(doc)
    ts = out.get("timestamp")
    if isinstance(ts, datetime):
        out["timestamp"] = ts.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    return out


@app.websocket("/ws/unity/{user_id}")
async def ws_unity(websocket: WebSocket, user_id: str) -> None:
    await manager.connect("unity", user_id, websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                req = json.loads(raw)
            except json.JSONDecodeError:
                await manager.send_json(websocket, {"ok": False, "error": "invalid_json"})
                continue

            rtype = req.get("type")
            if rtype == "fetch_daily_memories":
                try:
                    date_str = req.get("date")
                    if not isinstance(date_str, str):
                        raise ValueError("date must be a string YYYY-MM-DD")
                    day = datetime.fromisoformat(date_str).date()
                    date_key = day.isoformat()

                    captures = await repo.list_captures_for_date(user_id, day)
                    processed = await repo.get_processed_memory(user_id, date_key)

                    if processed is None:
                        summary, themes = _mock_daily_summary(captures)
                    else:
                        summary = processed.get("summary")
                        themes = processed.get("themes")

                    await manager.send_json(
                        websocket,
                        {
                            "ok": True,
                            "type": "daily_memories",
                            "date": date_key,
                            "summary": summary,
                            "themes": themes,
                            "captures": [_serialize_capture(c) for c in captures],
                            "totalCaptures": len(captures),
                        },
                    )
                except Exception as e:
                    logger.exception("Unity fetch_daily_memories failed user=%s", user_id)
                    await manager.send_json(
                        websocket,
                        {
                            "ok": False,
                            "type": "daily_memories",
                            "error": "fetch_failed",
                            "detail": str(e),
                        },
                    )
            else:
                await manager.send_json(
                    websocket,
                    {
                        "ok": False,
                        "error": "unknown_request_type",
                        "detail": f"type={rtype}",
                    },
                )

    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("Unity websocket error user=%s", user_id)
    finally:
        await manager.disconnect("unity", user_id, websocket)
