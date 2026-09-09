import { useEffect, useState } from "react";
import type { Player } from "../domain/player";
import type { PlayerRepository } from "../repositories/playerRepository";
import { Navigation, type TabId } from "../components/Navigation";
import { PlaceholderPanel } from "../components/PlaceholderPanel";
import { PlayersTab } from "../features/players/PlayersTab";

export interface AppProps {
  playerRepository: PlayerRepository;
}

export function App({ playerRepository }: AppProps) {
  const [activeTab, setActiveTab] = useState<TabId>("formation");
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    setIsLoading(true);
    setError(null);
    playerRepository
      .getPlayers()
      .then((loadedPlayers) => {
        if (isCurrent) {
          setPlayers(loadedPlayers);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setError("Players could not be loaded.");
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [playerRepository]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            FM
          </span>
          <div>
            <p className="brand-kicker">Company team builder</p>
            <h1>Football Manager</h1>
          </div>
        </div>
        <Navigation activeTab={activeTab} onChange={setActiveTab} />
      </header>

      <main className="app-main">
        {activeTab === "players" && (
          <PlayersTab players={players} isLoading={isLoading} error={error} />
        )}
        {activeTab === "formation" && (
          <PlaceholderPanel
            title="Formation view"
            description="The formation board will be added in Phase 2."
          />
        )}
        {activeTab === "settings" && (
          <PlaceholderPanel
            title="Settings"
            description="Settings will be added in a later phase."
          />
        )}
      </main>

      <footer className="app-footer">Phase 1 · Mock data only</footer>
    </div>
  );
}
