const mongoose = require('mongoose');
const { Schema } = mongoose;

const settingsSchema = new Schema({
  mainColor: String,
  secondColor: String,
  socialMedia: { type: Map, of: String },
  seoTitle: { type: Map, of: String },        // e.g., { en: "Title", fr: "Titre" }
  seoDescription: { type: Map, of: String },  // e.g., { en: "Description", fr: "Description" }
  seoTags: { type: Map, of: [String] },       // e.g., { en: ["tag1"], fr: ["motclé"] }
  licenseThresholdForDiscount: Number,
  siteStatus: { type: String, enum: ['active', 'maintenance'], default: 'active' },
  updatedAt: Date,
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
