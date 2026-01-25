# Query Data Documentation

This document describes how clients query the memory system via HTTP and WebSocket.

---

## Overview

Clients query memories through two mechanisms:
1. **HTTP Upload** - `POST /query-upload/{query_id}` for optional image attachment
2. **WebSocket** - `/ws/query/{user_id}` for sending queries and receiving responses

> **Note:** Legacy `/ws/unity/{user_id}` endpoint only handles `fetch_daily_memories` requests. Use `/ws/query` for all query operations.

---

## Endpoints

### 1. Image Upload: `POST /query-upload/{query_id}`

Upload an image to include with your query (optional).

**Request:**
```
POST /query-upload/{query_id}
Content-Type: multipart/form-data

file: <binary image data>
```

**Response:**
```json
{
  "status": "success",
  "url": "https://storage.googleapis.com/reality-hack-2026-raw-media/queries/{query_id}/image.jpg",
  "queryId": "abc-123-def-456"
}
```

**Error Response:**
```json
{
  "status": "error",
  "error": "upload failed: <details>"
}
```

---

### 2. Query WebSocket: `/ws/query/{user_id}`

Real-time connection for sending queries and receiving responses.

#### Connection
```
WebSocket: wss://{host}/ws/query/{user_id}
```

#### Query Flow

```
Client                          Backend                      Cloud Storage
   |                               |                              |
   |-- POST /query-upload/{id} --->|                              |
   |   (optional image)            |-- Upload to GCS ------------>|
   |<-- {"status":"success",...} --|                              |
   |                               |                              |
   |== WebSocket /ws/query/{user_id} ==|                          |
   |                               |                              |
   |-- {"text":"...", "imageURL":...} ->|                         |
   |                               |-- Gemini Processing          |
   |                               |   (uses recent queries       |
   |                               |    for context)              |
   |<-- {"type":"response",...} ---|                              |
```

---

## Request Format

### Connection
```
WebSocket: wss://{host}/ws/query/{user_id}
```

### Query Request
```json
{
  "text": "Who is this person?",
  "imageURL": "https://storage.googleapis.com/reality-hack-2026-raw-media/queries/abc-123/image.jpg",
  "dateRange": {
    "start": "2026-01-23",
    "end": "2026-01-24"
  },
  "includeFaces": true,
  "maxImages": 8
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `text` | Yes | Natural language query |
| `imageURL` | No | URL from `POST /query-upload` (enables vision model) |
| `dateRange` | No | Limit search to date range `{start, end}` |
| `includeFaces` | No | Include face images in response (default: true) |
| `maxImages` | No | Max images to attach (default: 8, max: 16) |

### Query with Image Examples
```json
// Ask about a person in a photo
{
  "text": "Who is this person? Do I know them?",
  "imageURL": "https://storage.googleapis.com/.../queries/q1/image.jpg"
}

// Ask about a location
{
  "text": "Have I been to this place before?",
  "imageURL": "https://storage.googleapis.com/.../queries/q2/image.jpg"
}

// Ask about an object
{
  "text": "Where did I leave this?",
  "imageURL": "https://storage.googleapis.com/.../queries/q3/image.jpg"
}
```

### Follow-up Query
Simply send a new query - recent queries are stored and provided as context:
```json
{
  "text": "The afternoon one, around 2pm"
}
```

---

## Response Formats

### Successful Response
```json
{
  "type": "response",
  "ok": true,
  "answer": "Yesterday at the coffee shop, you met with John Smith around 2pm. You discussed the hackathon project and he mentioned his new job at Google.",
  "confidence": 0.85,
  "sources": [
    {
      "captureId": "abc-123",
      "timestamp": "2026-01-23T14:30:00Z",
      "summary": "Meeting at Blue Bottle Coffee"
    }
  ],
  "relatedContacts": [
    {
      "name": "John Smith",
      "relationship": "friend",
      "faceImageURL": "https://storage.googleapis.com/..."
    }
  ],
  "attachedImages": [
    "https://storage.googleapis.com/..."
  ],
  "suggestedFollowUp": "Would you like to know more about what you discussed?"
}
```

### Error Response
```json
{
  "type": "error",
  "ok": false,
  "error": "query_failed",
  "detail": "Error message"
}
```

---

## Context Building

### Always Included
- User profile (lifestyle, preferences, medical notes)
- Last hour summary
- Last day summary
- Contacts list (names and relationships)

### Fetched On Demand
- Specific captures matching date range
- Hourly summaries for relevant dates
- Daily summaries for relevant dates
- Face images for mentioned contacts

---

## Face Query Handling

When `includeFaces` is true and query involves people:

1. **Identify relevant contacts** from query text
2. **Fetch face images** from `contacts` document (`bestFacePhotoURL`)
3. **Attach to Gemini context** (up to `maxImages`)
4. **Include in response** for client to display

### Face Image Limits
- Default: 8 images
- Maximum: 16 images
- Priority: Most recently seen contacts first

---

## Conversation Context

Recent queries (last 5-20) are automatically stored and provided to Gemini for context.

### How It Works
```
Query 1: "What did I do yesterday?"
→ Response: "You went to the coffee shop and met John..."
→ Stored in recent_queries

Query 2: "Tell me more about that meeting"
→ Gemini sees Query 1 + Response as context
→ Understands "that meeting" refers to John
→ Provides detailed follow-up
```

### Clarification Flow
When a query is ambiguous, Gemini responds with a clarifying question as a regular response:
```
Query: "Tell me about the meeting"
→ Response: "I found multiple meetings yesterday. Which one - the morning standup at 9am or the coffee chat with John at 2pm?"

Query: "The one with John"
→ Gemini uses recent query context
→ Response: "Your meeting with John at 2pm was at Blue Bottle Coffee..."
```

---

## Example Queries

| Query | Type | Data Needed |
|-------|------|-------------|
| "Who did I see today?" | person | Today's captures, contacts |
| "What happened yesterday afternoon?" | time | Yesterday's hourly summaries (12-18) |
| "Show me photos from the hackathon" | event | Captures with "hackathon" theme |
| "How have I been feeling this week?" | general | Daily summaries for past 7 days |
| "What does Sarah look like?" | person + face | Contact face image |

---

## Legacy Endpoint

The legacy `/ws/unity/{user_id}` endpoint supports `fetch_daily_memories`:

```json
{
  "type": "fetch_daily_memories",
  "date": "2026-01-24"
}
```

Response:
```json
{
  "ok": true,
  "type": "daily_memories",
  "date": "2026-01-24",
  "summary": "...",
  "themes": ["..."],
  "timeline": [{"time": "HH:MM", "event": "..."}],
  "captures": [...],
  "totalCaptures": 120
}
```
