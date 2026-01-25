#!/bin/bash

# Setup script for Enhance Senior Care App
# This will check for Node.js/npm and guide you through installation

echo "🔍 Checking for Node.js and npm..."

# Check for Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js is installed: $NODE_VERSION"
else
    echo "❌ Node.js is NOT installed"
    echo ""
    echo "Please install Node.js first:"
    echo "1. Visit: https://nodejs.org/"
    echo "2. Download the LTS version"
    echo "3. Run the installer"
    echo "4. Restart your terminal"
    echo ""
    echo "Or use Homebrew:"
    echo "  brew install node"
    exit 1
fi

# Check for npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm is installed: $NPM_VERSION"
else
    echo "❌ npm is NOT installed"
    echo "npm should come with Node.js. Please reinstall Node.js."
    exit 1
fi

echo ""
echo "📦 Installing project dependencies..."
echo "This may take a few minutes..."
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Install dependencies
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation complete!"
    echo ""
    echo "🚀 To start the development server, run:"
    echo "   npm run dev"
    echo ""
    echo "Then open: http://localhost:3000"
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi
