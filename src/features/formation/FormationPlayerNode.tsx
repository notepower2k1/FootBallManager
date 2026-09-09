import type { CSSProperties, DragEvent, PointerEvent } from "react";
import type { FormationGroup as FormationGroupId } from "./services/formationState";
import type { RuntimePlayer } from "./services/teamGeneration";

interface FormationPlayerNodeProps {
  player: RuntimePlayer;
  group: FormationGroupId;
  fallbackNumber: number;
  teamColor?: string;
  isEditing: boolean;
  selectedPlayerId: string | null;
  onSelectPlayer: (playerId: string) => void;
  onDragStart: (event: DragEvent<HTMLElement>, playerId: string) => void;
  onDragEnd: () => void;
  onPointerDown?: (event: PointerEvent<HTMLButtonElement>, playerId: string) => void;
  onMovePlayer: (playerId: string, group: FormationGroupId) => void;
}

export function FormationPlayerNode({
  player,
  group,
  fallbackNumber,
  teamColor,
  isEditing,
  selectedPlayerId,
  onSelectPlayer,
  onDragStart,
  onDragEnd,
  onPointerDown,
  onMovePlayer,
}: FormationPlayerNodeProps) {
  const displayNumber = getDisplayNumber(player, fallbackNumber);
  const isGuest = "isGuest" in player;
  const nodeStyle = teamColor
    ? ({ "--team-color": teamColor } as CSSProperties)
    : undefined;

  return (
    <>
      <button
        className={`formation-player-node${isGuest ? " is-guest" : ""}`}
        type="button"
        draggable={isEditing && !onPointerDown}
        style={nodeStyle}
        aria-label={`${player.name}, player number ${displayNumber}${isGuest ? ", guest player" : ""}`}
        aria-pressed={selectedPlayerId === player.id}
        onClick={() => onSelectPlayer(player.id)}
        onPointerDown={(event) => onPointerDown?.(event, player.id)}
        onDragStart={(event) => onDragStart(event, player.id)}
        onDragEnd={onDragEnd}
      >
        <span className="formation-player-node__marker" aria-hidden="true">
          <span className="formation-player-node__number">{displayNumber}</span>
        </span>
        <span className="formation-player-node__name">{player.name}</span>
      </button>
      {isEditing && (
        <div className="player-actions" aria-label={`Move ${player.name}`}>
          {group !== "teamA" && (
            <button
              type="button"
              aria-label={`Move ${player.name} to Team A`}
              onClick={() => onMovePlayer(player.id, "teamA")}
            >
              A
            </button>
          )}
          {group !== "teamB" && (
            <button
              type="button"
              aria-label={`Move ${player.name} to Team B`}
              onClick={() => onMovePlayer(player.id, "teamB")}
            >
              B
            </button>
          )}
          {group !== "unassigned" && (
            <button
              type="button"
              aria-label={`Move ${player.name} to Unassigned`}
              onClick={() => onMovePlayer(player.id, "unassigned")}
            >
              U
            </button>
          )}
        </div>
      )}
    </>
  );
}

function getDisplayNumber(player: RuntimePlayer, fallbackNumber: number): string {
  const idNumber = player.id.match(/(\d+)$/)?.[1];
  return idNumber ? String(Number(idNumber)) : String(fallbackNumber);
}
