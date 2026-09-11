const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// ফ্রন্টএন্ড এই লিংকেই রিকোয়েস্ট পাঠাচ্ছে: /api/attendance/options
router.get('/options', attendanceController.getBatchOptions);

module.exports = router;