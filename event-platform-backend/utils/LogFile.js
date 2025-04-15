const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const appendFile = promisify(fs.appendFile);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);

class Logger {
  constructor(options = {}) {
    this.logDir = options.logDir || path.join(__dirname, 'logs');
    this.logFile = options.logFile || 'app.log';
    this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5MB по умолчанию
    this.maxFiles = options.maxFiles || 5; // 5 файлов по умолчанию
    this.logLevel = options.logLevel || 'info';
    this.consoleOutput = options.consoleOutput !== false; // Вывод в консоль включен по умолчанию
  }

  async init() {
    try {
      await mkdir(this.logDir, { recursive: true });
      this.initialized = true;
    } catch (err) {
      console.error('Could not create log directory:', err);
      this.initialized = false;
    }
    return this;
  }

  getLogLevelValue(level) {
    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    return levels[level] || 2;
  }

  async writeLog(level, message) {
    if (this.getLogLevelValue(level) > this.getLogLevelValue(this.logLevel)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    // Вывод в консоль
    if (this.consoleOutput) {
      const colors = {
        error: '\x1b[31m', // red
        warn: '\x1b[33m', // yellow
        info: '\x1b[36m', // cyan
        debug: '\x1b[35m' // magenta
      };
      console.log(`${colors[level] || ''}${logMessage}\x1b[0m`);
    }

    // Запись в файл
    if (this.initialized) {
      const logPath = path.join(this.logDir, this.logFile);
      
      try {
        let stats;
        try {
          stats = await stat(logPath);
        } catch (err) {
          if (err.code !== 'ENOENT') throw err;
        }

        if (stats && stats.size > this.maxFileSize) {
          await this.rotateLogs();
        }

        await appendFile(logPath, logMessage + '\n');
      } catch (err) {
        console.error('Failed to write to log file:', err);
      }
    }
  }

  async rotateLogs() {
    const logPath = path.join(this.logDir, this.logFile);
    
    // Удаляем самый старый файл
    const oldestFile = path.join(this.logDir, `${this.logFile}.${this.maxFiles - 1}`);
    try {
      await fs.promises.unlink(oldestFile);
    } catch (err) {
      if (err.code !== 'ENOENT') console.error('Error deleting oldest log file:', err);
    }

    // Ротация файлов
    for (let i = this.maxFiles - 2; i >= 0; i--) {
      const currentFile = i === 0 ? logPath : path.join(this.logDir, `${this.logFile}.${i}`);
      const newFile = path.join(this.logDir, `${this.logFile}.${i + 1}`);

      try {
        await fs.promises.rename(currentFile, newFile);
      } catch (err) {
        if (err.code !== 'ENOENT') console.error('Error rotating log file:', err);
      }
    }
  }

  async error(message) {
    await this.writeLog('error', message);
  }

  async warn(message) {
    await this.writeLog('warn', message);
  }

  async info(message) {
    await this.writeLog('info', message);
  }

  async debug(message) {
    await this.writeLog('debug', message);
  }
}

// Создаем экземпляр логгера по умолчанию для удобства
const defaultLogger = new Logger().init();

module.exports = {
  Logger,
  logger: defaultLogger
};