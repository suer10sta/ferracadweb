const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Contact = require('./models/Contact');

async function migrate() {
    try {
        console.log('Tentative de connexion à :', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connecté à la base de données...');

        // Récupérer tous les contacts, triés par date de création (du plus ancien au plus récent)
        const contacts = await Contact.find().sort({ createdAt: 1 });
        
        if (contacts.length === 0) {
            console.log('Aucun contact trouvé en base de données.');
            process.exit(0);
        }

        console.log(`${contacts.length} contacts à mettre à jour.`);

        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            const isLast = (i === contacts.length - 1);
            
            // Logique demandée :
            // Tous sont mis à "replied", sauf le dernier qui reste en "pending"
            contact.status = isLast ? 'pending' : 'replied';
            contact.replies = contact.replies || [];
            contact.ticketNum = i + 1; // Attribution du numéro séquentiel

            await contact.save();
            console.log(`Contact #${contact.ticketNum} (${contact.email}) mis à jour en statut: ${contact.status}`);
        }

        console.log('=========================================');
        console.log('Migration terminée avec succès !');
        console.log(`Total traités : ${contacts.length}`);
        console.log('=========================================');
        
        process.exit(0);
    } catch (err) {
        console.error('Erreur pendant la migration:', err);
        process.exit(1);
    }
}

migrate();
