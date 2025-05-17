/**
 * Кастомные классы ошибок для обработки различных типов ошибок в приложении
 */

// Общий класс ошибки с сообщением и HTTP статусом
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.status = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Ошибка "Ресурс не найден" (404)
class NotFoundError extends AppError {
  constructor(message = 'Ресурс не найден') {
    super(message, 404);
  }
}

// Ошибка "Конфликт данных" (409)
class ConflictError extends AppError {
  constructor(message = 'Конфликт данных') {
    super(message, 409);
  }
}

// Ошибка валидации (400)
class ValidationError extends AppError {
  constructor(errors, message = 'Ошибка валидации') {
    super(message, 400);
    this.errors = errors;
  }
}

// Ошибка "Доступ запрещен" (403)
class ForbiddenError extends AppError {
  constructor(message = 'Доступ запрещен') {
    super(message, 403);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ConflictError,
  ValidationError,
  ForbiddenError
};
