import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlayersTab } from "./PlayersTab";
import { mockPlayers } from "../../infrastructure/mock/mockPlayers";
import { MockPlayerRepository } from "../../infrastructure/mock/mockPlayerRepository";

describe("PlayersTab", () => {
  it("renders the loaded player list with tier labels", () => {
    const markup = renderToStaticMarkup(
      <PlayersTab
        players={[mockPlayers[0]]}
        isLoading={false}
        error={null}
        playerRepository={new MockPlayerRepository([mockPlayers[0]])}
        onPlayersChanged={() => undefined}
      />,
    );

    expect(markup).toContain("Nguyen Minh Anh");
    expect(markup).toContain("Tier S");
  });

  it("renders player management controls and detail actions", () => {
    const markup = renderToStaticMarkup(
      <PlayersTab
        players={[mockPlayers[0]]}
        isLoading={false}
        error={null}
        playerRepository={new MockPlayerRepository([mockPlayers[0]])}
        onPlayersChanged={() => undefined}
      />,
    );

    expect(markup).toContain("Search players");
    expect(markup).toContain("Filter by tier");
    expect(markup).toContain("Add player");
    expect(markup).toContain("Edit player");
    expect(markup).toContain("Delete player");
    expect(markup).toContain('class="player-card"');
    expect(markup).toContain("STA");
    expect(markup).toContain("SPD");
  });

  it("renders scoped player info and detail action containers", () => {
    const markup = renderToStaticMarkup(
      <PlayersTab
        players={[mockPlayers[0]]}
        isLoading={false}
        error={null}
        playerRepository={new MockPlayerRepository([mockPlayers[0]])}
        onPlayersChanged={() => undefined}
      />,
    );

    expect(markup).toContain('class="player-info"');
    expect(markup).toContain('class="player-detail__actions"');
  });

  it("paginates the roster at twenty players per page", () => {
    const players = Array.from({ length: 50 }, (_, index) => ({
      ...mockPlayers[index % mockPlayers.length],
      id: `page-player-${index + 1}`,
      name: `Page player ${index + 1}`,
    }));
    const markup = renderToStaticMarkup(
      <PlayersTab
        players={players}
        isLoading={false}
        error={null}
        playerRepository={new MockPlayerRepository(players)}
        onPlayersChanged={() => undefined}
      />,
    );

    expect(markup).toContain("Page 1 of 3");
    expect(markup).toContain("Page player 20");
    expect(markup).not.toContain("Page player 21");
  });

  it("disables adding players when the maximum roster size is reached", () => {
    const players = Array.from({ length: 50 }, (_, index) => ({
      ...mockPlayers[index % mockPlayers.length],
      id: `max-player-${index + 1}`,
    }));
    const markup = renderToStaticMarkup(
      <PlayersTab
        players={players}
        isLoading={false}
        error={null}
        playerRepository={new MockPlayerRepository(players)}
        onPlayersChanged={() => undefined}
      />,
    );

    expect(markup).toContain('title="Maximum of 50 players reached"');
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Add player<\/button>/);
  });
});
