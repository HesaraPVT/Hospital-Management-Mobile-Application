import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity,
} from 'react-native';
import { createPaymentApi } from '../../api/paymentApi';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const PAYMENT_METHODS = [
  { key: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { key: 'cash', label: 'Cash Payment', icon: '💵' },
];

const PaymentFormScreen = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }
    setLoading(true);
    try {
      await createPaymentApi({ appointmentId, amount: parsedAmount, paymentMethod });
      Alert.alert('Payment Successful', 'Your payment has been processed successfully.', [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Payment Failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Processing payment..." />;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Make Payment"
        subtitle="Secure hospital payment portal"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Secure badge */}
        <View style={styles.secureBanner}>
          <Text style={styles.secureBannerIcon}>🔒</Text>
          <Text style={styles.secureBannerText}>256-bit SSL encrypted · HIPAA compliant</Text>
        </View>

        {/* Amount */}
        <Text style={styles.sectionLabel}>PAYMENT AMOUNT</Text>
        <View style={styles.formCard}>
          <CustomInput
            label="Amount (LKR)"
            value={amount}
            onChangeText={setAmount}
            placeholder="e.g. 2500"
            keyboardType="numeric"
          />
        </View>

        {/* Method selector */}
        <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
        <View style={styles.methodsCard}>
          {PAYMENT_METHODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[styles.methodItem, paymentMethod === m.key && styles.methodItemSelected]}
              onPress={() => setPaymentMethod(m.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.methodEmoji}>{m.icon}</Text>
              <Text style={[styles.methodLabel, paymentMethod === m.key && styles.methodLabelSelected]}>
                {m.label}
              </Text>
              <View style={[styles.radio, paymentMethod === m.key && styles.radioSelected]}>
                {paymentMethod === m.key ? <View style={styles.radioDot} /> : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <CustomButton title={`Pay with ${paymentMethod === 'card' ? 'Card' : 'Cash'}`} onPress={handlePay} style={styles.payBtn} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 10, fontWeight: FONTS.bold, color: COLORS.tealBright, letterSpacing: 2, marginBottom: 10, marginLeft: 4, marginTop: 4 },

  secureBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.tealFaint, borderRadius: RADIUS.lg,
    padding: 14, marginBottom: 20,
  },
  secureBannerIcon: { fontSize: 18 },
  secureBannerText: { fontSize: 12, color: COLORS.tealStrong, fontWeight: FONTS.medium },

  formCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 16, ...SHADOW.card,
  },
  methodsCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    overflow: 'hidden', marginBottom: 20, ...SHADOW.card,
  },
  methodItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  methodItemSelected: { backgroundColor: COLORS.tealFaint },
  methodEmoji: { fontSize: 22 },
  methodLabel: { flex: 1, fontSize: 14, color: COLORS.textSecondary, fontWeight: FONTS.medium },
  methodLabelSelected: { color: COLORS.tealStrong, fontWeight: FONTS.bold },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.tealPale,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: COLORS.tealStrong },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.tealStrong },
  payBtn: { marginTop: 4 },
});

export default PaymentFormScreen;