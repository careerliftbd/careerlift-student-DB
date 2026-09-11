require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const supabase = require('./supabaseClient');

const studentsData = [];

// ১. আপনার নতুন CSV ফাইলের নাম দেওয়া হলো
fs.createReadStream('Skin Care Level 3 - Sheet1.csv')
    .pipe(csv())
    .on('data', (row) => {
        // ফাকা রো ইগনোর করার জন্য
        if (row['Name of Candidate in English']) {
            studentsData.push(row);
        }
    })
    .on('end', async () => {
        console.log(`মোট ${studentsData.length} টি স্টুডেন্ট ডাটা পাওয়া গেছে। আপলোড শুরু হচ্ছে...\n`);
        
        let successCount = 0;
        let errorCount = 0;

        // ২. ডাটাবেসে ইনসার্ট করা
        for (const row of studentsData) {
            try {
                // NID নাকি Birth Certificate সেটি চেক করে JSON বানানো
                const idType = row['Identification type'] || '';
                const idNumber = row['NID / Birth Certificate Number'] || '';
                let documentsData = {};
                if (idType.toLowerCase().includes('nid') || idType.toLowerCase().includes('national')) {
                    documentsData = { nid: idNumber };
                } else {
                    documentsData = { birthCertificate: idNumber };
                }

                // Students টেবিলে ডাটা পুশ
                const { data: student, error: studentError } = await supabase
                    .from('students')
                    .insert([{
                        full_name: row['Name of Candidate in English'],
                        dob: row['Date of Birth'],
                        gender: row['Gender'],
                        blood_group: row['Blood Group'],
                        religion: row['Religion'],
                        marital_status: row['Marital status'],
                        education: row['Highest Education Level'],
                        
                        contact_info: {
                            phone: row['Mobile Number'],
                            email: row['Email'],
                            guardianName: row["Father's Name in English"], 
                            guardianPhone: row['Emergency Contact Number'],
                            fullAddress: row['Permanent Address (village, Post Office , Upozilla, District, Division)']
                        },
                        
                        parents_info: {
                            fatherName: row["Father's Name in English"],
                            fatherProfession: row["Father's Occupation"],
                            motherName: row["Mother's Name in English"],
                            motherProfession: row["Mother's Occupation"]
                        },
                        
                        documents: documentsData,
                        
                        // অতিরিক্ত ডাটাগুলো কমেন্টে রেখে দিচ্ছি
                        admin_comment: `Employment before training: ${row['Employment status before training'] || 'N/A'}. Disability: ${row['Person with Disability?'] || 'No'}. Ethnic Minority: ${row['Ethnic Minority'] || 'N/A'}.`
                    }])
                    .select()
                    .single();

                if (studentError) throw studentError;

                // Enrollments টেবিলে কোর্স ও ব্যাচের ডাটা পুশ
                const { error: enrollmentError } = await supabase
                    .from('enrollments')
                    .insert([{
                        student_id: student.id,
                        course_name: row['Occupation Name'] || 'Skin Care (Level 3)', // ডিফল্ট কোর্সের নাম আপডেট করা হলো
                        batch_no: 'Batch-01', 
                        course_type: 'Paid',
                        course_status: 'Running' 
                    }]);

                if (enrollmentError) throw enrollmentError;
                
                successCount++;
                console.log(`✅ [${successCount}] ${row['Name of Candidate in English']} সফলভাবে যুক্ত হয়েছে`);

            } catch (err) {
                errorCount++;
                console.error(`❌ ${row['Name of Candidate in English']} সেভ হতে সমস্যা হয়েছে:`, err.message);
            }
        }

        console.log(`\n🎉 আপলোড সম্পন্ন! সফল: ${successCount}, ব্যর্থ: ${errorCount}`);
        process.exit(0);
    });