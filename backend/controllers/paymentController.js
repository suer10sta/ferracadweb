const Payment = require('../models/Payment');
const Rental = require('../models/Rental');
const Registration = require('../models/Registration');
const LicenseHistory = require('../models/LicenseHistory');
const { createAuthCode } = require("../services/auth");
const sendEmail = require('../utils/sendMail');
const mongoose = require('mongoose');
const addActivityLog = require("../utils/addActivityLog");
const {
  createOneTimePayment,
  createSubscription,
  createCustomer,
  getCustomerByEmail,
  createProduct,
  getProductByName,
  createCustomIntervalPrice,
} = require('../utils/stripe');
const Stripe = require("stripe");
const User = require('../models/User');
const { combineWithCurrentTime } = require('../utils/date');
// const stripe = Stripe(
//   process.env.STRIPE_SECRET_KEY_TEST ||
//   "sk_test_51SI4slB4LVww0NzzB0Ok33mLnJu3BEFBl8urO3e82If6hrGAsdqd2fHNtfVCLRazjlELcdGivZYjEyOeXqsS76vT00tolSUdNi"
// );
const stripe = Stripe(
  process.env.STRIPE_SECRET_KEY ||
  "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"
);
// Champs autorisés pour insert/update
const allowedFields = [
  'operatorId',
  'userId',
  'couponId',
  'type',
  'status',
  'totalPricePay',
  'currency',
];

// Fonction pour filtrer uniquement les champs autorisés
function buildPaymentData(body) {
  const data = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }
  return data;
}

function validatePaymentData(data) {
  if (data.type && !['stripe', 'paypal', 'cash'].includes(data.type)) {
    return 'Invalid payment type';
  }
  if (data.status && !['success', 'unsuccess', 'failed'].includes(data.status)) {
    return 'Invalid status';
  }
  if (data.totalPricePay !== undefined && typeof data.totalPricePay !== 'number') {
    return 'totalPricePay must be a number';
  }
  return null;
}

// Create
exports.createPayment = async (req, res) => {
  try {
    const filteredData = buildPaymentData(req.body);
    const error = validatePaymentData(filteredData);
    if (error) return res.status(400).json({ message: error });

    const payment = new Payment(filteredData);
    await payment.save();

    res.status(201).json({ valid: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error on create payment', valid: false });
  }
};
// hi there what are you doing ? 


exports.getAllPayments = async (req, res) => {
  try {
    let paymentsData;
    const roleUser = req.user.role;
    const userId = req.user.id;

    if (roleUser === "admin") {
      paymentsData = await Payment.find().sort({ createdAt: -1 });
    } else {
      paymentsData = await Payment.find({ userId }).sort({ createdAt: -1 });
    }

    res.json({ paymentsData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error on fetching payments' });
  }
};

// Get by ID
exports.getPaymentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid ID' });

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error on fetching payment' });
  }
};

// Update
exports.updatePayment = async (req, res) => {
  try {
    let isCodeSent = false;
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid ID' });

    const filteredData = buildPaymentData(req.body);
    const error = validatePaymentData(filteredData);
    if (error) return res.status(400).json({ message: error });

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const previousStatus = payment.status;

    const updated = await Payment.findByIdAndUpdate(req.params.id, filteredData, {
      new: true,
      runValidators: true,
    });

    // Side effects for activation or cancellation
    if (previousStatus === 'unsuccess' && filteredData.status === 'success') {
      // Activer les codes provisoires
      const rental = await Rental.findOne({ payId: payment._id });
      if (rental) {
        // Mettre à jour la commande
        rental.status = "active";
        await rental.save();

        const registrations = await Registration.find({ rentalId: rental._id });
        for (const reg of registrations) {
          if (reg.isProvisional) {
            isCodeSent = true;
            const finalExpDate = combineWithCurrentTime(reg.realExpirationDate || reg.expirationDate);

            let codeAuth = await createAuthCode(reg.computerCode, finalExpDate);
            const finalCode = codeAuth.data.code;

            reg.authCode = finalCode;
            reg.expirationDate = finalExpDate;
            reg.status = "active";
            reg.isProvisional = false;
            await reg.save();

            const user = await User.findById(reg.userId);
            const email = reg.email && reg.email !== "" ? reg.email : user?.email;
            if (email && user) {
              const data = {
                computerName: reg.computerName,
                username: reg.username,
                expirationDate: finalExpDate,
                rental: {
                  ...rental.toObject(),
                  nextBillingDate: finalExpDate
                }
              };
              await sendEmail({
                type: "auth-code-final",
                email,
                code: finalCode,
                data,
                user
              });
            }
          } else {
            reg.status = "active";
            await reg.save();
          }
        }
      }
    } else if (
      (previousStatus === 'success' && filteredData.status === 'unsuccess') ||
      (previousStatus !== 'failed' && filteredData.status === 'failed')
    ) {
      // Désactiver/annuler les licences suite à une annulation
      const rental = await Rental.findOne({ payId: payment._id });
      if (rental) {
        rental.status = "inactive";
        await rental.save();

        const registrations = await Registration.find({ rentalId: rental._id });
        for (const reg of registrations) {
          reg.status = "inactive";
          await reg.save();
        }
      }

      // Renseigner l'identifiant de la note de crédit (NC...)
      const FactureModel = require("../models/Facture");
      const getFacture = await FactureModel.findOne({ payId: payment._id });
      if (getFacture && !getFacture.creditNoteId) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const currentCount = await FactureModel.countDocuments({
          creditNoteId: { $regex: `^NC${year}${month}/` }
        });
        const index = String(currentCount + 1).padStart(3, "0");
        getFacture.creditNoteId = `NC${year}${month}/${index}`;
        await getFacture.save();
      }
    }

    res.json({
      ...updated.toObject(),
      codeSent: isCodeSent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error on update payment' });
  }
};

// Delete
exports.deletePayment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid ID' });

    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Payment not found' });

    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error on delete payment' });
  }
};

// Send Payment Reminder
exports.sendPaymentReminder = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid ID' });

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const user = await User.findById(payment.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const Facture = require('../models/Facture');
    const facture = await Facture.findOne({ payId: payment._id });

    await sendEmail({
      type: "payment-reminder",
      email: user.email,
      code: "",
      data: {
        totalPricePay: payment.totalPricePay,
        factureId: facture ? facture.factureId : "N/A",
      },
      user: user,
    });

    res.status(200).json({ message: 'Relance envoyée avec succès par e-mail' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error on sending payment reminder' });
  }
};

exports.createSetupIntent = async (req, res) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["card"],
    });
    res.json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// get TVA rate
exports.getTauxTva = async (req, res) => {
  try {
    // Le vendeur est basé en Belgique → le taux de TVA est toujours le taux belge (21%),
    // quelle que soit la valeur du pays de l'utilisateur.
    const countryCode = 'BE';

    // Récupérer le taux TVA depuis Stripe
    const taxRate = await getTaxRateForCountry(countryCode);

    // Retourner le taux TVA
    res.json({
      success: true,
      country: countryCode,
      taux_tva: taxRate.percentage,
      tax_rate_id: taxRate.id
    });

  } catch (error) {
    console.error('❌ Error getting TVA rate:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du taux TVA',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// getTaxRateForCountry
// Fonction pour récupérer le taux TVA d'un pays
async function getTaxRateForCountry(countryCode) {
  try {
    // 1. Récupérer TOUS les taux de TVA actifs
    const allTaxRates = await stripe.taxRates.list({
      active: true,
      limit: 200
    });

    // 2. Filtrer pour trouver le taux du pays spécifique
    const countryTaxRate = allTaxRates.data.find(rate =>
      rate.jurisdiction && rate.jurisdiction.toUpperCase() === countryCode.toUpperCase()
    );

    if (countryTaxRate) {
      console.log(`✅ TVA trouvée pour ${countryCode}: ${countryTaxRate.percentage}%`);
      return countryTaxRate;
    }

    // 3. Si aucun taux trouvé, créer un taux par défaut selon le pays
    const defaultTaxRates = {
      'FR': 20.0, 'DE': 19.0, 'IT': 22.0, 'ES': 21.0,
      'BE': 21.0, 'NL': 21.0, 'LU': 17.0, 'PT': 23.0,
      'AT': 20.0, 'IE': 23.0, 'CH': 8.1, 'GB': 20.0,
      'MA': 20.0, // Maroc
      'TN': 19.0, // Tunisie
      'DZ': 19.0, // Algérie
      'US': 0.0, 'CA': 0.0, 'AU': 10.0, 'JP': 10.0,
    };

    const percentage = defaultTaxRates[countryCode] || 20.0; // Défaut 20%

    const taxRate = await stripe.taxRates.create({
      display_name: `TVA ${countryCode}`,
      description: `TVA standard pour ${countryCode}`,
      jurisdiction: countryCode,
      percentage: percentage,
      inclusive: false,
    });

    console.log(`✅ Nouveau taux TVA créé pour ${countryCode}: ${percentage}%`);
    return taxRate;

  } catch (error) {
    console.error(`Error getting tax rate for ${countryCode}:`, error);

    // Retourner un objet par défaut en cas d'erreur
    const defaultTaxRates = {
      'FR': 20.0, 'DE': 19.0, 'IT': 22.0, 'ES': 21.0,
      'BE': 21.0, 'NL': 21.0, 'LU': 17.0, 'PT': 23.0,
      'AT': 20.0, 'IE': 23.0, 'CH': 8.1, 'GB': 20.0,
      'MA': 20.0, 'TN': 19.0, 'DZ': 19.0,
      'US': 0.0, 'CA': 0.0, 'AU': 10.0, 'JP': 10.0,
    };

    return {
      id: null,
      percentage: defaultTaxRates[countryCode] || 20.0,
      jurisdiction: countryCode,
      display_name: 'TVA Standard'
    };
  }
}