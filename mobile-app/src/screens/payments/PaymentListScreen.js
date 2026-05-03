import React, { useState, useCallback, useContext } from 'react';
import {
  View, FlatList, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { getPaymentsApi, approveCashPaymentApi } from '../../api/paymentApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW, statusColor } from '../../theme';

/* ─────────────────────────────────────────────────────────────
   Helper: small info row inside a card
───────────────────────────────────────────────────────────── */
const InfoRow = ({ icon, label, value, valueColor }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

/* ─────────────────────────────────────────────────────────────
   Payment Card
───────────────────────────────────────────────────────────── */
const PaymentCard = ({ item, isAdmin, onApprove, approving }) => {
  const sc = statusColor(item.status);
  const isCash = item.paymentMethod === 'cash';
  const isPendingCash = isCash && item.status === 'pending';

  const userName = item.userId?.name || 'Unknown User';
  const userEmail = item.userId?.email || '—';

  return (
    <View style={styles.card}>
      {/* ── Top row: icon + amount + status badge ── */}
      <View style={styles.cardHeader}>
        <View style={[styles.methodBadge, { backgroundColor: isCash ? '#FFF7ED' : COLORS.tealFaint }]}>
          <Text style={styles.methodEmoji}>{isCash ? '💵' : '💳'}</Text>
        </View>

        <View style={styles.headerMid}>
          <Text style={styles.amountText}>LKR {item.amount?.toLocaleString()}</Text>
          <Text style={styles.methodLabel}>{isCash ? 'Cash Payment' : 'Card Payment'}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.text }]}>
            {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
          </Text>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Detail rows ── */}
      <View style={styles.detailsBlock}>
        <InfoRow
          icon="💰"
          label="Amount"
          value={`LKR ${item.amount?.toLocaleString()}`}
          valueColor={COLORS.tealStrong}
        />
        <InfoRow
          icon={isCash ? '💵' : '💳'}
          label="Method"
          value={isCash ? 'Cash' : 'Card'}
        />
        <InfoRow
          icon="📋"
          label="Status"
          value={item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
          valueColor={sc.text}
        />

        {/* Admin-only: user info */}
        {isAdmin && (
          <>
            <View style={styles.userSeparator} />
            <InfoRow icon="👤" label="Patient" value={userName} />
            <InfoRow icon="✉️" label="Email" value={userEmail} />
          </>
        )}

        {/* Date */}
        {item.createdAt && (
          <InfoRow
            icon="📅"
            label="Date"
            value={new Date(item.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          />
        )}
      </View>

      {/* ── Admin: Approve Cash button ── */}
      {isAdmin && isPendingCash && (
        <TouchableOpacity
          style={[styles.approveBtn, approving && styles.approveBtnDisabled]}
          onPress={() => onApprove(item._id)}
          disabled={approving}
          activeOpacity={0.8}
        >
          {approving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.approveBtnText}>✓  Approve Cash Payment</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Pending cash info for user */}
      {!isAdmin && isPendingCash && (
        <View style={styles.pendingNote}>
          <Text style={styles.pendingNoteText}>
            ⏳  Awaiting admin approval after cash is received at the hospital
          </Text>
        </View>
      )}
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────
   Screen
───────────────────────────────────────────────────────────── */
const PaymentListScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const isAdmin = userInfo?.role === 'admin';

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPaymentsApi();
      setPayments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [fetchPayments])
  );

  const handleApproveCash = useCallback((paymentId) => {
    Alert.alert(
      'Approve Cash Payment',
      'Confirm that cash has been received from the patient?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setApprovingId(paymentId);
            try {
              await approveCashPaymentApi(paymentId);
              Alert.alert('✓ Approved', 'Cash payment has been marked as completed.');
              fetchPayments();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to approve payment.');
            } finally {
              setApprovingId(null);
            }
          },
        },
      ]
    );
  }, [fetchPayments]);

  if (loading) return <LoadingSpinner message="Loading payments…" />;

  const pendingCashCount = payments.filter(
    (p) => p.paymentMethod === 'cash' && p.status === 'pending'
  ).length;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Payment History"
        subtitle={`${payments.length} transaction${payments.length !== 1 ? 's' : ''}${isAdmin && pendingCashCount > 0 ? ` · ${pendingCashCount} awaiting approval` : ''}`}
      />

      <FlatList
        data={payments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            message="No payments found"
            subtitle="Your payment history will appear here"
          />
        }
        renderItem={({ item }) => (
          <PaymentCard
            item={item}
            isAdmin={isAdmin}
            onApprove={handleApproveCash}
            approving={approvingId === item._id}
          />
        )}
      />
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────
   Styles
───────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  list: { paddingTop: 14, paddingHorizontal: 16, paddingBottom: 34 },

  /* Card */
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginVertical: 6,
    overflow: 'hidden',
    ...SHADOW.card,
  },

  /* Header row */
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  methodBadge: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodEmoji: { fontSize: 22 },
  headerMid: { flex: 1 },
  amountText: {
    fontSize: 17,
    fontWeight: FONTS.bold,
    color: COLORS.navyDeep,
  },
  methodLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: FONTS.regular,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: FONTS.bold,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 14,
  },

  /* Detail rows */
  detailsBlock: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoIcon: { fontSize: 13, width: 20, textAlign: 'center' },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: FONTS.medium,
    width: 60,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: FONTS.semibold,
    textAlign: 'right',
  },

  /* User separator */
  userSeparator: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 4,
  },

  /* Approve button */
  approveBtn: {
    backgroundColor: COLORS.tealStrong,
    marginHorizontal: 14,
    marginBottom: 14,
    borderRadius: RADIUS.lg,
    paddingVertical: 11,
    alignItems: 'center',
    ...SHADOW.btn,
  },
  approveBtnDisabled: {
    opacity: 0.6,
  },
  approveBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: FONTS.bold,
    letterSpacing: 0.3,
  },

  /* Pending note */
  pendingNote: {
    backgroundColor: '#FFF7ED',
    marginHorizontal: 14,
    marginBottom: 14,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pendingNoteText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: FONTS.medium,
    lineHeight: 16,
  },
});

export default PaymentListScreen;