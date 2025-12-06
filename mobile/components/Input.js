import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import config from '../config';

const Input = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  error,
  icon,
  keyboardType = 'default',
  autoCapitalize = 'none'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        isFocused && styles.focusedInput,
        error && styles.errorInput
      ]}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color={isFocused ? config.colors.primary : config.colors.textLight} />
          </View>
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={config.colors.textLighter}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <Ionicons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={config.colors.textLight} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: config.spacing.m,
    width: '100%',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: config.colors.text,
    marginBottom: config.spacing.xs + 2,
    marginLeft: config.spacing.xs,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: config.colors.surface,
    borderRadius: config.borderRadius.m,
    borderWidth: 1.5,
    borderColor: config.colors.border,
    height: 58,
    paddingHorizontal: config.spacing.m,
    shadowColor: config.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  focusedInput: {
    borderColor: config.colors.primary,
    borderWidth: 2,
    backgroundColor: config.colors.primary + '08',
    shadowColor: config.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorInput: {
    borderColor: config.colors.error,
  },
  iconContainer: {
    marginRight: config.spacing.s,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: config.colors.text,
    height: '100%',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: config.spacing.s,
  },
  errorText: {
    color: config.colors.error,
    fontSize: 12,
    marginTop: config.spacing.xs,
    marginLeft: config.spacing.xs,
  },
});

export default Input;
