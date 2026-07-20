import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,
         KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton, InputField, colors, safeNavigate } from '../components/index';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [memberId, setMemberId]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});

  // ─── Validation ──────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!memberId.trim())  e.memberId = 'সদস্য আইডি দিন।';
    if (!password)         e.password = 'পাসওয়ার্ড দিন।';
    else if (password.length < 6) e.password = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────────────
  const handleLogin = async () => {
  if (!validate()) return;
  setLoading(true);
  try {
    const result = await login(memberId.trim(), password);
    if (!result.success) {
      Alert.alert('লগইন ব্যর্থ', result.message);
    }
  } catch (err) {
    Alert.alert('ত্রুটি', 'কিছু একটা ভুল হয়েছে, আবার চেষ্টা করুন।');
  } finally {
    setLoading(false);
  }
};
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.clubName}>AIUB Social Welfare Club</Text>
          <Text style={styles.clubNameBn}>Shomoy</Text>
          <Text style={styles.tagline}>Together, we make a difference.</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Member Login</Text>

          <InputField
            label="Member ID"
            placeholder="Like: SWC-2024-001"
            value={memberId}
            onChangeText={t => { setMemberId(t); setErrors(p => ({ ...p, memberId: '' })); }}
            autoCapitalize="none"
            error={errors.memberId}
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: '' })); }}
            secureTextEntry={!showPass}
            error={errors.password}
          />

          <TouchableOpacity
            style={styles.showPassRow}
            onPress={() => setShowPass(v => !v)}
          >
            <Text style={styles.showPassText}>
              {showPass ? 'Hide Password' : 'Show Password'}
            </Text>
          </TouchableOpacity>

          <PrimaryButton
            title="Login Here"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => safeNavigate(navigation, 'ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Demo hint */}
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Demo Login Information</Text>
          <Text style={styles.hintText}>Member: SWC-2024-001 / 123456</Text>
          <Text style={styles.hintText}>Admin: ADMIN-001 / admin123</Text>
        </View>

        <Text style={styles.footer}>
          Login Problems? Contact us at Admin
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoText:    { fontSize: 36, color: '#fff', fontWeight: '800' },
  clubName:    { fontSize: 16, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  clubNameBn:  { fontSize: 28, fontWeight: '800', color: colors.primary, marginTop: 2 },
  tagline:     { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 },
  showPassRow: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 4 },
  showPassText: { fontSize: 13, color: colors.primary },
  forgotBtn: { alignItems: 'center', marginTop: 16 },
  forgotText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
  hint: {
    marginTop: 20,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#BFDBFE',
  },
  hintTitle: { fontSize: 12, fontWeight: '600', color: '#1D4ED8', marginBottom: 4 },
  hintText:  { fontSize: 12, color: '#1D4ED8' },
  footer: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 24 },
});
