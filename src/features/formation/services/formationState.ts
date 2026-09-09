import type {
  FormationMode,
  FormationPlacement,
  FormationTeam,
  MovementArrow,
  PitchCoordinates,
} from "../../../domain/formation";

export type FormationGroup = "teamA" | "teamB" | "unassigned";
export type FormationMoveTarget = FormationTeam | "unassigned";

export interface FormationState {
  mode: FormationMode;
  placements: FormationPlacement[];
  unassigned: string[];
  arrows: MovementArrow[];
}

type FormationSeed = Pick<FormationState, "placements" | "unassigned"> & {
  arrows?: readonly MovementArrow[];
};
type FormationLayout = Record<FormationTeam, readonly PitchCoordinates[]>;

const DEFAULT_FORMATION_LAYOUTS: Record<FormationMode, FormationLayout> = {
  "5v5": {
    A: [
      { x: 50, y: 15 },
      { x: 30, y: 30 },
      { x: 70, y: 30 },
      { x: 35, y: 45 },
      { x: 65, y: 45 },
    ],
    B: [
      { x: 50, y: 85 },
      { x: 30, y: 70 },
      { x: 70, y: 70 },
      { x: 35, y: 55 },
      { x: 65, y: 55 },
    ],
  },
  "7v7": {
    A: [
      { x: 50, y: 10 },
      { x: 32, y: 22 },
      { x: 68, y: 22 },
      { x: 20, y: 35 },
      { x: 50, y: 35 },
      { x: 80, y: 35 },
      { x: 50, y: 46 },
    ],
    B: [
      { x: 50, y: 90 },
      { x: 32, y: 78 },
      { x: 68, y: 78 },
      { x: 20, y: 65 },
      { x: 50, y: 65 },
      { x: 80, y: 65 },
      { x: 50, y: 54 },
    ],
  },
  "11v11": {
    A: [
      { x: 50, y: 8 },
      { x: 30, y: 12 },
      { x: 70, y: 12 },
      { x: 18, y: 22 },
      { x: 38, y: 22 },
      { x: 62, y: 22 },
      { x: 82, y: 22 },
      { x: 12, y: 35 },
      { x: 33, y: 35 },
      { x: 67, y: 35 },
      { x: 88, y: 35 },
    ],
    B: [
      { x: 50, y: 92 },
      { x: 30, y: 88 },
      { x: 70, y: 88 },
      { x: 18, y: 78 },
      { x: 38, y: 78 },
      { x: 62, y: 78 },
      { x: 82, y: 78 },
      { x: 12, y: 65 },
      { x: 33, y: 65 },
      { x: 67, y: 65 },
      { x: 88, y: 65 },
    ],
  },
};

const TEAM_CAPACITIES: Record<FormationMode, number> = {
  "5v5": 5,
  "7v7": 7,
  "11v11": 11,
};

export function getTeamCapacity(mode: FormationMode): number {
  return TEAM_CAPACITIES[mode];
}

export function normalizePitchCoordinates({
  x,
  y,
}: PitchCoordinates): PitchCoordinates {
  return { x: clamp(x), y: clamp(y) };
}

export function createFormationState(
  playerIds: readonly string[],
  mode: FormationMode,
  savedFormation?: FormationSeed,
): FormationState {
  const uniquePlayerIds = [...new Set(playerIds)];
  const capacity = getTeamCapacity(mode);
  const savedPlacements = new Map(
    savedFormation?.placements.map((placement) => [placement.playerId, placement]),
  );
  const savedUnassigned = new Set(savedFormation?.unassigned ?? []);
  const placements: FormationPlacement[] = [];
  const unassigned: string[] = [];
  let nextTeamAIndex = 0;
  let nextTeamBIndex = 0;

  for (const playerId of uniquePlayerIds) {
    const savedPlacement = savedPlacements.get(playerId);
    if (savedUnassigned.has(playerId) && !savedPlacement) {
      unassigned.push(playerId);
      continue;
    }

    const defaultTeam =
      nextTeamAIndex < capacity
        ? "A"
        : nextTeamBIndex < capacity
          ? "B"
          : null;
    const team = savedPlacement?.team ?? defaultTeam;

    if (!team) {
      unassigned.push(playerId);
      continue;
    }

    const teamIndex = team === "A" ? nextTeamAIndex : nextTeamBIndex;
    if (teamIndex >= capacity) {
      unassigned.push(playerId);
      continue;
    }

    if (team === "A") nextTeamAIndex += 1;
    else nextTeamBIndex += 1;

    placements.push(
      savedPlacement
        ? {
            playerId,
            team,
            ...normalizePitchCoordinates(savedPlacement),
          }
        : createPlacement(playerId, team, mode, teamIndex),
    );
  }

  return {
    mode,
    placements,
    unassigned,
    arrows: normalizeMovementArrows(
      savedFormation?.arrows ?? [],
      new Set(placements.map(({ playerId }) => playerId)),
    ),
  };
}

export function createFormationStateFromTeams(
  mode: FormationMode,
  teamAIds: readonly string[],
  teamBIds: readonly string[],
  unassignedIds: readonly string[] = [],
): FormationState {
  const capacity = getTeamCapacity(mode);
  const placements: FormationPlacement[] = [];
  const assigned = new Set<string>();
  const unassigned: string[] = [];
  const queuedUnassigned = new Set<string>();

  const addUnassigned = (playerId: string) => {
    if (assigned.has(playerId) || queuedUnassigned.has(playerId)) return;
    queuedUnassigned.add(playerId);
    unassigned.push(playerId);
  };

  const addTeam = (playerIds: readonly string[], team: FormationTeam) => {
    for (const playerId of playerIds) {
      if (assigned.has(playerId) || queuedUnassigned.has(playerId)) continue;

      const teamCount = placements.filter(({ team: currentTeam }) => currentTeam === team).length;
      if (teamCount >= capacity) {
        addUnassigned(playerId);
        continue;
      }

      assigned.add(playerId);
      placements.push(createPlacement(playerId, team, mode, teamCount));
    }
  };

  addTeam(teamAIds, "A");
  addTeam(teamBIds, "B");
  unassignedIds.forEach(addUnassigned);

  return { mode, placements, unassigned, arrows: [] };
}

export function changeFormationMode(
  state: FormationState,
  mode: FormationMode,
): FormationState {
  const capacity = getTeamCapacity(mode);
  const teamA = state.placements.filter((placement) => placement.team === "A");
  const teamB = state.placements.filter((placement) => placement.team === "B");
  const placements = [...teamA.slice(0, capacity), ...teamB.slice(0, capacity)];
  const available = [
    ...teamA.slice(capacity).map(({ playerId }) => playerId),
    ...teamB.slice(capacity).map(({ playerId }) => playerId),
    ...state.unassigned,
  ];

  addAvailablePlayers(placements, available, "A", capacity, mode);
  addAvailablePlayers(placements, available, "B", capacity, mode);

  return {
    mode,
    placements,
    unassigned: available,
    arrows: state.arrows.filter(({ playerId }) =>
      placements.some((placement) => placement.playerId === playerId),
    ),
  };
}

export function reconcileFormationState(
  state: FormationState,
  playerIds: readonly string[],
): FormationState {
  const uniquePlayerIds = [...new Set(playerIds)];
  const currentPlayerIds = [
    ...state.placements.map(({ playerId }) => playerId),
    ...state.unassigned,
  ];
  const currentPlayerIdSet = new Set(currentPlayerIds);
  const rosterIsUnchanged =
    currentPlayerIds.length === uniquePlayerIds.length &&
    currentPlayerIdSet.size === currentPlayerIds.length &&
    uniquePlayerIds.every((playerId) => currentPlayerIdSet.has(playerId));

  return rosterIsUnchanged
    ? state
    : createFormationState(uniquePlayerIds, state.mode, state);
}

export function getAvailableTeam(state: FormationState): FormationTeam | null {
  const capacity = getTeamCapacity(state.mode);
  const teamACount = state.placements.filter(({ team }) => team === "A").length;
  if (teamACount < capacity) return "A";

  const teamBCount = state.placements.filter(({ team }) => team === "B").length;
  return teamBCount < capacity ? "B" : null;
}

export function addMovementArrow(
  state: FormationState,
  arrow: MovementArrow,
): FormationState {
  if (
    !state.placements.some(({ playerId }) => playerId === arrow.playerId) ||
    state.arrows.some(({ id }) => id === arrow.id)
  ) {
    return state;
  }

  return {
    ...state,
    arrows: [...state.arrows, normalizeMovementArrow(arrow)],
  };
}

export function updateMovementArrow(
  state: FormationState,
  arrowId: string,
  coordinates: PitchCoordinates,
): FormationState {
  if (!state.arrows.some(({ id }) => id === arrowId)) return state;

  return {
    ...state,
    arrows: state.arrows.map((arrow) =>
      arrow.id === arrowId
        ? { ...arrow, ...normalizePitchCoordinates(coordinates) }
        : arrow,
    ),
  };
}

export function removeMovementArrow(
  state: FormationState,
  arrowId: string,
): FormationState {
  return {
    ...state,
    arrows: state.arrows.filter(({ id }) => id !== arrowId),
  };
}

export function clearMovementArrows(
  state: FormationState,
  playerId: string,
): FormationState {
  return {
    ...state,
    arrows: state.arrows.filter((arrow) => arrow.playerId !== playerId),
  };
}

export function movePlayer(
  state: FormationState,
  playerId: string,
  target: FormationMoveTarget,
  coordinates?: PitchCoordinates,
): FormationState {
  const sourcePlacement = state.placements.find(
    (placement) => placement.playerId === playerId,
  );
  const sourceIsUnassigned = state.unassigned.includes(playerId);

  if (!sourcePlacement && !sourceIsUnassigned) return state;

  if (target === "unassigned") {
    if (!sourcePlacement) return state;

    return {
      mode: state.mode,
      placements: state.placements.filter(
        (placement) => placement.playerId !== playerId,
      ),
      arrows: state.arrows.filter((arrow) => arrow.playerId !== playerId),
      unassigned: [
        ...state.unassigned.filter((id) => id !== playerId),
        playerId,
      ],
    };
  }

  const capacity = getTeamCapacity(state.mode);
  const targetCount = state.placements.filter(
    ({ team }) => team === target,
  ).length;
  if (targetCount >= capacity && sourcePlacement?.team !== target) return state;

  const nextCoordinates = normalizePitchCoordinates(
    coordinates ??
      sourcePlacement ??
      getDefaultCoordinates(state.mode, target, targetCount, playerId),
  );
  const nextPlacement: FormationPlacement = {
    playerId,
    team: target,
    ...nextCoordinates,
  };

  return {
    mode: state.mode,
    placements: [
      ...state.placements.filter((placement) => placement.playerId !== playerId),
      nextPlacement,
    ],
    arrows: state.arrows,
    unassigned: state.unassigned.filter((id) => id !== playerId),
  };
}

function normalizeMovementArrows(
  arrows: readonly MovementArrow[],
  placedPlayerIds: ReadonlySet<string>,
): MovementArrow[] {
  return arrows
    .filter(({ playerId }) => placedPlayerIds.has(playerId))
    .map(normalizeMovementArrow);
}

function normalizeMovementArrow(arrow: MovementArrow): MovementArrow {
  return {
    ...arrow,
    ...normalizePitchCoordinates(arrow),
  };
}

function addAvailablePlayers(
  placements: FormationPlacement[],
  available: string[],
  team: FormationTeam,
  capacity: number,
  mode: FormationMode,
) {
  let currentCount = placements.filter(
    ({ team: currentTeam }) => currentTeam === team,
  ).length;

  while (currentCount < capacity && available.length > 0) {
    const playerId = available.shift();
    if (playerId !== undefined) {
      placements.push(createPlacement(playerId, team, mode, currentCount));
      currentCount += 1;
    }
  }
}

function createPlacement(
  playerId: string,
  team: FormationTeam,
  mode: FormationMode,
  index: number,
): FormationPlacement {
  return {
    playerId,
    team,
    ...getDefaultCoordinates(mode, team, index, playerId),
  };
}

function getDefaultCoordinates(
  mode: FormationMode,
  team: FormationTeam,
  index: number,
  playerId: string,
): PitchCoordinates {
  const coordinate = DEFAULT_FORMATION_LAYOUTS[mode][team][index];
  if (coordinate) return coordinate;

  let hash = 0;
  for (const character of playerId) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return {
    x: 15 + (hash % 70),
    y: 10 + ((hash >>> 8) % 80),
  };
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}
