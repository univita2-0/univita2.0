// src/screens/LoginScreen.js – Full integration with RBAC (no biometric)
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, sendOtp, verifyOtp, forgotPassword, resetPassword } from './api';

export default function LoginScreen({ navigation }) {
  // ----- Authentication state -----
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ----- Login OTP modal state -----
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [sendingOtpResend, setSendingOtpResend] = useState(false);
  const timerRef = useRef(null);

  // ----- Forgot password flow state -----
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState('email'); // 'email', 'otp', 'password'
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetTimer, setResetTimer] = useState(0);
  const [resetError, setResetError] = useState('');

  // ----- Focus animation values -----
  const emailFocusAnim = useRef(new Animated.Value(0)).current;
  const passFocusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (anim) => {
    Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const handleBlur = (anim) => {
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const emailBorder = emailFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#1B5E5A']
  });
  const passwordBorder = passFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#1B5E5A']
  });

  // ----- Helper: start timer -----
  const startResendTimer = (setterFn) => {
    setterFn(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setterFn(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ----- Session & API calls -----
  const saveSession = async (user, token) => {
    if (token) await AsyncStorage.setItem('auth_token', token);
    // biometric_enabled is ignored (always false)
    await AsyncStorage.setItem('user', JSON.stringify({
      id: user.id,
      employee_id: user.employee_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      monthly_salary: user.monthly_salary || 0,
      work_days_per_month: user.work_days_per_month || 22,
      biometric_enabled: false // force false
    }));
    await AsyncStorage.setItem('user_id', String(user.id));
    await AsyncStorage.setItem('user_email', user.email);
    if (user.employee_id) await AsyncStorage.setItem('employee_id', user.employee_id);
    if (user.full_name) await AsyncStorage.setItem('user_name', user.full_name);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);

    if (result.success) {
      if (result.requiresPasswordReset) {
        Alert.alert(
          'Password Expired',
          'Your password is over 365 days old. You must change it now.',
          [{
            text: 'Change Now',
            onPress: async () => {
              await saveSession(result.user, null);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main', params: { screen: 'Profile', params: { screen: 'Security' } } }]
              });
            }
          }]
        );
        return;
      }

      const emailClean = email.trim().toLowerCase();
      setEmail(emailClean);

      const otpRes = await sendOtp(emailClean);
      if (otpRes.success) {
        setOtp('');
        setShowOtpModal(true);
        startResendTimer(setResendTimer);
      } else {
        Alert.alert('Error', otpRes.message || 'Failed to send OTP');
      }
    } else {
      Alert.alert('Login Failed', result.message || 'Invalid credentials');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }
    Keyboard.dismiss();
    setVerifyingOtp(true);
    try {
      const result = await verifyOtp(email, otp);
      if (result.success && result.user) {
        await saveSession(result.user, result.token);
        setShowOtpModal(false);
        // ✅ REMOVED BiometricSetup – always go to Main
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        Alert.alert('Verification Failed', result.message || 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setSendingOtpResend(true);
    const result = await sendOtp(email);
    setSendingOtpResend(false);
    if (result.success) {
      startResendTimer(setResendTimer);
      Alert.alert('OTP Resent', `A new code has been sent to ${email}`);
    } else {
      Alert.alert('Error', result.message || 'Failed to resend OTP');
    }
  };

  // ----- Forgot password handlers (unchanged) -----
  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      setResetError('Email is required');
      return;
    }
    setResetLoading(true);
    setResetError('');
    try {
      const result = await forgotPassword(resetEmail.trim().toLowerCase());
      if (result.success) {
        setResetStep('otp');
        startResendTimer(setResetTimer);
        Alert.alert('Code Sent', `An OTP has been sent to ${resetEmail}`);
      } else {
        setResetError(result.message || 'Failed to send reset code');
      }
    } catch (err) {
      setResetError('Network error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    if (!resetOtp || resetOtp.length !== 6) {
      setResetError('Please enter the 6-digit code');
      return;
    }
    setResetLoading(true);
    setResetError('');
    try {
      const result = await verifyOtp(resetEmail, resetOtp);
      if (result.success) {
        setResetStep('password');
        setResetOtp('');
      } else {
        setResetError(result.message || 'Invalid OTP');
      }
    } catch (err) {
      setResetError('Verification failed');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetNewPassword || resetNewPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match');
      return;
    }
    setResetLoading(true);
    setResetError('');
    try {
      const result = await resetPassword(resetEmail, resetOtp, resetNewPassword);
      if (result.success) {
        Alert.alert('Success', 'Your password has been reset. Please log in.');
        closeForgotModal();
      } else {
        setResetError(result.message || 'Password reset failed');
      }
    } catch (err) {
      setResetError('Network error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setResetStep('email');
    setResetEmail('');
    setResetOtp('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetError('');
    setResetTimer(0);
  };

  const resendResetOtp = async () => {
    if (resetTimer > 0) return;
    setResetLoading(true);
    try {
      const result = await forgotPassword(resetEmail);
      if (result.success) {
        startResendTimer(setResetTimer);
        Alert.alert('Code resent', `A new OTP was sent to ${resetEmail}`);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not resend code');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <Text style={styles.title}>UniVITA</Text>
            <Text style={styles.subtitle}>Security Management System</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.welcome}>Welcome back</Text>
            <Text style={styles.instruction}>Sign in to your account</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email address</Text>
              <Animated.View style={[styles.inputWrapper, { borderColor: emailBorder }]}>
                <TextInput
                  style={styles.input}
                  placeholder="your@hct.edu.ph"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => handleFocus(emailFocusAnim)}
                  onBlur={() => handleBlur(emailFocusAnim)}
                />
              </Animated.View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <Animated.View style={[styles.inputWrapper, { borderColor: passwordBorder }]}>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => handleFocus(passFocusAnim)}
                  onBlur={() => handleBlur(passFocusAnim)}
                />
              </Animated.View>
            </View>

            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => setShowForgotModal(true)}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signInButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.signInText}>Sign In</Text>}
            </TouchableOpacity>

            <View style={styles.divider} />
            <Text style={styles.footerNote}>Secure access for authorised personnel only</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ---------- Login OTP Modal ---------- */}
      <Modal visible={showOtpModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Verification Code</Text>
            <Text style={styles.modalSubtitle}>We sent a 6‑digit code to {email}</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              autoFocus
              textAlign="center"
            />
            <TouchableOpacity
              style={[styles.modalButton, verifyingOtp && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={verifyingOtp}
            >
              <Text style={styles.modalButtonText}>{verifyingOtp ? 'Verifying...' : 'Verify & Continue'}</Text>
            </TouchableOpacity>
            {resendTimer > 0 ? (
              <Text style={styles.timerText}>Resend code in {resendTimer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp} disabled={sendingOtpResend}>
                <Text style={styles.resendLink}>{sendingOtpResend ? 'Sending...' : 'Resend code'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowOtpModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ---------- Forgot Password Modal ---------- */}
      <Modal visible={showForgotModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { width: '90%' }]}>
            <Text style={styles.modalTitle}>Reset Password</Text>

            {resetStep === 'email' && (
              <>
                <Text style={styles.modalSubtitle}>Enter your registered email address</Text>
                <TextInput
                  style={styles.resetInput}
                  placeholder="Email"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {resetError && <Text style={styles.errorText}>{resetError}</Text>}
                <TouchableOpacity style={styles.modalButton} onPress={handleForgotPassword} disabled={resetLoading}>
                  <Text style={styles.modalButtonText}>{resetLoading ? 'Sending...' : 'Send Reset Code'}</Text>
                </TouchableOpacity>
              </>
            )}

            {resetStep === 'otp' && (
              <>
                <Text style={styles.modalSubtitle}>Enter the 6‑digit code sent to {resetEmail}</Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={resetOtp}
                  onChangeText={setResetOtp}
                  textAlign="center"
                />
                {resetError && <Text style={styles.errorText}>{resetError}</Text>}
                <TouchableOpacity style={styles.modalButton} onPress={handleVerifyResetOtp} disabled={resetLoading}>
                  <Text style={styles.modalButtonText}>{resetLoading ? 'Verifying...' : 'Verify Code'}</Text>
                </TouchableOpacity>
                {resetTimer > 0 ? (
                  <Text style={styles.timerText}>Resend code in {resetTimer}s</Text>
                ) : (
                  <TouchableOpacity onPress={resendResetOtp}>
                    <Text style={styles.resendLink}>Resend code</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {resetStep === 'password' && (
              <>
                <Text style={styles.modalSubtitle}>Create a new password</Text>
                <TextInput
                  style={styles.resetInput}
                  secureTextEntry
                  placeholder="New password (min. 6 characters)"
                  value={resetNewPassword}
                  onChangeText={setResetNewPassword}
                />
                <TextInput
                  style={[styles.resetInput, { marginTop: 12 }]}
                  secureTextEntry
                  placeholder="Confirm new password"
                  value={resetConfirmPassword}
                  onChangeText={setResetConfirmPassword}
                />
                {resetError && <Text style={styles.errorText}>{resetError}</Text>}
                <TouchableOpacity style={styles.modalButton} onPress={handleResetPassword} disabled={resetLoading}>
                  <Text style={styles.modalButtonText}>{resetLoading ? 'Resetting...' : 'Reset Password'}</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity onPress={closeForgotModal}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// Styles remain exactly the same as your original – no changes needed.
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 34, fontWeight: '700', color: 'white', letterSpacing: -0.5, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8, letterSpacing: 0.8 },
  card: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 32, paddingVertical: 32, paddingHorizontal: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 25, elevation: 12 },
  welcome: { fontSize: 26, fontWeight: '700', color: '#1E293B', marginBottom: 6, textAlign: 'center' },
  instruction: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 8, letterSpacing: 0.3 },
  inputWrapper: { borderWidth: 1.5, borderRadius: 16, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  input: { height: 52, paddingHorizontal: 16, fontSize: 16, color: '#0F172A' },
  forgotLink: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 24 },
  forgotText: { color: '#1B5E5A', fontSize: 13, fontWeight: '500' },
  signInButton: { backgroundColor: '#1B5E5A', height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#1B5E5A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  signInText: { color: 'white', fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  buttonDisabled: { opacity: 0.6 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },
  footerNote: { textAlign: 'center', fontSize: 11, color: '#94A3B8' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: 'white', borderRadius: 32, padding: 28, width: '85%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 25, elevation: 15 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  otpInput: { width: '100%', height: 56, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, fontSize: 20, fontWeight: '600', letterSpacing: 4, backgroundColor: '#F8FAFC', marginBottom: 24 },
  resetInput: { width: '100%', height: 50, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, fontSize: 15, backgroundColor: '#F8FAFC', marginBottom: 16 },
  modalButton: { backgroundColor: '#1B5E5A', width: '100%', height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  timerText: { fontSize: 13, color: '#64748B', marginTop: 8 },
  resendLink: { color: '#1B5E5A', fontSize: 14, fontWeight: '600', marginTop: 8 },
  cancelText: { color: '#94A3B8', fontSize: 14, marginTop: 8 },
  errorText: { color: '#DC2626', fontSize: 12, marginBottom: 12, textAlign: 'center' },
});