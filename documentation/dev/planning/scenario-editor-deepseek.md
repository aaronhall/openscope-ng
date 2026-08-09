# Scenario Editor — Feature Plan

Status: proposal, not yet implemented
Branch: `feature/scenario-editor`
Related docs: [spawnPatternReadme.md](../../spawnPatternReadme.md)

## Goal

A **scenario** is a single JSON file that defines the simulator state: airport,
wind, active runways, time (pause/timewarp/start offset), game options, and
traffic (stochastic streams and/or exact, deterministic aircraft). Scenarios are
loadable three ways:

1. **Dev CLI** — `SCENARIO_FILE=path/to/x.json npm run dev` (primary want: smoke
   testing features by hand).
2. **Runtime** — `window.zlsa.atc.loadScenario(json)` (programmatic loading, e.g.
   the harness driving a live session).
3. **Browser tests** — per-test injection via Playwright `addInitScript`
   (parallel-safe; builds the full regression suite).

A read-only **state API** (`window.zlsa.atc.state`) exposes simulation state for
assertions; it doubles as a user-facing debug inspector for the "write and share
scenarios" story.

A visual "editor" UI (form/map for placing aircraft) is **explicitly out of
scope** for v1. The JSON format + validation + runtime loading delivers the
value; an editor is a separate workstream that can build on the same schema.

## Ground truth (what exists today)

### Boot flow

```
src/assets/scripts/client/index.js
  → new App($body)                                   (App.js)
  → fetch assets/airports/airportLoadList.json
  → pick initial airport: localStorage['atc-last-airport'] || DEFAULT_AIRPORT_ICAO ('ksea')
  → fetch {icao}.json + airlines.json + aircraft.json + guides.json
  → AppController.setupChildren(...)                 (single choke point)
  → enable(): init_pre → init → done → requestAnimationFrame(update)
```

`AppController.setupChildren` instantiation order is documented as fragile and
must not be reordered: `AirportController.init` → `NavigationLibrary.init` →
`SpawnPatternCollection.init(airportJson)` → airline/scope/aircraft controllers →
`SpawnScheduler.init` (which immediately calls `startScheduler()`) → UI/canvas/
input controllers.

### Traffic system

- Stream traffic is defined by `airportJson.spawnPatterns` (legacy openScope
  format; documented in `documentation/spawnPatternReadme.md`). The
  `SpawnPatternCollection` reads that key; `SpawnScheduler` runs spawn timers via
  `GameController.game_timeout`.
- **Known inconsistency**: four airports (wiii, ksan, kmsp, vobl) were migrated
  to a new inline `departures`/`arrivals` format that **nothing in `src/`
  consumes** — those airports currently generate zero traffic. Scenario traffic
  must use the legacy `spawnPatterns` format. Fixing the migration is a separate
  workstream.
- Pre-spawn aircraft: `trafficGenerator/buildPreSpawnAircraft.js` computes
  positions/altitudes along spawn-pattern routes.
- Single aircraft construction path:
  `AircraftController._buildAircraftProps()` →
  `_createAircraftWithInitializationProps()` → `new AircraftModel(props)`.
  `AircraftModel.parse()` accepts `{positionModel, transponderCode, airline,
  airlineCallsign, callsign, category, heading, altitude, speed, origin,
  destination}`; the constructor builds FMS state from `routeString`.

### State & control surface (already queryable)

| Concern | Access |
| --- | --- |
| Aircraft list / lookup | `AircraftController.aircraft.list`, `findAircraftByCallsign()`, `findAircraftById()`; temporarily exposed as `window.aircraftController` |
| Aircraft telemetry | `AircraftModel`: `callsign`, `relativePosition`, `altitude`, `heading`, `speed`, `groundSpeed`, `flightPhase`, `mcp`, `fms` |
| Score / events | `GameController` (module singleton): `game.score`, `game.events` (counters: `SEPARATION_LOSS`, `ARRIVAL`, …), `game_timeout`, `destroyTimers` |
| Time | `TimeKeeper` (singleton): `simulationRate` (timewarp), `setPause()`, `accumulatedDeltaTime`, `reset()` |
| Game options | `GameOptions`: **read from localStorage at module import time** (module singleton constructed when the bundle loads) |

### Test / tooling infrastructure

- Unit tests: vitest + jsdom only (`test/**/*.spec.js`). **No browser E2E
  framework and no Playwright dependency exist yet.**
- Dev server: vite (`npm run dev` → `predev` → `tools/prepare-assets.js` →
  `vite`; `publicDir: .vite-public`). The existing inline Vite plugin
  (`vite.config.mjs`, `handlebarsMarkupPlugin`) already rewrites `index.html`
  via `transformIndexHtml` — the natural injection point for scenario boot code.
- Prod: express serves the built `public/` directory.
- **No URL-param handling exists anywhere in the client.**
- No RNG seeding: stream traffic is stochastic (lodash `_random` over
  `Math.random`).

## Scenario schema (v1)

```jsonc
{
  "schemaVersion": 1,
  "meta": { "name": "smoke-two-arrivals", "description": "...", "author": "..." },

  "airport": "ksea",                        // required; overrides localStorage choice
  "wind": { "angle": 160, "speed": 8 },     // optional airport-data override
  "runway": { "arrival": "16L", "departure": "16L" },   // optional override

  "time": { "startPaused": true, "timewarp": 1, "startOffsetSeconds": 0 },

  "gameOptions": { "controlMethod": "mouse", "towerController": "SYSTEM" },

  "traffic": {
    "streams": [ /* spawnPattern-format entries; replaces airport spawnPatterns */ ],
    "aircraft": [ /* explicit deterministic aircraft */ ]
  }
}
```

Explicit aircraft entry:

```jsonc
{
  "callsign": "UAL1234",
  "airline": "ual",
  "model": "B738",
  "category": "arrival",                    // arrival | departure | overflight
  "route": "SUMMA..HAWKZ..SEA",             // routeString; feeds FMS
  "position": ["N47.52", "W122.30", "11000ft"],
  "heading": 160, "speed": 250, "altitude": 11000,
  "commands": { "16L": "cross HAWKZ A9000" }
}
```

Design rules:

- `streams` uses the documented, stable `spawnPatterns` format.
- **Omitting `streams` yields zero background traffic** (empty collection → no
  schedules, no pre-spawns). That is the deterministic baseline for tests.
- Explicit aircraft reuse the `_buildAircraftProps` machinery (aircraft-type
  lookup, transponder allocation, FMS from `routeString`) with
  scenario-supplied overrides. Required: a callsign-registry path
  (`AirlineController` has `removeFlightNumberFromList`; a reserve path must be
  added so explicit callsigns are valid and unique).

## Loading: one loader, four transports

Single `ScenarioLoader` module; one source of truth: `window.__SCENARIO__`
(an object).

| Use case | Transport |
| --- | --- |
| `npm run dev` with a file | `SCENARIO_FILE=path/to/x.json npm run dev` → vite `transformIndexHtml` (existing handlebars plugin hook) injects `<script>window.__SCENARIO__ = {...}</script>` **inline, before the deferred module bundle runs** — timing-safe, and lets `GameOptions` pick up localStorage pre-seeds |
| Runtime programmatic | `window.zlsa.atc.loadScenario(json)` — full-reset path (below) |
| Browser integration tests | Playwright `page.addInitScript` setting `window.__SCENARIO__` per test — no server changes, no port juggling, fully parallel-safe |
| User sharing | Same JSON file; `?scenario=` query param is **not** a v1 transport (async fetch races module eval) — defer, or handle inside the app where timing is controllable |

### Boot-time application

`ScenarioLoader` hooks at the `App` level:

1. `airport` wins over `localStorage['atc-last-airport']` (App checks
   `__SCENARIO__` first — no localStorage pollution; parallel E2E contexts stay
   independent).
2. Scenario `gameOptions` pre-seed localStorage keys
   (`zlsa.atc.option.<name>`, from `GameOptions.buildStorageName()`) before
   bundle eval — `GameOptions` then constructs with scenario values for free.
3. Airport JSON merged at one choke point: after `App.loadInitialAirport`
   fetches `{airport}.json`, apply `wind` / `runway` / `traffic.streams` (as
   `spawnPatterns`) / `time` before passing the object into `setupChildren`.
   Everything downstream (NavigationLibrary, SpawnPatternCollection, scheduler)
   works unchanged.
4. Explicit `aircraft` injected post-`done()` via new
   `AircraftController.injectAircraft(props)` →
   `_createAircraftWithInitializationProps()`.

### Runtime load (`loadScenario(json)`)

Reuse the `AppController.onAirportChange` teardown exactly:
`NavigationLibrary.reset` → `aircraft_remove_all` →
`radarTargetCollection.reset` → `SpawnPatternCollection.reset` →
`destroyTimers` → re-init → `startScheduler`, plus `TimeKeeper.reset()` and
re-injection of explicit aircraft. Live scenario switching becomes the same
machinery airport switching already uses.

## Assertion surface

New read-only module, `window.zlsa.atc.state`:

```js
{
  time():     { simSeconds, simulationRate, paused },
  aircraft(): [{ callsign, category, phase, lat, lon, altitude, heading,
                 speed, groundSpeed, runway, transponder }],
  aircraftByCallsign(callsign),
  score():    { score, events },        // GameController.game.*
  log():      last N UI-log / game-event entries
}
```

Test-control hooks: `window.zlsa.atc.setTimewarp(n)`, `pause()`, `unpause()`,
`step()` (optional single-frame step; needs a small TimeKeeper/App-loop hook).

## Parallelism & determinism

- **Parallel E2E**: Playwright workers, each `browser.newContext()` (incognito
  → isolated localStorage), scenario via `addInitScript`. No shared mutable
  state by construction. CI: separate workflow (`test:e2e`) since Playwright
  needs browser binaries.
- **Deterministic scenarios** = explicit `aircraft` + `streams` omitted +
  `startPaused: true`; assertions poll `state` until condition/timeout rather
  than sleeping.
- **Stream-based scenarios** stay stochastic (no RNG seeding in v1) →
  assertions use windows/tolerances or event counters (`score().events`), not
  exact positions. Seeded RNG is a possible follow-up but touches every
  `_random` call — out of scope unless required.
- Headless hardening: `speech_init()` and the rAF loop must not block in CI
  (audio no-op in scenario mode), done in chunk 11.

## Chunks (work order)

Chunks are the unit of work for implementation sessions. Each chunk is:

- **Bite-sized**: one feature surface, small diff, closable in a single session.
- **Independently testable**: ships with its own unit-test file that passes via
  `npm test` **without any later chunk being wired**. No half-finished state is
  ever left on the branch.
- **Self-contained verification**: pure logic is covered by unit tests; any
  wiring that touches the browser (vite injection, boot, runtime reset) is
  verified with a manual dev smoke (I run `npm run dev` + drive the browser
  myself, so you don't have to).

Work happens one chunk at a time; each chunk ends with its tests green and a
short report. Chunks 1–2 are the schema foundation, 3–5 the boot-time wiring,
6–8 the traffic + runtime story, 9 the assertion surface, 10–11 the E2E story,
12 the sharing polish. Everything before 10 is unit-testable in jsdom; 10–11
introduce the only new dependency (Playwright).

### Chunk 1 — Scenario schema + validation (pure)

- `src/assets/scripts/client/scenario/ScenarioModel.js`: normalize + validate a
  raw scenario object → normalized scenario, or throw with a descriptive error.
  Rules: required `airport` + `schemaVersion`; shape checks for `wind`
  (`{angle, speed}`), `runway` (`{arrival, departure}`), `time`
  (`startPaused` bool, `timewarp` 1–5, `startOffsetSeconds` ≥ 0), `gameOptions`
  (string values), `traffic.streams` (spawnPattern-shaped entries; follow the
  existing hand-rolled-validator pattern in
  `trafficGenerator/spawnPatternModelJsonValidator.js`), `traffic.aircraft`
  (required `callsign`/`airline`/`category`/`route`/`position`/`heading`/
  `speed`/`altitude`).
- `scenario.schema.json` (JSON Schema) alongside, for IDE support and the
  chunk-12 validator integration.
- Tests: `test/scenario/ScenarioModel.spec.js` (valid / invalid / missing-field
  / defaults / normalization).
- Verification: `npm test`. No app wiring.

### Chunk 2 — Vite dev transport (`SCENARIO_FILE`)

- `vite.config.mjs`: read `SCENARIO_FILE` env; the existing
  `transformIndexHtml` plugin injects an inline
  `<script>window.__SCENARIO__ = {…}</script>` **before** the module bundle when
  set. Absent env → byte-identical HTML to today.
- Testable core: `serializeScenarioForInlineScript(scenario)` helper (JSON +
  `</script>` escaping) with unit tests.
- Smoke: `SCENARIO_FILE=… npm run dev` → served HTML contains the injected
  script; without env → no injection.

### Chunk 3 — Initial airport + gameOptions from scenario (pre-boot)

- `App._getInitialAirport` consults `window.__SCENARIO__.airport` first
  (scenario wins over `localStorage['atc-last-airport']`).
- Vite plugin also emits localStorage pre-seeds for `scenario.gameOptions`
  (`zlsa.atc.option.<name>` keys, matching `GameOptions.buildStorageName()`), so
  `GameOptions` constructs with scenario values at module eval.
- Testable core (pure helpers, unit-tested): `resolveInitialAirport(scenarioAirport,
  localStorageAirport, loadList)`; `buildGameOptionStorageSeeds(gameOptions)`.
- Smoke: dev boot with scenario → airport matches scenario; settings modal
  reflects scenario gameOptions.

### Chunk 4 — Airport JSON merge at boot

- `ScenarioLoader.applyToAirportJson(airportJson, scenario)` — pure merge:
  `wind` override, `runway` override, `traffic.streams` → `airportJson.spawnPatterns`.
  No-op when scenario absent.
- Wired at the one choke point: after `App.loadInitialAirport` fetches the
  airport JSON, before `setupChildren`. Nothing downstream changes.
- Tests: merge unit tests (override present, absent scenario no-op,
  streams→spawnPatterns).
- Smoke: dev boot with streams → traffic spawns as specified.

### Chunk 5 — Time controls (startPaused / timewarp / startOffsetSeconds)

- Small controller wrapping `TimeKeeper` (singleton): apply
  `scenario.time` — `setPause`, `updateSimulationRate`, and a start-time offset
  via a new small `TimeKeeper` API (`accumulatedDeltaTime` is getter-only today;
  add e.g. `offsetSimulationTime(seconds)`); applied at boot post-`done()` and
  on runtime load.
- Tests: `test/scenario/` — pause state, timewarp clamp (1–5), offset applied;
  TimeKeeper is already jsdom-testable (`test/engine/TimeKeeper.spec.js`).
- Smoke: dev boot with `startPaused: true` → sim paused; `timewarp: 5` → fast.

### Chunk 6 — `injectAircraft` + callsign registry

- `AircraftController.injectAircraft(scenarioAircraftEntry)`: maps an explicit
  entry to AircraftModel init props (reusing the `_buildAircraftProps` internals:
  aircraft-type lookup, transponder allocation, `routeString` → FMS) and creates
  via `_createAircraftWithInitializationProps()`. Explicit
  `callsign`/`position`/`heading`/`speed`/`altitude`/`model` override generated
  values.
- Pure mapper extracted for tests:
  `buildAircraftPropsFromScenarioEntry(entry, { airlineController,
  aircraftTypeDefinitionCollection, airport })` — testable with existing mocks
  (`test/aircraft/_mocks/`, `test/airline/_mocks/`, fixtures).
- Callsign registry: `AirlineController.reserveFlightNumber(airlineId,
  flightNumber)` — reject if `_isActiveFlightNumber`, else
  `airlineModel.addFlightNumberToInUse()`. Removal already flows through
  `aircraft_remove` → `removeFlightNumberFromList`.
- Tests: inject arrival/departure → assert model telemetry (position, heading,
  altitude, speed, category); duplicate callsign rejected; transponder
  uniqueness.
- Verification: `npm test`.

### Chunk 7 — Explicit aircraft at boot

- Wire `scenario.traffic.aircraft` → `injectAircraft` post-`done()`.
  Orchestrator `ScenarioLoader.applyExplicitAircraft(aircraftController,
  scenario)`.
- Tests: orchestrator with a mocked aircraft controller (calls inject in order,
  empty list → no-op).
- Smoke: dev boot with an aircraft list → aircraft appear on scope at the
  specified positions.

### Chunk 8 — Runtime `loadScenario(json)`

- `window.zlsa.atc.loadScenario(json)` → teardown reusing the
  `AppController.onAirportChange` reset steps (`NavigationLibrary.reset` →
  `aircraft_remove_all` → `radarTargetCollection.reset` →
  `SpawnPatternCollection.reset` → `destroyTimers` → re-init →
  `startScheduler`) + `TimeKeeper.reset()` + re-apply chunks 3, 4, 5, 7.
- Tests: orchestration with mocked controllers — reset calls happen in order;
  state is rebuilt.
- Smoke: `loadScenario({...})` in the dev console swaps the session live.

### Chunk 9 — State API

- `window.zlsa.atc.state`: `time()`, `aircraft()`, `aircraftByCallsign()`,
  `score()`, `log()`; control hooks `setTimewarp(n)`, `pause()`, `unpause()`,
  `step()`.
- Tests: with mocked controllers/models + fixture aircraft; snapshots match
  ground-truth model fields.
- Smoke: console assertions against `state` in dev.

### Chunk 10 — Playwright harness + first E2E spec

- Add `@playwright/test` devDependency; `playwright.config.js` (vite dev
  `webServer`); `test:e2e/` specs; `npm run test:e2e` script.
- Scenarios injected per-test via `page.addInitScript` setting
  `window.__SCENARIO__` — no server changes, parallel-safe by construction.
- First spec: airport-only scenario boots; assert via
  `page.evaluate(() => window.zlsa.atc.state.time())`.
- Verification: `npm run test:e2e` green locally.

### Chunk 11 — Parallel workers + CI + headless hardening

- Playwright `workers` config; GitHub Actions workflow (separate job, headless,
  browser install step).
- Headless hardening: `speech_init()` no-op in scenario/test mode; rAF loop
  must not block CI.
- Verification: local `npm run test:e2e -- --workers=4`; CI job green.

### Chunk 12 — Validator, docs, curated scenarios

- Scenario schema wired into the `@openscope/validator` story (`npm run
  validator` validates `scenarios/`).
- `documentation/scenario-format.md` + loading docs.
- `scenarios/` directory: curated fixtures (empty deterministic, two-arrivals,
  departure-flow), each validator-clean.

Acceptance: a contributor can write, validate, and share a scenario using only
the docs; CI validates scenario fixtures.

## Chunk dependency map

```
 1 schema/validation ─┐
 2 vite transport ────┼─→ 3 pre-boot (airport/options) ─→ 4 airport merge ─→ 5 time
                      │
 6 injectAircraft/registry ─→ 7 explicit aircraft at boot ─→ 8 loadScenario(runtime)
                                                              └─→ 9 state API
 10 Playwright harness (needs 3+7 for meaningful specs) ─→ 11 CI/parallel
 12 validator + docs + fixtures (needs 1)
```

## Decisions needed

1. **Editor UI scope**: recommended out of scope for v1 (schema-first). Confirm.
2. **Stream traffic format**: scenarios use legacy `spawnPatterns` format; the
   half-migrated `departures`/`arrivals` format is dead code and a separate fix.
   Confirm.
3. **E2E framework**: Playwright is the default (parallel workers,
   `addInitScript`, no server changes). Confirm before Phase 4 pulls in the
   dependency.
4. **Determinism bar**: explicit-aircraft-only is bit-exact; stream-based
   scenarios are tolerance-based unless seeded RNG is added (larger blast
   radius). Decide which bar the full suite needs.

## Risks

- **GameOptions import-time localStorage read**: any boot-time scenario option
  must be applied via pre-bundle inline script or `setOptionByName` after boot;
  the inline-script transport is what makes this safe.
- **`setupChildren` instantiation order fragility**: scenario merging must not
  reorder it; the merge point is the airport-JSON object before it reaches
  `setupChildren`.
- **Callsign uniqueness**: explicit callsigns must flow through the flight
  number registry or strips/commands misbehave.
- **Stochastic streams**: without RNG seeding, exact-position assertions are
  only possible with explicit aircraft.
- **CI weight**: Playwright browser binaries belong in a separate workflow.
