import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import config from '../config';

const Button = ({ 
  title, 
  onPress, 
  loading = false, 
  variant = 'primary', // primary, secondary, outline, ghost
  style,
  textStyle,
  icon,
  disabled = false
}) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  
  const getColors = () => {
    if (disabled) return ['#CBD5E1', '#94A3B8'];
    if (isPrimary) return [config.colors.primary, config.colors.primaryDark];
    if (variant === 'secondary') return [config.colors.secondary, config.colors.secondaryDark];
    if (variant === 'accent') return [config.colors.accent, config.colors.accentLight];
    return ['transparent', 'transparent'];
  };

  const Content = () => (
    <View style={styles.contentContainer}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      {loading ? (
        <ActivityIndicator color={isOutline || isGhost ? config.colors.primary : '#FFF'} />
      ) : (
        <Text style={[
          styles.text, 
          (isOutline || isGhost) && { color: config.colors.primary },
          disabled && { color: '#FFF' },
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </View>
  );

  if (isPrimary || variant === 'secondary' || variant === 'accent') {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={loading || disabled}
        activeOpacity={0.8}
        style={[styles.container, style]}
      >
        <LinearGradient
          colors={getColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { borderRadius: config.borderRadius.m }]}
        >
          <Content />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={loading || disabled}
      style={[
        styles.container, 
        styles.solidButton,
        isOutline && styles.outlineButton,
        { borderRadius: config.borderRadius.m },
        style
      ]}
    >
      <Content />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: config.spacing.s,
    shadowColor: config.colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    paddingVertical: config.spacing.m + 2,
    paddingHorizontal: config.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: config.borderRadius.m,
  },
  solidButton: {
    paddingVertical: config.spacing.m,
    paddingHorizontal: config.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: config.colors.primary,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: config.spacing.s,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});

export default Button;
