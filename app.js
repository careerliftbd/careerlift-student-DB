const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend (public ফোল্ডার) কানেক্ট করা হলো (.html এক্সটেনশন অটোমেটিক ধরবে)
app.use(express.static('public', { extensions: ['html', 'htm'] }));

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
// ⚠️ Temporary Setup Route (আপনার অ্যাকাউন্ট ইতোমধ্যে তৈরি হয়ে গেছে, তাই সিকিউরিটির জন্য এটি বন্ধ করে দেওয়া হলো)
app.get('/setup', async (req, res) => {
    const bcrypt = require('bcrypt');
    const supabase = require('./supabaseClient');

    try {
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        const { data, error } = await supabase
            .from('admins')
            .insert([{
                name: 'Super Admin',
                email: 'careerliftbd@gmail.com',
                password_hash: hashedPassword,
                is_approved: true
            }]);

        if (error) {
            return res.json({ success: false, error: error.message });
        }
        
        res.json({ success: true, message: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! এবার লগইন পেজে গিয়ে লগইন করুন।" });
    } catch (err) {
        res.json({ error: err.message });
    }
});
*/


// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[+] Server running at http://localhost:${PORT}`);
});