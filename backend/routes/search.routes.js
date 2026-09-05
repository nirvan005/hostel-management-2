const express = require('express');
const searchController = require('../controllers/search.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', searchController.globalSearch);

module.exports = router;
