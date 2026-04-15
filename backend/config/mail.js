const nodemailer = require("nodemailer");
const dns = require("dns");
require('dotenv').config();

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ovh.net",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  family: 4,
});

module.exports = transporter;