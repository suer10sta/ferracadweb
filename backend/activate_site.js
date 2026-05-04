const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const SettingsSchema = new mongoose.Schema({
    siteStatus: String
}, { strict: false });

const Settings = mongoose.model('Settings', SettingsSchema);

async function activateSite() {
    try {
        console.log('Using URI:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ferracadTest');
        console.log('Connected to MongoDB');

        const result = await Settings.findOneAndUpdate({}, { siteStatus: 'active' }, { upsert: true, new: true });
        console.log('Site status updated to:', result.siteStatus);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

activateSite();
