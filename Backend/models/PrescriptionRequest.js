// models/PrescriptionRequest.js
const mongoose = require('mongoose');

const prescriptionRequestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String // Store image URLs
  }],
  status: {
    type: String,
    enum: ['pending', 'in_review', 'completed'],
    default: 'pending'
  },
  pharmacistNotes: {
    type: String
  },
  suggestedMedicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PrescriptionRequest', prescriptionRequestSchema);