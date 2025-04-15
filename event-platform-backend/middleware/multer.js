const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises; // Используем promises

const uploadDir = path.join(__dirname, '../uploads/events');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const hash = crypto
      .createHash('sha256')
      .update(file.originalname + Date.now())
      .digest('hex');
    const ext = '.webp';
    cb(null, `${hash}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Только изображения (PNG, JPEG, GIF, WebP) разрешены'), false);
    }
    cb(null, true);
  },
});

module.exports = upload;