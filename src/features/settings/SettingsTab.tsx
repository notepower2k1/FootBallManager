import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { getUserErrorMessage } from "../../domain/errors";
import type { PlayerStats, Rating } from "../../domain/player";
import type { FormationMode } from "../../domain/formation";
import type { Settings } from "../../domain/settings";
import type { SettingsRepository } from "../../repositories/settingsRepository";
import { RATING_OPTIONS, STAT_FIELDS } from "../players/services/playerManagement";
import {
  createSettingsFormValues,
  toSettings,
  updateGuestRating,
  validateSettingsForm,
  type SettingsFormErrors,
  type SettingsFormValues,
} from "./settingsForm";

export interface SettingsTabProps {
  settings: Settings;
  isLoading: boolean;
  error: string | null;
  settingsRepository: SettingsRepository;
  onSettingsChanged: (settings: Settings) => void;
}

export function SettingsTab({
  settings,
  isLoading,
  error,
  settingsRepository,
  onSettingsChanged,
}: SettingsTabProps) {
  const [values, setValues] = useState<SettingsFormValues>(() =>
    createSettingsFormValues(settings),
  );
  const [errors, setErrors] = useState<SettingsFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setValues(createSettingsFormValues(settings));
  }, [settings]);

  const updateValue = <K extends keyof SettingsFormValues>(
    key: K,
    value: SettingsFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleGuestRatingChange = (
    event: ChangeEvent<HTMLSelectElement>,
    key: keyof PlayerStats,
  ) => {
    setValues((current) =>
      updateGuestRating(current, key, event.target.value as Rating),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateSettingsForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    setActionError(null);
    setStatus("");

    try {
      const saved = await settingsRepository.updateSettings(toSettings(values));
      onSettingsChanged(saved);
      setStatus("Settings saved in this mock session.");
    } catch (saveError) {
      setActionError(getUserErrorMessage(saveError, "Settings could not be saved."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="tab-panel settings-panel" aria-labelledby="settings-heading">
      <header className="panel-header">
        <div>
          <p className="panel-kicker">Application setup</p>
          <h2 id="settings-heading">Settings</h2>
          <p className="panel-description">
            Configure the mock formation defaults and balance rules.
          </p>
        </div>
      </header>

      {isLoading && <p role="status">Loading settings...</p>}
      {error && <p role="alert">{error}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {status && <p className="settings-status" role="status">{status}</p>}

      <form className="settings-form" onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend>Formation defaults</legend>
          <label htmlFor="settings-mode">
            Default formation mode
            <select
              id="settings-mode"
              value={values.defaultFormationMode}
              disabled={isSaving}
              onChange={(event) =>
                updateValue("defaultFormationMode", event.target.value as FormationMode)
              }
            >
              <option value="5v5">5v5</option>
              <option value="7v7">7v7</option>
              <option value="11v11">11v11</option>
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>Teams</legend>
          <div className="settings-grid settings-grid--teams">
            <label htmlFor="team-a-name">
              Team A name
              <input
                id="team-a-name"
                value={values.teamAName}
                disabled={isSaving}
                onChange={(event) => updateValue("teamAName", event.target.value)}
              />
              {errors.teamAName && <small className="form-error">{errors.teamAName}</small>}
            </label>
            <label htmlFor="team-a-color">
              Team A color
              <input
                id="team-a-color"
                type="color"
                value={values.teamAColor}
                disabled={isSaving}
                onChange={(event) => updateValue("teamAColor", event.target.value)}
              />
            </label>
            <label htmlFor="team-b-name">
              Team B name
              <input
                id="team-b-name"
                value={values.teamBName}
                disabled={isSaving}
                onChange={(event) => updateValue("teamBName", event.target.value)}
              />
              {errors.teamBName && <small className="form-error">{errors.teamBName}</small>}
            </label>
            <label htmlFor="team-b-color">
              Team B color
              <input
                id="team-b-color"
                type="color"
                value={values.teamBColor}
                disabled={isSaving}
                onChange={(event) => updateValue("teamBColor", event.target.value)}
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Guest player defaults</legend>
          <div className="settings-grid settings-grid--stats">
            {STAT_FIELDS.map(({ key, label }) => (
              <label key={key} htmlFor={`guest-${key}`}>
                {label}
                <select
                  id={`guest-${key}`}
                  value={values.guestDefaultStats[key]}
                  disabled={isSaving}
                  onChange={(event) => handleGuestRatingChange(event, key)}
                >
                  {RATING_OPTIONS.map((rating) => (
                    <option value={rating} key={rating}>
                      {rating}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Balance weights</legend>
          <div className="settings-grid settings-grid--weights">
            <label htmlFor="tier-weight">
              Tier balance weight
              <input
                id="tier-weight"
                type="number"
                min="0"
                max="100"
                step="1"
                value={values.tierWeight}
                disabled={isSaving}
                onChange={(event) => updateValue("tierWeight", event.target.value)}
              />
            </label>
            <label htmlFor="stats-weight">
              Stats balance weight
              <input
                id="stats-weight"
                type="number"
                min="0"
                max="100"
                step="1"
                value={values.statsWeight}
                disabled={isSaving}
                onChange={(event) => updateValue("statsWeight", event.target.value)}
              />
            </label>
          </div>
          {errors.weights && <p className="form-error">{errors.weights}</p>}
        </fieldset>

        <div className="settings-form__actions">
          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </form>
    </section>
  );
}
