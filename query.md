# Query Pipeline Documentation

This document explains how clients query the memory system and how Gemini processes those queries.

---

## Overview

Clients connect via WebSocket to **`/ws/query/{user_id}`** and send natural language queries about the user's memories. Gemini interprets these queries, fetches relevant data, and returns helpful responses.

> **Note:** Legacy `/ws/unity/{user_id}` endpoint only handles `fetch_daily_memories` requests. Use `/ws/query` for all query operations.

---

## Query Flow

```
Client                          Backend                         Gemini
    |                              |                               |
    |-- {"text":"query",...} ----->|                               |
    |                              |-- Build context -------------->|
    |                              |   (profile, contacts,         |
    |                              |    recent summaries)          |
    |                              |                               |
    |                              |<-- Decision: need more data? -|
    |                              |                               |
    |                              |   [If yes: fetch internally]  |
    |                              |-- Additional context -------->|
    |                              |                               |
    |                              |<-- Final response ------------|
    |<-- {"type":"response",...} --|                               |
    |                              |                               |
    |   [OR if clarification needed]                               |
    |<-- {"type":"clarification_needed",...} --|                   |
    |                              |                               |
    |-- {"text":"follow-up"} ----->|  (client answers clarification)
    |                              |-- Process follow-up --------->|
    |<-- {"type":"response",...} --|                               |
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
  "text": "Who did I meet yesterday at the coffee shop?",
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
| `dateRange` | No | Limit search to date range `{start, end}` |
| `includeFaces` | No | Include face images in response (default: true) |
| `maxImages` | No | Max images to attach (default: 8, max: 16) |

### Follow-up (after clarification)
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
  ]
}
```

### Clarification Needed
```json
{
  "type": "clarification_needed",
  "ok": true,
  "message": "I found multiple coffee shop visits yesterday. Could you specify which one? Morning (9am) or afternoon (2pm)?",
  "options": ["Morning visit at 9am", "Afternoon visit at 2pm"]
}
```

### Error Response
```json
{
  "type": "response",
  "ok": false,
  "error": "query_failed",
  "detail": "Error message"
}
```

---

## System Prompts

### QUERY_ROUTER_PROMPT
First-pass to understand the query and determine what data is needed.

```
You are a memory assistant helping a user recall their experiences.

Given a query about the user's memories, determine:
1. What type of information is being requested
2. What data sources are needed to answer
3. Whether the query is about specific people (face lookup needed)

User Profile:
{user_profile}

Known Contacts:
{contacts_summary}

Recent Context:
- Last hour summary: {last_hour_summary}
- Last day summary: {last_day_summary}

Query: "{query_text}"
Date range: {date_range}

Return a JSON object:
{
  "queryType": "person" | "event" | "location" | "time" | "general",
  "needsFaceImages": true/false,
  "relevantContacts": ["names of contacts that might be relevant"],
  "dataNeeded": {
    "captures": true/false,
    "hourlySummaries": true/false,
    "dailySummaries": true/false,
    "specificDates": ["YYYY-MM-DD", ...]
  },
  "needsClarification": true/false,
  "clarificationQuestion": "question if needed"
}
```

### QUERY_ANSWER_PROMPT
Used to generate the final answer after data is gathered.

```
You are a memory assistant helping a user recall their experiences.
Be warm, helpful, and specific. Reference actual details from the memories.

User Profile:
{user_profile}

Relevant Memories:
{memory_context}

Relevant Contacts:
{contacts_with_faces}

Query: "{query_text}"

Provide a helpful, conversational answer. Include:
- Specific details (times, places, people)
- Context that helps jog memory
- Any relevant patterns you notice

Return a JSON object:
{
  "answer": "Your conversational response",
  "confidence": 0.0-1.0,
  "sourceCaptureIds": ["ids of captures used"],
  "mentionedContacts": ["names mentioned in answer"],
  "suggestedFollowUp": "optional follow-up question"
}
```

---

## Face Query Handling

When `includeFaces` is true and query involves people:

1. **Identify relevant contacts** from query text
2. **Fetch face images** from `contacts` document (`bestFacePhotoURL`)
3. **Attach to Gemini context** (up to `maxImages`)
4. **Include in response** for Unity to display

### Face Image Limits
- Default: 8 images
- Maximum: 16 images
- Priority: Most recently seen contacts first

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

## Two-Way Clarification

### Gemini Fetches Internally
When Gemini determines it needs more data that exists in the system:
```
Query: "What did I do last Tuesday?"
→ Gemini: needs daily_summary for 2026-01-21
→ Backend: fetches internally, no user interaction
→ Gemini: generates answer with full context
```

### Gemini Asks User
When the query is ambiguous or data doesn't exist:
```
Query: "Tell me about the meeting"
→ Gemini: unclear which meeting
→ Backend: returns clarification_needed
→ Unity: displays options to user
→ User: selects or clarifies
→ Backend: processes refined query
```

---

## Example Queries

| Query | Type | Data Needed |
|-------|------|-------------|
| "Who did I see today?" | person | Today's captures, contacts |
| "What's John's phone number?" | person | Contacts only |
| "What happened yesterday afternoon?" | time | Yesterday's hourly summaries (12-18) |
| "Show me photos from the hackathon" | event | Captures with "hackathon" theme |
| "How have I been feeling this week?" | general | Daily summaries for past 7 days |
| "What does Sarah look like?" | person + face | Contact face image |

---

## Legacy Support

The endpoint also supports the legacy `fetch_daily_memories` request type:

```json
{
  "type": "fetch_daily_memories",
  "date": "2026-01-24"
}
```

This returns the raw daily data without Gemini processing, for backwards compatibility.
