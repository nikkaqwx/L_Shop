import { Router } from 'express';
import { createOrder, getUserOrders } from '../controllers/orderController';

const router = Router();

router.get('/', getUserOrders);
router.post('/', createOrder);

export default router;