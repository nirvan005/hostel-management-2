const mongoose = require("mongoose");
const { Schema } = mongoose;

const roomSchema = new Schema({
  room_no: { type: Number, required: true },
  capacity: { type: Number, required: true },
  occupancy: { type: Number, default: 0 },
  status: { type: String, enum: ["vacant", "occupied"], default: "vacant" },
  floor_no: { type: Number, required: true },
});

module.exports = mongoose.model("Room", roomSchema, "rooms");
