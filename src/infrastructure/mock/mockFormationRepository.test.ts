import { describe, expect, it } from "vitest";
import type { Formation } from "../../domain/formation";
import type { FormationRepository } from "../../repositories/formationRepository";
import { MockFormationRepository } from "./mockFormationRepository";

const savedFormation: Formation = {
  mode: "5v5",
  placements: [{ playerId: "player-1", team: "A", x: 42.5, y: 18.2 }],
  unassigned: ["player-2"],
  arrows: [{ id: "arrow-1", playerId: "player-1", x: 70, y: 20 }],
  version: 3,
};

describe("MockFormationRepository", () => {
  it("loads saved formations through the repository contract", async () => {
    const repository: FormationRepository = new MockFormationRepository([
      savedFormation,
    ]);

    await expect(repository.getFormation("5v5")).resolves.toEqual(savedFormation);
    await expect(repository.getFormation("7v7")).resolves.toBeNull();
  });

  it("returns copies and stores saved formation changes", async () => {
    const repository = new MockFormationRepository([savedFormation]);
    const loaded = await repository.getFormation("5v5");

    loaded!.placements[0].x = 90;
    await expect(repository.getFormation("5v5")).resolves.toEqual(savedFormation);

    await repository.saveFormation({
      ...savedFormation,
      placements: [{ ...savedFormation.placements[0], x: 60 }],
      version: 4,
    });
    await expect(repository.getFormation("5v5")).resolves.toMatchObject({
      placements: [{ playerId: "player-1", x: 60 }],
      arrows: [{ id: "arrow-1", x: 70, y: 20 }],
      version: 4,
    });
  });
});
