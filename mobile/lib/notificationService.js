import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
  }),
});

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.expoPushToken = null;
  }

  /**
   * Initialize notification service
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Set up Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('feeding-reminders', {
          name: 'Feeding Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0284c7',
          sound: 'default',
          description: 'Notifications for feeding schedule reminders',
        });
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions() {
    try {
      if (!Device.isDevice) {
        Alert.alert(
          'Notification Error',
          'Push notifications only work on physical devices, not simulators.'
        );
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Enable Notifications',
          'To receive feeding reminders, please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ],
          { cancelable: false }
        );
        return false;
      }

      // Get push token for future use
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (projectId) {
          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          this.expoPushToken = tokenData.data;
        }
      } catch (tokenError) {
        console.warn('Could not get push token:', tokenError);
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  /**
   * Schedule feeding reminder notifications
   */
  async scheduleFeedingReminders(feedingSchedule, birdDetails) {
    try {
      await this.initialize();
      
      const hasPermission = await this.areNotificationsEnabled();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) return false;
      }

      // Cancel existing feeding reminders
      await this.cancelFeedingReminders();

      const scheduledNotifications = [];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Schedule notifications for the next 7 days
      for (let day = 0; day < 7; day++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + day);

        for (const meal of feedingSchedule.schedule) {
          const [time, period] = meal.time.split(' ');
          const [hours, minutes] = time.split(':').map(Number);
          
          let adjustedHours = hours;
          if (period === 'PM' && hours !== 12) {
            adjustedHours += 12;
          } else if (period === 'AM' && hours === 12) {
            adjustedHours = 0;
          }

          const notificationTime = new Date(targetDate);
          notificationTime.setHours(adjustedHours, minutes, 0, 0);

          // Only schedule future notifications
          if (notificationTime > now) {
            const identifier = `feeding-${day}-${meal.meal}`;
            
            await Notifications.scheduleNotificationAsync({
              identifier,
              content: {
                title: '🐔 Feeding Time!',
                body: `Time to feed your ${birdDetails.quantity} ${birdDetails.birdType}s - ${meal.feedCups} cups (${Math.round(meal.feedCups * 130)}g)`,
                data: {
                  type: 'feeding-reminder',
                  meal: meal.meal,
                  feedCups: meal.feedCups,
                  birdType: birdDetails.birdType,
                  quantity: birdDetails.quantity,
                },
                sound: 'default',
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: notificationTime,
              },
            });

            scheduledNotifications.push({
              identifier,
              time: notificationTime.toISOString(),
              meal: meal.meal,
            });
          }
        }
      }

      // Store scheduled notifications info
      await AsyncStorage.setItem(
        'scheduled-feeding-reminders',
        JSON.stringify({
          scheduledAt: now.toISOString(),
          notifications: scheduledNotifications,
          birdDetails,
          feedingSchedule,
        })
      );

      return scheduledNotifications.length;
    } catch (error) {
      console.error('Error scheduling feeding reminders:', error);
      throw error;
    }
  }

  /**
   * Cancel all feeding reminder notifications
   */
  async cancelFeedingReminders() {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const feedingNotifications = scheduledNotifications.filter(
        notification => notification.identifier?.startsWith('feeding-')
      );

      for (const notification of feedingNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      // Clear stored info
      await AsyncStorage.removeItem('scheduled-feeding-reminders');
      
      return feedingNotifications.length;
    } catch (error) {
      console.error('Error canceling feeding reminders:', error);
      throw error;
    }
  }

  /**
   * Get scheduled feeding reminders info
   */
  async getScheduledReminders() {
    try {
      const stored = await AsyncStorage.getItem('scheduled-feeding-reminders');
      if (!stored) return null;

      const data = JSON.parse(stored);
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const activeFeedingNotifications = scheduledNotifications.filter(
        notification => notification.identifier?.startsWith('feeding-')
      );

      return {
        ...data,
        activeCount: activeFeedingNotifications.length,
      };
    } catch (error) {
      console.error('Error getting scheduled reminders:', error);
      return null;
    }
  }

  /**
   * Schedule a one-time reminder
   */
  async scheduleOneTimeReminder(title, body, triggerDate, data = {}) {
    try {
      await this.initialize();
      
      const hasPermission = await this.areNotificationsEnabled();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) return false;
      }

      const identifier = `reminder-${Date.now()}`;
      
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title,
          body,
          data: {
            type: 'one-time-reminder',
            ...data,
          },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling one-time reminder:', error);
      throw error;
    }
  }

  /**
   * Add notification listeners
   */
  addNotificationListeners(onNotificationReceived, onNotificationResponse) {
    const receivedListener = Notifications.addNotificationReceivedListener(onNotificationReceived);
    const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats() {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const feedingReminders = scheduledNotifications.filter(
        notification => notification.identifier?.startsWith('feeding-')
      );
      const otherReminders = scheduledNotifications.filter(
        notification => !notification.identifier?.startsWith('feeding-')
      );

      return {
        total: scheduledNotifications.length,
        feedingReminders: feedingReminders.length,
        otherReminders: otherReminders.length,
        hasPermission: await this.areNotificationsEnabled(),
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        total: 0,
        feedingReminders: 0,
        otherReminders: 0,
        hasPermission: false,
      };
    }
  }
}

// Export singleton instance
export default new NotificationService();

// Export utility functions
export const formatTimeForNotification = (timeString) => {
  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let adjustedHours = hours;
  if (period === 'PM' && hours !== 12) {
    adjustedHours += 12;
  } else if (period === 'AM' && hours === 12) {
    adjustedHours = 0;
  }
  
  return { hours: adjustedHours, minutes };
};

export const getNextFeedingTime = (feedingSchedule) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  for (const meal of feedingSchedule.schedule) {
    const { hours, minutes } = formatTimeForNotification(meal.time);
    const mealTime = hours * 60 + minutes;
    
    if (mealTime > currentTime) {
      const nextFeedingDate = new Date(now);
      nextFeedingDate.setHours(hours, minutes, 0, 0);
      return {
        time: nextFeedingDate,
        meal,
      };
    }
  }
  
  // If no more meals today, return first meal of tomorrow
  const firstMeal = feedingSchedule.schedule[0];
  const { hours, minutes } = formatTimeForNotification(firstMeal.time);
  const nextFeedingDate = new Date(now);
  nextFeedingDate.setDate(now.getDate() + 1);
  nextFeedingDate.setHours(hours, minutes, 0, 0);
  
  return {
    time: nextFeedingDate,
    meal: firstMeal,
  };
};