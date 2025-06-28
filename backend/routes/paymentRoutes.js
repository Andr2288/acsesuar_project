// routes/paymentRoutes.js
const express = require('express');
const { createCheckoutSession, webhook } = require('../controllers/paymentController.js');
const { auth } = require('../middleware/authMiddleware.js');

const router = express.Router();

// POST /api/pay/create-checkout-session
router.post('/create-checkout-session', auth, createCheckoutSession);

// POST /api/pay/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

module.exports = router;
