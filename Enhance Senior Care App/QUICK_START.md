# 🚀 Quick Start Guide

## If you see "command not found"

You need to install **Node.js** first. Here's the fastest way:

---

## ⚡ Fastest Installation (Mac)

### Option 1: Using Homebrew (Recommended)

```bash
# Install Homebrew (if you don't have it)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify it worked
node --version
npm --version
```

### Option 2: Direct Download (Easiest)

1. **Go to**: https://nodejs.org/
2. **Click**: "Download Node.js (LTS)" - the green button
3. **Run the installer** (just click through)
4. **Restart your terminal**
5. **Try again**: `node --version`

---

## 📦 Then Install Project Dependencies

Once Node.js is installed:

```bash
# Go to the app folder
cd "/Users/sheilawang/Desktop/RealityHacks26/Enhance Senior Care App"

# Run the setup script
./setup.sh

# OR manually:
npm install
```

---

## 🎯 Run the App

```bash
# Start the server
npm run dev

# Open browser to:
# http://localhost:3000
```

---

## 🔍 Check What's Installed

Run these to see what you have:

```bash
# Check Node.js
node --version
# Should show: v18.x.x or v20.x.x

# Check npm
npm --version  
# Should show: 9.x.x or 10.x.x

# If either shows "command not found", install Node.js first
```

---

## 📱 What You'll See

Once running, the app shows:
- **Home Screen**: Tasks, Ray-Ban Scheduler, Chat Reminders
- **Reminders Screen**: Location map, time-based reminders
- **Memories Screen**: People profiles, photo memories

The app is mobile-optimized (looks like a phone app in browser).

---

## ❓ Still Having Issues?

**Error: "command not found: node"**
→ Install Node.js from https://nodejs.org/

**Error: "command not found: npm"**  
→ npm comes with Node.js, reinstall Node.js

**Error: "Permission denied"**
→ Don't use `sudo`. Fix npm permissions (see SETUP_GUIDE.md)

**Error: "Port 3000 in use"**
→ Use different port: `npm run dev -- --port 3001`

---

## 🎨 Alternative: View Design Only

If you can't install Node.js right now, view the original design:
**https://www.figma.com/design/EgiWFMfQFDRSJwa3GbKfdM/Enhance-Senior-Care-App**

This shows what the app looks like (before backend integration).

---

Need help? Let me know what error message you're seeing!
