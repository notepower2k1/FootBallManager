export type FormationMode = "5v5" | "7v7";
export type TeamId = "A" | "B";

export interface FormationSlot {
  team: TeamId;
  slot: number;
  playerId?: string;
  guestNumber?: number;
}

export interface Formation {
  mode: FormationMode;
  teamA: FormationSlot[];
  teamB: FormationSlot[];
  version: number;
}
