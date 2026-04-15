const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Registration = require('../models/Registration');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const users = await User.find({});
        console.log(`Analyzing ${users.length} users...`);

        let count = 0;
        for (const user of users) {
            const oldStatus = user.status;
            const regs = await Registration.find({ userId: user._id });

            // LOGIQUE DE MIGRATION :
            // 1. Si l'utilisateur a déjà eu une licence (active ou expirée), il est 'active'
            // 2. S'il est 'active', on valide aussi son email par défaut
            // 3. Sinon, s'il n'a aucune licence, il reste 'pending' (simple téléchargement)

            let newStatus = 'pending';
            let isEmailVerified = user.isEmailVerified || false;

            if (regs && regs.length > 0) {
                newStatus = 'active';
                isEmailVerified = true; // S'ils ont eu une licence, ils ont forcément validé leur email/identité avant
            } else if (oldStatus === 'active') {
                // Cas particulier : l'ancien statut était 'active' mais pas de licence trouvée (peu probable mais sécurisé)
                newStatus = 'active';
                isEmailVerified = true;
            }

            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        status: newStatus,
                        isEmailVerified: isEmailVerified
                    }
                }
            );

            console.log(`User ${user.email} : ${oldStatus} -> ${newStatus} (Email Verified: ${isEmailVerified})`);
            count++;
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
