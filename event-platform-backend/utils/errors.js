class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.name = this.constructor.name;
      this.status = statusCode;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class NotFoundError extends AppError {
    constructor(message = 'Ресурс не найден') {
      super(message, 404);
    }
  }
  
  class ConflictError extends AppError {
    constructor(message = 'Конфликт данных') {
      super(message, 409);
    }
  }
  
  class ValidationError extends AppError {
    constructor(errors, message = 'Ошибка валидации') {
      super(message, 400);
      this.errors = errors;
    }
  }
  
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