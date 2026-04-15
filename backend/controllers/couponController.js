const Coupon = require('../models/Coupon');
const { getCoupon, createCoupon } = require('../utils/stripe');


// exports.createCoupon = async (req, res) => {
//   try {
//     const {
//       type,
//       validateFrom,
//       validateTo,
//       value,
//       maxUse,
//     } = req.body;
// 
//     const couponData = {
//       type,
//       validateFrom,
//       validateTo,
//       value,
//       maxUse,
//     };
// 
//     const coupon = new Coupon(couponData);
//     await coupon.save();
// 
//     res.status(201).json({
//       message: "Coupon créé avec succès.",
//       coupon
//     });
//   } catch (err) {
//     console.error("Create Error:", err);
//     res.status(400).json({ error: "Erreur lors de la création du coupon." });
//   }
// };

// READ ALL
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ coupons });
  } catch (err) {
    console.error("Read All Error:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des coupons." });
  }
};

// READ ONE
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    // const data = {
    //   id: "SUMMER25",          // Optional: custom ID (must be unique)
    //   percent_off: 25,         // 25% discount
    //   duration: "once"         // The coupon applies only once
    // };
    // const creatCoupon = await createCoupon(data);
    // console.log(creatCoupon)

    if (!id) {
      return res.status(400).json({ error: "L'ID du coupon est requis." });
    }

    const coupon = await getCoupon(id);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon introuvable." });
    }

    console.log(coupon)
    res.status(200).json({ coupon });

  } catch (err) {
    console.error("Read One Error:", err);

    // Use the statusCode if it exists, otherwise default to 500
    const status = err.statusCode || 500;
    const message = err.message || "Erreur serveur.";

    res.status(status).json({ error: message });
  }
};


// UPDATE
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
        type,
        validateFrom,
        validateTo,
        value,
        maxUse,
    } = req.body;
  
    const couponData = {
        type,
        validateFrom,
        validateTo,
        value,
        maxUse,
    };

    const coupon = await Coupon.findByIdAndUpdate(id, couponData, {
      new: true,
      runValidators: true
    });

    if (!coupon) return res.status(404).json({ error: "Coupon introuvable." });

    res.status(200).json({ message: "Coupon mis à jour.", coupon });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(400).json({ error: "Erreur lors de la mise à jour du coupon." });
  }
};

// DELETE
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) return res.status(404).json({ error: "Coupon introuvable." });

    res.status(200).json({ message: "Coupon supprimé." });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
