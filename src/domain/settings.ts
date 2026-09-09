import type { FormationMode } from "./formation";
import type { PlayerStats } from "./player";

export interface Settings {
  defaultFormationMode: FormationMode;
  teamAName: string;
  teamAColor: string;
  teamBName: string;
  teamBColor: string;
  guestDefaultStats: PlayerStats;
  tierWeight: number;
  statsWeight: number;
}
