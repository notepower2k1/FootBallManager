import type { Formation, FormationMode } from "../domain/formation";

export interface FormationRepository {
  getFormation(mode: FormationMode): Promise<Formation | null>;
  saveFormation(formation: Formation): Promise<Formation>;
}
