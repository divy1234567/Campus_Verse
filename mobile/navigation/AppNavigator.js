import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import config from '../config';

// Auth Screens
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';

// App Screens
import EventsScreen from '../screens/EventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import ClubsScreen from '../screens/ClubsScreen';
import ClubDetailScreen from '../screens/ClubDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import CreateClubScreen from '../screens/CreateClubScreen';
import MyEventsScreen from '../screens/MyEventsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
const MainTabs = () => {
  const { user } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'EventsTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'ClubsTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'MyEventsTab') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: config.colors.primary,
        tabBarInactiveTintColor: config.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: config.colors.card,
          borderTopColor: config.colors.border,
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: config.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="EventsTab" 
        component={EventsStack} 
        options={{ 
          title: 'Events',
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="ClubsTab" 
        component={ClubsStack} 
        options={{ 
          title: 'Clubs',
          headerShown: false,
        }} 
      />
      {user?.role !== 'admin' && (
        <Tab.Screen 
          name="MyEventsTab" 
          component={MyEventsStack} 
          options={{ 
            title: 'My Events',
            headerShown: false,
          }} 
        />
      )}
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack} 
        options={{ 
          title: 'Profile',
          headerShown: false,
        }} 
      />
    </Tab.Navigator>
  );
};

// Events Stack Navigator
const EventsStack = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: config.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Events" 
        component={EventsScreen} 
        options={{ title: 'Campus Events' }} 
      />
      <Stack.Screen 
        name="EventDetail" 
        component={EventDetailScreen} 
        options={{ title: 'Event Details' }} 
      />
      {user?.role === 'admin' && (
        <Stack.Screen 
          name="CreateEvent" 
          component={CreateEventScreen} 
          options={{ title: 'Create Event' }} 
        />
      )}
      <Stack.Screen 
        name="QRScanner" 
        component={QRScannerScreen} 
        options={{ title: 'Scan QR Code' }} 
      />
    </Stack.Navigator>
  );
};

// Clubs Stack Navigator
const ClubsStack = () => {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: config.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Clubs" 
        component={ClubsScreen} 
        options={{ title: 'Campus Clubs' }} 
      />
      <Stack.Screen 
        name="ClubDetail" 
        component={ClubDetailScreen} 
        options={{ title: 'Club Details' }} 
      />
      {user?.role === 'admin' && (
        <Stack.Screen 
          name="CreateClub" 
          component={CreateClubScreen} 
          options={{ title: 'Create Club' }} 
        />
      )}
    </Stack.Navigator>
  );
};

// My Events Stack Navigator
const MyEventsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: config.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MyEvents" 
        component={MyEventsScreen} 
        options={{ title: 'My Schedule' }} 
      />
      <Stack.Screen 
        name="EventDetail" 
        component={EventDetailScreen} 
        options={{ title: 'Event Details' }} 
      />
      <Stack.Screen 
        name="QRScanner" 
        component={QRScannerScreen} 
        options={{ title: 'Scan QR Code' }} 
      />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: config.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'My Profile' }} 
      />
    </Stack.Navigator>
  );
};

// Auth Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
