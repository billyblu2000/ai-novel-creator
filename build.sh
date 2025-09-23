#!/bin/bash

echo "🚀 Building AI Novel Creator..."

# Install and build frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🔨 Building frontend..."
npm run build

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../backend
npm install

echo "🔨 Building backend..."
npm run build

echo "🗄️ Setting up database..."
npx prisma generate

echo "✅ Build completed successfully!"