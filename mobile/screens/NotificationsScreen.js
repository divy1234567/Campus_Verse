import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import config from '../config';

const NotificationsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data.notifications || []);
      } else {
        setError(response.message || 'Failed to load notifications');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count || 0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadNotifications();
    loadUnreadCount();
  };

  const handleMarkAsRead = async (notificationId) => {
    const response = await notificationService.markAsRead(notificationId);
    if (response.success) {
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const response = await notificationService.markAllAsRead();
    if (response.success) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const handleDelete = (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const response = await notificationService.deleteNotification(notificationId);
            if (response.success) {
              setNotifications(notifications.filter(n => n._id !== notificationId));
            }
          }
        },
      ]
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event_reminder':
        return 'time-outline';
      case 'event_update':
        return 'information-circle-outline';
      case 'new_event':
        return 'calendar-outline';
      case 'announcement':
        return 'megaphone-outline';
      case 'rsvp':
        return 'checkmark-circle-outline';
      case 'attendance':
        return 'checkmark-done-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'event_reminder':
        return config.colors.primary;
      case 'event_update':
        return config.colors.secondary;
      case 'new_event':
        return config.colors.accent;
      case 'announcement':
        return config.colors.warning;
      default:
        return config.colors.primary;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderNotificationCard = ({ item }) => {
    const iconColor = getNotificationColor(item.type);
    const iconName = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        onPress={() => {
          if (!item.read) {
            handleMarkAsRead(item._id);
          }
          if (item.data?.eventId) {
            navigation.navigate('EventsTab', {
              screen: 'EventDetail',
              params: { eventId: item.data.eventId }
            });
          }
        }}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={item.read 
            ? ['#FFFFFF', '#F8FAFF']
            : [iconColor + '15', iconColor + '08', '#FFFFFF']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, !item.read && styles.unreadCard]}
        >
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={[iconColor, iconColor + 'DD']}
              style={styles.iconContainer}
            >
              <Ionicons name={iconName} size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, !item.read && styles.unreadTitle]}>
                {item.title}
              </Text>
              <Text style={styles.cardBody} numberOfLines={2}>
                {item.body}
              </Text>
              <Text style={styles.cardTime}>{formatDate(item.createdAt)}</Text>
            </View>
            {!item.read && (
              <View style={styles.unreadDot} />
            )}
            <TouchableOpacity
              onPress={() => handleDelete(item._id)}
              style={styles.deleteButton}
            >
              <Ionicons name="close" size={20} color={config.colors.textLight} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={config.colors.primary} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[config.colors.background, config.colors.backgroundGradient, '#F0F9FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            style={styles.markAllButton}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[config.colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {error ? (
              <>
                <Ionicons name="alert-circle-outline" size={64} color={config.colors.error} />
                <Text style={[styles.emptyText, { color: config.colors.error }]}>Oops! Something went wrong</Text>
                <Text style={styles.emptySubtext}>{error}</Text>
                <TouchableOpacity onPress={loadNotifications} style={styles.retryButton}>
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="notifications-outline" size={64} color={config.colors.textLighter} />
                <Text style={styles.emptyText}>No notifications</Text>
                <Text style={styles.emptySubtext}>You're all caught up!</Text>
              </>
            )}
          </View>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: config.colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: config.colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  markAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: config.colors.primary + '20',
  },
  markAllText: {
    color: config.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    padding: 24,
    paddingTop: 0,
  },
  card: {
    padding: 18,
    marginBottom: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  unreadCard: {
    borderColor: config.colors.primary + '40',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: config.colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  unreadTitle: {
    fontWeight: '900',
  },
  cardBody: {
    fontSize: 14,
    color: config.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardTime: {
    fontSize: 12,
    color: config.colors.textLight,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: config.colors.primary,
    marginLeft: 8,
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: config.colors.textLight,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: config.colors.textLighter,
    marginTop: 8,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: config.colors.primary,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default NotificationsScreen;
