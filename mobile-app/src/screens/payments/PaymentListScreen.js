import React, { useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getPaymentsApi } from '../../api/paymentApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW, statusColor } from '../../theme';

const PaymentCard = ({ item }) => {
  const sc = statusColor(item.status);
  return (
    <View style={styles.card}>
      <View style={[styles.methodBadge, { backgroundColor: item.paymentMethod === 'card' ? COLORS.tealFaint : '#fff7ed' }]}>
        <Text style={styles.methodEmoji}>{item.paymentMethod === 'card' ? '💳' : '💵'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.amount}>LKR {item.amount?.toLocaleString()}</Text>
        <Text style={styles.method}>{item.paymentMethod === 'card' ? 'Card Payment' : 'Cash Payment'}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
        <Text style={[styles.statusText, { color: sc.text }]}>
          {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
        </Text>
      </View>
    </View>
  );
};

const PaymentListScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPaymentsApi();
      setPayments(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [fetchPayments])
  );

  if (loading) return <LoadingSpinner message="Loading payments..." />;

  return (
    <View style={styles.root}>
      <ScreenHeader title="Payment History" subtitle={`${payments.length} transactions`} />
      <FlatList
        data={payments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState message="No payments found" subtitle="Your payment history will appear here" />}
        renderItem={({ item }) => <PaymentCard item={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  list: { paddingTop: 12, paddingHorizontal: 16, paddingBottom: 30 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: 14, marginVertical: 5, ...SHADOW.card, gap: 12,
  },
  methodBadge: {
    width: 46, height: 46, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  methodEmoji: { fontSize: 22 },
  info: { flex: 1 },
  amount: { fontSize: 16, fontWeight: FONTS.bold, color: COLORS.navyDeep },
  method: { fontSize: 12, fontWeight: FONTS.regular, color: COLORS.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText: { fontSize: 11, fontWeight: FONTS.bold },
});

export default PaymentListScreen;