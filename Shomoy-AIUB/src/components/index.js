import React from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import {
  TouchableOpacity, Text, StyleSheet,
  ActivityIndicator, TextInput, View, Alert,
} from 'react-native';
import { colors } from '../theme/colors';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
// ─── safeNavigate ────────────────────────────────────────────────
// Wraps navigation.navigate in try/catch so tapping a route that
// isn't registered yet (e.g. a screen still under development)
// shows a friendly message instead of crashing the app.
export const safeNavigate = (navigation, screen, params) => {
  try {
    if (!navigation || typeof navigation.navigate !== 'function') {
      throw new Error('Navigation is not available');
    }
    navigation.navigate(screen, params);
  } catch (e) {
    console.log(`Navigation error (${screen}):`, e);
    Alert.alert('এখনো তৈরি হয়নি', 'এই স্ক্রিনটি এখনো তৈরি হয়নি, শীঘ্রই আসছে।');
  }
};

// ─── PrimaryButton ─────────────────────────────────────────────
export const PrimaryButton = ({ title, onPress, loading, style, disabled }) => {
  const scale = useSharedValue(1); // এটার জন্য useSharedValue ও import করো reanimated থেকে

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      style={[s.primaryBtn, (disabled || loading) && s.disabledBtn, style, animatedStyle]}
      onPress={onPress}
      onPressIn={() => { scale.value = withTiming(0.96, { duration: 100 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 100 }); }}
      disabled={loading || disabled}
      activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color="#fff" />
        : <Text style={s.primaryBtnText}>{title}</Text>
      }
    </AnimatedTouchable>
  );
};

// ─── SecondaryButton ───────────────────────────────────────────
export const SecondaryButton = ({ title, onPress, style }) => (
  <TouchableOpacity style={[s.secondaryBtn, style]} onPress={onPress} activeOpacity={0.8}>
    <Text style={s.secondaryBtnText}>{title}</Text>
  </TouchableOpacity>
);

// ─── InputField ────────────────────────────────────────────────
export const InputField = ({ label, error, containerStyle, ...props }) => (
  <View style={[s.inputWrapper, containerStyle]}>
    {label ? <Text style={s.inputLabel}>{label}</Text> : null}
    <TextInput
      style={[s.input, error && s.inputError]}
      placeholderTextColor={colors.textMuted}
      {...props}
    />
    {error ? <Text style={s.errorText}>{error}</Text> : null}
  </View>
);

// ─── Avatar ────────────────────────────────────────────────────
export const Avatar = ({ name = '', size = 48, style }) => {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Text style={[s.avatarText, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
};

// ─── Badge ─────────────────────────────────────────────────────
export const Badge = ({ label, color = colors.primary, textColor = '#fff', style }) => (
  <View style={[s.badge, { backgroundColor: color }, style]}>
    <Text style={[s.badgeText, { color: textColor }]}>{label}</Text>
  </View>
);

// ─── Card ──────────────────────────────────────────────────────
export const Card = ({ children, style }) => (
  <View style={[s.card, style]}>{children}</View>
);

// ─── re-export colors so screens only need one import ──────────
export { colors };

const s = StyleSheet.create({
  primaryBtn:     { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  disabledBtn:    { backgroundColor: colors.textMuted },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  secondaryBtn:     { borderWidth: 1.5, borderColor: colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  secondaryBtnText: { color: colors.primary, fontSize: 15, fontWeight: '600' },

  inputWrapper: { marginBottom: 14 },
  inputLabel:   { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginBottom: 6 },
  input:        { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.white },
  inputError:   { borderColor: colors.danger },
  errorText:    { fontSize: 12, color: colors.danger, marginTop: 4 },

  avatar:     { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },

  badge:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '600' },

  card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
});
