const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationReadSchema = new Schema({
    notificationId: { type: Schema.Types.ObjectId, ref: 'Notification' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    readAt: Date,
});
  
const NotificationRead = mongoose.model('NotificationRead', notificationReadSchema);

module.exports = NotificationRead;