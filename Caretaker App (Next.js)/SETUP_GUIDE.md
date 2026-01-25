# Setup Guide - Install Required Packages

## 📦 Prerequisites

You need to install **Node.js** and **npm** first before running the app.

---

## Step 1: Install Node.js & npm

### Option A: Using Homebrew (Recommended for Mac)

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (includes npm)
brew install node

# Verify installation
node --version
npm --version
```

### Option B: Download from Official Website

1. Go to: https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer
4. Follow the installation wizard
5. Restart your terminal

### Option C: Using nvm (Node Version Manager)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then:
nvm install --lts
nvm use --lts

# Verify
node --version
npm --version
```

---

## Step 2: Install Project Dependencies

Once Node.js and npm are installed:

```bash
# Navigate to the app directory
cd "/Users/sheilawang/Desktop/RealityHacks26/Enhance Senior Care App"

# Install all dependencies (this will take a few minutes)
npm install

# Wait for it to finish - you'll see a lot of packages being installed
```

This will install:
- React & React DOM
- Vite (build tool)
- All Radix UI components
- Tailwind CSS
- And 50+ other dependencies

---

## Step 3: Run the Development Server

```bash
# Start the dev server
npm run dev

# You should see:
# ➜  Local:   http://localhost:3000/
# ➜  Network: use --host to expose
```

Then open your browser to: **http://localhost:3000**

---

## 🐛 Troubleshooting

### "command not found: node" or "command not found: npm"

**Solution**: Node.js is not installed or not in your PATH.

1. Install Node.js using one of the methods above
2. Restart your terminal
3. Try again

### "npm: command not found"

**Solution**: npm comes with Node.js, so if npm isn't found, Node.js isn't installed correctly.

1. Reinstall Node.js from https://nodejs.org/
2. Make sure to check "Add to PATH" during installation
3. Restart terminal

### "Permission denied" errors

**Solution**: Don't use `sudo` with npm. Instead:

```bash
# Fix npm permissions (one time setup)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### Port 3000 already in use

**Solution**: Use a different port:

```bash
# Edit vite.config.ts and change port, or:
npm run dev -- --port 3001
```

---

## ✅ Quick Check

Run these commands to verify everything is set up:

```bash
# Check Node.js version (should show v18+ or v20+)
node --version

# Check npm version (should show 9+ or 10+)
npm --version

# Check if you're in the right directory
cd "/Users/sheilawang/Desktop/RealityHacks26/Enhance Senior Care App"
pwd

# Check if package.json exists
ls package.json
```

---

## 🚀 After Installation

Once `npm install` completes successfully:

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Open browser**:
   - Go to: http://localhost:3000
   - The app should load automatically

3. **What you'll see**:
   - Mobile-optimized interface (402px × 874px)
   - Three main screens (Home, Reminders, Memories)
   - All new features integrated

---

## 📝 Alternative: Use Online Preview

If you can't install Node.js right now, you can:

1. **View the Figma design**: 
   https://www.figma.com/design/EgiWFMfQFDRSJwa3GbKfdM/Enhance-Senior-Care-App

2. **Use an online React playground**:
   - CodeSandbox: https://codesandbox.io/
   - StackBlitz: https://stackblitz.com/
   - Upload the project files there

---

## 💡 Need Help?

If you're still having issues:

1. **Check Node.js installation**:
   ```bash
   which node
   which npm
   ```

2. **Check npm configuration**:
   ```bash
   npm config list
   ```

3. **Clear npm cache** (if install fails):
   ```bash
   npm cache clean --force
   npm install
   ```

Let me know what error you're seeing and I can help troubleshoot!
