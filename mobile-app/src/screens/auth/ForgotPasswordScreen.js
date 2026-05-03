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
import { forgotPasswordApi } from '../../api/authApi';

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
};

// ─── Custom Input Field ───────────────────────────────────────────────────────
const HospitalInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  icon,
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
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>
    </View>
  );
};

// ─── Main Forgot Password Screen ──────────────────────────────────────────────
const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
  }, []);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    setLoading(true);
    try {
      const response = await forgotPasswordApi(email);
      setEmailSent(true);
      Alert.alert(
        'Email Sent',
        response.data.message || 'Please check your email for the password reset link.'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
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
            <TouchableOpacity
              onPress={handleBackToLogin}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Reset Password</Text>
            <Text style={styles.headerSubtitle}>
              Enter your email address and we'll send you a link to reset your password.
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
          {!emailSent ? (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>📧</Text>
                <Text style={styles.infoText}>
                  We'll send a password reset link to your email. The link will expire in 1 hour.
                </Text>
              </View>

              <HospitalInput
                label="EMAIL ADDRESS"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                icon={
                  <View style={miniIconStyles.mail}>
                    <View style={miniIconStyles.mailRect} />
                    <View style={miniIconStyles.mailLine} />
                  </View>
                }
              />
            </>
          ) : (
            <View style={styles.successBox}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successMessage}>
                We've sent a password reset link to {email}. Please check your email and follow the instructions.
              </Text>
              <Text style={styles.successHint}>
                Didn't receive the email? Check your spam folder or request a new link.
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
          {!emailSent ? (
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleForgotPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
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
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    color: COLORS.tealStrong,
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 5,
  },
  formPanel: {
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: COLORS.tealLight,
    borderRadius: 8,
    padding: 15,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.white,
    lineHeight: 18,
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
    marginBottom: 12,
    lineHeight: 20,
  },
  successHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
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
    opacity: 0.7,
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
});

const miniIconStyles = StyleSheet.create({
  mail: {
    width: 18,
    height: 14,
    borderWidth: 1.5,
    borderColor: COLORS.security,
    borderRadius: 2,
  },
  mailRect: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    height: 1,
    backgroundColor: COLORS.security,
  },
  mailLine: {
    position: 'absolute',
    top: 3,
    left: 1,
    right: 1,
    height: 1,
    borderTopWidth: 1,
    borderTopColor: COLORS.security,
  },
});

export default ForgotPasswordScreen;
