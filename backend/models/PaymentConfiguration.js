const mongoose = require('mongoose');
const { Schema } = mongoose;
const { encrypt, decrypt } = require('../utils/encryption'); // path to your utils

const paymentConfigSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['cart', 'paypal'], required: true },
    email: {
      type: String,
      set: encrypt,
      get: decrypt,
    },
    numberCart: {
      type: String,
      set: encrypt,
      get: decrypt,
    },
    dateExp: {
      type: String,
      set: encrypt,
      get: decrypt,
    },
    cvc: {
      type: String,
      set: encrypt,
      get: decrypt,
    },
    nameCart: {
      type: String,
      set: encrypt,
      get: decrypt,
    },
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

const PaymentConfiguration = mongoose.model('PaymentConfiguration', paymentConfigSchema);

module.exports = PaymentConfiguration;
