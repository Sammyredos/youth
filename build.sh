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

# Seed default settings if needed
echo "🌱 Seeding default settings..."
npx tsx scripts/seed-settings.ts || echo "⚠️ Settings seeding failed or already exists"

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"
