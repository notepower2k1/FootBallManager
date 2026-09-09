# Company Football Team Builder — Implementation Plan

## 1. Purpose

Build a lightweight internal company football team builder that allows everyone to view the current data while ensuring only one person can edit at a time.

The application should remain simple, free to operate for the expected small internal usage, and easy to maintain.

---

## 2. Fixed Technology Stack

### Frontend
- React
- Vite
- TypeScript

### Hosting
- GitHub Pages

### Backend
- Google Apps Script Web App

### Data storage
- Google Sheets

### Image storage
- Google Drive

### Explicitly out of scope
Do **not** introduce any of the following unless the project owner explicitly requests it:

- Firebase
- Supabase
- PostgreSQL
- MySQL
- MongoDB
- VPS/server hosting
- Paid infrastructure
- Complex authentication systems
- Player positions
- Attendance tracking
- Match history
- Tournament management
- Advanced football analytics
- AI-based balancing

---

# 3. Product Scope

The MVP contains two main tabs and one settings area.

## 3.1 Formation Tab

The Formation tab contains two main sections.

### Left side
- Football formation area
- Team A
- Team B
- Unassigned players
- Formation mode selector:
  - 5v5
  - 7v7

### Right side
- Selected player details

### Main actions
- Edit
- Random
- Balance
- Reset
- Save
- Cancel edit

### Formation capabilities
Users must be able to:

- Move players from unassigned to Team A
- Move players from unassigned to Team B
- Move players between Team A and Team B
- Reorder players inside a team
- Return a player to unassigned
- Select a player and view details
- Switch between 5v5 and 7v7
- Save the formation
- Reload the page without losing the saved formation

The application does not require real football positions.

---

## 3.2 Players Tab

The Players tab contains two main sections.

### Left side
- Search input
- Tier filter
- Player list

Supported filters:

- All
- S
- A
- B
- C
- D

### Right side
- Selected player details
- Edit action
- Delete action

### Player management
Users must be able to:

- Add a player
- Edit a player
- Delete a player
- Upload/change a player avatar
- Search by player name
- Filter by tier

---

## 3.3 Settings

Settings should stay minimal.

Supported settings:

### General
- Default formation mode:
  - 5v5
  - 7v7

### Teams
- Team A name
- Team A color
- Team B name
- Team B color

### Guest player
- Default stamina
- Default speed
- Default strength
- Default passing
- Default finishing
- Default defense

### Balance
- Tier weight
- Stats weight

Default recommendation:

- Tier weight: 70%
- Stats weight: 30%

The total must equal 100%.

---

# 4. Player Domain Model

A player contains:

```ts
export type Rating = "S" | "A" | "B" | "C" | "D";
export type Tier = Rating;

export interface PlayerStats {
  stamina: Rating;
  speed: Rating;
  strength: Rating;
  passing: Rating;
  finishing: Rating;
  defense: Rating;
}

export interface Player {
  id: string;
  name: string;
  avatarFileId?: string;
  tier: Tier;
  stats: PlayerStats;
  createdAt: string;
  updatedAt: string;
}
```

## 4.1 Stats

The six player stats are:

- Stamina
- Speed
- Strength
- Passing
- Finishing
- Defense

All stats use:

- S
- A
- B
- C
- D

## 4.2 Tier

Tier is independent from stats.

Do not automatically calculate player tier from the six stats.

A player may have:

```text
Tier: A

Stamina: C
Speed: S
Strength: A
Passing: B
Finishing: S
Defense: D
```

This is valid.

---

# 5. Guest Players

Guest players fill empty spots when there are not enough real players for the selected formation.

Examples:

- Ngoại binh 1
- Ngoại binh 2
- Ngoại binh 3

Guest players:

- Are generated at runtime
- Are not normal Player records
- Must not be persisted into the Players sheet
- Have Tier 0
- Use default stats from Settings
- Should have a visual indicator that distinguishes them from real players

Suggested type:

```ts
export interface GuestPlayer {
  id: string;
  name: string;
  isGuest: true;
  tier: 0;
  stats: PlayerStats;
}
```

Example IDs:

```text
guest-1
guest-2
guest-3
```

---

# 6. Formation Domain Model

Suggested formation representation:

```ts
export type FormationMode = "5v5" | "7v7";
export type TeamId = "A" | "B";

export interface FormationSlot {
  team: TeamId;
  slot: number;
  playerId?: string;
  guestNumber?: number;
}

export interface Formation {
  mode: FormationMode;
  teamA: FormationSlot[];
  teamB: FormationSlot[];
  version: number;
}
```

Guest players should be represented by `guestNumber` rather than inserted into the Players database.

---

# 7. Data Storage Structure

Use one Google Spreadsheet.

Recommended sheets:

```text
Players
Formation
Settings
State
```

---

## 7.1 Players Sheet

Columns:

```text
id
name
avatar_file_id
tier
stamina
speed
strength
passing
finishing
defense
created_at
updated_at
```

---

## 7.2 Formation Sheet

Columns:

```text
mode
team
slot
player_id
guest_number
```

Example:

```text
7v7 | A | 1 | player_001 |
7v7 | A | 2 | player_004 |
7v7 | A | 3 |            | 1
7v7 | B | 1 | player_002 |
```

---

## 7.3 Settings Sheet

Recommended key/value structure:

```text
key | value
```

Examples:

```text
default_formation_mode | 7v7
team_a_name            | Team A
team_a_color           | #...
team_b_name            | Team B
team_b_color           | #...

guest_stamina           | C
guest_speed             | C
guest_strength          | C
guest_passing           | C
guest_finishing         | C
guest_defense           | C

balance_tier_weight     | 70
balance_stats_weight    | 30
```

Do not hard-code these values across UI components.

---

## 7.4 State Sheet

Recommended keys:

```text
version
editor_session_id
editor_name
lock_expires_at
```

The backend owns these values.

The frontend must never modify them directly.

---

# 8. Repository Architecture

Prefer a feature-oriented structure.

Example:

```text
src/
├── app/
│   ├── App.tsx
│   └── routes.ts
│
├── components/
│   └── shared/
│
├── features/
│   ├── formation/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── players/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   └── settings/
│       ├── components/
│       ├── hooks/
│       └── services/
│
├── repositories/
│   ├── playerRepository.ts
│   ├── formationRepository.ts
│   ├── settingsRepository.ts
│   └── editLockRepository.ts
│
├── infrastructure/
│   ├── mock/
│   └── googleAppsScript/
│
├── domain/
│   ├── player.ts
│   ├── formation.ts
│   └── settings.ts
│
├── lib/
└── main.tsx
```

Do not force this exact structure if a cleaner equivalent emerges.

The important rule is separation of concerns.

---

# 9. Data Access Rule

UI components must never directly call:

- Google Sheets
- Google Drive
- Google Apps Script endpoints

All data access must go through repository/service abstractions.

Example:

```ts
export interface PlayerRepository {
  getPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | null>;
  createPlayer(input: CreatePlayerInput): Promise<Player>;
  updatePlayer(id: string, input: UpdatePlayerInput): Promise<Player>;
  deletePlayer(id: string): Promise<void>;
}
```

Provide at least two implementations during development:

```text
MockPlayerRepository
GoogleAppsScriptPlayerRepository
```

The same principle applies to:

- FormationRepository
- SettingsRepository
- EditLockRepository

---

# 10. Backend API Design

Use Google Apps Script as a simple RPC-style backend.

Avoid introducing an unnecessary REST framework.

Possible request shape:

```json
{
  "action": "GET_PLAYERS",
  "payload": {}
}
```

Possible response shape:

```json
{
  "ok": true,
  "data": {}
}
```

Error:

```json
{
  "ok": false,
  "error": {
    "code": "EDIT_LOCKED",
    "message": "Another user is currently editing."
  }
}
```

---

## 10.1 Required Backend Actions

Implement logical actions for:

```text
GET_APP_STATE

GET_PLAYERS
CREATE_PLAYER
UPDATE_PLAYER
DELETE_PLAYER

GET_FORMATION
SAVE_FORMATION

GET_SETTINGS
UPDATE_SETTINGS

UPLOAD_AVATAR
DELETE_AVATAR

ACQUIRE_EDIT_LOCK
RENEW_EDIT_LOCK
RELEASE_EDIT_LOCK
```

Exact naming may differ, but responsibilities must remain clear.

---

# 11. Edit Concurrency Model

Everyone may view the application simultaneously.

Only one user may edit at a time.

There are two separate locking mechanisms.

---

## 11.1 Editor Lease

The editor lease controls who is allowed to use edit mode.

When a user presses Edit:

```text
Frontend
↓
ACQUIRE_EDIT_LOCK
↓
Backend checks current lease
```

If free:

```text
return editor session ID
```

If occupied:

```text
return EDIT_LOCKED
```

The UI should show something like:

```text
Nam đang chỉnh sửa.
Bạn hiện chỉ có thể xem.
```

---

## 11.2 Session ID

When an edit lock is acquired, generate a random session ID.

Example:

```text
editor_session_id = 92b43...
```

Every mutation request must include this ID.

The backend must reject writes from clients that do not own the current editor lease.

---

## 11.3 Heartbeat

The active editor periodically calls:

```text
RENEW_EDIT_LOCK
```

Recommended interval:

```text
20–30 seconds
```

Recommended lock TTL:

```text
90 seconds
```

Exact values may be constants.

If the browser closes, crashes, or loses connectivity:

```text
heartbeat stops
↓
lease expires
↓
another user can edit
```

Never create a lock that can remain permanently stuck.

---

## 11.4 LockService

Google Apps Script `LockService` must protect backend write operations.

Editor Lease and LockService solve different problems.

```text
Editor Lease
= only one human editor

LockService
= prevent concurrent backend writes
```

Typical mutation flow:

```text
request
↓
validate editor session
↓
acquire Apps Script lock
↓
validate state version
↓
perform write
↓
increment state version
↓
release Apps Script lock
```

---

# 12. Optimistic Versioning

Maintain a global application state version.

Example:

```text
version = 25
```

When the frontend loads editable data, it also receives version 25.

When saving:

```json
{
  "expectedVersion": 25
}
```

Backend checks current version.

If:

```text
currentVersion == expectedVersion
```

then:

```text
perform write
version++
```

If:

```text
currentVersion != expectedVersion
```

return:

```text
DATA_CHANGED
```

The frontend should ask the user to reload the latest state.

This protects against stale writes even if a lease edge case occurs.

---

# 13. Avatar Storage

Use Google Drive.

Recommended folder:

```text
Company Football/
└── Avatars/
```

Store only the Drive File ID in Google Sheets.

Do not store:

- base64 images in Sheet cells
- full image blobs in Sheets
- images committed to GitHub for runtime user uploads

---

## 13.1 Client Image Processing

Before upload:

- Resize image
- Max dimensions: approximately 512 × 512
- Prefer WebP
- Preserve reasonable visual quality

The exact compression implementation is flexible.

The goal is simply to avoid storing multi-megabyte phone photos for small avatars.

---

## 13.2 Avatar Replacement

When replacing an avatar:

```text
upload new avatar
↓
update avatar_file_id
↓
delete old avatar if safe
```

Do not delete the existing image before the new upload succeeds.

---

# 14. Random Formation

Random mode should:

1. Start from the available real players.
2. Determine required player count:
   - 5v5 → 10 players
   - 7v7 → 14 players
3. Generate guest players if there are not enough real players.
4. Shuffle the final list.
5. Split evenly between Team A and Team B.

No AI is required.

---

# 15. Balanced Random

Use a simple deterministic scoring model.

Recommended rating mapping:

```text
S = 5
A = 4
B = 3
C = 2
D = 1
Tier 0 = 0
```

---

## 15.1 Player Stat Score

Calculate the average of:

- stamina
- speed
- strength
- passing
- finishing
- defense

---

## 15.2 Player Strength

Recommended default weighting:

```text
Tier: 70%
Stats: 30%
```

The exact implementation should make weights configurable.

Tier should remain the dominant factor.

---

## 15.3 Team Balance Algorithm

Do not build AI or machine learning.

A simple approach is enough:

1. Build the final player pool including guest players if needed.
2. Generate multiple candidate splits.
3. Calculate Team A strength.
4. Calculate Team B strength.
5. Measure absolute difference.
6. Keep the split with the smallest difference.

For the expected small number of players, this is computationally trivial.

Do not prematurely optimize.

---

## 15.4 Balance UI

Display simple fun indicators.

Examples:

```text
Team A Power: 24.7
Team B Power: 24.5

Balance: 99%
```

Do not present the score as scientific football prediction.

Avoid:

- Expected win probability
- AI prediction
- Player performance prediction

---

# 16. Development Phases

Each phase must be completed and verified before moving to the next phase.

Do not implement later phases unless explicitly requested.

---

# Phase 1 — Project Foundation

## Goal

Create a clean working frontend foundation with domain models and mock data.

## Tasks

- Initialize React + Vite + TypeScript project.
- Configure linting.
- Configure formatting if appropriate.
- Create the basic application shell.
- Add top navigation.
- Add Formation and Players tabs.
- Add placeholder Settings entry.
- Create domain types:
  - Player
  - PlayerStats
  - Formation
  - Settings
  - GuestPlayer
- Create mock player data.
- Create repository interfaces.
- Create initial mock repository implementations.
- Do not integrate any Google service.

## Mock data

Provide approximately 15–20 realistic mock players with varied tiers and stats.

## Acceptance Criteria

- Application starts locally.
- TypeScript passes.
- Lint passes.
- Production build succeeds.
- Main application shell renders.
- Formation tab exists.
- Players tab exists.
- Mock players can be loaded through repository abstraction.
- No Google API is used.

---

# Phase 2 — Formation UI

## Goal

Create the complete formation experience using mock data.

## Tasks

- Implement 5v5 / 7v7 selector.
- Implement Team A area.
- Implement Team B area.
- Implement Unassigned Players area.
- Implement player selection.
- Implement Player Detail panel.
- Implement drag and drop.
- Allow player movement:
  - unassigned → Team A
  - unassigned → Team B
  - Team A → Team B
  - Team B → Team A
  - team → unassigned
  - slot reorder
- Add Edit/View mode UI.
- Add buttons:
  - Random
  - Balance
  - Reset
  - Save
- Buttons may use mock behavior at this phase where backend persistence is not yet available.

## Acceptance Criteria

- Both 5v5 and 7v7 render correctly.
- A player exists in only one location at a time.
- Drag/drop works.
- Selecting a player updates Player Detail.
- Team and unassigned state remains internally consistent.
- UI is usable on desktop.
- Mobile does not break layout.

---

# Phase 3 — Player Management UI

## Goal

Complete player management using mock repository storage.

## Tasks

- Implement Players list.
- Implement player search.
- Implement Tier filter.
- Implement player detail.
- Implement Add Player modal/form.
- Implement Edit Player modal/form.
- Implement Delete confirmation.
- Add avatar selection UI.
- Validate:
  - name required
  - tier required
  - all six stats required
- Keep avatar optional.

## Acceptance Criteria

- User can add a player.
- User can edit a player.
- User can delete a player.
- User can search by name.
- User can filter by tier.
- UI state updates after CRUD operations.
- Player edits are reflected in formation data where applicable.

---

# Phase 4 — Data Layer Hardening

## Goal

Ensure UI is fully separated from infrastructure before adding Google integrations.

## Tasks

- Review all feature components.
- Remove any direct infrastructure assumptions.
- Finalize:
  - PlayerRepository
  - FormationRepository
  - SettingsRepository
  - EditLockRepository
  - AvatarRepository if useful
- Add consistent error types.
- Add loading states.
- Add empty states.
- Add mutation error handling.
- Ensure mock repositories remain usable.

## Acceptance Criteria

- Feature components depend on interfaces, not Google-specific implementations.
- Mock data can still run the entire application.
- Repository implementations can be swapped without rewriting UI components.
- Build and tests pass.

---

# Phase 5 — Google Apps Script Backend Foundation

## Goal

Create backend infrastructure without yet focusing on all advanced behavior.

## Tasks

- Create Google Apps Script project source.
- Implement request routing.
- Implement standard response format.
- Implement standard error format.
- Add configuration for Spreadsheet ID.
- Add configuration for Drive avatar folder ID.
- Implement `setupDatabase()`.

`setupDatabase()` should create required sheets if missing:

- Players
- Formation
- Settings
- State

It should initialize required headers and default settings.

## Acceptance Criteria

- Apps Script Web App can respond to a basic health/state request.
- Database setup is idempotent.
- Running setup twice does not duplicate headers or corrupt data.
- Backend configuration is documented.
- No secret credentials are committed to Git.

---

# Phase 6 — Google Sheets Integration

## Goal

Replace mock persistence with Google Sheets through Apps Script.

## Tasks

Implement:

- GET_PLAYERS
- CREATE_PLAYER
- UPDATE_PLAYER
- DELETE_PLAYER
- GET_FORMATION
- SAVE_FORMATION
- GET_SETTINGS
- UPDATE_SETTINGS
- GET_APP_STATE

Create GoogleAppsScript repository implementations in frontend.

Add environment configuration:

```text
VITE_API_URL
```

## Acceptance Criteria

- Players persist after page reload.
- Player CRUD works through Apps Script.
- Formation persists after reload.
- Settings persist.
- Frontend never accesses Google Sheets directly.
- Mock repository mode can still exist for local development if useful.

---

# Phase 7 — Avatar Upload

## Goal

Store player avatars in Google Drive.

## Tasks

Frontend:

- Resize image before upload.
- Convert to WebP if practical.
- Show upload progress/loading state.
- Show upload errors.

Backend:

- Implement UPLOAD_AVATAR.
- Save image into configured Drive folder.
- Return file ID or suitable image reference.
- Implement DELETE_AVATAR.
- Safely replace old avatars.

## Acceptance Criteria

- User can upload an avatar.
- Avatar is stored in Drive.
- Only avatar file ID/reference is stored in Sheets.
- Avatar loads after page reload.
- Replacing avatar does not lose the old avatar unless new upload succeeds.

---

# Phase 8 — Edit Lease and Concurrency

## Goal

Allow unlimited viewers but only one active editor.

## Tasks

Implement:

- ACQUIRE_EDIT_LOCK
- RENEW_EDIT_LOCK
- RELEASE_EDIT_LOCK

Generate editor session ID.

Add lease TTL.

Recommended:

```text
heartbeat: 20–30 seconds
TTL: 90 seconds
```

Frontend:

- Default to View Mode.
- Edit button requests lock.
- Enter Edit Mode only after successful lock acquisition.
- Store editor session only for the active browser session.
- Renew lease while editing.
- Stop heartbeat when leaving edit mode.
- Attempt release on Save/Cancel.
- Display current editor state to other viewers.
- If lease is lost, immediately exit Edit Mode.

## Acceptance Criteria

- User A can enter Edit Mode.
- User B cannot enter Edit Mode while A owns the lease.
- User B can still view data.
- If A closes the browser, lock expires automatically.
- B can edit after expiration.
- There is no permanent stuck lock.

---

# Phase 9 — LockService and Version Protection

## Goal

Protect every write operation against race conditions and stale data.

## Tasks

For all backend mutations:

1. Validate editor session where required.
2. Acquire Apps Script LockService lock.
3. Read current state version.
4. Validate expected version.
5. Perform mutation.
6. Increment version.
7. Release lock.

Return specific errors for:

```text
EDIT_LOCKED
INVALID_EDITOR_SESSION
EDIT_LEASE_EXPIRED
DATA_CHANGED
VALIDATION_ERROR
NOT_FOUND
```

Frontend must handle these errors clearly.

## Acceptance Criteria

- Writes without a valid editor session are rejected.
- Concurrent backend writes cannot corrupt data.
- Stale writes are rejected.
- Version increases after successful mutations.
- Frontend reacts correctly when state becomes stale.

---

# Phase 10 — Guest Player Generation

## Goal

Automatically fill missing formation slots.

## Tasks

For selected mode:

```text
5v5 → 10 total
7v7 → 14 total
```

If the number of real players is insufficient:

```text
required count - real player count = number of guest players
```

Generate:

```text
Ngoại binh 1
Ngoại binh 2
...
```

Use guest default stats from Settings.

## Acceptance Criteria

- 5v5 always has enough runtime entities for 10 slots when Random/Balance is used.
- 7v7 always has enough runtime entities for 14 slots.
- Guest players are visibly distinguished.
- Guest players are never added to Players sheet.

---

# Phase 11 — Random Formation

## Goal

Implement normal random team generation.

## Tasks

- Build candidate player pool.
- Add guest players if required.
- Shuffle.
- Split equally between Team A and Team B.
- Present generated formation before/while editing.
- Save only when user explicitly saves if this matches current UX.

## Acceptance Criteria

- Team sizes are correct.
- No duplicate players.
- Guest count is correct.
- Repeated Random produces different reasonable outputs.
- Formation remains valid.

---

# Phase 12 — Balanced Random

## Goal

Generate approximately balanced teams based on Tier and fun stats.

## Tasks

- Implement rating-to-number mapping.
- Implement stat average.
- Implement configurable Tier/Stats weighting.
- Generate candidate team splits.
- Select a split minimizing team strength difference.
- Display:
  - Team A Power
  - Team B Power
  - Balance percentage

Do not use AI.

## Acceptance Criteria

- Balanced mode produces equal team sizes.
- It does not duplicate players.
- It respects guest players.
- It generally produces a lower strength difference than pure Random.
- Weights from Settings affect balance calculation.
- Algorithm has automated tests.

---

# Phase 13 — Settings

## Goal

Complete Settings UI and persistence.

## Tasks

Implement UI for:

- Default formation mode
- Team A name
- Team A color
- Team B name
- Team B color
- Guest default stats
- Tier balance weight
- Stats balance weight

Validate:

```text
tierWeight + statsWeight = 100
```

## Acceptance Criteria

- Settings persist.
- Formation uses team names/colors.
- Guest generation uses current guest defaults.
- Balanced Random uses current weights.

---

# Phase 14 — Responsive and UX Polish

## Goal

Make the MVP pleasant to use without overengineering.

## Desktop

Recommended:

```text
Main area: ~70%
Detail panel: ~30%
```

## Mobile

Stack:

```text
Main content
↓
Player detail
```

Do not spend excessive effort on sophisticated mobile drag-and-drop unless it is naturally supported.

## Tasks

- Loading states
- Empty states
- Error banners/toasts
- Confirmation for destructive actions
- Locked state
- Unsaved change handling
- Basic keyboard accessibility
- Responsive layout
- Consistent terminology

## Acceptance Criteria

- No major layout break on common desktop widths.
- Mobile remains usable for viewing.
- Important actions have feedback.
- Errors are understandable to non-technical users.

---

# Phase 15 — Testing

## Goal

Cover critical domain and concurrency behavior.

## Unit tests

At minimum:

### Player rating
- rating conversion

### Guest generation
- no guest when enough players
- correct guest count when players are missing

### Random
- correct number of players
- no duplicates

### Balance
- strength calculation
- weight calculation
- equal team sizes
- no duplicates
- guest handling

### Formation
- move player
- remove player
- prevent duplicate assignment

### State/version
- stale version rejected

## Integration-level tests where practical

- Player repository behavior
- Formation repository behavior
- Edit lock state transitions

## Acceptance Criteria

- Critical domain tests pass.
- TypeScript passes.
- Lint passes.
- Production build passes.

---

# Phase 16 — GitHub Pages Deployment

## Goal

Deploy frontend for normal internal usage.

## Tasks

- Configure Vite base path correctly for GitHub Pages.
- Configure GitHub Actions deployment workflow.
- Configure frontend API environment value.
- Document deployment.
- Verify direct page load works.
- Verify frontend reaches Apps Script backend.

## Acceptance Criteria

- Website is accessible via GitHub Pages.
- Production build assets load correctly.
- API works from production origin.
- Refreshing the site does not break.
- No credentials are exposed in repository.

---

# 17. Error Handling Requirements

Use consistent application errors.

Recommended codes:

```text
VALIDATION_ERROR
NOT_FOUND
EDIT_LOCKED
INVALID_EDITOR_SESSION
EDIT_LEASE_EXPIRED
DATA_CHANGED
UPLOAD_FAILED
STORAGE_ERROR
INTERNAL_ERROR
```

User-facing messages should be friendly.

Do not expose raw Apps Script stack traces to normal users.

During development, technical details may be logged safely.

---

# 18. Security Expectations

This is a lightweight internal tool, not a high-security system.

However:

- Never commit secrets.
- Never expose privileged Google credentials in frontend code.
- All writes go through Apps Script.
- Validate all mutation inputs server-side.
- Validate current editor session server-side.
- Never trust frontend-only locking.
- Do not allow arbitrary Drive folder/file operations from user input.
- Sanitize/validate identifiers.

If write authorization later becomes necessary, design it separately rather than silently adding a complex auth system during MVP implementation.

---

# 19. Performance Expectations

Expected usage is small:

- Tens of players
- Tens of avatar images
- Small number of concurrent users
- Infrequent edits

Prefer simple readable solutions.

Do not introduce caching infrastructure, queues, distributed locks, databases, or background workers.

Google Sheets should be accessed efficiently:

- Prefer batch range reads/writes.
- Avoid unnecessary cell-by-cell loops when simple range operations are available.
- Avoid excessive frontend polling.

---

# 20. Codex Execution Rules

Codex must follow these rules when executing this plan.

1. Read `AGENTS.md`, `docs/SPEC.md`, and this file before making changes.
2. Inspect the current repository state before implementation.
3. Implement one phase at a time.
4. Do not implement future phases unless explicitly requested.
5. Preserve completed behavior from previous phases.
6. Keep changes scoped to the active phase.
7. Do not add new infrastructure without explicit approval.
8. Do not silently change the fixed technology stack.
9. Run verification after each phase.
10. Fix regressions caused by the phase.
11. Clearly report anything intentionally deferred.
12. Keep code simple and readable.
13. Prefer domain logic that can be unit tested without React or Google APIs.
14. Do not place business logic directly inside large UI components.
15. Do not bypass repository abstractions.
16. Do not store guest players as normal players.
17. Do not derive Tier automatically from stats.
18. Do not add Position.
19. Do not add Attendance.
20. Do not add Match History.

---

# 21. Required Phase Completion Report

At the end of every phase, Codex should report:

## Completed
- Features implemented

## Files changed
- Important files created/modified

## Architecture
- Relevant decisions made

## Verification
Include exact commands and results, such as:

```text
npm test
npm run lint
npm run typecheck
npm run build
```

Only list commands that actually exist in the project.

## Deferred
- Anything deliberately left for a later phase

## Issues
- Known limitations or blockers

Codex must stop after reporting the requested phase.

---

# 22. Definition of Done for MVP

The MVP is complete only when all of the following work:

## Players
- View players
- Search players
- Filter by Tier
- Add player
- Edit player
- Delete player
- Upload/change avatar
- Player data persists

## Formation
- 5v5
- 7v7
- Team A
- Team B
- Unassigned players
- Drag/drop
- Player detail
- Reset
- Save
- Formation persists after reload

## Guest Players
- Automatically generated when there are not enough real players
- Named Ngoại binh 1, Ngoại binh 2, etc.
- Tier 0
- Configurable default stats
- Not persisted in Players

## Random
- Normal Random works

## Balance
- Balanced Random works
- Uses Tier + stats
- Tier remains primary factor
- Displays Team Power / Balance indicator

## Settings
- Formation default
- Team names/colors
- Guest defaults
- Balance weights

## Concurrency
- Multiple users can view simultaneously
- Only one user can edit
- Other viewers clearly see locked state
- Heartbeat renews lock
- Abandoned lock expires automatically
- Backend writes are protected by LockService
- Stale data writes are protected by versioning

## Storage
- Google Sheets stores structured data
- Google Drive stores avatars
- No image blobs/base64 are stored in Sheets

## Deployment
- Frontend runs on GitHub Pages
- Backend runs as Google Apps Script Web App
- No paid infrastructure is required for expected usage

## Quality
- TypeScript passes
- Lint passes
- Production build passes
- Critical domain tests pass
- No secrets committed

---

# 23. Recommended Execution Order

Run phases in this order:

```text
Phase 1  Project Foundation
↓
Phase 2  Formation UI
↓
Phase 3  Player Management UI
↓
Phase 4  Data Layer Hardening
↓
Phase 5  Apps Script Backend Foundation
↓
Phase 6  Google Sheets Integration
↓
Phase 7  Avatar Upload
↓
Phase 8  Edit Lease and Concurrency
↓
Phase 9  LockService and Version Protection
↓
Phase 10 Guest Player Generation
↓
Phase 11 Random Formation
↓
Phase 12 Balanced Random
↓
Phase 13 Settings
↓
Phase 14 Responsive / UX Polish
↓
Phase 15 Testing
↓
Phase 16 GitHub Pages Deployment
```

Do not skip ahead unless there is a concrete dependency reason.

---

# 24. Suggested First Codex Prompt

After this file, `AGENTS.md`, and `docs/SPEC.md` exist, start Codex with:

```text
Read AGENTS.md, docs/SPEC.md, and docs/IMPLEMENTATION_PLAN.md completely.

Inspect the repository state.

Implement Phase 1 only.

Do not implement any later phase.

Follow all architecture and scope constraints.

After implementation, run the relevant tests, TypeScript checks, linting, and production build.

Fix issues introduced by your changes.

Then report:
- completed work
- important files changed
- architecture decisions
- verification commands and results
- intentionally deferred work

Stop after Phase 1.
```

For later phases, replace `Phase 1` with the requested phase number.

---

# 25. Guiding Principle

This project is intentionally small.

The preferred solution is the simplest solution that:

- works reliably,
- keeps data consistent,
- remains easy to understand,
- remains free for the expected usage,
- and can be maintained without dedicated infrastructure.

Do not optimize for hypothetical large-scale usage.
