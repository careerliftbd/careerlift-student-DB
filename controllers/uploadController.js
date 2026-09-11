const supabase = require('../supabaseClient');

// 1. Photo Upload (যাতে সার্ভার ক্র্যাশ না করে)
exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'কোনো ফাইল পাওয়া যায়নি।' });
        res.status(200).json({ success: true, url: `/uploads/${req.file.filename}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        res.status(200).json({ success: true, url: `/uploads/${req.file.filename}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Direct Backup to Google Drive via Apps Script
exports.manualBackup = async (req, res) => {
    try {
        // ১. Supabase থেকে ডাটা ফেচ
        const { data: students, error } = await supabase
            .from('students')
            .select('*, enrollments(*)');

        if (error) throw error;

        const scriptUrl = process.env.APPS_SCRIPT_URL;

        if (!scriptUrl) {
            return res.status(500).json({ success: false, message: 'APPS_SCRIPT_URL পাওয়া যায়নি!' });
        }

        // ৩. Fetch API ব্যবহার করে ডাটা গুগল ড্রাইভে পাঠানো
        const response = await fetch(scriptUrl, {
            method: 'POST',
            body: JSON.stringify(students),
            redirect: 'follow', // গুগলের রিডাইরেক্ট সাপোর্ট করার জন্য
            headers: { 
                'Content-Type': 'text/plain;charset=utf-8' // Apps script অনেক সময় json header ব্লক করে, তাই text হিসেবে পাঠানো হলো
            }
        });

        // রেসপন্স আগে টেক্সট হিসেবে পড়া হচ্ছে
        const responseText = await response.text();

        let result;
        try {
            // টেক্সটকে JSON এ কনভার্ট করার চেষ্টা
            result = JSON.parse(responseText);
        } catch (parseError) {
            // যদি HTML পেজ আসে, তাহলে এই এররটি থ্রো করবে
            console.error("Apps Script Response Error:", responseText.substring(0, 150));
            throw new Error('Google Apps Script থেকে JSON এর বদলে HTML এসেছে। দয়া করে আপনার Apps Script-এর "Who has access: Anyone" পারমিশনটি চেক করুন।');
        }

        if (result.success) {
            res.status(200).json({ 
                success: true, 
                message: 'সরাসরি Google Drive-এ ব্যাকআপ সেভ হয়েছে!', 
                link: result.link 
            });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }

    } catch (error) {
        console.error("Backup Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};