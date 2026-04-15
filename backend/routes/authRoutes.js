const express = require('express');
const router = express.Router();
const { 
    getAuthCode,
    connexion,
    inscription,
    validate,
    logout,
    changePwd,
    changeTwoFac,
    validateAccount,
    recoverPassword,
    setPassword,
    checkCodeValidate,
    resendTwoFactorCode,
    resendActivation,
    sendOTP,
    verifyOTP
} = require('../controllers/authController');
const auth = require("../middlewares/auth")

router.post('/', connexion);
router.post('/inscription', inscription);
router.post('/logout', logout);
router.post('/code', getAuthCode);
router.get('/validate', validate);
router.get('/activation/:token', validateAccount);
router.post('/recover-pwd', recoverPassword);
router.put('/modify-pwd', setPassword);
router.post('/two-factors-check', checkCodeValidate);
router.post('/resend-two-factors-code', resendTwoFactorCode);
router.post('/resend-activation-compte', resendActivation);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.put('/', auth, changePwd);
router.put('/2fac', auth, changeTwoFac);

module.exports = router;