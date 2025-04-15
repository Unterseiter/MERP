const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

// Пути должны быть объявлены в начале файла
const tempUploadDir = path.join(__dirname, '../uploads/events/tmp');
const finalUploadDir = path.join(__dirname, '../uploads/events');

// Создаем директории при инициализации
(async () => {
  await fs.mkdir(tempUploadDir, { recursive: true });
  await fs.mkdir(finalUploadDir, { recursive: true });
})();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const hash = crypto.randomUUID();
    cb(null, `${hash}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    allowedTypes.includes(file.mimetype) 
      ? cb(null, true)
      : cb(new Error('Недопустимый тип файла'), false);
  }
});

const convertToWebp = async (req, res, next) => {
  if (!req.file) return next();

  let originalPath;
  try {
    originalPath = req.file.path;
    const newFilename = `${crypto.randomUUID()}.webp`;
    const outputPath = path.join(finalUploadDir, newFilename);
    // Конвертация
    await sharp(originalPath)
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Обновляем файловые метаданные
    req.file = {
      ...req.file,
      filename: newFilename,
      path: outputPath,
      destination: finalUploadDir,
      originalname: newFilename,
      mimetype: 'image/webp'
    };

    // Очистка временного файла
    await fs.unlink(originalPath);
    
    // Явный вызов next()
    return next();

  } catch (err) {
    console.error('Фатальная ошибка конвертации:', err);
    
    // Удаление временных файлов
    if (originalPath) {
      await fs.unlink(originalPath).catch(() => {});
    }

    // Отправка ошибки клиенту
    return res.status(500).json({
      error: 'IMAGE_PROCESSING_ERROR',
      message: 'Не удалось обработать изображение'
    });
  }
};

module.exports = {
  upload,
  convertToWebp
};