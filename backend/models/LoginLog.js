const mongoose = require('mongoose');
const { Schema } = mongoose;

const loginLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    ip: String,
}, { timestamps: { createdAt: true, updatedAt: false } });
  
const LoginLog = mongoose.model('LoginLog', loginLogSchema);

module.exports = LoginLog;