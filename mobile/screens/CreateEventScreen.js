import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Keyboard,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import eventService from '../services/eventService';
import clubService from '../services/clubService';
import config from '../config';

const CATEGORIES = ['All', 'Academic', 'Sports', 'Cultural', 'Technical', 'Social', 'Other'];

const CreateEventScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    clubId: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 3600000), // +1 hour
    tags: '',
  });
  const [clubs, setClubs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const filteredClubs = clubs.filter(
    club => selectedCategory === 'All' || club.category === selectedCategory
  );

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const response = await clubService.getClubs();
      if (response.success) {
        setClubs(response.data.clubs || []);
        if (response.data.clubs && response.data.clubs.length > 0) {
          setFormData(prev => ({ ...prev, clubId: response.data.clubs[0]._id }));
        }
      }
    } catch (error) {
      console.error('Failed to load clubs', error);
    }
  };

  const handleCreate = async () => {
    Keyboard.dismiss();
    if (!formData.title || !formData.description || !formData.location || !formData.clubId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const selectedClub = clubs.find(c => c._id === formData.clubId);
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        venue: formData.location,
        date: formData.startDate,
        time: formData.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: formData.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        organizer: selectedClub ? selectedClub.name : 'Campus Connect',
        clubId: formData.clubId,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      const response = await eventService.createEvent(eventData);
      if (response.success) {
        Alert.alert('Success', 'Event created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showDatePicker = (mode, field) => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: formData[field],
        onChange: (event, date) => onDateChange(event, date, field),
        mode: mode,
        is24Hour: true,
      });
    } else {
      if (field === 'startDate') setShowStartPicker(true);
      if (field === 'endDate') setShowEndPicker(true);
    }
  };

  const onDateChange = (event, selectedDate, field) => {
    const currentDate = selectedDate || formData[field];
    if (Platform.OS === 'ios') {
      if (field === 'startDate') setShowStartPicker(false);
      if (field === 'endDate') setShowEndPicker(false);
    }
    updateField(field, currentDate);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Event Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Annual Tech Symposium"
          value={formData.title}
          onChangeText={(text) => updateField('title', text)}
          placeholderTextColor={config.colors.textSecondary}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Event details..."
          value={formData.description}
          onChangeText={(text) => updateField('description', text)}
          multiline
          numberOfLines={4}
          placeholderTextColor={config.colors.textSecondary}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Main Auditorium"
          value={formData.location}
          onChangeText={(text) => updateField('location', text)}
          placeholderTextColor={config.colors.textSecondary}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Club Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              // Reset selected club when category changes
              const filtered = clubs.filter(c => value === 'All' || c.category === value);
              if (filtered.length > 0) {
                updateField('clubId', filtered[0]._id);
              } else {
                updateField('clubId', '');
              }
            }}
            style={styles.picker}
          >
            {CATEGORIES.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Organizing Club *</Text>
        {filteredClubs.length > 0 ? (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.clubId}
              onValueChange={(value) => updateField('clubId', value)}
              style={styles.picker}
            >
              {filteredClubs.map((club) => (
                <Picker.Item key={club._id} label={club.name} value={club._id} />
              ))}
            </Picker>
          </View>
        ) : (
          <View style={styles.noClubsContainer}>
            <Text style={styles.noClubsText}>No clubs found in this category</Text>
          </View>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Start Date & Time</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.dateButton, { flex: 1, marginRight: 8 }]}
            onPress={() => showDatePicker('date', 'startDate')}
          >
            <Text style={styles.dateText}>
              {formData.startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateButton, { flex: 1, marginLeft: 8 }]}
            onPress={() => showDatePicker('time', 'startDate')}
          >
            <Text style={styles.dateText}>
              {formData.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>
        {showStartPicker && Platform.OS === 'ios' && (
          <DateTimePicker
            value={formData.startDate}
            mode="datetime"
            display="default"
            onChange={(e, date) => onDateChange(e, date, 'startDate')}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>End Date & Time</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.dateButton, { flex: 1, marginRight: 8 }]}
            onPress={() => showDatePicker('date', 'endDate')}
          >
            <Text style={styles.dateText}>
              {formData.endDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateButton, { flex: 1, marginLeft: 8 }]}
            onPress={() => showDatePicker('time', 'endDate')}
          >
            <Text style={styles.dateText}>
              {formData.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>
        {showEndPicker && Platform.OS === 'ios' && (
          <DateTimePicker
            value={formData.endDate}
            mode="datetime"
            display="default"
            onChange={(e, date) => onDateChange(e, date, 'endDate')}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Tags (comma separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="tech, workshop, coding"
          value={formData.tags}
          onChangeText={(text) => updateField('tags', text)}
          placeholderTextColor={config.colors.textSecondary}
        />
      </View>

      <TouchableOpacity
        style={[styles.createButton, isLoading && styles.disabledButton]}
        onPress={handleCreate}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>Create Event</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.colors.background,
  },
  content: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: config.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: config.colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: config.colors.border,
    color: config.colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: config.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: config.colors.border,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
  },
  dateButton: {
    backgroundColor: config.colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: config.colors.border,
  },
  dateText: {
    fontSize: 14,
    color: config.colors.text,
  },
  createButton: {
    backgroundColor: config.colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: config.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noClubsContainer: {
    padding: 16,
    backgroundColor: config.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: config.colors.border,
    alignItems: 'center',
  },
  noClubsText: {
    color: config.colors.textSecondary,
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default CreateEventScreen;
