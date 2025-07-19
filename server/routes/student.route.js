const express = require("express");
const router = express.Router();
const StudentController = require("../controllers/student.controller");

router.get("/", StudentController.listActiveStudents);
router.get("/assigned-students", StudentController.listAssignedStudents);
router.get("/unassigned-students", StudentController.listUnassignedStudents);
router.post("/add-student", StudentController.addStudent);
router.post("/remove-student", StudentController.removeStudent);
router.get("/:room_no", StudentController.listStudentsByRoom);
module.exports = router;
