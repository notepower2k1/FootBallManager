# Phase 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 1 React/Vite/TypeScript frontend shell with domain models, mock player data, and repository-backed player loading.

**Architecture:** Keep domain types independent from React and infrastructure. Expose repository contracts from `src/repositories`, implement an in-memory player repository under `src/infrastructure/mock`, and pass that repository into the app shell. Keep Formation and Settings as placeholders because their interactive behavior belongs to later phases.

**Tech Stack:** React, Vite, TypeScript, native CSS, Vitest, ESLint.

**Spec:** `docs/SPEC.md` and Phase 1 of `docs/IMPLEMENTATION_PLAN.md`.

## Global Constraints

- Do not integrate Google Sheets, Google Drive, Google Apps Script, Firebase, Supabase, SQL databases, VPS hosting, or paid services.
- UI components must not directly access external APIs; data must go through repository abstractions.
- Guest players, positions, attendance, and match history are out of scope.
- Use mock data and mock repositories for frontend development.
- Keep the implementation simple and scoped to Phase 1.

---

### Task 1: Project configuration and repository contract tests

**Files:**
- Create: `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `index.html`
- Create: `src/repositories/playerRepository.test.ts`

**Interfaces:**
- Produces the scripts `test`, `typecheck`, `lint`, and `build`.
- Defines the test contract for `PlayerRepository.getPlayers()` before its implementation exists.

- [ ] **Step 1: Write the failing repository test**

```ts
it("loads players through the repository contract", async () => {
  const repository: PlayerRepository = new MockPlayerRepository();
  const players = await repository.getPlayers();
  expect(players).toHaveLength(18);
});
```

- [ ] **Step 2: Run the test and confirm it fails because the app is not implemented**

Run: `npm test -- src/repositories/playerRepository.test.ts`

Expected: the test cannot resolve the repository modules until Task 2 adds them.

- [ ] **Step 3: Add the smallest project configuration needed for Vite, TypeScript, ESLint, and Vitest**

- [ ] **Step 4: Run the test again after configuration and confirm the failure is now about the missing repository implementation**

Run: `npm test -- src/repositories/playerRepository.test.ts`

Expected: FAIL because `src/repositories/playerRepository.ts` and `src/infrastructure/mock/mockPlayerRepository.ts` do not exist yet.

### Task 2: Domain models, mock data, and mock repositories

**Files:**
- Create: `src/domain/player.ts`, `src/domain/formation.ts`, `src/domain/settings.ts`
- Create: `src/repositories/playerRepository.ts`, `src/repositories/formationRepository.ts`, `src/repositories/settingsRepository.ts`, `src/repositories/editLockRepository.ts`
- Create: `src/infrastructure/mock/mockPlayers.ts`, `src/infrastructure/mock/mockPlayerRepository.ts`

**Interfaces:**
- `MockPlayerRepository` implements `PlayerRepository` and returns a copy of 18 mock `Player` records.
- Formation, settings, and edit-lock contracts exist for future infrastructure swaps but are not wired to Google services in Phase 1. Their mock implementations are deferred until those contracts are consumed.

- [ ] **Step 1: Add the domain types and repository interfaces**

- [ ] **Step 2: Add 18 realistic mock players with varied independent tiers and stats**

- [ ] **Step 3: Implement the in-memory player repository**

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `npm test -- src/repositories/playerRepository.test.ts`

Expected: PASS with one test.

- [ ] **Step 5: Run the full test suite**

Run: `npm test`

Expected: PASS with zero failures.

### Task 3: Application shell and mock-backed Players tab

**Files:**
- Create: `src/main.tsx`, `src/app/App.tsx`, `src/app/App.css`, `src/index.css`
- Create: `src/components/Navigation.tsx`, `src/components/PlaceholderPanel.tsx`
- Create: `src/features/players/PlayersTab.tsx`

**Interfaces:**
- `App` receives a `PlayerRepository` and owns only active-tab and load-state wiring.
- `PlayersTab` receives players already loaded by the repository boundary and renders a simple list.

- [ ] **Step 1: Render the shell with Formation, Players, and Settings navigation entries**

- [ ] **Step 2: Load mock players via `PlayerRepository` and render them in the Players tab**

- [ ] **Step 3: Keep Formation and Settings visibly marked as placeholders**

- [ ] **Step 4: Run typecheck, lint, tests, and production build**

Run: `npm run typecheck`; `npm run lint`; `npm test`; `npm run build`

Expected: all commands exit 0.

### Task 4: Final Phase 1 scope check

**Files:**
- Modify only files needed to fix verification failures.

- [ ] **Step 1: Confirm no Google service imports or calls exist in the frontend**

Run: `rg -n "google|sheets|drive|apps script|firebase|supabase" src package.json`

Expected: no matches.

- [ ] **Step 2: Confirm only Phase 1 behavior is present**

Check the app and diff for absence of drag/drop, CRUD forms, settings persistence, Google integration, guest generation, random/balance logic, locking, and deployment configuration.

- [ ] **Step 3: Re-run all required verification commands and report exact results**
