import { useState } from "react";
import type { GuestPlayer, Player } from "../domain/player";

const defaultAvatarSource = new URL("../../assets/default.jpg", import.meta.url).href;

const statFields = [
  ["stamina", "STA"],
  ["speed", "SPD"],
  ["strength", "STR"],
  ["passing", "PAS"],
  ["finishing", "FIN"],
  ["defense", "DEF"],
] as const;

interface PlayerCardProps {
  player: Player | GuestPlayer | null;
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <aside className="player-card-area" aria-labelledby="selected-player-heading">
      <p className="player-card-area__label" id="selected-player-heading">
        Selected player
      </p>
      {!player && (
        <div className="player-card__empty">
          <strong>Select a player</strong>
          <span>Click a player on the pitch to view their card.</span>
        </div>
      )}
      {player && <SelectedPlayerCard player={player} />}
    </aside>
  );
}

function SelectedPlayerCard({ player }: { player: Player | GuestPlayer }) {
  const displayNumber = getDisplayNumber(player.id);
  const isGuest = "isGuest" in player;

  return (
    <article className="player-card" data-tier={player.tier}>
      <div className="player-card__content">
        <header className="player-card__header">
          <div className="player-card__tier">
            <strong>{player.tier}</strong>
            <span>Tier</span>
          </div>
          <span className="player-card__number">#{displayNumber}</span>
        </header>

        <PlayerPortrait player={player} />

        <h3 className="player-card__name" title={player.name}>
          {player.name}
        </h3>
        {isGuest && <span className="player-card__guest">Guest player</span>}

        <dl className="player-card__stats">
          {statFields.map(([key, label]) => (
            <div className="player-card__stat" key={key}>
              <dt>{label}</dt>
              <dd>{player.stats[key]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

function PlayerPortrait({ player }: { player: Player | GuestPlayer }) {
  const avatarSource = getAvatarSource(
    "avatarFileId" in player ? player.avatarFileId : undefined,
  );
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const imageSource =
    avatarSource && avatarSource !== failedSource
      ? avatarSource
      : defaultAvatarSource;
  const usingDefaultAvatar = imageSource === defaultAvatarSource;
  const showImage = imageSource !== failedSource;

  return (
    <div className="player-card__portrait" aria-label={`${player.name} portrait`}>
      {showImage ? (
        <img
          className={`player-card__portrait-image${usingDefaultAvatar ? " player-card__portrait-image--default" : ""}`}
          src={imageSource}
          alt={usingDefaultAvatar ? "Default player avatar" : ""}
          onError={() => setFailedSource(imageSource)}
        />
      ) : (
        <span className="player-card__portrait-placeholder" aria-hidden="true">
          {getInitials(player.name)}
        </span>
      )}
    </div>
  );
}

function getAvatarSource(avatarFileId?: string): string | null {
  if (!avatarFileId) {
    return null;
  }

  return /^(https?:\/\/|data:image\/|blob:|\/)/.test(avatarFileId)
    ? avatarFileId
    : null;
}

function getDisplayNumber(playerId: string): string {
  const idNumber = playerId.match(/(\d+)$/)?.[1];
  return idNumber ? String(Number(idNumber)) : "—";
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  return initials || "?";
}
