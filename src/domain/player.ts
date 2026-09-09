export type Rating = "S" | "A" | "B" | "C" | "D";
export type Tier = Rating;

export const MAX_PLAYERS = 50;

export interface PlayerStats {
  stamina: Rating;
  speed: Rating;
  strength: Rating;
  passing: Rating;
  finishing: Rating;
  defense: Rating;
}

export interface Player {
  id: string;
  name: string;
  avatarFileId?: string;
  tier: Tier;
  stats: PlayerStats;
  createdAt: string;
  updatedAt: string;
}

export interface GuestPlayer {
  id: string;
  name: string;
  isGuest: true;
  tier: 0;
  stats: PlayerStats;
}
