import type { Player, PlayerStats, Rating, Tier } from "../../../domain/player";
import type { CreatePlayerInput } from "../../../repositories/playerRepository";

export const STAT_FIELDS = [
  { key: "stamina", label: "Stamina" },
  { key: "speed", label: "Speed" },
  { key: "strength", label: "Strength" },
  { key: "passing", label: "Passing" },
  { key: "finishing", label: "Finishing" },
  { key: "defense", label: "Defense" },
] as const;

export const RATING_OPTIONS: readonly Rating[] = ["S", "A", "B", "C", "D"];
export const PLAYER_PAGE_SIZE = 20;

export const AVATAR_OPTIONS = [
  { value: "", label: "No avatar" },
  { value: "avatar-001", label: "Avatar 1" },
  { value: "avatar-002", label: "Avatar 2" },
  { value: "avatar-003", label: "Avatar 3" },
] as const;

export type StatKey = (typeof STAT_FIELDS)[number]["key"];

export interface PlayerFormValues {
  name: string;
  avatarFileId: string;
  tier: Tier | "";
  stats: Record<StatKey, Rating | "">;
}

export type PlayerFormField = "name" | "tier" | StatKey;
export type PlayerFormErrors = Partial<Record<PlayerFormField, string>>;

export function createPlayerFormValues(player: Player | null): PlayerFormValues {
  return {
    name: player?.name ?? "",
    avatarFileId: player?.avatarFileId ?? "",
    tier: player?.tier ?? "",
    stats: Object.fromEntries(
      STAT_FIELDS.map(({ key }) => [key, player?.stats[key] ?? ""]),
    ) as PlayerFormValues["stats"],
  };
}

export function validatePlayerForm(values: PlayerFormValues): PlayerFormErrors {
  const errors: PlayerFormErrors = {};
  if (!values.name.trim()) errors.name = "Name is required.";
  if (!values.tier) errors.tier = "Tier is required.";

  for (const { key, label } of STAT_FIELDS) {
    if (!values.stats[key]) errors[key] = `${label} is required.`;
  }

  return errors;
}

export function toPlayerInput(values: PlayerFormValues): CreatePlayerInput {
  const stats = {} as PlayerStats;
  for (const { key } of STAT_FIELDS) {
    stats[key] = values.stats[key] as Rating;
  }

  const avatarFileId = values.avatarFileId.trim();
  return {
    name: values.name.trim(),
    tier: values.tier as Tier,
    stats,
    ...(avatarFileId ? { avatarFileId } : {}),
  };
}

export function filterPlayers(
  players: readonly Player[],
  query: string,
  tier: Tier | "",
): Player[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return players.filter(
    (player) =>
      (!normalizedQuery ||
        player.name.toLocaleLowerCase().includes(normalizedQuery)) &&
      (!tier || player.tier === tier),
  );
}
