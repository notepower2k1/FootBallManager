import { describe, expect, it } from "vitest";
import type { Settings } from "../../domain/settings";
import type { SettingsRepository } from "../../repositories/settingsRepository";
import { MockSettingsRepository } from "./mockSettingsRepository";

const settings: Settings = {
  defaultFormationMode: "7v7",
  teamAName: "Red",
  teamAColor: "#d84b58",
  teamBName: "Blue",
  teamBColor: "#3978d2",
  guestDefaultStats: {
    stamina: "C",
    speed: "C",
    strength: "C",
    passing: "C",
    finishing: "C",
    defense: "C",
  },
  tierWeight: 70,
  statsWeight: 30,
};

describe("MockSettingsRepository", () => {
  it("loads and updates settings through the repository contract", async () => {
    const repository: SettingsRepository = new MockSettingsRepository(settings);

    await expect(repository.getSettings()).resolves.toEqual(settings);
    await expect(
      repository.updateSettings({ ...settings, defaultFormationMode: "5v5" }),
    ).resolves.toMatchObject({ defaultFormationMode: "5v5" });
  });

  it("returns independent nested setting copies", async () => {
    const repository = new MockSettingsRepository(settings);
    const loaded = await repository.getSettings();

    loaded.guestDefaultStats.speed = "S";

    await expect(repository.getSettings()).resolves.toEqual(settings);
  });
});
