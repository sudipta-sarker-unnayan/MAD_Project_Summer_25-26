import React from 'react';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { colors } from '../theme/colors';

import EventsListScreen from '../screens/EventsListScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import CommitteeApplyScreen from '../screens/CommitteeApplyScreen';
import DonationDriveScreen from '../screens/DonationDriveScreen';
import BloodRequestScreen from '../screens/BloodRequestScreen';
// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Main Screens
import NotificationsScreen from '../screens/NotificationsScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import MemberDashboardScreen from '../screens/MemberDashboardScreen';
import AdminProfileScreen from '../screens/AdminProfileScreen';
import MemberProfileScreen from '../screens/MemberProfileScreen';
import EventManageScreen from '../screens/EventManageScreen';
//import EventsScreen from '../screens/EventsScreen';
import EventDetailAdminScreen from '../screens/EventDetailAdminScreen';
import ApplicantReviewScreen from '../screens/ApplicantReviewScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── Notification badge dot ────────────────────────────────────
const TabIcon = ({ name, focused, badgeCount }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.15 : 1, { damping: 10, stiffness: 150 }) }],
  }));

  return (
    <Animated.View style={animatedStyle}>
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
    </Animated.View>
  );
};

// ─── Tab Navigator ─────────────────────────────────────────────
const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useAppData();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const DashboardComponent = isAdmin ? AdminDashboardScreen : MemberDashboardScreen;
  const ProfileComponent   = isAdmin ? AdminProfileScreen   : MemberProfileScreen;

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
      component={DashboardComponent}
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
tabBarIcon: ({ focused }) => <TabIcon name="notifications" focused={focused} badgeCount={unreadCount} />,      }}
    
    />
    <Tab.Screen
      name="Profile"
      component={ProfileComponent}
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
    <Stack.Screen name="EventManage" component={EventManageScreen} options={{ title: 'ইভেন্ট ম্যানেজ' }} />
    <Stack.Screen name="EventDetailAdmin" component={EventDetailAdminScreen} options={{ title: 'ইভেন্ট নিয়ন্ত্রণ' }} />
    <Stack.Screen name="ApplicantReview" component={ApplicantReviewScreen} options={{ title: 'আবেদনকারী' }} />
    <Stack.Screen name="Events" component={EventsListScreen} options={{ title: 'Events' }} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'ইভেন্ট ডিটেইলস' }} />
    <Stack.Screen name="CommitteeApply" component={CommitteeApplyScreen} options={{ title: 'কমিটি আবেদন' }} />
    <Stack.Screen name="DonationDrive" component={DonationDriveScreen} options={{ headerShown: false }} />
    <Stack.Screen name="BloodRequest" component={BloodRequestScreen} options={{ headerShown: false }} />
  
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