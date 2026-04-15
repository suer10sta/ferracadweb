const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
    target: { type: Schema.Types.ObjectId, ref: 'User' },
    title: String,
    type: String,
    description: String,
    link: String,
    readAt: Date,
}, { timestamps: true });
  
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;