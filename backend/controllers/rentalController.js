const Rental = require('../models/rental');
const Registration = require('../models/Registration');
const User = require('../models/User');
const LicenseHistory = require('../models/LicenseHistory');
const Payment = require('../models/Payment');
const PaymentConfiguration = require('../models/PaymentConfiguration');
const Facture = require('../models/Facture');
const { createAuthCode } = require("../services/auth");
const sendEmail = require('../utils/sendMail');
const addActivityLog = require("../utils/addActivityLog");
const geoip = require('geoip-lite');
const { 
  stripe,
  updateSubscriptionPrice,
  createSubscription,
  createCustomer,
  getCustomerByEmail,
  createProduct,
  getProductByName,
  createCustomIntervalPrice,
  cancelSubscription,
  disableEnableAutoRenewal,
  finalizeSubscription
} = require('../utils/stripe');
const { createNotification } = require('../utils/notification');
const TemporaryOrder = require('../models/TemporaryOrder');

exports.freeTrialCommande = async (req, res) => {
  try {
    const {
      userId,
      licenses,
      users,
      id_coupon,
      totalPayer,
      message,
      expirationDate,
      autoRenewal,
      id_paiement,
      idRental,
      paymentMethodId,
      freeTrial = false,
      tva,
      daysUntilExpiration
    } = req.body;

    if(idRental) {
      return;
    }

    if(!freeTrial || licenses > 1 || users.length !== licenses || !expirationDate) {
      return res.status(400).json({ message: "Informations nécessaires non incluses" });
    }

    const userIdReq = userId || req.user.id;
    const user = await User.findById(userIdReq);

    // Vérification des licences existantes
    for (const license of users) {
      if (!license.id) {
        const registration = await Registration.find({
          computerCode: license.identificationCode,
          $or: [
            { rentalId: { $exists: true } },
          ],
        });

        const now = new Date();
        const activeRegistration = registration.find(reg => 
          reg.status !== 'expire' && new Date(reg.expirationDate) > now
        );

        if (activeRegistration) {
          return res.status(409).json({
            message: 'Une licence active existe déjà pour cet ordinateur.'
          });
        }
      }
    }

    const rental = new Rental({
      userId: user._id,
      duration: daysUntilExpiration,
      startDate: new Date(),
      price: totalPayer,
      message,
      status: "pending",
      deductionAuto: autoRenewal,
      nextBillingDate: expirationDate
    });
    await rental.save();

    // Registration of each license:
    let listIds = [];

    for (const license of users) {
      // Create new registration
      let registration = new Registration({
        userId: user,
        rentalId: rental._id,
        company: user.company,
        username: license.username,
        status: "pending",
        computerName: license.computerName,
        computerCode: license.identificationCode,
        expirationDate
      });
  
      await registration.save();
      listIds.push(registration._id);

      // Create license history for each registration
      let licenseHistory = new LicenseHistory({
        registerId: registration._id,
        startAt: new Date(),
        expirationDate
      });
    
      await licenseHistory.save();
    }

    // process of payment
    let payment = new Payment({
      operatorId: "",
      userId: userIdReq,
      couponId: id_coupon || null,
      type: userIdReq === req.user.id ? "free" : "cash",
      status: "success",
      totalPricePay: totalPayer,
      paymentConfigId: id_paiement,
      currency: "€",
      stripePayId: "",
      tva
    });
    await payment.save();

    // update rental
    const updateRental = await Rental.findById(rental._id)
    updateRental.status = "active";
    updateRental.payId = payment._id;
    updateRental.nextBillingDate = expirationDate;
    updateRental.duration = daysUntilExpiration;
    await updateRental.save();

    const emailSociete = await User.findOne({ mainAccount: true })
    for (const license of users) {
      let expDate = new Date(expirationDate);
      let codeAuth = await createAuthCode(license.identificationCode, expDate);
      const code = codeAuth.data.code;

      let update = {
        status: "freetrial",
        authCode: code,
      };
    
      let result = await Registration.updateOne(
        { computerName: license.computerName, computerCode: license.identificationCode },
        { $set: update }
      );

      const email = license.email !== ""? license.email : user.email;
      const data = { computerName: license.computerName, username: license.username, rental: updateRental };
      await sendEmail({
        type: "auth-code",
        email,
        code,
        data,
        user
      });

      if(emailSociete?.factureMail) {
        await sendEmail({
          type: "auth-code",
          email: emailSociete.factureMail,
          code,
          data,
          user
        });
      }
    }

    const geo = geoip.lookup(req.realIp);
    const country = geo?.country || "Auter";

    if(userIdReq !== req.user.id) {
      // this is a license for client not for Admin
      await createNotification({
        target: user._id,
        title: "Nouvelle location Ferracad activée",
        type: "Location",
        description: `Votre abonnement Ferracad a été créé avec succès par l'admin.`,
        link: "/tableau-de-board/commande"
      });
    }

    await addActivityLog({
      userId: userIdReq,
      userType: user.role,
      action: "New Order",
      actionId: rental._id,
      idAdress: req.realIp,
      country
    });
    
    return res.status(201).json({ valid: true, id: updateRental._id })
  } catch (error) {
    console.error(err);
    return res.status(500).json({ message: 'Server error on rental' });
  }
}

exports.createPaymentIntent = async (req, res) => {
  try {
    const {
      userId,
      licenses,
      users,
      id_coupon,
      totalPayer,
      message,
      expirationDate,
      autoRenewal,
      id_paiement,
      idRental,
      paymentMethodId,
      freeTrial = false,
      tva,
      daysUntilExpiration
    } = req.body;

    // Validations de base
    if (licenses < 1 || users.length !== licenses || !expirationDate || !paymentMethodId) {
      return res.status(400).json({ message: "Informations nécessaires non incluses" });
    }

    const userIdReq = userId || req.user.id;
    const user = await User.findById(userIdReq);

    // Vérification des licences existantes
    for (const license of users) {
      if (!license.id) {
        const registration = await Registration.find({
          computerCode: license.identificationCode,
          $or: [
            { rentalId: { $exists: true } },
          ],
        });

        const now = new Date();
        const activeRegistration = registration.find(reg => 
          reg.status !== 'expire' && new Date(reg.expirationDate) > now
        );

        if (activeRegistration) {
          return res.status(409).json({
            message: 'Une licence active existe déjà pour cet ordinateur.'
          });
        }
      }
    }

    // Calcul du montant
    const amount = Math.round(totalPayer * 100).toFixed(0); // Conversion en cents

    // Créer ou récupérer le customer Stripe
    let getCustomer = await getCustomerByEmail(user.email);
    if (!getCustomer) {
      getCustomer = await createCustomer(user.email);
    }

    // Attacher le payment method au customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: getCustomer.id,
    });

    await stripe.customers.update(getCustomer.id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Créer le Payment Intent avec 3DS
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      customer: getCustomer.id,
      payment_method: paymentMethodId,
      confirmation_method: 'automatic' ,
      capture_method: 'automatic',
      confirm: false, // Important: ne pas confirmer immédiatement
      payment_method_types: ['card'],
      setup_future_usage: 'off_session',
    });

    // Sauvegarder temporairement les données de la commande
    const temporaryOrder = new TemporaryOrder({
      paymentIntentId: paymentIntent.id,
      userId: userIdReq,
      formData: req.body,
      status: 'pending_3ds'
    });
    await temporaryOrder.save();

    res.json({
      client_secret: paymentIntent.client_secret,
      requires_action: paymentIntent.status === 'requires_action',
      payment_intent_id: paymentIntent.id
    });

  } catch (error) {
    console.error("❌ [createPaymentIntent] Error:", error);

    // Gestion des erreurs Stripe
    if (error.type === 'StripeCardError') {
      return res.status(402).json({
        message: 'Paiement refusé. Veuillez vérifier votre moyen de paiement.',
        error: error.message
      });
    }

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        message: 'Erreur de requête Stripe. Veuillez réessayer.',
        error: error.message
      });
    }

    return res.status(500).json({
      message: 'Erreur lors de la création de l\'intention de paiement.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    // Récupérer et confirmer le Payment Intent
    let paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'requires_confirmation') {
      return res.status(200).json({
        requires_action: true,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id
      });
    }

    // Si le statut n'est pas succeeded, échouer
    else if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        message: `Paiement non réussi. Statut: ${paymentIntent.status}`,
        status: paymentIntent.status
      });
    }

    // Récupérer les données temporaires
    const temporaryOrder = await TemporaryOrder.findOne({ 
      paymentIntentId: paymentIntentId 
    });
    
    if (!temporaryOrder) {
      return res.status(404).json({ 
        message: "Commande temporaire non trouvée" 
      });
    }

    const formData = temporaryOrder.formData;
    const {
      paymentMethodId,
      userId,
      licenses,
      users,
      id_coupon,
      totalPayer,
      message,
      expirationDate,
      autoRenewal,
      idRental,
      freeTrial = false,
      tva,
      daysUntilExpiration
    } = formData;

    // Validation du paymentMethodId
    if (!paymentMethodId || typeof paymentMethodId !== 'string') {
      return res.status(400).json({
        message: "Identifiant de méthode de paiement invalide"
      });
    }

    const userIdReq = userId || req.user.id;
    const user = await User.findById(userIdReq);

    // Créer la location
    let rental;
    let newSub;

    if (idRental) {
      const getRental = await Rental.findById(idRental);
      if (!getRental) {
        return res.status(404).json({ message: "La commande n'existe pas" });
      }

      const registrationCount = await Registration.countDocuments({ rentalId: getRental._id });
      if (registrationCount !== users.length) {
        newSub = true;
        rental = new Rental({
          userId: user._id,
          duration: daysUntilExpiration,
          startDate: new Date(),
          message,
          price: totalPayer,
          status: "pending",
          subscriptionId: "",
          deductionAuto: autoRenewal,
          nextBillingDate: expirationDate
        });

      } else {
        newSub = false;
        rental = await Rental.findOneAndUpdate(
          { _id: idRental },
          { $set: { expirationDate, status: "pending" } },
          { new: true }
        );
      }
    } else {
      newSub = true;
      rental = new Rental({
        userId: user._id,
        duration: daysUntilExpiration,
        startDate: new Date(),
        message,
        price: totalPayer,
        status: "pending",
        subscriptionId: "",
        deductionAuto: autoRenewal,
        nextBillingDate: expirationDate
      });
    }
    await rental.save();

    // Enregistrement des licences
    let listIds = [];
    for (const license of users) {
      let registration;

      if (license.email) {
        license.email = license.email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(license.email)) {
          return res.status(400).json({ message: "Adresse e-mail invalide." });
        }
      }

      if (license.id) {
        registration = await Registration.findOneAndUpdate(
          { _id: license.id },
          {
            $set: {
              rentalId: rental._id,
              expirationDate,
              status: "pending"
            }
          },
          { new: true }
        );
        listIds.push(registration._id);
      } else {
        const checkRegistration = await Registration.findOne({
          computerCode: license.identificationCode,
        });
        
        // If registration exists → update it
        if (checkRegistration) {
          registration = await Registration.findOne({ computerCode: license.identificationCode })
          registration.rentalId = rental._id;
          registration.status = "pending";
          registration.username = license.username;
          registration.computerName = license.computerName;
          registration.expirationDate = expirationDate;
          registration.company = user.company;
          registration.userId = user._id || user
          await registration.save();
        } else {
          // Otherwise, create a new one
          registration = new Registration({
            userId: user._id || user,
            rentalId: rental._id,
            company: user.company,
            username: license.username,
            status: "pending",
            computerName: license.computerName,
            computerCode: license.identificationCode,
            expirationDate,
          });
        
          await registration.save();
        }
        
        listIds.push(registration._id);
      }

      // Créer l'historique de licence
      const licenseHistory = new LicenseHistory({
        registerId: registration._id,
        startAt: new Date(),
        expirationDate
      });
      await licenseHistory.save();
    }

    // Processus Stripe
    let getProduct = await getProductByName('Ferracad');
    const pricePay = (totalPayer * 100).toFixed(0);

    if (!getProduct) {
      const createNewProduct = await createProduct("Ferracad", "Ferracad a plugin for autocad and zwcad and revit", "service");
      if (createNewProduct) {
        getProduct = await getProductByName('Ferracad');
      }
    }

    let subscription;
    let priceProcess;
    let getCustomer = await getCustomerByEmail(user.email);

    // Créer le paiement en base
    let payment = new Payment({
      operatorId: "",
      userId: userIdReq,
      couponId: id_coupon || null,
      type: freeTrial ? "free" : "stripe",
      status: "unsuccess",
      totalPricePay: totalPayer,
      paymentConfigId: paymentIntent.payment_method,
      currency: "€",
      stripePayId: "",
      tva
    });
    await payment.save();

    // Gestion des abonnements
    const getRental = await Rental.findById(idRental);

    if (idRental && getRental.subscriptionId) {
      const isAutoDeduction = getRental.deductionAuto;
      const paymentRentalId = await Payment.findOne({ _id: getRental.payId });

      if (!paymentRentalId?.operatorId) {
        return res.status(400).json({ message: "Aucune souscription Stripe existante pour cette commande." });
      }

      if (newSub) {
        priceProcess = await createCustomIntervalPrice(getProduct.id, pricePay, daysUntilExpiration, 'day');
        if (!priceProcess) return res.status(500).json({ message: "Erreur lors de la création du prix Stripe" });

        // Créer l'abonnement APRÈS le paiement réussi
        const subscriptionResult = await createSubscriptionWithPrepaid(
          getCustomer.id, 
          priceProcess.id, 
          paymentIntentId, 
          autoRenewal,
          expirationDate
        );

        // Si l'abonnement nécessite une action 3DS
        if (subscriptionResult.requires_action) {
          return res.status(200).json({
            requires_action: true,
            client_secret: subscriptionResult.client_secret,
            payment_intent_id: subscriptionResult.payment_intent_id,
            message: "Authentification 3D Secure requise pour l'abonnement"
          });
        }

        subscription = subscriptionResult;

        if (!subscription) {
          await Rental.findByIdAndUpdate(rental._id, { status: 'failed' });
          await Payment.findByIdAndUpdate(payment._id, { status: 'failed' });
          return res.status(500).json({ message: 'Échec de la création de l\'abonnement Stripe' });
        }
  
        // VÉRIFICATION PLUS FLEXIBLE DU STATUT
        if (subscription.status !== 'active' && subscription.status !== 'trialing') {
          console.warn("Subscription not fully active:", subscription.status);
          // Mais continuer quand même - Stripe gérera le paiement
        }

        // Mettre à jour l'ancien abonnement
        const registrationCount = await Registration.countDocuments({ rentalId: getRental._id });
        const basedPrice = (5 * registrationCount * getRental.duration) * 100;
        const newPrice = (basedPrice * (tva / 100) + basedPrice);
        const updateRentalPrice = await Rental.findById(getRental._id);
        updateRentalPrice.price = newPrice / 100;
        updateRentalPrice.save();
        
        const newCustomPrice = await createCustomIntervalPrice(getProduct.id, newPrice, getRental.duration, 'day');
        if (!newCustomPrice) return res.status(500).json({ message: "Erreur lors de la création du prix Stripe" });

        await updateSubscriptionPrice(paymentRentalId.operatorId, newCustomPrice.id, isAutoDeduction);
      } else {
        // Mettre à jour l'abonnement existant
        priceProcess = await createCustomIntervalPrice(getProduct.id, pricePay, daysUntilExpiration, 'day');
        if (!priceProcess) return res.status(500).json({ message: "Erreur lors de la création du prix Stripe" });

        const trialEndTimestamp = Math.floor(new Date(expirationDate).getTime() / 1000);
        subscription = await updateSubscriptionPrice(
          paymentRentalId.operatorId, 
          priceProcess.id, 
          isAutoDeduction, 
          trialEndTimestamp, 
          daysUntilExpiration, 
          pricePay
        );
      }
    } else {
      // Nouvel abonnement
      priceProcess = await createCustomIntervalPrice(getProduct.id, pricePay, daysUntilExpiration, 'day');
      if (!priceProcess) return res.status(500).json({ message: "Erreur lors de la création du prix Stripe" });

      // Créer l'abonnement APRÈS le paiement réussi
      const subscriptionResult = await createSubscriptionWithPrepaid(
        getCustomer.id, 
        priceProcess.id, 
        paymentIntentId, 
        autoRenewal,
      );

      // Si l'abonnement nécessite une action 3DS
      if (subscriptionResult.requires_action) {
        return res.status(200).json({
          requires_action: true,
          client_secret: subscriptionResult.client_secret,
          payment_intent_id: subscriptionResult.payment_intent_id,
          message: "Authentification 3D Secure requise pour l'abonnement"
        });
      }

      subscription = subscriptionResult;
      console.log("subscription: ", subscription)
      if (!subscription) {
        await Rental.findByIdAndUpdate(rental._id, { status: 'failed' });
        await Payment.findByIdAndUpdate(payment._id, { status: 'failed' });
        return res.status(500).json({ message: 'Échec de la création de l\'abonnement Stripe' });
      }

      // VÉRIFICATION PLUS FLEXIBLE DU STATUT
      if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        console.warn("Subscription not fully active:", subscription.status);
        // Mais continuer quand même - Stripe gérera le paiement
      }
    }

    // Mettre à jour la location et le paiement
    const updateRental = await Rental.findById(rental._id);
    updateRental.payId = payment._id;
    updateRental.nextBillingDate = expirationDate;
    updateRental.duration = daysUntilExpiration;
    updateRental.subscriptionId = subscription.id;
    updateRental.status = "active";
    await updateRental.save();

    await Payment.findByIdAndUpdate(payment._id, {
      operatorId: subscription.id,
      status: "success",
      stripePayId: priceProcess.id
    });

    const user_data = await User.findById(userIdReq) 
    const dataUser = {
      name: user_data?.name,
      email: user_data?.email,
      company: user_data?.company,
      address: user_data?.address,
      vatNumber: user_data?.nTva,
      phone: user_data?.phone,
      country: user_data?.country,
    }

    // Get current year and month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // months are 0-based

    // Count how many invoices already exist for this year and month
    const currentCount = await Facture.countDocuments({
      startFrom: {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${month}-31`),
      },
    });

    // Generate index (001, 002, etc.)
    const index = String(currentCount + 1).padStart(3, "0");

    // Combine everything
    const factureId = `N°${year}${month}/${index}`;

    // Créer la facture
    const createFacture = new Facture({
      userId: userIdReq,
      factureId: factureId,
      userData: dataUser,
      payId: payment._id,
      registrationIds: listIds,
      startFrom: new Date(),
      endAt: expirationDate
    });
    await createFacture.save();

    const emailSociete = await User.findOne({ mainAccount: true })
    // Activer les licences
    for (const license of users) {
      let expDate = new Date(expirationDate);
      let codeAuth = await createAuthCode(license.identificationCode, expDate);
      let code = codeAuth.data.code;
      

      await Registration.updateOne(
        { computerName: license.computerName, computerCode: license.identificationCode },
        { 
          $set: {
            status: freeTrial? "freetrial" : "active",
            authCode: code,
          }
        }
      );

      const email = license.email !== "" ? license.email : user.email;
      const data = { computerName: license.computerName, username: license.username, rental };
      await sendEmail({
        type: "auth-code",
        email,
        code,
        data,
        user
      });

      if(emailSociete?.factureMail) {
        await sendEmail({
          type: "auth-code",
          email: emailSociete.email,
          code,
          data,
          user
        });
      }
    }

    // Logs et notifications
    const geo = geoip.lookup(req.realIp);
    const country = geo?.country || "Auter";

    await addActivityLog({
      userId: userIdReq,
      userType: user.role,
      action: "New Order",
      actionId: rental._id,
      idAdress: req.realIp,
      country
    });

    const listOfUsers = await User.find({ role: "admin" }, { _id: 1 });
    await Promise.all(
      listOfUsers.map(async userId =>
        await createNotification({
          target: userId._id,
          title: "Nouvelle commande Ferracad 🧾",
          type: "Commande",
          description: `${user.name} a enregistré une nouvelle location Ferracad € ${totalPayer} pour ${daysUntilExpiration} jours`,
          link: "/tableau-de-board/commande"
        })
      )
    );

    // Supprimer la commande temporaire
    await TemporaryOrder.deleteOne({ paymentIntentId: paymentIntentId });

    return res.status(201).json({ valid: true, id: updateRental._id });

  } catch (error) {
    console.error("❌ [confirmPayment] Error:", error);

    await TemporaryOrder.updateOne(
      { paymentIntentId: req.body.paymentIntentId },
      { status: 'failed', error: error.message }
    );

    return res.status(500).json({
      message: 'Erreur lors de la confirmation du paiement.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

async function createSubscriptionWithPrepaid(customerId, priceId, paymentIntentId, deductionAuto = true, expirationDate = null) {
  try {
    console.log("Creating subscription with payment intent:", paymentIntentId);
    
    // Récupérer le Payment Intent confirmé
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log("Payment Intent details:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      payment_method: paymentIntent.payment_method
    });

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment Intent not succeeded');
    }

    // S'assurer que le payment method est attaché au customer
    try {
      await stripe.paymentMethods.attach(paymentIntent.payment_method, {
        customer: customerId,
      });
      console.log("Payment method attached to customer");
    } catch (attachError) {
      console.log("Payment method attachment note:", attachError.message);
    }

    // Mettre à jour le customer avec la méthode de paiement par défaut
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentIntent.payment_method,
      },
    });

    // CORRECTION : Utiliser allow_incomplete au lieu de pending_if_incomplete
    const subscriptionData = {
      customer: customerId,
      items: [{ price: priceId }],
      collection_method: "send_invoice", // Ne pas collecter automatiquement
      days_until_due: 30,
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      proration_behavior: "none",
      cancel_at_period_end: !deductionAuto,
    };

    // Remplacer la partie trial_end par :
    if (expirationDate) {
      const billingCycleAnchor = Math.floor(new Date(expirationDate).getTime() / 1000);
      subscriptionData.trial_end = billingCycleAnchor;
      console.log("Billing cycle anchor set to:", expirationDate, "(", billingCycleAnchor, ")");
    }

    const subscription = await stripe.subscriptions.create(subscriptionData);

    console.log("Subscription created:", {
      id: subscription.id,
      status: subscription.status,
      latest_invoice_status: subscription.latest_invoice?.status,
      payment_intent_status: subscription.latest_invoice?.payment_intent?.status
    });

    return subscription;
  } catch (error) {
    console.error("Error creating subscription with prepaid:", {
      message: error.message,
      type: error.type,
      code: error.code
    });
    throw error;
  }
}

exports.createRental = async (req, res) => {
  try {
    const {
      userId,
      licenses,
      users,
      id_coupon,
      totalPayer,
      message,
      expirationDate,
      autoRenewal,
      id_paiement,
      idRental,
      paymentMethodId,
      freeTrial = false,
      tva,
      daysUntilExpiration, 
      startDate
    } = req.body;

    if(
      licenses < 1 || 
      users.length !== licenses || 
      !expirationDate || 
      !paymentMethodId
    ){
      return res.status(400).json({ message: "Informations nécessaires non incluses" });
    }
    const userIdReq = userId || req.user.id;
    const user = await User.findById(userIdReq);

    let rental;
    for (const license of users) {
      if(!license.id) {
        const registration = await Registration.find({
          computerCode: license.identificationCode,
          $or: [
            { rentalId: { $exists: true } },
          ],
        });

        if(registration.length > 0) {
          return res.status(409).json({
            message: 'Un enregistrement avec cette valeur existe déjà.'
          }); 
        }
      }
    }

    // Rental  
    let newSub;
    if(idRental) {
      const getRental = await Rental.findById(idRental);
      if(!getRental){
        return res.status(404).json({ message: "La commande n'existe pas" });
      }

      const registrationCount = await Registration.countDocuments({ rentalId: getRental._id });
      if(registrationCount !== users.length) {
        newSub = true;
        rental = new Rental({
          userId: user._id,
          duration: daysUntilExpiration,
          startDate: startDate || new Date(),
          message,
          price: totalPayer,
          status: "pending",
          subscriptionId: "",
          deductionAuto: autoRenewal,
          nextBillingDate: expirationDate
        });
      } else {
        newSub = false;
        rental = await Rental.findOneAndUpdate(
          { _id: idRental },
          { $set: { expirationDate, status: "pending" } },
          { new: true }
        );
      }
    } else {
      newSub = true;
      rental = new Rental({
        userId: user._id,
        duration: daysUntilExpiration,
        startDate: startDate || new Date(),
        message,
        price: totalPayer,
        status: "pending",
        subscriptionId: "",
        deductionAuto: autoRenewal,
        nextBillingDate: expirationDate
      });
    }
    await rental.save();

    // Registration of each license:
    let listIds = [];
    for (const license of users) {
      let registration;
      let licenseHistory;
      if (license.email) {
        license.email = license.email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(license.email)) {
          return res.status(400).json({ message: "Adresse e-mail invalide." });
        }
      }      

      if (license.id) {
        // Update existing registration
        registration = await Registration.findOneAndUpdate(
          { _id: license.id },
          {
            $set: {
              rentalId: rental._id,
              expirationDate,
              status: "pending"
            }
          },
          { new: true }
        );
    
        // Add the updated registration ID to list
        listIds.push(registration._id);
      } else {
        // Create new registration
        registration = new Registration({
          userId: user,
          rentalId: rental._id,
          company: user.company,
          username: license.username,
          status: "pending",
          computerName: license.computerName,
          computerCode: license.identificationCode,
          expirationDate
        });
    
        await registration.save();
        listIds.push(registration._id);
      }
    
      // Create license history for each registration
      licenseHistory = new LicenseHistory({
        registerId: registration._id,
        startAt: new Date(),
        expirationDate
      });
    
      await licenseHistory.save();
    }
    
    // process of payment
    let getProduct = await getProductByName('Ferracad')
    const pricePay = totalPayer * 100;
    if(!getProduct) {
      const createNewProduct = await createProduct("Ferracad", "Ferracad a plugin for autocad and zwcad and revit", "service");
      if(createNewProduct) {
        getProduct = await getProductByName('Ferracad')
      }
    }

    let subscription;
    let priceProcess;
    let getCustumer = await getCustomerByEmail(user.email)
    if(!getCustumer){
      // create custumer
      getCustumer = await createCustomer(user.email);
    }

    let payment = new Payment({
      operatorId: "",
      userId: userIdReq,
      couponId: id_coupon || null,
      type: freeTrial ? "free" : "stripe",
      status: "unsuccess",
      totalPricePay: totalPayer,
      paymentConfigId: paymentMethodId,
      currency: "€",
      stripePayId: "",
      tva
    });
    await payment.save();

    // payment and subscription process 
    try {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: getCustumer.id,
      });

      await stripe.customers.update(getCustumer.id, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      if(idRental) {
        const getRental = await Rental.findById(idRental);
        if(!getRental){
          return res.status(404).json({ message: "La commande n'existe pas" });
        }

        const duration = getRental.duration;
        const isAutoDeduction = getRental.deductionAuto;
        const paymentRentalId = await Payment.findOne({ _id: getRental.payId });

        if (!paymentRentalId?.operatorId) {
          return res.status(400).json({ message: "Aucune souscription Stripe existante pour cette commande." });
        }

        // update subscription of stripe and create new one for new order updateSubscriptionPrice
        if(newSub) {
          priceProcess = await createCustomIntervalPrice(getProduct.id, pricePay, daysUntilExpiration, 'day');
          if (!priceProcess) return res.status(500).json({ message: "Erreur lors de la création du prix Stripe" });

          const trialEndTimestamp = Math.floor(new Date(expirationDate).getTime() / 1000);
          subscription = await createSubscription(getCustumer.id, priceProcess.id, autoRenewal, null, trialEndTimestamp);
          if (!subscription) {
            await Rental.findByIdAndUpdate(rental._id, { status: 'failed' });
            await Payment.findByIdAndUpdate(payment._id, { status: 'failed' });
            return res.status(500).json({ message: 'Échec de la création de l’abonnement Stripe' });
          }

          // modify the price of idRental subscription
          const registrationCount = await Registration.countDocuments({ rentalId: getRental._id });
          const basedPrice = (5 * registrationCount * duration) * 100
          const newPrice = (basedPrice * (tva / 100) + basedPrice);
          const newCustomPrice = await createCustomIntervalPrice(getProduct.id, newPrice, duration, 'day');
          if (!newCustomPrice) return res.status(500).json({ message: "Erreur lors de la création du prix Stripe" });
          const updateRentalPrice = await Rental.findById(getRental._id);
          updateRentalPrice.price = newPrice / 100;
          updateRentalPrice.save();

          await updateSubscriptionPrice(paymentRentalId.operatorId, newCustomPrice.id, isAutoDeduction)
        } else {
          // apply the payment and modify next belling Date
          const today = new Date();
          priceProcess = await createCustomIntervalPrice(getProduct.id, pricePay, daysUntilExpiration, 'day');
          if (!priceProcess) return res.status(500).json({ message: "Erreur lors de la création du prix Stripe" });

          const trialEndTimestamp = Math.floor(new Date(expirationDate).getTime() / 1000);
          subscription = await updateSubscriptionPrice(paymentRentalId.operatorId, priceProcess.id, isAutoDeduction, trialEndTimestamp, daysUntilExpiration, pricePay)
        }
      } else {
        // test end
        priceProcess = await createCustomIntervalPrice(getProduct.id, pricePay, daysUntilExpiration, 'day');
        if (!priceProcess) return res.status(500).json({ message: "Erreur lors de la création du prix Stripe" });
      
        subscription = await createSubscription(getCustumer.id, priceProcess.id, autoRenewal);
        if (!subscription) {
          await Rental.findByIdAndUpdate(rental._id, { status: 'failed' });
          await Payment.findByIdAndUpdate(payment._id, { status: 'failed' });
          return res.status(500).json({ message: 'Échec de la création de l’abonnement Stripe' });
        }
      }
    } catch (error) {
      console.error("[Stripe Payment Process Error]:", {
        message: error.message,
        type: error.type,
        stack: error.stack
      });
    
      // Rollback Rental status
      if(idRental) {
        const updateRental = await Rental.findById(rental._id);
        if (updateRental) {
          updateRental.payId = payment._id;
          updateRental.status = "inactive";
          await updateRental.save();
        }
      
        // Rollback license statuses
        await Promise.all(
          users.map(async (license) => {
            await Registration.updateOne(
              { computerName: license.computerName, computerCode: license.identificationCode },
              { $set: { status: "inactive" } }
            );
          })
        );
      } else {
        await Payment.deleteOne({ _id: payment._id });
        await Registration.deleteMany({ rentalId: rental._id });
        await Rental.deleteOne({ _id: rental._id })
      }
    
      // Handle Stripe specific errors
      if (error.type === "StripeCardError") {
        return res.status(402).json({
          message: "Le paiement a été refusé. Veuillez vérifier votre moyen de paiement.",
          error: error.message
        });
      }
    
      if (error.type === "StripeInvalidRequestError") {
        return res.status(400).json({
          message: "Erreur de requête Stripe. Veuillez réessayer.",
          error: error.message
        });
      }
    
      if (error.type === "StripeAPIError") {
        return res.status(502).json({
          message: "Problème de communication avec Stripe.",
          error: error.message
        });
      }
    
      // Handle database errors
      if (error.name === "MongoError" || error.name === "MongooseError") {
        return res.status(500).json({
          message: "Erreur base de données lors du traitement de la commande.",
          error: error.message
        });
      }
    
      // Generic fallback
      return res.status(500).json({
        message: "Une erreur est survenue lors du processus de paiement.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }

    // console.log("payment success: ", subscription, priceProcess, getCustumer)
    const updateRental = await Rental.findById(rental._id) ;
    updateRental.payId = payment._id;
    updateRental.nextBillingDate = expirationDate;
    updateRental.duration = daysUntilExpiration;
    updateRental.subscriptionId = subscription.id;
    updateRental.status = "active"; 
    await updateRental.save();

    // update payment
    await Payment.findByIdAndUpdate(payment._id, {
      operatorId: subscription.id,
      status: "success",
      stripePayId: priceProcess.id
    });

    const user_data = await User.findById(userIdReq) 
    const dataUser = {
      name: user_data?.name,
      email: user_data?.email,
      company: user_data?.company,
      address: user_data?.address,
      vatNumber: user_data?.nTva,
      phone: user_data?.phone,
      country: user_data?.country,
    }

    // Get current year and month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // months are 0-based

    // Count how many invoices already exist for this year and month
    const currentCount = await Facture.countDocuments({
      startFrom: {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${month}-31`),
      },
    });

    // Generate index (001, 002, etc.)
    const index = String(currentCount + 1).padStart(3, "0");

    // Combine everything
    const factureId = `N°${year}${month}/${index}`;
    const createFacture = new Facture({
      userId: userIdReq,
      factureId: factureId,
      userData: dataUser,
      payId: payment._id,
      registrationIds: listIds,
      startFrom: new Date(),
      endAt: expirationDate
    });
    createFacture.save();
    
    const emailSociete = await User.findOne({ mainAccount: true })

    // active License:
    for (const license of users) {
      let expDate = new Date(expirationDate);
      let codeAuth = await createAuthCode(license.identificationCode, expDate);
      let code = codeAuth.data.code;
      let update = {
        status: "active",
        authCode: code,
      };
    
      await Registration.updateOne(
        { computerName: license.computerName, computerCode: license.identificationCode },
        { $set: update }
      );
      const email = license.email !== ""? license.email : user.email;

      const data = { computerName: license.computerName, username: license.username, rental };
      await sendEmail({
        type: "auth-code",
        email,
        code,
        data,
        user
      });
      if(emailSociete?.factureMail) {
        await sendEmail({
          type: "auth-code",
          email: emailSociete.email,
          code,
          data,
          user
        });
      }
    }

    const geo = geoip.lookup(req.realIp);
    const country = geo?.country || "Auter";

    await addActivityLog({
      userId: userIdReq,
      userType: user.role,
      action: "New Order",
      actionId: rental._id,
      idAdress: req.realIp,
      country
    });

    const listOfUsers = await User.find({ role: "admin" }, { _id: 1 });
    await Promise.all(
      listOfUsers.map(async userId =>
        await createNotification({
          target: userId._id,
          title: "Nouvelle commande Ferracad 🧾",
          type: "Commande",
          description: `${user.name} a enregistré une nouvelle location Ferracad € ${totalPayer} pour ${daysUntilExpiration} jours`,
          link: "/tableau-de-board/commande"
        })
      )
    );
    return res.status(201).json({ valid: true, id: updateRental._id })
  } catch (err) {
    console.error("❌ [createRental] Error:", err);
  
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Un enregistrement avec cette valeur existe déjà.',
        field: Object.keys(err.keyValue)[0],
        value: err.keyValue[Object.keys(err.keyValue)[0]],
      });
    }
  
    // Handle Stripe errors
    if (err.type === 'StripeCardError') {
      return res.status(402).json({
        message: 'Paiement refusé. Veuillez vérifier votre moyen de paiement.',
        error: err.message
      });
    }
    if (err.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        message: 'Requête Stripe invalide. Veuillez réessayer.',
        error: err.message
      });
    }
  
    // Handle validation errors (Mongoose)
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        message: 'Erreur de validation.',
        errors: messages
      });
    }
  
    // Handle cast errors (e.g. invalid Mongo ObjectId)
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: `Identifiant invalide pour le champ ${err.path}.`
      });
    }
  
    // Fallback for unexpected errors
    return res.status(500).json({
      message: 'Une erreur interne est survenue lors de la création de la location.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.createCommandByAdmin = async (req, res) => {
  try {
    const {
      userId,
      licenses,
      users,
      id_coupon,
      totalPayer,
      message,
      expirationDate,
      autoRenewal,
      id_paiement,
      idRental,
      tva,
      freetrial,
      startDate = new Date(),
      sendFacture
    } = req.body;

    if(
      licenses < 1 || 
      users.length !== licenses || 
      !expirationDate 
    ) {
      return res.status(400).json({ message: "Informations nécessaires non incluses" });
    }

    const today = new Date();
    const expiration = new Date(expirationDate);
    // Calculate the difference in milliseconds
    const diffTime = expiration.getTime() - today.getTime();
    // Convert milliseconds to days
    const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const userIdReq = userId || req.user.id
    const user = await User.findById(userIdReq)

    // Rental
    let rental;

    for (const license of users) {
      if(!license.id) {
        const registration = await Registration.find({
          computerCode: license.identificationCode,
          $or: [
            { rentalId: { $exists: true } },
          ],
        });

        if(registration.length > 0) {
          return res.status(409).json({
            message: 'Un enregistrement avec cette valeur existe déjà.'
          }); 
        }
      }
    }

    if(idRental) {
      const getRental = await Rental.findById(idRental);
      if(!getRental){
        return res.status(404).json({ message: "La commande n'existe pas" });
      }

      const registrationCount = await Registration.countDocuments({ rentalId: getRental._id });

      if(registrationCount !== users.length) {
        rental = new Rental({
          userId: user._id,
          duration: daysUntilExpiration,
          startDate: startDate || new Date(),
          message,
          price: totalPayer,
          status: "pending",
          deductionAuto: autoRenewal,
          nextBillingDate: expirationDate
        });
      } else {
        rental = await Rental.findOneAndUpdate(
          { _id: idRental },
          { $set: { expirationDate, status: "pending", userId: user._id || user }},
          { new: true }
        );
      }
    } else {
      rental = new Rental({
        userId: user._id,
        duration: daysUntilExpiration,
        startDate: startDate || new Date(),
        price: totalPayer,
        message,
        status: "pending",
        deductionAuto: autoRenewal,
        nextBillingDate: expirationDate
      });
    }
    await rental.save();

    // Registration of each license:
    let listIds = [];

    for (const license of users) {
      let registration;
      let licenseHistory;
    
      if (license.id) {
        // Update existing registration
        registration = await Registration.findOneAndUpdate(
          { _id: license.id },
          {
            $set: {
              username: license.username,
              computerName: license.username,
              email: license.email,
              userId: user._id || user,
              computerCode: license.identificationCode,
              rentalId: rental._id,
              expirationDate,
              status: "pending"
            }
          },
          { new: true }
        );
    
        // Add the updated registration ID to list
        listIds.push(registration._id);
      } else {
        const checkRegistration = await Registration.findOne({
          computerCode: license.identificationCode,
        });
        
        // If registration exists → update it
        if (checkRegistration) {
          registration = await Registration.findOne({ computerCode: license.identificationCode })
          registration.rentalId = rental._id;
          registration.status = "pending";
          registration.username = license.username;
          registration.computerName = license.computerName;
          registration.expirationDate = expirationDate;
          registration.userId = user._id || user;
          registration.company = user.company;
          await registration.save();
        } else {
          // Otherwise, create a new one
          registration = new Registration({
            userId: user._id || user,
            rentalId: rental._id,
            company: user.company,
            username: license.username,
            status: "pending",
            computerName: license.computerName,
            computerCode: license.identificationCode,
            expirationDate,
          });
        
          await registration.save();
        }
        
        listIds.push(registration._id);
      }
    
      // Create license history for each registration
      licenseHistory = new LicenseHistory({
        registerId: registration._id,
        startAt: new Date(),
        expirationDate
      });

      await licenseHistory.save();
    }

    // process of payment
    let payment;
    if(user.role === "client" && sendFacture) {
      payment = new Payment({
        operatorId: "",
        userId: userIdReq,
        couponId: id_coupon || null,
        type: userIdReq === req.user.id ? "free" : "cash",
        status: "success",
        totalPricePay: totalPayer,
        paymentConfigId: id_paiement,
        currency: "€",
        stripePayId: "",
        tva
      });
      await payment.save();
    }

    // update rental
    const updateRental = await Rental.findById(rental._id)
    updateRental.status = "active";
    updateRental.payId = user.role === "client" && sendFacture ? payment._id : null;
    updateRental.nextBillingDate = expirationDate;
    updateRental.duration = daysUntilExpiration;
    await updateRental.save();

    // active License
    const user_data = await User.findById(userIdReq) 
    const dataUser = {
      name: user_data?.name,
      email: user_data?.email,
      company: user_data?.company,
      address: user_data?.address,
      vatNumber: user_data?.nTva,
      phone: user_data?.phone,
      country: user_data?.country,
    }

    // Get current year and month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // months are 0-based
  
    // Count how many invoices already exist for this year and month
    const currentCount = await Facture.countDocuments({
      startFrom: {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${month}-31`),
      },
    });
  
    // Generate index (001, 002, etc.)
    const index = String(currentCount + 1).padStart(3, "0");
  
    // Combine everything
    if(user.role === "client" && sendFacture) {
      const factureId = `N°${year}${month}/${index}`;

      const createFacture = new Facture({
        userId: userIdReq,
        factureId: factureId,
        userData: dataUser,
        payId: payment._id,
        registrationIds: listIds,
        startFrom: new Date,
        endAt: expirationDate
      });
  
      createFacture.save();
    }

    const emailSociete = await User.findOne({ mainAccount: true })

    for (const license of users) {
      let expDate = new Date(expirationDate);
      let codeAuth = await createAuthCode(license.identificationCode, expDate);
      const code = codeAuth.data.code;
      let update = {
        status: freetrial? "freetrial" : "active",
        authCode: code,
      };
    
      console.log(license)
      await Registration.updateOne(
        { computerName: license.computerName, computerCode: license.identificationCode },
        { $set: update }
      );

      const email = license.email !== ""? license.email : user.email;
      const data = { computerName: license.computerName, username: license.username, duree: 15, rental: updateRental };
      await sendEmail({
        type: "auth-code",
        email,
        code,
        data,
        user,
        freetrial
      });

      // if(emailSociete?.factureMail) {
      //   await sendEmail({
      //     type: "auth-code",
      //     email: emailSociete.email,
      //     code,
      //     data,
      //     user
      //   });
      // }
    }

    const geo = geoip.lookup(req.realIp);
    const country = geo?.country || "Auter";

    if(userIdReq !== req.user.id) {
      // this is a license for client not for Admin
      await createNotification({
        target: user._id,
        title: "Nouvelle location Ferracad activée",
        type: "Location",
        description: `Votre abonnement Ferracad a été créé avec succès par l'admin.`,
        link: "/tableau-de-board/commande"
      });
    }

    await addActivityLog({
      userId: userIdReq,
      userType: user.role,
      action: "New Order",
      actionId: rental._id,
      idAdress: req.realIp,
      country
    });
    
    return res.status(201).json({ valid: true, id: updateRental._id })
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error on rental' });
  }
}

exports.getRental = async (req, res) => {
  try {
    let rentalData;
    const roleUser = req.user.role;
    const userId = req.user.id;
    
    if(roleUser === "admin") {
      rentalData = await Rental.find().sort({ createdAt: -1 });
    } else {
      rentalData = await Rental.find({ userId }).sort({ createdAt: -1 });
    }

    return res.status(200).json({ rentalData })
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error on get rental' });
  }
}

exports.updateRental = async (req, res) => {
  try {
    const { id } = req.params;
    const { deductionAuto } = req.body;

    const rental = await Rental.findById(id);
    if(!rental) {
      return res.status(404).json({ message: "Location introuvable." });
    }
    const paymentData = await Payment.findOne({ _id: rental.payId });

    await disableEnableAutoRenewal(paymentData.operatorId, deductionAuto)

    rental.deductionAuto = deductionAuto;
    rental.save();

    return res.status(200).json({ valid: true })
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error on create rental' });
  }
}

exports.removeRental = async (req, res) => {
  try {
    const { id } = req.params;
    const getRental = await Rental.findById(id);
    if (!getRental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    const paymentData = await Payment.findOne({ _id: getRental.payId });
    if(paymentData?.operatorId) {
      await cancelSubscription(paymentData?.operatorId, false);
    }

    // payment => facture
    await Facture.deleteOne({ payId: getRental.payId });
    await Payment.deleteOne({ _id: getRental.payId });

    // registration => licenseHistorique
    const registrations = await Registration.find({ rentalId: getRental._id });
    for (const license of registrations) {
      await Registration.deleteOne({ _id: license._id });
    }

    await Rental.deleteOne({ _id: id });

    return res.status(200).json({ message: "Location supprimée avec succès" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error on remove rental' });
  }
};