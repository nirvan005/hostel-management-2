const Student = require('../models/student.model');
const Room = require('../models/room.model');
const Leave = require('../models/leave.model');
const Invoice = require('../models/invoice.model');
const Hostel = require('../models/hostel.model');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard aggregations
// @route   GET /api/dashboard
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res, next) => {
  let queryBase = {};
  
  if (req.user.role === 'admin') {
    queryBase.hostel_id = { $in: req.user.managed_hostels };
  } else if (req.user.role === 'super_admin' && req.query.hostel_id) {
    queryBase.hostel_id = req.query.hostel_id;
  }

  // 1. Total Students
  const totalStudents = await Student.countDocuments(queryBase);

  // 2. Active Leaves (Out of campus right now)
  // Status 'active' means they have exited the gate but not returned.
  const activeLeaves = await Leave.countDocuments({ ...queryBase, status: 'active' });

  // 3. Pending Leave Requests
  const pendingRequests = await Leave.countDocuments({ ...queryBase, status: 'pending' });

  // 4. Room Occupancy
  const rooms = await Room.find(queryBase);
  let totalCapacity = 0;
  let occupiedBeds = 0;
  
  rooms.forEach(room => {
    totalCapacity += room.capacity;
    occupiedBeds += room.occupants.length;
  });

  const vacantBeds = totalCapacity - occupiedBeds;

  // 5. Unpaid Invoices
  const unpaidInvoices = await Invoice.countDocuments({ ...queryBase, status: 'pending' });

  // 6. Monthly Revenue (Aggregating paid and pending invoices by due_date month)
  const revenueAgg = await Invoice.aggregate([
    { $match: queryBase },
    {
      $group: {
        _id: { $month: "$due_date" },
        collected: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] } }
      }
    },
    { $sort: { "_id": 1 } }
  ]);
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyRevenue = revenueAgg.map(r => ({
    month: monthNames[r._id - 1] || "Unknown",
    collected: r.collected,
    pending: r.pending
  }));

  // 7. Occupancy Data
  let occupancyData = [];
  if (req.user.role === 'super_admin') {
    // Chief Warden: Group by Hostel
    const hostels = await Hostel.find();
    for (const h of hostels) {
      const hRooms = await Room.find({ hostel_id: h._id });
      let oBeds = 0;
      hRooms.forEach(r => oBeds += r.occupants.length);
      occupancyData.push({
        name: h.name,
        value: oBeds,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color for pie chart
      });
    }
  } else {
    // Resident Warden: Group by Room Capacity/Type
    const capacityAgg = await Room.aggregate([
      { $match: queryBase },
      {
        $group: {
          _id: "$capacity",
          occupiedBeds: { $sum: { $size: "$occupants" } }
        }
      }
    ]);
    const colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"];
    occupancyData = capacityAgg.map((c, i) => ({
      name: `${c._id}-Seater`,
      value: c.occupiedBeds,
      color: colors[i % colors.length]
    }));
  }

  res.status(200).json({
    status: 'success',
    data: {
      totalStudents,
      activeLeaves,
      pendingRequests,
      totalCapacity,
      occupiedBeds,
      vacantBeds,
      unpaidInvoices,
      monthlyRevenue,
      occupancyData
    }
  });
});
