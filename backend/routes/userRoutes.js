const express = require('express');
const router = express.Router();
const auth = require("../middlewares/auth")
const {
    getUsers,
    getUser,
    deleteUser,
    updateUser,
    createUser,
    uploadPhotoProfile,
    sendInvId,
    getAdmin,
    updateUserByAdmin
} = require('../controllers/userController');
const multer = require("multer");
const path = require("path");
const upload = multer({ dest: path.join(__dirname, "../temp") });

router.get('/', auth, getUsers);
router.get('/admin', auth, getAdmin);
router.delete('/:id', auth, deleteUser);
router.get('/get', auth, getUser);
router.put('/', auth, updateUser);
router.post('/create', auth, createUser);
router.put('/photo', auth, upload.single("photo"), uploadPhotoProfile);
router.post('/invitation', auth, sendInvId);
router.put('/:id/admin', auth, updateUserByAdmin);

module.exports = router;