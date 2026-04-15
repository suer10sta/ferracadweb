const LicenseHistory = require('../models/LicenseHistory');
const mongoose = require('mongoose');

const allowedFields = ['registerId', 'startAt', 'expirationDate'];

function buildLicenseHistoryData(body) {
  const data = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }
  return data;
}

function validateLicenseHistoryData(data) {
  // Ici tu peux ajouter des validations personnalisées si nécessaire
  return null;
}

// Create
exports.createLicenseHistory = async (req, res) => {
  try {
    const filteredData = buildLicenseHistoryData(req.body);
    const error = validateLicenseHistoryData(filteredData);
    if (error) return res.status(400).json({ message: error });

    const licenseHistory = new LicenseHistory(filteredData);
    await licenseHistory.save();
    res.status(201).json(licenseHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la création' });
  }
};

// Get all
exports.getAllLicenseHistories = async (req, res) => {
  try {
    let historiesData;
    const roleUser = req.user.role;
    const userId = req.user.id;
    
    if(roleUser === "admin") {
      historiesData = await LicenseHistory.find().sort({ startAt: -1 });
    } else {
      historiesData = await LicenseHistory.find().sort({ startAt: -1 });
    }

    res.json({ historiesData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération' });
  }
};

// Get by ID
exports.getLicenseHistoryById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'ID invalide' });

    const history = await LicenseHistory.findById(req.params.id);
    if (!history) return res.status(404).json({ message: 'Historique non trouvé' });

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération' });
  }
};

// Update
exports.updateLicenseHistory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'ID invalide' });

    const filteredData = buildLicenseHistoryData(req.body);
    const error = validateLicenseHistoryData(filteredData);
    if (error) return res.status(400).json({ message: error });

    const updated = await LicenseHistory.findByIdAndUpdate(req.params.id, filteredData, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: 'Historique non trouvé' });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour' });
  }
};

// Delete
exports.deleteLicenseHistory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'ID invalide' });

    const deleted = await LicenseHistory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Historique non trouvé' });

    res.json({ message: 'Historique supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
};
