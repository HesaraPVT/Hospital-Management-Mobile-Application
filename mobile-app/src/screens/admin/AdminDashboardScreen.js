import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Platform, Alert, Modal } from 'react-native';
import { getUsersApi, createUserApi } from '../../api/userApi';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const ADMIN_CARDS = [
  { key: 'DoctorForm', label: 'Add Doctor', sub: 'Register new specialist', color: COLORS.tealFaint, accent: COLORS.tealBright },
  { key: 'ServiceForm', label: 'Add Service', sub: 'Create a new service', color: '#e6f7f0', accent: COLORS.success },
  { key: 'Reports', label: 'View Reports', sub: 'Browse all reports', color: '#fff7ed', accent: COLORS.warning },
  { key: 'ReportGenerate', label: 'Generate Report', sub: 'Create custom report', color: '#fef2f2', accent: COLORS.danger },
  { key: 'Appointments', label: 'Appointments', sub: 'Manage bookings', color: COLORS.tealFaint, accent: COLORS.tealStrong },
  { key: 'Complaints', label: 'Complaints', sub: 'Handle complaints', color: '#fff7ed', accent: COLORS.warning },
];

const AdminCard = ({ item, onPress }) => (
  <TouchableOpacity
    style={[styles.card, { backgroundColor: COLORS.white }]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={[styles.cardAccentBar, { backgroundColor: item.accent }]} />
    <View style={styles.cardBody}>
      <Text style={styles.cardLabel}>{item.label}</Text>
      <Text style={styles.cardSub}>{item.sub}</Text>
    </View>
    <View style={[styles.cardIcon, { backgroundColor: item.color }]}>
      <View style={[styles.arrowR, { borderColor: item.accent }]} />
    </View>
  </TouchableOpacity>
);

const AdminDashboardScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsersApi();
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      Alert.alert('Missing Fields', 'Name, email, and password are required.');
      return;
    }
    if (!validateEmail(newUser.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (newUser.password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setCreating(true);
    try {
      await createUserApi(newUser);
      Alert.alert('Success', 'User created successfully');
      setModalVisible(false);
      setNewUser({ name: '', email: '', password: '', role: 'patient' });
      fetchUsers(); // Refresh list
    } catch (error) {
      Alert.alert('Failed', error.response?.data?.message || 'Could not create user');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDeep} />

      <View style={styles.hero}>
        <View style={styles.circle1} /><View style={styles.circle2} />
        <Text style={styles.heroEst}>MEDILINK</Text>
        <Text style={styles.heroTitle}>Admin Dashboard</Text>
        <View style={styles.accentBar} />
        <Text style={styles.heroSub}>Manage hospital operations</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        {ADMIN_CARDS.map((item) => (
          <AdminCard key={item.key} item={item} onPress={() => navigation.navigate(item.key)} />
        ))}

        <View style={styles.userSectionHeader}>
          <Text style={styles.sectionLabel}>REGISTERED USERS</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addUserBtnSmall}>
            <Text style={styles.addUserBtnSmallText}>+ Add User</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <LoadingSpinner message="Loading users..." />
        ) : (
          users.map((u) => (
            <View key={u._id} style={styles.userListItem}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>{u.name?.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{u.name}</Text>
                <Text style={styles.userEmail}>{u.email}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: u.role === 'admin' ? COLORS.danger : u.role === 'doctor' ? COLORS.tealStrong : COLORS.bgMuted }]}>
                <Text style={[styles.roleBadgeText, { color: u.role === 'patient' ? COLORS.textMuted : COLORS.white }]}>{u.role}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create User Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New User</Text>
              <CustomInput label="Full Name" value={newUser.name} onChangeText={(t) => setNewUser({ ...newUser, name: t })} />
              <CustomInput label="Email" value={newUser.email} onChangeText={(t) => setNewUser({ ...newUser, email: t })} keyboardType="email-address" />
              <CustomInput label="Password" value={newUser.password} onChangeText={(t) => setNewUser({ ...newUser, password: t })} hasPasswordToggle helperText="Minimum 6 characters" />

              <Text style={styles.label}>Role</Text>
              <View style={styles.roleSelector}>
                {['patient', 'doctor', 'admin'].map((r) => (
                  <TouchableOpacity key={r} style={[styles.roleOption, newUser.role === r && styles.roleOptionActive]} onPress={() => setNewUser({ ...newUser, role: r })}>
                    <Text style={[styles.roleOptionText, newUser.role === r && styles.roleOptionTextActive]}>{r.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <CustomButton title={creating ? "Creating..." : "Create User"} onPress={handleCreateUser} style={{ flex: 1, marginTop: 0 }} />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  hero: {
    backgroundColor: COLORS.navyMid,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  circle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.04)', top: -50, right: -60 },
  circle2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -30 },
  heroEst: { fontSize: 9, letterSpacing: 2.2, color: 'rgba(255,255,255,0.45)', marginBottom: 8 },
  heroTitle: { fontSize: 26, fontWeight: FONTS.bold, color: COLORS.white },
  accentBar: { width: 40, height: 3, backgroundColor: COLORS.tealLight, borderRadius: 2, marginVertical: 10 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20, paddingBottom: 40 },

  userSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionLabel: { fontSize: 10, fontWeight: FONTS.bold, color: COLORS.tealBright, letterSpacing: 2, marginLeft: 4 },

  addUserBtnSmall: { backgroundColor: COLORS.tealFaint, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.md },
  addUserBtnSmallText: { fontSize: 12, fontWeight: FONTS.bold, color: COLORS.tealStrong },

  card: {
    flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, marginVertical: 5, overflow: 'hidden', ...SHADOW.card,
  },
  cardAccentBar: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: 16 },
  cardLabel: { fontSize: 15, fontWeight: FONTS.bold, color: COLORS.navyDeep },
  cardSub: { fontSize: 12, fontWeight: FONTS.regular, color: COLORS.textMuted, marginTop: 2 },
  cardIcon: { width: 40, height: 40, borderRadius: RADIUS.md, marginRight: 14, alignItems: 'center', justifyContent: 'center' },
  arrowR: { width: 8, height: 8, borderRightWidth: 2, borderTopWidth: 2, transform: [{ rotate: '45deg' }] },

  userListItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    padding: 12, borderRadius: RADIUS.lg, marginBottom: 8, ...SHADOW.card,
  },
  userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.navyDeep, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  userAvatarText: { color: COLORS.white, fontWeight: FONTS.bold, fontSize: 16 },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: FONTS.bold, color: COLORS.navyDeep },
  userEmail: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm },
  roleBadgeText: { fontSize: 10, fontWeight: FONTS.bold, textTransform: 'uppercase' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: FONTS.bold, color: COLORS.navyDeep, marginBottom: 16 },

  label: { fontSize: 11, fontWeight: FONTS.semibold, color: COLORS.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, marginTop: 4 },
  roleSelector: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  roleOption: { flex: 1, borderWidth: 1.5, borderColor: COLORS.divider, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.md },
  roleOptionActive: { borderColor: COLORS.tealStrong, backgroundColor: COLORS.tealFaint },
  roleOptionText: { fontSize: 12, fontWeight: FONTS.semibold, color: COLORS.textMuted },
  roleOptionTextActive: { color: COLORS.tealStrong },

  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.divider, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.lg, paddingVertical: 14 },
  cancelBtnText: { fontSize: 14, fontWeight: FONTS.bold, color: COLORS.navyDeep },
});

export default AdminDashboardScreen;