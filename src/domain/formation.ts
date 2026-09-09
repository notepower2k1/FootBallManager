export type FormationMode = "5v5" | "7v7" | "11v11";
export type FormationTeam = "A" | "B";
export type TeamId = FormationTeam;

export interface PitchCoordinates {
  x: number;
  y: number;
}

export interface FormationPlacement extends PitchCoordinates {
  playerId: string;
  team: FormationTeam;
}

export interface MovementArrow extends PitchCoordinates {
  id: string;
  playerId: string;
}

export interface Formation {
  mode: FormationMode;
  placements: FormationPlacement[];
  unassigned: string[];
  arrows?: MovementArrow[];
  version: number;
}
