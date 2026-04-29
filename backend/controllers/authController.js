// Load environment variables
require('dotenv').config();

const { createAuthCode } = require('../services/auth');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const codeTwoFac = require("../services/codeTwoFac");
const sendEmail = require('../utils/sendMail');
const addActivityLog = require("../utils/addActivityLog");
const geoip = require('geoip-lite');
const generateCode2Fac = require('../utils/generateCode2Fac');
const crypto = require("crypto");

const generateInvitationId = (ip, email) => {
    const data = `${ip}-${email}-${Date.now()}`;
    return crypto.createHash("sha256").update(data).digest("hex").slice(0, 15).toUpperCase();
};

exports.getAuthCode = async (req, res) => {
    try {
        const { codeComputer, dateExp } = req.body;

        if (!codeComputer || !dateExp) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const authData = await createAuthCode(codeComputer, dateExp);
        res.json({ success: true, data: authData });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ error: 'Server error generating auth code' });
    }
};

exports.connexion = async (req, res) => {
    try {
        const { email, pwd, remembre } = req.body;

        if (!email || !pwd) {
            return res.status(400).json({ error: "E-mail et mot de passe est obligatoires." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Votre e-mail ou votre mot de passe est incorrect." });
        }

        if (user.status === "inactive") {
            return res.status(401).json({ error: "Ce compte est bloqué par l'administration" });
        }

        if (user.status === "pending" || user.status === "freetrial") {
            const data = { name: user.name }
            const token = jwt.sign(
                { id: user._id, type: "verify-acc" },
                process.env.JWT_SECRET || "JFEY475YFH29NNCKDAS012328DHFN4",
                { expiresIn: "1d" }
            );
            const url = `${process.env.BACKEND_LIEN}/api/auth/activation/${token}`

            await sendEmail({
                type: "verify-account",
                email: user.email.trim(),
                code: url,
                data,
            });

            return res.status(401).json({ error: "Ce compte n’est pas encore activé. Vous pouvez trouver le lien d’activation dans votre boîte mail" });
        }

        const isMatch = await bcrypt.compare(pwd, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Votre e-mail ou votre mot de passe est incorrect." });
        }

        if (user.twoFac) {
            const code6Digital = await generateCode2Fac();
            const tokenFac = jwt.sign(
                { id: user._id, code: code6Digital, remembre: remembre },
                process.env.JWT_SECRET || "JFEY475YFH29NNCKDAS012328DHFN4",
                { expiresIn: "1d" }
            );
            await sendEmail({
                type: "two-factors",
                email,
                code: code6Digital,
                data: {},
                user
            });

            return res.status(200).json({
                tokenFac,
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "JFEY475YFH29NNCKDAS012328DHFN4",
            { expiresIn: remembre ? "30d" : "7d" }
        );

        if (!user.ipAdresse) {
            user.ipAdresse = req.realIp;
        }

        user.lastLogin = new Date();
        await user.save();

        const geo = geoip.lookup(req.realIp);
        const country = geo?.country || "Auter";

        await addActivityLog({
            userId: user._id,
            userType: user.role,
            action: "Login",
            actionId: "",
            idAdress: req.realIp,
            country
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                role: user.role,
                isTwoFac: user.twoFac
            },
        });

    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.checkCodeValidate = async (req, res) => {
    try {
        const { token, code, email } = req.body;

        if (!token || !code || !email) {
            return res.status(400).json({ message: "Token, code et email sont requis." });
        }

        // Vérifier et décoder le token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || "JFEY475YFH29NNCKDAS012328DHFN4");
        } catch (error) {
            return res.status(401).json({ message: "Token invalide ou expiré." });
        }

        const userId = decoded.id;
        const codeFromToken = decoded.code;

        // Vérifier que le code correspond
        if (code !== codeFromToken) {
            return res.status(400).json({ message: "Code de vérification incorrect." });
        }

        // Vérifier que l'utilisateur existe et que l'email correspond
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        if (user.email !== email) {
            return res.status(400).json({ message: "L'email ne correspond pas à l'utilisateur." });
        }

        // login Process
        const tokenLog = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "JFEY475YFH29NNCKDAS012328DHFN4",
            { expiresIn: decoded.remembre ? "30d" : "7d" }
        );

        user.lastLogin = new Date();
        await user.save();

        const geo = geoip.lookup(req.realIp);
        const country = geo?.country || "Auter";

        await addActivityLog({
            userId: user._id,
            userType: user.role,
            action: "Login",
            actionId: "",
            idAdress: req.realIp,
            country
        });

        res.cookie("token", tokenLog, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Si tout est bon, renvoyer une réponse de succès
        return res.status(200).json({
            message: "Code vérifié avec succès",
            userId: user._id,
        });

    } catch (error) {
        console.error("Erreur checkCodeValidate:", error);
        return res.status(500).json({ message: "Erreur serveur." });
    }
};

exports.resendTwoFactorCode = async (req, res) => {
    try {
        const { email, token } = req.body;

        if (!email || !token) {
            return res.status(400).json({ message: "Email et token sont requis." });
        }

        // Verify & decode token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || "JFEY475YFH29NNCKDAS012328DHFN4");
        } catch (err) {
            return res.status(401).json({ message: "Token invalide ou expiré." });
        }

        const { id, code } = decoded;

        // Find the user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Check if email matches
        if (user.email !== email) {
            return res.status(400).json({ message: "L'email ne correspond pas à l'utilisateur." });
        }

        // Resend the same 2FA code
        await sendEmail({
            type: "two-factors",
            email,
            code,
            data: {},
            user,
        });

        return res.status(200).json({ message: "Le code a été renvoyé avec succès." });
    } catch (error) {
        console.error("Erreur lors du renvoi du code 2FA:", error);
        return res.status(500).json({ message: "Une erreur est survenue." });
    }
}

exports.inscription = async (req, res) => {
    try {
        const {
            name,
            prenom,
            email,
            pwd,
            reppwd,
            pays,
            companyname,
            tva,
            number,
            codepostal,
            ville,
            adresse,
            isAdmin,
            platform,
            clientType,
            isVatSubject
        } = req.body;

        if (!name || !prenom || !email || !pwd || !reppwd || !pays || !number || !platform) {
            return res.status(400).json({ error: "Tous les champs sont obligatoires." });
        }

        if (pwd !== reppwd) {
            return res.status(400).json({ error: "Les mots de passe ne correspondent pas." });
        }

        if (pwd.length < 8) {
            return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Adresse e-mail invalide." });
        }

        const phoneRegex = /^[0-9]+$/;
        if (!phoneRegex.test(number)) {
            return res.status(400).json({ message: "Le numéro de téléphone doit contenir uniquement des chiffres." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Un compte avec cet email existe déjà." });
        }

        const hashedPassword = await bcrypt.hash(pwd, 10);
        const invitationId = generateInvitationId(req.realIp, email);

        const newUser = await User.create({
            name: name + " " + prenom,
            email,
            password: hashedPassword,
            country: pays,
            company: companyname || "",
            nTva: tva || "",
            phone: number,
            postal: codepostal || "",
            city: ville || "",
            address: adresse || "",
            role: "client",
            status: isAdmin ? "active" : "pending",
            invitationId,
            source: isAdmin ? "Formulaire de l'admin" : "Formulaire d’inscription",
            platform: platform,
            ipAdresse: req.realIp,
            clientType: clientType || 'individual',
            isVatSubject: isVatSubject || false,
        });

        await newUser.save()

        if (!isAdmin) {
            const data = { name: name + " " + prenom }
            const token = jwt.sign(
                { id: newUser._id, type: "verify-acc" },
                process.env.JWT_SECRET || "JFEY475YFH29NNCKDAS012328DHFN4",
                { expiresIn: "1d" }
            );
            const url = `${process.env.BACKEND_LIEN}/api/auth/activation/${token}`

            await sendEmail({
                type: "verify-account",
                email,
                code: url,
                data,
            });
        }

        res.status(201).json({
            message: "Inscription réussie.",
            user: {
                id: newUser._id,
            },
        });

    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.logout = (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        return res.status(200).json({ message: 'Déconnexion réussie.' });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.changePwd = async (req, res) => {
    try {
        const id = req.user.id;
        const { newPassword, confirmPassword, currentPassword } = req.body;
        const user = await User.findById(id)

        if (!user) {
            return res.status(409).json({ message: "Le compte est pas Exist." });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas." })
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: "Le mot de passe doit etre superieur a 8 caractère" })
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(409).json({ message: "Le mot de passe n'est pas correct" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save()

        res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.changeTwoFac = async (req, res) => {
    try {
        const id = req.user.id;
        const { is2FAEnabled } = req.body;
        const user = await User.findById(id)

        if (!user) {
            return res.status(409).json({ message: "Le compte est pas Exist." });
        }

        user.twoFac = is2FAEnabled;
        await user.save()

        res.status(200).json({ message: "L'opération a réussi avec succès." });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.validate = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ valid: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'JFEY475YFH29NNCKDAS012328DHFN4');
        const user = await User.findById(decoded.id);

        if (!user || (user.status !== "active" && user.status !== "freetrial")) {
            return res.status(401).json({ valid: false });
        }

        // Mise à jour de la dernière activité (lastLogin)
        // On ne met à jour que si la dernière date remonte à plus de 15 minutes pour économiser la base de données
        const now = new Date();
        const lastActivity = user.lastLogin ? new Date(user.lastLogin) : new Date(0);
        if (now.getTime() - lastActivity.getTime() > 15 * 60 * 1000) {
            user.lastLogin = now;
            await user.save();
        }

        res.status(200).json({
            valid: true,
            user: {
                id: user._id,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

exports.validateAccount = async (req, res) => {
    try {
        const { token } = req.params;

        // 1. Verify JWT token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "JFEY475YFH29NNCKDAS012328DHFN4"
        );

        // 2. Check token content
        if (!decoded || !decoded.id || decoded.type !== 'verify-acc') {
            return res.status(400).json({ message: 'Token invalide ou type incorrect.' });
        }

        // 3. Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_LIEN}/louer/register`);
        }

        // 4. Activate account if not already active
        if (user.status === 'active') {
            return res.redirect(`${process.env.FRONTEND_LIEN}/connexion`);
        }

        user.status = 'active';
        await user.save();

        res.redirect(`${process.env.FRONTEND_LIEN}/connexion`);
    } catch (err) {
        console.error('Erreur d’activation de compte :', err);

        if (err.name === 'TokenExpiredError') {
            return res.redirect(`${process.env.FRONTEND_LIEN}/activation-error?token=${token}`);
        }

        res.redirect(`${process.env.FRONTEND_LIEN}/activation-error?token=${token}`);
    }
};

exports.resendActivation = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        if (user.status === 'active') {
            return res.status(200).json({ message: 'Compte déjà activé.' });
        }

        const data = { name: user.name }

        const createToken = jwt.sign(
            { id: user._id, type: "verify-acc" },
            process.env.JWT_SECRET || "JFEY475YFH29NNCKDAS012328DHFN4",
            { expiresIn: "1d" }
        );

        const url = `http://localhost:8081/api/auth/activation/${createToken}`

        await sendEmail({
            type: "verify-account",
            email,
            code: url,
            data,
        });

        res.status(200).json({
            message: "Envoyer avec succès.",
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

exports.recoverPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        const data = { name: user.name }

        const createToken = jwt.sign(
            { id: user._id, type: "password-reset" },
            process.env.JWT_SECRET || "JFEY475YFH29NNCKDAS012328DHFN4",
            { expiresIn: "1d" }
        );

        await sendEmail({
            type: "password-reset",
            email,
            code: createToken,
            data,
        });

        res.status(200).json({
            message: "E-mail de réinitialisation envoyé avec succès.",
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

exports.setPassword = async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;

        // Validate required fields
        if (!token || !password || !confirmPassword) {
            return res.status(400).json({ message: "Champs manquants." });
        }

        // Check passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "JFEY475YFH29NNCKDAS012328DHFN4",
        );

        // Check token content
        if (!decoded || !decoded.id || decoded.type !== 'password-reset') {
            return res.status(400).json({ message: 'Token invalide ou type incorrect.' });
        }

        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: "Mot de passe mis à jour avec succès.",
        });
    } catch (err) {
        return res.status(500).json({ message: "Le lien n'est plus valide." });
    }
}

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email est requis." });
        }

        let user = await User.findOne({ email: email.trim() });
        const otpCode = generateCode2Fac();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        if (!user) {
            // Create a pending user if not exists
            user = await User.create({
                email: email.trim(),
                status: "pending",
                source: "Formulaire d'essai (OTP)",
                verificationCode: otpCode,
                verificationCodeExpires: expires,
                isEmailVerified: false
            });
        } else {
            // Update existing user with new OTP
            user.verificationCode = otpCode;
            user.verificationCodeExpires = expires;
            user.isEmailVerified = false; // Reset verification status
            await user.save();
        }

        await sendEmail({
            type: "otp-code",
            email: email.trim(),
            code: otpCode,
            data: {},
        });

        res.status(200).json({ message: "Code de vérification envoyé." });
    } catch (error) {
        console.error("sendOTP Error:", error);
        res.status(500).json({ message: "Erreur lors de l'envoi du code." });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ message: "Email et code sont requis." });
        }

        const user = await User.findOne({
            email: email.trim(),
            verificationCode: code,
            verificationCodeExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: "Code invalide ou expiré." });
        }

        user.isEmailVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Email vérifié avec succès.",
            userData: {
                name: user.name || "",
                platform: user.platform || ""
            }
        });
    } catch (error) {
        console.error("verifyOTP Error:", error);
        res.status(500).json({ message: "Erreur lors de la vérification." });
    }
};