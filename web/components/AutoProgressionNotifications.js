'use client';

import { useState, useEffect } from 'react';
import { useSavedResultsStore } from '../lib/store';
import { Bell, X, Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

const AutoProgressionNotifications = () => {
  const { 
    savedResults, 
    getAutoProgressionCalculations, 
    calculateNextDay 
  } = useSavedResultsStore();
  
  const [notifications, setNotifications] = useState([]);
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set());
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  useEffect(() => {
    const generateNotifications = () => {
      const autoCalcs = getAutoProgressionCalculations();
      const newNotifications = [];
      
      autoCalcs.forEach(calc => {
        const nextDay = calculateNextDay(calc.id);
        if (!nextDay) return;
        
        const daysSinceStart = Math.floor((new Date() - new Date(calc.startDate)) / (1000 * 60 * 60 * 24));
        const currentAge = calc.ageInDays + daysSinceStart;
        
        // Feed requirement notification
        newNotifications.push({
          id: `feed-${calc.id}`,
          type: 'feed_update',
          title: 'Daily Feed Update',
          message: `${calc.name || calc.birdType} (Day ${currentAge}) needs ${nextDay.totalFeedKg.toFixed(1)}kg feed today`,
          priority: 'medium',
          timestamp: new Date().toISOString(),
          calcId: calc.id,
          data: { feedAmount: nextDay.totalFeedKg, age: currentAge }
        });
        
        // Age milestone notifications
        if (currentAge % 7 === 0 && currentAge > calc.ageInDays) {
          newNotifications.push({
            id: `milestone-${calc.id}-${currentAge}`,
            type: 'milestone',
            title: 'Weekly Milestone',
            message: `${calc.name || calc.birdType} reached ${currentAge} days old! Consider health checks.`,
            priority: 'low',
            timestamp: new Date().toISOString(),
            calcId: calc.id,
            data: { age: currentAge }
          });
        }
        
        // Feed type change notifications
        const previousAge = currentAge - 1;
        if (previousAge > 0) {
          const previousDay = calculateNextDay(calc.id, previousAge);
          if (previousDay && previousDay.feedType !== nextDay.feedType) {
            newNotifications.push({
              id: `feed-change-${calc.id}-${currentAge}`,
              type: 'feed_change',
              title: 'Feed Type Change',
              message: `Time to switch from ${previousDay.feedType} to ${nextDay.feedType} for ${calc.name || calc.birdType}`,
              priority: 'high',
              timestamp: new Date().toISOString(),
              calcId: calc.id,
              data: { oldFeed: previousDay.feedType, newFeed: nextDay.feedType }
            });
          }
        }
        
        // Mortality reminder (if no recent mortality log)
        const lastMortality = calc.mortalityLog?.[calc.mortalityLog.length - 1];
        const daysSinceLastCheck = lastMortality ? 
          Math.floor((new Date() - new Date(lastMortality.date)) / (1000 * 60 * 60 * 24)) : 
          daysSinceStart;
          
        if (daysSinceLastCheck >= 3) {
          newNotifications.push({
            id: `mortality-check-${calc.id}`,
            type: 'mortality_reminder',
            title: 'Mortality Check Reminder',
            message: `Haven't updated mortality for ${calc.name || calc.birdType} in ${daysSinceLastCheck} days`,
            priority: 'medium',
            timestamp: new Date().toISOString(),
            calcId: calc.id,
            data: { daysSinceCheck: daysSinceLastCheck }
          });
        }
      });
      
      setNotifications(newNotifications.filter(n => !dismissedNotifications.has(n.id)));
    };
    
    generateNotifications();
    
    // Update notifications every hour
    const interval = setInterval(generateNotifications, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [savedResults, dismissedNotifications, getAutoProgressionCalculations, calculateNextDay]);

  const dismissNotification = (notificationId) => {
    setDismissedNotifications(prev => new Set([...prev, notificationId]));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'feed_update': return <Calendar className="h-4 w-4" />;
      case 'milestone': return <TrendingUp className="h-4 w-4" />;
      case 'feed_change': return <AlertTriangle className="h-4 w-4" />;
      case 'mortality_reminder': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'medium': return 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20';
      case 'low': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      default: return 'border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800';
    }
  };

  const getNotificationTextColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-700 dark:text-red-300';
      case 'medium': return 'text-amber-700 dark:text-amber-300';
      case 'low': return 'text-blue-700 dark:text-blue-300';
      default: return 'text-neutral-700 dark:text-neutral-300';
    }
  };

  const highPriorityNotifications = notifications.filter(n => n.priority === 'high');
  const otherNotifications = notifications.filter(n => n.priority !== 'high');

  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* High Priority Notifications - Always Visible */}
      {highPriorityNotifications.map(notification => (
        <div
          key={notification.id}
          className={clsx(
            "mb-4 p-4 rounded-lg border",
            getNotificationColor(notification.priority)
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={clsx("mt-0.5", getNotificationTextColor(notification.priority))}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <h4 className={clsx("font-medium", getNotificationTextColor(notification.priority))}>
                  {notification.title}
                </h4>
                <p className={clsx("text-sm mt-1", getNotificationTextColor(notification.priority))}>
                  {notification.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className={clsx(
                "p-1 rounded-full hover:bg-white/50 dark:hover:bg-black/20 transition-colors",
                getNotificationTextColor(notification.priority)
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Notification Center Toggle */}
      {otherNotifications.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowNotificationCenter(!showNotificationCenter)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="text-sm font-medium">
              {otherNotifications.length} notification{otherNotifications.length !== 1 ? 's' : ''}
            </span>
            {showNotificationCenter ? (
              <span className="text-xs">(Hide)</span>
            ) : (
              <span className="text-xs">(Show)</span>
            )}
          </button>
        </div>
      )}

      {/* Notification Center */}
      {showNotificationCenter && otherNotifications.length > 0 && (
        <div className="mb-4 space-y-2">
          {otherNotifications.map(notification => (
            <div
              key={notification.id}
              className={clsx(
                "p-3 rounded-lg border",
                getNotificationColor(notification.priority)
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <div className={clsx("mt-0.5", getNotificationTextColor(notification.priority))}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h5 className={clsx("text-sm font-medium", getNotificationTextColor(notification.priority))}>
                      {notification.title}
                    </h5>
                    <p className={clsx("text-xs mt-0.5", getNotificationTextColor(notification.priority))}>
                      {notification.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className={clsx(
                    "p-1 rounded-full hover:bg-white/50 dark:hover:bg-black/20 transition-colors",
                    getNotificationTextColor(notification.priority)
                  )}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AutoProgressionNotifications;