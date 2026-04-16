const User = require("../models/User");
const bcrypt = require("bcrypt");
const Facture = require("../models/Facture");
const PaymentConfiguration = require("../models/PaymentConfiguration");
const Payment = require("../models/Payment");
const Registration = require("../models/Registration");
const Rental = require("../models/Rental");
const LicenseHistory = require("../models/LicenseHistory");
const path = require("path");
const fs = require("fs");
const sendEmail = require("../utils/sendMail");
const crypto = require("crypto");

const generateInvitationId = (ip, email) => {
  const data = `${ip}-${email}-${Date.now()}`;
  return crypto.createHash("sha256").update(data).digest("hex").slice(0, 15).toUpperCase();
};

exports.getUsers = async (req, res) => {
    try {
        if(req.user.role !== "admin") {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const users = await User.find().sort({ createdAt: -1 });
        return res.status(200).json({ users });
    } catch (error) {
        console.error('User Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.getUser = async (req, res) => {
    try {
        const id = req.user.id;

        const user = await User.findById(id).select('-password');

        if (!user) {
          return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error('User Error:', error);
        if (err.code === 11000) {
          return res.status(409).json({
            message: 'Un enregistrement avec cette valeur existe déjà.',
            field: Object.keys(err.keyValue)[0],
            value: err.keyValue[Object.keys(err.keyValue)[0]],
          });
        }
        res.status(500).json({ error: 'Server error' });
    }
}

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    
    // Delete related data (adapt these queries to your models)
    await Facture.deleteMany({ userId: id });
    await PaymentConfiguration.deleteMany({ userId: id });
    await Payment.deleteMany({ userId: id });
    
    const registrations = await Registration.find({ userId: id })
    for(const registration in registrations) {
      await LicenseHistory.deleteMany({ registerId: registration._id });
    }

    await Registration.deleteMany({ userId: id });
    await Rental.deleteMany({ userId: id });
  
    return res.status(200).json({ message: "Utilisateur supprimé avec succès." });

  } catch (error) {
    console.error('User Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.createUser = async (req, res) => {
  try {
      const {
        name,
        email,
        password,
        country,
        company,
        phone,
        postal,
        city,
        address,
        basedPrice,
        role,
        platform
      } = req.body;

      const roleUser = req.user.role;
      if (basedPrice && roleUser !== 'admin' && role === "client") {
        return res.status(401).json({ message: "Seuls les administrateurs peuvent définir le prix de base" });
      }

      if(roleUser === 'admin' && !basedPrice && role === "client") {
        return res.status(400).json({ message: "Tous les champs sont obligatoires." });
      }

      if(!name || !email || !password || !country) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires." });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Adresse e-mail invalide." });
      }

      if(password.length < 8) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Un compte avec cet email existe déjà." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const invitationId = generateInvitationId(req.realIp, email);

      const newUser = await User.create({
          name,
          email,
          password: hashedPassword,
          country,
          company,
          phone,
          postal,
          city,
          address,
          source: "Formulaire de l'admin",
          invitationId,
          role: roleUser === 'admin' ? role : "client",
          ...(roleUser === 'admin' && { basedPrice }),
          ipAdresse: req.realIp,
          ...(platform && { platform })
      });

      res.status(201).json({
          message: "Inscription réussie.",
          user: {
              id: newUser._id,
          },
      });

  } catch (error) {
      console.error('Auth Error:', error);
      if (error.code === 11000) {
        return res.status(409).json({
          message: 'Un enregistrement avec cette valeur existe déjà.',
          field: Object.keys(error.keyValue)[0],
          value: error.keyValue[Object.keys(error.keyValue)[0]],
        });
      }
      res.status(500).json({ message: 'Server error' });
  }
}

exports.updateUser = async (req, res) => {
  try {
    const {
      idUser,
      name,
      email,
      country,
      company,
      phone,
      postal,
      city,
      address,
      nTva,
      basedPrice,
      iban,
      factureMail,
      role,
      platform
    } = req.body;

    const roleUser = req.user.role;
    if (basedPrice && roleUser !== 'admin') {
      return res.status(401).json({ message: "Seuls les administrateurs peuvent définir le prix de base" });
    }

    if(!name || !email || !country) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Adresse e-mail invalide." });
    }

    const userId = idUser || req.user.id

    if (email) {
      const existingUser = await User.findOne({
        email: email,
         _id: { $ne: userId }  // $ne = not equal
      });

      if (existingUser) {
         return res.status(409).json({
           message: "Un compte avec cet email existe déjà."
        });
      }
    }
    
    const newData = {
      name,
      email,
      country,
      company,
      phone,
      postal,
      city,
      address,
      nTva,
      ...(roleUser === 'admin' && { factureMail }),
      ...(roleUser === 'admin' && { basedPrice }),
      ...(roleUser === 'admin' && { iban }),
      ...(roleUser === 'admin' && { role }),
      ...(platform && { platform })
    };    

    const updateUser = await User.findByIdAndUpdate(
      userId, 
      newData,
      { new: true }
    )

    if (!updateUser) return res.status(404).json({ message: "Un compte avec cet email n'existe pas." });
    
    res.status(200).json({
      message: "Informations mises à jour avec succès.",
      user: {
        id: updateUser._id,
      },
    });

  } catch (error) {
    console.error('Auth Error:', error);
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Un enregistrement avec cette valeur existe déjà.',
        field: Object.keys(err.keyValue)[0],
        value: err.keyValue[Object.keys(err.keyValue)[0]],
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
}

exports.uploadPhotoProfile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Aucun fichier téléchargé" });
    }

    // Check file size (< 1 MB)
    if (file.size > 1024 * 1024) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: "L'image doit être inférieure à 1 Mo" });
    }

    // Prepare target directory
    const targetDir = path.join(__dirname, "../uploads/profile");
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Generate new file name & final path
    const newFileName = `profile_${Date.now()}${path.extname(file.originalname)}`;
    const newPath = path.join(targetDir, newFileName);

    // Move file from temp to final directory
    fs.renameSync(file.path, newPath);

    // Find current user
    const user = await User.findById(req.user.id);
    if (!user) {
      // Clean up uploaded file if user not found
      fs.unlinkSync(newPath);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // If user already has a photo, delete the old file
    if (user.photoProfile) {
      const oldPhotoPath = path.join(targetDir, user.photoProfile);
      if (fs.existsSync(oldPhotoPath)) {
        try {
          fs.unlinkSync(oldPhotoPath);
          console.log(`Deleted old photo: ${oldPhotoPath}`);
        } catch (err) {
          console.warn("Failed to delete old photo:", err.message);
        }
      }
    }

    // Update user record with new photo
    user.photoProfile = newFileName;
    await user.save();

    res.status(200).json({
      message: "Photo téléchargée avec succès !",
      fileName: newFileName,
    });
  } catch (error) {
    console.error("Error in uploadPhotoProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendInvId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { emails, invitationId } = req.body;

    // check user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    for(const email of emails) {
      await sendEmail({
        type: "send-invitation",
        email,
        code: invitationId,
        data: {},
        user,
      })
    }

    return res.status(200).json({ message: "Invitations envoyées avec succès !" })
  } catch (error) {
    console.error("Error in: ", error);
    res.status(500).json({ message: "Server error" });
  }
}

exports.getAdmin = async (req, res) => {
  try {
    const admin = await User.findOne(
      { role: "admin", mainAccount: true },
      {
        _id: 1,
        company: 1,
        phone: 1,
        country: 1,
        address: 1,
        nTva: 1,
        iban: 1
      }
    ).select("-password");

    res.status(200).json({ admin });
  } catch (error) {
    console.error("Error in getAdmin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUserByAdmin = async (req, res) => {
  try {
    // Only admins are allowed to update another user's billing information
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "Accès non autorisé." });
    }

    const { name, tva, country, company, adresse } = req.body;

    // Basic required-field validation
    if (!name || !country || !adresse) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ message: "Identifiant utilisateur manquant." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Map admin form fields to User model fields
    user.name = name;
    user.company = company;
    user.address = adresse;
    user.country = country;
    user.nTva = tva;

    await user.save();

    return res.status(200).json({
      message: "Informations mises à jour avec succès.",
      user: {
        id: user._id,
      },
    });
  } catch (error) {
    console.error("Error in updateUserByAdmin:", error);
    return res.status(500).json({ message: "Server error" });
  }
};