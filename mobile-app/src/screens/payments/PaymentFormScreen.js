import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity,
} from 'react-native';
import { createPaymentApi, createStripePaymentIntentApi, confirmStripePaymentApi } from '../../api/paymentApi';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const PAYMENT_METHODS = [
  { key: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { key: 'cash', label: 'Cash Payment', icon: '💵' },
];

const CardForm = ({ onCardChange }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleCardNumberChange = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
    onCardChange({ cardNumber: cleaned, expiryDate, cvv });
  };

  const handleExpiryChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    setExpiryDate(formatted);
    onCardChange({ cardNumber: cardNumber.replace(/\s/g, ''), expiryDate: formatted, cvv });
  };

  const handleCvvChange = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    setCvv(cleaned);
    onCardChange({ cardNumber: cardNumber.replace(/\s/g, ''), expiryDate, cvv: cleaned });
  };

  return (
    <View style={styles.cardFormContainer}>
      <View style={styles.cardPreview}>
        <View style={styles.cardGradient} />
        <View style={styles.cardContent}>
          <Text style={styles.cardLabel}>Card Number</Text>
          <Text style={styles.cardNumber}>{cardNumber || '•••• •••• •••• ••••'}</Text>
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardSmallLabel}>Card Holder</Text>
              <Text style={styles.cardSmallValue}>Your Name</Text>
            </View>
            <View>
              <Text style={styles.cardSmallLabel}>Expires</Text>
              <Text style={styles.cardSmallValue}>{expiryDate || 'MM/YY'}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.formSection}>
        <CustomInput
          label="Card Number"
          value={cardNumber}
          onChangeText={handleCardNumberChange}
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
          maxLength={19}
        />

        <View style={styles.twoColumnRow}>
          <CustomInput
            label="Expiry Date"
            value={expiryDate}
            onChangeText={handleExpiryChange}
            placeholder="MM/YY"
            keyboardType="numeric"
            maxLength={5}
            containerStyle={styles.halfInput}
          />
          <CustomInput
            label="CVV"
            value={cvv}
            onChangeText={handleCvvChange}
            placeholder="123"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            containerStyle={styles.halfInput}
          />
        </View>
      </View>
    </View>
  );
};

const PaymentFormScreen = ({ route, navigation }) => {
  const { appointmentId, amount: prefilledAmount, serviceName } = route.params;
  const [amount, setAmount] = useState(prefilledAmount ? String(prefilledAmount) : '');
  const isAmountLocked = prefilledAmount !== undefined && prefilledAmount !== null;
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({ cardNumber: '', expiryDate: '', cvv: '' });

  const validateCardData = () => {
    if (!cardData.cardNumber || cardData.cardNumber.length < 13) {
      Alert.alert('Invalid Card', 'Please enter a valid card number');
      return false;
    }
    if (!cardData.expiryDate || cardData.expiryDate.length < 5) {
      Alert.alert('Invalid Expiry', 'Please enter expiry date (MM/YY)');
      return false;
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      Alert.alert('Invalid CVV', 'Please enter a valid CVV');
      return false;
    }
    return true;
  };

  const handlePayWithCard = async () => {
    if (!validateCardData()) return;

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create payment intent
      const intentRes = await createStripePaymentIntentApi({
        appointmentId,
        amount: parsedAmount,
      });

      const { paymentId, paymentIntentId, clientSecret } = intentRes.data;

      // Step 2: Send card details with payment confirmation
      const confirmRes = await confirmStripePaymentApi({
        paymentId,
        paymentIntentId,
        cardNumber: cardData.cardNumber,
        expiryDate: cardData.expiryDate,
        cvv: cardData.cvv,
      });

      if (confirmRes.data.status === 'succeeded') {
        Alert.alert('Payment Successful', 'Your payment has been processed successfully.', [
          { text: 'Done', onPress: () => navigation.goBack() },
        ]);
      } else if (confirmRes.data.status === 'requires_action') {
        Alert.alert('Verification Required', 'Please complete the additional verification step.', [
          { text: 'Retry', onPress: () => handlePayWithCard() },
          { text: 'Cancel', onPress: () => { } },
        ]);
      } else {
        Alert.alert('Payment Processing', `Status: ${confirmRes.data.status || 'processing'}`);
      }
    } catch (error) {
      Alert.alert('Payment Failed', error.response?.data?.message || error.response?.data?.details || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithCash = async () => {
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }
    setLoading(true);
    try {
      await createPaymentApi({
        appointmentId,
        amount: parsedAmount,
        paymentMethod: 'cash',
        status: 'pending',
      });
      Alert.alert('Payment Recorded', 'Cash payment has been recorded. Please pay at the hospital.', [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to process payment.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    if (paymentMethod === 'card') {
      handlePayWithCard();
    } else {
      handlePayWithCash();
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

        {/* Service + amount summary */}
        {isAmountLocked ? (
          <View style={styles.summaryBanner}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryLabel}>SERVICE</Text>
              <Text style={styles.summaryService} numberOfLines={1}>{serviceName || 'Hospital Service'}</Text>
            </View>
            <View style={styles.summaryRight}>
              <Text style={styles.summaryLabel}>AMOUNT DUE</Text>
              <Text style={styles.summaryAmount}>LKR {Number(amount).toLocaleString()}</Text>
            </View>
          </View>
        ) : null}

        {/* Amount — only shown if not pre-filled */}
        {!isAmountLocked ? (
          <>
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
          </>
        ) : null}

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

        {/* Card form for card payments */}
        {paymentMethod === 'card' && (
          <>
            <Text style={styles.sectionLabel}>CARD DETAILS</Text>
            <CardForm onCardChange={setCardData} />
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                🧪 Test Mode — Use test card:{'\n'}
                Card: 4242 4242 4242 4242{'\n'}
                Expiry: any future date (e.g. 12/28) · CVV: any 3 digits
              </Text>
            </View>
          </>
        )}

        {paymentMethod === 'cash' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Please make the payment at the hospital reception desk. Your appointment will be confirmed upon payment.</Text>
          </View>
        )}

        <CustomButton
          title={`Pay with ${paymentMethod === 'card' ? 'Card' : 'Cash'}`}
          onPress={handlePay}
          style={styles.payBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  secureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: RADIUS.lg,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  secureBannerIcon: { fontSize: 20, marginRight: 10 },
  secureBannerText: { flex: 1, fontSize: 12, color: COLORS.success, fontWeight: FONTS.semibold },

  sectionLabel: { fontSize: 10, fontWeight: FONTS.bold, color: COLORS.tealBright, letterSpacing: 2, marginBottom: 12, marginTop: 20 },

  formCard: { marginBottom: 20, ...SHADOW.card },

  methodsCard: { marginBottom: 20 },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.divider,
    padding: 14,
    marginVertical: 5,
    ...SHADOW.card,
  },
  methodItemSelected: { borderColor: COLORS.tealStrong, backgroundColor: COLORS.tealFaint },
  methodEmoji: { fontSize: 24 },
  methodLabel: { flex: 1, fontSize: 14, fontWeight: FONTS.semibold, color: COLORS.navyDeep },
  methodLabelSelected: { color: COLORS.tealStrong },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.tealPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: COLORS.tealStrong, backgroundColor: COLORS.tealFaint },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.tealStrong },

  cardFormContainer: { marginBottom: 20 },
  cardPreview: {
    height: 200,
    backgroundColor: 'linear-gradient(135deg, #0D7F6F 0%, #00BFA5 100%)',
    borderRadius: RADIUS.lg,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOW.card,
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0D7F6F',
  },
  cardContent: { position: 'relative', zIndex: 1, height: '100%', justifyContent: 'space-between' },
  cardLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  cardNumber: { fontSize: 18, fontWeight: FONTS.bold, color: COLORS.white, marginVertical: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardSmallLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
  cardSmallValue: { fontSize: 13, fontWeight: FONTS.semibold, color: COLORS.white, marginTop: 2 },

  formSection: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 14, ...SHADOW.card },
  twoColumnRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  halfInput: { flex: 1 },

  infoBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: RADIUS.lg,
    padding: 14,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  infoText: { fontSize: 12, color: '#E65100', fontWeight: FONTS.regular, lineHeight: 18 },

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

  /* Service summary banner */
  summaryBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 20,
    ...SHADOW.card,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.tealStrong,
    gap: 10,
  },
  summaryLeft: { flex: 1 },
  summaryRight: { alignItems: 'flex-end' },
  summaryLabel: {
    fontSize: 9,
    fontWeight: FONTS.bold,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  summaryService: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.navyDeep,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: FONTS.bold,
    color: COLORS.tealStrong,
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
  payBtn: { marginTop: 10, marginBottom: 40 },
});

export default PaymentFormScreen;