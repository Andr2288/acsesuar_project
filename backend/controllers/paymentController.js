// controllers/paymentController.js
const Stripe = require('stripe');
const { pool } = require('../db.js');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Створити Stripe Checkout Session
 */
async function createCheckoutSession(req, res) {
    try {
        const userId = req.user && req.user.id;
        const { orderId } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Користувач не авторизований' });
        }
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
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Замовлення #${orderId}`
                        },
                        unit_amount: Math.round(order.totalPrice * 100)
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/success?orderId=${orderId}`,
            cancel_url: `${req.protocol}://${req.get('host')}/cancel`
        });
        return res.json({ id: session.id });
    } catch (error) {
        console.error('Помилка при створенні Checkout Session:', error);
        return res.status(500).json({ message: 'Внутрішня серверна помилка' });
    }
}

/**
 * Webhook Stripe
 */
async function webhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Помилка в webhook валідації:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata && session.metadata.orderId;
        try {
            await pool.execute(
                'UPDATE orders SET paymentStatus = ? WHERE id = ?',
                ['paid', orderId]
            );
            console.log(`Замовлення ${orderId} відмічено як сплачене.`);
        } catch (error) {
            console.error('Помилка при оновленні статусу замовлення:', error);
        }
    }
    res.json({ received: true });
}

module.exports = { createCheckoutSession, webhook };
