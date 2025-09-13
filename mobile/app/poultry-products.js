import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import PoultryContactForm from '../components/PoultryContactForm';

const { width } = Dimensions.get('window');

export default function PoultryProductsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [activeProduct, setActiveProduct] = useState('broilers');
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    // Simulate API call with fallback data
    const loadProducts = async () => {
      try {
        // In a real app, this would be an API call
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
            featured: true,
            tag: 'FRESH',
            icon: '🐔'
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
            featured: true,
            tag: 'MOST POPULAR',
            icon: '🍗'
          },
          necks: {
            id: 'necks',
            name: 'Chicken Necks',
            title: 'Premium Chicken Necks',
            description: 'High-quality chicken necks perfect for grilling, roasting, or adding flavor to your favorite dishes.',
            features: [
              'Cleaned and properly prepared',
              'Rich in collagen and flavor',
              'Perfect for grilling and roasting',
              'Great for family meals',
              'Frozen for freshness'
            ],
            pricing: '₦1,600 per kg',
            availability: 'Available in 2kg and 5kg packages',
            featured: false,
            icon: '🥩'
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
            featured: false,
            icon: '🍖'
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
            featured: false,
            icon: '🐕'
          },
          gizzard: {
            id: 'gizzard',
            name: 'Chicken Gizzard',
            title: 'Tender Chicken Gizzards',
            description: 'Premium quality chicken gizzards, cleaned and prepared for cooking.',
            features: [
              'Thoroughly cleaned and prepared',
              'Rich in protein and iron',
              'Perfect for traditional dishes',
              'Great for grilling and frying',
              'Frozen for maximum freshness'
            ],
            pricing: '₦2,000 per kg',
            availability: 'Available in 1kg and 2kg packages',
            featured: false,
            icon: '🫀'
          }
        };
        
        setProducts(fallbackProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error loading products:', error);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const benefits = [
    {
      icon: 'leaf-outline',
      title: 'Natural Feeding',
      description: 'Our birds are fed using precise calculations from our proven feed system'
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Quality Assured',
      description: 'Health-checked and raised with the highest standards'
    },
    {
      icon: 'car-outline',
      title: 'Fast Delivery',
      description: 'Quick delivery within Ibadan and surrounding areas'
    },
    {
      icon: 'scale-outline',
      title: 'Consistent Weight',
      description: 'Properly fed birds with consistent, predictable weights'
    }
  ];

  const handleOrderProduct = (product) => {
    setSelectedProduct(product);
    setShowContactForm(true);
  };

  const renderProductCard = ({ item: product }) => (
    <View style={[styles.productCard, { backgroundColor: theme.cardBackground }]}>
      {product.tag && (
        <View style={[styles.productTag, product.tag === 'FRESH' ? styles.freshTag : styles.popularTag]}>
          <Text style={styles.tagText}>{product.tag}</Text>
        </View>
      )}
      
      <View style={styles.productIcon}>
        <Text style={styles.iconText}>{product.icon}</Text>
      </View>
      
      <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>
      <Text style={[styles.productDescription, { color: theme.textSecondary }]} numberOfLines={3}>
        {product.description}
      </Text>
      
      <View style={styles.priceContainer}>
        <Text style={[styles.price, { color: theme.primary }]}>{product.pricing}</Text>
        <Text style={[styles.availability, { color: theme.textSecondary }]} numberOfLines={2}>
          {product.availability}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.orderButton, { backgroundColor: theme.primary }]}
        onPress={() => handleOrderProduct(product)}
      >
        <Text style={styles.orderButtonText}>Order Now</Text>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderBenefit = ({ item: benefit }) => (
    <View style={[styles.benefitCard, { backgroundColor: theme.cardBackground }]}>
      <View style={[styles.benefitIcon, { backgroundColor: theme.primary + '20' }]}>
        <Ionicons name={benefit.icon} size={24} color={theme.primary} />
      </View>
      <Text style={[styles.benefitTitle, { color: theme.text }]}>{benefit.title}</Text>
      <Text style={[styles.benefitDescription, { color: theme.textSecondary }]}>
        {benefit.description}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Poultry Products</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: theme.primary }]}>
            <Text style={styles.heroIconText}>🐔</Text>
          </View>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Premium Broiler Chicken</Text>
          <Text style={[styles.heroSubtitle, { color: theme.primary }]}>and Poultry Products</Text>
          <Text style={[styles.heroDescription, { color: theme.textSecondary }]}>
            From our farm to your table. High-quality poultry products raised with the same precision 
            feeding principles that power our trusted feed calculator.
          </Text>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Products</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Our most popular and premium poultry offerings
          </Text>
          
          <FlatList
            data={Object.values(products).filter(product => product.featured)}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsContainer}
          />
        </View>

        {/* All Products */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>All Products</Text>
          
          <FlatList
            data={Object.values(products)}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            scrollEnabled={false}
          />
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Why Choose Our Products</Text>
          
          <FlatList
            data={benefits}
            renderItem={renderBenefit}
            keyExtractor={(item) => item.title}
            numColumns={2}
            columnWrapperStyle={styles.benefitRow}
            scrollEnabled={false}
          />
        </View>

        {/* Contact Section */}
        <View style={[styles.contactSection, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.contactTitle, { color: theme.text }]}>Ready to Order?</Text>
          <Text style={[styles.contactDescription, { color: theme.textSecondary }]}>
            Contact us today to place your order or get more information about our products.
          </Text>
          
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowContactForm(true)}
          >
            <Ionicons name="call" size={20} color="white" />
            <Text style={styles.contactButtonText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Contact Form Modal */}
      {showContactForm && (
        <PoultryContactForm
          visible={showContactForm}
          onClose={() => {
            setShowContactForm(false);
            setSelectedProduct(null);
          }}
          selectedProduct={selectedProduct}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconText: {
    fontSize: 32,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  productsContainer: {
    paddingRight: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: width * 0.42,
    marginRight: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  productTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  freshTag: {
    backgroundColor: '#10B981',
  },
  popularTag: {
    backgroundColor: '#F59E0B',
  },
  tagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productIcon: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 32,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  productDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  priceContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  availability: {
    fontSize: 10,
    textAlign: 'center',
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  orderButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },
  benefitRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  benefitCard: {
    width: width * 0.42,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  benefitDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  contactSection: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});