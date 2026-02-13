import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} from '../controllers/cartController';

const router = Router();

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);

export default router;