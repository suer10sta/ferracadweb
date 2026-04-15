const PaymentConfiguration = require('../models/PaymentConfiguration');

// Champs autorisés pour création et mise à jour
const allowedFields = ['userId', 'type', 'email', 'numberCart', 'dateExp', 'cvc', 'nameCart'];

function validatePaymentConfig(data) {
  if (!data.userId) return 'userId is required';
  if (!data.type || !['cart', 'paypal'].includes(data.type)) return 'Invalid or missing type';
  return null;
}

function buildPaymentConfigData(body) {
  const data = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }
  return data;
}

// Create
exports.createPaymentConfig = async (req, res) => {
  try {
    const filteredData = buildPaymentConfigData(req.body);
    const error = validatePaymentConfig(filteredData);
    if (error) {
      console.log(error)
      return res.status(400).json({ message: error })
    };

    const paymentConfig = new PaymentConfiguration(filteredData);
    await paymentConfig.save();
    res.status(201).json(paymentConfig);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error on create' });
  }
};

// Read all
exports.getAllPaymentConfigs = async (req, res) => {
  try {
    let paymentConfigsData;
    const roleUser = req.user.role;
    const userId = req.user.id;

    if(roleUser === "admin") {
      paymentConfigsData = await PaymentConfiguration.find();
    } else {
      paymentConfigsData = await PaymentConfiguration.find({ userId: userId });
    }
    res.json({ paymentConfigsData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error on fetching all' });
  }
};

// Read one by ID
exports.getPaymentConfigById = async (req, res) => {
  try {
    const paymentConfig = await PaymentConfiguration.findById(req.params.id);
    if (!paymentConfig) return res.status(404).json({ message: 'Not found' });
    res.json(paymentConfig);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error on fetching one' });
  }
};

// Update by ID
exports.updatePaymentConfig = async (req, res) => {
    try {
      const filteredData = buildPaymentConfigData(req.body);
      const error = validatePaymentConfig(filteredData);
      if (error) return res.status(400).json({ message: error });
  
      const updated = await PaymentConfiguration.findByIdAndUpdate(
        req.params.id,
        filteredData,
        { new: true, runValidators: true }
      );
  
      if (!updated) return res.status(404).json({ message: 'Not found' });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error on update' });
    }
};

// Delete by ID
exports.deletePaymentConfig = async (req, res) => {
  try {
    const deleted = await PaymentConfiguration.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error on delete' });
  }
};