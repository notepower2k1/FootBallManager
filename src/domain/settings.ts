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

export const DEFAULT_SETTINGS: Settings = {
  defaultFormationMode: "5v5",
  teamAName: "Team A",
  teamAColor: "#d84b58",
  teamBName: "Team B",
  teamBColor: "#3978d2",
  guestDefaultStats: {
    stamina: "C",
    speed: "C",
    strength: "C",
    passing: "C",
    finishing: "C",
    defense: "C",
  },
  tierWeight: 70,
  statsWeight: 30,
};
