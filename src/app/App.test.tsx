import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MockFormationRepository } from "../infrastructure/mock/mockFormationRepository";
import { MockSettingsRepository } from "../infrastructure/mock/mockSettingsRepository";
import { MockEditLockRepository } from "../infrastructure/mock/mockEditLockRepository";
import { App } from "./App";
import { MockPlayerRepository } from "../infrastructure/mock/mockPlayerRepository";

describe("App", () => {
  it("renders the main navigation and initial formation view", () => {
    const markup = renderToStaticMarkup(
      <App
        playerRepository={new MockPlayerRepository()}
        formationRepository={new MockFormationRepository()}
        settingsRepository={new MockSettingsRepository()}
        editLockRepository={new MockEditLockRepository()}
      />,
    );

    expect(markup).toContain("Formation");
    expect(markup).toContain("Players");
    expect(markup).toContain("Settings");
    expect(markup).toContain("Formation view");
  });
});
