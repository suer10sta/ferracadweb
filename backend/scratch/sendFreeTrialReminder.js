require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const sendEmail = require("../utils/sendMail"); // adapte le chemin

// ✅ MODE TEST : mets tes propres emails ici pour tester
const TEST_MODE = false; // 👈 passe à false pour l'envoi réel
const TEST_USERS = [
    { email: "adardournaima70@gmail.com", name: "naima 1" },
    { email: "adardournaima4@gmail.com", name: "naima 2" },
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    let users = [];

    if (TEST_MODE) {
        // Mode test : utilise tes propres emails
        users = TEST_USERS;
        console.log(`🧪 MODE TEST — ${users.length} destinataire(s)`);
    } else {
        // Mode réel : requête MongoDB
        users = await mongoose.connection.db
            .collection("users")
            .aggregate([
                {
                    $lookup: {
                        from: "registrations",
                        localField: "_id",
                        foreignField: "userId",
                        as: "licenses",
                    },
                },
                {
                    $match: {
                        role: "client",
                        licenses: { $size: 0 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        email: 1,
                        name: 1, // assure-toi que ce champ existe dans ta collection
                    },
                },
            ])
            .toArray();

        console.log(`📋 ${users.length} utilisateur(s) sans activation trouvés`);
    }

    let success = 0;
    let failed = 0;

    for (const user of users) {
        try {
            await sendEmail({
                type: "free-trial-reminder",
                email: user.email,
                disableCc: false, // Réactivation du CC pour le suivi réel
                data: {
                    prenom: user.name || "cher utilisateur",
                },
            });

            console.log(`✅ Email envoyé à ${user.email}`);
            success++;

            // Pause de 500ms entre chaque email (évite le spam filter)
            await delay(500);
        } catch (err) {
            console.error(`❌ Échec pour ${user.email}:`, err.message);
            failed++;
        }
    }

    console.log(`\n📊 Résumé : ${success} envoyés, ${failed} échecs`);
    await mongoose.disconnect();
};

run();