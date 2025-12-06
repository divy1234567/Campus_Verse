import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import config from '../config';

const ScreenWrapper = ({ children, style, backgroundType = 'default' }) => {
  const Container = backgroundType === 'gradient' ? LinearGradient : View;
  
  const containerProps = backgroundType === 'gradient' 
    ? {
        colors: [config.colors.background, config.colors.backgroundGradient, '#E0F2FE', '#F0F9FF'],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
        style: styles.gradient
      }
    : { style: [styles.container, { backgroundColor: config.colors.background }] };

  return (
    <Container {...containerProps}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={backgroundType === 'gradient' ? 'transparent' : config.colors.background} 
        translucent={backgroundType === 'gradient'}
      />
      <SafeAreaView style={[styles.safeArea, style]} edges={['top', 'left', 'right']}>
        {children}
      </SafeAreaView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

export default ScreenWrapper;
