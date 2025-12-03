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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadUserData} />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleTag}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {user?.role !== 'admin' && (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{rsvpEvents.length}</Text>
              <Text style={styles.statLabel}>RSVPs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{attendanceHistory.length}</Text>
              <Text style={styles.statLabel}>Attended</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Attendance</Text>
            {attendanceHistory.length > 0 ? (
              attendanceHistory.slice(0, 3).map((item, index) => (
                <View key={item._id || index} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="checkmark-circle" size={24} color={config.colors.success} />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyTitle}>{item.event?.title || 'Unknown Event'}</Text>
                    <Text style={styles.historyDate}>Checked in: {formatDate(item.checkInTime)}</Text>
                  </View>
                </View>
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
                  style={styles.historyItem}
                  onPress={() => navigation.navigate('EventsTab', {
                    screen: 'EventDetail',
                    params: { eventId: item.event?._id }
                  })}
                >
                  <View style={[styles.historyIcon, { backgroundColor: config.colors.primary + '20' }]}>
                    <Ionicons name="calendar" size={20} color={config.colors.primary} />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyTitle}>{item.event?.title || 'Unknown Event'}</Text>
                    <Text style={styles.historyDate}>{formatDate(item.event?.startDate)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={config.colors.textSecondary} />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No upcoming RSVPs</Text>
            )}
          </View>
        </>
      )}



      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={24} color={config.colors.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: config.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: config.colors.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: config.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: config.colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: config.colors.textSecondary,
    marginBottom: 12,
  },
  roleTag: {
    backgroundColor: config.colors.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: config.colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: config.colors.card,
    marginTop: 16,
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: config.colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: config.colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: config.colors.text,
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: config.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: config.colors.text,
    marginBottom: 2,
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
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
    padding: 16,
  },
  signOutText: {
    color: config.colors.error,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: config.colors.textSecondary,
    fontSize: 12,
    marginBottom: 40,
  },
});

export default ProfileScreen;
