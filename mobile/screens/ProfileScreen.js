import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import attendanceService from '../services/attendanceService';
import rsvpService from '../services/rsvpService';
import config from '../config';

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useContext(AuthContext);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [rsvpEvents, setRsvpEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const [attendanceRes, rsvpRes] = await Promise.all([
        attendanceService.getUserAttendance(),
        rsvpService.getUserRSVPs(),
      ]);

      if (attendanceRes.success) {
        const validAttendance = (attendanceRes.data.attendance || []).filter(item => item.event);
        setAttendanceHistory(validAttendance);
      }
      if (rsvpRes.success) {
        const validRsvps = (rsvpRes.data.rsvps || []).filter(item => item.event);
        setRsvpEvents(validRsvps);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <LinearGradient
      colors={[config.colors.background, config.colors.backgroundGradient, '#F0F9FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadUserData} />
        }
      >
        <LinearGradient
          colors={[config.colors.primary, config.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarContainer}
        >
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </LinearGradient>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <LinearGradient
          colors={[config.colors.accent + '40', config.colors.accentLight + '30']}
          style={styles.roleTag}
        >
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </LinearGradient>
      </LinearGradient>

      {user?.role !== 'admin' && (
        <>
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsContainer}
          >
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{rsvpEvents.length}</Text>
              <Text style={styles.statLabel}>RSVPs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{attendanceHistory.length}</Text>
              <Text style={styles.statLabel}>Attended</Text>
            </View>
          </LinearGradient>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Attendance</Text>
            {attendanceHistory.length > 0 ? (
              attendanceHistory.slice(0, 3).map((item, index) => (
                <LinearGradient
                  key={item._id || index}
                  colors={[config.colors.success + '15', config.colors.accentLight + '08']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.historyItem}
                >
                  <LinearGradient
                    colors={[config.colors.success, config.colors.accentLight]}
                    style={styles.historyIcon}
                  >
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyTitle}>{item.event?.title || 'Unknown Event'}</Text>
                    <Text style={styles.historyDate}>Checked in: {formatDate(item.checkInTime)}</Text>
                  </View>
                </LinearGradient>
              ))
            ) : (
              <Text style={styles.emptyText}>No attendance history yet</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming RSVPs</Text>
            {rsvpEvents.length > 0 ? (
              rsvpEvents.slice(0, 3).map((item, index) => (
                <TouchableOpacity
                  key={item._id || index}
                  onPress={() => navigation.navigate('EventsTab', {
                    screen: 'EventDetail',
                    params: { eventId: item.event?._id }
                  })}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={[config.colors.primary + '15', config.colors.gradientEnd + '08']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.historyItem}
                  >
                    <LinearGradient
                      colors={[config.colors.primary, config.colors.gradientEnd]}
                      style={styles.historyIcon}
                    >
                      <Ionicons name="calendar" size={20} color="#FFFFFF" />
                    </LinearGradient>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyTitle}>{item.event?.title || 'Unknown Event'}</Text>
                    <Text style={styles.historyDate}>{formatDate(item.event?.startDate)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={config.colors.primary} />
                </LinearGradient>
              </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No upcoming RSVPs</Text>
            )}
          </View>
        </>
      )}



        {user?.role !== 'admin' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[config.colors.primary + '15', config.colors.primaryDark + '08']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.notificationButton}
            >
              <Ionicons name="notifications-outline" size={24} color={config.colors.primary} />
              <Text style={styles.notificationText}>View Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color={config.colors.primary} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleSignOut} activeOpacity={0.9}>
          <LinearGradient
            colors={['#FFFFFF', '#FFF5F5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.signOutButton}
          >
            <Ionicons name="log-out-outline" size={24} color={config.colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 36,
    borderBottomWidth: 0,
    shadowColor: config.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    fontWeight: '500',
  },
  roleTag: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    padding: 28,
    marginHorizontal: 16,
    borderRadius: 24,
    shadowColor: config.colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: config.colors.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: config.colors.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 14,
    color: config.colors.textSecondary,
    marginTop: 6,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: config.colors.text,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: config.colors.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: config.colors.textSecondary,
  },
  emptyText: {
    color: config.colors.textSecondary,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
    padding: 18,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: config.colors.primary + '30',
  },
  notificationText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '700',
    color: config.colors.primary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: config.colors.error + '40',
    shadowColor: config.colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  signOutText: {
    color: config.colors.error,
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    color: config.colors.textSecondary,
    fontSize: 12,
    marginBottom: 40,
  },
});

export default ProfileScreen;
