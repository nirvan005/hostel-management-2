const Student = require("../models/student");
const User = require("../models/users");
const Request = require("../models/requests");
const bcrypt = require("bcrypt");

async function listActiveStudents(req, res) {
  try {
    const students = await Student.find({ end_date: null })
      .populate("student_id", "name username email phone")
      .populate("room_id", "room_no floor_no") // Only select needed fields!
      .lean();

    const flatStudents = students.map((stu) => ({
      _id: stu._id,
      student_id: stu.student_id?._id, // Mongo ObjectId
      name: stu.student_id?.name,
      email: stu.student_id?.email,
      phone: stu.student_id?.phone,
      fathers_name: stu.fathers_name,
      mothers_name: stu.mothers_name,
      parent_phone: stu.parent_phone,
      address: stu.address,
      room_no: stu.room_id?.room_no,
      floor_no: stu.room_id?.floor_no,
      // add any other plain fields from stu as needed
    }));

    res.json(flatStudents);
  } catch (err) {
    console.error("Student API error:", err);
    res.status(500).json({ error: err.message });
  }
}

async function listStudentsByRoom(req, res) {
  try {
    const roomNo = parseInt(req.params.room_no);
    const students = await Student.find({ end_date: null })
      .populate("student_id", "name username email phone")
      .populate("room_id", "room_no floor_no");
    const filtered = students.filter(
      (stu) => stu.room_id && stu.room_id.room_no === roomNo
    );
    const flatStudents = filtered.map((stu) => ({
      _id: stu._id,
      student_id: stu.student_id?._id,
      name: stu.student_id?.name,
      email: stu.student_id?.email,
      phone: stu.student_id?.phone,
      fathers_name: stu.fathers_name,
      mothers_name: stu.mothers_name,
      parent_phone: stu.parent_phone,
      address: stu.address,
      room_no: stu.room_id?.room_no,
      floor_no: stu.room_id?.floor_no,
    }));
    res.json(flatStudents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
async function addStudent(req, res) {
  const { name, username, password, phone, email } = req.body;
  try {
    const exists = await User.findOne({ username });
    if (exists)
      return res.status(409).json({ error: "Username already exists" });
    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      password: hash,
      phone,
      email,
      role: "student",
    });
    await newUser.save();
    res.status(201).json({
      message: "Student added successfully",
      userId: newUser._id,
    });
  } catch (err) {
    res.status(500).json({ error: "Database insertion failed" });
  }
}

async function listUnassignedStudents(req, res) {
  try {
    const requests = await Request.find({
      type: "new",
      status: "pending",
      requested_room_id: null,
    }).populate("user_id", "name username");
    const results = requests.map((rq) => ({
      user_id: rq.user_id._id,
      name: rq.user_id.name,
      username: rq.user_id.username,
      requested_room_id: rq.requested_room_id,
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
async function listAssignedStudents(req, res) {
  try {
    const students = await Student.find({ end_date: null }).populate(
      "student_id",
      "name username"
    );
    const results = students.map((s) => ({
      user_id: s.student_id._id,
      name: s.student_id.name,
      username: s.student_id.username,
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
async function removeStudent(req, res) {
  const { student_id, end_date } = req.body;
  try {
    const result = await Student.updateOne(
      { student_id },
      { $set: { end_date } }
    );
    res.json(result);
  } catch (err) {
    res.status(500).send(err);
  }
}

module.exports = {
  listActiveStudents,
  listStudentsByRoom,
  addStudent,
  listUnassignedStudents,
  listAssignedStudents,
  removeStudent,
};
