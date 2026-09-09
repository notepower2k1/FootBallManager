import type { ReactNode } from "react";
import type { Player } from "../domain/player";
import { PlayerCard } from "./PlayerCard";

interface PlayerDetailProps {
  player: Player | null;
  actions?: ReactNode;
}

export function PlayerDetail({ player, actions }: PlayerDetailProps) {
  return (
    <div className="players-selected-detail">
      <PlayerCard player={player} />
      {actions && <div className="player-detail__actions">{actions}</div>}
    </div>
  );
}
