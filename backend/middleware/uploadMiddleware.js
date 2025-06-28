// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, uniqueName);
    }
});

function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Недійсний формат файлу. Дозволено лише зображення.'), false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
