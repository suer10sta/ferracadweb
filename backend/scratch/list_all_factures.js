const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

const Facture = require('../models/Facture');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connecté à MongoDB\n');

  const factures = await Facture.find({}).sort({ factureId: 1 });

  if (factures.length === 0) {
    console.log('Aucune facture trouvée.');
  } else {
    console.log(`Total factures : ${factures.length}\n`);
    factures.forEach(f => {
      console.log(`  _id: ${f._id}  |  factureId: ${f.factureId}  |  startFrom: ${f.startFrom}`);
    });
  }

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
