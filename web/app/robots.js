export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://poultry-feed-calculator.vercel.app/sitemap.xml',
  };
}