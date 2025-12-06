import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import config from '../config';
import ScreenWrapper from '../components/ScreenWrapper';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

const SignUpScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useContext(AuthContext);

  const handleSignUp = async () => {
    const { name, email, password, confirmPassword, role } = formData;

    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const result = await signUp({ name, email, password, role });
    setIsLoading(false);

    if (!result.success) {
      Alert.alert('Sign Up Failed', result.message || 'Could not create account');
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScreenWrapper backgroundType="gradient">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <LinearGradient
                colors={[config.colors.primary + '15', config.colors.primary + '08']}
                style={styles.backButtonGradient}
              >
                <Ionicons name="arrow-back" size={22} color={config.colors.primary} />
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={[config.colors.primary, config.colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Ionicons name="person-add" size={32} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join Campus Verse today!</Text>
            </View>
          </View>

          <Card style={styles.formCard} variant="elevated">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              autoComplete="name"
              icon="person-outline"
            />

            <Input
              label="Email Address"
              placeholder="student@university.edu"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              autoCapitalize="none"
              keyboardType="email-address"
              icon="mail-outline"
            />

            <Input
              label="Password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              icon="lock-closed-outline"
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry
              icon="lock-closed-outline"
            />

            <View style={styles.pickerWrapper}>
              <Text style={styles.label}>I am a...</Text>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerIcon}>
                  <Ionicons name="school-outline" size={20} color={config.colors.textLight} />
                </View>
                <Picker
                  selectedValue={formData.role}
                  onValueChange={(value) => updateFormData('role', value)}
                  style={styles.picker}
                  dropdownIconColor={config.colors.primary}
                >
                  <Picker.Item label="Student" value="student" style={styles.pickerItem} />
                  <Picker.Item label="Admin" value="admin" style={styles.pickerItem} />
                </Picker>
              </View>
            </View>

            <Button
              title="Sign Up"
              onPress={handleSignUp}
              loading={isLoading}
              style={styles.signUpButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginBottom: 24,
    overflow: 'hidden',
  },
  backButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: config.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: config.colors.text,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: config.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  formCard: {
    padding: 28,
    borderRadius: 32,
    backgroundColor: config.colors.surface,
    shadowColor: config.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: config.colors.borderLight,
  },
  pickerWrapper: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: config.colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: config.colors.surface,
    borderRadius: config.borderRadius.m,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerIcon: {
    marginLeft: 16,
  },
  picker: {
    flex: 1,
    marginLeft: 8,
  },
  pickerItem: {
    fontSize: 16,
    color: config.colors.text,
  },
  signUpButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: config.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  signInText: {
    color: config.colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default SignUpScreen;
