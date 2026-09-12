const supabase = require('../supabaseClient'); 

exports.login = async (req, res) => {
    // ১. ফ্রন্টএন্ড থেকে কী ডাটা আসছে তা কনসোলে প্রিন্ট করবে
    console.log("👉 Frontend থেকে আসা ডাটা:", req.body); 

    const { email, password } = req.body;

    try {
        if (!email || !password) {
            console.log("❌ ইমেইল বা পাসওয়ার্ড ফাঁকা এসেছে!");
            return res.status(400).json({ success: false, message: 'ইমেইল ও পাসওয়ার্ড দিতে হবে!' });
        }

        // ২. Supabase Auth ব্যবহার করে সরাসরি ইউজার ভেরিফাই করা (admins টেবিলের আর দরকার নেই)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            console.log("❌ লগইন ফেইলড:", error.message);
            return res.status(401).json({ success: false, message: 'ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে!' });
        }

        console.log("✅ লগইন সফল হয়েছে!");
        
        // ৩. Supabase অটোমেটিক টোকেন দিয়ে দেয়, তাই jwt.sign এর দরকার নেই
        res.status(200).json({
            success: true,
            message: 'লগইন সফল হয়েছে!',
            token: data.session.access_token,
            admin: { 
                email: data.user.email 
            }
        });
    } catch (error) {
        console.error("🔥 সার্ভার এরর:", error.message);
        res.status(500).json({ success: false, message: 'সার্ভার এরর, আবার চেষ্টা করুন!' });
    }
};