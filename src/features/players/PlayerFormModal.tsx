import { useState, type ChangeEvent, type FormEvent } from "react";
import type { Player, Tier } from "../../domain/player";
import {
  AVATAR_OPTIONS,
  createPlayerFormValues,
  RATING_OPTIONS,
  STAT_FIELDS,
  type PlayerFormValues,
  type StatKey,
  validatePlayerForm,
} from "./services/playerManagement";

interface PlayerFormModalProps {
  mode: "add" | "edit";
  player: Player | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: PlayerFormValues) => Promise<void>;
}

export function PlayerFormModal({
  mode,
  player,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: PlayerFormModalProps) {
  const [values, setValues] = useState<PlayerFormValues>(() =>
    createPlayerFormValues(player),
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const errors = hasSubmitted ? validatePlayerForm(values) : {};
  const heading = mode === "add" ? "Add player" : "Edit player";

  const handleTextChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const field = event.target.name as "name" | "avatarFileId" | "tier";
    setValues((current) => ({
      ...current,
      [field]: event.target.value as PlayerFormValues[typeof field],
    }));
  };

  const handleStatChange = (
    key: StatKey,
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    setValues((current) => ({
      ...current,
      stats: { ...current.stats, [key]: event.target.value as Tier },
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    if (Object.keys(validatePlayerForm(values)).length > 0) return;
    await onSubmit(values);
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="player-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-form-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="player-modal__header">
          <div>
            <p className="panel-kicker">Player management</p>
            <h3 id="player-form-heading">{heading}</h3>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Close
          </button>
        </header>

        <form className="player-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="player-name">Name</label>
          <input
            id="player-name"
            name="name"
            type="text"
            value={values.name}
            onChange={handleTextChange}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "player-name-error" : undefined}
            required
          />
          {errors.name && (
            <span className="form-error" id="player-name-error">
              {errors.name}
            </span>
          )}

          <label htmlFor="player-tier">Tier</label>
          <select
            id="player-tier"
            name="tier"
            value={values.tier}
            onChange={handleTextChange}
            aria-invalid={Boolean(errors.tier)}
            aria-describedby={errors.tier ? "player-tier-error" : undefined}
            required
          >
            <option value="">Select tier</option>
            {RATING_OPTIONS.map((rating) => (
              <option value={rating} key={rating}>
                Tier {rating}
              </option>
            ))}
          </select>
          {errors.tier && (
            <span className="form-error" id="player-tier-error">
              {errors.tier}
            </span>
          )}

          <label htmlFor="player-avatar">Avatar (optional)</label>
          <select
            id="player-avatar"
            name="avatarFileId"
            value={values.avatarFileId}
            onChange={handleTextChange}
          >
            {values.avatarFileId &&
              !AVATAR_OPTIONS.some(
                ({ value }) => value === values.avatarFileId,
              ) && (
                <option value={values.avatarFileId}>Current avatar</option>
              )}
            {AVATAR_OPTIONS.map(({ value, label }) => (
              <option value={value} key={value || "none"}>
                {label}
              </option>
            ))}
          </select>

          <fieldset className="player-form__stats">
            <legend>Ratings</legend>
            {STAT_FIELDS.map(({ key, label }) => {
              const errorId = `player-${key}-error`;
              return (
                <div className="player-form__field" key={key}>
                  <label htmlFor={`player-${key}`}>{label}</label>
                  <select
                    id={`player-${key}`}
                    value={values.stats[key]}
                    onChange={(event) => handleStatChange(key, event)}
                    aria-invalid={Boolean(errors[key])}
                    aria-describedby={errors[key] ? errorId : undefined}
                    required
                  >
                    <option value="">Select rating</option>
                    {RATING_OPTIONS.map((rating) => (
                      <option value={rating} key={rating}>
                        {rating}
                      </option>
                    ))}
                  </select>
                  {errors[key] && (
                    <span className="form-error" id={errorId}>
                      {errors[key]}
                    </span>
                  )}
                </div>
              );
            })}
          </fieldset>

          {error && <p className="form-error" role="alert">{error}</p>}
          <footer className="player-form__actions">
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "add" ? "Add player" : "Save changes"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
