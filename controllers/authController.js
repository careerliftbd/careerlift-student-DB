const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../supabaseClient'); // পাথ খেয়াল রাখবেন

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data, error } = await supabase
            .from('admins')
            .insert([{ name, email, password_hash: hashedPassword, is_approved: true }]) // প্রথম অ্যাডমিন তাই সরাসরি true করে দিলাম
            .select();

        if (error) throw error;
        res.status(201).json({ success: true, message: 'অ্যাডমিন তৈরি হয়েছে!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    // ১. ফ্রন্টএন্ড থেকে কী ডাটা আসছে তা কনসোলে প্রিন্ট করবে
    console.log("👉 Frontend থেকে আসা ডাটা:", req.body); 

    const { email, password } = req.body;

    try {
        if (!email || !password) {
            console.log("❌ ইমেইল বা পাসওয়ার্ড ফাঁকা এসেছে!");
            return res.status(400).json({ success: false, message: 'ইমেইল ও পাসওয়ার্ড দিতে হবে!' });
        }

        // ২. ডাটাবেসে ইউজার খুঁজবে
        const { data: admin, error } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !admin) {
            console.log("❌ ডাটাবেসে এই ইমেইলটি পাওয়া যায়নি:", email);
            return res.status(401).json({ success: false, message: 'ভুল ইমেইল বা একাউন্ট পাওয়া যায়নি!' });
        }

        // ৩. পাসওয়ার্ড মেলাবে
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            console.log("❌ পাসওয়ার্ড ভুল হয়েছে!");
            return res.status(401).json({ success: false, message: 'পাসওয়ার্ড ভুল হয়েছে!' });
        }

        console.log("✅ লগইন সফল হয়েছে!");
        const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            success: true,
            token,
            admin: { name: admin.name, email: admin.email }
        });
    } catch (error) {
        console.error("🔥 সার্ভার এরর:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};