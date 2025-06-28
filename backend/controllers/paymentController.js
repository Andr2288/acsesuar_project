// controllers/paymentController.js
const { pool } = require('../db.js');
require('dotenv').config();

/**
 * Simple checkout without Stripe - for development/testing
 */
async function createCheckoutSession(req, res) {
    try {
        const userId = req.user && req.user.id;
        const { orderId } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Користувач не авторизований' });
        }

        // Check if order exists and belongs to user
        const [orderRows] = await pool.execute(
            'SELECT totalPrice, paymentStatus FROM orders WHERE id = ? AND user_id = ?',
            [orderId, userId]
        );

        if (orderRows.length === 0) {
            return res.status(404).json({ message: 'Замовлення не знайдено' });
        }

        const order = orderRows[0];
        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Замовлення вже сплачено' });
        }

        // For development: automatically mark order as paid
        // In real app, this would create Stripe session
        await pool.execute(
            'UPDATE orders SET paymentStatus = ? WHERE id = ?',
            ['paid', orderId]
        );

        console.log(`Order ${orderId} marked as paid (development mode)`);

        // Return success response
        return res.json({
            success: true,
            message: 'Payment processed successfully (development mode)',
            orderId: orderId
        });

    } catch (error) {
        console.error('Помилка при обробці платежу:', error);
        return res.status(500).json({ message: 'Внутрішня серверна помилка' });
    }
}

/**
 * Webhook endpoint (not needed for simple version)
 */
async function webhook(req, res) {
    console.log('Webhook called (development mode)');
    res.json({ received: true });
}

module.exports = { createCheckoutSession, webhook };