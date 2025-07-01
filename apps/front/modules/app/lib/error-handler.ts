// Глобальный обработчик ошибок
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCallbacks: Array<(error: Error) => void> = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Подписка на ошибки
  subscribe(callback: (error: Error) => void) {
    this.errorCallbacks.push(callback);
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  // Обработка ошибки
  handleError(error: Error) {
    console.error('ErrorHandler caught error:', error);
    
    // Уведомляем всех подписчиков
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  // Обработка асинхронных ошибок
  handleAsyncError(error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.handleError(errorObj);
  }
}

// Экспортируем синглтон
export const errorHandler = ErrorHandler.getInstance();

// Утилита для оборачивания функций
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => R | Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.handleAsyncError(error);
      throw error; // Перебрасываем ошибку дальше
    }
  };
}; 