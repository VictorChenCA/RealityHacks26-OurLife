# 🏥 Enhance Senior Care - Caregiver Frontend

This is the web-based caregiver dashboard for the **Enhance Senior Care** system. It acts as the command center for managing Ray-Ban Meta AI glasses, viewing patient memories, and setting proactive care reminders.

## 🌟 Ray-Ban Integration Features

### 📅 Ray-Ban Scheduler
- **Live Stream Scheduling**: Caregivers can schedule "Live Windows" where the glasses automatically start streaming for remote check-ins.
- **Proactive Interactions**: Schedule the glasses to deliver specific TTS reminders (e.g., "Don't forget your keys") or trigger proactive memory captures.
- **Enabled/Disabled Toggles**: Easily manage active schedules for the wearer.

### 👤 People Manager (AI-Powered)
- **Face Recognition Sync**: Displays people identified by the Ray-Ban glasses during the day.
- **Relationship Mapping**: Assign names and relationships (e.g., "Son", "Doctor") to faces captured by the glasses to improve the AI's contextual awareness.
- **Metadata Viewer**: See the last time the wearer interacted with a specific person.

### 🧠 Memories & Visual Log
- **Activity Feed**: View the "Weekly Highlights" – a curated gallery of photos captured by the Ray-Bans.
- **Contextual Search**: Interface for viewing the results of the Gemini-powered query pipeline.

---

## 🛠️ Technology Stack

- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Lucide Icons
- **Backend Integration**: REST API connection to the Memory Backend.

---

## 🚀 Getting Started

### Installation
```bash
# Navigate to the app directory
cd "Enhance Senior Care App"

# Install dependencies
npm install
```

### Development
```bash
# Run the development server
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 📱 Architecture

The app is designed with a **Mobile-First** approach, optimized for caregivers to use on the go (iPhone/Android browsers).

- `src/components/RayBanScheduler.tsx`: Core component for managing glasses interaction schedules.
- `src/components/PeopleManager.tsx`: Interface for managing faces and identities captured by the glasses.
- `src/components/Memories.tsx`: The visual gallery of events and AI summaries.

---

## 🔗 Connection to System
This frontend consumes data from the **Memory Backend** which processes the raw stream/photos from the **Ray-Ban iOS App**. It provides the human-in-the-loop interface for senior care.