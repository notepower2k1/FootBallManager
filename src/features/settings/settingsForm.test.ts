import { describe, expect, it } from "vitest";
import { DEFAULT_MOCK_SETTINGS } from "../../infrastructure/mock/mockSettingsRepository";
import {
  createSettingsFormValues,
  toSettings,
  validateSettingsForm,
} from "./settingsForm";

describe("settings form", () => {
  it("requires the two balance weights to total 100", () => {
    const values = createSettingsFormValues(DEFAULT_MOCK_SETTINGS);
    values.tierWeight = "60";
    values.statsWeight = "30";

    expect(validateSettingsForm(values)).toEqual({
      weights: "Tier weight and stats weight must total 100%.",
    });
  });

  it("maps valid form values back to settings", () => {
    const values = createSettingsFormValues(DEFAULT_MOCK_SETTINGS);
    values.teamAName = "Red team";
    values.tierWeight = "75";
    values.statsWeight = "25";

    expect(validateSettingsForm(values)).toEqual({});
    expect(toSettings(values)).toMatchObject({
      teamAName: "Red team",
      tierWeight: 75,
      statsWeight: 25,
    });
  });
});
