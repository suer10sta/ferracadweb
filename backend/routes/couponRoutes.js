const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const auth = require("../middlewares/auth")

// CRUD Routes
// router.post('/', auth, couponController.createCoupon);
router.get('/', auth, couponController.getAllCoupons);
router.get('/:id', auth, couponController.getCouponById);
router.put('/:id', auth, couponController.updateCoupon);
router.delete('/:id', auth, couponController.deleteCoupon);

module.exports = router;