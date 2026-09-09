import { describe, expect, it } from "vitest";
import { AppError } from "../../domain/errors";
import type { EditLockRepository } from "../../repositories/editLockRepository";
import { MockEditLockRepository } from "./mockEditLockRepository";

describe("MockEditLockRepository", () => {
  it("allows one active editor and rejects a second editor", async () => {
    const repository: EditLockRepository = new MockEditLockRepository();
    const lock = await repository.acquireLock("Alice");

    await expect(repository.getLock()).resolves.toMatchObject({
      sessionId: lock.sessionId,
      editorName: "Alice",
    });
    await expect(repository.acquireLock("Bob")).rejects.toMatchObject({
      code: "EDIT_LOCKED",
    } satisfies Partial<AppError>);
  });

  it("renews and releases only with the owning session", async () => {
    const repository = new MockEditLockRepository();
    const lock = await repository.acquireLock("Alice");

    await expect(repository.renewLock(lock.sessionId)).resolves.toMatchObject({
      sessionId: lock.sessionId,
    });
    await expect(repository.releaseLock("other-session")).rejects.toMatchObject({
      code: "INVALID_EDITOR_SESSION",
    } satisfies Partial<AppError>);

    await repository.releaseLock(lock.sessionId);
    await expect(repository.getLock()).resolves.toBeNull();
  });
});
