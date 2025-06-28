// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Токен не надано' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Недійсний токен' });
  }
}

function adminAuth(req, res, next) {
  try {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Доступ заборонено: потрібна роль admin' });
    }
  } catch {
    return res.status(403).json({ message: 'Не вдалося перевірити роль користувача' });
  }
}

module.exports = { auth, adminAuth };
