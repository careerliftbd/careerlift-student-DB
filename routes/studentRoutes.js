const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// 1. Add Student
router.post('/', studentController.addStudent);

// 2. Get All Students
router.get('/', studentController.getAllStudents);

// 3. Get Single Student Profile
router.get('/:id', studentController.getStudentById); 

// 6. Update Student Profile Data
router.put('/:id', studentController.updateStudent);

// 7. Delete Student
router.delete('/:id', studentController.deleteStudent);

// 4. Enroll to New Course
router.post('/:id/enroll', studentController.addCourse);

// 5. Update Course Status
router.patch('/:id/enrollments/:enrollmentId/status', studentController.updateStatus);

module.exports = router;