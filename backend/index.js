// Load environment variables
require('dotenv').config();

const express = require('express');
const helmet = require('helmet')
const rateLimit = require("express-rate-limit")
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require('./config/db');
const getIp = require('./middlewares/getIp');
const Stripe = require('stripe');
const sendEmail = require('./utils/sendMail');
const { createNotification } = require('./utils/notification');
const cron = require('node-cron');
const { stripe } = require('./utils/stripe');
const moment = require('moment');
const path = require('path')
const bcrypt = require("bcrypt");

//models
const Payment = require('./models/Payment');
const User = require('./models/User');
const Rental = require('./models/Rental');
const Registration = require('./models/Registration');
const Facture = require('./models/Facture');

const app = express();

// routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const couponRoutes = require('./routes/couponRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const payConfigRoutes = require('./routes/paymentConfigRoutes');
const licenseHistories = require('./routes/licenseHistoryRoutes');
const facture = require('./routes/factureRoutes');
const product = require('./routes/productRoutes');
const faq = require('./routes/faqRoutes');
const settings = require('./routes/settingsRoutes');
const download = require('./routes/downloadRoutes');
const contact = require('./routes/contactRoutes');
const Logs = require('./routes/activityLogRoutes');
const Notifications = require('./routes/notificationRoutes');
const newsletter = require('./routes/newsletterRoutes');
const emailTemplates = require('./routes/emailTemplateRoutes');


// rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

// Connect to MongoDB
connectDB();

// ip adresse
app.use(getIp);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://www.ferracad.com',
  'https://ferracad.com',
  'http://www.ferracad.com',
  'http://ferracad.com',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Supprime le préfixe www. pour comparer plus facilement
    const originHostname = origin.replace(/^https?:\/\//, '').replace(/^www\./, '');
    const isDomainAllowed = allowedOrigins.some(allowed => {
      const allowedHostname = allowed.replace(/^https?:\/\//, '').replace(/^www\./, '');
      return originHostname === allowedHostname;
    });

    if (isDomainAllowed || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      return callback(null, new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Port configuration
const PORT = process.env.PORT || 8081;

// Middleware
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use(limiter);

cron.schedule('0 0 * * *', async () => {
  const now = new Date();

  try {
    // Find rentals that should expire
    const rentalsToExpire = await Rental.find({
      deductionAuto: false,
      nextBillingDate: { $lte: now },
      status: { $ne: 'expire' },
    });

    if (!rentalsToExpire.length) {
      console.log('No rentals to expire.');
      return;
    }

    for (const rental of rentalsToExpire) {
      rental.status = 'expire';
      await rental.save();

      // Update related registration
      await Registration.updateMany(
        { rentalId: rental._id },
        {
          $set: {
            status: 'expire',
            expirationDate: now,
          },
        }
      );

      console.log(`Rental ${rental._id} and related registrations expired.`);
    }

    console.log(`${rentalsToExpire.length} rentals processed.`);
  } catch (err) {
    console.error('Error updating expired rentals:', err);
  }
});

// routes
app.get("/", (req, res) => {
  return res.json({ message: "Hello" })
})

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/rental', rentalRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/payconfig', payConfigRoutes);
app.use('/api/history', licenseHistories);
app.use('/api/facture', facture);
app.use('/api/product', product);
app.use('/api/faq', faq);
app.use('/api/settings', settings);
app.use('/api/download', download);
app.use('/api/contact', contact);
app.use('/api/Logs', Logs);
app.use('/api/notifications', Notifications);
app.use('/api/newsletter', newsletter);
app.use('/api/email-templates', emailTemplates);



cron.schedule("0 9 * * *", async () => {
  try {
    console.log("🔔 Vérification des abonnements en cours...");

    const reminders = [7, 2, 1];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalNotifications = 0;

    for (const daysBefore of reminders) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysBefore);

      const startOfDay = new Date(targetDate);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const expiringSubscriptions = await Rental.find({
        nextBillingDate: { $gte: startOfDay, $lte: endOfDay },
        deductionAuto: false
      }).populate('userId'); // Optimisation: peupler directement l'utilisateur

      if (expiringSubscriptions.length > 0) {
        console.log(`📧 ${expiringSubscriptions.length} abonnement(s) à J-${daysBefore}`);

        // Traitement parallèle pour plus de performance
        const notificationPromises = expiringSubscriptions.map(async (subscription) => {
          if (!subscription.userId) return;

          const expirationDate = subscription.nextBillingDate.toLocaleDateString("fr-FR");

          // Envoyer notification et email en parallèle
          await Promise.all([
            createNotification({
              target: subscription.userId._id,
              title: "Votre abonnement expire bientôt",
              type: "Abonnement",
              description: `Votre abonnement expire le ${expirationDate} (dans ${daysBefore} jour${daysBefore > 1 ? "s" : ""})`,
              link: "/tableau-de-board/commande",
            }),
            sendEmail({
              type: "remembre-renouvellement",
              email: subscription.userId.email,
              data: subscription,
              user: subscription.userId,
            })
          ]);
        });

        await Promise.all(notificationPromises);
        totalNotifications += expiringSubscriptions.length;
      }
    }

    console.log(`✅ Vérification terminée : ${totalNotifications} notification(s) envoyée(s)`);
  } catch (err) {
    console.error("❌ Erreur lors de la vérification des abonnements:", err);
  }
});

cron.schedule("0 9 * * *", async () => {
  try {
    console.log("🔔 Vérification des abonnements en cours...");

    const reminders = [10, 5, 1];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalNotifications = 0;

    for (const daysBefore of reminders) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysBefore);

      const startOfDay = new Date(targetDate);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const expiringSubscriptions = await Registration.find({
        expirationDate: { $gte: startOfDay, $lte: endOfDay },
        userId: { $exists: false },
        rentalId: { $exists: false },
        status: "freetrial"
      });

      if (expiringSubscriptions.length > 0) {
        console.log(`📧 ${expiringSubscriptions.length} abonnement(s) à J-${daysBefore}`);

        // Traitement parallèle pour plus de performance
        const notificationPromises = expiringSubscriptions.map(async (subscription) => {

          // Envoyer notification et email en parallèle
          await Promise.all([
            sendEmail({
              type: "invite-create-account",
              email: subscription.email,
              data: subscription,
              user: {
                name: subscription.username,
                email: subscription.email
              }
            })
          ]);
        });

        await Promise.all(notificationPromises);
        totalNotifications += expiringSubscriptions.length;
      }
    }

    console.log(`✅ Vérification terminée : ${totalNotifications} notification(s) envoyée(s)`);
  } catch (err) {
    console.error("❌ Erreur lors de la vérification des abonnements:", err);
  }
});



// this is for old users, that have account but didn't have password
/*cron.schedule("* * * * *", async () => {
  try {
    const userData = await User.find({
      role: "client",
      $or: [
        { password: { $exists: false } },
        { lastLogin: { $exists: false } },
        { lastLogin: null },
        { status: "pending" }
      ]
    });

    const adminEmail = await User.find({
      role: "admin",
      mainAccount: true
    })
    // console.log(userData)
    const names = []
    for (const user of userData) {
      if(user.name.toLowerCase().includes("user")) {
        continue;
      }
      const password = `${user.name.toLowerCase().split(" ").join("_")}1234`;
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;

      await user.save();
      sendEmail({ 
        type: "password-add",
        email: user.email,
        code: password,
        data: user
      })
      names.push(`${user.name} - ${user.email}`)
    }
    sendEmail({ 
      type: "password-add-admin",
      email: "m.mercier@bureaumercier.com",
      code: "",
      data: names
    })
    console.log(names)
  } catch (error) {
    console.log(error)
  }
})*/


cron.schedule("0 0 */7 * *", async () => {
  try {
    console.log("opened schedule")
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    // Only target clients created within the last 30 days
    const userData = await User.find({
      role: "client",
      createdAt: { $gte: oneMonthAgo }
    });
    for (const user of userData) {
      const checkRental = await Rental.find({ userId: user._id })
      if (checkRental.length <= 0) {
        sendEmail({
          type: "free-trial-reminder",
          email: user.email,
          code: "",
          data: user,
        })
      }
    }

  } catch (err) {
    console.error("Error deleting pending users:", err);
  }
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});