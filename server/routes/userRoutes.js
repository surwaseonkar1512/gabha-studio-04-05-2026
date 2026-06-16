const express = require('express');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(checkPermission('employees', 'view'), getUsers)
  .post(checkPermission('employees', 'create'), createUser);

router
  .route('/:id')
  .put(checkPermission('employees', 'edit'), updateUser)
  .delete(checkPermission('employees', 'delete'), deleteUser);

module.exports = router;
