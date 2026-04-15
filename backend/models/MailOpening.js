const mongoose = require('mongoose');
const { Schema } = mongoose;

const mailOpeningSchema = new Schema({
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
  
const MailOpening = mongoose.model('MailOpening', mailOpeningSchema);

module.exports = MailOpening;