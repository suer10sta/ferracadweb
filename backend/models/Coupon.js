const mongoose = require('mongoose');
const { Schema } = mongoose;

const couponSchema = new Schema({
    type: { type: String, enum: ['fix', 'percent'] },
    validateFrom: Date,
    validateTo: Date,
    value: String,
    maxUse: Number,
    totalUse: { type: Number, default: 0 },
}, { timestamps: true });
  
const Coupon = mongoose.model('Coupon', couponSchema);
  
module.exports = Coupon;