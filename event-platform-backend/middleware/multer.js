const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

// Указываем директорию для хранения файлов
const uploadDir = path.join(__dirname, '../uploads/events');

// Создаем директорию, если она не существует
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Создаем уникальное имя файла с хешированием
    const hash = crypto
      .createHash('sha256')
      .update(file.originalname + Date.now())
      .digest('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${hash}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Ограничение 5 МБ
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(console.log('Только изображения разрешены'), false);
    }
    cb(null, true);
  },
});

module.exports = upload;