const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

router.post('/', teacherController.addTeacher);
router.get('/', teacherController.getAllTeachers);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);

// Course Assignment Routes
router.post('/assign-course', teacherController.assignCourse);
router.delete('/remove-course', teacherController.removeCourse);

module.exports = router;