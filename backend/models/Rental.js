const mongoose = require('mongoose');
const { Schema } = mongoose;

const rentalSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    payId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    duration: Number,
    price: Number,
    startDate: Date,
    message: String,
    status: { type: String, enum: ['pending', 'active', 'expire', 'inactive', 'freetrial'], default: 'pending' },
    deductionAuto: { type: Boolean, default: false },
    nextBillingDate: Date,
    subscriptionId: String,
}, { timestamps: true });
  
const Rental = mongoose.model('Rental', rentalSchema);

module.exports = Rental;