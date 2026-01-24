# iOS WebSocket Integration - Quick Reference

**For Po-Lin's iOS App**

---

## Connection

**WebSocket URL:**
```
wss://memory-backend-328251955578.us-east1.run.app/ws/ios/{user_id}
```

Replace `{user_id}` with actual user ID (e.g., `po-lin`)

⚠️ Must use `wss://` (secure), NOT `ws://`

---

## Message Format

Send this JSON structure as a **text message**:
```json
{
  "type": "memory_capture",
  "id": "ABC-123",
  "timestamp": "2026-01-23T14:30:00Z",
  "photoURL": "https://storage.googleapis.com/reality-hack-2026-raw-media/memories/ABC-123/photo.jpg",
  "audioURL": "https://storage.googleapis.com/reality-hack-2026-raw-media/memories/ABC-123/audio.m4a",
  "transcription": "Walking through MIT campus"
}
```

### Required Fields
- ✅ `type` - Must be `"memory_capture"`
- ✅ `id` - Unique capture ID (use UUID)
- ✅ `timestamp` - ISO 8601 format with timezone (e.g., `"2026-01-23T14:30:00Z"`)

### Optional Fields
- `photoURL` - Full GCS URL after upload
- `audioURL` - Full GCS URL after upload  
- `transcription` - Text from audio

---

## Response

**Success:**
```json
{
  "type": "ack",
  "status": "received",
  "captureId": "ABC-123",
  "timestamp": "2026-01-23T14:30:00Z"
}
```

**Error:**
```json
{
  "ok": false,
  "error": "failed_to_save",
  "detail": "error details"
}
```

---

## Complete Flow

### 1. Upload Photo First
```http
POST https://memory-backend-328251955578.us-east1.run.app/upload/ABC-123
Content-Type: multipart/form-data
```

Returns the `photoURL` to use in WebSocket message.

### 2. Connect WebSocket
```swift
let url = URL(string: "wss://memory-backend-328251955578.us-east1.run.app/ws/ios/po-lin")!
webSocket = URLSession.shared.webSocketTask(with: url)
webSocket?.resume()
```

### 3. Send Capture
```swift
let capture: [String: Any] = [
    "type": "memory_capture",
    "id": captureId,
    "timestamp": ISO8601DateFormatter().string(from: Date()),
    "photoURL": photoURL,
    "transcription": transcription
]

let jsonData = try! JSONSerialization.data(withJSONObject: capture)
let jsonString = String(data: jsonData, encoding: .utf8)!
webSocket?.send(.string(jsonString)) { error in
    if let error = error { print("Error: \(error)") }
}
```

### 4. Listen for Response
```swift
webSocket?.receive { result in
    switch result {
    case .success(.string(let text)):
        print("Response: \(text)")
        // Check for {"type":"ack"} to confirm success
    case .failure(let error):
        print("Error: \(error)")
    }
}
```

---

## Test with Command Line
```bash
# Install wscat
npm install -g wscat

# Connect
wscat -c "wss://memory-backend-328251955578.us-east1.run.app/ws/ios/test-user"

# Send test message (paste and press Enter)
{"type":"memory_capture","id":"test-123","timestamp":"2026-01-23T15:30:00Z","photoURL":"https://storage.googleapis.com/reality-hack-2026-raw-media/test.jpg","transcription":"Test"}
```

You should immediately see the `ack` response.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection fails | Use `wss://` not `ws://` |
| "invalid_json" error | Make sure you're sending a JSON string, not object |
| "invalid_type" error | Include `"type": "memory_capture"` field |
| No response | Check timestamp format is ISO 8601 with timezone |
| Data not in Firestore | Wait 2-3 seconds and refresh console |

**Check backend health:**
```bash
curl https://memory-backend-328251955578.us-east1.run.app/
# Should return: {"status":"ok"}
```

**View logs:**
```bash
gcloud run logs read memory-backend --region us-east1 --limit 50
```

---

## What Happens Behind the Scenes

1. Backend receives your message
2. Saves to Firestore `memory_captures` collection
3. Sends `ack` response immediately
4. Processes with Gemini in background (async)
5. Creates daily summary combining all captures