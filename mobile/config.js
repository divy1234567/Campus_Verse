
const config = {
  // API Base URL - Update this for physical device testing
  API_BASE_URL: __DEV__ 
    ? 'http://10.110.158.45:5000'  // Change to http://YOUR_IP:5000 for physical device
    : 'https://your-production-api.com',
  
  // App Colors
  colors: {
    primary: '#6C63FF',      // Purple Blue
    secondary: '#FF6584',    // Pink
    accent: '#4ECDC4',       // Teal
    background: '#F8F9FE',   // Light background
    card: '#FFFFFF',         // Card background
    text: '#2D3436',         // Dark text
    textSecondary: '#636E72', // Secondary text
    border: '#DFE6E9',       // Border color
    success: '#00B894',      // Success green
    error: '#D63031',        // Error red
    warning: '#FDCB6E',      // Warning yellow
  },
};

export default config;
