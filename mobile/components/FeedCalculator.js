import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { SvgXml } from 'react-native-svg';
import { useFeedStore, getAvailableBreeds, getTargetWeightOptions, getRearingStyleOptions } from '../lib/store';
import { getBreedsWithImages } from '../../shared/utils/breedImages';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { useToast } from './Toast';
import { LoadingButton } from './LoadingState';
import { validateFormData, formatUserFriendlyError } from '../../shared/utils/errorHandling';

export default function FeedCalculator() {
  const { theme } = useTheme();
  const {
    birdType,
    breed,
    ageInDays,
    ageUnit,
    quantity,
    rearingStyle,
    targetWeight,
    isCalculating,
    setBirdType,
    setBreed,
    setAge,
    setQuantity,
    setRearingStyle,
    setTargetWeight,
    calculateFeedRequirements,
  } = useFeedStore();

  const [ageInput, setAgeInput] = useState(() => {
    const initialAge = ageUnit === 'weeks' ? Math.floor(ageInDays / 7) : ageInDays;
    return initialAge === 0 ? '' : initialAge.toString();
  });
  const [selectedBreedForModal, setSelectedBreedForModal] = useState(null);
  const [isBreedModalVisible, setIsBreedModalVisible] = useState(false);

  const availableBreeds = getAvailableBreeds(birdType);
  const breedsWithImages = getBreedsWithImages(birdType);
  const targetWeightOptions = getTargetWeightOptions(breed);
  const rearingStyleOptions = getRearingStyleOptions();

  const handleAgeChange = (value) => {
    setAgeInput(value);
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setAge(numValue, ageUnit);
  };

  const handleAgeUnitChange = (unit) => {
    const currentAge = ageInput === '' ? 0 : parseInt(ageInput) || 0;
    setAge(currentAge, unit);
    // Update input display
    if (unit === 'weeks') {
      const weeksAge = Math.floor(ageInDays / 7);
      setAgeInput(weeksAge === 0 ? '' : weeksAge.toString());
    } else {
      setAgeInput(ageInDays === 0 ? '' : ageInDays.toString());
    }
  };

  const { toast } = useToast();

  const handleCalculate = async () => {
    
    try {
      // Validate form data
      const formData = {
        quantity: parseInt(quantity),
        age: parseInt(ageInput),
        birdType,
        breed,
        rearingStyle,
        targetWeight: birdType === 'broiler' ? parseFloat(targetWeight) : undefined
      };

      const validation = validateFormData(formData);
      if (!validation.isValid) {
        toast.error(validation.errors[0]);
        return;
      }

      // Show loading toast
      const loadingToastId = toast.loading('Calculating feed requirements...');

      // Calculate feed requirements
      await calculateFeedRequirements();

      // Remove loading toast and show success
      toast.removeToast(loadingToastId);
      toast.success('Feed requirements calculated successfully!');
      
    } catch (error) {
      const friendlyError = formatUserFriendlyError(error);
      toast.error(friendlyError.message, {
        title: friendlyError.title,
        duration: 7000
      });
    } finally {
      // isCalculating state is managed by the store
    }
  };

  const handleBreedLongPress = (breedOption) => {
    setSelectedBreedForModal(breedOption);
    setIsBreedModalVisible(true);
  };

  const closeBreedModal = () => {
    setIsBreedModalVisible(false);
    setSelectedBreedForModal(null);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        {/* Theme Toggle */}
        <View style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
          <ThemeToggle />
        </View>
        
        <View style={{
          width: 64,
          height: 64,
          backgroundColor: theme.colors.primaryContainer,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16
        }}>
          <Ionicons name="calculator" size={32} color={theme.colors.primary} />
        </View>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: theme.colors.text,
          marginBottom: 8,
          textAlign: 'center'
        }}>
          Feed Calculator
        </Text>
        <Text style={{
          color: theme.colors.onSurfaceVariant,
          textAlign: 'center'
        }}>
          Calculate optimal feed requirements for your poultry
        </Text>
      </View>

      {/* Bird Type Selection */}
      <View style={{
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
          marginBottom: 12
        }}>Bird Type</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {['broiler', 'layer'].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setBirdType(type)}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: birdType === type ? theme.colors.primary : theme.colors.border,
                backgroundColor: birdType === type ? theme.colors.primaryContainer : theme.colors.surface
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Ionicons
                  name={type === 'broiler' ? 'restaurant' : 'egg'}
                  size={24}
                  color={birdType === type ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    marginTop: 8,
                    textTransform: 'capitalize',
                    color: birdType === type ? theme.colors.primary : theme.colors.onSurfaceVariant
                  }}
                >
                  {type}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Breed Selection */}
      <View style={{
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
          marginBottom: 12
        }}>Breed</Text>
        <View style={{ gap: 12 }}>
          {breedsWithImages.map((breedOption) => (
            <TouchableOpacity
              key={breedOption.name}
              onPress={() => setBreed(breedOption.name)}
              onLongPress={() => handleBreedLongPress(breedOption)}
              style={{
                padding: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: breed === breedOption.name ? theme.colors.primary : theme.colors.border,
                backgroundColor: breed === breedOption.name ? theme.colors.primaryContainer : theme.colors.surface,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              {/* Breed Image */}
              <View style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: theme.colors.surfaceVariant,
                borderWidth: 1,
                borderColor: theme.colors.border,
                marginRight: 16
              }}>
                <SvgXml xml={breedOption.image} width="100%" height="100%" />
              </View>
              
              {/* Breed Info */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: breed === breedOption.name ? theme.colors.primary : theme.colors.text
                  }}
                >
                  {breedOption.name}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: theme.colors.onSurfaceVariant,
                  marginTop: 4
                }}>
                  {breedOption.description}
                </Text>
              </View>
              
              {/* Selection Indicator */}
              {breed === breedOption.name && (
                <View style={{
                  width: 24,
                  height: 24,
                  backgroundColor: theme.colors.primary,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <View style={{
                    width: 8,
                    height: 8,
                    backgroundColor: theme.colors.onPrimary,
                    borderRadius: 4
                  }} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Age Input */}
      <View style={{
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
          marginBottom: 12
        }}>Bird Age</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <TextInput
              value={ageInput}
              onChangeText={handleAgeChange}
              placeholder="Enter age"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 12,
                padding: 12,
                fontSize: 16,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text
              }}
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>
          <View style={{ width: 96 }}>
            <View style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 12,
              backgroundColor: theme.colors.surface
            }}>
              <Picker
                selectedValue={ageUnit}
                onValueChange={handleAgeUnitChange}
                style={{ height: 50, color: theme.colors.text }}
              >
                <Picker.Item label="Days" value="days" />
                <Picker.Item label="Weeks" value="weeks" />
              </Picker>
            </View>
          </View>
        </View>
        <Text style={{
          fontSize: 12,
          color: theme.colors.onSurfaceVariant,
          marginTop: 8
        }}>
          Current age: {ageInDays} days ({Math.floor(ageInDays / 7)} weeks)
        </Text>
      </View>

      {/* Quantity Input */}
      <View style={{
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
          marginBottom: 12
        }}>Number of Birds</Text>
        <TextInput
           style={{
             borderWidth: 1,
             borderColor: theme.colors.border,
             borderRadius: 12,
             padding: 12,
             fontSize: 16,
             backgroundColor: theme.colors.surface,
             color: theme.colors.text
           }}
           value={quantity === 0 ? '' : quantity.toString()}
           onChangeText={(value) => setQuantity(value === '' ? 0 : parseInt(value) || 0)}
           placeholder="Enter number of birds"
           keyboardType="numeric"
           placeholderTextColor={theme.colors.onSurfaceVariant}
         />
      </View>

      {/* Rearing Style */}
      <View style={{
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
          marginBottom: 12
        }}>Rearing Style</Text>
        <View style={{ gap: 12 }}>
          {rearingStyleOptions.map((style) => (
            <TouchableOpacity
              key={style.id}
              onPress={() => setRearingStyle(style.id)}
              style={{
                padding: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: rearingStyle === style.id ? theme.colors.primary : theme.colors.border,
                backgroundColor: rearingStyle === style.id ? theme.colors.primaryContainer : theme.colors.surface
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    borderWidth: 2,
                    marginRight: 12,
                    borderColor: rearingStyle === style.id ? theme.colors.primary : theme.colors.border,
                    backgroundColor: rearingStyle === style.id ? theme.colors.primary : 'transparent'
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: rearingStyle === style.id ? theme.colors.primary : theme.colors.text
                    }}
                  >
                    {style.name}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: theme.colors.onSurfaceVariant
                  }}>
                    {style.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Target Weight (for broilers only) */}
      {birdType === 'broiler' && targetWeightOptions.length > 0 && (
        <View style={{
          backgroundColor: theme.colors.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 12
          }}>Target Weight (6 weeks)</Text>
          <View style={{ gap: 12 }}>
            {targetWeightOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => setTargetWeight(option.id)}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: targetWeight === option.id ? theme.colors.primary : theme.colors.border,
                  backgroundColor: targetWeight === option.id ? theme.colors.primaryContainer : theme.colors.surface
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        borderWidth: 2,
                        marginRight: 12,
                        borderColor: targetWeight === option.id ? theme.colors.primary : theme.colors.border,
                        backgroundColor: targetWeight === option.id ? theme.colors.primary : 'transparent'
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '500',
                          color: targetWeight === option.id ? theme.colors.primary : theme.colors.text
                        }}
                      >
                        {option.weight}kg - {option.plan}
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: theme.colors.onSurfaceVariant
                      }}>
                        Target weight at 6 weeks
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: theme.colors.onSurface
                    }}>
                      {option.weight}kg
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Calculate Button */}
      <TouchableOpacity
        onPress={handleCalculate}
        disabled={isCalculating}
        style={{
          backgroundColor: theme.colors.primary,
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          opacity: isCalculating ? 0.7 : 1
        }}
      >
        {isCalculating ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.onPrimary} size="small" />
            <Text style={{
              color: theme.colors.onPrimary,
              fontWeight: '500',
              marginLeft: 8
            }}>Calculating...</Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calculator" size={20} color={theme.colors.onPrimary} />
            <Text style={{
              color: theme.colors.onPrimary,
              fontWeight: '500',
              marginLeft: 8
            }}>
              Calculate Feed Requirements
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Quick Tips */}
      <View style={{
        backgroundColor: theme.colors.secondaryContainer,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.secondary,
        marginBottom: 16
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Ionicons name="bulb" size={20} color={theme.colors.secondary} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: theme.colors.onSecondaryContainer,
              marginBottom: 8
            }}>
              Quick Tips
            </Text>
            <Text style={{
              fontSize: 12,
              color: theme.colors.onSecondaryContainer,
              lineHeight: 18
            }}>
              • Ensure fresh water is always available{"\n"}
              • Feed at consistent times daily{"\n"}
              • Monitor bird behavior and appetite{"\n"}
              • Adjust quantities based on actual consumption
            </Text>
          </View>
        </View>
      </View>

      {/* Breed Image Modal */}
      <Modal
        visible={isBreedModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeBreedModal}
      >
        <TouchableOpacity 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
          }}
          activeOpacity={1}
          onPress={closeBreedModal}
        >
          <TouchableOpacity 
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 24,
              maxWidth: 320,
              width: '100%'
            }}
            activeOpacity={1}
            onPress={() => {}}
          >
            {selectedBreedForModal && (
              <>
                {/* Close Button */}
                <TouchableOpacity 
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 10,
                    width: 32,
                    height: 32,
                    backgroundColor: theme.colors.surfaceVariant,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onPress={closeBreedModal}
                >
                  <Ionicons name="close" size={20} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
                
                {/* Large Breed Image */}
                <View style={{
                  width: 256,
                  height: 256,
                  alignSelf: 'center',
                  marginBottom: 16
                }}>
                  <View style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 16,
                    overflow: 'hidden',
                    backgroundColor: theme.colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: theme.colors.border
                  }}>
                    <SvgXml xml={selectedBreedForModal.image} width="100%" height="100%" />
                  </View>
                </View>
                
                {/* Breed Info */}
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: theme.colors.text,
                    marginBottom: 8
                  }}>
                    {selectedBreedForModal.name}
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: theme.colors.onSurfaceVariant,
                    textAlign: 'center',
                    lineHeight: 24
                  }}>
                    {selectedBreedForModal.description}
                  </Text>
                </View>
                
                {/* Instruction */}
                <Text style={{
                   fontSize: 12,
                   color: theme.colors.onSurfaceVariant,
                   textAlign: 'center',
                   marginTop: 16
                 }}>
                   Long press any breed to view details
                 </Text>
               </>
             )}
           </TouchableOpacity>
         </TouchableOpacity>
       </Modal>
     </ScrollView>
   );
 }