import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlayersTab } from "./PlayersTab";
import { mockPlayers } from "../../infrastructure/mock/mockPlayers";

describe("PlayersTab", () => {
  it("renders the loaded player list with tier labels", () => {
    const markup = renderToStaticMarkup(
      <PlayersTab players={[mockPlayers[0]]} isLoading={false} error={null} />,
    );

    expect(markup).toContain("Nguyen Minh Anh");
    expect(markup).toContain("Tier S");
  });
});
