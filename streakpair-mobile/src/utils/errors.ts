import { ApiError } from '@/types';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class PermissionError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 'PERMISSION_ERROR', 403);
    this.name = 'PermissionError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export function handleApiError(error: any): AppError {
  if (error?.success === false) {
    const apiError = error as ApiError;

    switch (error.error?.toLowerCase()) {
      case 'unauthorized':
      case 'authentication failed':
        return new AuthenticationError(apiError.message || 'Authentication failed');

      case 'validation error':
      case 'invalid input':
        return new ValidationError(apiError.message || 'Validation failed');

      case 'forbidden':
      case 'permission denied':
        return new PermissionError(apiError.message || 'Permission denied');

      case 'not found':
        return new NotFoundError(apiError.message || 'Resource not found');

      default:
        return new AppError(
          apiError.message || 'An error occurred',
          apiError.error || 'UNKNOWN_ERROR',
          error.statusCode
        );
    }
  }

  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network')) {
    return new NetworkError(error.message);
  }

  if (error instanceof AppError) {
    return error;
  }

  // Default case
  return new AppError(
    error?.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR'
  );
}

export function getErrorMessage(error: AppError): string {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Please check your internet connection and try again.';

    case 'AUTH_ERROR':
      return 'Please log in again to continue.';

    case 'VALIDATION_ERROR':
      return error.message || 'Please check your input and try again.';

    case 'PERMISSION_ERROR':
      return 'You don\'t have permission to perform this action.';

    case 'NOT_FOUND':
      return 'The requested resource could not be found.';

    default:
      return error.message || 'Something went wrong. Please try again.';
  }
}

export function isRetryableError(error: AppError): boolean {
  return (
    error.code === 'NETWORK_ERROR' ||
    error.code === 'TIMEOUT_ERROR' ||
    (error.statusCode && error.statusCode >= 500)
  );
}