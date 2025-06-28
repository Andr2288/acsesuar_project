// routes/cartRoutes.js

const express = require('express');
const { getCart, addToCart, removeFromCart } = require('../controllers/cartController.js');
const { auth } = require('../middleware/authMiddleware.js');

const router = express.Router();

// 1) GET /api/cart
//    Повернути вміст кошика поточного користувача
router.get('/', auth, getCart);

// 2) POST /api/cart/add
//    Додати або оновити товар у кошику.
//    Очікуємо JSON-тіло з полями: { productId, quantity }.
//    Якщо quantity не вказано — використовується 1 за замовчуванням.
router.post('/add', auth, addToCart);

// 3) DELETE /api/cart/remove/:productId
//    Видалити товар із кошика за productId у URL
router.delete('/remove/:productId', auth, removeFromCart);

module.exports = router;
