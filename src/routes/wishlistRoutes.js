import express from 'express';
import {
  getUserWishlist,
  addItemToWishlist,
  removeItemFromWishlist,
} from '../controllers/wishlistController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getUserWishlist);
router.post('/', authMiddleware, addItemToWishlist);
router.delete('/', authMiddleware, removeItemFromWishlist);

export default router;
