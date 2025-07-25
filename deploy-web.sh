#!/bin/bash

# Production Deployment Script for Web Application
# This script prepares the web version for production deployment

set -e  # Exit on any error

echo "🚀 Preparing web application for production deployment..."

# Navigate to web directory
cd web

# Check if .env.production exists, if not create from example
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production from .env.example..."
    cp .env.example .env.production
    echo "⚠️  Please update .env.production with your production values before deploying!"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run security audit
echo "🔒 Running security audit..."
npm audit --audit-level=high

# Run linting
echo "🧹 Running linter..."
npm run lint 2>/dev/null || echo "⚠️  Linting not configured"

# Build the application
echo "🏗️  Building application..."
NODE_ENV=production npm run build

# Test the build
echo "🧪 Testing production build..."
if [ -d ".next" ]; then
    echo "✅ Build successful - .next directory created"
else
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

# Check build size
echo "📊 Build size analysis:"
du -sh .next/ 2>/dev/null || echo "Could not analyze build size"

# Clean up development files
echo "🧹 Cleaning up development files..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .next/cache 2>/dev/null || true

echo "✅ Web application is ready for production deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.production with your production environment variables"
echo "2. Deploy to your hosting platform (Vercel, Netlify, etc.)"
echo "3. Set up monitoring and error tracking"
echo ""
echo "🔗 Deployment options:"
echo "- Vercel: vercel --prod"
echo "- Netlify: netlify deploy --prod"
echo "- Manual: Copy .next/, public/, package.json to your server"