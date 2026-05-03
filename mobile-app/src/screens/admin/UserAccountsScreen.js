import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUsersApi } from '../../api/userApi';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const allowedRoles = new Set(['patient', 'doctor', 'admin']);

const UserAccountsScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsersApi();
      setUsers(res.data || []);
    } catch (error) {
      console.error('Failed to load user accounts', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await getUsersApi();
      setUsers(res.data || []);
    } catch (error) {
      console.error('Failed to refresh user accounts', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const visibleUsers = users.filter((user) => allowedRoles.has(user.role));

  const roleCounts = visibleUsers.reduce((acc, user) => {
    const role = user.role || 'unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const AccountItem = ({ user }) => (
    <View style={[styles.card, SHADOW.card]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(user.name || user.email || '?').charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{user.name || 'Unnamed user'}</Text>
        <Text style={styles.meta} numberOfLines={1}>{user.email}</Text>
        <Text style={styles.meta}>Role: {user.role || 'unknown'} • Created {formatDate(user.createdAt)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <ScreenHeader title="User Accounts" subtitle={`${visibleUsers.length} account${visibleUsers.length === 1 ? '' : 's'}`} onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.tealBright]} />}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Account Summary</Text>
          <Text style={styles.summaryCount}>{visibleUsers.length}</Text>
          <Text style={styles.summaryCaption}>Total created accounts</Text>
          <View style={styles.chipsRow}>
            {Object.entries(roleCounts).map(([role, count]) => (
              <View key={role} style={styles.chip}>
                <Text style={styles.chipText}>{role}: {count}</Text>
              </View>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.tealBright} />
            <Text style={styles.loadingText}>Loading accounts...</Text>
          </View>
        ) : visibleUsers.length > 0 ? (
          visibleUsers.map((user) => <AccountItem key={user._id} user={user} />)
        ) : (
          <EmptyState message="No accounts found" subtitle="User accounts will appear here after registration" />
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
    ...SHADOW.card,
  },
  summaryTitle: { fontSize: 11, fontWeight: FONTS.bold, letterSpacing: 2, color: COLORS.tealBright, marginBottom: 8 },
  summaryCount: { fontSize: 30, fontWeight: FONTS.bold, color: COLORS.navyDeep },
  summaryCaption: { fontSize: 13, color: COLORS.textMuted, marginTop: 2, marginBottom: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: COLORS.tealFaint, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { color: COLORS.tealStrong, fontSize: 12, fontWeight: FONTS.semibold },
  loadingWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  loadingText: { marginTop: 10, color: COLORS.textMuted, fontSize: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.tealFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: COLORS.tealBright, fontWeight: '700' },
  body: { flex: 1 },
  name: { fontSize: 15, fontWeight: FONTS.bold, color: COLORS.navyDeep },
  meta: { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
  backButton: {
    marginTop: 6,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: { color: COLORS.tealBright, fontWeight: '700' },
});

export default UserAccountsScreen;