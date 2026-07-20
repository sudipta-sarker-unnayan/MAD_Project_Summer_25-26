import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Main Screens
import DashboardScreen from '../screens/DashboardScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── Notification badge dot ────────────────────────────────────
const TabIcon = ({ name, focused, badgeCount }) => (
  <View>
    <Ionicons
      name={focused ? name : `${name}-outline`}
      size={24}
      color={focused ? colors.primary : colors.tabInactive}
    />
    {badgeCount > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
      </View>
    )}
  </View>
);

// ─── Tab Navigator ─────────────────────────────────────────────
const MainTabs = () => {
  const insets = useSafeAreaInsets();
  return (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: [styles.tabBar, { height: 60 + insets.bottom, paddingBottom: insets.bottom + 6 }],      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.tabInactive,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginBottom: 4 },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{
        tabBarLabel: 'Notification',
        tabBarIcon: ({ focused }) => <TabIcon name="notifications" focused={focused} badgeCount={2} />,
      }}
    
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);
};

// ─── Auth Stack ────────────────────────────────────────────────
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// ─── Main Stack (wraps the tab navigator; add detail/push screens here) ──
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary, elevation: 0, shadowOpacity: 0 },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '600', fontSize: 16 },
    }}
  >
    <Stack.Screen
      name="MainTabs"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="Dashboard"      component={DashboardScreen}      options={{ title: 'Dashboard' }} />
   <Stack.Screen name="Notifications"      component={NotificationsScreen}      options={{ title: 'Notifications' }} />
   <Stack.Screen name="Profile"      component={ProfileScreen}      options={{ title: 'Profile' }} />

  
  </Stack.Navigator>
);

// ─── Root Navigator — login থাকলে Main, না থাকলে Auth ─────────
const AppNavigator = () => {
  const { user } = useAuth();
  return user ? <MainStack /> : <AuthStack />;
};

export default AppNavigator;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 0.5,
    borderTopColor: '#DDE3F0',
    height: 60,
    paddingTop: 6,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});