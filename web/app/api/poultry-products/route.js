import { NextResponse } from 'next/server';

const poultryProducts = {
  broilers: {
    id: 'broilers',
    name: 'Live Broilers',
    title: 'Premium Quality Live Broilers',
    description: 'Our broiler chickens are raised with the same precision feeding principles that power our calculator. Healthy, well-fed birds that meet your expectations for live poultry.',
    features: [
      'Raised with optimal nutrition calculated by our feed system',
      'Free-range with natural feeding practices',
      'Antibiotic-free with natural health management',
      'Consistent weight and quality',
      'Ready for processing at 6-8 weeks',
      'Perfect for customers who prefer live chickens'
    ],
    pricing: '₦8,000 - ₦9,000 per bird',
    availability: 'Weekly delivery in Ibadan and surrounding areas',
    image: '/broilers.jpg',
    featured: true,
    tag: 'FRESH'
  },
  dressed: {
    id: 'dressed',
    name: 'Dressed Chicken',
    title: 'Premium Quality Dressed Chicken',
    description: 'Our dressed chickens are professionally processed and frozen for retailers and consumers who prefer ready-to-cook poultry products.',
    features: [
      'Professionally cleaned and processed',
      'Individually quick frozen (IQF) for freshness',
      'Consistent weight and quality',
      'Perfect for frozen food retailers',
      'Ready-to-cook for consumers',
      'Extended shelf life'
    ],
    pricing: '₦4,000 - ₦4,500 per kg',
    availability: 'Available in 10kg, 20kg, 30kg, and 40kg packages',
    image: '/dressed.jpg',
    featured: true,
    tag: 'MOST POPULAR'
  },
  necks: {
    id: 'necks',
    name: 'Chicken Necks',
    title: 'Premium Chicken Necks',
    description: 'High-quality chicken necks perfect for grilling, roasting, or adding flavor to your favorite dishes. Sourced from our healthy broilers.',
    features: [
      'Cleaned and properly prepared',
      'Rich in collagen and flavor',
      'Perfect for grilling and roasting',
      'Great for family meals',
      'Frozen for freshness'
    ],
    pricing: '₦1,600 per kg',
    availability: 'Available in 2kg and 5kg packages',
    image: '/necks.jpg',
    featured: false
  },
  legs: {
    id: 'legs',
    name: 'Chicken Legs',
    title: 'Tender Chicken Legs',
    description: 'Juicy, tender chicken legs from our well-nourished broilers. Perfect for grilling, frying, or baking.',
    features: [
      'Meaty and tender',
      'Properly cleaned and prepared',
      'Great for family meals',
      'High in protein',
      'Frozen for maximum freshness'
    ],
    pricing: '₦1,600 per kg',
    availability: 'Available in 2kg and 5kg packages',
    image: '/legs.jpg',
    featured: false
  },
  dogFood: {
    id: 'dogFood',
    name: 'Dog Food (Heads & Liver)',
    title: 'Nutritious Dog Food',
    description: 'High-quality dog food made from chicken heads and liver. A nutritious, protein-rich option for your pets.',
    features: [
      'High protein content for strong dogs',
      'Properly cooked and prepared',
      'No artificial additives',
      'Rich in essential nutrients',
      'Economical pet food option'
    ],
    pricing: '₦1,600 per kg',
    availability: 'Available in 2kg and 5kg packages',
    image: '/dogfood.webp',
    featured: false
  },
  gizzard: {
    id: 'gizzard',
    name: 'Chicken Gizzard',
    title: 'Tender Chicken Gizzards',
    description: 'Premium quality chicken gizzards, cleaned and prepared for cooking. Perfect for grilling, frying, or adding to stews and soups.',
    features: [
      'Thoroughly cleaned and prepared',
      'Rich in protein and iron',
      'Perfect for traditional dishes',
      'Great for grilling and frying',
      'Frozen for maximum freshness'
    ],
    pricing: '₦2,000 per kg',
    availability: 'Available in 1kg and 2kg packages',
    image: '/gizzard.webp',
    featured: false
  }
};

export async function GET() {
  return NextResponse.json(poultryProducts);
}