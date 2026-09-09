import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./index.css";
import "./app/App.css";
import { MockFormationRepository } from "./infrastructure/mock/mockFormationRepository";
import { MockPlayerRepository } from "./infrastructure/mock/mockPlayerRepository";
import { MockSettingsRepository } from "./infrastructure/mock/mockSettingsRepository";
import { MockEditLockRepository } from "./infrastructure/mock/mockEditLockRepository";

const playerRepository = new MockPlayerRepository();
const formationRepository = new MockFormationRepository();
const settingsRepository = new MockSettingsRepository();
const editLockRepository = new MockEditLockRepository();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App
      playerRepository={playerRepository}
      formationRepository={formationRepository}
      settingsRepository={settingsRepository}
      editLockRepository={editLockRepository}
    />
  </StrictMode>,
);
