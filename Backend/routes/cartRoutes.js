const express = require('express');

const { protect } = require('../middleware/authMiddleware');
const { getCart, addToCart, clearCart, updateCartItem, removeFromCart } = require('../controllers/cartController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;