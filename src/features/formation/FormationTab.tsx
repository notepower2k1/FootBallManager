import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { getUserErrorMessage } from "../../domain/errors";
import { DEFAULT_SETTINGS, type Settings } from "../../domain/settings";
import type {
  FormationMode,
  MovementArrow,
  PitchCoordinates,
} from "../../domain/formation";
import type { Player } from "../../domain/player";
import { paginate } from "../../lib/pagination";
import type { EditLock, EditLockRepository } from "../../repositories/editLockRepository";
import type { FormationRepository } from "../../repositories/formationRepository";
import { PlayerCard } from "../../components/PlayerCard";
import { FormationArrowTools } from "./FormationArrowTools";
import { FormationGroup } from "./FormationGroup";
import {
  FormationPitch,
  type FormationDropTarget,
} from "./FormationPitch";
import {
  type FormationTeamColors,
  type FormationTeamNames,
} from "./formationColors";
import {
  changeFormationMode,
  createFormationState,
  createFormationStateFromTeams,
  addMovementArrow,
  clearMovementArrows,
  getAvailableTeam,
  movePlayer,
  reconcileFormationState,
  updateMovementArrow,
  type FormationGroup as FormationGroupId,
  type FormationState,
} from "./services/formationState";
import {
  createGuestPlayers,
  generateBalancedTeams,
  generateRandomTeams,
  getBalancePercentage,
  getTeamPower,
  type RuntimePlayer,
} from "./services/teamGeneration";

interface FormationTabProps {
  players: Player[];
  isLoading: boolean;
  error: string | null;
  formationRepository: FormationRepository;
  editLockRepository?: EditLockRepository;
  settings?: Settings;
  teamColors?: FormationTeamColors;
  teamNames?: FormationTeamNames;
}

const UNASSIGNED_PAGE_SIZE = 8;

export function FormationTab({
  players,
  isLoading,
  error,
  formationRepository,
  editLockRepository,
  settings = DEFAULT_SETTINGS,
  teamColors,
  teamNames,
}: FormationTabProps) {
  const effectiveTeamColors = teamColors ?? {
    teamA: settings.teamAColor,
    teamB: settings.teamBColor,
  };
  const effectiveTeamNames = teamNames ?? {
    teamA: settings.teamAName,
    teamB: settings.teamBName,
  };
  const initialFormation = () =>
    createFormationState(
      players.map((player) => player.id),
      settings.defaultFormationMode,
    );
  const [formation, setFormation] = useState<FormationState>(initialFormation);
  const [savedFormation, setSavedFormation] =
    useState<FormationState>(initialFormation);
  const [runtimePlayers, setRuntimePlayers] = useState<RuntimePlayer[]>(
    () => players,
  );
  const [savedRuntimePlayers, setSavedRuntimePlayers] = useState<RuntimePlayer[]>(
    () => players,
  );
  const [formationVersion, setFormationVersion] = useState(1);
  const [isFormationLoading, setIsFormationLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAcquiringEditLock, setIsAcquiringEditLock] = useState(false);
  const [currentLock, setCurrentLock] = useState<EditLock | null>(null);
  const editSessionRef = useRef<string | null>(null);
  const playerIdsRef = useRef(players.map(({ id }) => id));
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(
    () => players[0]?.id ?? null,
  );
  const [unassignedPage, setUnassignedPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<FormationDropTarget | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const nextPlayerIds = players.map((player) => player.id);
    const rosterIsUnchanged =
      playerIdsRef.current.length === nextPlayerIds.length &&
      playerIdsRef.current.every(
        (playerId, index) => playerId === nextPlayerIds[index],
      );

    if (rosterIsUnchanged) return;

    playerIdsRef.current = nextPlayerIds;
    setRuntimePlayers(players);
    setSavedRuntimePlayers(players);
    setFormation((current) => reconcileFormationState(current, nextPlayerIds));
    setSavedFormation((current) =>
      reconcileFormationState(current, nextPlayerIds),
    );
    setSelectedPlayerId(nextPlayerIds[0] ?? null);
    setUnassignedPage(1);
    setIsDrawingArrow(false);
    setIsEditing(false);
    setStatus("");
  }, [players]);

  useEffect(() => {
    setUnassignedPage(1);
  }, [formation.mode, formation.unassigned]);

  useEffect(() => {
    if (isLoading || error) return;

    let isCurrent = true;
    const playerIds = playerIdsRef.current;
    setIsFormationLoading(true);

    formationRepository
      .getFormation(settings.defaultFormationMode)
      .then((saved) => {
        if (!isCurrent) return;

        const next = createFormationState(
          playerIds,
          settings.defaultFormationMode,
          saved ?? undefined,
        );
        setFormation(next);
        setSavedFormation(next);
        setFormationVersion(saved?.version ?? 1);
        setActionError(null);
      })
      .catch((loadError) => {
        if (!isCurrent) return;

        const next = createFormationState(playerIds, settings.defaultFormationMode);
        setFormation(next);
        setSavedFormation(next);
        setFormationVersion(1);
        setActionError(
          getUserErrorMessage(
            loadError,
            "Saved formation could not be loaded. A new formation was started.",
          ),
        );
      })
      .finally(() => {
        if (isCurrent) setIsFormationLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [error, formationRepository, isLoading, settings.defaultFormationMode]);

  useEffect(() => {
    if (!editLockRepository) return;

    let isCurrent = true;
    editLockRepository
      .getLock()
      .then((lock) => {
        if (isCurrent) setCurrentLock(lock);
      })
      .catch(() => {
        if (isCurrent) setCurrentLock(null);
      });

    return () => {
      isCurrent = false;
    };
  }, [editLockRepository]);

  useEffect(() => {
    return () => {
      const sessionId = editSessionRef.current;
      if (sessionId && editLockRepository) {
        void editLockRepository.releaseLock(sessionId).catch(() => undefined);
      }
    };
  }, [editLockRepository]);

  const playerById = new Map(runtimePlayers.map((player) => [player.id, player]));
  const getPlayers = (ids: readonly string[]) =>
    ids
      .map((id) => playerById.get(id))
      .filter((player): player is RuntimePlayer => player !== undefined);
  const placedPlayers = formation.placements.flatMap((placement) => {
    const player = playerById.get(placement.playerId);
    return player ? [{ player, placement }] : [];
  });
  const unassignedPageData = paginate(
    getPlayers(formation.unassigned),
    unassignedPage,
    UNASSIGNED_PAGE_SIZE,
  );
  const selectedPlayer = selectedPlayerId
    ? (playerById.get(selectedPlayerId) ?? null)
    : null;
  const selectedPlayerArrows = selectedPlayerId
    ? formation.arrows.filter(({ playerId }) => playerId === selectedPlayerId)
    : [];
  const selectedPlayerIsPlaced = selectedPlayerId
    ? formation.placements.some(({ playerId }) => playerId === selectedPlayerId)
    : false;

  const handleSelectPlayer = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setIsDrawingArrow(false);
  };

  const releaseEditLock = async () => {
    const sessionId = editSessionRef.current;
    editSessionRef.current = null;
    setCurrentLock(null);
    if (sessionId && editLockRepository) {
      await editLockRepository.releaseLock(sessionId).catch(() => undefined);
    }
  };

  const handleEdit = async () => {
    if (isEditing || isSaving || isAcquiringEditLock) return;
    setActionError(null);

    if (!editLockRepository) {
      setIsEditing(true);
      setStatus("Edit mode");
      return;
    }

    setIsAcquiringEditLock(true);
    try {
      const lock = await editLockRepository.acquireLock("Local editor");
      editSessionRef.current = lock.sessionId;
      setCurrentLock(lock);
      setIsEditing(true);
      setStatus("Edit mode");
    } catch (lockError) {
      setActionError(
        getUserErrorMessage(
          lockError,
          "Another editor currently holds the edit lock.",
        ),
      );
    } finally {
      setIsAcquiringEditLock(false);
    }
  };

  const applyGeneratedTeams = (
    generated: {
      teamA: RuntimePlayer[];
      teamB: RuntimePlayer[];
      unassigned: RuntimePlayer[];
    },
    message: string,
  ) => {
    const nextRuntimePlayers = [
      ...generated.teamA,
      ...generated.teamB,
      ...generated.unassigned,
    ];
    setRuntimePlayers(nextRuntimePlayers);
    setFormation(
      createFormationStateFromTeams(
        formation.mode,
        generated.teamA.map(({ id }) => id),
        generated.teamB.map(({ id }) => id),
        generated.unassigned.map(({ id }) => id),
      ),
    );
    setSelectedPlayerId(
      generated.teamA[0]?.id ?? generated.teamB[0]?.id ?? null,
    );
    setIsDrawingArrow(false);
    setActionError(null);
    setStatus(message);
  };

  const handleModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const mode = event.target.value as FormationMode;
    const nextRuntimePlayers = [
      ...players,
      ...createGuestPlayers(players.length, mode, settings.guestDefaultStats),
    ];
    const validIds = new Set(nextRuntimePlayers.map(({ id }) => id));
    const currentIds = new Set([
      ...formation.placements.map(({ playerId }) => playerId),
      ...formation.unassigned,
    ]);
    const newRuntimeIds = nextRuntimePlayers
      .map(({ id }) => id)
      .filter((id) => !currentIds.has(id));
    const modeState = changeFormationMode(
      {
        ...formation,
        placements: formation.placements.filter(({ playerId }) =>
          validIds.has(playerId),
        ),
        unassigned: formation.unassigned.filter((playerId) =>
          validIds.has(playerId),
        ).concat(newRuntimeIds),
      },
      mode,
    );
    setRuntimePlayers(nextRuntimePlayers);
    setFormation(modeState);
    setIsDrawingArrow(false);
    setActionError(null);
    setStatus("");
  };

  const handleMovePlayer = (
    playerId: string,
    target: FormationGroupId,
    coordinates?: PitchCoordinates,
  ) => {
    const targetTeam =
      target === "teamA" ? "A" : target === "teamB" ? "B" : "unassigned";
    const next = movePlayer(formation, playerId, targetTeam, coordinates);
    if (next === formation) {
      setStatus(
        target === "unassigned"
          ? "No change made."
          : `${target === "teamA" ? effectiveTeamNames.teamA : effectiveTeamNames.teamB} is full.`,
      );
      return;
    }

    setFormation(next);
    setSelectedPlayerId(playerId);
    setIsDrawingArrow(false);
    setStatus("");
  };

  const handleDropPlayerAtPosition = (
    playerId: string,
    coordinates: PitchCoordinates,
  ) => {
    const availableTeam = getAvailableTeam(formation);
    if (!availableTeam) {
      setStatus("Both teams are full.");
      return;
    }

    handleMovePlayer(
      playerId,
      availableTeam === "A" ? "teamA" : "teamB",
      coordinates,
    );
  };

  const handleDragOver = (
    event: DragEvent<HTMLElement>,
    group: FormationGroupId,
  ) => {
    if (!isEditing || !draggedPlayerId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTarget((current) =>
      current?.group === group
        ? current
        : { group },
    );
  };

  const handleDragStart = (event: DragEvent<HTMLElement>, playerId: string) => {
    if (!isEditing) {
      return;
    }

    setDraggedPlayerId(playerId);
    setDropTarget(null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", playerId);
  };

  const handleDragEnd = () => {
    setDraggedPlayerId(null);
    setDropTarget(null);
  };

  const handleAddMovementArrow = (
    playerId: string,
    coordinates: PitchCoordinates,
  ) => {
    const arrow: MovementArrow = {
      id: `movement-arrow-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      playerId,
      ...coordinates,
    };
    setFormation((current) => addMovementArrow(current, arrow));
    setIsDrawingArrow(false);
    setStatus("Movement arrow added.");
  };

  const handleUpdateMovementArrow = (
    arrowId: string,
    coordinates: PitchCoordinates,
  ) => {
    setFormation((current) =>
      updateMovementArrow(current, arrowId, coordinates),
    );
  };

  const handleClearMovementArrows = () => {
    if (!selectedPlayerId) return;

    setFormation((current) =>
      clearMovementArrows(current, selectedPlayerId),
    );
    setIsDrawingArrow(false);
    setStatus("Movement arrows cleared.");
  };

  const handleDrop = (
    event: DragEvent<HTMLElement>,
    target: FormationGroupId,
  ) => {
    event.preventDefault();
    const playerId = event.dataTransfer.getData("text/plain") || draggedPlayerId;
    if (isEditing && playerId) {
      handleMovePlayer(playerId, target);
    }
    handleDragEnd();
  };

  const handleReset = () => {
    const next = createFormationState(
      runtimePlayers.map((player) => player.id),
      formation.mode,
    );
    setFormation(next);
    setIsDrawingArrow(false);
    setActionError(null);
    setStatus("Formation reset in this mock session.");
  };

  const handleRandom = () => {
    applyGeneratedTeams(
      generateRandomTeams(
        players,
        formation.mode,
        settings.guestDefaultStats,
      ),
      "Random formation generated in this mock session.",
    );
  };

  const handleBalance = () => {
    const weights = {
      tierWeight: settings.tierWeight,
      statsWeight: settings.statsWeight,
    };
    const generated = generateBalancedTeams(
      players,
      formation.mode,
      settings.guestDefaultStats,
      weights,
    );
    const teamAPower = getTeamPower(generated.teamA, weights);
    const teamBPower = getTeamPower(generated.teamB, weights);
    applyGeneratedTeams(
      generated,
      `Balanced formation generated: ${effectiveTeamNames.teamA} ${teamAPower.toFixed(
        1,
      )} · ${effectiveTeamNames.teamB} ${teamBPower.toFixed(1)} · Balance ${getBalancePercentage(
        teamAPower,
        teamBPower,
      )}%`,
    );
  };

  const handleSave = async () => {
    if (!isEditing || isSaving) return;

    setIsSaving(true);
    setActionError(null);
    setStatus("");

    try {
      const realPlayerIds = new Set(players.map(({ id }) => id));
      const saved = await formationRepository.saveFormation({
        ...formation,
        placements: formation.placements.filter(({ playerId }) =>
          realPlayerIds.has(playerId),
        ),
        unassigned: formation.unassigned.filter((playerId) =>
          realPlayerIds.has(playerId),
        ),
        arrows: formation.arrows.filter(({ playerId }) =>
          realPlayerIds.has(playerId),
        ),
        version: formationVersion,
      });
      setFormationVersion(saved.version);
      setSavedFormation(formation);
      setSavedRuntimePlayers(runtimePlayers);
      await releaseEditLock();
      setIsEditing(false);
      setIsDrawingArrow(false);
      setStatus("Formation saved in this mock session.");
    } catch (saveError) {
      setActionError(
        getUserErrorMessage(saveError, "Formation could not be saved."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    setFormation(savedFormation);
    setRuntimePlayers(savedRuntimePlayers);
    setIsDrawingArrow(false);
    await releaseEditLock();
    setActionError(null);
    setIsEditing(false);
    setStatus("Changes cancelled.");
  };

  return (
    <section className="tab-panel formation-panel" aria-labelledby="formation-heading">
      <header className="formation-header">
        <div>
          <p className="panel-kicker">Team formation</p>
          <h2 id="formation-heading">Formation view</h2>
          <p className="panel-description">
            Arrange players into two teams without assigning football positions.
          </p>
        </div>
        <div className="formation-toolbar">
          <label htmlFor="formation-mode">Mode</label>
          <select
            id="formation-mode"
            value={formation.mode}
            disabled={!isEditing || isSaving}
            onChange={handleModeChange}
          >
            <option value="5v5">5v5</option>
            <option value="7v7">7v7</option>
            <option value="11v11">11v11</option>
          </select>
          <button
            type="button"
            onClick={handleEdit}
            disabled={isEditing || isSaving || isAcquiringEditLock}
          >
            {isAcquiringEditLock ? "Checking lock..." : "Edit"}
          </button>
          <button type="button" onClick={handleSave} disabled={!isEditing || isSaving}>
            Save
          </button>
          <button type="button" onClick={handleCancel} disabled={!isEditing || isSaving}>
            Cancel edit
          </button>
        </div>
      </header>

      <div className="formation-actions">
        <button
          type="button"
          disabled={!isEditing || isSaving}
          onClick={handleRandom}
        >
          Random
        </button>
        <button
          type="button"
          disabled={!isEditing || isSaving}
          onClick={handleBalance}
        >
          Balance
        </button>
        <button type="button" disabled={!isEditing || isSaving} onClick={handleReset}>
          Reset
        </button>
        <span className="formation-status" role="status" aria-live="polite">
          {status ||
            (isEditing
              ? "Edit mode"
              : currentLock
                ? `${currentLock.editorName} is editing`
                : "View mode")}
          </span>
      </div>

      {isLoading && <p role="status">Loading players...</p>}
      {error && <p role="alert">{error}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {!isLoading && !error && (
        <>
          {isFormationLoading && <p role="status">Loading formation...</p>}
          {players.length === 0 && !isFormationLoading && (
            <p className="empty-state">
              No players are available yet. Add players to build a formation.
            </p>
          )}
          <div className="formation-layout">
            <div className="formation-board">
              <FormationPitch
                placedPlayers={placedPlayers}
                teamColors={effectiveTeamColors}
                teamNames={effectiveTeamNames}
                isEditing={isEditing}
                selectedPlayerId={selectedPlayerId}
                draggedPlayerId={draggedPlayerId}
                movementArrows={formation.arrows}
                isDrawingArrow={isDrawingArrow}
                onSelectPlayer={handleSelectPlayer}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onMovePlayer={handleMovePlayer}
                onDropPlayerAtPosition={handleDropPlayerAtPosition}
                onAddMovementArrow={handleAddMovementArrow}
                onUpdateMovementArrow={handleUpdateMovementArrow}
              />
              <FormationGroup
                group="unassigned"
                title="Unassigned"
                players={unassignedPageData.items}
                isEditing={isEditing}
                selectedPlayerId={selectedPlayerId}
                draggedPlayerId={draggedPlayerId}
                dropTarget={dropTarget}
                onSelectPlayer={handleSelectPlayer}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onMovePlayer={handleMovePlayer}
                totalPlayerCount={unassignedPageData.totalItems}
                pagination={{
                  page: unassignedPageData.page,
                  pageCount: unassignedPageData.pageCount,
                  onPageChange: setUnassignedPage,
                }}
              />
            </div>
            <div className="formation-detail-panel">
              <PlayerCard player={selectedPlayer} />
              {selectedPlayer && (
                <FormationArrowTools
                  isEditing={isEditing}
                  isDrawing={isDrawingArrow}
                  canDraw={selectedPlayerIsPlaced}
                  arrowCount={selectedPlayerArrows.length}
                  onStartDrawing={() => setIsDrawingArrow(true)}
                  onClearArrows={handleClearMovementArrows}
                />
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
