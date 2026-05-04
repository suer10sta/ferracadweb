const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function checkSettings() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ferracadTest');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const settings = await db.collection('settings').find({}).toArray();
        console.log('Settings in DB:', JSON.stringify(settings, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkSettings();
