const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
    operatorId: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    type: { type: String, enum: ['cart', 'paypal', 'cash', 'stripe', 'free'] },
    status: { type: String, enum: ['success', 'unsuccess'] },
    totalPricePay: Number,
    paymentConfigId: String,
    currency: String,
    tva: String,
    stripePayId: String,
}, { timestamps: true });
  
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;