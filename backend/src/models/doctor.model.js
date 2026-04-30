const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    availabilityStatus: { type: Boolean, default: true },
    image: { type: String },
    description: { type: String },
    consultationFee: { type: Number },
    availabilityStartTime: { type: String, default: '09:00' }, // Format: HH:MM (e.g., "09:00")
    availabilityEndTime: { type: String, default: '17:00' },   // Format: HH:MM (e.g., "17:00")
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
