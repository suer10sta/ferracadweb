const Registration = require('../models/Registration');
const mongoose = require('mongoose');
const { createAuthCode } = require("../services/auth");
const User = require('../models/User');
const sendEmail = require('../utils/sendMail');
const { createNotification } = require('../utils/notification');
const verifyTurnstile = require('../utils/verifyTurnstile');
const Rental = require('../models/Rental');
const geoip = require('geoip-lite');
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const LicenseHistory = require('../models/LicenseHistory');
const jwt = require('jsonwebtoken');
const { combineWithCurrentTime } = require('../utils/date');

const allowedFields = [
  'userId',
  'rentalId',
  'company',
  'username',
  'status',
  'computerName',
  'computerCode',
  'authCode',
  'expirationDate',
];

// Filtrage des champs autorisés
function buildRegistrationData(body) {
  const data = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }
  return data;
}

const generateInvitationId = (ip, email) => {
  const data = `${ip}-${email}-${Date.now()}`;
  return crypto.createHash("sha256").update(data).digest("hex").slice(0, 15).toUpperCase();
};

// Validation basique (ajouter si besoin validations spécifiques)
function validateRegistrationData(data) {
  return null;
}

// Create
exports.createRegistration = async (req, res) => {
  try {
    const filteredData = buildRegistrationData(req.body);
    const error = validateRegistrationData(filteredData);
    if (error) return res.status(400).json({ message: error });

    const registration = new Registration(filteredData);
    await registration.save();
    res.status(201).json(registration);
  } catch (err) {
    if (err.code === 11000) { // erreur de duplication unique (computerName/computerCode)
      return res.status(400).json({ message: 'Duplicate field value error', detail: err.keyValue });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error on create registration' });
  }
};

// Get all
exports.getAllRegistrations = async (req, res) => {
  try {
    let registrationsData;
    const roleUser = req.user.role;
    const userId = req.user.id;
    
    if(roleUser === "admin") {
      registrationsData = await Registration.find().sort({ updatedAt: -1 });
    } else {
      registrationsData = await Registration.find({ userId }).sort({ updatedAt: -1 });
    }

    res.json({ registrationsData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error on fetching registrations' });
  }
};

// Update
exports.updateRegistration = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid ID' });

    const { nameComputer, codeComputer, username, expirationDate, status } = req.body;
    if(!nameComputer || !codeComputer) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const registration = await Registration.findById(id)
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    let authCode;

    if(registration.computerCode !== codeComputer) {
      // regenerate auth code and send email
      const dateExp = combineWithCurrentTime(expirationDate ? new Date(expirationDate) : registration.expirationDate);
      authCode = await createAuthCode(codeComputer, dateExp);
      registration.authCode = authCode.data.code;

      const user = await User.findOne({ _id: registration.userId })
      const rental = await Rental.findById(registration.rentalId)
      const data = { computerName: nameComputer, username, rental };

      // send email
      await sendEmail({
        type: "auth-code",
        email: user.email,
        code: authCode.data.code,
        data,
        user
      });
    }

    if(req.user.role === "admin") {
      await createNotification({
        target: registration.userId,
        title: "Mise à jour de licence effectuée",
        type: "Licence",
        description: `Les informations de votre licence (${registration.computerName}) Ferracad ont été mises à jour avec succès par l'admin.`,
        link: "/tableau-de-board/locations"
      });
      
      if (expirationDate) registration.expirationDate = combineWithCurrentTime(expirationDate);
      if (status) registration.status = status;
    }

    registration.username = username;
    registration.computerName = nameComputer;
    registration.computerCode = codeComputer;
    await registration.save();

    res.status(200).json({ valid: true, registration });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate field value error', detail: err.keyValue });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error on update registration' });
  }
};

// Delete
exports.deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    // Check registration
    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Count registrations with the same rentalId
    const count = await Registration.countDocuments({ rentalId: registration.rentalId });

    if (count > 1) {
      // Multiple registrations → only delete this one
      await Registration.findByIdAndDelete(id);
    } else {
      // Only one registration → delete rental and registration
      await Rental.findByIdAndDelete(registration.rentalId);
      await Registration.findByIdAndDelete(id);
    }

    return res.status(200).json({ message: "Registration deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error on delete registration" });
  }
};

// get data from Ferracad plugin
exports.insertLicenseData = async (req, res) => {
  try {
    const { person, email, company, computer_name, computer_code } = req.body;

    // Vérifier que tous les champs sont remplis
    if (!company?.trim() || !computer_name?.trim() || !computer_code?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont obligatoires."
      });
    }

    // Vérifier si l'entreprise existe
    const user = await User.findOne({ company: company.trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Entreprise non trouvée."
      });
    }

    // Vérifier si l'inscription existe déjà pour ce computer_code
    let registration = await Registration.findOne({ computerCode: computer_code.trim() });

    if (!registration) {
      // Enregistrer l'inscription si elle n'existe pas
      registration = await Registration.create({
        userId: user._id,
        company,
        username: person,
        email,
        status: "inactive",
        computerName: computer_name,
        computerCode: computer_code
      });
    }

    // Retourner un message de succès (même si elle existait déjà)
    return res.status(200).json({
      success: true,
      message: "Les informations d'enregistrement ont été enregistrées avec succès."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur du serveur."
    });
  }
};

// get free trial
exports.freeTrialLicense = async (req, res) => {
  try {
    const { name, email, computer_code, computer_name, platform, token } = req.body;

    // 1. Validation des champs
    if (!name?.trim() || !email?.trim() || !computer_code?.trim() || !computer_name?.trim()) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    if (!platform || !['autocad', 'zwcad', 'both'].includes(platform)) {
      return res.status(400).json({ message: "Platform invalide." });
    }

    // 2. Vérification Captcha
    if (!token) return res.status(400).json({ message: "captcha" });
    const verify = await verifyTurnstile(token);
    if (!verify) return res.status(400).json({ message: "captcha" });

    // 3. Vérification de l'utilisateur et de l'Email Verified
    let user = await User.findOne({ email: email.trim() });
    
    if (!user || !user.isEmailVerified) {
      return res.status(403).json({ message: "Veuillez d'abord vérifier votre adresse e-mail." });
    }

    // 4. Protection anti-doublon (Licence déjà active ou essai déjà utilisé)
    // Check if user already has an active license or trial
    const existingRegistrationUser = await Registration.findOne({ 
      $or: [
        { email: email.trim() },
        { userId: user._id }
      ],
      status: { $in: ["active", "freetrial"] }
    });

    if (existingRegistrationUser) {
      return res.status(403).json({ 
        message: "Vous avez déjà une licence active. Connectez-vous à la plateforme.",
        exists: true 
      });
    }

    // Check if this computer has already been used for trial
    const existingRegistrationComp = await Registration.findOne({ computerCode: computer_code.trim() });
    if (existingRegistrationComp) {
      return res.status(409).json({ message: "Cet ordinateur a déjà été enregistré pour une licence (essai ou payante)." });
    }

    // 5. Préparation de l'utilisateur (Activation et Génération de mot de passe propre)
    // On génère un mot de passe temporaire lisible pour le mail final
    const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase(); 
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    user.password = hashedPassword;
    user.status = "active";
    user.name = name.trim();
    user.platform = platform;
    user.source = "registration";
    
    // Générer invitationId si manquant
    if (!user.invitationId) {
      const crypto = require("crypto");
      const data = `${req.realIp}-${user.email}-${Date.now()}`;
      user.invitationId = crypto.createHash("sha256").update(data).digest("hex").slice(0, 15).toUpperCase();
    }
    
    await user.save();

    // 6. Création de la Licence (Trial 30 jours)
    const dateExp = new Date();
    dateExp.setDate(dateExp.getDate() + 30);
    dateExp.setHours(23, 59, 59, 999);

    const authCodeData = await createAuthCode(computer_code, dateExp);
    const authCode = authCodeData.data.code;

    const rental = await Rental.create({
      userId: user._id,
      duration: 30,
      startDate: new Date(),
      price: 0,
      status: "active",
      nextBillingDate: dateExp
    });

    const registration = await Registration.create({
      userId: user._id,
      rentalId: rental._id,
      username: name.trim(),
      email: email.trim(),
      status: "freetrial",
      expirationDate: dateExp,
      computerName: computer_name.trim(),
      computerCode: computer_code.trim(),
      authCode: authCode
    });

    const licenseHistory = new LicenseHistory({
      registerId: registration._id,
      startAt: new Date(),
      expirationDate: dateExp
    });
  
    await licenseHistory.save();

    // 7. Envoi du Mail Unifié (Code + Identifiants)
    await sendEmail({
      type: "unified-trial-code",
      email: email.trim(),
      code: authCode,
      data: { tempPassword },
      user: user,
    });

    // Optionnel : Notifier l'admin
    const admin = await User.findOne({ mainAccount: true });
    if (admin?.factureMail) {
      await sendEmail({
        type: "auth-code", // On peut garder le template standard pour l'admin
        email: admin.email,
        code: authCode,
        data: { computerName: computer_name.trim(), username: name.trim(), rental },
        user
      });
    }

    res.status(200).json({ code: authCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur du serveur." });
  }
};

// Transférer licence
exports.transferLicence = async (req, res) => {
  try {
    const { registerId, userId } = req.params;

    if (!registerId || !userId) {
      return res.status(400).json({ message: "Paramètres manquants." });
    }

    // Check user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Check registration
    const register = await Registration.findById(registerId);
    if (!register) {
      return res.status(404).json({ message: "Licence introuvable." });
    }

    // Find all registrations linked to the same rental
    const listRegister = await Registration.find({
      rentalId: register.rentalId,
    });

    let rental;

    if (listRegister.length === 1) {
      // Only one licence → just update the rental owner
      rental = await Rental.findByIdAndUpdate(
        register.rentalId,
        { $set: { userId } },
        { new: true }
      );
    } else {
      // Multiple licences → create a new rental
      const oldRental = await Rental.findById(register.rentalId);
      if (!oldRental) {
        return res.status(404).json({ message: "Rental introuvable." });
      }

      rental = await Rental.create({
        userId,
        duration: oldRental.duration,
        status: oldRental.status,
        price: oldRental.price,
        startDate: oldRental.startDate,
        message: oldRental.message,
        deductionAuto: oldRental.deductionAuto,
        nextBillingDate: oldRental.nextBillingDate,
        subscriptionId: oldRental.subscriptionId,
      });
    }

    // Update the registration owner + rental reference
    await Registration.findByIdAndUpdate(registerId, {
      $set: {
        userId,
        rentalId: rental._id,
      },
    });

    return res.status(200).json({
      message: "Licence transférée avec succès.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur du serveur." });
  }
};
