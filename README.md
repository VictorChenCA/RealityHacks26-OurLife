# 🧠 OurLife: A Second Brain for Those Who Need It Most

### *Helping people with memory loss live independently, with dignity, and stay connected to their loved ones.*

**RealityHack 2026 Submission**

---

## 💭 Why Meta Glasses + Meta Quest?

We started with a simple question: **What is memory, and how can technology enhance it?**

**Ray-Ban Meta glasses** are like a second pair of eyes and ears—a friend who's always with you, experiencing life from your perspective. They capture what you see and hear throughout the day, turning fleeting moments into something that can be recalled later. For memory, this is transformative: the glasses become a living record of your day, ready to remind you of what just happened.

**Meta Quest** offers something different but equally powerful: the ability to *relive* experiences in a way that feels close to reality. That deep sense of immersion isn't just entertaining—it helps the brain consolidate memories more effectively. Reviewing the day's highlights in VR isn't passive watching; it's active re-experiencing.

Together, these devices form a complete memory loop: **capture → recall → reinforce**.

From there, we asked: *Who would benefit most from enhanced memory?*

The answer led us to people living with dementia and Alzheimer's—and the caregivers who love them.

---

## 😔 The Problem We're Solving

For someone with dementia, every day can feel like walking through fog:
*   **"What was I just doing?"** — Forgetting intentions within minutes leads to unfinished tasks and frustration.
*   **"Who is this person talking to me?"** — Not recognizing a family member causes deep shame and social withdrawal.
*   **"Did I take my medication?"** — Constant uncertainty creates anxiety and repetitive checking.
*   **"How do I get home?"** — Wandering away from safe areas puts lives at risk and exhausts caregivers.

For caregivers, the burden is immense: constant supervision, sleepless nights, and the emotional weight of watching a loved one struggle.

---

## 💡 Our Solution: OurLife

We built a "memory scaffold" — a system that works quietly in the background to:
1.  **Capture & Encode**: Automatically turn the day's moments into simple, meaningful "memory cards."
2.  **Recall & Guide**: When the user is confused, provide gentle, step-by-step help to get back on track.
3.  **Protect & Escalate**: Detect risky situations (like leaving the house unexpectedly) and alert caregivers with context—not just an alarm.

---

## 🏗️ How It All Connects

<img width="4653" height="3548" alt="RealityHacks 2026 Technical Stack Diagram" src="https://github.com/user-attachments/assets/5c5c1f1f-0fa8-4331-a01e-6e423ea54eab" />

---

## 🕶️ 1. Ray-Ban Meta Glasses (Patient Device)

The Ray-Ban Meta smart glasses are the always-present companion that sees and hears what the wearer experiences. They blend into everyday life like regular sunglasses while quietly providing support.

### Technical Implementation
*   **Meta Wearables SDK (DAT)**: Uses `MWDATCamera` for H.264 video streaming and frame-by-frame capture from the head-mounted camera.
*   **Multi-Modal Query Pipeline**: When the user asks a question (via long-press), the system captures:
    - A **Head-POV Image** (what the wearer is looking at)
    - **Speech-to-Text** via Apple's `SFSpeechRecognizer`
    - **GPS Coordinates** via CoreLocation
*   **WebSocket Transport**: Sends JSON payloads to the backend:
    ```json
    {
      "text": "Who is the person in front of me?",
      "imageURL": "https://storage.googleapis.com/query_123.jpg",
      "latitude": 42.3601,
      "longitude": -71.0942
    }
    ```
*   **Voice UI (VUI)**: The response is read aloud via `AVSpeechSynthesizer` directly to the glasses' open-ear speakers. The caregiver companion app shows a live transcription HUD.

### Key Features
- 🕒 **"What did I just do?"** — 10-minute rewind with AI-summarized recap
- 👥 **"Who is this?"** — Gaze-triggered face recognition with discreet audio whisper
- 📍 **"Where are my keys?"** — Last-seen object tracking with photo + timestamp
- 🛡️ **Safety Watch** — Geofence monitoring with gentle escalation

---

## ☁️ 2. Backend (Google Cloud Platform)

The "Cloud Brain" that understands, remembers, and protects.

### Technical Stack
*   **Gemini 2.0 Flash**: Multi-modal reasoning over images + text + location context
*   **Cloud Firestore**: Persistent memory storage (people, places, events)
*   **Cloud Storage (GCS)**: Image upload pipeline for query snapshots
*   **Cloud TTS API**: High-quality voice synthesis for audio responses
*   **Custom RAG Pipeline**: Retrieval-Augmented Generation for personalized memory search

### API Endpoints
- `POST /upload/{capture_id}` — Upload images from the glasses
- `WSS /ws/query/{user_id}` — Real-time query/response WebSocket
- `GET /memories/{user_id}` — Retrieve stored memories for the caregiver dashboard

---

## 🥽 3. Meta Quest 3 (Memory Palace)

At night, the Quest headset transforms captured moments into immersive cognitive therapy.

### Why VR?
Research shows that immersive environments help the brain consolidate memories more effectively. Instead of passively watching a highlight reel, the wearer is *inside* their memories—the deep sense of presence strengthens recall.

### Technical Implementation
*   **Unity 2022.3**: Built with Meta XR SDK for Quest 3
*   **ElevenLabs API**: Natural voice narration for the memory journal
*   **Daily Highlights Sync**: Curated moments from Ray-Ban capture are packaged into a VR session
*   **Interactive Q&A**: Gamified prompts ("Who visited today?") with progressive visual hints

### Key Features
- 🎬 **Immersive Replay**: Relive highlights in panoramic/theater mode
- 🧠 **Cognitive Reinforcement**: Spaced retrieval questions strengthen long-term memory
- 👨‍👩‍👧 **Shared Viewing**: Remote family can join the virtual space for social connection
- ✅ **Positive Reinforcement**: "You remembered!" feedback loop

---

## 📱 4. Caregiver App (Next.js Dashboard)

Caregivers aren't just watching passively—they're configuring the system to work best for their loved one.

### Features
*   **3D Home Map**: Mark specific spots with custom reminders (e.g., "Kitchen: Turn off the stove")
*   **People Profiles**: Upload photos and details for the "Who's Who" face database
*   **Scheduled Reminders**: Time-based nudges synced to the glasses
*   **Location Boundaries**: Define safe zones with exit alerts
*   **Memory Timeline**: Review captured moments and AI interactions

### 📸 Caregiver App Screens
<img width="5016" height="4802" alt="Frame 34 (1)" src="https://github.com/user-attachments/assets/04ac8a44-5b20-4d24-ae53-1fdf9f8d3feb" />

---

## 🎯 Our Goal

We want to give people with memory loss more good days—days where they feel capable, respected, and connected. And we want to give caregivers peace of mind, knowing that their loved one has a gentle, always-present support system by their side.

---

*RealityHack 2026 — Team OurLife*
