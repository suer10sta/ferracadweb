const mongoose = require('mongoose');
const { Schema } = mongoose;

const registrationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', require: false },
    rentalId: { type: Schema.Types.ObjectId, ref: 'Rental', require: false },
    company: String,
    username: String,
    status: String,
    email: { type: String },
    computerName: { type: String },
    computerCode: { type: String, unique: true },
    authCode: String,
    expirationDate: Date,
}, { timestamps: true });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;