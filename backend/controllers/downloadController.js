const Download = require('../models/Download');

// READ ALL
exports.getAllDownloads = async (req, res) => {
  try {
    const downloads = await Download.find().sort({ createdAt: -1 }).populate('userId').populate('productId');
    res.status(200).json({ downloads });
  } catch (error) {
    console.error('Get All Downloads Error:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};