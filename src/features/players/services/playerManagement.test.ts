import { describe, expect, it } from "vitest";
import { mockPlayers } from "../../../infrastructure/mock/mockPlayers";
import {
  createPlayerFormValues,
  filterPlayers,
  toPlayerInput,
  validatePlayerForm,
} from "./playerManagement";

describe("player management", () => {
  it("requires a name, tier, and all six ratings", () => {
    const errors = validatePlayerForm(createPlayerFormValues(null));

    expect(errors).toEqual({
      name: "Name is required.",
      tier: "Tier is required.",
      stamina: "Stamina is required.",
      speed: "Speed is required.",
      strength: "Strength is required.",
      passing: "Passing is required.",
      finishing: "Finishing is required.",
      defense: "Defense is required.",
    });
  });

  it("maps a complete form and omits an empty optional avatar", () => {
    const values = createPlayerFormValues(mockPlayers[0]);
    values.name = "  Updated Player  ";
    values.avatarFileId = "";

    expect(validatePlayerForm(values)).toEqual({});
    expect(toPlayerInput(values)).toEqual({
      name: "Updated Player",
      tier: "S",
      stats: mockPlayers[0].stats,
    });
  });

  it("filters players by name and tier", () => {
    expect(filterPlayers(mockPlayers, "minh", "").map(({ id }) => id)).toEqual([
      "player-001",
      "player-008",
      "player-013",
    ]);
    expect(filterPlayers(mockPlayers, "", "D").map(({ id }) => id)).toEqual([
      "player-007",
      "player-012",
      "player-017",
    ]);
  });
});
