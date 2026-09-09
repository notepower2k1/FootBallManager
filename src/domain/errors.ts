export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "EDIT_LOCKED"
  | "INVALID_EDITOR_SESSION"
  | "EDIT_LEASE_EXPIRED"
  | "DATA_CHANGED"
  | "UPLOAD_FAILED"
  | "STORAGE_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export function getUserErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof AppError ? error.message : fallback;
}
