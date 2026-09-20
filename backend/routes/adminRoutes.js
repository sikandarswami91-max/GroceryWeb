import express from 'express';
import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/dashboard-stats', getDashboardStats);
router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/payment', updatePaymentStatus);

export default router;

