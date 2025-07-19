const mongoose = require("mongoose");
const { Schema } = mongoose;

const studentSchema = new Schema({
  student_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  address: { type: String },
  fathers_name: { type: String },
  mothers_name: { type: String },
  allocation_id: { type: Number, unique: true },
  parent_phone: { type: String },
  room_id: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  start_date: { type: Date },
  end_date: { type: Date, default: null },
});

module.exports = mongoose.model("Student", studentSchema, "student");
