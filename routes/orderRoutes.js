import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders, // <-- IMPORT
  updateOrderToDelivered, // <-- IMPORT
  cancelOrder, // <-- IMPORT
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User-specific routes
router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);

router.route('/').get(protect, admin, getOrders);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/cancel').put(protect, admin, cancelOrder);

export default router;