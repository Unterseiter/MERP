const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { logger } = require('../utils/LogFile');

class FileUploader {
  constructor(options = {}) {
    this.tempDir = options.tempDir || path.join(__dirname, '../uploads/tmp');
    this.finalDir = options.finalDir || path.join(__dirname, '../uploads');
    this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024;
    this.allowedMimeTypes = options.allowedMimeTypes || [
      'image/png', 'image/jpeg', 'image/gif', 'image/webp'
    ];
    this.logger = options.logger || logger;
    this.fileQueue = options.fileQueue;
    this.finalDir = options.finalDir || path.join(__dirname, '../uploads');

    this.initialize().catch(err => {
      this.logger.error(`Initialization failed: ${err.message}`);
    });
  }

  async initialize() {
    await fs.mkdir(this.tempDir, { recursive: true });
    await fs.mkdir(this.finalDir, { recursive: true });
    this.logger.info(`Upload directories initialized: ${this.tempDir}, ${this.finalDir}`);
  }

  getMulterUpload() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, this.tempDir),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${crypto.randomUUID()}${ext}`;
        this.logger.debug(`Generated filename: ${filename}`);
        cb(null, filename);
      }
    });

    return multer({
      storage,
      limits: { fileSize: this.maxFileSize },
      fileFilter: (req, file, cb) => {
        if (this.allowedMimeTypes.includes(file.mimetype)) {
          this.logger.debug(`Accepted file type: ${file.mimetype}`);
          cb(null, true);
        } else {
          this.logger.warn(`Rejected file type: ${file.mimetype}`);
          cb(new Error('Недопустимый тип файла'), false);
        }
      }
    });
  }

  async convertToWebp(req, res, next) {
    if (!req.file) return next();

    let originalPath = req.file.path;
    let sharpProcessor = null;

    try {
      // 1. Чтение файла в буфер
      const inputBuffer = await fs.readFile(originalPath);

      // 2. Инициализация sharp
      sharpProcessor = sharp(inputBuffer);

      // 3. Генерация путей с использованием this.finalDir
      const newFilename = `${crypto.randomUUID()}.webp`;
      const outputPath = path.join(this.finalDir, newFilename);

      // 4. Обработка изображения
      await sharpProcessor
        .webp({ quality: 80 })
        .toFile(outputPath);

      // 5. Обновление метаданных
      req.file = {
        ...req.file,
        filename: newFilename,
        path: outputPath,
        destination: this.finalDir,
        originalname: newFilename,
        mimetype: 'image/webp'
      };

      // 6. Задержка перед удалением
      await new Promise(resolve => setTimeout(resolve, 300));

      // 7. Удаление временного файла
      await fs.unlink(originalPath);

      return next();
    } catch (err) {
      // 8. Обработка ошибок
      console.error('Ошибка конвертации:', err);

      // 9. Безопасное удаление файла
      if (originalPath) {
        try {
          await fs.access(originalPath);
          await fs.unlink(originalPath);
        } catch (unlinkErr) {
          console.error('Ошибка удаления файла:', unlinkErr);
          this.fileQueue.addToQueue(originalPath);
        }
      }

      return res.status(500).json({
        error: 'IMAGE_PROCESSING_ERROR',
        message: 'Не удалось обработать изображение'
      });
    } finally {
      // 10. Корректное закрытие sharpProcessor
      if (sharpProcessor) {
        try {
          sharpProcessor.end();
        } catch (e) {
          console.error('Ошибка закрытия sharp:', e);
        }
      }
    }
  }

  async cleanupTempFile(filePath) {
    try {
      // Закрываем все возможные дескрипторы
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const fd = await fs.open(filePath, 'r+');
      await fd.close();
      
      await fs.unlink(filePath);
      this.logger.debug(`Temp file cleaned: ${filePath}`);
    } catch (err) {
      this.logger.warn(`Temp cleanup failed: ${filePath} - ${err.message}`);
      this.fileQueue.addToQueue(filePath);
    }
  }

  async handleProcessingError(filePath, error, res) {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      this.logger.warn(`Error cleanup failed: ${filePath} - ${err.message}`);
      if (this.fileQueue) {
        this.fileQueue.addToQueue(filePath);
      }
    }

    res.status(500).json({
      error: 'IMAGE_PROCESSING_ERROR',
      message: 'Не удалось обработать изображение'
    });
  }
}

module.exports = FileUploader;