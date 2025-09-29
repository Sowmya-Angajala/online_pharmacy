// routes/orderRoutes.js
const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUserOrders)
  .post(createOrder);

router.route('/all')
  .get(authorize('admin'), getAllOrders);

router.route('/:orderId')
  .get(getOrderById)
  .put(authorize('admin'), updateOrderStatus)
  .patch(cancelOrder);

module.exports = router;