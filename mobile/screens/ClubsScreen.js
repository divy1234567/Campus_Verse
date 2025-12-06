import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import clubService from '../services/clubService';
import config from '../config';

const CATEGORIES = ['All', 'Academic', 'Sports', 'Cultural', 'Technical', 'Social', 'Other'];

const ClubsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadClubs();
  }, [selectedCategory]);

  const loadClubs = async () => {
    setIsLoading(true);
    try {
      const category = selectedCategory === 'All' ? null : selectedCategory;
      const response = await clubService.getClubs(category);
      if (response.success) {
        setClubs(response.data.clubs || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Academic': [config.colors.primary, config.colors.primaryDark],
      'Sports': [config.colors.accent, config.colors.accentLight],
      'Cultural': [config.colors.secondary, config.colors.secondaryDark],
      'Technical': [config.colors.gradientEnd, '#9333EA'],
      'Social': ['#EC4899', '#F472B6'],
      'Other': ['#6366F1', '#818CF8'],
    };
    return colors[category] || [config.colors.primary, config.colors.primaryDark];
  };

  const renderClubCard = ({ item }) => {
    const gradientColors = getCategoryColor(item.category);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ClubDetail', { clubId: item._id })}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[gradientColors[0] + '15', gradientColors[1] + '08']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardIcon}
          >
            <Ionicons name="people" size={32} color="#fff" />
          </LinearGradient>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={[styles.cardCategory, { color: gradientColors[0] }]}>{item.category}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={gradientColors[0]} />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[config.colors.background, config.colors.backgroundGradient, '#F0F9FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.categoryContainer}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {user?.role === 'admin' && (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateClub')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[config.colors.primary, config.colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createButton}
          >
            <Ionicons name="add-circle" size={26} color="#fff" />
            <Text style={styles.createButtonText}>Create Club</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={config.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={clubs}
          renderItem={renderClubCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No clubs found in this category</Text>
            </View>
          }
        />
      )}
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
  categoryContainer: {
    paddingVertical: 20,
    borderBottomWidth: 0,
    shadowColor: config.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  categoryChipActive: {
    backgroundColor: config.colors.primary,
    borderColor: config.colors.primary,
    shadowColor: config.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryText: {
    color: config.colors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: config.colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardCategory: {
    fontSize: 12,
    color: config.colors.primary,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 14,
    color: config.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: config.colors.textSecondary,
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: config.colors.textSecondary,
    fontSize: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 20,
    padding: 18,
    borderRadius: 20,
    shadowColor: config.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
});

export default ClubsScreen;
