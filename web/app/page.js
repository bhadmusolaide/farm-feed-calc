'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator, TrendingUp, Shield, Users, Star, CheckCircle, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import OfflineIndicator from '../components/OfflineIndicator';
import VideoEmbed from '../components/VideoEmbed';
import { useUnifiedStore } from '../lib/unifiedStore';

export default function LandingPage() {
  const [isClient, setIsClient] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { getSiteTitle, getSiteDescription, getFooterDescription, getFooterFeatures, getFooterSupport, getFooterCopyright, getHeroVideoEnabled, getHeroVideoUrl, getHeroVideoTitle } = useUnifiedStore();

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Adebayo Ogundimu",
      role: "Commercial Poultry Farmer",
      location: "Lagos, Nigeria",
      content: "This calculator has revolutionized my feed management. I've reduced costs by 25% while improving my birds' performance.",
      rating: 5
    },
    {
      name: "Fatima Hassan",
      role: "Layer Farm Owner",
      location: "Kano, Nigeria",
      content: "The precision in feed calculations has helped me optimize my layer production. My egg yield increased by 18%.",
      rating: 5
    },
    {
      name: "Emmanuel Okoro",
      role: "Broiler Farmer",
      location: "Ogun State, Nigeria",
      content: "Simple to use, accurate results. This tool pays for itself within the first month of use.",
      rating: 5
    }
  ];

  const features = [
    {
      icon: Calculator,
      title: "Precision Calculations",
      description: "Get exact feed requirements based on bird type, age, weight, and environmental conditions."
    },
    {
      icon: TrendingUp,
      title: "Cost Optimization",
      description: "Reduce feed waste and costs with optimized feeding schedules and portion control."
    },
    {
      icon: Shield,
      title: "Nigerian-Focused",
      description: "Tailored for local feed brands, climate conditions, and farming practices in Nigeria."
    },
    {
      icon: Users,
      title: "Expert Knowledge",
      description: "Built with insights from experienced Nigerian poultry farmers and veterinarians."
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Enter Bird Details",
      description: "Input your bird type, age, weight, and flock size"
    },
    {
      step: "2",
      title: "Set Conditions",
      description: "Specify environmental factors and production goals"
    },
    {
      step: "3",
      title: "Get Results",
      description: "Receive precise feed calculations and recommendations"
    },
    {
      step: "4",
      title: "Track Progress",
      description: "Monitor performance and adjust feeding strategies"
    }
  ];

  const faqs = [
    {
      question: "How accurate are the feed calculations?",
      answer: "Our calculations are based on established poultry nutrition standards and have been validated by Nigerian poultry experts. The accuracy is typically within 5% of optimal requirements."
    },
    {
      question: "Does it work for both broilers and layers?",
      answer: "Yes! The calculator supports all major poultry types including broilers, layers, and local breeds commonly raised in Nigeria."
    },
    {
      question: "Can I use it offline?",
      answer: "Yes, the app works offline once loaded. Your calculations and data are saved locally on your device."
    },
    {
      question: "Is it suitable for small-scale farmers?",
      answer: "Absolutely! Whether you have 50 birds or 50,000, the calculator scales to your operation size."
    }
  ];

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
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
      <section className="relative pt-20 pb-32">
        <div className="container-app">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-8 shadow-xl animate-glow">
              <div className="text-white text-3xl">🐔</div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold gradient-text mb-6 leading-tight">
              Transform Your
              <span className="block text-primary-600 dark:text-primary-400">Poultry Business</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed">
              Calculate precise feed requirements, reduce costs by up to 30%, and maximize your poultry profits with Nigeria's most trusted feed calculator.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/calculator" className="btn-primary text-lg px-8 py-4 group">
                Start Calculating Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              

            </div>
            
            {/* Social Proof */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>5,000+ Farmers Trust Us</span>
              </div>
              <div className="flex items-center">
                <Star className="mr-2 h-4 w-4 text-yellow-500" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                <span>25% Average Cost Reduction</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Hero Video Section */}
      {getHeroVideoEnabled() && getHeroVideoUrl() && (
        <section className="py-16 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="container-app">
            <div className="max-w-4xl mx-auto">
              <VideoEmbed 
                url={getHeroVideoUrl()}
                title={getHeroVideoTitle() || 'Watch Our Demo'}
                className="w-full"
              />
            </div>
          </div>
        </section>
      )}
      
      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
              Why Nigerian Farmers Choose FeedMate
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              Built specifically for Nigerian poultry farmers with local expertise and proven results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
              How It Works
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300">
              Get started in minutes with our simple 4-step process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 mx-auto">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300">
              Real results from Nigerian poultry farmers
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-4">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-xl md:text-2xl text-neutral-700 dark:text-neutral-300 mb-6 italic">
                "{testimonials[activeTestimonial].content}"
              </blockquote>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonials[activeTestimonial].name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {testimonials[activeTestimonial].name}
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400">
                    {testimonials[activeTestimonial].role} • {testimonials[activeTestimonial].location}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeTestimonial ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container-app">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Ready to Optimize Your Feed Costs?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of Nigerian farmers who have reduced their feed costs and improved their profits.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calculator" className="bg-white text-primary-600 hover:bg-neutral-100 px-8 py-4 rounded-xl font-semibold text-lg transition-colors inline-flex items-center justify-center">
                Start Free Calculator
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            <p className="text-sm mt-4 opacity-75">
              No registration required • Works offline • Instant results
            </p>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {faq.question}
                  <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 mt-12">
        <div className="container-app py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src="/omzo_farmz_logo.png" 
                  alt="Omzo Farmz Logo" 
                  className="w-16 h-16 object-contain rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <h3 className="font-display font-semibold text-neutral-900 dark:text-neutral-100">
                  {getSiteTitle()}
                </h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                {getFooterDescription()}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                {getFooterFeatures().map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                {getFooterSupport().map((support, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    {support}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 dark:border-neutral-700 mt-8 pt-6 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {getFooterCopyright()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}