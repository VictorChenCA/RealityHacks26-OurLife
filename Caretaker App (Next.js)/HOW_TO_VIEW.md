# How to View the App

## 🎨 Visual Preview Options

### Option 1: Run Locally (Best for Testing)

1. **Install dependencies** (if not already done):
   ```bash
   cd "Enhance Senior Care App"
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   - The server will start on `http://localhost:3000`
   - Your browser should open automatically
   - If not, manually go to: `http://localhost:3000`

4. **What you'll see**:
   - Mobile-optimized view (402px × 874px)
   - Three main screens: Home, Reminders, Memories
   - All the new features integrated:
     - Ray-Ban Scheduler
     - Chat Reminders
     - Location Reminders
     - People Manager

---

### Option 2: View Original Figma Design

The original design mockup is available at:
**https://www.figma.com/design/EgiWFMfQFDRSJwa3GbKfdM/Enhance-Senior-Care-App**

This shows the original design before our backend integration.

---

### Option 3: Build for Production

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Preview the build**:
   ```bash
   npm run preview
   ```

3. **Deploy** (optional):
   - Deploy the `build/` folder to:
     - Vercel
     - Netlify
     - GitHub Pages
     - Any static hosting

---

## 📱 App Structure

### Home Screen
- **Today's Tasks** - Calendar view with scheduled tasks
- **Weekly Highlights** - Photo memories
- **Ray-Ban Scheduler** ⭐ NEW - Schedule when glasses go live
- **Chat Reminders** ⭐ NEW - Natural language reminder setting
- **Coming Up** - Calendar with future tasks

### Reminders Screen
- **Location Map** - Visual map with location pins
- **Timely Hints** - Time-based reminders
- **Location Reminders** ⭐ NEW - Reminders that trigger at locations
- **Weekly Schedule** - Recurring reminders

### Memories Screen
- **Recent Memories** - Photo gallery
- **People Manager** ⭐ NEW - Manage contacts from backend
- **Family Section** - Family member profiles
- **Friends Section** - Friend profiles

---

## 🎯 Key Visual Features

### Design Style:
- **Color Scheme**: Light blue background (#f7fbff)
- **Card Style**: White cards with shadows
- **Mobile-First**: Optimized for phone screens (402px width)
- **Modern UI**: Using Radix UI components + Tailwind CSS

### New Components Added:
1. **Ray-Ban Scheduler** - Blue-themed scheduling interface
2. **Chat Reminders** - Chat bubble interface
3. **Location Reminders** - Green pin-themed location management
4. **People Manager** - Purple-themed contact management

---

## 🚀 Quick Start

```bash
# Navigate to app directory
cd "/Users/sheilawang/Desktop/RealityHacks26/Enhance Senior Care App"

# Install (first time only)
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

The app will hot-reload when you make changes!

---

## 📸 Screenshots Description

### Home Screen:
- Top: "Home" title with Settings icon
- Today section: Task cards with times and locations
- Weekly Highlights: Horizontal scroll of memory photos
- **NEW**: Ray-Ban Scheduler card with clock icon
- **NEW**: Chat Reminders interface with message bubbles
- Coming Up: Calendar widget + task list

### Reminders Screen:
- Map background with location pins
- Click pins to see location reminders
- Timely Hints: Time-based reminder list
- **NEW**: Location Reminders section with map pin icon
- Weekly: Recurring reminders by day

### Memories Screen:
- Recent Memories: Photo carousel
- **NEW**: People Manager with user icon
- Family: Grid of family member photos
- Friends: Grid of friend photos

---

## 💡 Tips

1. **Browser DevTools**: 
   - Press F12 to open developer tools
   - Use device emulation (mobile view)
   - Set to iPhone size for best preview

2. **Responsive Testing**:
   - Resize browser window
   - Test on actual phone (if deployed)
   - Check different screen sizes

3. **Interactive Features**:
   - Click buttons to see modals
   - Try the chat interface
   - Add/edit/delete items
   - Navigate between screens

---

## 🔗 Links

- **Figma Design**: https://www.figma.com/design/EgiWFMfQFDRSJwa3GbKfdM/Enhance-Senior-Care-App
- **Local Dev**: http://localhost:3000 (after `npm run dev`)
- **Backend API**: https://memory-backend-328251955578.us-east1.run.app

Enjoy exploring the app! 🎉
