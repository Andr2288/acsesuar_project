// routes/orderRoutes.js

const express = require('express');
const { createOrder, getOrders, getOrderById } = require('../controllers/orderController.js');
const { auth } = require('../middleware/authMiddleware.js');

const router = express.Router();

// 1a) Отримати всі замовлення поточного користувача (GET /api/orders/my)
router.get('/my', auth, getOrders);

// 1b) Отримати всі замовлення поточного користувача (GET /api/orders/my:dummy) 
//     – якщо фронтенд надсилає «/api/orders/my:1», «dummy» ігноруватиметься
router.get('/my:dummy', auth, getOrders);

// 2) Створити замовлення (POST /api/orders)
router.post('/', auth, createOrder);

// 3) Отримати конкретне замовлення за ID (GET /api/orders/:orderId)
router.get('/:orderId', auth, getOrderById);

module.exports = router;
