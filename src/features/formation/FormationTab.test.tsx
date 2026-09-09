import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MockFormationRepository } from "../../infrastructure/mock/mockFormationRepository";
import { DEFAULT_MOCK_SETTINGS } from "../../infrastructure/mock/mockSettingsRepository";
import { mockPlayers } from "../../infrastructure/mock/mockPlayers";
import { FormationTab } from "./FormationTab";

describe("FormationTab", () => {
  it("keeps movement arrow handles above the player layer", () => {
    const markup = renderToStaticMarkup(
      <FormationTab
        players={mockPlayers.slice(0, 2)}
        isLoading={false}
        error={null}
        formationRepository={new MockFormationRepository()}
      />,
    );

    expect(markup).toContain('class="formation-pitch__movement-arrows"');
    expect(markup).toContain('style="z-index:4"');
  });

  it("renders both teams, unassigned players, details, and mock controls", () => {
    const markup = renderToStaticMarkup(
      <FormationTab
        players={mockPlayers.slice(0, 12)}
        isLoading={false}
        error={null}
        formationRepository={new MockFormationRepository()}
        settings={{
          ...DEFAULT_MOCK_SETTINGS,
          teamAName: "Red team",
          teamAColor: "#ff0000",
        }}
      />,
    );

    expect(markup).toContain("Formation view");
    expect(markup).toContain("5v5");
    expect(markup).toContain("7v7");
    expect(markup).toContain("11v11");
    expect(markup).toContain("Red team");
    expect(markup).toContain("Team B");
    expect(markup).toContain("formation-pitch");
    expect(markup).toContain("formation-pitch__player");
    expect(markup).toContain('data-x="');
    expect(markup).toContain('data-y="');
    expect(markup).not.toContain("data-slot");
    expect(markup).not.toContain("formation-pitch__slot");
    expect(markup).toContain("formation-pitch__penalty-area");
    expect(markup).toContain("formation-pitch__goal");
    expect(markup).toContain("formation-player-node__marker");
    expect(markup).toContain("formation-player-node__number");
    expect(markup).toContain("formation-player-node__name");
    expect(markup).toContain("formation-team-a");
    expect(markup).toContain("formation-team-b");
    expect(markup).toContain('data-formation-team-drop="A"');
    expect(markup).toContain('data-formation-team-drop="B"');
    expect(markup).toContain("Unassigned");
    expect(markup).toContain("player-card");
    expect(markup).toContain('data-tier="S"');
    expect(markup).toContain("player-card__portrait");
    expect(markup).toContain("player-card__name");
    expect(markup).toContain("STA");
    expect(markup).toContain("SPD");
    expect(markup).toContain("STR");
    expect(markup).toContain("PAS");
    expect(markup).toContain("FIN");
    expect(markup).toContain("DEF");
    expect(markup).toContain("Movement arrows");
    expect(markup).toContain("Add movement arrow");
    expect(markup).toContain("formation-movement-arrows");
    expect(markup).toContain("Random");
    expect(markup).toContain("Balance");
    expect(markup).toContain("Reset");
    expect(markup).toContain("Save");
  });

  it("paginates a large unassigned group for 11v11", () => {
    const players = Array.from({ length: 50 }, (_, index) => ({
      ...mockPlayers[index % mockPlayers.length],
      id: `formation-player-${index + 1}`,
      name: `Formation player ${index + 1}`,
    }));
    const markup = renderToStaticMarkup(
      <FormationTab
        players={players}
        isLoading={false}
        error={null}
        formationRepository={new MockFormationRepository()}
        settings={{ ...DEFAULT_MOCK_SETTINGS, defaultFormationMode: "11v11" }}
      />,
    );

    expect(markup).toContain("Page 1 of 4");
  });

  it("renders an empty state when the roster has no players", () => {
    const markup = renderToStaticMarkup(
      <FormationTab
        players={[]}
        isLoading={false}
        error={null}
        formationRepository={new MockFormationRepository()}
      />,
    );

    expect(markup).toContain("No players are available yet.");
  });
});
