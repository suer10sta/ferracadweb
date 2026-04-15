const mongoose = require('mongoose');
const { Schema } = mongoose;

const newsletterSchema = new Schema({
    email: { type: String, unique: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    unsubscribeDate: Date,
}, { timestamps: true });
  
const Newsletter = mongoose.model('Newsletter', newsletterSchema);

module.exports = Newsletter;