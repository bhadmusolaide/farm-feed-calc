export default function sitemap() {
  return [
    {
      url: 'https://poultry-feed-calculator.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://poultry-feed-calculator.vercel.app/calculator',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://poultry-feed-calculator.vercel.app/poultry-products',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://poultry-feed-calculator.vercel.app/breed-comparison',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://poultry-feed-calculator.vercel.app/disclaimer',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}