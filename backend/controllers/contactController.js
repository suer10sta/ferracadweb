// Load environment variables
require('dotenv').config();

const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const sendEmail = require("../utils/sendMail");
const Newsletter = require('../models/Newsletter');

// Create contact
exports.createContact = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { nom, mail, sujet, message, newsletter } = req.body;
        if(!nom || !mail || !sujet || !message) {
            return res.status(400).json({ message: "Veuillez remplir tous les champs obligatoires." });
        }

        const checkAccount = await User.findOne({ email: mail });
        const getContactCount = await Contact.countDocuments();

        const contactData = {
            ip: req.realIp,
            name: nom,
            email: mail,
            subject: sujet,
            message,
            isActiveAcc: checkAccount?._id? true : false,
        };

        const contact = new Contact(contactData);
        await contact.save();

        // email de l'admin
        await sendEmail({
            type: "contact-form",
            email: process.env.ADMIN_EMAIL || "dessin@bureaumercier.com",
            code: {},
            data: {...contactData, ticketNum: getContactCount},
        });

        // email de support
        await sendEmail({
            type: "contact-form",
            email: process.env.ADMIN_SUPPORT || "support@ferracad.com",
            code: {},
            data: {...contactData, ticketNum: getContactCount},
        });

        // 
        if(newsletter) {
            const getNewsletter = await Newsletter.findOne({ email: mail });
            if(!getNewsletter) {
                const newNewsletter = new Newsletter({
                    email: mail,
                    status: "active"
                })
                await newNewsletter.save()
            }
        }

        res.status(201).json({ message: 'Contact created', data: contact });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all contacts
exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ contacts });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};