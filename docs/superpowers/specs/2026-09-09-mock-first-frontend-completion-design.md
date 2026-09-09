# Mock-First Frontend Completion Design

## Goal

Finish the user-facing football team builder and its domain behavior before
connecting any live Google data source.

## Scope

This work completes the frontend/domain portion of the product using the
existing repository interfaces and in-memory mock repositories:

- reuse `PlayerCard` for the selected player in the Players tab;
- add a working Settings tab backed by `SettingsRepository`;
- generate runtime-only guest players when a mode needs more players;
- implement Random and Balanced Random as tested domain services;
- connect generated formations to the existing free-form pitch UI;
- add mock edit-lease feedback without pretending it is backend concurrency;
- improve loading, empty, error, responsive, and accessibility feedback;
- add focused tests for domain logic and repository seams.

Google Apps Script, Google Sheets, Google Drive upload, server-side
`LockService`, backend version protection, and deployment remain deferred.

## Architecture

`App` owns the shared mock repository instances and injects repository
interfaces into feature components. Feature components coordinate loading,
selection, and user feedback; domain services own guest generation, rating,
team scoring, and formation generation. No component imports a Google API or
knows about a concrete storage implementation.

Formation state continues to store normalized free-form coordinates. Runtime
formation entities are `Player | GuestPlayer`; guests have deterministic
runtime IDs and are never passed to `PlayerRepository`.

Settings are loaded once through `SettingsRepository`, edited locally, and
saved through the same interface. Team names/colors, guest defaults, and
balance weights flow down as props rather than being duplicated in UI code.

## Behavior

- Players selection renders the existing reusable `PlayerCard`; CRUD actions
  stay attached to the selected player.
- Formation remains read-only until Edit Mode. Random, Balance, Reset, Save,
  and Cancel operate on the current draft.
- Random shuffles the final runtime pool and splits it evenly.
- Balanced Random chooses the best of deterministic candidate splits using
  tier/stat weights, then reports team power and a simple balance percentage.
- Guests are named `Ngoại binh 1`, `Ngoại binh 2`, and so on, use Tier 0 and
  settings defaults, and are visually marked.
- Settings validation requires tier/stat weights to total 100.
- The mock edit lease is used only to give the current UI an explicit locked
  state; server-side exclusivity is deferred to the real backend phases.

## Testing

Domain tests cover guest counts, rating/scoring, random uniqueness, balanced
team sizes and weights, and formation uniqueness. Component tests cover the
Players card and Settings states. Repository tests cover copy safety and
round-trip behavior. Full verification remains `npm run typecheck`,
`npm run lint`, `npm test -- --run`, and `npm run build`.

## Deferred

No Apps Script source, live API client, Sheets/Drive persistence, avatar
upload, backend lease heartbeat, LockService, or GitHub Pages deployment is
added by this design.
