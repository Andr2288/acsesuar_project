// routes/productRoutes.js

const express = require('express');

// Імпортуємо УСІ 5 функцій з контролера. Переконайтеся,
// що саме ці імена є в productController.js
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController.js');

const { auth, adminAuth } = require('../middleware/authMiddleware.js');
const uploadMiddleware = require('../middleware/uploadMiddleware.js');

const router = express.Router();

/**
 * 1) GET /api/products
 *    Повернути список усіх товарів (публічний доступ)
 */
router.get('/', getAllProducts);

/**
 * 2) GET /api/products/:id
 *    Повернути один товар за його ID (публічний доступ)
 */
router.get('/:id', getProductById);

/**
 * 3) POST /api/products
 *    Створити новий товар (доступно тільки авторизованому адміністратору)
 *    JSON-тіло має містити: { name, description, price, category }
 *    Опціонально: multipart/form-data з полем 'image'
 */
router.post(
  '/',
  auth,                       // Перевіряємо JWT
  adminAuth,                  // Перевіряємо роль 'admin'
  uploadMiddleware.single('image'), // Якщо є файл 'image', він потрапить у req.file
  createProduct               // Колбек (має існувати в контролері)
);

/**
 * 4) PUT /api/products/:id
 *    Оновити існуючий товар (тільки адміністратор)
 *    JSON-тіло може містити будь-які з полів { name, description, price, category }
 *    Опціонально: нове зображення у полі 'image'
 */
router.put(
  '/:id',
  auth,
  adminAuth,
  uploadMiddleware.single('image'),
  updateProduct
);

/**
 * 5) DELETE /api/products/:id
 *    Видалити товар за ID (тільки адміністратор)
 */
router.delete(
  '/:id',
  auth,
  adminAuth,
  deleteProduct
);

module.exports = router;
