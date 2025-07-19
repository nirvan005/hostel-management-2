const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema({
  amount: { type: Number, required: true },
  payment_date: { type: Date, default: null },
  student_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Paid", "Unpaid"], required: true },
  sem: { type: String, required: true },
});

module.exports = mongoose.model("Payment", paymentSchema, "payments");
