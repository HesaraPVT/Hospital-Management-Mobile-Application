import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, Alert, ScrollView,
  TouchableOpacity, Platform, StatusBar,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { updateUserApi, deleteUserApi } from '../../api/userApi';
import { validateEmail } from '../../utils/validators';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const ProfileScreen = () => {
  const { userInfo, logout, updateUserInfo } = useContext(AuthContext);
  const [name,    setName]    = useState(userInfo?.name    || '');
  const [email,   setEmail]   = useState(userInfo?.email   || '');
  const [phone,   setPhone]   = useState(userInfo?.phone   || '');
  const [birthday, setBirthday] = useState(userInfo?.birthday ? userInfo.birthday.split('T')[0] : '');
  const [age, setAge] = useState(userInfo?.birthday ? (() => {
    const birthDate = new Date(userInfo.birthday);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      years -= 1;
    }
    return years;
  })() : '');
  const [address, setAddress] = useState(userInfo?.address || '');
  const [loading, setLoading] = useState(false);

  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

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

  React.useEffect(() => {
    if (!userInfo) return;

    setName(userInfo.name || '');
    setEmail(userInfo.email || '');
    setPhone(userInfo.phone || '');
    setBirthday(userInfo.birthday ? userInfo.birthday.split('T')[0] : '');
    setAge(userInfo.birthday ? calculateAge(userInfo.birthday) : '');
    setAddress(userInfo.address || '');
  }, [userInfo]);

  const phoneIsValid = (value) => /^\d{10}$/.test(value);

  const handleBirthdayChange = (value) => {
    setBirthday(value);
    const calculated = calculateAge(value);
    setAge(calculated ? calculated : '');
  };

  const handleUpdate = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !trimmedEmail) {
      Alert.alert('Missing Fields', 'Name and email cannot be empty.');
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

    if (birthday) {
      const birthDate = new Date(birthday);
      if (Number.isNaN(birthDate.getTime())) {
        Alert.alert('Invalid Birthday', 'Please enter birthday in YYYY-MM-DD format.');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await updateUserApi(userInfo._id, {
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        birthday,
        address: trimmedAddress,
      });
      updateUserInfo(response.data);
      if (response.data.birthday) {
        setAge(response.data.age || calculateAge(response.data.birthday));
      }
      Alert.alert('Profile Updated', 'Your information has been saved successfully.');
    } catch (error) {
      Alert.alert('Update Failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteAccount = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you absolutely sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteUserApi(userInfo._id);
              await logout();
            } catch (error) {
              Alert.alert('Delete Failed', error.response?.data?.message || 'Unable to delete account.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent. Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDeleteAccount },
      ]
    );
  };

  if (loading) return <LoadingSpinner message="Saving profile..." />;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDeep} />

      <View style={styles.hero}>
        <View style={styles.circle1} /><View style={styles.circle2} />
        <Text style={styles.heroEst}>OLYMPUS LANKA HOSPITAL</Text>
        <Text style={styles.heroTitle}>My Profile</Text>
        <View style={styles.accentBar} />
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{userInfo?.role || 'Patient'}</Text>
          </View>
        </View>
        <Text style={styles.heroName}>{name}</Text>
        <Text style={styles.heroEmail}>{email}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>ACCOUNT INFORMATION</Text>

        <View style={styles.formCard}>
          <CustomInput label="Full Name"     value={name}    onChangeText={setName}    placeholder="Your name"    />
          <CustomInput label="Email Address" value={email}   onChangeText={setEmail}   placeholder="Your email"   keyboardType="email-address" />
          <CustomInput label="Phone Number"  value={phone}   onChangeText={setPhone}   placeholder="Your phone"   keyboardType="phone-pad" />
          <CustomInput label="Birthday"      value={birthday} onChangeText={handleBirthdayChange} placeholder="YYYY-MM-DD" />
          {age ? <Text style={styles.profileAge}>Age: {age}</Text> : null}
          <CustomInput label="Address"       value={address} onChangeText={setAddress} placeholder="Your address" />
        </View>

        <CustomButton title="Save Changes" onPress={handleUpdate} style={styles.saveBtn} />

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.8}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  hero: {
    backgroundColor: COLORS.navyMid,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: 28,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  circle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.04)', top: -50, right: -60 },
  circle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60,  backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -30 },
  heroEst:    { fontSize: 9, letterSpacing: 2.2, color: 'rgba(255,255,255,0.45)', marginBottom: 6 },
  heroTitle:  { fontSize: 20, fontWeight: FONTS.bold, color: COLORS.white, marginBottom: 10 },
  accentBar:  { width: 36, height: 3, backgroundColor: COLORS.tealLight, borderRadius: 2, marginBottom: 20 },
  avatarWrap: { alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.tealBright,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { fontSize: 24, fontWeight: FONTS.bold, color: COLORS.white },
  roleBadge: {
    marginTop: 8, backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  roleText:   { fontSize: 11, color: COLORS.white, fontWeight: FONTS.semibold, letterSpacing: 1, textTransform: 'uppercase' },
  heroName:   { fontSize: 18, fontWeight: FONTS.bold,    color: COLORS.white, marginTop: 8 },
  heroEmail:  { fontSize: 13, fontWeight: FONTS.regular, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  scroll:        { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  sectionLabel:  { fontSize: 10, fontWeight: FONTS.bold, color: COLORS.tealBright, letterSpacing: 2, marginBottom: 12, marginLeft: 4 },

  formCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 16, ...SHADOW.card,
  },
  saveBtn:    { marginBottom: 10 },
  logoutBtn: {
    paddingVertical: 14, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.danger, alignItems: 'center', marginTop: 6,
  },
  logoutText: { fontSize: 14, fontWeight: FONTS.semibold, color: COLORS.danger },
  deleteBtn: {
    paddingVertical: 14, borderRadius: RADIUS.md,
    backgroundColor: COLORS.danger, alignItems: 'center', marginTop: 12,
  },
  deleteText: { fontSize: 14, fontWeight: FONTS.semibold, color: COLORS.white },
  profileAge: { fontSize: 13, color: COLORS.white, marginBottom: 8, marginTop: 4 },
});

export default ProfileScreen;