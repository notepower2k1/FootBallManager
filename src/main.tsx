import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./index.css";
import "./app/App.css";
import { MockPlayerRepository } from "./infrastructure/mock/mockPlayerRepository";

const playerRepository = new MockPlayerRepository();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App playerRepository={playerRepository} />
  </StrictMode>,
);
