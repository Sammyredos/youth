#!/bin/bash

# Build script for Render.com deployment
echo "🚀 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Note: Settings seeding will be done after deployment via separate script

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"
