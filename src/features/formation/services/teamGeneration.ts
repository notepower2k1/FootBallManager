import type { FormationMode } from "../../../domain/formation";
import type { GuestPlayer, Player, PlayerStats, Rating } from "../../../domain/player";
import { getTeamCapacity } from "./formationState";

export type RuntimePlayer = Player | GuestPlayer;

export interface BalanceWeights {
  tierWeight: number;
  statsWeight: number;
}

export interface GeneratedTeams {
  teamA: RuntimePlayer[];
  teamB: RuntimePlayer[];
  unassigned: RuntimePlayer[];
}

const RATING_SCORES: Record<Rating, number> = {
  S: 5,
  A: 4,
  B: 3,
  C: 2,
  D: 1,
};

const STAT_KEYS: (keyof PlayerStats)[] = [
  "stamina",
  "speed",
  "strength",
  "passing",
  "finishing",
  "defense",
];

export function getRequiredPlayerCount(mode: FormationMode): number {
  return getTeamCapacity(mode) * 2;
}

export function createGuestPlayers(
  realPlayerCount: number,
  mode: FormationMode,
  defaultStats: PlayerStats,
): GuestPlayer[] {
  const guestCount = Math.max(0, getRequiredPlayerCount(mode) - realPlayerCount);

  return Array.from({ length: guestCount }, (_, index) => ({
    id: `guest-${index + 1}`,
    name: `Ngoại binh ${index + 1}`,
    isGuest: true as const,
    tier: 0 as const,
    stats: { ...defaultStats },
  }));
}

export function getRatingScore(rating: Rating | 0): number {
  return rating === 0 ? 0 : RATING_SCORES[rating];
}

export function getStatsAverage(stats: PlayerStats): number {
  return (
    STAT_KEYS.reduce((total, key) => total + getRatingScore(stats[key]), 0) /
    STAT_KEYS.length
  );
}

export function getPlayerStrength(
  player: Pick<RuntimePlayer, "tier" | "stats">,
  weights: BalanceWeights,
): number {
  const tierScore = getRatingScore(player.tier);
  const statsScore = getStatsAverage(player.stats);
  return (tierScore * weights.tierWeight + statsScore * weights.statsWeight) / 100;
}

export function getTeamPower(
  players: readonly RuntimePlayer[],
  weights: BalanceWeights,
): number {
  return Number(
    players
      .reduce((total, player) => total + getPlayerStrength(player, weights), 0)
      .toFixed(1),
  );
}

export function getBalancePercentage(
  teamAPower: number,
  teamBPower: number,
): number {
  const strongestTeam = Math.max(teamAPower, teamBPower);
  if (strongestTeam === 0) return 100;

  return Math.round(
    Math.max(0, 1 - Math.abs(teamAPower - teamBPower) / strongestTeam) * 100,
  );
}

export function generateRandomTeams(
  players: readonly Player[],
  mode: FormationMode,
  defaultStats: PlayerStats,
  random: () => number = Math.random,
): GeneratedTeams {
  const pool = [...players, ...createGuestPlayers(players.length, mode, defaultStats)];
  const shuffled = shuffle(pool, random);
  return splitTeams(shuffled, mode);
}

export function generateBalancedTeams(
  players: readonly Player[],
  mode: FormationMode,
  defaultStats: PlayerStats,
  weights: BalanceWeights,
): GeneratedTeams {
  const sortedPool = [...players, ...createGuestPlayers(players.length, mode, defaultStats)]
    .sort(
      (left, right) =>
        getPlayerStrength(right, weights) - getPlayerStrength(left, weights),
    );
  const requiredPlayerCount = getRequiredPlayerCount(mode);
  const pool = sortedPool.slice(0, requiredPlayerCount);
  const teamSize = getTeamCapacity(mode);
  let bestTeamA = pool.slice(0, teamSize);
  let bestTeamB = pool.slice(teamSize);
  let bestDifference = Math.abs(
    getTeamPower(bestTeamA, weights) - getTeamPower(bestTeamB, weights),
  );

  visitCombinations(pool, teamSize, (teamA) => {
    const teamAIds = new Set(teamA.map(({ id }) => id));
    const teamB = pool.filter(({ id }) => !teamAIds.has(id));
    const difference = Math.abs(
      getTeamPower(teamA, weights) - getTeamPower(teamB, weights),
    );

    if (difference < bestDifference) {
      bestDifference = difference;
      bestTeamA = teamA;
      bestTeamB = teamB;
    }
  });

  return {
    teamA: bestTeamA,
    teamB: bestTeamB,
    unassigned: sortedPool.slice(requiredPlayerCount),
  };
}

function splitTeams(pool: RuntimePlayer[], mode: FormationMode): GeneratedTeams {
  const teamSize = getTeamCapacity(mode);
  return {
    teamA: pool.slice(0, teamSize),
    teamB: pool.slice(teamSize, teamSize * 2),
    unassigned: pool.slice(teamSize * 2),
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const candidate = Math.floor(random() * (index + 1));
    const swapIndex = Math.min(index, Math.max(0, candidate));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return items;
}

function visitCombinations(
  pool: readonly RuntimePlayer[],
  size: number,
  visit: (team: RuntimePlayer[]) => void,
): void {
  const selected: RuntimePlayer[] = [];

  const walk = (start: number) => {
    if (selected.length === size) {
      visit([...selected]);
      return;
    }

    const remaining = size - selected.length;
    for (let index = start; index <= pool.length - remaining; index += 1) {
      selected.push(pool[index]);
      walk(index + 1);
      selected.pop();
    }
  };

  walk(0);
}
