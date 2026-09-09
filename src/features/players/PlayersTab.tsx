import { useEffect, useState } from "react";
import { getUserErrorMessage } from "../../domain/errors";
import { MAX_PLAYERS, type Player, type Tier } from "../../domain/player";
import { paginate } from "../../lib/pagination";
import type { PlayerRepository } from "../../repositories/playerRepository";
import { PaginationControls } from "../../components/PaginationControls";
import { PlayerDetail } from "../../components/PlayerDetail";
import { PlayerFormModal } from "./PlayerFormModal";
import {
  filterPlayers,
  PLAYER_PAGE_SIZE,
  RATING_OPTIONS,
  toPlayerInput,
  type PlayerFormValues,
} from "./services/playerManagement";

interface PlayersTabProps {
  players: Player[];
  isLoading: boolean;
  error: string | null;
  playerRepository: PlayerRepository;
  onPlayersChanged: (players: Player[]) => void;
}

type ModalState =
  | { mode: "add"; player: null }
  | { mode: "edit"; player: Player }
  | null;

export function PlayersTab({
  players,
  isLoading,
  error,
  playerRepository,
  onPlayersChanged,
}: PlayersTabProps) {
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<Tier | "">("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(
    () => players[0]?.id ?? null,
  );
  const [modal, setModal] = useState<ModalState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (selectedPlayerId && players.some(({ id }) => id === selectedPlayerId)) {
      return;
    }

    setSelectedPlayerId(players[0]?.id ?? null);
  }, [players, selectedPlayerId]);

  const filteredPlayers = filterPlayers(players, query, tierFilter);
  const playerPage = paginate(filteredPlayers, currentPage, PLAYER_PAGE_SIZE);
  const visiblePlayers = playerPage.items;
  const selectedPlayer = selectedPlayerId
    ? (players.find(({ id }) => id === selectedPlayerId) ?? null)
    : null;

  const refreshPlayers = async () => {
    const nextPlayers = await playerRepository.getPlayers();
    onPlayersChanged(nextPlayers);
    return nextPlayers;
  };

  const handleFormSubmit = async (values: PlayerFormValues) => {
    if (!modal) return;

    if (modal.mode === "add" && players.length >= MAX_PLAYERS) {
      setActionError(`A maximum of ${MAX_PLAYERS} players is allowed.`);
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setStatus("");

    try {
      if (modal.mode === "add") {
        const created = await playerRepository.createPlayer(toPlayerInput(values));
        await refreshPlayers();
        setSelectedPlayerId(created.id);
        setModal(null);
        setStatus(`${created.name} added.`);
      } else {
        const updated = await playerRepository.updatePlayer(
          modal.player.id,
          toPlayerInput(values),
        );
        await refreshPlayers();
        setSelectedPlayerId(updated.id);
        setModal(null);
        setStatus(`${updated.name} updated.`);
      }
    } catch (error) {
      setActionError(
        getUserErrorMessage(
          error,
          modal.mode === "add"
            ? "Player could not be added."
            : "Player could not be updated.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlayer) return;
    if (!window.confirm(`Delete ${selectedPlayer.name}?`)) return;

    setIsSubmitting(true);
    setActionError(null);
    setStatus("");

    try {
      await playerRepository.deletePlayer(selectedPlayer.id);
      await refreshPlayers();
      setSelectedPlayerId(null);
      setStatus(`${selectedPlayer.name} deleted.`);
    } catch (error) {
      setActionError(getUserErrorMessage(error, "Player could not be deleted."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setActionError(null);
    setModal({ mode: "add", player: null });
  };

  const openEditModal = () => {
    if (!selectedPlayer) return;
    setActionError(null);
    setModal({ mode: "edit", player: selectedPlayer });
  };

  return (
    <section className="tab-panel players-panel" aria-labelledby="players-heading">
      <header className="panel-header">
        <div>
          <p className="panel-kicker">Team roster</p>
          <h2 id="players-heading">Players</h2>
          <p className="panel-description">
            Manage the company roster used by the formation board.
          </p>
        </div>
        <div className="players-header__actions">
          <span className="player-count">
            {filteredPlayers.length} of {players.length} players
          </span>
          <button
            type="button"
            onClick={openAddModal}
            disabled={isSubmitting || players.length >= MAX_PLAYERS}
            title={
              players.length >= MAX_PLAYERS
                ? `Maximum of ${MAX_PLAYERS} players reached`
                : undefined
            }
          >
            Add player
          </button>
        </div>
      </header>

      <div className="player-filters">
        <label htmlFor="player-search">
          Search players
          <input
            id="player-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name"
          />
        </label>
        <label htmlFor="player-tier-filter">
          Filter by tier
          <select
            id="player-tier-filter"
            value={tierFilter}
            onChange={(event) => {
              setTierFilter(event.target.value as Tier | "");
              setCurrentPage(1);
            }}
          >
            <option value="">All tiers</option>
            {RATING_OPTIONS.map((rating) => (
              <option value={rating} key={rating}>
                Tier {rating}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && <p role="status">Loading players...</p>}
      {error && <p role="alert">{error}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {status && <p className="players-status" role="status">{status}</p>}

      {!isLoading && !error && (
        <div className="players-layout">
          <div className="players-roster">
            {players.length === 0 && (
              <p className="empty-state">No players are available yet.</p>
            )}
            {players.length > 0 && filteredPlayers.length === 0 && (
              <p className="empty-state">No players match these filters.</p>
            )}
            {visiblePlayers.length > 0 && (
              <ul className="player-list">
                {visiblePlayers.map((player) => (
                  <li key={player.id}>
                    <button
                      className={`player-row${selectedPlayerId === player.id ? " is-selected" : ""}`}
                      type="button"
                      onClick={() => setSelectedPlayerId(player.id)}
                      aria-pressed={selectedPlayerId === player.id}
                    >
                      <span className="player-avatar" aria-hidden="true">
                        {player.name.slice(0, 1)}
                      </span>
                      <span className="player-info">
                        <strong>{player.name}</strong>
                        <small>{player.id}</small>
                      </span>
                      <span className={`tier-badge tier-${player.tier.toLowerCase()}`}>
                        Tier {player.tier}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <PaginationControls
              page={playerPage.page}
              pageCount={playerPage.pageCount}
              onPageChange={setCurrentPage}
              label="Player list pagination"
            />
          </div>
          <PlayerDetail
            player={selectedPlayer}
            actions={
              selectedPlayer && (
                <>
                  <button type="button" onClick={openEditModal} disabled={isSubmitting}>
                    Edit player
                  </button>
                  <button type="button" onClick={handleDelete} disabled={isSubmitting}>
                    Delete player
                  </button>
                </>
              )
            }
          />
        </div>
      )}

      {modal && (
        <PlayerFormModal
          key={`${modal.mode}-${modal.player?.id ?? "new"}`}
          mode={modal.mode}
          player={modal.player}
          isSubmitting={isSubmitting}
          error={actionError}
          onClose={() => {
            setActionError(null);
            setModal(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}
    </section>
  );
}
