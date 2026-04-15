const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: "Accès refusé. Token manquant." });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "JFEY475YFH29NNCKDAS012328DHFN4"
        );

        const user = await User.findById(decoded.id);
        if (!user || user.status !== "active") {
            return res.status(401).json({ error: "Utilisateur non valide." });
        }

        // Attach user info to request for use in protected routes
        req.user = {
            id: user._id,
            role: user.role
        };

        next();
    } catch (err) {
        console.error("Middleware Auth Error:", err);
        return res.status(401).json({ error: "Token invalide ou expiré." });
    }
};

module.exports = auth;