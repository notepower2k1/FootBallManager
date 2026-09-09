import { describe, expect, it } from "vitest";
import type {
  CreatePlayerInput,
  PlayerRepository,
  UpdatePlayerInput,
} from "./playerRepository";
import { MockPlayerRepository } from "../infrastructure/mock/mockPlayerRepository";

const playerInput: CreatePlayerInput = {
  name: "New Player",
  tier: "B",
  stats: {
    stamina: "B",
    speed: "B",
    strength: "C",
    passing: "B",
    finishing: "A",
    defense: "C",
  },
};

describe("PlayerRepository", () => {
  it("loads the mock players through the repository contract", async () => {
    const repository: PlayerRepository = new MockPlayerRepository();

    await expect(repository.getPlayers()).resolves.toHaveLength(18);
  });

  it("returns a copy so callers cannot mutate repository state", async () => {
    const repository = new MockPlayerRepository();
    const players = await repository.getPlayers();

    players[0].name = "Changed outside repository";

    await expect(repository.getPlayer(players[0].id)).resolves.toMatchObject({
      name: "Nguyen Minh Anh",
    });
  });

  it("creates, updates, and deletes a player", async () => {
    const repository = new MockPlayerRepository();
    const created = await repository.createPlayer(playerInput);
    const update: UpdatePlayerInput = { name: "Updated Player", tier: "A" };

    await expect(repository.getPlayer(created.id)).resolves.toMatchObject({
      name: "New Player",
      tier: "B",
    });
    await expect(repository.updatePlayer(created.id, update)).resolves.toMatchObject({
      name: "Updated Player",
      tier: "A",
    });

    await repository.deletePlayer(created.id);

    await expect(repository.getPlayer(created.id)).resolves.toBeNull();
  });
});
