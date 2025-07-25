const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ["admin", "student"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema, "users");
