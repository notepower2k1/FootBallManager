import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type {
  FormationPlacement,
  MovementArrow,
  PitchCoordinates,
} from "../../domain/formation";
import type { FormationTeamColors, FormationTeamNames } from "./formationColors";
import { FormationPlayerNode } from "./FormationPlayerNode";
import type { FormationGroup as FormationGroupId } from "./services/formationState";
import type { RuntimePlayer } from "./services/teamGeneration";

export interface FormationDropTarget {
  group: FormationGroupId;
}

export interface FormationPlacedPlayer {
  player: RuntimePlayer;
  placement: FormationPlacement;
}

interface FormationPitchProps {
  placedPlayers: FormationPlacedPlayer[];
  teamColors: FormationTeamColors;
  teamNames: FormationTeamNames;
  isEditing: boolean;
  selectedPlayerId: string | null;
  draggedPlayerId: string | null;
  movementArrows: MovementArrow[];
  isDrawingArrow: boolean;
  onSelectPlayer: (playerId: string) => void;
  onDragStart: (event: DragEvent<HTMLElement>, playerId: string) => void;
  onDragEnd: () => void;
  onMovePlayer: (
    playerId: string,
    group: FormationGroupId,
    coordinates?: PitchCoordinates,
  ) => void;
  onDropPlayerAtPosition: (
    playerId: string,
    coordinates: PitchCoordinates,
  ) => void;
  onAddMovementArrow: (playerId: string, coordinates: PitchCoordinates) => void;
  onUpdateMovementArrow: (
    arrowId: string,
    coordinates: PitchCoordinates,
  ) => void;
}

interface PointerDragState extends PitchCoordinates {
  playerId: string;
  group: "teamA" | "teamB";
  pointerId: number;
  startClientX: number;
  startClientY: number;
  hasMoved: boolean;
}

interface ArrowDrawState extends PitchCoordinates {
  playerId: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  hasMoved: boolean;
}

interface ArrowHandleState {
  arrowId: string;
  pointerId: number;
}

export function FormationPitch({
  placedPlayers,
  teamColors,
  teamNames,
  isEditing,
  selectedPlayerId,
  draggedPlayerId,
  movementArrows,
  isDrawingArrow,
  onSelectPlayer,
  onDragStart,
  onDragEnd,
  onMovePlayer,
  onDropPlayerAtPosition,
  onAddMovementArrow,
  onUpdateMovementArrow,
}: FormationPitchProps) {
  const pitchRef = useRef<HTMLDivElement>(null);
  const pointerDragRef = useRef<PointerDragState | null>(null);
  const arrowDrawRef = useRef<ArrowDrawState | null>(null);
  const arrowHandleRef = useRef<ArrowHandleState | null>(null);
  const onMovePlayerRef = useRef(onMovePlayer);
  const onDropPlayerAtPositionRef = useRef(onDropPlayerAtPosition);
  const onAddMovementArrowRef = useRef(onAddMovementArrow);
  const onUpdateMovementArrowRef = useRef(onUpdateMovementArrow);
  const [pointerDrag, setPointerDrag] = useState<PointerDragState | null>(null);
  const [draftMovementArrow, setDraftMovementArrow] =
    useState<ArrowDrawState | null>(null);
  const [editingArrowId, setEditingArrowId] = useState<string | null>(null);
  const [nativeDropPosition, setNativeDropPosition] =
    useState<PitchCoordinates | null>(null);
  const [nativeTeamDropTarget, setNativeTeamDropTarget] = useState<
    "A" | "B" | null
  >(null);

  onMovePlayerRef.current = onMovePlayer;
  onDropPlayerAtPositionRef.current = onDropPlayerAtPosition;
  onAddMovementArrowRef.current = onAddMovementArrow;
  onUpdateMovementArrowRef.current = onUpdateMovementArrow;

  useEffect(() => {
    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const arrowDraw = arrowDrawRef.current;
      if (arrowDraw && event.pointerId === arrowDraw.pointerId) {
        const coordinates = getPitchCoordinates(
          pitchRef.current,
          event.clientX,
          event.clientY,
        );
        const hasMoved =
          arrowDraw.hasMoved ||
          Math.hypot(
            event.clientX - arrowDraw.startClientX,
            event.clientY - arrowDraw.startClientY,
          ) > 4;
        const next = { ...arrowDraw, ...coordinates, hasMoved };
        arrowDrawRef.current = next;
        setDraftMovementArrow(next);
        return;
      }

      const arrowHandle = arrowHandleRef.current;
      if (arrowHandle && event.pointerId === arrowHandle.pointerId) {
        onUpdateMovementArrowRef.current(
          arrowHandle.arrowId,
          getPitchCoordinates(pitchRef.current, event.clientX, event.clientY),
        );
        return;
      }

      const current = pointerDragRef.current;
      if (!current || event.pointerId !== current.pointerId) return;

      const coordinates = getPitchCoordinates(
        pitchRef.current,
        event.clientX,
        event.clientY,
      );
      const teamDropTarget = getTeamDropTarget(event.clientX, event.clientY);
      const hasMoved =
        current.hasMoved ||
        Math.hypot(
          event.clientX - current.startClientX,
          event.clientY - current.startClientY,
        ) > 4;
      const next = { ...current, ...coordinates, hasMoved };
      pointerDragRef.current = next;
      setPointerDrag(next);
      setNativeTeamDropTarget(teamDropTarget);
    };

    const handlePointerUp = (event: globalThis.PointerEvent) => {
      const arrowDraw = arrowDrawRef.current;
      if (arrowDraw && event.pointerId === arrowDraw.pointerId) {
        if (arrowDraw.hasMoved) {
          onAddMovementArrowRef.current(arrowDraw.playerId, {
            x: arrowDraw.x,
            y: arrowDraw.y,
          });
        }

        arrowDrawRef.current = null;
        setDraftMovementArrow(null);
        return;
      }

      const arrowHandle = arrowHandleRef.current;
      if (arrowHandle && event.pointerId === arrowHandle.pointerId) {
        arrowHandleRef.current = null;
        setEditingArrowId(null);
        return;
      }

      const current = pointerDragRef.current;
      if (!current || event.pointerId !== current.pointerId) return;

      if (current.hasMoved) {
        const coordinates = getPitchCoordinates(
          pitchRef.current,
          event.clientX,
          event.clientY,
        );
        const teamDropTarget = getTeamDropTarget(event.clientX, event.clientY);
        const droppedOnUnassigned = document
          .elementFromPoint(event.clientX, event.clientY)
          ?.closest("[data-formation-unassigned]");

        if (teamDropTarget) {
          onMovePlayerRef.current(
            current.playerId,
            teamDropTarget === "A" ? "teamA" : "teamB",
          );
        } else if (droppedOnUnassigned) {
          onMovePlayerRef.current(current.playerId, "unassigned");
        } else {
          onMovePlayerRef.current(current.playerId, current.group, coordinates);
        }
      }

      pointerDragRef.current = null;
      setPointerDrag(null);
      setNativeTeamDropTarget(null);
    };

    const handlePointerCancel = (event: globalThis.PointerEvent) => {
      const arrowDraw = arrowDrawRef.current;
      if (arrowDraw && event.pointerId === arrowDraw.pointerId) {
        arrowDrawRef.current = null;
        setDraftMovementArrow(null);
        return;
      }

      const arrowHandle = arrowHandleRef.current;
      if (arrowHandle && event.pointerId === arrowHandle.pointerId) {
        arrowHandleRef.current = null;
        setEditingArrowId(null);
        return;
      }

      const current = pointerDragRef.current;
      if (!current || event.pointerId !== current.pointerId) return;

      pointerDragRef.current = null;
      setPointerDrag(null);
      setNativeTeamDropTarget(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, []);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    playerId: string,
    group: "teamA" | "teamB",
  ) => {
    if (!isEditing) return;

    event.preventDefault();
    event.stopPropagation();

    if (isDrawingArrow && playerId === selectedPlayerId) {
      const placement = placedPlayers.find(
        ({ player }) => player.id === playerId,
      )?.placement;
      if (!placement) return;

      const next: ArrowDrawState = {
        playerId,
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        hasMoved: false,
        x: placement.x,
        y: placement.y,
      };
      arrowDrawRef.current = next;
      setDraftMovementArrow(next);
      return;
    }

    const coordinates = getPitchCoordinates(
      pitchRef.current,
      event.clientX,
      event.clientY,
    );
    const next: PointerDragState = {
      playerId,
      group,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      hasMoved: false,
      ...coordinates,
    };

    onSelectPlayer(playerId);
    pointerDragRef.current = next;
    setPointerDrag(next);
  };

  const handleMovementArrowHandlePointerDown = (
    event: ReactPointerEvent<SVGCircleElement>,
    arrowId: string,
  ) => {
    if (!isEditing) return;

    event.preventDefault();
    event.stopPropagation();
    arrowHandleRef.current = { arrowId, pointerId: event.pointerId };
    setEditingArrowId(arrowId);
  };

  const handlePitchDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!isEditing || !draggedPlayerId) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setNativeTeamDropTarget(null);
    setNativeDropPosition(
      getPitchCoordinates(pitchRef.current, event.clientX, event.clientY),
    );
  };

  const handlePitchDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) {
      return;
    }

    setNativeDropPosition(null);
    setNativeTeamDropTarget(null);
  };

  const handlePitchDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!isEditing) return;

    event.preventDefault();
    const playerId =
      event.dataTransfer.getData("text/plain") || draggedPlayerId;
    if (playerId) {
      onDropPlayerAtPositionRef.current(
        playerId,
        getPitchCoordinates(pitchRef.current, event.clientX, event.clientY),
      );
    }

    setNativeDropPosition(null);
    setNativeTeamDropTarget(null);
    onDragEnd();
  };

  const handleTeamDragOver = (
    event: DragEvent<HTMLSpanElement>,
    team: "A" | "B",
  ) => {
    if (!isEditing || !draggedPlayerId) return;

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    setNativeDropPosition(null);
    setNativeTeamDropTarget(team);
  };

  const handleTeamDrop = (
    event: DragEvent<HTMLSpanElement>,
    team: "A" | "B",
  ) => {
    if (!isEditing) return;

    event.preventDefault();
    event.stopPropagation();
    const playerId =
      event.dataTransfer.getData("text/plain") || draggedPlayerId;
    if (playerId) {
      onMovePlayerRef.current(playerId, team === "A" ? "teamA" : "teamB");
    }

    setNativeDropPosition(null);
    setNativeTeamDropTarget(null);
    onDragEnd();
  };

  const placementByPlayerId = new Map(
    placedPlayers.map(({ player, placement }) => [player.id, placement]),
  );

  return (
    <div
      ref={pitchRef}
      className={[
        "formation-pitch",
        "formation-pitch--full",
        isEditing ? "is-editing" : "",
        pointerDrag ? "is-pointer-dragging" : "",
        nativeDropPosition ? "is-native-drop-target" : "",
        isDrawingArrow ? "is-drawing-arrow" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Formation pitch"
      onDragOver={handlePitchDragOver}
      onDragLeave={handlePitchDragLeave}
      onDrop={handlePitchDrop}
    >
      <span className="formation-pitch__goal formation-pitch__goal--top" aria-hidden="true" />
      <span className="formation-pitch__goal formation-pitch__goal--bottom" aria-hidden="true" />
      <span
        className="formation-pitch__penalty-area formation-pitch__penalty-area--top"
        aria-hidden="true"
      />
      <span
        className="formation-pitch__penalty-area formation-pitch__penalty-area--bottom"
        aria-hidden="true"
      />
      <span
        className="formation-pitch__goal-area formation-pitch__goal-area--top"
        aria-hidden="true"
      />
      <span
        className="formation-pitch__goal-area formation-pitch__goal-area--bottom"
        aria-hidden="true"
      />
      <span className="formation-pitch__center-circle" aria-hidden="true" />
      <svg
        className="formation-pitch__movement-arrows"
        style={{ zIndex: 4 }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        role="img"
        aria-label="Player movement arrows"
      >
        <defs>
          <marker
            id="formation-movement-arrow-head"
            markerHeight="5"
            markerUnits="userSpaceOnUse"
            markerWidth="5"
            orient="auto"
            refX="4"
            refY="3"
            viewBox="0 0 6 6"
          >
            <path d="M0 0 L6 3 L0 6 Z" />
          </marker>
        </defs>
        {movementArrows.map((arrow, index) => {
          const placement = placementByPlayerId.get(arrow.playerId);
          if (!placement) return null;

          return (
            <g
              className={`formation-movement-arrow${
                editingArrowId === arrow.id ? " is-editing" : ""
              }`}
              data-arrow-id={arrow.id}
              key={arrow.id}
            >
              <line
                className="formation-movement-arrow__line"
                markerEnd="url(#formation-movement-arrow-head)"
                stroke={
                  placement.team === "A" ? teamColors.teamA : teamColors.teamB
                }
                vectorEffect="non-scaling-stroke"
                x1={placement.x}
                x2={arrow.x}
                y1={placement.y}
                y2={arrow.y}
              />
              {isEditing && (
                <circle
                  className="formation-movement-arrow__handle"
                  cx={arrow.x}
                  cy={arrow.y}
                  data-arrow-handle={arrow.id}
                  aria-label={`Change angle of movement arrow ${index + 1}`}
                  onPointerDown={(event) =>
                    handleMovementArrowHandlePointerDown(event, arrow.id)
                  }
                  r="2.2"
                  tabIndex={0}
                />
              )}
            </g>
          );
        })}
        {draftMovementArrow &&
          placementByPlayerId.get(draftMovementArrow.playerId) && (
            <line
              className="formation-movement-arrow formation-movement-arrow--draft"
              markerEnd="url(#formation-movement-arrow-head)"
              vectorEffect="non-scaling-stroke"
              x1={
                placementByPlayerId.get(draftMovementArrow.playerId)!.x
              }
              x2={draftMovementArrow.x}
              y1={
                placementByPlayerId.get(draftMovementArrow.playerId)!.y
              }
              y2={draftMovementArrow.y}
            />
          )}
      </svg>
      <span
        className={`formation-pitch__team-label formation-team-a${nativeTeamDropTarget === "A" ? " is-drop-target" : ""}`}
        data-formation-team-drop="A"
        style={{ color: teamColors.teamA }}
        onDragOver={(event) => handleTeamDragOver(event, "A")}
        onDrop={(event) => handleTeamDrop(event, "A")}
      >
        {teamNames.teamA}
      </span>
      <span
        className={`formation-pitch__team-label formation-team-b${nativeTeamDropTarget === "B" ? " is-drop-target" : ""}`}
        data-formation-team-drop="B"
        style={{ color: teamColors.teamB }}
        onDragOver={(event) => handleTeamDragOver(event, "B")}
        onDrop={(event) => handleTeamDrop(event, "B")}
      >
        {teamNames.teamB}
      </span>
      {nativeDropPosition && (
        <span
          className="formation-pitch__drop-indicator"
          style={{
            left: `${nativeDropPosition.x}%`,
            top: `${nativeDropPosition.y}%`,
          }}
          aria-hidden="true"
        />
      )}
      <ul className="formation-pitch__players">
        {placedPlayers.map(({ player, placement }) => {
          const isPointerDragging = pointerDrag?.playerId === player.id;
          const coordinates = isPointerDragging ? pointerDrag : placement;
          const group = placement.team === "A" ? "teamA" : "teamB";

          return (
            <li
              className={[
                "formation-pitch__player",
                `formation-pitch__player--${group === "teamA" ? "team-a" : "team-b"}`,
                isEditing ? "is-draggable" : "",
                isPointerDragging ? "is-dragging" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              data-player-id={player.id}
              data-team={placement.team}
              data-x={coordinates.x}
              data-y={coordinates.y}
              key={player.id}
              style={{ left: `${coordinates.x}%`, top: `${coordinates.y}%` }}
              aria-label={`${player.name}, ${placement.team === "A" ? teamNames.teamA : teamNames.teamB}`}
            >
              <FormationPlayerNode
                player={player}
                group={group}
                fallbackNumber={getPlayerNumber(placedPlayers, player.id)}
                teamColor={
                  placement.team === "A" ? teamColors.teamA : teamColors.teamB
                }
                isEditing={isEditing}
                selectedPlayerId={selectedPlayerId}
                onSelectPlayer={onSelectPlayer}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onPointerDown={(event, id) =>
                  handlePointerDown(event, id, group)
                }
                onMovePlayer={onMovePlayer}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function getPitchCoordinates(
  pitch: HTMLDivElement | null,
  clientX: number,
  clientY: number,
): PitchCoordinates {
  const bounds = pitch?.getBoundingClientRect();
  if (!bounds || bounds.width === 0 || bounds.height === 0) {
    return { x: 50, y: 50 };
  }

  return {
    x: clamp(((clientX - bounds.left) / bounds.width) * 100),
    y: clamp(((clientY - bounds.top) / bounds.height) * 100),
  };
}

function getTeamDropTarget(clientX: number, clientY: number): "A" | "B" | null {
  const value = document
    .elementFromPoint(clientX, clientY)
    ?.closest("[data-formation-team-drop]")
    ?.getAttribute("data-formation-team-drop");

  return value === "A" || value === "B" ? value : null;
}

function getPlayerNumber(
  placedPlayers: FormationPlacedPlayer[],
  playerId: string,
): number {
  return placedPlayers.findIndex(({ player }) => player.id === playerId) + 1;
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}
