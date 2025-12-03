import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import eventService from '../services/eventService';
import rsvpService from '../services/rsvpService';
import attendanceService from '../services/attendanceService';
import config from '../config';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRSVPd, setIsRSVPd] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (eventId) {
        loadEventDetails();
      }
    }, [eventId])
  );

  const loadEventDetails = async () => {
    try {
      // Load event details
      const eventResponse = await eventService.getEventById(eventId);
      if (eventResponse.success) {
        setEvent(eventResponse.data.event);
      }

      // Load RSVP status
      const rsvpStatusResponse = await rsvpService.getRSVPStatus(eventId);
      setIsRSVPd(rsvpStatusResponse.isRSVPd || false);

      // Load RSVP count
      const rsvpCountResponse = await rsvpService.getRSVPCount(eventId);
      setRsvpCount(rsvpCountResponse.count || 0);

      // Load check-in status
      const checkInResponse = await attendanceService.getCheckInStatus(eventId);
      setIsCheckedIn(checkInResponse.isCheckedIn || false);

      // Load QR code if admin
      if (user?.role === 'admin') {
        const qrResponse = await eventService.getEventQRCode(eventId);
        if (qrResponse.success) {
          setQrCode(qrResponse.data.qrCode);
        }
      }
    } catch (error) {
      console.error('Error loading event details:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRSVP = async () => {
    try {
      if (isRSVPd) {
        const response = await rsvpService.cancelRSVP(eventId);
        if (response.success) {
          setIsRSVPd(false);
          setRsvpCount(prev => prev - 1);
          Alert.alert('Success', 'RSVP cancelled');
        }
      } else {
        const response = await rsvpService.createRSVP(eventId);
        if (response.success) {
          setIsRSVPd(true);
          setRsvpCount(prev => prev + 1);
          Alert.alert('Success', 'RSVP confirmed!');
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update RSVP');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await eventService.deleteEvent(eventId);
              Alert.alert('Success', 'Event deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={config.colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  const getEventStatus = () => {
    if (!event) return { isOngoing: false, isEnded: false };
    
    try {
      const now = new Date();
      const eventDate = new Date(event.date);
      
      // Parse time strings (e.g., "10:00 AM", "1:31 pm")
      const parseTime = (timeStr) => {
        if (!timeStr) return null;
        
        const match = timeStr.match(/(\d{1,2}):(\d{2})[\s\u00A0\u202F]*([APap][Mm])?/i);
        
        if (!match) return null;

        let [_, hoursStr, minutesStr, modifier] = match;
        let hours = parseInt(hoursStr, 10);
        let minutes = parseInt(minutesStr, 10);

        if (hours === 12) {
          hours = 0;
        }
        if (modifier && modifier.toUpperCase() === 'PM') {
          hours += 12;
        }
        return { hours, minutes };
      };

      const start = parseTime(event.time);
      if (!start) return { isOngoing: false, isEnded: false };

      const startTime = new Date(eventDate);
      startTime.setHours(start.hours, start.minutes, 0);
      
      let endTime = new Date(eventDate);
      const end = parseTime(event.endTime);
      
      if (end) {
        endTime.setHours(end.hours, end.minutes, 0);
        // Handle case where end time is next day (e.g. 11 PM to 1 AM)
        if (endTime < startTime) {
             endTime.setDate(endTime.getDate() + 1);
        }
      } else {
        // Default to 2 hours after start if no end time
        endTime.setHours(start.hours + 2, start.minutes, 0);
      }
      
      return {
        isOngoing: now >= startTime && now <= endTime,
        isEnded: now > endTime
      };
    } catch (e) {
      console.error("Error parsing dates", e);
      return { isOngoing: false, isEnded: false };
    }
  };

  const { isOngoing, isEnded } = getEventStatus();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Event Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.clubBadge}>
            <Text style={styles.clubName}>{event.club?.name || 'Campus Event'}</Text>
          </View>
        </View>

        {/* Event Info Cards */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={24} color={config.colors.primary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={24} color={config.colors.secondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>
                {event.time} {event.endTime ? `- ${event.endTime}` : ''}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={24} color={config.colors.accent} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{event.venue}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {event.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* RSVP Info */}
        <View style={styles.rsvpInfo}>
          <Ionicons name="people" size={20} color={config.colors.textSecondary} />
          <Text style={styles.rsvpText}>{rsvpCount} Attendees</Text>
        </View>

        {isCheckedIn && (
          <View style={styles.checkedInBadge}>
            <Ionicons name="checkmark-circle" size={20} color={config.colors.success} />
            <Text style={styles.checkedInText}>You're checked in!</Text>
          </View>
        )}

        {/* QR Code for Admin */}
        {user?.role === 'admin' && qrCode && (
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>Event QR Code</Text>
            <Image
              source={{ uri: qrCode }}
              style={styles.qrCode}
              resizeMode="contain"
            />
            <Text style={styles.qrNote}>Show this QR code for attendee check-in</Text>
          </View>
        )}

        {/* Admin Actions */}
        {user?.role === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Controls</Text>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete Event</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!isCheckedIn && user?.role !== 'admin' && isOngoing && (
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => navigation.navigate('QRScanner', { eventId })}
            >
              <Ionicons name="qr-code" size={24} color="#fff" />
              <Text style={styles.scanButtonText}>Scan to Check In</Text>
            </TouchableOpacity>
          )}

          {user?.role !== 'admin' && (
            isEnded ? (
              <View style={[styles.rsvpButton, styles.rsvpButtonDisabled]}>
                <Ionicons name="time" size={24} color="#fff" />
                <Text style={styles.rsvpButtonText}>Event Ended</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.rsvpButton, isRSVPd && styles.rsvpButtonActive]}
                onPress={handleRSVP}
              >
                <Ionicons
                  name={isRSVPd ? 'checkmark-circle' : 'calendar'}
                  size={24}
                  color="#fff"
                />
                <Text style={styles.rsvpButtonText}>
                  {isRSVPd ? 'Cancel RSVP' : 'RSVP Now'}
                </Text>
              </TouchableOpacity>
            )
          )}
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
    backgroundColor: config.colors.background,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: config.colors.text,
    marginBottom: 12,
  },
  clubBadge: {
    alignSelf: 'flex-start',
    backgroundColor: config.colors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clubName: {
    color: config.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: config.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: config.colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: config.colors.text,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: config.colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: config.colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: config.colors.accent + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: config.colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  rsvpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 12,
    backgroundColor: config.colors.card,
    borderRadius: 12,
  },
  rsvpText: {
    marginLeft: 8,
    fontSize: 16,
    color: config.colors.textSecondary,
  },
  checkedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: config.colors.success + '20',
    borderRadius: 12,
  },
  checkedInText: {
    marginLeft: 8,
    fontSize: 16,
    color: config.colors.success,
    fontWeight: '600',
  },
  qrSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  qrCode: {
    width: 250,
    height: 250,
    marginVertical: 16,
  },
  qrNote: {
    fontSize: 14,
    color: config.colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    marginTop: 32,
    marginBottom: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: config.colors.accent,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: config.colors.primary,
    padding: 16,
    borderRadius: 12,
    shadowColor: config.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rsvpButtonActive: {
    backgroundColor: config.colors.secondary,
  },
  rsvpButtonDisabled: {
    backgroundColor: config.colors.textSecondary,
    opacity: 0.7,
  },
  rsvpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: config.colors.textSecondary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: config.colors.error,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default EventDetailScreen;
