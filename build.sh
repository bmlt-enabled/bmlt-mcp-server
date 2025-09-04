#!/bin/bash

# BMLT MCP Server Build Script
set -e

echo "🏗️  Building BMLT MCP Server..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run TypeScript compilation
echo "🔨 Compiling TypeScript..."
npx tsc

# Make the output executable
echo "🔧 Making executable..."
chmod +x dist/index.js

# Check if build was successful
if [ -f "dist/index.js" ]; then
    echo "✅ Build successful!"
    echo "📁 Output: dist/index.js"
    echo ""
    echo "🚀 To run the server:"
    echo "   BMLT_ROOT_SERVER_URL=https://your-bmlt-server.org/main_server/ node dist/index.js"
    echo ""
    echo "📖 Or install globally:"
    echo "   npm install -g ."
    echo "   BMLT_ROOT_SERVER_URL=https://your-bmlt-server.org/main_server/ bmlt-mcp-server"
else
    echo "❌ Build failed!"
    exit 1
fi
