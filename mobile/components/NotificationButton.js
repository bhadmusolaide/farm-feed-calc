import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from './Toast';
import notificationService, { getNextFeedingTime } from '../lib/notificationService';
import { useSettingsStore } from '../lib/store';

export default function NotificationButton({ feedingSchedule, birdDetails, onNotificationScheduled }) {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { notifications, updateNotifications } = useSettingsStore();
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledReminders, setScheduledReminders] = useState(null);
  const [nextFeeding, setNextFeeding] = useState(null);

  useEffect(() => {
    checkScheduledReminders();
    if (feedingSchedule?.schedule) {
      const next = getNextFeedingTime(feedingSchedule);
      setNextFeeding(next);
    }
  }, [feedingSchedule]);

  const checkScheduledReminders = async () => {
    try {
      const reminders = await notificationService.getScheduledReminders();
      setScheduledReminders(reminders);
    } catch (error) {
      console.error('Error checking scheduled reminders:', error);
    }
  };

  const handleScheduleNotifications = async () => {
    if (!notifications.feedingReminders) {
      Alert.alert(
        'Enable Feeding Reminders',
        'Please enable feeding reminders in settings first.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              updateNotifications({ feedingReminders: true });
              scheduleReminders();
            },
          },
        ]
      );
      return;
    }

    await scheduleReminders();
  };

  const scheduleReminders = async () => {
    setIsScheduling(true);
    
    try {
      const count = await notificationService.scheduleFeedingReminders(
        feedingSchedule,
        birdDetails
      );
      
      if (count > 0) {
        toast.success(`Scheduled ${count} feeding reminders for the next 7 days!`);
        await checkScheduledReminders();
        onNotificationScheduled?.(count);
      } else {
        toast.info('No future feeding times to schedule.');
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      toast.error('Failed to schedule feeding reminders. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancelNotifications = async () => {
    Alert.alert(
      'Cancel Feeding Reminders',
      'Are you sure you want to cancel all scheduled feeding reminders?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const count = await notificationService.cancelFeedingReminders();
              toast.success(`Cancelled ${count} feeding reminders.`);
              setScheduledReminders(null);
            } catch (error) {
              console.error('Error canceling notifications:', error);
              toast.error('Failed to cancel feeding reminders.');
            }
          },
        },
      ]
    );
  };

  const formatTimeUntilNext = () => {
    if (!nextFeeding) return '';
    
    const now = new Date();
    const timeDiff = nextFeeding.time - now;
    
    if (timeDiff <= 0) return 'Now';
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const hasActiveReminders = scheduledReminders && scheduledReminders.activeCount > 0;

  return (
    <View style={{
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: theme.colors.border
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{
          width: 40,
          height: 40,
          backgroundColor: hasActiveReminders ? theme.colors.success + '20' : theme.colors.primary + '20',
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12
        }}>
          <Ionicons 
            name={hasActiveReminders ? 'notifications' : 'notifications-outline'} 
            size={20} 
            color={hasActiveReminders ? theme.colors.success : theme.colors.primary} 
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 2
          }}>
            Feeding Reminders
          </Text>
          <Text style={{
            fontSize: 14,
            color: theme.colors.onSurfaceVariant
          }}>
            {hasActiveReminders 
              ? `${scheduledReminders.activeCount} reminders active`
              : 'Get notified at feeding times'
            }
          </Text>
        </View>
      </View>

      {/* Next Feeding Info */}
      {nextFeeding && (
        <View style={{
          backgroundColor: theme.colors.primaryContainer,
          borderRadius: 12,
          padding: 12,
          marginBottom: 16
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: theme.colors.primary,
                marginBottom: 2
              }}>
                Next Feeding
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.text
              }}>
                {nextFeeding.meal.time}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{
                fontSize: 12,
                color: theme.colors.onSurfaceVariant,
                marginBottom: 2
              }}>
                In {formatTimeUntilNext()}
              </Text>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: theme.colors.text
              }}>
                {nextFeeding.meal.feedCups} cups
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {!hasActiveReminders ? (
          <TouchableOpacity
            onPress={handleScheduleNotifications}
            disabled={isScheduling}
            style={{
              flex: 1,
              backgroundColor: theme.colors.primary,
              borderRadius: 12,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isScheduling ? 0.7 : 1
            }}
          >
            {isScheduling ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <>
                <Ionicons name="alarm-outline" size={18} color={theme.colors.onPrimary} />
                <Text style={{
                  color: theme.colors.onPrimary,
                  fontSize: 14,
                  fontWeight: '600',
                  marginLeft: 8
                }}>
                  Set Reminders
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              onPress={handleScheduleNotifications}
              disabled={isScheduling}
              style={{
                flex: 1,
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.colors.border,
                opacity: isScheduling ? 0.7 : 1
              }}
            >
              {isScheduling ? (
                <ActivityIndicator size="small" color={theme.colors.text} />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={18} color={theme.colors.text} />
                  <Text style={{
                    color: theme.colors.text,
                    fontSize: 14,
                    fontWeight: '600',
                    marginLeft: 8
                  }}>
                    Update
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleCancelNotifications}
              style={{
                flex: 1,
                backgroundColor: theme.colors.error + '20',
                borderRadius: 12,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="close-outline" size={18} color={theme.colors.error} />
              <Text style={{
                color: theme.colors.error,
                fontSize: 14,
                fontWeight: '600',
                marginLeft: 8
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Reminder Details */}
      {hasActiveReminders && (
        <View style={{
          marginTop: 12,
          padding: 12,
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 8
        }}>
          <Text style={{
            fontSize: 12,
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center'
          }}>
            Reminders scheduled for {feedingSchedule.mealsPerDay} meals/day over the next 7 days
          </Text>
          {scheduledReminders.scheduledAt && (
            <Text style={{
              fontSize: 11,
              color: theme.colors.onSurfaceVariant,
              textAlign: 'center',
              marginTop: 4
            }}>
              Last updated: {new Date(scheduledReminders.scheduledAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}