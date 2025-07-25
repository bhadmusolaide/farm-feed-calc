# Production Deployment Guide

This guide covers deploying the Feed Calculator application to production.

## Pre-deployment Checklist

### 1. Environment Setup
- [ ] Copy `.env.example` to `.env.production`
- [ ] Set production environment variables
- [ ] Remove or secure any development-only features
- [ ] Test the application locally with production build

### 2. Security Review
- [ ] Verify no sensitive data in code
- [ ] Check authentication is properly configured
- [ ] Review CORS settings if using APIs
- [ ] Ensure HTTPS is enforced

### 3. Performance Optimization
- [ ] Run `npm run build` to check for build errors
- [ ] Test application performance
- [ ] Verify image optimization is working
- [ ] Check bundle size with `npm run analyze`

## Deployment Platforms

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd web
   vercel
   ```

3. **Environment Variables**
   Set in Vercel dashboard:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_APP_NAME=Feed Calculator by Omzo Farmz`
   - Any other required variables from `.env.example`

### Netlify

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18.x

2. **Environment Variables**
   Set in Netlify dashboard from `.env.example`

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY . .
   COPY --from=deps /app/node_modules ./node_modules
   RUN npm run build
   
   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nextjs -u 1001
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./package.json
   
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t feed-calculator .
   docker run -p 3000:3000 feed-calculator
   ```

### VPS/Server Deployment

1. **Prerequisites**
   - Node.js 18+
   - PM2 for process management
   - Nginx for reverse proxy
   - SSL certificate

2. **Setup**
   ```bash
   # Install dependencies
   npm ci --production
   
   # Build application
   npm run build
   
   # Install PM2
   npm install -g pm2
   
   # Start with PM2
   pm2 start npm --name "feed-calculator" -- start
   pm2 save
   pm2 startup
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Post-deployment

### 1. Testing
- [ ] Test all major functionality
- [ ] Verify mobile responsiveness
- [ ] Check performance with tools like Lighthouse
- [ ] Test authentication (settings page)

### 2. Monitoring
- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure analytics if needed
- [ ] Monitor performance metrics
- [ ] Set up uptime monitoring

### 3. Backup
- [ ] Backup user data (localStorage)
- [ ] Document recovery procedures
- [ ] Set up automated backups if using database

## Environment Variables Reference

### Required
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_NAME=Feed Calculator by Omzo Farmz`

### Optional
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `SENTRY_DSN` - Error tracking
- `NEXT_PUBLIC_ADMIN_PASSWORD` - Custom admin password for settings authentication

### Environment Variables Setup

Create the following environment files:

**`.env.production`** (for production builds):
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME="Your Feed Calculator"
# Authentication - Set a secure admin password
NEXT_PUBLIC_ADMIN_PASSWORD=your-very-secure-admin-password
# Add other production-specific variables
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+ required)
   - Clear cache: `npm run clean`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

2. **Runtime Errors**
   - Check environment variables
   - Verify all dependencies are installed
   - Check browser console for client-side errors

3. **Performance Issues**
   - Enable compression in reverse proxy
   - Optimize images
   - Check bundle size with analyzer

## Security Considerations

- **Environment Variables**: Never commit sensitive data to version control
- **HTTPS**: Always use HTTPS in production
- **Headers**: Security headers are configured in `next.config.js`
- **CSP**: Content Security Policy is implemented
- **Authentication**: Enhanced settings page security with:
  - Environment-based admin password (set `NEXT_PUBLIC_ADMIN_PASSWORD`)
  - Rate limiting: Max 5 login attempts per 15 minutes
  - Session timeout: 2-hour automatic logout
  - Session extension on user activity
  - Secure password storage and validation
- Keep dependencies updated
- Regular security audits: `npm audit`
- Monitor for vulnerabilities
- Use strong admin passwords
- Consider implementing rate limiting

## Support

For deployment issues:
1. Check this guide first
2. Review application logs
3. Test locally with production build
4. Contact development team if needed