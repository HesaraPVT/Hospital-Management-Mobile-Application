# Payment Integration Fix Guide

## Problem
The payment confirmation is failing with "Payment failed" error because:
1. Mobile app collects card details but doesn't send them to Stripe
2. Payment intent is created but never confirmed with a payment method
3. Backend tries to confirm a payment intent that's still in `requires_payment_method` state

## Current Flow (Broken)
```
Mobile App:
1. Collect card details (cardNumber, expiry, CVV)
2. Create payment intent
3. Try to confirm payment intent (WITHOUT card)
❌ Backend: Payment intent has no payment method attached
```

## Required Fix

### Option 1: Use Stripe React Native SDK (Recommended for Production)

#### Step 1: Install Stripe SDK
```bash
cd mobile-app
npm install @stripe/stripe-react-native
```

#### Step 2: Update PaymentFormScreen.js
Replace the `handlePayWithCard` function with:

```javascript
import { useStripe } from '@stripe/stripe-react-native';

const PaymentFormScreen = ({ route, navigation }) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  
  const handlePayWithCard = async () => {
    if (!validateCardData()) return;

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create payment intent on backend
      const intentRes = await createStripePaymentIntentApi({
        appointmentId,
        amount: parsedAmount,
      });

      const { clientSecret } = intentRes.data;

      // Step 2: Initialize payment sheet with client secret
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Hospital Management',
      });

      if (error) {
        Alert.alert('Error', error.message);
        setLoading(false);
        return;
      }

      // Step 3: Present payment sheet to user
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        Alert.alert('Payment Failed', presentError.message);
      } else {
        // Payment succeeded, confirm on backend
        const confirmRes = await confirmStripePaymentApi({
          paymentId: intentRes.data.paymentId,
          paymentIntentId: intentRes.data.paymentIntentId,
        });

        Alert.alert('Payment Successful', 'Your payment has been processed.', [
          { text: 'Done', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };
};
```

### Option 2: Send Card Details to Backend (Test/Dev Only)

#### Update PaymentFormScreen.js
```javascript
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

    // Step 2: Send card details to backend for confirmation
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
    } else {
      Alert.alert('Payment Processing', `Status: ${confirmRes.data.status}`);
    }
  } catch (error) {
    Alert.alert('Payment Failed', error.response?.data?.message || 'Please try again.');
  } finally {
    setLoading(false);
  }
};
```

#### Update payment.controller.js
Add this import at the top:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

Update the `confirmStripePayment` function:
```javascript
exports.confirmStripePayment = asyncHandler(async (req, res) => {
  const { paymentId, paymentIntentId, cardNumber, expiryDate, cvv } = req.body;

  if (!paymentId || !paymentIntentId) {
    return res.status(400).json({ message: 'paymentId and paymentIntentId are required' });
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  if (req.user.role !== 'admin' && payment.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    let paymentIntent;

    // If card details provided, confirm with payment method
    if (cardNumber && expiryDate && cvv) {
      const [month, year] = expiryDate.split('/');
      
      // Create payment method from card
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardNumber,
          exp_month: parseInt(month),
          exp_year: parseInt('20' + year),
          cvc: cvv,
        },
      });

      // Confirm intent with payment method
      paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethod.id,
      });
    } else {
      // Just retrieve current status
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    }

    // Update payment record with Stripe status
    payment.stripeStatus = paymentIntent.status;

    if (paymentIntent.status === 'succeeded') {
      payment.status = 'completed';
      payment.stripeChargeId = paymentIntent.charges?.data?.[0]?.id;
      payment.transactionReference = paymentIntentId;
      await payment.save();

      const appointment = await Appointment.findById(payment.appointmentId);
      if (appointment) {
        appointment.paymentStatus = 'paid';
        await appointment.save();
      }

      res.status(200).json({
        message: 'Payment completed successfully',
        payment,
        status: 'succeeded',
      });
    } else if (paymentIntent.status === 'requires_action') {
      await payment.save();
      res.status(200).json({
        message: 'Payment requires additional action',
        status: 'requires_action',
        clientSecret: paymentIntent.client_secret,
      });
    } else {
      payment.status = 'failed';
      await payment.save();
      res.status(400).json({
        message: 'Payment failed',
        status: paymentIntent.status,
        details: paymentIntent.last_payment_error?.message || 'Unknown error',
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      message: 'Failed to confirm payment',
      error: error.message,
      details: error.code || 'Unknown error code',
    });
  }
});
```

## Testing with Stripe Test Cards

Use these card numbers in test mode:
- **4242 4242 4242 4242** - Successful payment
- **4000 0000 0000 0002** - Card declined
- **4000 0025 0000 3155** - Requires 3D Secure

Any future expiry date (MM/YY) and any 3-digit CVC will work in test mode.

### Important: Date Format
- Format: **MM/YY** (e.g., 08/29 for August 2029)
- Must be a FUTURE date (after today)
- Current date: May 3, 2026
- Valid examples: 06/26, 12/30, 08/29

### Troubleshooting "Card Declined" Error

1. **Check Backend Logs:**
   - Stop your backend server (Ctrl+C)
   - Run: `npm start`
   - Look for these lines when you attempt payment:
     ```
     Creating payment method - Card: ••••4242, Exp: 8/2029
     Payment method created: pm_xxxxxxxxxxxx
     ```

2. **Verify Card Details:**
   - Card: **4242 4242 4242 4242** (16 digits, no spaces)
   - Expiry: **08/29** or any future date (MM/YY format)
   - CVV: **123** or any 3-4 digits

3. **Check STRIPE_SECRET_KEY:**
   - Open `.env` in backend folder
   - Verify `STRIPE_SECRET_KEY` is set and starts with `sk_test_`
   - Not `sk_live_` (live keys won't work with test cards)

4. **Test Card Status:**
   - If you see "card_declined" error, it means:
     - Stripe successfully processed it but declined it (test behavior)
     - Try the **4242 4242 4242 4242** card instead
     - Avoid using 4000 0000 0000 0002 (that one is designed to decline)

## Recommended Implementation Path

1. **Short-term (Dev/Test):** Use Option 2 with test cards
2. **Long-term (Production):** Implement Option 1 with Stripe SDK for security

---

**Note:** Never send real card details from client to backend in production. Always use Stripe SDK or tokens.
