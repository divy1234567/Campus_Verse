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
import announcementService from '../services/announcementService';
import config from '../config';

const AnnouncementsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await announcementService.getAnnouncements();
      if (response.success) {
        setAnnouncements(response.data.announcements || []);
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
    loadAnnouncements();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return config.colors.error;
      case 'high':
        return config.colors.secondary;
      case 'medium':
        return config.colors.primary;
      case 'low':
        return config.colors.accent;
      default:
        return config.colors.primary;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderAnnouncementCard = ({ item }) => {
    const priorityColor = getPriorityColor(item.priority);

    return (
      <TouchableOpacity activeOpacity={0.9}>
        <LinearGradient
          colors={[priorityColor + '15', priorityColor + '08', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={[priorityColor, priorityColor + 'DD']}
              style={styles.priorityBadge}
            >
              <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
            </LinearGradient>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardContent} numberOfLines={4}>
            {item.content}
          </Text>
          {item.createdBy && (
            <View style={styles.authorContainer}>
              <Ionicons name="person-outline" size={14} color={config.colors.textSecondary} />
              <Text style={styles.authorText}>
                {item.createdBy.name}
              </Text>
            </View>
          )}
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
        <Text style={styles.headerTitle}>Announcements</Text>
        <Text style={styles.headerSubtitle}>Stay updated with campus news</Text>
      </View>

      <FlatList
        data={announcements}
        renderItem={renderAnnouncementCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[config.colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={64} color={config.colors.textLighter} />
            <Text style={styles.emptyText}>No announcements</Text>
            <Text style={styles.emptySubtext}>Check back later for updates</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    color: config.colors.textLight,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: config.colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  cardContent: {
    fontSize: 15,
    color: config.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  authorText: {
    fontSize: 13,
    color: config.colors.textSecondary,
    marginLeft: 6,
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

export default AnnouncementsScreen;

