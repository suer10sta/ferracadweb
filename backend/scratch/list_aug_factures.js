const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

const Facture = require('../models/Facture');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connecté à MongoDB\n');

  const factures = await Facture.find({
    factureId: { $regex: /^N°202608\// }
  }).sort({ factureId: 1 });

  if (factures.length === 0) {
    console.log('Aucune facture trouvée pour août 2026.');
  } else {
    console.log(`Factures août 2026 (${factures.length} trouvées) :\n`);
    factures.forEach(f => {
      console.log(`  _id: ${f._id}`);
      console.log(`  factureId: ${f.factureId}`);
      console.log(`  startFrom: ${f.startFrom}`);
      console.log(`  ---`);
    });
  }

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
