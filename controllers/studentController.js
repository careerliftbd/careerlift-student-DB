const supabase = require('../supabaseClient');

// 1. Add New Student
exports.addStudent = async (req, res) => {
    try {
        const payload = req.body;
        const { data: student, error: studentError } = await supabase
            .from('students')
            .insert([{
                full_name: payload.fullName,
                dob: payload.dob,
                gender: payload.gender,
                blood_group: payload.bloodGroup,
                religion: payload.religion,
                marital_status: payload.maritalStatus,
                spouse_info: payload.spouseInfo,
                documents: payload.documents,
                photo_link: payload.photoLink, 
                contact_info: payload.contact,
                parents_info: payload.parentsInfo,
                education: payload.educationalBackground,
                skills_languages: payload.skillsAndLanguages,
                career_profile: payload.careerProfile,
                admin_comment: payload.comment
            }])
            .select()
            .single();

        if (studentError) throw studentError;

        const enrollmentData = payload.enrollments[0]; 
        const { error: enrollmentError } = await supabase
            .from('enrollments')
            .insert([{
                student_id: student.id,
                course_name: enrollmentData.courseName,
                batch_no: enrollmentData.batchNo,
                course_type: enrollmentData.courseType,
                course_status: enrollmentData.status
            }]);

        if (enrollmentError) throw enrollmentError;

        res.status(201).json({
            success: true,
            message: "স্টুডেন্ট সফলভাবে ডাটাবেসে যুক্ত করা হয়েছে!",
            data: { studentID: student.id }
        });
    } catch (error) {
        console.error("Add Student Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get All Students
exports.getAllStudents = async (req, res) => {
    try {
        const { data: students, error } = await supabase
            .from('students')
            .select(`*, enrollments (*)`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get Single Student by ID
exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('students')
            .select('*, enrollments(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Add New Course Enrollment
exports.addCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseName, batchNo, courseType, status } = req.body;

        const { error } = await supabase
            .from('enrollments')
            .insert([{
                student_id: id,
                course_name: courseName,
                batch_no: batchNo,
                course_type: courseType,
                course_status: status || 'Running'
            }]);

        if (error) throw error;
        res.status(201).json({ success: true, message: 'কোর্স সফলভাবে যুক্ত হয়েছে!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Update Course Status
exports.updateStatus = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { status } = req.body;

        const { error } = await supabase
            .from('enrollments')
            .update({ course_status: status })
            .eq('id', enrollmentId);

        if (error) throw error;
        res.status(200).json({ success: true, message: 'স্ট্যাটাস আপডেট হয়েছে' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Update Student Profile
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body;

        const { error } = await supabase
            .from('students')
            .update(payload)
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ success: true, message: 'স্টুডেন্টের ডাটা সফলভাবে আপডেট হয়েছে!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Delete Student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Supabase-এ 'ON DELETE CASCADE' দেওয়া থাকলে enrollments অটো ডিলিট হয়ে যাবে
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