import './globals.css';
import { Inter, Poppins } from 'next/font/google';
import { Metadata } from 'next';
import { ThemeProvider } from '../contexts/ThemeContext';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ToastProvider } from '../components/Toast';
import FirebaseProvider from '../components/FirebaseProvider';
import SettingsInitializer from '../components/SettingsInitializer';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f59e0b' },
    { media: '(prefers-color-scheme: dark)', color: '#d97706' },
  ],
};

export const metadata = {
  title: 'Poultry Feed Calculator - Nigerian Farmers',
  description: 'Calculate optimal feed requirements for broilers and layers. Designed for Nigerian and African farmers with local feed brands and best practices.',
  keywords: 'poultry, feed calculator, broiler, layer, Nigeria, farming, chicken feed, agriculture',
  authors: [{ name: 'Alancash for Omzo Farmz' }],
  creator: 'Alancash',
  publisher: 'Omzo Farmz',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://poultry-feed-calculator.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Poultry Feed Calculator - Nigerian Farmers',
    description: 'Calculate optimal feed requirements for broilers and layers. Designed for Nigerian and African farmers.',
    url: 'https://poultry-feed-calculator.vercel.app',
    siteName: 'Poultry Feed Calculator by Omzo Farmz',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Poultry Feed Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Poultry Feed Calculator - Nigerian Farmers',
    description: 'Calculate optimal feed requirements for broilers and layers.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Feed Calculator" />
        <meta name="application-name" content="Feed Calculator" />
        <meta name="msapplication-TileColor" content="#f59e0b" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning={true}>
        <ErrorBoundary>
          <FirebaseProvider>
            <ThemeProvider>
              <ToastProvider>
                <SettingsInitializer />
                <OfflineIndicator />
                <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
                  {children}
                </div>
              </ToastProvider>
            </ThemeProvider>
          </FirebaseProvider>
        </ErrorBoundary>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
        
        {/* Online/Offline Detection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('online', function() {
                document.body.classList.remove('offline');
                document.body.classList.add('online');
              });
              
              window.addEventListener('offline', function() {
                document.body.classList.remove('online');
                document.body.classList.add('offline');
              });
              
              // Set initial state after hydration
              setTimeout(function() {
                if (navigator.onLine) {
                  document.body.classList.add('online');
                } else {
                  document.body.classList.add('offline');
                }
              }, 0);
            `,
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}