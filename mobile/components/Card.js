import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import config from '../config';

const Card = ({ children, style, onPress, variant = 'default' }) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      style={[
        styles.card, 
        variant === 'elevated' && styles.elevated,
        variant === 'flat' && styles.flat,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: config.colors.surface,
    borderRadius: config.borderRadius.l,
    padding: config.spacing.m,
    marginVertical: config.spacing.s,
    shadowColor: config.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: config.colors.borderLight,
  },
  elevated: {
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
    transform: [{ translateY: -2 }],
    borderColor: config.colors.border,
  },
  flat: {
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: config.colors.border,
    backgroundColor: 'transparent',
  },
});

export default Card;
