import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,
         KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { PrimaryButton, SecondaryButton, InputField, colors, safeNavigate } from '../components/index';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep]         = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState('');
  const [newPass, setNewPass]   = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validateEmail = () => {
    const e = {};
    if (!email.trim())            e.email = 'email';
    else if (!email.includes('@')) e.email = 'input right email';
    setErrors(e);
    return !e.email;
  };

  const validateOtp = () => {
    const e = {};
    if (!otp.trim() || otp.length < 4) e.otp = 'give 4 digit OTP';
    setErrors(e);
    return !e.otp;
  };

  const validatePassword = () => {
    const e = {};
    if (!newPass || newPass.length < 6)    e.newPass = 'at least 6 characters';
    if (newPass !== confirmPass)            e.confirmPass = 'passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOtp = () => {
    if (!validateEmail()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      Alert.alert('OTP Sent', `${email} has been sent an OTP.\n\nDemo OTP: 1234`);
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (!validateOtp()) return;
    if (otp !== '1234') {
      setErrors({ otp: 'OTP is incorrect. Please try again.' });
      return;
    }
    setStep(3);
  };

  const handleResetPassword = () => {
    if (!validatePassword()) return;
    setLoading(true);
    setTimeout(() => {
      try {
        setLoading(false);
        Alert.alert('Success!', 'Password has been changed.', [
          { text: 'Login', onPress: () => safeNavigate(navigation, 'Login') }
        ]);
      } catch (e) {
        console.log('Reset password error:', e);
      }
    }, 1000);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Back */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            try {
              if (step === 1) navigation.goBack();
              else setStep(s => s - 1);
            } catch (e) {
              console.log('Back navigation error:', e);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="back"
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Password Reset</Text>
          <Text style={styles.subtitle}>
            {step === 1 && 'Enter your club email, OTP will be sent.'}
            {step === 2 && `${email} has been sent an OTP.`}
            {step === 3 && 'Set a new password.'}
          </Text>
        </View>

        {/* Step indicator */}
        <View style={styles.steps}>
          {[1, 2, 3].map(s => (
            <View key={s} style={styles.stepRow}>
              <View style={[styles.stepCircle, step >= s && styles.stepActive]}>
                <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>{s}</Text>
              </View>
              {s < 3 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          {step === 1 && (
            <>
              <InputField label="Club Email" placeholder="yourname@aiub.edu"
                value={email} onChangeText={t => { setEmail(t); setErrors({}); }}
                keyboardType="email-address" autoCapitalize="none" error={errors.email} />
              <PrimaryButton title="Send OTP" onPress={handleSendOtp} loading={loading} />
            </>
          )}

          {step === 2 && (
            <>
              <InputField label="OTP Code" placeholder="4-digit code"
                value={otp} onChangeText={t => { setOtp(t); setErrors({}); }}
                keyboardType="number-pad" maxLength={4} error={errors.otp} />
              <PrimaryButton title="Verify OTP" onPress={handleVerifyOtp} />
              <TouchableOpacity style={styles.resend} onPress={handleSendOtp}
                accessibilityRole="button"
                accessibilityLabel="OTP not received? resend here"
              >
                <Text style={styles.resendText}>OTP not received? Resend</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 3 && (
            <>
              <InputField label="New Password" placeholder="At least 6 characters"
                value={newPass} onChangeText={t => { setNewPass(t); setErrors({}); }}
                secureTextEntry error={errors.newPass} />
              <InputField label="Confirm Password" placeholder="Enter again"
                value={confirmPass} onChangeText={t => { setConfirmPass(t); setErrors({}); }}
                secureTextEntry error={errors.confirmPass} />
              <PrimaryButton title="Reset Password" onPress={handleResetPassword} loading={loading} />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: 24 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 15, color: colors.primary, fontWeight: '500' },
  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 6 },
  steps: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center',
  },
  stepActive: { backgroundColor: colors.primary },
  stepNum: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  stepNumActive: { color: '#fff' },
  stepLine: { width: 40, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  stepLineActive: { backgroundColor: colors.primary },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 24, borderWidth: 0.5, borderColor: colors.border },
  resend: { alignItems: 'center', marginTop: 14 },
  resendText: { color: colors.primary, fontSize: 13 },
});
