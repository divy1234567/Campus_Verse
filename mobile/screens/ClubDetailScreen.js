import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import clubService from '../services/clubService';
import config from '../config';

const ClubDetailScreen = ({ route, navigation }) => {
  const { clubId } = route.params;
  const { user } = useContext(AuthContext);
  const [club, setClub] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    loadClubDetails();
  }, [clubId]);

  const loadClubDetails = async () => {
    try {
      const response = await clubService.getClubById(clubId);
      if (response.success) {
        const clubData = response.data.club;
        setClub(clubData);
        setFollowerCount(clubData.followers?.length || 0);
        
        // Check if user is following
        const isUserFollowing = clubData.followers?.includes(user._id);
        setIsFollowing(isUserFollowing);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load club details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        const response = await clubService.unfollowClub(clubId);
        if (response.success) {
          setIsFollowing(false);
          setFollowerCount(prev => prev - 1);
          Alert.alert('Success', 'Unfollowed club');
        }
      } else {
        const response = await clubService.followClub(clubId);
        if (response.success) {
          setIsFollowing(true);
          setFollowerCount(prev => prev + 1);
          Alert.alert('Success', 'Following club! You will receive notifications for new events.');
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update follow status');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={config.colors.primary} />
      </View>
    );
  }

  if (!club) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={60} color="#fff" />
        </View>
        <Text style={styles.title}>{club.name}</Text>
        <Text style={styles.category}>{club.category}</Text>
        
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Us</Text>
          <Text style={styles.description}>{club.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color={config.colors.textSecondary} />
            <Text style={styles.infoText}>{club.contactEmail || 'No email provided'}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: config.colors.card,
    alignItems: 'center',
    padding: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: config.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: config.colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  category: {
    fontSize: 16,
    color: config.colors.primary,
    fontWeight: '600',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: config.colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: config.colors.textSecondary,
  },
  followButton: {
    backgroundColor: config.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: config.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: config.colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: config.colors.primary,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: config.colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: config.colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: config.colors.textSecondary,
  },
});

export default ClubDetailScreen;
