const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/LogFile');

//модуль для управления временными файлами 
class FileQueue {
    constructor(options = {}) {
      this.queue = new Map();
      this.isProcessing = false;
      this.logger = options.logger || logger;
      this.retryPolicy = {
        maxRetries: 5,
        delay: 1000,
        factor: 2
      };
      
      setInterval(() => this.processQueue(), 30000).unref();
      this.logger.info('File Queue initialized');
    }
  
    async addToQueue(filePath) {
      this.queue.set(filePath, {
        retries: 0,
        nextTry: Date.now()
      });
      this.logger.debug(`Added to cleanup queue: ${filePath}`);
      this.processQueue();
    }
  
    async processQueue() {
      if (this.isProcessing) return;
      this.isProcessing = true;
  
      try {
        for (const [filePath, { retries, nextTry }] of this.queue) {
          if (Date.now() < nextTry) continue;
  
          try {
            await this.safeUnlink(filePath);
            this.queue.delete(filePath);
            this.logger.debug(`Successfully cleaned: ${filePath}`);
          } catch (err) {
            await this.handleUnlinkError(filePath, err);
          }
        }
      } finally {
        this.isProcessing = false;
      }
    }
  
    async safeUnlink(filePath) {
      try {
        await fs.access(filePath);
      } catch {
        this.queue.delete(filePath);
        return;
      }
  
      const stats = await fs.lstat(filePath);
      if (stats.isDirectory()) {
        throw new Error('Path is directory');
      }
  
      await fs.unlink(filePath);
    }
  
    async handleUnlinkError(filePath, error) {
      const entry = this.queue.get(filePath);
      
      if (entry.retries >= this.retryPolicy.maxRetries) {
        this.queue.delete(filePath);
        this.logger.error(`Permanent failure for ${filePath}: ${error.message}`);
        return;
      }
  
      entry.retries += 1;
      entry.nextTry = Date.now() + 
        this.retryPolicy.delay * Math.pow(this.retryPolicy.factor, entry.retries);
      
      this.logger.warn(`Retry scheduled (${entry.retries}/${this.retryPolicy.maxRetries}) for ${filePath}`);
    }
  }
module.exports = FileQueue;