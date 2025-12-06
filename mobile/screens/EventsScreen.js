import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import eventService from '../services/eventService';
import config from '../config';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/Card';
import Button from '../components/Button';

const EventsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    // Filter events based on search query
    if (searchQuery) {
      const filtered = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [searchQuery, events]);

  const loadEvents = async () => {
    try {
      const response = await eventService.getEvents();
      if (response.success) {
        setEvents(response.data.events || []);
        setFilteredEvents(response.data.events || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load events');
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadEvents();
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

  const renderEventCard = ({ item }) => {
    const gradientColors = [
      [config.colors.primary, config.colors.primaryDark],
      [config.colors.accent, config.colors.accentLight],
      [config.colors.secondary, config.colors.secondaryDark],
      [config.colors.gradientEnd, '#9333EA'],
    ];
    const colors = gradientColors[Math.floor(Math.random() * gradientColors.length)];
    
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EventDetail', { eventId: item._id })}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[colors[0] + '15', colors[1] + '08', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dateBox}
            >
              <Text style={styles.dateMonth}>
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
              </Text>
              <Text style={styles.dateDay}>
                {new Date(item.date).getDate()}
              </Text>
            </LinearGradient>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.cardLocation} numberOfLines={1}>
                <Ionicons name="location-outline" size={14} color={config.colors.textLight} />
                {' '}{item.venue}
              </Text>
            </View>
          </View>

          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.tagsContainer}>
              {item.tags?.slice(0, 2).map((tag, index) => (
                <LinearGradient
                  key={index}
                  colors={[colors[0] + '20', colors[1] + '15']}
                  style={styles.tag}
                >
                  <Text style={[styles.tagText, { color: colors[0] }]}>{tag}</Text>
                </LinearGradient>
              ))}
            </View>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={14} color={config.colors.textLight} />
              <Text style={styles.timeText}>{formatTime(item.date)}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={[config.colors.backgroundAccent, config.colors.background, '#F0F9FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.wrapper}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={config.colors.primary} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[config.colors.backgroundAccent, config.colors.background, '#F0F9FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrapper}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Discover Events</Text>
        <Text style={styles.headerSubtitle}>Find what's happening on campus</Text>
      </View>

      <LinearGradient
        colors={['#FFFFFF', '#F8FAFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.searchContainer}
      >
        <Ionicons name="search" size={20} color={config.colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={config.colors.textLighter}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={config.colors.textLight} />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {user?.role === 'admin' && (
        <View style={styles.createButtonContainer}>
          <Button
            title="Create Event"
            onPress={() => navigation.navigate('CreateEvent')}
            icon={<Ionicons name="add-circle" size={20} color="#fff" />}
            style={styles.createButton}
          />
        </View>
      )}

      <FlatList
        data={filteredEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[config.colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={config.colors.textLighter} />
            <Text style={styles.emptyText}>No events found</Text>
          </View>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginVertical: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: config.colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: config.colors.text,
  },
  createButtonContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  createButton: {
    marginVertical: 0,
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
    overflow: 'hidden', // Fix for content spilling out
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  dateBox: {
    borderRadius: 18,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  dateMonth: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 0,
  },
  dateDay: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  cardHeaderText: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 16, // Add spacing between date box and text
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: config.colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  cardLocation: {
    fontSize: 14,
    color: config.colors.textLight,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    color: config.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'center', // Center the description text
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flex: 1,
    overflow: 'hidden', // Prevent tags from pushing time out
    marginRight: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  tagText: {
    color: config.colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0, // Prevent time from shrinking
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    color: config.colors.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
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
});

export default EventsScreen;
