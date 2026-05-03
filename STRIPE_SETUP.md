# Stripe Payment Integration Setup Guide

## Overview
This guide helps you set up Stripe card payments for the Hospital Management App. The integration supports both card and cash payments.

## Prerequisites
- Stripe account (https://stripe.com)
- Test API keys from Stripe Dashboard

## Installation

### Backend Setup

#### 1. Install Stripe Package
```bash
cd backend
npm install stripe
```

#### 2. Environment Variables
Create/update `.env` file in the backend root:

```env
# Existing variables...
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# For production, use:
# STRIPE_SECRET_KEY=sk_live_your_live_secret_key
# STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
```

#### 3. Testing with Stripe Test Keys
Use these test card numbers when testing:
- **Successful Payment**: 4242 4242 4242 4242
- **Requires Authentication**: 4000 0025 0000 3155
- **Declined Card**: 4000 0000 0000 0002
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3-4 digit number

### Frontend Setup

#### 1. Update API Configuration
The frontend already has the Stripe payment endpoints configured in `paymentApi.js`:
- `createStripePaymentIntentApi()` - Creates a payment intent
- `confirmStripePaymentApi()` - Confirms payment after card processing

#### 2. For Production with Real Stripe UI
Install the official Stripe React Native SDK:

```bash
cd mobile-app
npm install @react-native-stripe/stripe-react-native
```

Then update the `CardForm` component in `PaymentFormScreen.js` to use the real Stripe card elements instead of custom inputs.

## How It Works

### Payment Flow

1. **User selects Card Payment**
   - User enters amount and selects "Card" as payment method

2. **Create Payment Intent** (Server)
   - Frontend calls `/payments/stripe/create-intent`
   - Backend creates Stripe PaymentIntent using amount
   - Returns `clientSecret` and `paymentIntentId`

3. **Process Card** (Client)
   - Mobile app collects card details
   - Uses Stripe SDK to tokenize the card securely
   - Never sends raw card data to your server

4. **Confirm Payment** (Server)
   - Frontend calls `/payments/stripe/confirm`
   - Backend confirms payment intent status
   - Updates payment record and appointment status

5. **Display Result**
   - Show success/failure to user
   - Navigate back to appointments

### Database Updates
The Payment model now stores Stripe-specific data:
- `stripePaymentIntentId` - Stripe's payment intent ID
- `stripeClientSecret` - Secret for client-side confirmation
- `stripePaymentMethodId` - Tokenized card reference
- `stripeChargeId` - Charge ID after successful payment
- `stripeStatus` - Current Stripe payment status

## API Endpoints

### Create Payment Intent
```
POST /api/payments/stripe/create-intent
Headers: { Authorization: Bearer <token> }
Body: {
  appointmentId: "appointment_id",
  amount: 2500
}

Response: {
  paymentId: "payment_id",
  paymentIntentId: "pi_xxx",
  clientSecret: "pi_xxx_secret_xxx",
  amount: 2500,
  currency: "lkr"
}
```

### Confirm Stripe Payment
```
POST /api/payments/stripe/confirm
Headers: { Authorization: Bearer <token> }
Body: {
  paymentId: "payment_id",
  paymentIntentId: "pi_xxx"
}

Response: {
  message: "Payment completed successfully",
  payment: { ... },
  status: "succeeded"
}
```

## Testing

### Test Card Payments
1. Open the app and navigate to Payments
2. Click on an approved appointment
3. Select "Credit / Debit Card" as payment method
4. Enter amount
5. Use test card: 4242 4242 4242 4242
6. Expiry: 12/25, CVV: 123
7. Click "Pay with Card"

### Verify in Stripe Dashboard
- Go to https://dashboard.stripe.com/test/payments
- See the test payment in your dashboard
- Check payment intent status

## Security Best Practices

1. **Never Log Card Data** - The Stripe SDK handles tokenization
2. **HTTPS Only** - Always use HTTPS in production
3. **PCI Compliance** - Using Stripe SDK ensures PCI compliance
4. **Webhook Verification** - Verify all webhook signatures

## Webhook Setup (Optional)

For production, set up webhook to handle payment events:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/stripe/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy signing secret and add to `.env` as `STRIPE_WEBHOOK_SECRET`

## Troubleshooting

### "Stripe API key not found"
- Check `.env` file has `STRIPE_SECRET_KEY`
- Restart backend server after adding env var

### "Payment intent failed"
- Check amount is positive number
- Verify appointment is in "approved" status
- Check test card is valid

### "Signature verification failed"
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook endpoint is receiving raw body, not parsed JSON

## Production Deployment

1. **Switch to Live Keys**
   - Get live API keys from Stripe Dashboard
   - Update `.env` with live keys
   - Ensure HTTPS is enabled

2. **Update Currency Settings**
   - Current setup uses LKR (Sri Lankan Rupee)
   - Change in `stripeService.js` line ~16 if needed

3. **Test Thoroughly**
   - Use real card with small amount
   - Verify payment appears in Stripe Dashboard
   - Check appointment payment status updates

## Additional Resources
- Stripe Documentation: https://stripe.com/docs
- React Native Stripe SDK: https://github.com/stripe/stripe-react-native
- Stripe Testing: https://stripe.com/docs/testing
