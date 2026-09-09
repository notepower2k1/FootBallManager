import type { Player, PlayerStats, Tier } from "../domain/player";

export interface CreatePlayerInput {
  name: string;
  avatarFileId?: string;
  tier: Tier;
  stats: PlayerStats;
}

export type UpdatePlayerInput = Partial<CreatePlayerInput>;

export interface PlayerRepository {
  getPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | null>;
  createPlayer(input: CreatePlayerInput): Promise<Player>;
  updatePlayer(id: string, input: UpdatePlayerInput): Promise<Player>;
  deletePlayer(id: string): Promise<void>;
}
