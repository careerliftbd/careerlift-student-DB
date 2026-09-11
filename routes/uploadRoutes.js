const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

const upload = multer({ storage: multer.memoryStorage() });

// .any() ব্যবহার করা হলো যাতে ফ্রন্টএন্ড যে নামেই ছবি পাঠাক না কেন, কোনো এরর না আসে!
router.post('/upload', upload.any(), uploadController.uploadPhoto); 

// Manual Backup Route
router.post('/manual-backup', uploadController.manualBackup);

module.exports = router;