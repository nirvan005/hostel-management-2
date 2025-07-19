const mongoose = require("mongoose");
const { Schema } = mongoose;

const checkInOutSchema = new Schema({
  checkin_time: { type: Date, required: true },
  checkout_time: { type: Date, default: null },
  student_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  room_id: { type: Schema.Types.ObjectId, ref: "Room", required: true },
});

module.exports = mongoose.model(
  "CheckInOut",
  checkInOutSchema,
  "checkin_checkout"
);
