import { DEFAULT_SETTINGS, type Settings } from "../../domain/settings";
import type { SettingsRepository } from "../../repositories/settingsRepository";

export const DEFAULT_MOCK_SETTINGS: Settings = DEFAULT_SETTINGS;

const copySettings = (settings: Settings): Settings => ({
  ...settings,
  guestDefaultStats: { ...settings.guestDefaultStats },
});

export class MockSettingsRepository implements SettingsRepository {
  private settings: Settings;

  constructor(settings: Settings = DEFAULT_MOCK_SETTINGS) {
    this.settings = copySettings(settings);
  }

  async getSettings(): Promise<Settings> {
    return copySettings(this.settings);
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    this.settings = copySettings(settings);
    return copySettings(this.settings);
  }
}
