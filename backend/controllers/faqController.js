const Faq = require('../models/Faq');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Create FAQ
exports.createFaq = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { id } = req.user;
        const userData = await User.findById(id);
        if(!userData) {
            return res.status(400).json({ message: "Utilisateur non fourni." });
        }

        if(userData.role !== "admin") {
            return res.status(401).json({ message: "Accès non autorisé. Droits administrateur requis." });
        }

        const { question, answer, isItPrincipale, isDraft, category, lang } = req.body;

        if(!question || !answer || !lang || !category) {
          return res.status(400).json({ message: "" })
        }

        const faqData = {
            question,
            answer,
            isItPrincipale: isItPrincipale ?? false,
            isDraft: isDraft ?? false,
            category,
            lang,
        };

        const faq = new Faq(faqData);
        await faq.save();

        res.status(201).json({ message: 'FAQ created', data: faq });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all FAQs
exports.getAllFaqs = async (req, res) => {
    try {
        const faqs = await Faq.find().sort({ createdAt: -1 });
        res.status(200).json({ faqs });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update FAQ
exports.updateFaq = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
  
    const { id } = req.params;
    const {
      question,
      answer,
      isItPrincipale,
      isDraft,
      category,
      isDraftChange,
      lang
    } = req.body;
    try {
      // Handle isDraftChange toggle separately
      if (isDraftChange !== null) {
        const faq = await Faq.findByIdAndUpdate(
          id,
          { isDraft: isDraftChange },
          { new: true }
        );
        if (!faq)
          return res.status(404).json({ message: 'FAQ not found' });
  
        return res.status(200).json({ message: 'Draft status updated', data: faq });
      }
  
      // Validate required fields for full update
      if(!question || !answer || !lang || !category) {
        return res.status(400).json({ message: 'Informations nécessaires non incluses' });
      }
      console.log(lang)
      const updateData = {
        question,
        answer,
        category,
        isItPrincipale,
        isDraft,
        lang
      };
  
      const faq = await Faq.findByIdAndUpdate(id, updateData, { new: true });
  
      if (!faq)
        return res.status(404).json({ message: 'FAQ not found' });
  
      return res
        .status(200)
        .json({ message: 'FAQ updated', data: faq });
  
    } catch (err) {
      console.error("FAQ update error:", err);
      return res
        .status(500)
        .json({ message: 'Server error', error: err.message });
    }
}; 

// Delete FAQ
exports.deleteFaq = async (req, res) => {
    try {
        const faq = await Faq.findByIdAndDelete(req.params.id);
        if (!faq) return res.status(404).json({ message: 'FAQ not found' });

        res.status(200).json({ message: 'FAQ deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};