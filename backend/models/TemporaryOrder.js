// models/TemporaryOrder.js
const mongoose = require('mongoose');

const temporaryOrderSchema = new mongoose.Schema({
  paymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  formData: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ['pending_3ds', 'completed', 'failed'],
    default: 'pending_3ds'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Supprime automatiquement après 1 heure
  }
});

module.exports = mongoose.model('TemporaryOrder', temporaryOrderSchema);