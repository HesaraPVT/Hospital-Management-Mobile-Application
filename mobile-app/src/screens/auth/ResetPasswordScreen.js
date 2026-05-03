import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { resetPasswordApi } from '../../api/authApi';

const { width, height } = Dimensions.get('window');

// ─── Color Palette ────────────────────────────────────────────────────────────
const COLORS = {
  navyDeep: '#0a2e40',
  navyMid: '#0a4a6e',
  tealStrong: '#0d6b99',
  tealBright: '#1a8cb5',
  tealLight: '#4fc3e8',
  tealPale: '#d8e8f0',
  tealFaint: '#f0f7fb',
  white: '#ffffff',
  textPrimary: '#0a2e40',
  textSecondary: '#4a6170',
  textMuted: '#7a99a8',
  textPlaceholder: '#b0c8d4',
  inputBg: '#f7fbfd',
  inputBorder: '#d8e8f0',
  inputBorderFocus: '#1a8cb5',
  divider: '#eef4f8',
  labelColor: '#4a6170',
  link: '#0d6b99',
  security: '#a0b8c4',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
};

// ─── Custom Input Field ───────────────────────────────────────────────────────
const HospitalInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  icon,
  showToggle,
  onToggleSecure,
}) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inputBorder, COLORS.inputBorderFocus],
  });

  const bgColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inputBg, COLORS.white],
  });

  return (
    <View style={inputStyles.group}>
      <Text style={inputStyles.label}>{label}</Text>
      <Animated.View
        style={[
          inputStyles.wrapper,
          { borderColor, backgroundColor: bgColor },
        ]}
      >
        <View style={inputStyles.iconSlot}>{icon}</View>
        <TextInput
          style={inputStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textPlaceholder}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {showToggle && (
          <TouchableOpacity onPress={onToggleSecure} style={inputStyles.toggleBtn}>
            <Text style={inputStyles.toggleText}>{secureTextEntry ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

// ─── Password Strength Indicator ─────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return { strength: 0, label: '', color: COLORS.textMuted };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: COLORS.error };
    if (password.length < 10) return { strength: 2, label: 'Fair', color: COLORS.warning };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, label: 'Strong', color: COLORS.success };
    }
    return { strength: 2, label: 'Fair', color: COLORS.warning };
  };

  const { strength, label, color } = getStrength();

  return (
    <View style={[strengthStyles.container, strength > 0 && { marginBottom: 16 }]}>
      <View style={strengthStyles.barsContainer}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              strengthStyles.bar,
              { backgroundColor: i <= strength ? color : COLORS.divider },
            ]}
          />
        ))}
      </View>
      <Text style={[strengthStyles.label, { color }]}>{label}</Text>
    </View>
  );
};

// ─── Main Reset Password Screen ───────────────────────────────────────────────
const ResetPasswordScreen = ({ route, navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Get token and email from route params
  const { token, email } = route.params || {};

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!token || !email) {
      Alert.alert(
        'Invalid Reset Link',
        'The password reset link is invalid or has expired.'
      );
      navigation.replace('Login');
      return;
    }

    Animated.stagger(120, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(btnAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [token, email]);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please enter both passwords.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
      return;
    }

    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    setLoading(true);
    try {
      const response = await resetPasswordApi(email, token, newPassword, confirmPassword);
      setResetSuccess(true);
      Alert.alert(
        'Success',
        response.data.message || 'Your password has been reset successfully.'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.replace('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDeep} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View
          style={[
            styles.headerPanel,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Create New Password</Text>
            <Text style={styles.headerSubtitle}>
              Enter a strong password to secure your account.
            </Text>
          </View>
        </Animated.View>

        {/* ── Form Panel ── */}
        <Animated.View
          style={[
            styles.formPanel,
            {
              opacity: formAnim,
              transform: [
                {
                  translateY: formAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {!resetSuccess ? (
            <>
              <View style={styles.tipsBox}>
                <Text style={styles.tipsIcon}>💡</Text>
                <View style={styles.tipsList}>
                  <Text style={styles.tipsItem}>• At least 6 characters</Text>
                  <Text style={styles.tipsItem}>• Mix uppercase and numbers for strength</Text>
                </View>
              </View>

              {/* New Password */}
              <HospitalInput
                label="NEW PASSWORD"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry={!showPassword}
                showToggle
                onToggleSecure={() => setShowPassword(!showPassword)}
                icon={
                  <View style={miniIconStyles.lock}>
                    <View style={miniIconStyles.lockArc} />
                    <View style={miniIconStyles.lockBody} />
                  </View>
                }
              />

              <PasswordStrength password={newPassword} />

              {/* Confirm Password */}
              <HospitalInput
                label="CONFIRM PASSWORD"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                secureTextEntry={!showConfirm}
                showToggle
                onToggleSecure={() => setShowConfirm(!showConfirm)}
                icon={
                  <View style={miniIconStyles.lock}>
                    <View style={miniIconStyles.lockArc} />
                    <View style={miniIconStyles.lockBody} />
                  </View>
                }
              />

              {newPassword && confirmPassword && newPassword === confirmPassword && (
                <View style={styles.matchBox}>
                  <Text style={styles.matchText}>✓ Passwords match!</Text>
                </View>
              )}

              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <View style={[styles.matchBox, { backgroundColor: '#ffebee' }]}>
                  <Text style={[styles.matchText, { color: COLORS.error }]}>
                    ✗ Passwords don't match
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.successBox}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>Password Reset!</Text>
              <Text style={styles.successMessage}>
                Your password has been successfully reset. You can now login with your new password.
              </Text>
            </View>
          )}
        </Animated.View>

        {/* ── Button ── */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: btnAnim,
              transform: [
                {
                  scale: btnScale,
                },
              ],
            },
          ]}
        >
          {!resetSuccess ? (
            <TouchableOpacity
              style={[
                styles.button,
                (loading || newPassword !== confirmPassword || !newPassword) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={loading || newPassword !== confirmPassword || !newPassword}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={handleBackToLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Back to Login</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.tealFaint,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerPanel: {
    marginBottom: 30,
  },
  headerContent: {
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  formPanel: {
    marginBottom: 30,
  },
  tipsBox: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  tipsIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  tipsList: {
    flex: 1,
  },
  tipsItem: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
    lineHeight: 16,
  },
  matchBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
  },
  successBox: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 25,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.tealStrong,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.tealStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

const inputStyles = StyleSheet.create({
  group: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.labelColor,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.inputBg,
  },
  iconSlot: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  toggleBtn: {
    padding: 8,
    marginLeft: 4,
  },
  toggleText: {
    fontSize: 16,
  },
});

const strengthStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  barsContainer: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    marginRight: 10,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
  },
});

const miniIconStyles = StyleSheet.create({
  lock: {
    width: 16,
    height: 18,
    borderWidth: 1.5,
    borderColor: COLORS.security,
    borderRadius: 3,
    position: 'relative',
  },
  lockArc: {
    position: 'absolute',
    top: -4,
    left: 3,
    width: 10,
    height: 8,
    borderWidth: 1.5,
    borderColor: COLORS.security,
    borderBottomWidth: 0,
    borderRadius: 8,
  },
  lockBody: {
    position: 'absolute',
    bottom: 3,
    left: 7,
    width: 2,
    height: 2,
    backgroundColor: COLORS.security,
    borderRadius: 1,
  },
});

export default ResetPasswordScreen;
