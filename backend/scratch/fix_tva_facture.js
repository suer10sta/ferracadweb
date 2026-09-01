require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");

const FACTURE_ID = "N°202606/024";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    const facture = await mongoose.connection.db
      .collection("factures")
      .findOne({ factureId: FACTURE_ID });

    if (!facture) {
      console.log("❌ Facture introuvable ! Vérifie le numéro.");
      return;
    }

    const res = await mongoose.connection.db
      .collection("payments")
      .updateOne(
        { _id: facture.payId, tva: { $in: ["20", 20] } },
        { $set: { tva: "21" } }
      );

    console.log(`Facture : ${FACTURE_ID}`);
    console.log(`matched: ${res.matchedCount} | modified: ${res.modifiedCount}`);
  } catch (err) {
    console.error(`❌ Erreur :`, err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Déconnecté de MongoDB");
  }
};

run();
