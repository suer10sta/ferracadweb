const multer = require('multer');
const path = require('path');
const Facture = require('../models/Facture');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: async (req, file, cb) => {
    const baseName = file.originalname || Date.now().toString().slice(-6);
    cb(null, baseName);
  }
});

const upload = multer({ storage });

module.exports = upload;