# Production Deployment Guide

## 🚀 Quick Start

This repository contains a production-ready Poultry Feed Calculator with both web and mobile applications.

### Web Application (Ready for Production)

The web application is fully prepared for production deployment.

#### Prerequisites
- Node.js 18+ 
- npm or yarn

#### Quick Deploy

```bash
# Clone the repository
git clone <your-repo-url>
cd chicken-feed-mgt

# Run the deployment script
./deploy-web.sh
```

#### Manual Deployment

```bash
# Navigate to web directory
cd web

# Install dependencies
npm ci

# Create production environment file
cp .env.example .env.production
# Edit .env.production with your production values

# Build for production
NODE_ENV=production npm run build

# Start production server (for VPS deployment)
npm run start
```

## 🌐 Deployment Platforms

### Vercel (Recommended)

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Set root directory to `web`
   - Build command: `npm run build`
   - Output directory: `.next`

2. **Environment Variables**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_APP_NAME=Poultry Feed Calculator
   NEXT_PUBLIC_APP_VERSION=1.0.0
   
   # Firebase Configuration (REQUIRED for global settings)
   NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

### Netlify

1. **Build Settings**
   - Build command: `cd web && npm run build`
   - Publish directory: `web/.next`
   - Node version: 18

2. **Deploy**
   ```bash
   npx netlify deploy --prod --dir=web/.next
   ```

### Docker Deployment

```dockerfile
# Use the deployment-ready Dockerfile in web/
cd web
docker build -t poultry-feed-calculator .
docker run -p 3000:3000 poultry-feed-calculator
```

### VPS/Server Deployment

```bash
# On your server
git clone <your-repo-url>
cd chicken-feed-mgt
./deploy-web.sh

# Set up process manager (PM2)
npm install -g pm2
cd web
pm2 start npm --name "poultry-feed-calc" -- start
pm2 save
pm2 startup
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# .env.production
NODE_ENV=production
NEXT_PUBLIC_APP_NAME="Poultry Feed Calculator"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# Firebase Configuration (REQUIRED for global settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Optional: Analytics and monitoring
NEXT_PUBLIC_GA_ID=your-google-analytics-id
SENTRY_DSN=your-sentry-dsn
```

### Security Configuration

The application includes production-ready security headers:
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- Referrer-Policy
- Permissions-Policy

## 📱 Mobile Application (Development Ready)

The mobile application is built with Expo and requires additional setup for production.

### Development
```bash
cd mobile
npm install
npx expo start
```

### Production Build (Future)
```bash
# Install EAS CLI
npm install -g @expo/cli

# Configure EAS
eas build:configure

# Build for production
eas build --platform all
```

## 🔒 Security Checklist

- ✅ All dependencies updated to latest secure versions
- ✅ Environment variables properly configured
- ✅ Production build removes console logs
- ✅ Security headers implemented
- ✅ HTTPS enforced
- ✅ No sensitive data in repository
- ✅ .gitignore properly configured

## 📊 Performance Optimizations

- ✅ Next.js production optimizations enabled
- ✅ Image optimization configured
- ✅ Static asset caching
- ✅ Bundle size optimization
- ✅ Code splitting
- ✅ Compression enabled

## 🐛 Monitoring and Debugging

### Error Tracking
- Production errors logged to localStorage
- Consider integrating Sentry for advanced error tracking

### Performance Monitoring
- Built-in Next.js analytics
- Web Vitals tracking
- Consider integrating Google Analytics

### Health Checks
```bash
# Check if application is running
curl http://localhost:3000/api/health
```

## 🚨 Troubleshooting

### Build Failures
1. Check Node.js version (requires 18+)
2. Clear cache: `rm -rf .next node_modules && npm install`
3. Check environment variables

### Runtime Errors
1. Check browser console for client-side errors
2. Check server logs for SSR errors
3. Verify all environment variables are set

### Performance Issues
1. Run bundle analyzer: `npm run analyze`
2. Check Core Web Vitals
3. Optimize images and assets

## 📞 Support

For deployment issues:
1. Check the logs for specific error messages
2. Verify all prerequisites are met
3. Test locally with production build first
4. Create an issue in the GitHub repository

## 🎯 Production Features

### Web Application
- ✅ Responsive design for all devices
- ✅ Offline-capable with service worker
- ✅ PWA features
- ✅ SEO optimized
- ✅ Accessibility compliant
- ✅ Multi-language ready
- ✅ Print-friendly reports
- ✅ Data export capabilities

### Core Functionality
- ✅ Feed calculation algorithms
- ✅ Nigerian feed brand database
- ✅ Cost optimization
- ✅ Nutritional analysis
- ✅ Breed-specific recommendations
- ✅ Knowledge base and tips
- ✅ Emergency guidance
- ✅ Seasonal advice

---

**Ready for production deployment! 🎉**

*The web application is fully tested, optimized, and ready to serve Nigerian and African poultry farmers.*