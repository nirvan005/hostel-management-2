const Payment = require("../models/payments");
// Paid
async function getPayments(req, res) {
  try {
    const results = await Payment.aggregate([
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
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "rooms",
          localField: "student.room_id",
          foreignField: "_id",
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
    ]);
    res.json(results);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).send(err);
  }
}

// Pending
async function pendingPayments(req, res) {
  try {
    const results = await Payment.aggregate([
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
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "rooms",
          localField: "student.room_id",
          foreignField: "_id",
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
    ]);
    res.json(results);
  } catch (err) {
    res.status(500).send(err);
  }
}
async function markPaid(req, res) {
  const { student_id } = req.body;
  try {
    const result = await Payment.updateMany(
      { student_id },
      { $set: { status: "Paid" } }
    );
    res.json(result);
  } catch (err) {
    res.status(500).send(err);
  }
}
// controllers/payment.controller.js
async function getStudentPayments(req, res) {
  try {
    const userId = req.params.userId;
    const payments = await Payment.find({ student_id: userId })
      .populate({
        path: "student_id",
        select: "name email",
        model: "User",
      })
      .populate({
        path: "room_id",
        select: "room_no floor_no",
      })
      .lean();

    const results = payments.map((p) => ({
      student_id: p.student_id?._id,
      name: p.student_id?.name,
      email: p.student_id?.email,
      room_no: p.room_id?.room_no,
      floor_no: p.room_id?.floor_no,
      amount: p.amount,
      sem: p.sem,
      payment_date: p.payment_date,
      status: p.status,
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getPayments,
  pendingPayments,
  markPaid,
  getStudentPayments,
};
