// controllers/userController.js
const bcrypt = require('bcrypt');
const { pool } = require('../db.js');
require('dotenv').config();

const SALT_ROUNDS = 10;

async function register(req, res) {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ message: 'Поля login та password обов’язкові' });
    }
    // Перевіряємо, чи вже є користувач із таким login
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE login = ?',
      [login]
    );
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Користувач із таким login вже існує' });
    }
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await pool.execute(
      'INSERT INTO users (login, password, role) VALUES (?, ?, ?)',
      [login, hashed, 'user']
    );
    return res.status(201).json({ message: 'Реєстрація успішна', userId: result.insertId });
  } catch (err) {
    console.error('Помилка при реєстрації:', err);
    return res.status(500).json({ message: 'Внутрішня серверна помилка' });
  }
}

async function login(req, res) {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ message: 'Поля login та password обов’язкові' });
    }
    const [rows] = await pool.execute(
      'SELECT id, password, role FROM users WHERE login = ?',
      [login]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Невірний login або password' });
    }
    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Невірний login або password' });
    }
    // Створюємо JWT (приклад)
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    return res.json({ message: 'Успішний вхід', token });
  } catch (err) {
    console.error('Помилка при логіні:', err);
    return res.status(500).json({ message: 'Внутрішня серверна помилка' });
  }
}

async function getUserProfile(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ message: 'Користувач не авторизований' });
    }
    const [rows] = await pool.execute(
      'SELECT id, login, role FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }
    const profile = rows[0];
    return res.json(profile);
  } catch (err) {
    console.error('Помилка при отриманні профілю:', err);
    return res.status(500).json({ message: 'Внутрішня серверна помилка' });
  }
}

/**
 * ОНОВЛЕННЯ ДАНИХ КОРИСТУВАЧА
 * PATCH /api/users/update
 * Очікує в тілі JSON: { login, password? }
 * Якщо password вказано — оновлюємо його, попередньо хешуючи.
 */
async function updateUser(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ message: 'Користувач не авторизований' });
    }
    const { login, password } = req.body;
    if (!login && !password) {
      return res.status(400).json({ message: 'Потрібно передати принаймні одне поле: login або password' });
    }
    // Якщо вказано новий login — перевіряємо, чи не зайнятий іншим користувачем
    if (login) {
      const [rows] = await pool.execute(
        'SELECT id FROM users WHERE login = ? AND id != ?',
        [login, userId]
      );
      if (rows.length > 0) {
        return res.status(409).json({ message: 'Цей логін уже використовується іншим користувачем' });
      }
    }
    // Формуємо масив SQL-пар (значень) для оновлення
    const fields = [];
    const values = [];
    if (login) {
      fields.push('login = ?');
      values.push(login);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      fields.push('password = ?');
      values.push(hashed);
    }
    if (fields.length === 0) {
      // Якщо ввійшли сюди, але жодного поля не додано — 400
      return res.status(400).json({ message: 'Нічого оновлювати' });
    }
    values.push(userId); // для WHERE
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }
    return res.json({ message: 'Дані користувача успішно оновлено' });
  } catch (err) {
    console.error('Помилка при оновленні користувача:', err);
    return res.status(500).json({ message: 'Внутрішня серверна помилка' });
  }
}

module.exports = {
  register,
  login,
  getUserProfile,
  updateUser,
};
