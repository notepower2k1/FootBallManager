import { AppError } from "../../domain/errors";
import type { EditLock, EditLockRepository } from "../../repositories/editLockRepository";

const MOCK_LOCK_TTL_MS = 90_000;

const copyLock = (lock: EditLock): EditLock => ({ ...lock });

export class MockEditLockRepository implements EditLockRepository {
  private lock: EditLock | null = null;

  async getLock(): Promise<EditLock | null> {
    if (this.lock && Date.parse(this.lock.expiresAt) <= Date.now()) {
      this.lock = null;
    }

    return this.lock ? copyLock(this.lock) : null;
  }

  async acquireLock(editorName: string): Promise<EditLock> {
    if (await this.getLock()) {
      throw new AppError("EDIT_LOCKED", "Another user is currently editing.");
    }

    const lock: EditLock = {
      sessionId: crypto.randomUUID(),
      editorName,
      expiresAt: new Date(Date.now() + MOCK_LOCK_TTL_MS).toISOString(),
    };
    this.lock = lock;
    return copyLock(lock);
  }

  async renewLock(sessionId: string): Promise<EditLock> {
    const current = await this.getLock();
    if (!current) {
      throw new AppError("EDIT_LEASE_EXPIRED", "The edit session has expired.");
    }
    if (current.sessionId !== sessionId) {
      throw new AppError("INVALID_EDITOR_SESSION", "The edit session is invalid.");
    }

    this.lock = {
      ...current,
      expiresAt: new Date(Date.now() + MOCK_LOCK_TTL_MS).toISOString(),
    };
    return copyLock(this.lock);
  }

  async releaseLock(sessionId: string): Promise<void> {
    const current = await this.getLock();
    if (!current) return;
    if (current.sessionId !== sessionId) {
      throw new AppError("INVALID_EDITOR_SESSION", "The edit session is invalid.");
    }

    this.lock = null;
  }
}
