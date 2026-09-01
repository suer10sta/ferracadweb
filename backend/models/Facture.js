const mongoose = require('mongoose');
const { Schema } = mongoose;

const FactureSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userData: {
    name: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: false
    },
    company: {
      type: String,
      required: false
    },
    address: {
      type: String,
      required: false
    },
    country: {
      type: String,
      required: false
    },
    vatNumber: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    }
  },
  payId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  registrationIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Registration'
  }],
  factureId: {
    type: String,
    required: true
  },
  creditNoteId: {
    type: String,
    required: false
  },
  startFrom: {
    type: Date,
    required: true
  },
  endAt: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Facture', FactureSchema);
