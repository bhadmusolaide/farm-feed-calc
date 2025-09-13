'use client';

import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Package, Truck, ShieldCheck, Scale, Users, Leaf, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../../components/Header';
import OfflineIndicator from '../../components/OfflineIndicator';
import PoultryContactForm from '../../components/PoultryContactForm';

export default function PoultryProductsPage() {
  const [activeProduct, setActiveProduct] = useState('broilers');
  const [isClient, setIsClient] = useState(false);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [galleryOffset, setGalleryOffset] = useState(0);
  const galleryRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    
    // Fetch products data from API
    fetch('/api/poultry-products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        // Fallback to hardcoded data if API fails
        const fallbackProducts = {
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
            pricing: '₦4,000 - ₦4,500 per bird',
            availability: 'Available in 10kg and 20kg boxes',
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
            pricing: '₦1,500 per kg',
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
        setProducts(fallbackProducts);
        setLoading(false);
      });
  }, []);

  // Auto-rotate gallery items
  useEffect(() => {
    const interval = setInterval(() => {
      setGalleryOffset(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const benefits = [
    {
      icon: Leaf,
      title: 'Natural Feeding',
      description: 'Our birds are fed using precise calculations from our proven feed system'
    },
    {
      icon: ShieldCheck,
      title: 'Quality Assured',
      description: 'Health-checked and raised with the highest standards'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick delivery within Ibadan and surrounding areas'
    },
    {
      icon: Scale,
      title: 'Consistent Weight',
      description: 'Properly fed birds with consistent, predictable weights'
    }
  ];

  const testimonials = [
    {
      name: 'Adebayo Johnson',
      role: 'Restaurant Owner',
      content: 'The quality of these broilers is exceptional. My customers love the taste and tenderness.',
      rating: 5
    },
    {
      name: 'Fatima Ahmed',
      role: 'Market Vendor',
      content: 'Reliable supplier with consistent quality. My customers keep asking for more.',
      rating: 5
    },
    {
      name: 'Emeka Okafor',
      role: 'Hotel Chef',
      content: 'Perfect for our hotel menu. The chicken necks and legs are always fresh and flavorful.',
      rating: 5
    }
  ];

  // Enhanced carousel state for testimonials
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Manual navigation for testimonials
  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Get all products for gallery (not just non-featured)
  const allProducts = Object.values(products);
  
  // Calculate visible products based on offset for carousel effect
  const visibleProducts = [...allProducts, ...allProducts, ...allProducts] // Repeat for seamless looping
    .slice(galleryOffset % allProducts.length, (galleryOffset % allProducts.length) + 5)
    .slice(0, 5); // Show 5 items at a time

  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Premium Poultry Products | Omzo Farmz</title>
        <meta name="description" content="Fresh, high-quality poultry products including broiler chickens, chicken necks, legs, and dog food from Omzo Farmz. Raised with precision feeding." />
        <meta name="keywords" content="poultry, broilers, chicken, necks, legs, dog food, farm products, Nigeria, Ibadan" />
        <link rel="canonical" href="https://poultry-feed-calculator.vercel.app/poultry-products" />
      </Head>
      <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 dark:from-neutral-950 dark:via-primary-950 dark:to-secondary-950"></div>
        <div className="absolute inset-0 farm-pattern opacity-30"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-400/30 to-tertiary-400/30 rounded-full blur-3xl animate-float pulse-rainbow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-secondary-400/30 to-accent-400/30 rounded-full blur-3xl animate-float pulse-rainbow" style={{animationDelay: '1s'}}></div>
      </div>
      
      <OfflineIndicator />
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16">
        <div className="container-app">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-8 shadow-xl animate-glow">
              <div className="text-white text-3xl">🐔</div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-bold gradient-text mb-6 leading-tight">
              Premium Broiler Chicken
              <span className="block text-primary-600 dark:text-primary-400"> and Poultry Products</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              From our farm to your table. High-quality poultry products raised with the same precision 
              feeding principles that power our trusted feed calculator.
            </p>
          </div>
        </div>
      </section>
      
      {/* Featured Product Section */}
      <section className="py-16 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Our most popular and premium poultry offerings
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.values(products)
              .filter(product => product.featured)
              .map((product, index) => (
                <div key={product.id} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className={`h-48 ${index % 2 === 0 ? 'bg-gradient-to-r from-primary-500 to-accent-500' : 'bg-gradient-to-r from-secondary-500 to-tertiary-500'} flex items-center justify-center`}>
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden">
                      {product.image ? (
                        <Image 
                          src={product.image} 
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-neutral-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center text-white text-4xl">
                          🐔
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{product.name}</h3>
                        <p className="text-primary-600 dark:text-primary-400 font-semibold">Premium Quality</p>
                      </div>
                      {product.tag && (
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${product.tag === 'MOST POPULAR' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'}`}>
                          {product.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{product.pricing}</span>
                      <button 
                        onClick={() => setActiveProduct(product.id)}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            
            {/* Special Offer */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-xl overflow-hidden text-white">
              <div className="p-6 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Special Offer</h3>
                  <p className="opacity-90 mb-4">
                    Buy 20kg of chicken and get one free chicken added to your order!
                  </p>
                </div>
                <div>
                  <button 
                    onClick={() => setActiveProduct('dressed')}
                    className="bg-white text-primary-600 hover:bg-neutral-100 font-semibold py-2 px-4 rounded-lg w-full transition-colors"
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-4">
              Why Choose Our Poultry?
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Raised with precision, delivered with care
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Products Section */}
      <section className="py-20">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
              Our Products
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300">
              Fresh, high-quality poultry products for your family and business
            </p>
          </div>
          
          {/* Product Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {Object.values(products).map((product) => (
              <button
                key={product.id}
                onClick={() => setActiveProduct(product.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeProduct === product.id
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                {product.name}
              </button>
            ))}
          </div>
          
          {/* Product Details */}
          <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto">
            <div className="md:flex">
              <div className="md:w-2/5 p-8 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
                {products[activeProduct]?.image ? (
                  <Image 
                    src={products[activeProduct].image} 
                    alt={products[activeProduct].name}
                    width={300}
                    height={300}
                    className="rounded-xl object-cover w-full h-64 md:h-80"
                  />
                ) : (
                  <div className="bg-neutral-200 border-2 border-dashed rounded-xl w-full h-64 md:h-80 flex items-center justify-center text-neutral-400">
                    Product Image
                  </div>
                )}
              </div>
              <div className="md:w-3/5 p-8">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
                  {products[activeProduct].name}
                </span>
                <h3 className="text-3xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                  {products[activeProduct].title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6 text-lg">
                  {products[activeProduct].description}
                </p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {products[activeProduct].features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5 mr-3">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        <span className="text-neutral-600 dark:text-neutral-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
                    <div className="text-sm text-primary-600 dark:text-primary-400 font-medium">Pricing</div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">{products[activeProduct].pricing}</div>
                  </div>
                  <div className="bg-accent-50 dark:bg-accent-900/20 rounded-xl p-4">
                    <div className="text-sm text-accent-600 dark:text-accent-400 font-medium">Availability</div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">{products[activeProduct].availability}</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <button 
                    className="btn-primary flex-1 sm:flex-none"
                    onClick={() => window.open('tel:+2348068530494', '_self')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call to Order
                  </button>
                  <button 
                    className="btn-secondary flex-1 sm:flex-none"
                    onClick={() => window.open('https://wa.me/234117135164', '_blank')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Gallery with Carousel - Now showing ALL products */}
      <section className="py-16 bg-white dark:bg-neutral-900">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-4">
              Our Complete Range
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Explore all our premium poultry products
            </p>
          </div>
          
          <div className="relative overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" 
                 style={{ transform: `translateX(-${(galleryOffset % allProducts.length) * (100 / 5)}%)` }}>
              {[...allProducts, ...allProducts, ...allProducts].map((product, index) => (
                <div 
                  key={`${product.id}-${index}`} 
                  className="flex-shrink-0 w-1/5 px-3"
                  onClick={() => setActiveProduct(product.id)}
                >
                  <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                    <div className="h-32 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 rounded-t-xl flex items-center justify-center">
                      {product.image ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                          <Image 
                            src={product.image} 
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="bg-neutral-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center text-neutral-400 group-hover:text-primary-500 transition-colors">
                          🐔
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-center group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400 text-sm text-center mt-1">
                        {product.pricing}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Gallery Navigation Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {allProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => setGalleryOffset(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === (galleryOffset % allProducts.length)
                    ? 'bg-primary-600'
                    : 'bg-neutral-300 dark:bg-neutral-600'
                }`}
                aria-label={`View gallery item ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Carousel */}
      <section className="py-20 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300">
              Trusted by restaurants, hotels, and families
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto relative">
            {/* Testimonial Card */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg text-center relative">
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-yellow-500 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
              </div>
              
              <blockquote className="text-xl text-neutral-700 dark:text-neutral-300 mb-6 italic">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
              
              {/* Navigation Arrows */}
              <button 
                onClick={prevTestimonial}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-neutral-700 shadow-md flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextTestimonial}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-neutral-700 shadow-md flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            
            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial 
                      ? 'bg-primary-600' 
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-20">
        <div className="container-app">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 md:p-12 text-white">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Ready to Order?
                </h2>
                <p className="text-xl opacity-90">
                  Contact us today for fresh, high-quality poultry products
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center">
                  <Phone className="w-6 h-6 mr-4 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Call Us</div>
                    <div className="opacity-90">+234 8068530494</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-6 h-6 mr-4 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Email Us</div>
                    <div className="opacity-90">orders@omzofarmz.com</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 mr-4 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Visit Us</div>
                    <div className="opacity-90">Ibadan, Nigeria</div>
                  </div>
                </div>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <PoultryContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 mt-12">
        <div className="container-app py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <div className="text-white text-2xl">🐔</div>
              </div>
              <h3 className="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-100">
                Omzo Farmz
              </h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-8">
              Trusted by Nigerian farmers for precision feed calculations and now bringing you 
              the same quality in poultry products.
            </p>
            <div className="flex justify-center space-x-6 mb-6">
              <a href="/" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Feed Calculator
              </a>
              <a href="/calculator" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Calculate Feed
              </a>
              <a href="/poultry-products" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Poultry Products
              </a>
            </div>
            
            {/* Social Media Links */}
            <div className="flex justify-center space-x-4">
              <a href="https://web.facebook.com/omzofarmz" className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://wa.me/234117135164" className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors" aria-label="WhatsApp">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@omzofarmz" className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors" aria-label="TikTok">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}