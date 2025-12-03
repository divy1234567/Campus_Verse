import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import clubService from '../services/clubService';
import config from '../config';

const CATEGORIES = ['Academic', 'Sports', 'Cultural', 'Technical', 'Social', 'Other'];

const CreateClubScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Academic',
    description: '',
    contactEmail: '',
    logoUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!formData.name || !formData.description || !formData.contactEmail) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await clubService.createClub(formData);
      if (response.success) {
        Alert.alert('Success', 'Club created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create club');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Club Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter club name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(itemValue) =>
                setFormData({ ...formData, category: itemValue })
              }
            >
              {CATEGORIES.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the club..."
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="club@example.com"
            value={formData.contactEmail}
            onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Logo URL (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/logo.png"
            value={formData.logoUrl}
            onChangeText={(text) => setFormData({ ...formData, logoUrl: text })}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.createButtonText}>Create Club</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.colors.background,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
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
    borderWidth: 1,
    borderColor: config.colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: config.colors.text,
  },
  textArea: {
    height: 100,
  },
  pickerContainer: {
    backgroundColor: config.colors.card,
    borderWidth: 1,
    borderColor: config.colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: config.colors.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: config.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CreateClubScreen;
