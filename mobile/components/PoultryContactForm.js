import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const PoultryContactForm = ({ visible, onClose, selectedProduct }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    product: selectedProduct?.name || '',
    quantity: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name.trim() || !formData.phone.trim() || !formData.product.trim()) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Phone, Product)');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // In a real implementation, you would send this data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      
      // Show success alert
      Alert.alert(
        'Order Submitted!',
        'Thank you for your order! We\'ll contact you shortly to confirm details.',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                name: '',
                email: '',
                phone: '',
                product: '',
                quantity: '',
                message: ''
              });
              setSubmitSuccess(false);
              onClose();
            }
          }
        ]
      );
    } catch (error) {
      setSubmitError('Failed to submit order. Please try again.');
      Alert.alert('Error', 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const productOptions = [
    'Live Broilers',
    'Dressed Chicken',
    'Chicken Necks',
    'Chicken Legs',
    'Dog Food (Heads & Liver)',
    'Chicken Gizzard'
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Place Your Order</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* Selected Product Info */}
            {selectedProduct && (
              <View style={[styles.selectedProductCard, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.selectedProductTitle, { color: theme.text }]}>Selected Product</Text>
                <View style={styles.selectedProductInfo}>
                  <Text style={styles.productEmoji}>{selectedProduct.icon}</Text>
                  <View style={styles.productDetails}>
                    <Text style={[styles.productName, { color: theme.text }]}>{selectedProduct.name}</Text>
                    <Text style={[styles.productPrice, { color: theme.primary }]}>{selectedProduct.pricing}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.formFields}>
              {/* Name Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.text }]}>Full Name *</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <Ionicons name="person-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={formData.name}
                    onChangeText={(value) => handleChange('name', value)}
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <Ionicons name="mail-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={formData.email}
                    onChangeText={(value) => handleChange('email', value)}
                    placeholder="Enter your email address"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Phone Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.text }]}>Phone Number *</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <Ionicons name="call-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={formData.phone}
                    onChangeText={(value) => handleChange('phone', value)}
                    placeholder="Enter your phone number"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Product Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.text }]}>Product *</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <Ionicons name="basket-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={formData.product}
                    onChangeText={(value) => handleChange('product', value)}
                    placeholder="Select or enter product"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
              </View>

              {/* Product Options */}
              <View style={styles.productOptionsContainer}>
                <Text style={[styles.optionsLabel, { color: theme.textSecondary }]}>Quick Select:</Text>
                <View style={styles.productOptions}>
                  {productOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.productOption,
                        { 
                          backgroundColor: formData.product === option ? theme.primary : theme.cardBackground,
                          borderColor: theme.border
                        }
                      ]}
                      onPress={() => handleChange('product', option)}
                    >
                      <Text style={[
                        styles.productOptionText,
                        { color: formData.product === option ? 'white' : theme.text }
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Quantity Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.text }]}>Quantity</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <Ionicons name="calculator-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={formData.quantity}
                    onChangeText={(value) => handleChange('quantity', value)}
                    placeholder="e.g., 10 birds, 5kg, etc."
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
              </View>

              {/* Message Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.text }]}>Additional Message</Text>
                <View style={[styles.textAreaContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.textArea, { color: theme.text }]}
                    value={formData.message}
                    onChangeText={(value) => handleChange('message', value)}
                    placeholder="Any special requirements or questions?"
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>

            {/* Contact Information */}
            <View style={[styles.contactInfo, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.contactTitle, { color: theme.text }]}>Contact Information</Text>
              
              <View style={styles.contactItem}>
                <Ionicons name="call" size={20} color={theme.primary} />
                <Text style={[styles.contactText, { color: theme.text }]}>+234 803 123 4567</Text>
              </View>
              
              <View style={styles.contactItem}>
                <Ionicons name="mail" size={20} color={theme.primary} />
                <Text style={[styles.contactText, { color: theme.text }]}>orders@omzofarmz.com</Text>
              </View>
              
              <View style={styles.contactItem}>
                <Ionicons name="location" size={20} color={theme.primary} />
                <Text style={[styles.contactText, { color: theme.text }]}>Ibadan, Oyo State, Nigeria</Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { 
                  backgroundColor: isSubmitting ? theme.textSecondary : theme.primary,
                  opacity: isSubmitting ? 0.7 : 1
                }
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Order'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

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
  closeButton: {
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
  formContainer: {
    padding: 20,
  },
  selectedProductCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedProductTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  selectedProductInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  formFields: {
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textArea: {
    fontSize: 16,
    minHeight: 80,
  },
  productOptionsContainer: {
    marginBottom: 16,
  },
  optionsLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  productOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  productOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contactInfo: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default PoultryContactForm;