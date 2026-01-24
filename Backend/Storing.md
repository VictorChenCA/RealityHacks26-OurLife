# Data Storage Schema & Flow

This document describes how memory data is stored and organized in Firestore and Cloud Storage.

---

## Cloud Storage Buckets

### 1. `reality-hack-2026-raw-media` (Private)
- **Purpose**: Stores original, unprocessed media from iOS
- **Access**: Private (authenticated backend only)
- **Structure**: `memories/{capture_id}/photo.jpg`, `memories/{capture_id}/audio.m4a`
- **Lifecycle**: Transitions to Nearline after 90 days, deleted after 1 year

### 2. `reality-hack-2026-processed-media` (Public)
- **Purpose**: Stores optimized/processed media for Unity
- **Access**: Public read (`allUsers` has Storage Object Viewer)
- **Structure**: `processed/{capture_id}/photo.jpg`, `faces/{user_id}/{contact_name}.jpg`

---

## Firestore Collections

### `memory_captures`
Individual memory captures from iOS app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique capture ID |
| `userId` | string | User who created capture |
| `timestamp` | timestamp | When capture was taken |
| `photoURL` | string | GCS URL to raw photo |
| `audioURL` | string | GCS URL to raw audio |
| `transcription` | string | Transcribed text |
| `processed` | boolean | Whether Gemini has analyzed |
| `geminiAnalysis` | map | Analysis results (see below) |

**geminiAnalysis structure:**
```json
{
  "imageSummary": "Person sitting at cafe with laptop",
  "themes": ["work", "focus", "afternoon"],
  "detectedFaces": [{"name": "John", "confidence": 0.9}],
  "mood": "productive",
  "location": "indoor cafe"
}
```

---

### `user_profiles`
Document ID: `profile_{user_id}`

One document per user containing lifestyle/general information.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | User ID |
| `name` | string | User's name |
| `occupation` | string | What they do |
| `familyMembers` | array | List of family member names/relations |
| `dailyRoutines` | string | Description of typical day |
| `medicalNotes` | string | Important health information |
| `preferences` | map | User preferences |
| `lastDaySummaryDate` | string | Date of most recent daily summary |
| `lastDaySummary` | string | Content of most recent daily summary |
| `lastHourSummaryTime` | string | Timestamp of most recent hourly summary |
| `lastHourSummary` | string | Content of most recent hourly summary |
| `lastCondensationTime` | timestamp | When hourly condensation last ran |
| `createdAt` | timestamp | Profile creation time |
| `updatedAt` | timestamp | Last update time |

---

### `contacts`
Document ID: `contacts_{user_id}`

One document per user containing all known contacts.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | User ID |
| `contacts` | array | Array of contact objects |
| `updatedAt` | timestamp | Last update time |

**Contact object structure:**
```json
{
  "name": "John Smith",
  "relationship": "friend",
  "notes": "Met at MIT hackathon",
  "bestFacePhotoURL": "https://storage.googleapis.com/reality-hack-2026-processed-media/faces/user123/john_smith.jpg",
  "firstSeen": "2026-01-23T10:00:00Z",
  "lastSeen": "2026-01-24T14:30:00Z",
  "mentionCount": 5
}
```

---

### `hourly_summaries`
Document ID: `hourly_{user_id}_{YYYY-MM-DD}_{HH}` (e.g., `hourly_user123_2026-01-24_14`)

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | User ID |
| `date` | string | Date (YYYY-MM-DD) |
| `hour` | int | Hour (0-23) |
| `summary` | string | Condensed summary of that hour |
| `themes` | array | Key themes from that hour |
| `captureIds` | array | IDs of captures included |
| `captureCount` | int | Number of captures |
| `createdAt` | timestamp | When summary was created |

---

### `daily_summaries`
Document ID: `daily_{user_id}_{YYYY-MM-DD}` (e.g., `daily_user123_2026-01-24`)

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | User ID |
| `date` | string | Date (YYYY-MM-DD) |
| `summary` | string | Full day summary |
| `themes` | array | Key themes from the day |
| `highlights` | array | Notable moments |
| `hourlyIds` | array | IDs of hourly summaries included |
| `totalCaptures` | int | Total captures that day |
| `createdAt` | timestamp | When summary was created |

---

## Data Flow

### iOS Capture Flow
```
iOS App → POST /upload/{id} → reality-hack-2026-raw-media bucket
       → WS /ws/ios/{user_id} → memory_captures collection
                              → Gemini analysis (async)
                              → Update contacts if names detected
                              → Check hourly condensation trigger
```

### Hourly Condensation (triggered on each capture)
```
Check: Has 1 hour passed since lastCondensationTime?
  Yes → Fetch all captures from last hour
      → Gemini summarizes into hourly_summaries doc
      → Update user_profiles.lastHourSummary
      → Update user_profiles.lastCondensationTime
```

### Daily Condensation (midnight EST check)
```
Check: Is it past midnight EST and no daily summary for yesterday?
  Yes → Fetch all hourly_summaries for yesterday
      → Gemini summarizes into daily_summaries doc
      → Update user_profiles.lastDaySummary
```

---

## Naming Conventions

| Document Type | ID Format | Example |
|--------------|-----------|---------|
| User Profile | `profile_{user_id}` | `profile_victor123` |
| Contacts | `contacts_{user_id}` | `contacts_victor123` |
| Hourly Summary | `hourly_{user_id}_{date}_{hour}` | `hourly_victor123_2026-01-24_14` |
| Daily Summary | `daily_{user_id}_{date}` | `daily_victor123_2026-01-24` |
| Memory Capture | `{capture_id}` (UUID) | `abc-123-def-456` |