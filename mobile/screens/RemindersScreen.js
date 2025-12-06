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
import reminderService from '../services/reminderService';
import config from '../config';

const RemindersScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const response = await reminderService.getReminders();
      if (response.success) {
        setReminders(response.data.reminders || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadReminders();
  };

  const handleDeleteReminder = (reminderId, eventTitle) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete the reminder for "${eventTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const response = await reminderService.deleteReminder(reminderId);
            if (response.success) {
              setReminders(reminders.filter(r => r._id !== reminderId));
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderReminderCard = ({ item }) => {
    if (!item.eventId) return null;
    
    const event = item.eventId;
    const reminderDate = new Date(item.reminderTime);
    const isPast = reminderDate < new Date();

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EventDetail', { eventId: event._id })}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={isPast 
            ? [config.colors.textLighter + '20', config.colors.textLighter + '10']
            : [config.colors.primary + '15', config.colors.primaryDark + '08']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={isPast 
                ? [config.colors.textLighter, config.colors.textLight]
                : [config.colors.primary, config.colors.primaryDark]
              }
              style={styles.iconContainer}
            >
              <Ionicons name="notifications" size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
              <View style={styles.reminderInfo}>
                <Ionicons name="time-outline" size={14} color={config.colors.textSecondary} />
                <Text style={styles.reminderText}>
                  Reminder: {formatDate(item.reminderTime)} at {formatTime(item.reminderTime)}
                </Text>
              </View>
              <View style={styles.eventInfo}>
                <Ionicons name="calendar-outline" size={14} color={config.colors.textSecondary} />
                <Text style={styles.eventText}>
                  Event: {formatDate(event.date)} at {formatTime(event.date)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteReminder(item._id, event.title)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color={config.colors.error} />
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
        <Text style={styles.headerTitle}>My Reminders</Text>
        <Text style={styles.headerSubtitle}>Never miss an event</Text>
      </View>

      <FlatList
        data={reminders}
        renderItem={renderReminderCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[config.colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color={config.colors.textLighter} />
            <Text style={styles.emptyText}>No reminders set</Text>
            <Text style={styles.emptySubtext}>Set reminders from event details</Text>
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
  listContent: {
    padding: 24,
    paddingTop: 0,
  },
  card: {
    padding: 20,
    marginBottom: 18,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardHeader: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: config.colors.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reminderText: {
    fontSize: 13,
    color: config.colors.textSecondary,
    marginLeft: 6,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventText: {
    fontSize: 13,
    color: config.colors.textLight,
    marginLeft: 6,
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
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
});

export default RemindersScreen;

