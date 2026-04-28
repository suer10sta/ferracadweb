require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const sendEmail = require("../utils/sendMail");

const TARGET_EMAIL = "jeremie.moroy1@ac-normandie.fr";

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connecté à MongoDB");

        // On cherche l'utilisateur pour avoir son nom si possible
        const user = await mongoose.connection.db
            .collection("users")
            .findOne({ email: TARGET_EMAIL });

        console.log(`📧 Préparation de l'envoi pour : ${TARGET_EMAIL}`);

        await sendEmail({
            type: "free-trial-reminder",
            email: TARGET_EMAIL,
            disableCc: true, // ✅ Pas de copie à l'admin
            data: {
                prenom: user?.name || "cher utilisateur",
            },
        });

        console.log(`✅ Email envoyé avec succès à ${TARGET_EMAIL} (sans CC admin)`);
    } catch (err) {
        console.error(`❌ Échec de l'envoi :`, err.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Déconnecté de MongoDB");
    }
};

run();
