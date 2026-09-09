# Mock-First Frontend Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or subagent-driven-development) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the frontend and domain behavior with mock repositories before any live Google integration.

**Architecture:** Keep repository interfaces at feature boundaries. Put guest generation, rating, team scoring, random generation, and formation conversion in pure services. Keep React responsible for orchestration, selection, feedback, and rendering only.

**Tech Stack:** React 19, Vite, TypeScript, Vitest, CSS, existing mock repositories.

**Spec:** `docs/superpowers/specs/2026-09-09-mock-first-frontend-completion-design.md`

## Global Constraints

- Do not use Firebase, Supabase, SQL databases, VPS, or paid services.
- UI components must not directly access Google APIs.
- Develop frontend against mock repositories before backend integration.
- Guest players are runtime entities and must not be persisted as normal players.
- Do not add football positions, attendance, or match history.
- Preserve free-form formation coordinates and existing Phase 2 behavior.
- Do not add a new dependency when the current stack or browser APIs suffice.

### Task 1: Selected-player card in Players

**Files:**
- Modify: `src/features/players/PlayersTab.tsx`
- Modify: `src/components/PlayerDetail.tsx`
- Modify: `src/app/App.css`
- Test: `src/features/players/PlayersTab.test.tsx`

**Steps:**

- [ ] Write a failing component test proving the Players tab renders `player-card` and the selected player's stats.
- [ ] Run the focused test and confirm the failure is the missing card markup.
- [ ] Replace the Players-only detail rendering with the reusable `PlayerCard`, keeping CRUD actions outside the card.
- [ ] Add only the CSS needed for the Players right column and responsive stacking.
- [ ] Run the focused test and the existing PlayerCard tests.

### Task 2: Pure runtime player and team-generation services

**Files:**
- Create: `src/features/formation/services/teamGeneration.ts`
- Create: `src/features/formation/services/teamGeneration.test.ts`
- Modify: `src/domain/player.ts` only if a shared runtime type is required

**Steps:**

- [ ] Write failing tests for guest count/names, rating score, stat average, weighted strength, random uniqueness, and balanced equal-size output.
- [ ] Run the focused tests and confirm the missing-service failures.
- [ ] Implement the smallest pure functions for runtime roster creation, random split, score calculation, and balanced split.
- [ ] Verify guests remain runtime values and no repository mutation occurs.
- [ ] Run the focused service tests.

### Task 3: Settings feature and injection

**Files:**
- Create: `src/features/settings/SettingsTab.tsx`
- Create: `src/features/settings/settingsForm.ts`
- Create: `src/features/settings/settingsForm.test.ts`
- Modify: `src/app/App.tsx`
- Modify: `src/main.tsx`
- Modify: `src/app/App.css`
- Test: `src/app/App.test.tsx`

**Steps:**

- [ ] Write failing tests for settings validation and the Settings tab labels/default values.
- [ ] Run the focused tests and confirm the missing feature failure.
- [ ] Inject `SettingsRepository` into `App`, load settings through it, and render the Settings tab.
- [ ] Implement controlled settings form with color inputs, rating selects, and weight-total validation.
- [ ] Save through the repository and expose success/error feedback.
- [ ] Run the Settings/App tests.

### Task 4: Connect settings and generated formation behavior

**Files:**
- Modify: `src/features/formation/FormationTab.tsx`
- Modify: `src/features/formation/FormationPitch.tsx`
- Modify: `src/features/formation/FormationGroup.tsx`
- Modify: `src/features/formation/FormationPlayerNode.tsx`
- Modify: `src/features/formation/services/formationState.ts`
- Modify: `src/app/App.tsx`
- Test: `src/features/formation/FormationTab.test.tsx`
- Test: `src/features/formation/services/formationState.test.ts`

**Steps:**

- [ ] Write failing tests for generated runtime roster, mode capacity, Random/Balance action results, team names/colors, and guest rendering.
- [ ] Run the focused tests and confirm failures are behavior gaps.
- [ ] Keep real players and guests in a runtime map while saving only formation state through `FormationRepository`.
- [ ] Wire Settings team names/colors and guest defaults into Formation.
- [ ] Replace placeholder Random/Balance handlers with service calls and preserve free-form coordinates.
- [ ] Keep Edit/View, drag/drop, selection, Save/Cancel, and Reset behavior intact.
- [ ] Run formation tests and regression tests.

### Task 5: Mock edit state and UX polish

**Files:**
- Modify: `src/features/formation/FormationTab.tsx`
- Modify: `src/app/App.css`
- Test: `src/features/formation/FormationTab.test.tsx`

**Steps:**

- [ ] Write a failing test for explicit View/Edit status and locked-state feedback.
- [ ] Run it and confirm the missing state.
- [ ] Inject/use `EditLockRepository` for mock acquisition/release, with safe fallback messaging.
- [ ] Add loading, empty, error, disabled, and unsaved-change feedback without changing pitch behavior.
- [ ] Run the focused tests.

### Task 6: Full verification and scope audit

**Files:**
- Modify only files required by failures.

**Steps:**

- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build`.
- [ ] Run `git diff --check` and inspect the final diff for Google integrations, positions, attendance, match history, or guest persistence.
- [ ] Fix all issues caused by this work and rerun the failed verification command.
