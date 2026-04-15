const Product = require("../models/Product");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const addActivityLog = require("../utils/addActivityLog");
const geoip = require('geoip-lite');
const { createNotification } = require("../utils/notification");

// Create Product
exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  try {
    const { id } = req.user;
    const userData = await User.findById(id);
    if (!userData) {
      return res.status(400).json({ message: "Utilisateur non fourni." });
    }

    if (userData.role !== "admin") {
      return res
        .status(401)
        .json({ message: "Accès non autorisé. Droits administrateur requis." });
    }

    const { name, version, platform, platformVersion } = req.body;

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "File is required." });
    }

    const newProduct = {
      name,
      version,
      platform,
      versionPlatformCompatible: platformVersion,
      filePath: file.path,
      size: file.size,
    };

    const product = new Product(newProduct);
    product.save();

    const geo = geoip.lookup(req.realIp);
    const country = geo?.country || "Auter";
    await addActivityLog({
      userId: id,
      userType: "admin",
      action: "Create Produit",
      actionId: product._id,
      idAdress: req.realIp,
      country 
    });

    res.status(201).json({ message: "Product created", data: product });

    const listOfUsers = await User.find({ role: "client" }, { _id: 1 });
    await Promise.all(
      listOfUsers.map(async user =>
        await createNotification({
          target: user._id,
          title: "New Ferracad Version available",
          type: "Ferracad",
          description: `New Version Ferracad for ${platform} ${version}`,
          link: "/tableau-de-board/produits"
        })
      )
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// get all products
exports.getAllProductsAvailable = async (req, res) => {
  try {
    const products = await Product.find({ isPublic: true }).sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ data: product });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const { id } = req.user;
    const userData = await User.findById(id);
    if (!userData) {
      return res.status(400).json({ message: "Utilisateur non fourni." });
    }

    if (userData.role !== "admin") {
      return res
        .status(401)
        .json({ message: "Accès non autorisé. Droits administrateur requis." });
    }

    const {
      name,
      version,
      platform,
      platformVersion,
      fileName,
      isPublic,
      oldPath,
    } = req.body;

    const file = req.file;
    if (!file) {
      const updatedProduct = {
        name,
        version,
        platform,
        versionPlatformCompatible: platformVersion,
        isPublic: isPublic === "true" ? true : false,
      };

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updatedProduct,
        { new: true }
      );
      if (!product) return res.status(404).json({ message: "Product not found" });
      return res.status(200).json({ message: "Product updated", data: product });
    }

    const updatedProduct = {
      name,
      version,
      platform,
      versionPlatformCompatible: platformVersion,
      isPublic: isPublic === "true" ? true : false,
      filePath: file.path,
      size: file.size,
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updatedProduct,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    // remove old product
    const filePath = path.join(__dirname, "..", oldPath); // Adjust path as needed
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Erreur lors de la suppression du fichier :", err);
        // Optionally, you can return here if file deletion is critical
      }
    });

    const geo = geoip.lookup(req.realIp);
    const country = geo?.country || "Auter";

    await addActivityLog({
      userId: id,
      userType: "admin",
      action: "Create Produit",
      actionId: product._id,
      idAdress: req.realIp,
      country 
    });

    return res.status(200).json({ message: "Product updated", data: product });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable." });
    }

    // Step 1: Delete the associated file
    if (product.filePath) {
      const filePath = path.join(__dirname, "..", product.filePath); // Adjust path as needed

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Erreur lors de la suppression du fichier :", err);
          // Optionally, you can return here if file deletion is critical
        }
      });
    }

    // Step 2: Delete the product from the database
    await Product.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ message: "Produit et fichier associés supprimés avec succès." });
  } catch (err) {
    console.error("Erreur lors de la suppression du produit :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
