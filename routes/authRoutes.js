const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// শুধু login রাউটটি থাকবে
router.post('/login', authController.login);

module.exports = router;