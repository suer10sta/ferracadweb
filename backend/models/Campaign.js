const mongoose = require('mongoose');
const { Schema } = mongoose;

const campaignSchema = new Schema({
    type: {
      type: String,
      enum: ['newsletter', 'newsletter_noaccount', 'expirationUsers', 'activeUsers', 'non-subscription users']
    },
    subject: String,
    content: String,
    totalSenders: Number,
    status: String,
}, { timestamps: true });
  
const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;