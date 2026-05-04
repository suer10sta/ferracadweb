const Contact = require('../models/Contact');
const sendEmail = require('../utils/sendMail');
const Newsletter = require('../models/Newsletter');
const User = require('../models/User');

// Helper to get count for ticket number
const getContactCount = async () => {
    try {
        return await Contact.countDocuments();
    } catch (err) {
        return 0;
    }
};

// Create a new contact message
exports.createContact = async (req, res) => {
    try {
        const { nom, mail, sujet, message, newsletter } = req.body;

        // Send notification emails
        const count = await getContactCount();
        const ticketNum = count + 1;

        // Check if user has an active account
        const user = await User.findOne({ email: mail });
        const isActiveAcc = !!user;

        const newContact = new Contact({
            name: nom,
            email: mail,
            subject: sujet,
            message: message,
            isActiveAcc,
            ticketNum,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
        });

        await newContact.save();

        // Handle Newsletter if checked
        if (newsletter) {
            const existing = await Newsletter.findOne({ email: mail });
            if (!existing) {
                await new Newsletter({ email: mail }).save();
            }
        }

        const emailData = {
            name: nom,
            email: mail,
            subject: sujet,
            message: message,
            ip: newContact.ip,
            isActiveAcc,
            ticketNum
        };

        // Email to admin
        await sendEmail({
            type: "contact-form",
            email: process.env.ADMIN_EMAIL || "dessin@bureaumercier.com",
            code: {},
            data: emailData,
        });

        // Email to support
        await sendEmail({
            type: "contact-form",
            email: process.env.ADMIN_SUPPORT || "support@ferracad.com",
            code: {},
            data: emailData,
        });

        res.status(201).json({ message: 'Message envoyé avec succès', ticketNum });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
    }
};

// Get all contacts
exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find()
            .populate('replies.adminId', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ contacts });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Reply to contact
exports.replyContact = async (req, res) => {
    try {
        const { message } = req.body;
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        // Save reply in database
        contact.replies.push({
            adminId: req.user.id,
            message,
        });
        contact.status = 'replied';
        await contact.save();

        // Send email to user
        await sendEmail({
            type: "contact-reply",
            email: contact.email,
            code: {},
            data: {
                name: contact.name,
                subject: contact.subject,
                replyMessage: message
            },
        });

        res.status(200).json({ message: 'Reply sent successfully', data: contact });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete contact
exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Close contact ticket
exports.closeContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        contact.status = 'closed';
        await contact.save();
        res.status(200).json({ message: 'Ticket closed successfully', data: contact });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};