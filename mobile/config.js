
const config = {
  // API Base URL - Update this for physical device testing
  API_BASE_URL: __DEV__ 
    ? 'http://10.110.158.45:5000'  // Change to http://YOUR_IP:5000 for physical device
    : 'https://your-production-api.com',
  
  // App Colors - Campus Vibes Theme
  colors: {
    primary: '#2563EB',      // Energetic Campus Blue
    primaryDark: '#1E40AF',  // Deep Blue
    primaryLight: '#3B82F6', // Light Blue
    secondary: '#F59E0B',   // Warm Amber/Gold
    secondaryDark: '#D97706', // Dark Amber
    accent: '#10B981',       // Fresh Green
    accentLight: '#34D399',  // Light Green
    background: '#F0F9FF',   // Vibrant Sky Blue Background
    backgroundGradient: '#DBEAFE', // Light Blue Gradient
    backgroundSecondary: '#FEF3C7', // Warm Yellow Background
    backgroundAccent: '#ECFDF5',  // Fresh Green Background
    surface: '#FFFFFF',      // Pure White (for cards)
    surfaceElevated: '#FFFFFF', // Elevated Surface
    card: '#FFFFFF',         // Card Background (alias for surface)
    cardGradient1: '#F0F9FF', // Card Gradient Start
    cardGradient2: '#E0F2FE', // Card Gradient End
    text: '#1E293B',         // Rich Slate
    textSecondary: '#475569', // Medium Slate
    textLight: '#64748B',    // Light Slate
    textLighter: '#94A3B8',  // Very Light Slate
    border: '#E2E8F0',       // Soft Border
    borderLight: '#F1F5F9',  // Very Light Border
    success: '#10B981',      // Success Green
    error: '#EF4444',        // Error Red
    warning: '#F59E0B',      // Warning Amber
    info: '#3B82F6',         // Info Blue
    gradientStart: '#2563EB', // Campus Blue Start
    gradientEnd: '#7C3AED',   // Purple End
    gradientSecondary: '#F59E0B', // Warm Amber
    gradientAccent: '#10B981',    // Fresh Green
    overlay: 'rgba(30, 41, 59, 0.5)',
    shadow: 'rgba(37, 99, 235, 0.1)', // Blue Shadow
  },
  
  // Layout & Spacing
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Typography
  borderRadius: {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
};

export default config;
