import type { Formation, FormationMode } from "../../domain/formation";
import type { FormationRepository } from "../../repositories/formationRepository";

const copyFormation = (formation: Formation): Formation => ({
  ...formation,
  placements: formation.placements.map((placement) => ({ ...placement })),
  unassigned: [...formation.unassigned],
  ...(formation.arrows
    ? { arrows: formation.arrows.map((arrow) => ({ ...arrow })) }
    : {}),
});

export class MockFormationRepository implements FormationRepository {
  private formations: Map<FormationMode, Formation>;

  constructor(initialFormations: readonly Formation[] = []) {
    this.formations = new Map(
      initialFormations.map((formation) => [formation.mode, copyFormation(formation)]),
    );
  }

  async getFormation(mode: FormationMode): Promise<Formation | null> {
    const formation = this.formations.get(mode);
    return formation ? copyFormation(formation) : null;
  }

  async saveFormation(formation: Formation): Promise<Formation> {
    const saved = copyFormation(formation);
    this.formations.set(saved.mode, saved);
    return copyFormation(saved);
  }
}
