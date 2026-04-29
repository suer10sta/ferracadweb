const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    company: String,
    password: String,
    photoProfile: String,
    nTva: String,
    phone: String,
    address: String,
    postal: String,
    city: String,
    country: String,
    iban: String,
    basedPrice: { type: String, default: '5' },
    role: { type: String, enum: ['admin', 'client'], default: 'client' },
    status: { type: String, default: "active" },
    twoFac: { type: Boolean, default: false },
    lastLogin: Date,
    invitationId: String,
    factureMail: String,
    mainAccount: Boolean,
    platform: { type: String, enum: ['autocad', 'zwcad', 'both', '-'], default: '-' },
    ipAdresse: String,
    source: String,
    verificationCode: String,
    verificationCodeExpires: Date,
    isEmailVerified: { type: Boolean, default: false },
    clientType: { type: String, enum: ['individual', 'company', 'professional'], default: 'individual' },
    isVatSubject: { type: Boolean, default: false }
}, { timestamps: true });
  
const User = mongoose.model('User', userSchema);

module.exports = User;