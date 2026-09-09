import { describe, expect, it } from "vitest";
import { MAX_PLAYERS } from "../../domain/player";
import { mockPlayers } from "./mockPlayers";
import { MockPlayerRepository } from "./mockPlayerRepository";

describe("MockPlayerRepository", () => {
  it("rejects creating a player after the 50-player limit", async () => {
    const players = Array.from({ length: MAX_PLAYERS }, (_, index) => ({
      ...mockPlayers[index % mockPlayers.length],
      id: `limit-player-${index + 1}`,
    }));
    const repository = new MockPlayerRepository(players);

    await expect(
      repository.createPlayer({
        name: "Too Many Players",
        tier: "C",
        stats: mockPlayers[0].stats,
      }),
    ).rejects.toThrow("maximum of 50 players");
  });
});
