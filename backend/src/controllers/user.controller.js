const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');

const emailRegex = /\S+@\S+\.\S+/;
const validateEmail = (email) => emailRegex.test(email);
const validatePhone = (phone) => /^\d{10}$/.test(phone);

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json(users);
});

exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const user = await User.findById(id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json(user);
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const {
    name,
    email,
    phone,
    birthday,
    address,
    profileImage,
  } = req.body;

  const updates = {};

  if (name !== undefined) {
    updates.name = name.trim();
  }

  if (email !== undefined) {
    const trimmedEmail = email.toLowerCase().trim();
    if (!validateEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser && existingUser._id.toString() !== id) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    updates.email = trimmedEmail;
  }

  if (phone !== undefined) {
    const trimmedPhone = phone.trim();
    if (trimmedPhone && !validatePhone(trimmedPhone)) {
      return res.status(400).json({
        message: 'Phone number must be exactly 10 digits and contain only numbers.',
      });
    }
    updates.phone = trimmedPhone;
  }

  if (birthday !== undefined) {
    if (birthday) {
      const birthDate = new Date(birthday);
      if (Number.isNaN(birthDate.getTime())) {
        return res.status(400).json({ message: 'Birthday must be a valid date (YYYY-MM-DD)' });
      }
      updates.birthday = birthDate;
    } else {
      updates.birthday = undefined;
    }
  }

  if (address !== undefined) {
    updates.address = address;
  }

  if (profileImage !== undefined) {
    updates.profileImage = profileImage;
  }

  const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json(user);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  await user.remove();
  res.status(200).json({ message: 'User deleted successfully' });
});
