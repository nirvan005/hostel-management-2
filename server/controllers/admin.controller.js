const Admin = require("../models/admin");

async function getAdmin(req, res) {
  try {
    const query = {};
    if (req.query.admin_id) {
      query.admin_id = req.query.admin_id;
    }

    const results = await Admin.find(query).populate({
      path: "admin_id",
      select: "name username email phone role",
    });

    res.send(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAdmin,
};
