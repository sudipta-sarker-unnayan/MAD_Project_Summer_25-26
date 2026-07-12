import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../theme/colors';

// ─── Temporary home screen ─────────────────────────────────────

const HomeScreen = () => (
  <View style={s.container}>
    <Text style={s.logo}>SH</Text>
    <Text style={s.title}>Shomoy</Text>
    <Text style={s.sub}>AIUB Social Welfare Club</Text>
    <Text style={s.hint}>App is running ✓{'\n'}</Text>
  </View>
);

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: colors.primary, elevation: 0, shadowOpacity: 0 },
        headerTintColor:  '#fff',
        headerTitleStyle: { fontWeight: '600', fontSize: 16 },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Shomoy' }}
      />

    </Stack.Navigator>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 32 },
  logo:  { fontSize: 64, color: colors.primary, fontWeight: '800', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  sub:   { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 32 },
  hint:  { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22, backgroundColor: colors.white, borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: colors.border },
});
