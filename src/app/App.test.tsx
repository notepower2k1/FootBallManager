import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { MockPlayerRepository } from "../infrastructure/mock/mockPlayerRepository";

describe("App", () => {
  it("renders the main navigation and initial formation view", () => {
    const markup = renderToStaticMarkup(
      <App playerRepository={new MockPlayerRepository()} />,
    );

    expect(markup).toContain("Formation");
    expect(markup).toContain("Players");
    expect(markup).toContain("Settings");
    expect(markup).toContain("Formation view");
  });
});
