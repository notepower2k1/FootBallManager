import { describe, expect, it } from "vitest";
import type { PlayerStats } from "../../../domain/player";
import { mockPlayers } from "../../../infrastructure/mock/mockPlayers";
import {
  createGuestPlayers,
  generateBalancedTeams,
  generateRandomTeams,
  getBalancePercentage,
  getPlayerStrength,
  getRatingScore,
  getStatsAverage,
} from "./teamGeneration";

const guestStats: PlayerStats = {
  stamina: "C",
  speed: "C",
  strength: "C",
  passing: "C",
  finishing: "C",
  defense: "C",
};

describe("team generation", () => {
  it("creates only the guests needed to fill a mode", () => {
    const guests = createGuestPlayers(4, "5v5", guestStats);

    expect(guests).toHaveLength(6);
    expect(guests[0]).toMatchObject({
      id: "guest-1",
      name: "Ngoại binh 1",
      isGuest: true,
      tier: 0,
      stats: guestStats,
    });
    expect(createGuestPlayers(10, "5v5", guestStats)).toEqual([]);
  });

  it("fills an 11v11 formation to 22 runtime players", () => {
    expect(createGuestPlayers(18, "11v11", guestStats)).toHaveLength(4);

    const result = generateRandomTeams(
      mockPlayers,
      "11v11",
      guestStats,
      () => 0.1,
    );

    expect(result.teamA).toHaveLength(11);
    expect(result.teamB).toHaveLength(11);
    expect(result.unassigned).toEqual([]);
  });

  it("maps ratings and weighted player strength", () => {
    expect(getRatingScore("S")).toBe(5);
    expect(getRatingScore("D")).toBe(1);
    expect(getRatingScore(0)).toBe(0);
    expect(getStatsAverage(guestStats)).toBe(2);

    const player = {
      ...mockPlayers[0],
      tier: "S" as const,
      stats: {
        stamina: "S" as const,
        speed: "S" as const,
        strength: "S" as const,
        passing: "S" as const,
        finishing: "S" as const,
        defense: "S" as const,
      },
    };

    expect(getPlayerStrength(player, { tierWeight: 70, statsWeight: 30 })).toBe(
      5,
    );
  });

  it("generates equal random teams without duplicate runtime players", () => {
    const result = generateRandomTeams(
      mockPlayers.slice(0, 4),
      "5v5",
      guestStats,
      () => 0.1,
    );
    const ids = [
      ...result.teamA.map(({ id }) => id),
      ...result.teamB.map(({ id }) => id),
    ];

    expect(result.teamA).toHaveLength(5);
    expect(result.teamB).toHaveLength(5);
    expect(result.unassigned).toEqual([]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("leaves excess real players unassigned", () => {
    const result = generateRandomTeams(
      mockPlayers.slice(0, 12),
      "5v5",
      guestStats,
      () => 0.5,
    );

    expect(result.teamA).toHaveLength(5);
    expect(result.teamB).toHaveLength(5);
    expect(result.unassigned).toHaveLength(2);
    expect(
      new Set([
        ...result.teamA.map(({ id }) => id),
        ...result.teamB.map(({ id }) => id),
        ...result.unassigned.map(({ id }) => id),
      ]).size,
    ).toBe(12);
  });

  it("generates balanced teams with a measurable balance percentage", () => {
    const result = generateBalancedTeams(
      mockPlayers.slice(0, 10),
      "5v5",
      guestStats,
      { tierWeight: 70, statsWeight: 30 },
    );

    expect(result.teamA).toHaveLength(5);
    expect(result.teamB).toHaveLength(5);
    expect(result.unassigned).toEqual([]);
    expect(
      new Set([
        ...result.teamA.map(({ id }) => id),
        ...result.teamB.map(({ id }) => id),
      ]).size,
    ).toBe(10);

    expect(getBalancePercentage(10, 8)).toBe(80);
  });

  it("leaves excess players unassigned after balancing", () => {
    const result = generateBalancedTeams(
      mockPlayers.slice(0, 12),
      "5v5",
      guestStats,
      { tierWeight: 70, statsWeight: 30 },
    );

    expect(result.unassigned).toHaveLength(2);
    expect(
      new Set([
        ...result.teamA.map(({ id }) => id),
        ...result.teamB.map(({ id }) => id),
        ...result.unassigned.map(({ id }) => id),
      ]).size,
    ).toBe(12);
  });
});
