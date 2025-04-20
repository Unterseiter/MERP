const { Logger } = require('../utils/LogFile');
const FileUploader = require('../middleware/fileUploader');
const FileQueue = require('../middleware/fileQueue');

// Логгер для работы с файлами
const fileLogger = new Logger({
  logDir: './logs/file-uploads',
  logFile: 'files.log',
  logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
}).init();

// Очередь для удаления файлов
const fileQueue = new FileQueue({
  logger: fileLogger,
  cleanupInterval: 30000 // 30 секунд
});

// Загрузчик для основного фото мероприятий
const eventMainUploader = new FileUploader({
  tempDir: './uploads/events/tmp',
  finalDir: './uploads/events/main',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  logger: fileLogger,
  fileQueue
});

// Загрузчик для дополнительных фото
const eventGalleryUploader = new FileUploader({
  tempDir: './uploads/events/tmp',
  finalDir: './uploads/events/gallery',
  maxFileSize: 15 * 1024 * 1024, // 15MB
  logger: fileLogger,
  fileQueue
});

module.exports = {
  eventMainUploader,
  eventGalleryUploader
};