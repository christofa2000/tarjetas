/**
 * Manejo centralizado de errores
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

/**
 * Maneja errores de API y devuelve un mensaje amigable
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Log error desconocido solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('Unhandled error:', error);
    }
    return error.message || 'Ha ocurrido un error inesperado';
  }

  return 'Ha ocurrido un error inesperado';
};

/**
 * Extrae código de error de una respuesta HTTP
 */
export const extractErrorCode = (error: unknown): string | null => {
  if (error instanceof AppError) {
    return error.code;
  }

  // Si es un error de axios
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'code' in error.response.data
  ) {
    return String(error.response.data.code);
  }

  return null;
};
