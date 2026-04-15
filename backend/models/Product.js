const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: String,
    version: String,
    filePath: String,
    isPublic: { type: Boolean, default: true },
    validVersion: { type: Boolean, default: true },
    platform: { type: String, enum: ['autocad', 'zwcad', 'revit'] },
    versionPlatformCompatible: String,
    size: String,
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);  

module.exports = Product;