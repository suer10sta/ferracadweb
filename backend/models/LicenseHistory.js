const mongoose = require('mongoose');
const { Schema } = mongoose;

const licenseHistorySchema = new Schema({
    registerId: { type: Schema.Types.ObjectId, ref: 'Registration' },
    startAt: Date,
    expirationDate: Date,
});
  
const LicenseHistory = mongoose.model('LicenseHistory', licenseHistorySchema);

module.exports = LicenseHistory;