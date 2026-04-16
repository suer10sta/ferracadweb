// Load environment variables
require('dotenv').config();

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');
const path = require("path")
const Download = require('../models/Download');
const Product = require('../models/Product');
const geoip = require('geoip-lite');
const addActivityLog = require("../utils/addActivityLog");
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const sendEmail = require('../utils/sendMail');
const crypto = require("crypto");
const Registration = require('../models/Registration');
const fs = require('fs');

const productValidation = [
  body('name').isString().trim().notEmpty(),
  body('version').isString().trim().notEmpty(),
  body('isPublic').optional().isBoolean(),
  body('oldPath').optional().isString(),
  body('visible').optional().isBoolean(),
  body('validVersion').optional().isBoolean(),
  body('platform').isIn(['autocad', 'zwcad', 'revit']),
  body('versionPlatformCompatible').optional().isString().trim(),
];

const generateInvitationId = (ip, email) => {
  const data = `${ip}-${email}-${Date.now()}`;
  return crypto.createHash("sha256").update(data).digest("hex").slice(0, 15).toUpperCase();
};

// Create with file upload
router.post(
  '/',
  auth,
  upload.single('file'),
  productValidation,
  productController.createProduct
);

router.get('/download/:filename', auth, async (req, res) => {
  const filePath = "uploads\\" + req.params.filename;
  const getFile = await Product.findOne({ filePath: filePath });
  const geo = geoip.lookup(req.realIp);

  const newDownload = {
    userId: req.user.id,
    productId: getFile?._id,
    country: geo?.country || "Auter",
    ip: req.realIp
  };

  const country = geo?.country || "Auter";

  await addActivityLog({
    userId: req.user.id,
    userType: req.user.role,
    action: "DOWNLOAD",
    actionId: getFile._id,
    idAdress: req.realIp,
    country
  });

  await Download.create(newDownload);
  const file = path.join(__dirname, '../uploads', req.params.filename);
  res.download(file);
});

router.put('/unknown/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { userName: name, userEmail: email, userCompany } = req.body;
    console.log(filename);
    // Validation des entrées
    if (!filename) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    // Protection contre les path traversal
    const safeFilename = path.normalize(filename).replace(/^(\.\.(\/|\\|$))+/, '');
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadsDir, safeFilename);

    // Vérifier que le fichier existe et est dans le dossier autorisé
    if (!filePath.startsWith(uploadsDir)) {
      return res.status(400).json({ error: 'Chemin de fichier invalide' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    // Recherche du produit
    // const normalizedFilePath = "uploads\\" + safeFilename;
    // const getFile = await Product.findOne({ filePath: normalizedFilePath });
    const getFile = await Product.findOne({
      filePath: { $in: [`uploads\\${safeFilename}`, `uploads/${safeFilename}`] }
    });
    if (!getFile) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    const geo = geoip.lookup(req.realIp);
    const country = geo?.country || "Auter";
    const invitationId = generateInvitationId(req.realIp, email);

    let userId;
    const token = req.cookies?.token;

    // Gestion utilisateur avec moins de duplication
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "JFEY475YFH29NNCKDAS012328DHFN4"
        );
        const user = await User.findById(decoded.id);
        if (user) {
          userId = decoded.id;
        }
      } catch (jwtError) {
        // Token invalide, on continue comme nouvel utilisateur
        console.warn('Token JWT invalide:', jwtError.message);
      }
    }

    if (!userId) {
      // On cherche EXCLUSIVEMENT dans la collection User
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      
      if (user) {
        userId = user._id;
      } else {
        // Créer un nouvel utilisateur en mode "pending"
        const password = `${name.replace(/\s/g, '')}1234`;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userInsert = await User.create({
          email: email.trim(),
          platform: getFile.platform,
          name: name.trim(),
          status: "pending",
          role: "client",
          source: "Formulaire de téléchargement",
          country,
          password: hashedPassword,
          invitationId,
          company: userCompany,
          ipAdresse: req.realIp,
        });

        userId = userInsert._id;
      }

      // Envoyer systématiquement le mail d'instructions de téléchargement
      sendEmail({
        type: "download-instructions",
        email: email.trim(),
        code: "",
        data: {},
        user: { name: name.trim() },
      }).catch(emailError => {
        console.error('Erreur d\'envoi d\'email:', emailError);
      });
    }

    // Création du log de téléchargement
    const newDownload = {
      productId: getFile._id,
      country,
      ip: req.realIp,
      userId,
    };

    // Exécuter les logs en parallèle
    await Promise.all([
      Download.create(newDownload),
      addActivityLog({
        userType: req?.user?.role || "N/A",
        action: "DOWNLOAD",
        actionId: getFile._id,
        idAdress: req.realIp,
        ...(userId && { userId }),
        country
      })
    ]);

    // 7. Envoyer le fichier avec headers appropriés
    const safeDownloadName = encodeURIComponent(getFile.originalName || filename);
    
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${safeDownloadName}`);
    res.setHeader('Content-Type', getFile.mimeType || 'application/octet-stream');
    
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error('Erreur de lecture du fichier:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erreur lors de la lecture du fichier' });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('Erreur dans le téléchargement:', error);
    
    if (!res.headersSent) {
      const statusCode = error.name === 'ValidationError' ? 400 : 500;
      res.status(statusCode).json({ 
        error: 'Erreur lors du téléchargement',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      });
    }
  }
});

router.get('/pdf/:filename', async (req, res) => {
  try {
    const file = path.join(__dirname, '../uploads', req.params.filename);
    res.download(file);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_LIEN}/`)
  }
});

// Other routes
router.get('/', auth, productController.getAllProducts);
router.get('/list', productController.getAllProductsAvailable);
router.put('/:id', upload.single('file'), auth, productValidation, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
