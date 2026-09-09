import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { mockPlayers } from "../../infrastructure/mock/mockPlayers";
import { FormationGroup } from "./FormationGroup";

describe("FormationGroup", () => {
  it("renders unassigned players in a compact editable list", () => {
    const markup = renderToStaticMarkup(
      <FormationGroup
        group="unassigned"
        title="Unassigned"
        players={mockPlayers.slice(0, 2)}
        isEditing
        selectedPlayerId={null}
        draggedPlayerId={null}
        dropTarget={null}
        onSelectPlayer={() => undefined}
        onDragStart={() => undefined}
        onDragEnd={() => undefined}
        onDragOver={() => undefined}
        onDrop={() => undefined}
        onMovePlayer={() => undefined}
      />,
    );

    expect(markup).toContain("formation-player-list--compact");
    expect(markup).toContain('data-formation-unassigned="true"');
    expect(markup).not.toContain("data-slot");
    expect(markup).toContain('draggable="true"');
  });
});
