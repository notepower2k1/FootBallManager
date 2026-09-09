import { describe, expect, it } from "vitest";
import {
  addMovementArrow,
  changeFormationMode,
  clearMovementArrows,
  createFormationState,
  createFormationStateFromTeams,
  getAvailableTeam,
  getTeamCapacity,
  movePlayer,
  removeMovementArrow,
  reconcileFormationState,
  updateMovementArrow,
} from "./formationState";

const playerIds = (count: number) =>
  Array.from({ length: count }, (_, index) => `player-${index + 1}`);

const state = () => createFormationState(playerIds(12), "5v5");

const placementFor = (
  formation: ReturnType<typeof state>,
  playerId: string,
) => formation.placements.find((placement) => placement.playerId === playerId);

describe("formation state", () => {
  it("uses distributed default coordinates for 5v5", () => {
    const formation = createFormationState(playerIds(10), "5v5");

    expect(formation.placements.map(({ x, y }) => [x, y])).toEqual([
      [50, 15],
      [30, 30],
      [70, 30],
      [35, 45],
      [65, 45],
      [50, 85],
      [30, 70],
      [70, 70],
      [35, 55],
      [65, 55],
    ]);
  });

  it("uses distributed default coordinates for 7v7", () => {
    const formation = createFormationState(playerIds(14), "7v7");

    expect(formation.placements.map(({ x, y }) => [x, y])).toEqual([
      [50, 10],
      [32, 22],
      [68, 22],
      [20, 35],
      [50, 35],
      [80, 35],
      [50, 46],
      [50, 90],
      [32, 78],
      [68, 78],
      [20, 65],
      [50, 65],
      [80, 65],
      [50, 54],
    ]);
  });

  it("supports 11v11 with eleven players per team", () => {
    const formation = createFormationState(playerIds(22), "11v11");

    expect(getTeamCapacity("11v11")).toBe(11);
    expect(formation.placements.filter(({ team }) => team === "A")).toHaveLength(
      11,
    );
    expect(formation.placements.filter(({ team }) => team === "B")).toHaveLength(
      11,
    );
    expect(new Set(formation.placements.map(({ x, y }) => `${x}:${y}`)).size).toBe(
      22,
    );
  });

  it("uses saved coordinates instead of the default layout", () => {
    const formation = createFormationState(playerIds(10), "5v5", {
      placements: [
        { playerId: "player-1", team: "A", x: 42.5, y: 18.2 },
      ],
      unassigned: [],
    });

    expect(placementFor(formation, "player-1")).toEqual({
      playerId: "player-1",
      team: "A",
      x: 42.5,
      y: 18.2,
    });
  });

  it("loads and normalizes saved movement arrows", () => {
    const formation = createFormationState(playerIds(10), "5v5", {
      placements: [
        { playerId: "player-1", team: "A", x: 42.5, y: 18.2 },
      ],
      unassigned: [],
      arrows: [
        { id: "arrow-1", playerId: "player-1", x: 130, y: -10 },
      ],
    });

    expect(formation.arrows).toEqual([
      { id: "arrow-1", playerId: "player-1", x: 100, y: 0 },
    ]);
  });

  it("assigns players to teams with normalized coordinate placements", () => {
    const formation = state();

    expect(formation.placements.map(({ playerId }) => playerId)).toEqual(
      playerIds(10),
    );
    expect(formation.placements.filter(({ team }) => team === "A")).toHaveLength(
      5,
    );
    expect(formation.placements.filter(({ team }) => team === "B")).toHaveLength(
      5,
    );
    expect(formation.unassigned).toEqual(["player-11", "player-12"]);
    expect(
      formation.placements.every(
        ({ x, y }) => x >= 0 && x <= 100 && y >= 0 && y <= 100,
      ),
    ).toBe(true);
  });

  it("creates a formation from generated team membership", () => {
    const formation = createFormationStateFromTeams(
      "5v5",
      ["player-1", "player-2"],
      ["player-3"],
      ["player-4"],
    );

    expect(
      formation.placements.map(({ playerId, team }) => [playerId, team]),
    ).toEqual([
      ["player-1", "A"],
      ["player-2", "A"],
      ["player-3", "B"],
    ]);
    expect(formation.unassigned).toEqual(["player-4"]);
  });

  it("moves a placed player to an exact normalized coordinate", () => {
    const formation = movePlayer(state(), "player-1", "A", {
      x: 42.5,
      y: 18.2,
    });

    expect(placementFor(formation, "player-1")).toEqual({
      playerId: "player-1",
      team: "A",
      x: 42.5,
      y: 18.2,
    });
  });

  it("adds, changes, and removes a player's movement arrow", () => {
    const withArrow = addMovementArrow(state(), {
      id: "arrow-1",
      playerId: "player-1",
      x: 80,
      y: 25,
    });
    const rotated = updateMovementArrow(withArrow, "arrow-1", {
      x: 30,
      y: 60,
    });

    expect(rotated.arrows).toEqual([
      { id: "arrow-1", playerId: "player-1", x: 30, y: 60 },
    ]);
    expect(removeMovementArrow(rotated, "arrow-1").arrows).toEqual([]);
    expect(clearMovementArrows(rotated, "player-1").arrows).toEqual([]);
  });

  it("clamps coordinates to the pitch bounds", () => {
    const formation = movePlayer(state(), "player-1", "A", {
      x: -20,
      y: 140,
    });

    expect(placementFor(formation, "player-1")).toMatchObject({
      x: 0,
      y: 100,
    });
  });

  it("moves an unassigned player to Team A at the drop coordinate", () => {
    const cleared = movePlayer(state(), "player-1", "unassigned");
    const formation = movePlayer(cleared, "player-11", "A", {
      x: 24,
      y: 38,
    });

    expect(placementFor(formation, "player-11")).toEqual({
      playerId: "player-11",
      team: "A",
      x: 24,
      y: 38,
    });
    expect(formation.unassigned).toEqual(["player-12", "player-1"]);
  });

  it("moves an unassigned player to Team B at the drop coordinate", () => {
    const base = createFormationState(playerIds(6), "5v5");
    const formation = movePlayer(base, "player-6", "B", {
      x: 76,
      y: 62,
    });

    expect(placementFor(formation, "player-6")).toEqual({
      playerId: "player-6",
      team: "B",
      x: 76,
      y: 62,
    });
    expect(formation.unassigned).toEqual([]);
  });

  it("changes a placed player from Team A to Team B without moving it", () => {
    const base = createFormationState(playerIds(9), "5v5");
    const formation = movePlayer(base, "player-1", "B");
    const original = placementFor(base, "player-1");

    expect(placementFor(formation, "player-1")).toEqual({
      ...original,
      team: "B",
    });
  });

  it("changes a placed player from Team B to Team A without moving it", () => {
    const cleared = movePlayer(
      createFormationState(playerIds(6), "5v5"),
      "player-1",
      "unassigned",
    );
    const base = placementFor(cleared, "player-6");
    const formation = movePlayer(cleared, "player-6", "A");

    expect(placementFor(formation, "player-6")).toEqual({
      ...base,
      team: "A",
    });
  });

  it("removes a placed player when moving it to Unassigned", () => {
    const formation = movePlayer(
      addMovementArrow(state(), {
        id: "arrow-1",
        playerId: "player-1",
        x: 80,
        y: 25,
      }),
      "player-1",
      "unassigned",
    );

    expect(placementFor(formation, "player-1")).toBeUndefined();
    expect(formation.unassigned).toContain("player-1");
    expect(formation.arrows).toEqual([]);
  });

  it("preserves coordinates when changing from 5v5 to 7v7", () => {
    const moved = movePlayer(state(), "player-1", "A", {
      x: 42.5,
      y: 18.2,
    });
    const formation = changeFormationMode(moved, "7v7");

    expect(formation.mode).toBe("7v7");
    expect(placementFor(formation, "player-1")).toEqual({
      playerId: "player-1",
      team: "A",
      x: 42.5,
      y: 18.2,
    });
    expect(formation.placements.filter(({ team }) => team === "A")).toHaveLength(
      7,
    );
    expect(formation.placements.filter(({ team }) => team === "B")).toHaveLength(
      5,
    );
  });

  it("preserves placements when player records refresh without a roster change", () => {
    const moved = movePlayer(state(), "player-1", "A", {
      x: 42.5,
      y: 18.2,
    });

    expect(reconcileFormationState(moved, playerIds(12))).toBe(moved);
  });

  it("finds an available team without using pitch position", () => {
    const cleared = movePlayer(state(), "player-1", "unassigned");

    expect(getAvailableTeam(cleared)).toBe("A");
    expect(getAvailableTeam(state())).toBeNull();
  });

  it("keeps every player in exactly one location", () => {
    const formation = movePlayer(
      movePlayer(state(), "player-1", "unassigned"),
      "player-1",
      "B",
      { x: 50, y: 50 },
    );
    const allPlayers = [
      ...formation.placements.map(({ playerId }) => playerId),
      ...formation.unassigned,
    ];

    expect(allPlayers).toHaveLength(12);
    expect(new Set(allPlayers).size).toBe(12);
  });
});
