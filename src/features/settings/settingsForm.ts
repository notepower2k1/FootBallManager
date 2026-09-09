import type { FormationMode } from "../../domain/formation";
import type { PlayerStats, Rating } from "../../domain/player";
import type { Settings } from "../../domain/settings";

export interface SettingsFormValues {
  defaultFormationMode: FormationMode;
  teamAName: string;
  teamAColor: string;
  teamBName: string;
  teamBColor: string;
  guestDefaultStats: PlayerStats;
  tierWeight: string;
  statsWeight: string;
}

export interface SettingsFormErrors {
  defaultFormationMode?: string;
  teamAName?: string;
  teamBName?: string;
  weights?: string;
}

export function createSettingsFormValues(settings: Settings): SettingsFormValues {
  return {
    defaultFormationMode: settings.defaultFormationMode,
    teamAName: settings.teamAName,
    teamAColor: settings.teamAColor,
    teamBName: settings.teamBName,
    teamBColor: settings.teamBColor,
    guestDefaultStats: { ...settings.guestDefaultStats },
    tierWeight: String(settings.tierWeight),
    statsWeight: String(settings.statsWeight),
  };
}

export function validateSettingsForm(
  values: SettingsFormValues,
): SettingsFormErrors {
  const errors: SettingsFormErrors = {};
  if (!values.teamAName.trim()) errors.teamAName = "Team A name is required.";
  if (!values.teamBName.trim()) errors.teamBName = "Team B name is required.";

  const tierWeight = Number(values.tierWeight);
  const statsWeight = Number(values.statsWeight);
  if (
    !Number.isFinite(tierWeight) ||
    !Number.isFinite(statsWeight) ||
    tierWeight < 0 ||
    tierWeight > 100 ||
    statsWeight < 0 ||
    statsWeight > 100
  ) {
    errors.weights = "Balance weights must be between 0 and 100%.";
  } else if (tierWeight + statsWeight !== 100) {
    errors.weights = "Tier weight and stats weight must total 100%.";
  }

  return errors;
}

export function toSettings(values: SettingsFormValues): Settings {
  return {
    defaultFormationMode: values.defaultFormationMode,
    teamAName: values.teamAName.trim(),
    teamAColor: values.teamAColor,
    teamBName: values.teamBName.trim(),
    teamBColor: values.teamBColor,
    guestDefaultStats: { ...values.guestDefaultStats },
    tierWeight: Number(values.tierWeight),
    statsWeight: Number(values.statsWeight),
  };
}

export function updateGuestRating(
  values: SettingsFormValues,
  key: keyof PlayerStats,
  rating: Rating,
): SettingsFormValues {
  return {
    ...values,
    guestDefaultStats: {
      ...values.guestDefaultStats,
      [key]: rating,
    },
  };
}
