const { logger } = require('../utils/LogFile');

// Middleware для логирования всех запросов
function requestLogger(req, res, next) {
  const { method, originalUrl } = req;
  const startTime = Date.now();

  res.on('finish', () => {
    const { statusCode } = res;
    const responseTime = Date.now() - startTime;

    logger.info(`${method} ${originalUrl} ${statusCode} - ${responseTime}ms`);
  });

  next();
}

// Middleware для логирования всех ошибок
function errorLogger(err, req, res, next) {
  const { method, originalUrl } = req;

  logger.error(`Ошибка при ${method} ${originalUrl}: ${err.message}`);
  next(err); // передаём ошибку дальше (например, в express error handler)
}

module.exports = {
  requestLogger,
  errorLogger
};
