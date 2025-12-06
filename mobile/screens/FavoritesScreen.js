import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import favoriteService from '../services/favoriteService';
import config from '../config';
import ScreenWrapper from '../components/ScreenWrapper';

const FavoritesScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await favoriteService.getFavorites();
      if (response.success) {
        setFavorites(response.data.favorites || []);
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
    loadFavorites();
  };

  const handleRemoveFavorite = async (eventId) => {
    const response = await favoriteService.removeFavorite(eventId);
    if (response.success) {
      setFavorites(favorites.filter(fav => fav.eventId._id !== eventId));
    }
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

  const renderFavoriteCard = ({ item }) => {
    if (!item.eventId) return null;
    
    const event = item.eventId;
    const gradientColors = [
      [config.colors.primary, config.colors.primaryDark],
      [config.colors.accent, config.colors.accentLight],
      [config.colors.secondary, config.colors.secondaryDark],
    ];
    const colors = gradientColors[Math.floor(Math.random() * gradientColors.length)];

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EventDetail', { eventId: event._id })}
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
                {formatDate(event.date).split(' ')[0]}
              </Text>
              <Text style={styles.dateDay}>
                {new Date(event.date).getDate()}
              </Text>
            </LinearGradient>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
              <Text style={styles.cardLocation} numberOfLines={1}>
                <Ionicons name="location-outline" size={14} color={config.colors.textLight} />
                {' '}{event.venue}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleRemoveFavorite(event._id)}
              style={styles.favoriteButton}
            >
              <Ionicons name="heart" size={24} color={config.colors.error} />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {event.description}
          </Text>
          <View style={styles.cardFooter}>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={14} color={config.colors.textLight} />
              <Text style={styles.timeText}>{formatTime(event.date)}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={config.colors.primary} />
        </View>
      </ScreenWrapper>
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
        <Text style={styles.headerTitle}>My Favorites</Text>
        <Text style={styles.headerSubtitle}>Your saved events</Text>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavoriteCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[config.colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={config.colors.textLighter} />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>Tap the heart icon on events to save them</Text>
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
    marginBottom: 12,
  },
  dateBox: {
    borderRadius: 20,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  dateMonth: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateDay: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: config.colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardLocation: {
    fontSize: 14,
    color: config.colors.textLight,
  },
  favoriteButton: {
    padding: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: config.colors.textLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: config.colors.textLight,
    marginLeft: 4,
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

export default FavoritesScreen;

