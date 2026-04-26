const Payment = require('../models/payment.model');
const Appointment = require('../models/appointment.model');
const asyncHandler = require('../utils/asyncHandler');

exports.createPayment = asyncHandler(async (req, res) => {
  const { appointmentId, amount, paymentMethod, transactionReference, status } = req.body;

  if (!appointmentId || amount === undefined || !paymentMethod) {
    return res.status(400).json({ message: 'appointmentId, amount, and paymentMethod are required' });
  }

  const parsedAmount = Number(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  if (req.user.role !== 'admin' && appointment.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (appointment.status !== 'approved') {
    return res.status(400).json({ message: 'Payment can be made only for approved appointments' });
  }

  // Prevent multiple payments for the same appointment.
  const existing = await Payment.findOne({ appointmentId });
  if (existing && existing.status !== 'failed') {
    return res.status(409).json({ message: 'Payment already exists for this appointment' });
  }

  const normalizedStatus = status || 'completed';
  const payment = await Payment.create({
    userId: req.user._id,
    appointmentId,
    amount: parsedAmount,
    paymentMethod,
    transactionReference,
    status: normalizedStatus,
  });

  if (normalizedStatus === 'completed') {
    appointment.paymentStatus = 'paid';
    await appointment.save();
  }

  res.status(201).json(payment);
});

exports.getPayments = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
  const payments = await Payment.find(filter)
    .populate('appointmentId')
    .populate('userId', '-password');
  res.status(200).json(payments);
});

exports.getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('appointmentId')
    .populate('userId', '-password');

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  if (req.user.role !== 'admin' && payment.userId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  res.status(200).json(payment);
});

exports.updatePayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { appointmentId, amount, paymentMethod, status, transactionReference } = req.body;

  const payment = await Payment.findById(id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });

  if (req.user.role !== 'admin' && payment.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (appointmentId !== undefined) payment.appointmentId = appointmentId;

  if (amount !== undefined) {
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    payment.amount = parsedAmount;
  }

  if (paymentMethod !== undefined) payment.paymentMethod = paymentMethod;
  if (status !== undefined) payment.status = status;
  if (transactionReference !== undefined) payment.transactionReference = transactionReference;

  await payment.save();

  // Keep appointment.paymentStatus in sync for completed payments.
  if (payment.status === 'completed') {
    const appointment = await Appointment.findById(payment.appointmentId);
    if (appointment) {
      appointment.paymentStatus = 'paid';
      await appointment.save();
    }
  }

  res.status(200).json(payment);
});

exports.deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  if (req.user.role !== 'admin' && payment.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await payment.remove();
  res.status(200).json({ message: 'Payment deleted successfully' });
});
