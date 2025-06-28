// controllers/cartController.js

const { pool } = require('../db.js');

/**
 * Повернути вміст кошика поточного користувача.
 * Повертаємо масив об’єктів із полями: { product_id, name, price, imagePath, quantity }.
 */
async function getCart(req, res) {
    try {
        const userId = req.user && req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Користувач не авторизований' });
        }

        const [rows] = await pool.execute(
            `SELECT c.product_id, p.name, p.price, p.imagePath, c.quantity
             FROM cart c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = ?`,
            [userId]
        );

        return res.json(rows);
    } catch (error) {
        console.error('Помилка при отриманні кошика:', error);
        return res.status(500).json({ message: 'Внутрішня серверна помилка' });
    }
}

/**
 * Додати або оновити товар у кошику поточного користувача.
 * Очікуємо JSON-тіло: { productId, quantity }.
 * Якщо quantity не вказано — буде використано 1.
 */
async function addToCart(req, res) {
    try {
        const userId = req.user && req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Користувач не авторизований' });
        }

        // Беремо productId із тіла запиту
        const { productId, quantity } = req.body;

        // Якщо productId не вказано — 400
        if (!productId) {
            return res.status(400).json({ message: 'Відсутній параметр productId' });
        }

        // Визначаємо кількість: якщо не вказано, ставимо 1
        let qty = 1;
        if (quantity !== undefined && quantity !== null) {
            // Перетворюємо в ціле число
            qty = parseInt(quantity, 10);
            if (isNaN(qty) || qty < 1) {
                return res.status(400).json({ message: 'Невірне значення quantity' });
            }
        }

        // Перевіряємо, чи вже є такий запис у таблиці cart
        const [existingRows] = await pool.execute(
            'SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existingRows.length > 0) {
            // Якщо позиція вже існує — оновлюємо кількість
            await pool.execute(
                'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
                [qty, userId, productId]
            );
        } else {
            // Якщо позиції ще немає — вставляємо новий рядок
            await pool.execute(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, productId, qty]
            );
        }

        return res.json({ message: 'Кошик успішно оновлено' });
    } catch (error) {
        console.error('Помилка при додаванні до кошика:', error);
        return res.status(500).json({ message: 'Внутрішня серверна помилка' });
    }
}

/**
 * Видалити товар із кошика за productId у URL
 */
async function removeFromCart(req, res) {
    try {
        const userId = req.user && req.user.id;
        const productId = req.params.productId;

        if (!userId) {
            return res.status(401).json({ message: 'Користувач не авторизований' });
        }
        if (!productId) {
            return res.status(400).json({ message: 'Відсутній параметр productId' });
        }

        await pool.execute(
            'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        return res.json({ message: 'Товар видалено з кошика' });
    } catch (error) {
        console.error('Помилка при видаленні з кошика:', error);
        return res.status(500).json({ message: 'Внутрішня серверна помилка' });
    }
}

module.exports = { getCart, addToCart, removeFromCart };
