const express = require('express');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize('SUPER_ADMIN', 'ADMIN'), getUsers)
  .post(authorize('SUPER_ADMIN', 'ADMIN'), createUser);

router
  .route('/:id')
  .put(authorize('SUPER_ADMIN', 'ADMIN'), updateUser)
  .delete(authorize('SUPER_ADMIN'), deleteUser);

module.exports = router;
