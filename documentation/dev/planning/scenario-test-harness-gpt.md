# Scenario Test Harness — Feature Plan

Status: proposal, not yet implemented
Branch: `feature/scenario-editor`
Related docs: [spawnPatternReadme.md](../../spawnPatternReadme.md)

## Goal

A **scenario** is a validated JSON document that describes a simulator session:

- airport;
- wind and active-runway overrides;
- game options;
- initial time state;
- stochastic traffic streams and/or explicit aircraft.

The first deliverable is a **scenario test harness**, not a visual editor. Scenarios must support:

1. **Dev CLI** — `SCENARIO_FILE=path/to/x.json npm run dev`;
2. **Runtime loading** — `await window.zlsa.atc.loadScenario(json)`;
3. **Browser tests** — Playwright `addInitScript` injection per test;
4. **Inspection** — read-only `window.zlsa.atc.state` snapshots.

A visual form/map editor is out of scope for v1. The schema, validation, boot transport, runtime reset path, and assertion surface are the reusable foundation for a later editor.

## Ground truth

### Boot flow

```text
src/assets/scripts/client/index.js
  → new App($body)                                (App.js)
  → fetch assets/airports/airportLoadList.json
  → select initial airport                         (App._getInitialAirport)
  → fetch {icao}.json, airlines.json, aircraft.json, guides.json
  → AppController.setupChildren(...)
  → enable(): init_pre → init → done
  → App.done() schedules the first requestAnimationFrame
```

`AppController.setupChildren` has a fragile construction order. Preserve it:

```text
AirportController.init
→ NavigationLibrary.init
→ SpawnPatternCollection.init
→ AirlineController / ScopeModel / AircraftController / ScoreController
→ SpawnScheduler.init (starts schedules immediately)
→ UI / canvas / input controllers
```

Scenario boot code must merge airport data before `setupChildren`, and must apply time configuration before `SpawnScheduler.init` creates timers.

### Traffic

- Airport stream traffic is currently read from `airportJson.spawnPatterns`.
- `SpawnPatternCollection` builds models from that field.
- `SpawnScheduler` creates `GameController.game_timeout` timers and pre-spawns aircraft.
- The documented legacy spawn-pattern shape remains the v1 scenario stream format.
- `wiii`, `ksan`, `kmsp`, and `vobl` currently contain newer `departures`/`arrivals` data that no client code consumes. Migrating those airports is separate work.
- There is no seeded RNG. Stream scenarios remain stochastic in v1.

### Existing aircraft construction

The only aircraft construction path is:

```text
AircraftController._buildAircraftProps()
→ AircraftController._createAircraftWithInitializationProps()
→ new AircraftModel(props)
```

`AircraftModel` requires more than the public `parse()` fields. Its constructor creates an `Fms` before `parse()` runs, so explicit aircraft mapping must provide valid:

- `routeString`;
- `origin` and `destination` strings;
- `category`;
- `altitude`;
- `model` (`AircraftTypeDefinitionModel`).

`AircraftModel.callsign` is derived as `airlineId + flightNumber`. A scenario's public callsign is therefore normalized into an airline prefix plus flight-number portion before model construction.

Headings inside the model are radians. Scenario headings use degrees and are converted by the mapper.

### Options and time

- `GameController` is a module singleton.
- `GameOptions` reads localStorage while that singleton is constructed during module evaluation.
- Boot-time scenario options must therefore be pre-seeded before the application module evaluates.
- `TimeKeeper` starts paused, but `GameController.complete()` unpauses it during the first frame.
- `SpawnScheduler.init()` immediately schedules timers.
- `TimeKeeper.reset()` resets elapsed simulation time, pause state, and simulation rate.

### Runtime switching

`AppController.onAirportChange()` resets several airport-specific collections, but it is not by itself a complete scenario loader. In particular:

- cached `AirportModel` instances ignore a new JSON payload once loaded;
- the existing callback does not reset `TimeKeeper`;
- score/event reset currently occurs through airport-model switching behavior;
- the callback assumes airport selection and hydration have already happened.

Runtime scenario loading requires a dedicated asynchronous orchestration path that can hydrate both new and cached airports.

### Test infrastructure

- Unit tests use Vitest and jsdom (`test/**/*.spec.js`).
- No Playwright dependency currently exists.
- Vite uses `transformIndexHtml` in `vite.config.mjs` and serves `.vite-public`.
- `npm run dev` runs `prepare-assets` before Vite.
- No URL scenario transport exists and query-parameter loading is out of scope for v1.

## Scenario schema v1

```jsonc
{
  "schemaVersion": 1,
  "meta": {
    "name": "smoke-two-arrivals",
    "description": "Two paused arrivals for a harness test",
    "author": "..."
  },

  "airport": "ksea",
  "wind": { "angle": 160, "speed": 8 },
  "runway": { "arrival": "16L", "departure": "16L" },

  "time": {
    "startPaused": true,
    "timewarp": 1,
    "startOffsetSeconds": 0
  },

  "gameOptions": {
    "controlMethod": "classic",
    "towerController": "SYSTEM"
  },

  "traffic": {
    "streams": [],
    "aircraft": []
  }
}
```

### Defaults and replacement semantics

- `schemaVersion` must equal `1`.
- `airport` is required and is normalized to lowercase.
- `traffic` is optional.
- If `traffic` is omitted, the airport's normal `spawnPatterns` remain active.
- If `traffic` is present, `streams` defaults to `[]` and **replaces** the airport's `spawnPatterns`. This makes `traffic: { "aircraft": [...] }` explicit-aircraft-only.
- `traffic.streams` entries use the legacy `spawnPatterns` shape without reinterpretation.
- `gameOptions` values are strings because that is how `GameOptions` stores them in localStorage.
- `timewarp` must be a number from `1` through `5`.
- `startOffsetSeconds` must be a finite number greater than or equal to zero.
- `wind.angle` is degrees; `wind.speed` is knots.
- Runway names are normalized to uppercase and map to the airport JSON fields `arrivalRunway` and `departureRunway`.

### Explicit aircraft

The public scenario format uses a complete callsign and user-facing degree headings:

```jsonc
{
  "callsign": "UAL1234",
  "airline": "ual",
  "model": "B738",
  "category": "arrival",
  "origin": "KDEN",
  "destination": "KSEA",
  "route": "SUMMA..HAWKZ..KSEA",
  "position": ["N47.52", "W122.30", "11000ft"],
  "heading": 160,
  "speed": 250,
  "altitude": 11000,
  "transponder": "4271",
  "commands": { "16L": "cross HAWKZ A9000" }
}
```

Required fields:

- `callsign`: full callsign, normalized uppercase;
- `airline`: airline ICAO identifier;
- `model`: aircraft ICAO type, such as `B738`;
- `category`: `arrival`, `departure`, or `overflight`;
- `origin` and `destination`: strings, possibly empty only where the existing FMS permits it;
- `route`: valid route string for the airport's navigation data;
- `position`: two or three coordinate elements accepted by `DynamicPositionModel`;
- `heading`: degrees;
- `speed`: knots;
- `altitude`: feet MSL.

Optional fields:

- `transponder`: four-digit code. If omitted, the controller generates a unique code;
- `commands`: runway-keyed command strings.

Mapper invariants:

1. The callsign must begin with the supplied airline ICAO prefix.
2. The mapper strips the airline prefix and passes the remaining flight number to `AircraftModel`.
3. The mapper converts heading degrees to radians.
4. The mapper converts `position` into a `DynamicPositionModel` relative to the current airport.
5. The mapper resolves `model` through `AircraftTypeDefinitionCollection.findAircraftTypeDefinitionModelByIcao()`.
6. Arrival `destination` must equal the scenario airport ICAO so the FMS gets an arrival runway.
7. Departure `origin` must equal the scenario airport ICAO so the FMS gets a departure runway.
8. Callsigns and transponder codes must be unique within the active session.
9. The separate `altitude` field is authoritative for aircraft telemetry; the optional position elevation is coordinate metadata and must either match or be rejected during validation.

The mapper must reject malformed or semantically incompatible aircraft before mutating controller state.

## Loading architecture

Use one `ScenarioLoader`/`ScenarioSession` implementation with three bootstrap/runtime transports:

| Use case | Transport |
| --- | --- |
| Dev file | Vite reads `SCENARIO_FILE`, validates JSON, and emits a pre-bundle bootstrap script |
| Browser test | Playwright `addInitScript` sets the scenario and the same localStorage option seeds |
| Runtime | `window.zlsa.atc.loadScenario(json)` validates, hydrates, resets, and returns a Promise |

The shared bootstrap contract is:

```js
window.__SCENARIO__ = normalizedScenario;
// pre-seed zlsa.atc.option.* keys before module evaluation
```

The Vite script must safely serialize JSON, including escaping `</script` sequences. The Playwright fixture must perform equivalent option seeding because application code cannot seed options after `GameController` has evaluated.

`window.__SCENARIO__` is the boot input, not a mutable live configuration. Runtime loading updates the active session through the loader and does not depend on mutating the original object.

## Boot application order

### Pre-module bootstrap

Before the deferred application module runs:

1. Validate/normalize the scenario in the transport process.
2. Set `window.__SCENARIO__`.
3. Seed `GameOptions` localStorage keys.

### Airport selection and merge

`App._getInitialAirport()` must select the scenario airport before localStorage and default fallback. An invalid scenario airport must produce a scenario error rather than silently falling back to `ksea`.

After the airport JSON is loaded and before `AppController.setupChildren()`:

1. clone the airport JSON;
2. apply wind override;
3. map runway override to `arrivalRunway`/`departureRunway`;
4. if `traffic` exists, replace `spawnPatterns` with normalized `traffic.streams`;
5. retain the merged object as the boot airport payload.

### Time ordering

Time configuration has two phases:

1. **Before child setup:** apply simulation rate and start offset so scheduler timers are created against the configured simulation clock.
2. **Before the first animation frame:** apply final paused/unpaused state, because `GameController.complete()` unpauses during the first frame.

Explicit aircraft must be injected before the first animation frame as well. The App boot hook must schedule rAF only after scenario finalization completes.

## Runtime `loadScenario(json)`

Signature:

```js
await window.zlsa.atc.loadScenario(json);
```

The Promise resolves only after the new airport, traffic, time state, options, explicit aircraft, and state API are ready. It rejects validation, airport-load, hydration, or aircraft-injection errors without leaving a partially applied scenario.

Runtime loading is serialized. A second load waits for or replaces the first according to a documented policy; the initial implementation should reject concurrent loads rather than interleave resets.

### Runtime sequence

1. Normalize and validate the complete scenario.
2. Pause the update loop.
3. Destroy game timers.
4. Remove active aircraft through `aircraft_remove_all()` so runway queues, callsign registry, transponders, conflicts, strips, and radar targets are cleaned up.
5. Reset radar targets, spawn-pattern collection, navigation library, airline session state, score, and event counters.
6. Fetch or clone the target airport JSON.
7. Apply scenario airport overrides.
8. Hydrate the target `AirportModel` even when it was previously loaded; do not route a merged payload through the current cached-airport no-op path.
9. Initialize navigation and spawn patterns.
10. Reset `TimeKeeper`, apply offset and simulation rate, and start the scheduler.
11. Apply runtime game options with `GameOptions.setOptionByName()`.
12. Inject explicit aircraft in scenario order.
13. Trigger the normal airport-change/UI refresh event after the model is coherent.
14. Apply final pause state and resume the update loop if appropriate.
15. Resolve with a snapshot of the active scenario/state.

The reset implementation should be a new orchestrator shared by initial scenario boot and runtime loading where possible. It must not duplicate only a subset of `AppController.onAirportChange()` behavior.

## Assertion and control surface

Expose:

```js
window.zlsa.atc.state = {
  time(),
  aircraft(),
  aircraftByCallsign(callsign),
  score(),
  log(limit)
};
```

Every method returns a snapshot, not a live model or mutable controller collection.

### Snapshot contract

```js
state.time() === {
  simSeconds,       // TimeKeeper.accumulatedDeltaTime
  simulationRate,   // 1..5
  paused            // TimeKeeper.isPaused, excluding browser focus state
}
```

```js
state.aircraft() === [{
  id,
  callsign,
  category,
  phase,
  lat,
  lon,
  altitude,         // feet MSL
  heading,          // degrees in the public API
  speed,            // knots IAS
  groundSpeed,      // knots
  runway,           // runway name or null
  transponder
}]
```

The implementation should derive GPS coordinates from `positionModel.gps`, phase from `flightPhase`, and runway from the category-specific FMS runway model. Missing runway values are `null`, not exceptions.

```js
state.score() === {
  score,
  events
}
```

`events` is a defensive copy of the game-event counters.

`state.log(limit)` reads from a bounded structured ring buffer populated by UI-log and game-event instrumentation. DOM inspection is not the source of truth because UI entries expire and are removed.

Control hooks:

```js
await window.zlsa.atc.setTimewarp(n);
await window.zlsa.atc.pause();
await window.zlsa.atc.unpause();
await window.zlsa.atc.step();
```

`step()` advances exactly one application update while paused and does not start an uncontrolled rAF loop. All controls validate inputs and return the resulting time snapshot.

## Determinism policy

### Deterministic scenarios

Use:

```json
{
  "traffic": { "streams": [], "aircraft": [...] },
  "time": { "startPaused": true, "timewarp": 1, "startOffsetSeconds": 0 }
}
```

These scenarios are deterministic for asserted simulation fields. They are not promised to be byte-identical because incidental identifiers and generated pilot voice/transponder values remain random unless explicitly supplied.

### Stream scenarios

Stream traffic remains stochastic in v1. Tests must assert event counts, existence, and bounded tolerances rather than exact aircraft positions. Seeded RNG is out of scope until all relevant random sources have a controlled injection point.

### Browser isolation

Each Playwright test uses its own `browser.newContext()`. Scenario objects and localStorage are injected per context. The Vite server may be shared; mutable simulator state is page-local.

## Chunks

Each chunk must leave `npm test` green. Browser behavior is verified with the listed smoke scenario; project-wide validation is run only after the final wiring is complete.

### Chunk 1 — Schema and validation

- Add `src/assets/scripts/client/scenario/ScenarioModel.js`.
- Normalize ICAOs, runway names, model/callsign casing, defaults, and public heading units.
- Validate conditional aircraft invariants, traffic replacement semantics, and finite numeric ranges.
- Add `scenario.schema.json` for editor/IDE support.
- Add `test/scenario/ScenarioModel.spec.js` covering valid, invalid, missing-field, default, normalization, callsign, route, and category cases.

### Chunk 2 — Bootstrap serialization

- Add a pure `serializeScenarioBootstrap(scenario)` helper.
- Escape JSON safely for an inline script, including `</script`.
- Add tests for serialization and option seed generation.
- No app wiring yet.

### Chunk 3 — Vite `SCENARIO_FILE` transport

- Extend the existing `transformIndexHtml` plugin to read `SCENARIO_FILE`.
- Validate before emitting HTML.
- Emit scenario and localStorage option seeds before the module script.
- Without `SCENARIO_FILE`, preserve current generated markup behavior.
- Smoke-test both configured and absent transports.

### Chunk 4 — Scenario airport selection and merge

- Add `resolveInitialAirport(scenarioAirport, localStorageAirport, loadList)`.
- Make scenario airport selection win over localStorage.
- Add pure airport merge logic for wind, runway, and traffic replacement.
- Ensure the merge clones input and does not mutate cached source JSON.
- Wire the merge before `AppController.setupChildren()`.

### Chunk 5 — Pre-scheduler time configuration

- Add a small TimeKeeper scenario adapter.
- Add a controlled offset API rather than mutating the getter-only accumulated time property.
- Apply offset/rate before scheduler initialization.
- Apply final pause state before the first rAF.
- Add tests for reset, offset, pause, and rate boundaries.

### Chunk 6 — Callsign registry and explicit-aircraft mapper

- Add `AirlineController.reserveFlightNumber()` with duplicate rejection.
- Add `AircraftController.injectAircraft()`.
- Add a pure mapper from public scenario aircraft to initialization props.
- Resolve aircraft model by ICAO, convert heading degrees to radians, build position model, normalize callsign, and allocate/check transponders.
- Reject invalid origin/destination/category combinations before construction.
- Test arrival, departure, overflight, duplicate callsign, duplicate transponder, invalid route, and unit conversion behavior.

### Chunk 7 — Explicit aircraft boot injection

- Add a boot-finalization hook that injects scenario aircraft before the first animation frame.
- Ensure `startPaused` cannot be undone by `GameController.complete()`.
- Test injection ordering and empty lists.
- Smoke-test an explicit-aircraft-only scenario.

### Chunk 8 — Runtime scenario session

- Add `window.zlsa.atc.loadScenario()` returning a Promise.
- Implement serialized full reset and cached-airport hydration.
- Reset score/events and all session registries.
- Reapply options, time, streams, and explicit aircraft.
- Test orchestration order, rejection behavior, same-airport reload, different-airport reload, and concurrent-load policy.
- Smoke-test live scenario replacement.

### Chunk 9 — State snapshots and event buffer

- Add `window.zlsa.atc.state`.
- Add defensive aircraft/time/score snapshots with documented units and nullability.
- Add bounded structured log/event history.
- Add `setTimewarp`, `pause`, `unpause`, and deterministic `step` controls.
- Test snapshot isolation, missing runway values, log limits, reset behavior, and step semantics.

### Chunk 10 — Playwright harness

- Add `@playwright/test` and the `test:e2e` script.
- Add `playwright.config.js` with Vite `webServer` configuration.
- Add a test fixture that injects both `window.__SCENARIO__` and option localStorage seeds.
- Add an airport-only boot test and an explicit-aircraft state assertion.

### Chunk 11 — Parallel workers and headless CI

- Configure Playwright workers and context isolation.
- Add a separate CI job with browser installation.
- Verify speech APIs are harmless when unavailable.
- Verify paused pages do not advance and `step()` advances exactly one update.
- Run the E2E suite with multiple workers.

### Chunk 12 — Validator integration and fixtures

- Integrate `scenario.schema.json` with the repository validator workflow.
- Add `scenarios/` fixtures:
  - empty deterministic session;
  - two explicit arrivals;
  - departure flow;
  - one stream-based tolerance scenario.
- Add contributor documentation covering schema, units, validation, CLI loading, runtime loading, and test injection.
- Update both pull-request and protected-branch workflows so fixtures are validated in CI.

## Dependency map

```text
1 schema/validation ─→ 2 bootstrap serialization ─→ 3 Vite transport
                                                     └→ 4 airport merge
                                                          └→ 5 time ordering

1 ─→ 6 explicit mapper ─→ 7 boot injection ─→ 8 runtime session ─→ 9 state API

4 + 7 + 9 ─→ 10 Playwright ─→ 11 parallel CI
1 ────────────────────────────→ 12 validator/docs/fixtures
```

## Risks and mitigations

- **Import-time options:** seed localStorage before module evaluation in both Vite and Playwright transports.
- **First-frame unpause:** finalize scenario state before `App.done()` schedules rAF.
- **Scheduler timing:** apply offset before scheduler initialization; never shift elapsed time after timers exist without rebasing them.
- **Cached airports:** add an explicit hydration path; do not depend on `AirportModel.load()` for already-loaded models.
- **Callsign representation:** normalize public full callsigns into the existing airline-plus-flight-number model and reserve the internal flight number.
- **FMS validity:** require category-compatible origin/destination and route data before constructing an aircraft.
- **State mutation:** return snapshots and copies, not live arrays or models.
- **Log retention:** add a bounded structured buffer; do not scrape expiring DOM nodes.
- **Stochastic streams:** use tolerance/event assertions until RNG injection is designed.
- **CI weight:** install Playwright browsers in a separate workflow/job.
