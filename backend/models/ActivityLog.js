const mongoose = require('mongoose');
const { Schema } = mongoose;

const activityLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userType: { type: String, enum: ['admin', 'client', 'N/A'] },
    action: String,
    idAdress: String,
    country: String,
    actionId: String,
}, { timestamps: true });
  
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);  
module.exports = ActivityLog;