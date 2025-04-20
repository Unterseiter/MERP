const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/LogFile');

//модуль для управления временными файлами 
class FileQueue {
  constructor(options = {}) {
    this.queue = new Set();
    this.isProcessing = false;
    this.logger = options.logger || logger;
    this.cleanupInterval = options.cleanupInterval || 60000;
    
    this.initInterval();
    this.logger.info('File Queue initialized');
  }

  initInterval() {
    this.interval = setInterval(() => this.processQueue(), this.cleanupInterval);
    this.interval.unref(); 
  }

  async addToQueue(filePath) {
    this.queue.add(filePath);
    this.logger.debug(`Added to cleanup queue: ${filePath}`);
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  async processQueue() {
    this.isProcessing = true;
    this.logger.debug(`Processing cleanup queue (${this.queue.size} items)`);
    
    for (const filePath of this.queue) {
      try {
        await fs.unlink(filePath);
        this.queue.delete(filePath);
        this.logger.debug(`Successfully cleaned: ${filePath}`);
      } catch (err) {
        if (err.code === 'ENOENT') {
          this.queue.delete(filePath);
          this.logger.warn(`File not found: ${filePath}`);
        } else {
          this.logger.error(`Cleanup error for ${filePath}: ${err.message}`);
        }
      }
    }
    
    this.isProcessing = false;
  }
}

module.exports = FileQueue;