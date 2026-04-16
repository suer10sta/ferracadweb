const Stripe = require("stripe");

// Load from environment variables in real projects
// const stripe = Stripe(
//   process.env.STRIPE_SECRET_KEY_TEST ||
//     "sk_test_51SI4slB4LVww0NzzB0Ok33mLnJu3BEFBl8urO3e82If6hrGAsdqd2fHNtfVCLRazjlELcdGivZYjEyOeXqsS76vT00tolSUdNi"
// );
const stripe = Stripe(
  process.env.STRIPE_SECRET_KEY ||
  "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"
);

/**
 * Create one-time payment (PaymentIntent)
 * @param {number} amount - Amount in cents (e.g. $10 = 1000)
 * @param {string} currency - e.g. 'EUR'
 * @returns {Promise<object>}
 */
async function createOneTimePayment(amount, customerId, paymentMethodId, currency = 'EUR') {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true, // confirm the payment immediately
      automatic_payment_methods: { enabled: false }, // disable auto for clarity
      off_session: true, // if you're charging without user interaction
    });
    return paymentIntent;
  } catch (error) {
    console.error("Error creating one-time payment:", error);
    throw error;
  }
}

/**
 * Create a subscription with optional custom next billing date
 * @param {string} customerId - Stripe customer ID
 * @param {string} priceId - Stripe Price ID (recurring)
 * @param {number|null} nextBillingDate - Optional: timestamp (in seconds) for next billing date
 * @returns {Promise<object>}
 */
async function createSubscription(customerId, priceId, paymentMethodId, deductionAuto = true, nextBillingDate = null) {
  try {
    if (!customerId || !priceId || !paymentMethodId) {
      throw new Error('Customer ID and Price ID are required');
    }

    const subscriptionData = {
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId, // Important: spécifier la méthode de paiement
      payment_behavior: "default_incomplete",
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ["latest_invoice.payment_intent"],
      proration_behavior: "none",
      cancel_at_period_end: !deductionAuto,
    };

    if (nextBillingDate) {
      subscriptionData.billing_cycle_anchor = nextBillingDate;
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
    console.error("Error creating subscription:", error);
    throw error;
  }
}

async function finalizeSubscription(subscriptionId) {
  try {
    // Récupérer l'abonnement avec les informations étendues
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice.payment_intent']
    });

    console.log("Subscription status:", subscription.status);
    console.log("Latest invoice status:", subscription.latest_invoice.status);
    console.log("Payment intent:", subscription.latest_invoice.payment_intent);

    // Si l'invoice est "open" et n'a pas de payment_intent, nous devons la payer
    if (subscription.status === 'incomplete' &&
      subscription.latest_invoice.status === 'open' &&
      !subscription.latest_invoice.payment_intent) {

      console.log("Paying open invoice...");

      // Payer l'invoice
      const paidInvoice = await stripe.invoices.pay(subscription.latest_invoice.id);

      console.log("Invoice paid, status:", paidInvoice.status);

      if (paidInvoice.status === 'paid') {
        // L'abonnement devrait maintenant passer à active
        const updatedSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log("Updated subscription status:", updatedSubscription.status);
        return updatedSubscription;
      }
    }

    // Si il y a un payment_intent qui nécessite une action
    if (subscription.latest_invoice.payment_intent &&
      subscription.latest_invoice.payment_intent.status === 'requires_action') {

      console.log("Confirming payment intent...");

      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
        subscription.latest_invoice.payment_intent.id
      );

      console.log("Payment intent status after confirmation:", confirmedPaymentIntent.status);

      if (confirmedPaymentIntent.status === 'succeeded') {
        const updatedSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log("Subscription status after payment success:", updatedSubscription.status);
        return updatedSubscription;
      }
    }

    return subscription;
  } catch (error) {
    console.error("Error finalizing subscription:", error);
    throw error;
  }
}

/**
 * Cancel a subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {boolean} cancelAtPeriodEnd - If true, cancel at period end; else cancel immediately
 * @returns {Promise<object>} - Returns canceled subscription object
 */
async function cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
  try {
    if (cancelAtPeriodEnd) {
      // Set subscription to cancel at the end of the current period
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      return subscription;
    } else {
      // Cancel immediately
      const canceledSubscription = await stripe.subscriptions.cancel(
        subscriptionId
      );
      console.log(canceledSubscription)
      return canceledSubscription;
    }
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return;
  }
}

/**
 * Update a subscription's price and optionally change next billing date
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {string} newPriceId - New Stripe price ID
 * @param {boolean} deductionAuto - true = auto renew, false = cancel at period end
 * @param {number|null} nextBillingDate - Optional timestamp (in seconds) for the next billing date
 * @returns {Promise<object>}
 */
async function updateSubscriptionPrice(
  subscriptionId,
  newPriceId,
  deductionAuto = true,
  expirationDate = null,
  daysUntilExpiration = null,
  pricePay = null
) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (!subscription || subscription.items.data.length === 0) {
      throw new Error('Subscription not found or has no items.');
    }

    const subscriptionItemId = subscription.items.data[0].id;

    // 1If there's an extension — charge for it manually
    if (expirationDate && pricePay && pricePay > 0) {
      const invoiceItem = await stripe.invoiceItems.create({
        customer: subscription.customer,
        amount: pricePay, // already in cents (e.g., 500 for 5€)
        currency: 'eur',
        description: `Extension of subscription until ${new Date(expirationDate * 1000).toLocaleDateString()}`,
      });

      const extensionInvoice = await stripe.invoices.create({
        customer: subscription.customer,
        auto_advance: true,
      });

      await stripe.invoices.pay(extensionInvoice.id);
    }

    // Update subscription to new price and push next billing date
    const updateData = {
      cancel_at_period_end: !deductionAuto,
      proration_behavior: 'none', // prevent Stripe from auto-prorating
      items: [
        {
          id: subscriptionItemId,
          price: newPriceId,
        },
      ],
      expand: ['latest_invoice.payment_intent'],
    };

    if (expirationDate) {
      updateData.trial_end = expirationDate;
    }

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, updateData);
    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription price:', error);
    throw error;
  }
}


/**
 * Cancel or enable auto-renewal of a subscription (but keep it active until the end of the billing period)
 * @param {string} subscriptionId - Stripe subscription ID (e.g. sub_1234...)
 * @param {boolean} deductionAuto - true to enable auto-renewal, false to disable
 */
async function disableEnableAutoRenewal(subscriptionId, deductionAuto) {
  try {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !deductionAuto // if deductionAuto=false → cancel_at_period_end=true
    });

    return updatedSubscription;
  } catch (error) {
    console.error('Error disabling auto-renewal:', error);
    throw error;
  }
}


/**
 * Create a price with custom interval (e.g., every 60 days)
 * @param {string} productId
 * @param {number} unitAmount - in cents
 * @param {number} intervalCount - how many intervals between billings (e.g. 60)
 * @param {string} intervalUnit - 'day' | 'week' | 'month' | 'year'
 */
async function createCustomIntervalPrice(
  productId,
  unitAmount,
  intervalCount,
  intervalUnit = "day"
) {
  try {
    const price = await stripe.prices.create({
      unit_amount: unitAmount,
      currency: "EUR",
      product: productId,
      recurring: {
        interval: intervalUnit,
        interval_count: intervalCount, // This is key
      },
    });
    return price;
  } catch (error) {
    console.error("Error creating custom interval price:", error);
    throw error;
  }
}

/**
 * Archive (deactivate) a price
 * @param {string} priceId - Stripe price ID
 * @returns {Promise<object>} - Returns updated price object
 */
async function archivePrice(priceId) {
  try {
    const price = await stripe.prices.update(priceId, {
      active: false,
    });
    return price;
  } catch (error) {
    console.error("Error archiving price:", error);
    throw error;
  }
}

/**
 * Create a Stripe customer
 * @param {string} email
 * @returns {Promise<object>}
 */
async function createCustomer(email) {
  try {
    const customer = await stripe.customers.create({ email });
    return customer;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
}

/**
 * Get a Stripe customer by email
 */
async function getCustomerByEmail(email) {
  try {
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      return customers.data[0]; // returns the customer object
    } else {
      return null; // no customer found
    }
  } catch (error) {
    console.error("Error getting customer by email:", error);
    throw error;
  }
}

/**
 * Create a Price for a product
 * @param {string} productId - Stripe Product ID
 * @param {number} unitAmount - in cents
 * @param {string} currency - e.g. 'EUR'
 * @param {string|null} interval - 'month', 'year', or null for one-time
 */
async function createPriceItem(
  productId,
  unitAmount,
  currency = "EUR",
  interval = null
) {
  try {
    const priceData = {
      unit_amount: unitAmount,
      currency,
      product: productId,
    };

    // If interval is set → recurring price
    if (interval) {
      priceData.recurring = { interval };
    }

    const price = await stripe.prices.create(priceData);
    return price;
  } catch (error) {
    console.error("Error creating price item:", error);
    throw error;
  }
}

/**
 * Create a new product in Stripe
 * @param {string} name - Product name
 * @param {string} description - Product description
 * @param {string} [type='service'] - Product type ('service' or 'good')
 * @returns {Promise<object>}
 */
async function createProduct(name, description, type = "service") {
  try {
    const product = await stripe.products.create({
      name,
      description,
      type,
    });
    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

/**
 * Get product ID by product name
 * @param {string} productName - The name of the product you're searching for
 * @returns {Promise<object|null>} - Returns product object or null if not found
 */
async function getProductByName(productName) {
  try {
    const products = await stripe.products.list({
      limit: 5,
    });

    const product = products.data.find(
      (p) => p.name.toLowerCase() === productName.toLowerCase()
    );

    return product || null;
  } catch (error) {
    console.error("Error getting product by name:", error);
    throw error;
  }
}

/**
 * Create a coupon
 * @param {object} data - { percent_off OR amount_off, currency, duration }
 * @returns {Promise<object>}
 */
async function createCoupon(data) {
  try {
    const coupon = await stripe.coupons.create(data);
    return coupon;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }
}

/**
 * Update a coupon
 * @param {string} couponId
 * @param {object} data - fields to update
 * @returns {Promise<object>}
 */
async function updateCoupon(couponId, data) {
  try {
    const coupon = await stripe.coupons.update(couponId, data);
    return coupon;
  } catch (error) {
    console.error("Error updating coupon:", error);
    throw error;
  }
}

/**
 * Delete (expire) a coupon
 * Note: Stripe doesn't "delete" coupons; this disables them for new uses.
 * @param {string} couponId
 * @returns {Promise<object>}
 */
async function deleteCoupon(couponId) {
  try {
    const deleted = await stripe.coupons.del(couponId);
    return deleted;
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw error;
  }
}

/**
 * Get a single coupon
 * @param {string} couponId
 * @returns {Promise<object>}
 */
async function getCoupon(couponId) {
  try {
    const coupon = await stripe.coupons.retrieve(couponId);
    return coupon;
  } catch (error) {
    console.error("Error getting coupon:", error);
    throw error;
  }
}

/**
 * List all coupons
 * @param {number} limit - default 10
 * @returns {Promise<object>}
 */
async function listCoupons(limit = 10) {
  try {
    const coupons = await stripe.coupons.list({ limit });
    return coupons;
  } catch (error) {
    console.error("Error listing coupons:", error);
    throw error;
  }
}

module.exports = {
  stripe,
  createOneTimePayment,
  createSubscription,
  createCustomer,
  getCustomerByEmail,
  createPriceItem,
  createProduct,
  getProductByName,
  cancelSubscription,
  createCustomIntervalPrice,
  archivePrice,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCoupon,
  listCoupons,
  updateSubscriptionPrice,
  disableEnableAutoRenewal,
  finalizeSubscription
};
