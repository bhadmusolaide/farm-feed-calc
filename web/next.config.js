/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: process.env.NODE_ENV === 'production',
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Security and performance headers
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Disable caching in development
          ...(isDev ? [{
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          }] : []),
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|svg|css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev ? 'no-cache, no-store, must-revalidate, max-age=0' : 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Output configuration for static export if needed
  // Disabled for now due to context issues with error pages
  // output: 'export',
  // trailingSlash: true,
  
  // Experimental features
  experimental: {
    // Add any valid experimental features here if needed
  },
  
  // Skip static generation for error pages
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

module.exports = nextConfig;