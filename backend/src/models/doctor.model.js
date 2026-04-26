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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
