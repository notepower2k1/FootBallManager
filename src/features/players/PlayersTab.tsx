import type { Player } from "../../domain/player";

interface PlayersTabProps {
  players: Player[];
  isLoading: boolean;
  error: string | null;
}

export function PlayersTab({ players, isLoading, error }: PlayersTabProps) {
  return (
    <section className="tab-panel" aria-labelledby="players-heading">
      <header className="panel-header">
        <div>
          <p className="panel-kicker">Mock repository</p>
          <h2 id="players-heading">Players</h2>
          <p className="panel-description">
            A starter roster loaded through the player repository.
          </p>
        </div>
        <span className="player-count">{players.length} players</span>
      </header>

      {isLoading && <p role="status">Loading players...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && players.length === 0 && (
        <p className="empty-state">No players are available yet.</p>
      )}
      {!isLoading && !error && players.length > 0 && (
        <ul className="player-list">
          {players.map((player) => (
            <li className="player-row" key={player.id}>
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
