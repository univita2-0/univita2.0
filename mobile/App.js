import { registerRootComponent } from 'expo';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Clock, User } from 'lucide-react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Added import
import ErrorBoundary from './ErrorBoundary';


import { API_URL } from './src/screens/api';

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SecurityScreen from './src/screens/SecurityScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import RequestsScreen from './src/screens/RequestsScreen';
import MyPayrollScreen from './src/screens/MyPayrollScreen';
import LeaveHistoryScreen from './src/screens/LeaveHistoryScreen';
import ScheduleHistoryScreen from './src/screens/ScheduleHistoryScreen';
import AppealHistoryScreen from './src/screens/AppealHistoryScreen';

// ---------- Background Task Definition ----------
const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  console.log("▶️ Background task triggered by OS at", new Date().toLocaleTimeString());

  if (error) {
    console.error("Background Location Error:", error);
    return;
  }
  
  if (data && data.locations && data.locations.length > 0) {
    const location = data.locations[0];
    
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return; // Stop if the user is logged out

      const schedule = await AsyncStorage.getItem('today_schedule');
      const parsed = schedule ? JSON.parse(schedule) : null;

      // Use the dynamic API_URL and pass the Authorization token
      const response = await fetch(`${API_URL}/instructor/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          location_enabled: true,
          location_name: parsed?.place || "Background Tracking"
        })
      });

      if (response.ok) {
        console.log("✅ Background ping sent successfully");
      } else {
        console.error("Background ping failed with status:", response.status);
      }
    } catch (err) {
      console.error("Failed to send background ping:", err.message);
    }
  }
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#00897B',
        headerTitleAlign: 'center',
        headerBackTitleVisible: false
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Security" component={SecurityScreen} options={{ title: 'Security & Password' }} />
      <Stack.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Emergency Alerts' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00897B',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 10 },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Home size={24} color={color} /> }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarIcon: ({ color }) => <Calendar size={24} color={color} /> }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ tabBarIcon: ({ color }) => <Clock size={24} color={color} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  // Ensure Background Permissions are handled at the app root level
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Background location permission not granted');
      }
    })();
  }, []);

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Requests" component={RequestsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MyPayroll" component={MyPayrollScreen} options={{ headerShown: true, title: 'My Payroll' }} />
          <Stack.Screen name="LeaveHistory" component={LeaveHistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ScheduleHistory" component={ScheduleHistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AppealHistory" component={AppealHistoryScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}

registerRootComponent(App);