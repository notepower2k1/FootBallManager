import type { DragEvent } from "react";
import { PaginationControls } from "../../components/PaginationControls";
import { FormationPlayerNode } from "./FormationPlayerNode";
import type { FormationDropTarget } from "./FormationPitch";
import type { FormationGroup as FormationGroupId } from "./services/formationState";
import type { RuntimePlayer } from "./services/teamGeneration";

interface FormationGroupProps {
  group: FormationGroupId;
  title: string;
  players: RuntimePlayer[];
  isEditing: boolean;
  selectedPlayerId: string | null;
  draggedPlayerId: string | null;
  dropTarget: FormationDropTarget | null;
  onSelectPlayer: (playerId: string) => void;
  onDragStart: (event: DragEvent<HTMLElement>, playerId: string) => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLElement>, group: FormationGroupId) => void;
  onDrop: (event: DragEvent<HTMLElement>, group: FormationGroupId) => void;
  onMovePlayer: (playerId: string, group: FormationGroupId) => void;
  totalPlayerCount?: number;
  pagination?: {
    page: number;
    pageCount: number;
    onPageChange: (page: number) => void;
  };
}

export function FormationGroup({
  group,
  title,
  players,
  isEditing,
  selectedPlayerId,
  draggedPlayerId,
  dropTarget,
  onSelectPlayer,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onMovePlayer,
  totalPlayerCount = players.length,
  pagination,
}: FormationGroupProps) {
  const isListDropTarget = dropTarget?.group === group;

  return (
    <section className={`formation-group formation-group--${group}`}>
      <header className="formation-group__header">
        <h3>{title}</h3>
        <span>{totalPlayerCount} waiting</span>
      </header>
      <ul
        className={`formation-player-list formation-player-list--compact${isListDropTarget ? " is-drop-target" : ""}`}
        data-formation-unassigned={group === "unassigned" ? "true" : undefined}
        onDragOver={(event) => {
          if (isEditing) {
            event.preventDefault();
            onDragOver(event, group);
          }
        }}
        onDrop={(event) => onDrop(event, group)}
      >
        {players.map((player, index) => (
          <li
            className={[
              "formation-player",
              "formation-player--compact",
              isEditing ? "is-draggable" : "",
              player.id === draggedPlayerId ? "is-dragging" : "",
              "isGuest" in player ? "is-guest" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            data-player-id={player.id}
            key={player.id}
          >
            <FormationPlayerNode
              player={player}
              group={group}
              fallbackNumber={index + 1}
              isEditing={isEditing}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={onSelectPlayer}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onMovePlayer={onMovePlayer}
            />
          </li>
        ))}
        {players.length === 0 && (
          <li className="formation-group__empty">
            {isEditing ? "Drop players here" : "No players here"}
          </li>
        )}
      </ul>
      {pagination && (
        <PaginationControls
          page={pagination.page}
          pageCount={pagination.pageCount}
          onPageChange={pagination.onPageChange}
          label={`${title} pagination`}
        />
      )}
    </section>
  );
}
