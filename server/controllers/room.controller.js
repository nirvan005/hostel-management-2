const Student = require("../models/student");
const Room = require("../models/rooms");
const Request = require("../models/requests");
async function roomRequest(req, res) {
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
    const newRequest = new Request({
      user_id,
      address,
      fathers_name,
      mothers_name,
      parent_phone,
      requested_room_id: preferred_room,
      type: "new",
      status: "pending",
    });
    await newRequest.save();
    res.send("Room request submitted successfully");
  } catch (err) {
    res.status(500).send("Error inserting room request");
  }
}
async function changeRoomRequest(req, res) {
  const { user_id, preferred_room } = req.body;
  try {
    const room = await Room.findOne({ room_no: preferred_room });
    if (!room) return res.status(404).send("Room not found");

    const student = await Student.findOne({ student_id: user_id });
    if (!student)
      return res.status(404).send("No room assigned to this student");
    const newRequest = new Request({
      user_id,
      address: student.address,
      fathers_name: student.fathers_name,
      mothers_name: student.mothers_name,
      parent_phone: student.parent_phone,
      requested_room_id: preferred_room,
      type: "change",
      status: "pending",
    });
    await newRequest.save();
    res.send("Room change request submitted successfully");
  } catch (err) {
    res.status(500).send("Error submitting room change request");
  }
}
async function getRooms(req, res) {
  try {
    if (!req.query.room_id) {
      const results = await Room.find({});
      res.send(results);
    } else {
      const results = await Room.find({
        room_id: Number(req.query.room_id),
      });
      res.send(results);
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

async function getFloors(req, res) {
  try {
    const results = await Room.aggregate([
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
    ]);
    res.send(results);
  } catch (err) {
    res.status(500).send(err);
  }
}

async function assignRoom(req, res) {
  const {
    student_id, // should be ObjectId of User
    address,
    fathers_name,
    mothers_name,
    parent_phone,
    room_no,
    start_date,
    end_date,
  } = req.body;
  try {
    const room = await Room.findOne({ room_no: room_no });
    if (!room) return res.status(404).send("Room not found");

    const allocation = await Student.find()
      .sort({ allocation_id: -1 })
      .limit(1);
    const nextId = (allocation[0]?.allocation_id || 0) + 1;

    const newStudent = new Student({
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
    await newStudent.save();
    res.send("Student assigned room successfully");
  } catch (err) {
    res.status(500).send("Error inserting student");
  }
}

async function changeRoom(req, res) {
  const { student_id, room_no } = req.body;
  try {
    const room = await Room.findOne({ room_no: room_no });
    if (!room) return res.status(404).send("Room not found");

    await Student.updateOne(
      { student_id },
      { $set: { room_id: room.room_id } }
    );
    res.send("Student assigned new room successfully");
  } catch (err) {
    res.status(500).send("Error updating room");
  }
}

module.exports = {
  getRooms,
  roomRequest,
  changeRoomRequest,
  changeRoom,
  assignRoom,
  getFloors,
};
