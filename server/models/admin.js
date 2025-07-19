const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminSchema = new Schema({
  admin_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  hall_no: { type: Number, required: true },
});

module.exports = mongoose.model("Admin", adminSchema, "admin");
