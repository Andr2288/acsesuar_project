// controllers/productController.js

const fs = require('fs');
const path = require('path');
const { pool } = require('../db.js');

/**
 * 1. Отримати всі товари (GET /api/products)
 */
async function getAllProducts(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM products');
    return res.json(rows);
  } catch (error) {
    console.error('Помилка при отриманні товарів:', error);
    return res.status(500).json({ message: 'Внутрішня серверна помилка' });
  }
}

/**
 * 2. Отримати один товар за ID (GET /api/products/:id)
 */
async function getProductById(req, res) {
  try {
    const productId = req.params.id;
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Продукт не знайдено' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error('Помилка при отриманні товару за ID:', error);
    return res.status(500).json({ message: 'Внутрішня серверна помилка' });
  }
}

/**
 * 3. Створити новий товар (POST /api/products)
 * — JSON-тіло: { name, description, price, category }
 * — Опціонально: файл 'image' (multipart/form-data)
 */
async function createProduct(req, res) {
  try {
    const { name, description, price, category } = req.body;
    const imagePath = req.file ? path.join('uploads', path.basename(req.file.path)) : null;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Поля "name" та "price" є обов’язковими' });
    }

    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, category, imagePath) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, price, category || null, imagePath]
    );

    return res.status(201).json({
      message: 'Продукт успішно створено',
      id: result.insertId
    });
  } catch (error) {
    console.error('Помилка при створенні товару:', error);
    return res.status(500).json({ message: 'Внутрішня серверна помилка' });
  }
}

/**
 * 4. Оновити існуючий товар (PUT /api/products/:id)
 * — JSON-тіло може містити будь-які з { name, description, price, category }
 * — Опціонально: файл 'image'. Якщо передано нове зображення — старий видаляється.
 */
async function updateProduct(req, res) {
  try {
    const productId = req.params.id;
    const { name, description, price, category } = req.body;
    const newFile = req.file ? req.file.path : null;

    // 4.1. Зчитуємо старий imagePath, щоб видалити файл, якщо є
    const [existing] = await pool.execute(
      'SELECT imagePath FROM products WHERE id = ?',
      [productId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Продукт не знайдено для оновлення' });
    }
    const oldImagePath = existing[0].imagePath;
    if (newFile && oldImagePath) {
      // Видаляємо старий файл
      const fullOldPath = path.join(__dirname, '..', oldImagePath);
      fs.unlink(fullOldPath, err => {
        if (err) console.error('Помилка при видаленні старого зображення:', err);
      });
    }

    // 4.2. Створюємо запит із COALESCE, щоб не опускати null-значення
    const sql = `
      UPDATE products
      SET
        name        = COALESCE(?, name),
        description = COALESCE(?, description),
        price       = COALESCE(?, price),
        category    = COALESCE(?, category),
        imagePath   = COALESCE(?, imagePath)
      WHERE id = ?
    `;

    // Якщо передано новий файл, зберігаємо шлях у форматі 'uploads/<filename>'
    const imagePath = newFile ? path.join('uploads', path.basename(newFile)) : null;

    const [result] = await pool.execute(sql, [
      name !== undefined ? name : null,
      description !== undefined ? description : null,
      price !== undefined ? price : null,
      category !== undefined ? category : null,
      imagePath,
      productId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Продукт не знайдено для оновлення' });
    }

    return res.json({ message: 'Продукт успішно оновлено' });
  } catch (error) {
    console.error('Помилка при оновленні товару:', error);
    return res.status(500).json({ message: 'Внутрішня серверна помилка' });
  }
}

/**
 * 5. Видалити товар (DELETE /api/products/:id)
 * — Якщо для продукту існує imagePath, видаляємо файл з диску перед видаленням з БД.
 */
async function deleteProduct(req, res) {
  try {
    const productId = req.params.id;

    // 5.1. Знайти imagePath
    const [existing] = await pool.execute(
      'SELECT imagePath FROM products WHERE id = ?',
      [productId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Продукт не знайдено для видалення' });
    }
    const oldImagePath = existing[0].imagePath;
    if (oldImagePath) {
      const fullOldPath = path.join(__dirname, '..', oldImagePath);
      fs.unlink(fullOldPath, err => {
        if (err) console.error('Помилка при видаленні файлу під час видалення продукту:', err);
      });
    }

    // 5.2. Видалити запис
    const [result] = await pool.execute(
      'DELETE FROM products WHERE id = ?',
      [productId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Продукт не знайдено для видалення' });
    }

    return res.json({ message: 'Продукт успішно видалено' });
  } catch (error) {
    console.error('Помилка при видаленні товару:', error);
    return res.status(500).json({ message: 'Внутрішня серверна помилка' });
  }
}

// Експортуємо УСІ 5 ФУНКЦІЙ ПІД ТИМИ Ж САМИМИ ІМЕНАМИ
module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
