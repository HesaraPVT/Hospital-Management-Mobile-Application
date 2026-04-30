import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Animated, StatusBar,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validators';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const calculateAge = (dob) => {
    const date = new Date(dob);
    if (Number.isNaN(date.getTime())) return '';

    const today = new Date();
    let years = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      years -= 1;
    }

    return years;
  };

  const passwordLengthOk = (password) => typeof password === 'string' && password.length >= 6;
  const phoneIsValid = (value) => /^\d{10}$/.test(value);

  const handleBirthdayChange = (value) => {
    setBirthday(value);
    const calculated = calculateAge(value);
    setAge(calculated || '');
  };

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields to continue.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (trimmedPhone && !phoneIsValid(trimmedPhone)) {
      Alert.alert('Invalid Phone Number', 'Phone number must be exactly 10 digits and contain only numbers.');
      return;
    }

    if (!passwordLengthOk(password)) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters long.'
      );
      return;
    }

    if (birthday) {
      const birthDate = new Date(birthday);
      if (Number.isNaN(birthDate.getTime())) {
        Alert.alert('Invalid Birthday', 'Please enter birthday in YYYY-MM-DD format.');
        return;
      }
    }

    setLoading(true);
    try {
      await register(trimmedName, trimmedEmail, password, trimmedPhone, birthday);
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <LoadingSpinner message="Creating your account..." />;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDeep} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.crossWrap} pointerEvents="none">
          <View style={styles.crossV} /><View style={styles.crossH} />
        </View>
        <Text style={styles.est}>OLYMPUS LANKA HOSPITAL</Text>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.accentBar} />
        <Text style={styles.headerSub}>Join our patient portal for seamless care</Text>
      </View>

      {/* Form */}
      <Animated.View style={[styles.formPanel, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionLabel}>PERSONAL DETAILS</Text>

          <CustomInput label="Full Name" value={name} onChangeText={setName} placeholder="Dr. / Mr. / Ms. Full Name" />
          <CustomInput label="Email Address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
          <CustomInput label="Contact Number" value={phone} onChangeText={setPhone} placeholder="0712345678" keyboardType="phone-pad" />
          <CustomInput label="Birthday" value={birthday} onChangeText={handleBirthdayChange} placeholder="YYYY-MM-DD" />
          {age ? <Text style={styles.ageText}>Age: {age}</Text> : null}
          <CustomInput label="Password" value={password} onChangeText={setPassword} placeholder="Create a strong password" secureTextEntry />
          <Text style={styles.passwordHint}>Use at least 6 characters for a strong password.</Text>

          <CustomButton title="Create Account" onPress={handleRegister} style={styles.btn} />

          <TouchableOpacity style={styles.loginRow} onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.securityRow}>
            <View style={styles.shieldSmall} />
            <Text style={styles.securityText}>256-bit SSL · HIPAA Compliant</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.navyMid },
  header: {
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: 36,
    overflow: 'hidden',
    position: 'relative',
  },
  circle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)', top: -50, right: -60,
  },
  circle2: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -30,
  },
  crossWrap: {
    position: 'absolute', right: 24, bottom: 16, width: 60, height: 60,
    alignItems: 'center', justifyContent: 'center', opacity: 0.1,
  },
  crossV: { position: 'absolute', width: 14, height: 50, backgroundColor: COLORS.white, borderRadius: 3 },
  crossH: { position: 'absolute', width: 50, height: 14, backgroundColor: COLORS.white, borderRadius: 3 },
  est: { fontSize: 9, letterSpacing: 2.4, color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  headerTitle: { fontSize: 30, fontWeight: FONTS.bold, color: COLORS.white, lineHeight: 36 },
  accentBar: { width: 40, height: 3, backgroundColor: COLORS.tealLight, borderRadius: 2, marginVertical: 12 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 19 },

  formPanel: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 30,
  },
  sectionLabel: {
    fontSize: 10, fontWeight: FONTS.bold, color: COLORS.tealBright,
    letterSpacing: 2, marginBottom: 16,
  },
  btn: { marginTop: 8, marginBottom: 4 },

  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, marginBottom: 24 },
  loginText: { fontSize: 13, color: COLORS.textMuted },
  loginLink: { fontSize: 13, fontWeight: FONTS.bold, color: COLORS.link },

  passwordHint: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, marginBottom: 12, marginLeft: 2 },
  securityRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  shieldSmall: { width: 11, height: 12, borderWidth: 1.5, borderColor: COLORS.security, borderRadius: 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
  securityText: { fontSize: 10, color: COLORS.textMuted, letterSpacing: 0.3 },
  ageText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8, marginLeft: 2 },
});

export default RegisterScreen;