const express = require('express');
const cors = require('cors');
const path = require('path'); // ✅ Vercel-এর জন্য path যুক্ত করা হলো
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Frontend (public ফোল্ডার) কানেক্ট করা হলো (Absolute path সহ)
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html', 'htm'] }));

// ✅ Vercel-এ Cannot GET / এরর সমাধানের জন্য হোমপেজ রাউট
app.get('/', (req, res) => {
    // ⚠️ আপনার মেইন পেজ বা লগইন পেজটি যদি 'login.html' হয়, তবে নিচে 'index.html' এর জায়গায় 'login.html' দিন
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Auth API
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// ✅ File Upload API (আগের Drive এর লিংকের নামেই রাখছি)
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/drive', uploadRoutes);

// ✅ Student API
const studentRoutes = require('./routes/studentRoutes');
app.use('/api/students', studentRoutes);

// Basic API Test
app.get('/api/status', (req, res) => {
    res.json({ success: true, message: "Supabase Backend is running smoothly!" });
});


/* 
// ⚠️ Temporary Setup Route (বন্ধ করে দেওয়া হলো)
app.get('/setup', async (req, res) => { ... });
*/


// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[+] Server running at http://localhost:${PORT}`);
});

// Vercel এর জন্য export করা হলো
module.exports = app;