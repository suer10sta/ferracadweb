const Settings = require('../models/Settings');
const { validationResult } = require('express-validator');

// Get settings (singleton)
exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        res.status(200).json({ settings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update settings (singleton)
exports.updateSettings = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
  
    const {
      mainColor,
      secondColor,
      socialMedia,
      seoTitle,
      seoDescription,
      seoTags,
      licenseThresholdForDiscount,
      type,
      value
    } = req.body;
  
    const allowedTypes = ['statut', 'licenses remise', 'social media', 'seo'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'invalide.' });
    }
  
    let updateData = {};
    
    switch (type) {
      case 'statut':
        if (!value || !['active', 'maintenance'].includes(value)) {
          return res.status(400).json({ message: 'Statut de site invalide.' });
        }
        updateData.siteStatus = value;
        break;
  
      case 'social media':
        if (
          typeof socialMedia !== 'object' ||
          socialMedia === null ||
          Array.isArray(socialMedia)
        ) {
          return res.status(400).json({ message: 'Social media invalide.' });
        }
        updateData.socialMedia = socialMedia;
        break;
  
      case 'licenses remise':
        if (
          typeof licenseThresholdForDiscount !== 'number' ||
          licenseThresholdForDiscount < 0
        ) {
          return res.status(400).json({
            message: 'Seuil de remise invalide (doit être un nombre positif).',
          });
        }
        updateData.licenseThresholdForDiscount = licenseThresholdForDiscount;
        break;
  
        case 'seo': {
          // Validate seoTitle and seoDescription as objects
          if (
            !seoTitle || typeof seoTitle !== 'object' ||
            !seoDescription || typeof seoDescription !== 'object'
          ) {
            return res.status(400).json({ message: 'Champs SEO invalides.' });
          }
        
          // Optional: validate each language inside the object
          const isValidTitle = Object.values(seoTitle).every(
            (val) => typeof val === 'string' && val.trim().length > 0
          );
        
          const isValidDescription = Object.values(seoDescription).every(
            (val) => typeof val === 'string' && val.trim().length > 0
          );
        
          if (!isValidTitle || !isValidDescription) {
            return res.status(400).json({ message: 'Champs SEO invalides pour certaines langues.' });
          }
        
          // Handle seoTags (object of arrays)
          if (seoTags && typeof seoTags === 'object') {
            // Ensure each language has an array of tags
            Object.keys(seoTags).forEach((lang) => {
              if (!Array.isArray(seoTags[lang])) {
                seoTags[lang] = [];
              }
            });
          } else {
            seoTags = {};
          }
        
          updateData.seoTitle = seoTitle;
          updateData.seoDescription = seoDescription;
          updateData.seoTags = seoTags;
          break;
        }
        
  
      default:
        return res.status(400).json({ message: 'Requête invalide.' });
    }
  
    // Add/update timestamp
    updateData.updatedAt = new Date();
  
    try {
      const settings = await Settings.findOneAndUpdate({}, updateData, {
        new: true,
        upsert: true,
      });
  
      res.status(200).json({ message: 'Paramètres mis à jour.', data: settings });
    } catch (err) {
      console.error('Update settings error:', err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
};
  