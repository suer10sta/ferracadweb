const mongoose = require('mongoose');
const { Schema } = mongoose;

const faqSchema = new Schema({
    question: String,
    answer: String,
    category: String,
    lang: String,
    isItPrincipale: { type: Boolean, default: false },
    isDraft: { type: Boolean, default: true },
}, { timestamps: true });
  
const Faq = mongoose.model('Faq', faqSchema);

module.exports = Faq;