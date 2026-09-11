const supabase = require('../supabaseClient');
const bcrypt = require('bcrypt'); // পাসওয়ার্ড সিকিউর করার জন্য

exports.addTeacher = async (req, res) => {
    try {
        const { name, phone, email, password, assignedClasses } = req.body;

        // পাসওয়ার্ড হ্যাশ করা (যাতে ডাটাবেস হ্যাক হলেও পাসওয়ার্ড লিক না হয়)
        const password_hash = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from('teachers')
            .insert([{
                name,
                phone,
                email,
                password_hash,
                assigned_classes: assignedClasses
            }]);

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ success: false, message: 'এই ইমেইল দিয়ে ইতোমধ্যে একজন শিক্ষকের অ্যাকাউন্ট রয়েছে!' });
            }
            throw error;
        }

        res.status(201).json({ success: true, message: 'শিক্ষকের প্রোফাইল সফলভাবে তৈরি হয়েছে!' });
    } catch (error) {
        console.error("Add Teacher Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// (ভবিষ্যতে Teacher List দেখানোর জন্য)
exports.getAllTeachers = async (req, res) => {
    try {
        const { data, error } = await supabase.from('teachers').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Edit Teacher
exports.updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, isActive } = req.body;

        const { error } = await supabase
            .from('teachers')
            .update({ name, phone, email, is_active: isActive })
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'টিচারের তথ্য আপডেট হয়েছে' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Delete Teacher
exports.deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('teachers').delete().eq('id', id);
        if (error) throw error;
        res.json({ success: true, message: 'টিচার সফলভাবে মুছে ফেলা হয়েছে' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Assign New Course to Teacher
exports.assignCourse = async (req, res) => {
    try {
        const { teacherId, courseName, batchNo } = req.body;

        // প্রথমে টিচারের বর্তমান কোর্সগুলো বের করা
        const { data: teacher, error: fetchErr } = await supabase
            .from('teachers')
            .select('assigned_classes')
            .eq('id', teacherId)
            .single();

        if (fetchErr) throw fetchErr;

        let classes = teacher.assigned_classes || [];

        // চেক করা যে এই কোর্সটি আগে থেকেই আছে কিনা
        const exists = classes.some(c => c.courseName === courseName && c.batchNo === batchNo);
        if (exists) {
            return res.status(400).json({ success: false, message: 'এই কোর্সটি আগেই অ্যাসাইন করা আছে!' });
        }

        // নতুন কোর্স যোগ করা
        classes.push({ courseName, batchNo });

        const { error: updateErr } = await supabase
            .from('teachers')
            .update({ assigned_classes: classes })
            .eq('id', teacherId);

        if (updateErr) throw updateErr;
        res.json({ success: true, message: 'কোর্স অ্যাসাইন সফল হয়েছে' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Remove Course from Teacher
exports.removeCourse = async (req, res) => {
    try {
        const { teacherId, courseName, batchNo } = req.body;

        const { data: teacher, error: fetchErr } = await supabase
            .from('teachers')
            .select('assigned_classes')
            .eq('id', teacherId)
            .single();

        if (fetchErr) throw fetchErr;

        let classes = teacher.assigned_classes || [];
        
        // নির্দিষ্ট কোর্সটি বাদ দিয়ে ফিল্টার করা
        classes = classes.filter(c => !(c.courseName === courseName && c.batchNo === batchNo));

        const { error: updateErr } = await supabase
            .from('teachers')
            .update({ assigned_classes: classes })
            .eq('id', teacherId);

        if (updateErr) throw updateErr;
        res.json({ success: true, message: 'কোর্স রিমুভ করা হয়েছে' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};