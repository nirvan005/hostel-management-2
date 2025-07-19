const mongoose = require("mongoose");
const CheckInOut = require("../models/checkin_checkout");

async function getCheckInOut(req, res) {
  try {
    let { student_id } = req.query;
    const filter = {};
    if (student_id) {
      try {
        filter.student_id = new mongoose.Types.ObjectId(student_id);
      } catch {
        return res.status(400).send({ error: "Invalid student_id" });
      }
    }
    const results = await CheckInOut.find(filter)
      .populate({
        path: "student_id",
        select: "name username email phone",
        model: "User",
      })
      .populate({
        path: "room_id",
        select: "room_no floor_no",
      })
      .sort({ checkout_time: -1 })
      .lean();
    console.log("getCheckInOut results:", results);
    // Flatten for frontend
    const formatted = results.map((r) => ({
      student_id: r.student_id?._id,
      name: r.student_id?.name,
      username: r.student_id?.username,
      room_no: r.room_id?.room_no,
      floor_no: r.room_id?.floor_no,
      checkin_time: r.checkin_time,
      checkout_time: r.checkout_time,
    }));
    res.json(formatted);
  } catch (err) {
    console.error("getCheckInOut error:", err);
    res.status(500).send({ error: err.message });
  }
}
module.exports = {
  getCheckInOut,
};
