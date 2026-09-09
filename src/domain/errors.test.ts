import { describe, expect, it } from "vitest";
import { AppError, getUserErrorMessage } from "./errors";

describe("application errors", () => {
  it("preserves a stable code and user-facing message", () => {
    const error = new AppError("NOT_FOUND", "Player was not found.");

    expect(error).toMatchObject({
      code: "NOT_FOUND",
      message: "Player was not found.",
    });
    expect(error.name).toBe("AppError");
  });

  it("hides unknown error details behind a safe fallback", () => {
    expect(getUserErrorMessage(new Error("internal details"), "Try again.")).toBe(
      "Try again.",
    );
    expect(
      getUserErrorMessage(
        new AppError("STORAGE_ERROR", "Data could not be loaded."),
        "Try again.",
      ),
    ).toBe("Data could not be loaded.");
  });
});
