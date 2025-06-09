const { MongoClient } = require("mongodb");
const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const PORT = 4000;
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });
const admin_key = process.env.ADMIN_KEY;
const client = new MongoClient(process.env.MONGO_URI);

(async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
})();

const db = client.db("hostel_management");
const Users = db.collection("users");
const Rooms = db.collection("rooms");
const Student = db.collection("student");
const CheckIn_CheckOut = db.collection("checkIn_CheckOut");
const Payments = db.collection("payments");
const Admin = db.collection("admin");
const Request = db.collection("request");
// const requests = db.collection("requests"); // Removed unused variable
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

app.post("/signup-admin", async (req, res) => {
  const { username, password, email, name, phone, adminKey } = req.body;
  if (adminKey !== admin_key) {
    return res.status(403).json({ error: "Invalid admin key" });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await Users.insertOne({
      username,
      password: hash,
      email,
      name,
      phone,
      role: "admin",
    });
    res.status(201).json({
      message: "Admin created successfully",
      userId: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ error: "Database insertion failed" });
  }
});

app.post("/login-admin", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Users.findOne({ username, role: "admin" });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    res.status(200).json({
      message: "Login successful",
      userId: user.user_id,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ error: "Database query failed" });
  }
});

app.post("/signup-student", async (req, res) => {
  const { username, password, email, name, phone } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await Users.insertOne({
      username,
      password: hash,
      email,
      name,
      phone,
      role: "student",
    });
    res.status(201).json({
      message: "Student created successfully",
      userId: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ error: "Database insertion failed" });
  }
});

app.post("/login-student", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Users.findOne({ username, role: "student" });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    res.status(200).json({
      message: "Login successful",
      userId: user.user_id,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ error: "Database query failed" });
  }
});

app.post("/room-request", async (req, res) => {
  const {
    user_id,
    address,
    fathers_name,
    mothers_name,
    parent_phone,
    preferred_room,
  } = req.body;
  try {
    const student = await Student.findOne({ student_id: user_id });
    if (student) {
      return res.status(401).send("You already have a room assigned");
    }
    await Request.insertOne({
      user_id,
      address,
      fathers_name,
      mothers_name,
      parent_phone,
      requested_room_id: preferred_room,
      type: "new",
      status: "pending",
    });
    res.send("Room request submitted successfully");
  } catch (err) {
    res.status(500).send("Error inserting room request");
  }
});

app.post("/change-room-request", async (req, res) => {
  const { user_id, preferred_room } = req.body;
  try {
    const room = await Rooms.findOne({ room_no: preferred_room });
    if (!room) return res.status(404).send("Room not found");

    const student = await Student.findOne({ student_id: user_id });
    if (!student)
      return res.status(404).send("No room assigned to this student");

    await Request.insertOne({
      user_id,
      address: student.address,
      fathers_name: student.fathers_name,
      mothers_name: student.mothers_name,
      parent_phone: student.parent_phone,
      requested_room_id: preferred_room,
      type: "change",
      status: "pending",
    });
    res.send("Room change request submitted successfully");
  } catch (err) {
    res.status(500).send("Error submitting room change request");
  }
});

app.get("/student", async (_req, res) => {
  try {
    const results = await Student.aggregate([
      { $match: { end_date: null } },
      {
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "user_id",
          as: "user_info",
        },
      },
      { $unwind: "$user_info" },
      {
        $lookup: {
          from: "rooms",
          localField: "room_id",
          foreignField: "room_id",
          as: "room_info",
        },
      },
      { $unwind: "$room_info" },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$$ROOT", // Original student document
              "$user_info",
              "$room_info",
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          user_info: 0,
          room_info: 0,
        },
      },
    ]).toArray();

    res.send(results);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get("/student/:room_no", async (req, res) => {
  try {
    const roomNo = parseInt(req.params.room_no);
    const results = await Student.aggregate([
      { $match: { end_date: null } },
      {
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "user_id",
          as: "user_info",
        },
      },
      { $unwind: "$user_info" },
      {
        $lookup: {
          from: "rooms",
          localField: "room_id",
          foreignField: "room_id",
          as: "room_info",
        },
      },
      { $unwind: "$room_info" },
      { $match: { "room_info.room_no": roomNo } },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$$ROOT", "$user_info", "$room_info"],
          },
        },
      },
      {
        $project: {
          _id: 0,
          user_info: 0,
          room_info: 0,
        },
      },
    ]).toArray();

    res.send(results);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get("/admin", async (req, res) => {
  try {
    const matchStage = req.query.admin_id
      ? { $match: { admin_id: req.query.admin_id } }
      : { $match: {} };
    const results = await Admin.aggregate([
      matchStage,
      {
        $lookup: {
          from: "users",
          localField: "admin_id",
          foreignField: "user_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]).toArray();
    res.send(results);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/rooms", async (req, res) => {
  try {
    if (!req.query.room_id) {
      const results = await Rooms.find({}).toArray();
      res.send(results);
    } else {
      const results = await Rooms.find({
        room_id: req.query.room_id,
      }).toArray();
      res.send(results);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/checkinout", async (req, res) => {
  try {
    const matchStage = req.query.student_id
      ? { $match: { student_id: req.query.student_id } }
      : { $match: {} };
    const results = await CheckIn_CheckOut.aggregate([
      matchStage,
      {
        $lookup: {
          from: "student",
          localField: "student_id",
          foreignField: "student_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
    ]).toArray();
    res.send(results);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/floors", async (_req, res) => {
  try {
    const results = await Rooms.aggregate([
      {
        $group: {
          _id: {
            floor_no: "$floor_no",
            room_no: "$room_no",
            status: "$status",
          },
        },
      },
      {
        $project: {
          _id: 0,
          floor_no: "$_id.floor_no",
          room_no: "$_id.room_no",
          status: "$_id.status",
        },
      },
      { $sort: { floor_no: 1, room_no: 1 } },
    ]).toArray();
    res.send(results);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/add-student", async (req, res) => {
  const { name, username, password, phone, email } = req.body;
  try {
    const result = await Users.insertOne({
      name,
      username,
      password,
      phone,
      email,
      role: "student",
    });
    res.status(201).json({
      message: "Student added successfully",
      userId: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ error: "Database insertion failed" });
  }
});

app.get("/unassigned-students", async (_req, res) => {
  try {
    const results = await Request.aggregate([
      { $match: { type: "new", status: "pending", requested_room_id: null } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "user_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          user_id: 1,
          name: "$user.name",
          username: "$user.username",
          requested_room_id: 1,
        },
      },
    ]).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/assigned-students", async (_req, res) => {
  try {
    const students = await Student.find({ end_date: null }).toArray();
    const userIds = students.map((s) => s.student_id);
    console.log("User IDs:", userIds);
    const results = await Users.find(
      { user_id: { $in: userIds } },
      { projection: { user_id: 1, name: 1, username: 1 } }
    ).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/assign-room", async (req, res) => {
  const {
    student_id,
    address,
    fathers_name,
    mothers_name,
    parent_phone,
    room_no,
    start_date,
    end_date,
  } = req.body;
  try {
    const room = await Rooms.findOne({ room_no: room_no });
    if (!room) return res.status(404).send("Room not found");

    const allocation = await Student.find()
      .sort({ allocation_id: -1 })
      .limit(1)
      .toArray();
    const nextId = (allocation[0]?.allocation_id || 0) + 1;

    await Student.insertOne({
      student_id,
      address,
      fathers_name,
      mothers_name,
      allocation_id: nextId,
      parent_phone,
      room_id: room.room_id,
      start_date,
      end_date,
    });
    res.send("Student assigned room successfully");
  } catch (err) {
    res.status(500).send("Error inserting student");
  }
});

app.post("/change-room", async (req, res) => {
  const { student_id, room_no } = req.body;
  try {
    const room = await Rooms.findOne({ room_no: room_no });
    if (!room) return res.status(404).send("Room not found");

    await Student.updateOne(
      { student_id },
      { $set: { room_id: room.room_id } }
    );
    res.send("Student assigned new room successfully");
  } catch (err) {
    res.status(500).send("Error updating room");
  }
});

// Paid
app.get("/payments", async (_req, res) => {
  try {
    const results = await Payments.aggregate([
      { $match: { status: "Paid" } },
      {
        $lookup: {
          from: "student",
          localField: "student_id",
          foreignField: "student_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $lookup: {
          from: "users",
          localField: "student.student_id",
          foreignField: "user_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "rooms",
          localField: "student.room_id",
          foreignField: "room_id",
          as: "room",
        },
      },
      { $unwind: "$room" },
      {
        $project: {
          student_id: "$student.student_id",
          name: "$user.name",
          room_no: "$room.room_no",
          floor_no: "$room.floor_no",
          amount: 1,
          sem: 1,
        },
      },
      { $sort: { sem: -1, room_no: 1 } },
    ]).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Pending
app.get("/payments/pending", async (_req, res) => {
  try {
    const results = await Payments.aggregate([
      { $match: { status: "Unpaid" } },
      {
        $lookup: {
          from: "student",
          localField: "student_id",
          foreignField: "student_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $lookup: {
          from: "users",
          localField: "student.student_id",
          foreignField: "user_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "rooms",
          localField: "student.room_id",
          foreignField: "room_id",
          as: "room",
        },
      },
      { $unwind: "$room" },
      {
        $project: {
          student_id: "$student.student_id",
          name: "$user.name",
          room_no: "$room.room_no",
          floor_no: "$room.floor_no",
          amount: 1,
          sem: 1,
        },
      },
      { $sort: { sem: -1, room_no: 1 } },
    ]).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/payments/mark-paid", async (req, res) => {
  const { student_id } = req.body;
  try {
    const result = await Payments.updateMany(
      { student_id },
      { $set: { status: "Paid" } }
    );
    res.json(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/CheckOuts", async (req, res) => {
  const { student_id } = req.body;
  try {
    const results = await CheckIn_CheckOut.aggregate([
      { $match: { student_id } },
      {
        $lookup: {
          from: "rooms",
          localField: "room_id",
          foreignField: "room_id",
          as: "room",
        },
      },
      { $unwind: "$room" },
      {
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "user_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          student_id: 1,
          name: "$user.name",
          room_no: "$room.room_no",
          floor_no: "$room.floor_no",
          checkin_time: 1,
          checkout_time: 1,
        },
      },
      { $sort: { checkout_time: -1 } },
    ]).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/student/remove-student", async (req, res) => {
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
});

server.listen(PORT, () => {
  console.log(`Server listening on Port: ${PORT}`);
});
