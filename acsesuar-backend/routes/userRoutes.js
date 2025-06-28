// routes/userRoutes.js
const express = require('express');
const { register, login, getUserProfile, updateUser } = require('../controllers/userController.js');
const { auth } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Реєстрація
router.post('/register', register);

// Логін
router.post('/login', login);

// Отримати профіль (тільки авторизовані)
router.get('/profile', auth, getUserProfile);

// ОНОВЛИТИ ПРОФІЛЬ (логін/пароль) — ПАТЧ на /api/users/update
router.patch('/update', auth, updateUser);

module.exports = router;
