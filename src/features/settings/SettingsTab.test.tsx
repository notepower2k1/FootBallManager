import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DEFAULT_MOCK_SETTINGS, MockSettingsRepository } from "../../infrastructure/mock/mockSettingsRepository";
import { SettingsTab } from "./SettingsTab";

describe("SettingsTab", () => {
  it("renders the editable mock settings", () => {
    const markup = renderToStaticMarkup(
      <SettingsTab
        settings={DEFAULT_MOCK_SETTINGS}
        isLoading={false}
        error={null}
        settingsRepository={new MockSettingsRepository()}
        onSettingsChanged={() => undefined}
      />,
    );

    expect(markup).toContain("Settings");
    expect(markup).toContain("Team A name");
    expect(markup).toContain("Team B color");
    expect(markup).toContain("Guest player defaults");
    expect(markup).toContain("Tier balance weight");
    expect(markup).toContain("Save settings");
    expect(markup).toContain('value="70"');
    expect(markup).toContain('value="11v11"');
  });

  it("renders the full-width settings panel and form containers", () => {
    const markup = renderToStaticMarkup(
      <SettingsTab
        settings={DEFAULT_MOCK_SETTINGS}
        isLoading={false}
        error={null}
        settingsRepository={new MockSettingsRepository()}
        onSettingsChanged={() => undefined}
      />,
    );

    expect(markup).toContain('class="tab-panel settings-panel"');
    expect(markup).toContain('class="settings-form"');
  });
});
