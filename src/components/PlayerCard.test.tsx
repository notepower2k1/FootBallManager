import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { mockPlayers } from "../infrastructure/mock/mockPlayers";
import { PlayerCard } from "./PlayerCard";

describe("PlayerCard", () => {
  it("renders the selected player's card data", () => {
    const markup = renderToStaticMarkup(<PlayerCard player={mockPlayers[0]} />);

    expect(markup).toContain('data-tier="S"');
    expect(markup).toContain("#1");
    expect(markup).toContain("Nguyen Minh Anh");
    expect(markup).toContain("STA");
    expect(markup).toContain("SPD");
    expect(markup).toContain("STR");
    expect(markup).toContain("PAS");
    expect(markup).toContain("FIN");
    expect(markup).toContain("DEF");
    expect(markup).toContain("<dt>STA</dt><dd>A</dd>");
    expect(markup).toContain("<dt>SPD</dt><dd>S</dd>");
    expect(markup).toContain("<dt>STR</dt><dd>A</dd>");
    expect(markup).toContain("<dt>PAS</dt><dd>S</dd>");
    expect(markup).toContain("<dt>FIN</dt><dd>A</dd>");
    expect(markup).toContain("<dt>DEF</dt><dd>B</dd>");
    expect(markup).toContain("player-card__portrait-image--default");
    expect(markup).toContain("default.jpg");
    expect(markup).not.toContain("player-card__portrait-placeholder");
  });

  it("reflects the selected player's tier", () => {
    const player = { ...mockPlayers[0], tier: "A" as const };
    const markup = renderToStaticMarkup(<PlayerCard player={player} />);

    expect(markup).toContain('data-tier="A"');
    expect(markup).toContain("<strong>A</strong>");
  });

  it("uses a valid avatar source and keeps long names contained", () => {
    const player = {
      ...mockPlayers[0],
      name: "A Player With An Exceptionally Long Display Name",
      avatarFileId: "/avatars/player-1.png",
    };
    const markup = renderToStaticMarkup(<PlayerCard player={player} />);

    expect(markup).toContain('src="/avatars/player-1.png"');
    expect(markup).toContain(`title="${player.name}"`);
  });

  it("renders a compact empty state without a fake card", () => {
    const markup = renderToStaticMarkup(<PlayerCard player={null} />);

    expect(markup).toContain("Select a player");
    expect(markup).toContain("Click a player on the pitch to view their card.");
    expect(markup).not.toContain('class="player-card"');
  });

  it("marks runtime guest players without treating them as roster players", () => {
    const guest = {
      id: "guest-1",
      name: "Ngoại binh 1",
      isGuest: true as const,
      tier: 0 as const,
      stats: mockPlayers[0].stats,
    };
    const markup = renderToStaticMarkup(<PlayerCard player={guest} />);

    expect(markup).toContain('data-tier="0"');
    expect(markup).toContain("Guest player");
  });
});
