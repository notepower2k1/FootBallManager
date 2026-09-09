export interface EditLock {
  sessionId: string;
  editorName: string;
  expiresAt: string;
}

export interface EditLockRepository {
  getLock(): Promise<EditLock | null>;
  acquireLock(editorName: string): Promise<EditLock>;
  renewLock(sessionId: string): Promise<EditLock>;
  releaseLock(sessionId: string): Promise<void>;
}
