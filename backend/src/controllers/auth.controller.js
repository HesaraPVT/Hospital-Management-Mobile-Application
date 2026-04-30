const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

const emailRegex = /\S+@\S+\.\S+/;
const validateEmail = (email) => emailRegex.test(email);
const validatePassword = (password) => typeof password === 'string' && password.length >= 6;
const validatePhone = (phone) => /^\d{10}$/.test(phone);

const formatUserResponse = (user, token) => ({
  token,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  birthday: user.birthday,
  age: user.age,
  address: user.address,
  profileImage: user.profileImage,
});

exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, birthday } = req.body;
  const trimmedName = name?.trim();
  const trimmedEmail = email?.toLowerCase().trim();
  const trimmedPhone = phone?.trim();

  if (!trimmedName || !trimmedEmail || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (!validateEmail(trimmedEmail)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  if (trimmedPhone && !validatePhone(trimmedPhone)) {
    return res.status(400).json({
      message: 'Phone number must be exactly 10 digits and contain only numbers.',
    });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters long.',
    });
  }

  if (birthday) {
    const birthDate = new Date(birthday);
    if (Number.isNaN(birthDate.getTime())) {
      return res.status(400).json({ message: 'Birthday must be a valid date (YYYY-MM-DD)' });
    }
  }

  const existingUser = await User.findOne({ email: trimmedEmail });
  if (existingUser) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let role = 'patient';
  const adminExists = await User.exists({ role: 'admin' });
  if (!adminExists) role = 'admin';

  const user = await User.create({
    name: trimmedName,
    email: trimmedEmail,
    password: hashedPassword,
    role,
    phone: trimmedPhone,
    birthday,
  });

  const token = generateToken(user._id);

  res.status(201).json(formatUserResponse(user, token));
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = email?.toLowerCase().trim();

  if (!trimmedEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!validateEmail(trimmedEmail)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  const user = await User.findOne({ email: trimmedEmail });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user._id);

  res.status(200).json(formatUserResponse(user, token));
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  res.status(200).json(user);
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      message: 'New password must be at least 6 characters long.',
    });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
  await user.save();

  res.status(200).json({ message: 'Password changed successfully' });
});
