const router = require('express').Router();
const { getRequests, createRequest, updateRequest } = require('../controllers/request.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(protect);

router.route('/')
  .get(getRequests)
  .post(authorizeRoles('student'), createRequest);

router.route('/:id')
  .patch(authorizeRoles('admin', 'super_admin'), updateRequest);

module.exports = router;
