const mongoose = require('mongoose');
const { Schema } = mongoose;

const downloadSchema = new Schema({
    ip: String,
    country: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
}, { timestamps: true });
  
const Download = mongoose.model('Download', downloadSchema);

module.exports = Download;