// controllers/orderController.js
const { pool } = require('../db.js');

/**
 * Створити замовлення
 */
async function createOrder(req, res) {
    try {
        const userId = req.user && req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Користувач не авторизований' });
        }
        const [cartItems] = await pool.execute(
            `SELECT c.product_id, p.price, c.quantity
             FROM cart c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = ?`, [userId]
        );
        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Кошик порожній' });
        }
        let totalPrice = 0;
        for (const item of cartItems) {
            totalPrice += item.price * item.quantity;
        }
        const [orderResult] = await pool.execute(
            'INSERT INTO orders (user_id, totalPrice, paymentStatus) VALUES (?, ?, ?)',
            [userId, totalPrice, 'pending']
        );
        const orderId = orderResult.insertId;
        for (const item of cartItems) {
            await pool.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, itemPrice) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }
        await pool.execute('DELETE FROM cart WHERE user_id = ?', [userId]);
        return res.status(201).json({ message: 'Замовлення створено', orderId });
    } catch (error) {
        console.error('Помилка при створенні замовлення:', error);
        return res.status(500).json({ message: 'Внутрішня серверна помилка' });
    }
}

/**
 * Отримати всі замовлення поточного користувача
 */
async function getOrders(req, res) {
    try {
        const userId = req.user && req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Користувач не авторизований' });
        }
        const [orders] = await pool.execute(
            'SELECT id, totalPrice, paymentStatus, createdAt FROM orders WHERE user_id = ? ORDER BY createdAt DESC',
            [userId]
        );
        return res.json(orders);
    } catch (error) {
        console.error('Помилка при отриманні замовлень:', error);
        return res.status(500).json({ message: 'Внутрішня серверна помилка' });
    }
}

/**
 * Отримати деталі одного замовлення (order items)
 */
async function getOrderById(req, res) {
    try {
        const userId = req.user && req.user.id;
        const orderId = req.params.orderId;
        if (!userId) {
            return res.status(401).json({ message: 'Користувач не авторизований' });
        }
        const [orderRows] = await pool.execute(
            'SELECT id, totalPrice, paymentStatus, createdAt FROM orders WHERE id = ? AND user_id = ?',
            [orderId, userId]
        );
        if (orderRows.length === 0) {
            return res.status(404).json({ message: 'Замовлення не знайдено' });
        }
        const [items] = await pool.execute(
            `SELECT oi.product_id, p.name, oi.quantity, oi.itemPrice
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`, [orderId]
        );
        return res.json({ order: orderRows[0], items });
    } catch (error) {
        console.error('Помилка при отриманні замовлення за ID:', error);
        return res.status(500).json({ message: 'Внутрішня серверна помилка' });
    }
}

module.exports = { createOrder, getOrders, getOrderById };
