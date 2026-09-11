const supabase = require('../supabaseClient');

// ডাটাবেস থেকে শুধু ইউনিক ব্যাচ নম্বরগুলো খুঁজে বের করা
exports.getBatchOptions = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select('batch_no');
            
        if (error) throw error;

        // ডুপ্লিকেট ব্যাচ রিমুভ করে ইউনিক ব্যাচের লিস্ট তৈরি করা
        const batches = [...new Set(data.map(item => item.batch_no))].filter(Boolean);
        
        res.status(200).json({ success: true, batches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// 7. Delete Student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ success: true, message: 'স্টুডেন্ট সফলভাবে মুছে ফেলা হয়েছে' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};