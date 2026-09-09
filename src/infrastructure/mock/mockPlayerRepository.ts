import { MAX_PLAYERS, type Player } from "../../domain/player";
import { AppError } from "../../domain/errors";
import type {
  CreatePlayerInput,
  PlayerRepository,
  UpdatePlayerInput,
} from "../../repositories/playerRepository";
import { mockPlayers } from "./mockPlayers";

const copyPlayer = (player: Player): Player => ({
  ...player,
  stats: { ...player.stats },
});

export class MockPlayerRepository implements PlayerRepository {
  private players: Player[];

  constructor(initialPlayers: Player[] = mockPlayers) {
    this.players = initialPlayers.map(copyPlayer);
  }

  async getPlayers(): Promise<Player[]> {
    return this.players.map(copyPlayer);
  }

  async getPlayer(id: string): Promise<Player | null> {
    const player = this.players.find((candidate) => candidate.id === id);
    return player ? copyPlayer(player) : null;
  }

  async createPlayer(input: CreatePlayerInput): Promise<Player> {
    if (this.players.length >= MAX_PLAYERS) {
      throw new AppError(
        "VALIDATION_ERROR",
        `A maximum of ${MAX_PLAYERS} players is allowed.`,
      );
    }

    const now = new Date().toISOString();
    const player: Player = {
      ...input,
      stats: { ...input.stats },
      id: `player-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    };

    this.players.push(player);
    return copyPlayer(player);
  }

  async updatePlayer(id: string, input: UpdatePlayerInput): Promise<Player> {
    const index = this.players.findIndex((player) => player.id === id);
    if (index < 0) {
      throw new AppError("NOT_FOUND", "Player could not be found.");
    }

    const current = this.players[index];
    const updated: Player = {
      ...current,
      ...input,
      stats: input.stats ? { ...input.stats } : { ...current.stats },
      updatedAt: new Date().toISOString(),
    };

    this.players[index] = updated;
    return copyPlayer(updated);
  }

  async deletePlayer(id: string): Promise<void> {
    const index = this.players.findIndex((player) => player.id === id);
    if (index < 0) {
      throw new AppError("NOT_FOUND", "Player could not be found.");
    }

    this.players.splice(index, 1);
  }
}
