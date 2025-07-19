const mongoose = require("mongoose");
const { Schema } = mongoose;

const requestSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  address: { type: String },
  fathers_name: { type: String },
  mothers_name: { type: String },
  parent_phone: { type: String },
  requested_room_id: { type: Schema.Types.ObjectId, ref: "Room" },
  request_date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejection_reason: { type: String, default: null },
  type: { type: String, enum: ["new", "change"], required: true },
});

module.exports = mongoose.model("Request", requestSchema, "requests");
