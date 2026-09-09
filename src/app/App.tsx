import { useEffect, useState } from "react";
import { getUserErrorMessage } from "../domain/errors";
import type { Player } from "../domain/player";
import { DEFAULT_SETTINGS, type Settings } from "../domain/settings";
import type { FormationRepository } from "../repositories/formationRepository";
import type { PlayerRepository } from "../repositories/playerRepository";
import type { SettingsRepository } from "../repositories/settingsRepository";
import type { EditLockRepository } from "../repositories/editLockRepository";
import { Navigation, type TabId } from "../components/Navigation";
import { FormationTab } from "../features/formation/FormationTab";
import { PlayersTab } from "../features/players/PlayersTab";
import { SettingsTab } from "../features/settings/SettingsTab";

export interface AppProps {
  playerRepository: PlayerRepository;
  formationRepository: FormationRepository;
  settingsRepository: SettingsRepository;
  editLockRepository: EditLockRepository;
}

export function App({
  playerRepository,
  formationRepository,
  settingsRepository,
  editLockRepository,
}: AppProps) {
  const [activeTab, setActiveTab] = useState<TabId>("formation");
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

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
      .catch((loadError) => {
        if (isCurrent) {
          setError(getUserErrorMessage(loadError, "Players could not be loaded."));
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [playerRepository]);

  useEffect(() => {
    let isCurrent = true;

    setIsSettingsLoading(true);
    setSettingsError(null);
    settingsRepository
      .getSettings()
      .then((loadedSettings) => {
        if (isCurrent) {
          setSettings(loadedSettings);
          setIsSettingsLoading(false);
        }
      })
      .catch((loadError) => {
        if (isCurrent) {
          setSettingsError(
            getUserErrorMessage(loadError, "Settings could not be loaded."),
          );
          setIsSettingsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [settingsRepository]);

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
          <PlayersTab
            players={players}
            isLoading={isLoading}
            error={error}
            playerRepository={playerRepository}
            onPlayersChanged={setPlayers}
          />
        )}
        {activeTab === "formation" && (
          <FormationTab
            players={players}
            isLoading={isLoading}
            error={error}
            formationRepository={formationRepository}
            settings={settings}
            editLockRepository={editLockRepository}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            settings={settings}
            isLoading={isSettingsLoading}
            error={settingsError}
            settingsRepository={settingsRepository}
            onSettingsChanged={(nextSettings) => {
              setSettings(nextSettings);
              setSettingsError(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
