# OpenScope JFK 13s — Architecture

This is a working document for agents and engineers ramping up on this project.
It describes the codebase as it exists, what was added for the VOR 13L approach,
and where the rough edges are.

The project is OpenScope NG (an open-source HTML5 ATC simulator), which is a
fork of the original (now dormant) OpenScope
(https://github.com/openscope/openscope). The original source is in
`openscope-ng/`. This file is intentionally opinionated about what matters.

## Roadmap

- Full voice support via FOSS STT/TTS and/or provider
- Live traffic, enhanced traffic generations (fly overs, VFR, flight following,
  heli traffic, military traffic)
- Full non-precision approach and visual approach support; model complex
  instrument approaches (e.g. VOR DME arcs, circle to land); better approach
  rejection behavior; go arounds, published missed definitions
- Update existing airspaces with current SIDs, STARs and approaches; updated
  video maps; expand satellite airports with traffic; tool to automatically
  update and generate new airspaces from public data
- Simulate TA/RA behavior; better conflict alerts; model real world separation
  requirements
- Expanded and enhanced aircraft (model performance charactaristics;
  realistically model airlines and fleets)
- Realistically model real-world traffic across all airports
- Better weather simulation; predefined scenarios and live weather
- Ability to simulate runway configuration changes in-game
- Realistic STARS terminal
- Save files
* Upgrade/modernize dev tooling; audit and fix supply chain security issues
- Incremental Typescript migration
- Enhanced live, in-game regression test suite

## TL;DR

- **OpenScope** is a JS ATC sim. Vanilla ES6, jQuery, lodash, gulp build, ava
  tests. Canvas-rendered scope, real aircraft models, real FAA-style procedures.
- **JFK 13s** is a runway configuration: 13L/13R active for arrivals, 31L/31R
  closed. The 13s video map is one of seven in the airport config.
- **VOR 13L** is the VOR approach to runway 13L. The work here adds the
  algorithm, the command (`ca vor 13l`), and the airport fork. **The feature is
  not finished end-to-end** — see "State of the VOR 13 work" below.

## Project layout

```
openscope-jfk-13s/
├── ARCHITECTURE.md                    ← you are here
├── ILS_REGRESSION.md                  ← bug report for the broken `ca` command
├── VOR_13s.svg / .png                ← the FAA approach plate
├── non-precision-approaches-plan.md   ← original design doc
├── apply-vor-13-diff.sh               ← the script that applied my changes
└── openscope-ng/                      ← the OpenScope source
    ├── assets/
    │   ├── airports/                  ← JSON airport configs (incl. kjfk-13s.json)
    │   ├── scripts/                   ← runtime scripts (output of build)
    │   ├── style/                     ← LESS
    │   └── templates/                 ← HTML templates
    ├── public/                        ← build output
    ├── src/                           ← source code
    │   └── assets/scripts/client/
    │       ├── App.js                 ← top-level app
    │       ├── index.js               ← entry point (imports App, instantiates)
    │       ├── aircraft/              ← aircraft simulation
    │       ├── airport/               ← airport model + JSON loader
    │       ├── commands/              ← input parsing
    │       ├── navigationLibrary/     ← fixes, airways, holds, procedures
    │       ├── scope/                 ← radar scope + canvas rendering
    │       ├── trafficGenerator/      ← spawning aircraft
    │       ├── ui/                    ← chrome (menus, dialogs, settings)
    │       └── lib/                   ← EventBus, EventModel
    └── test/                          ← ava tests
```

## Core architecture: the simulation loop

OpenScope runs a `requestAnimationFrame` loop. Each tick, for every aircraft, it
calls `AircraftModel.update()`. That update reads MCP modes, asks the FMS for
the active-leg state, and populates a `target` object
(`{ altitude, heading, speed, turn, ... }`). The physics module then moves the
aircraft toward that target.

```
                ┌────────────────────────────────┐
                │       AircraftModel            │
                │                                │
   input ──────▶│  update() per tick:            │
   (commands)   │   1. mcp.update()              │
                │   2. pilot.update()            │──────▶ physics ───▶ canvas
                │   3. fms.update()              │
                │   4. _target = compute()       │
                │                                │
                │  _pilot: Pilot                 │
                │  _mcp: ModeController          │
                │  _fms: Fms                     │
                └────────────────────────────────┘
```

**Three things control an aircraft's behavior:**

1. **MCP (Mode Control Panel)** — altitude mode, heading mode, speed mode.
   `HOLD` uses a field value literally. `VNAV` reads altitude restrictions from
   the FMS route and plans a descent. `APPROACH` (altitude) is the ILS
   glideslope capture. `LNAV` (heading) follows the FMS active leg. See
   `aircraft/ModeControl/ModeController.js`.

2. **FMS (Flight Management System)** — owns the route. Parses route strings
   like `SIE.CAMRN4..DIXIE..DIXIE6.KJFK31R` into legs and waypoints. Each
   waypoint can have restrictions: `@` hold, `^` fly-over, `A70+`/`A70-`/`A70`
   altitude, `S210` speed, `#220` heading. See
   `aircraft/FlightManagementSystem/Fms.js`.

3. **Pilot** — translates ATC-speak into MCP/FMS state changes. The controller
   only talks to the Pilot. See `aircraft/Pilot/Pilot.js`.

**Where commands live:** `InputController` parses user keystrokes via
`AircraftCommandMap` → `AircraftCommander` → `aircraft.pilot.<method>`. The
Pilot is the only object the commander talks to.

## The ILS approach (read this first)

The ILS approach is the only approach type that's fully implemented and is the
template for any new approach type. Read `aircraft/Pilot/Pilot.js` around line
760 — `conductInstrumentApproach` is the entry point.

The full flow for an ILS clearance:

1. **Command parser** matches `i 13l` (alias for `ca ils 13l`) →
   `AircraftCommander.runIls(aircraft, ['ils', '13l'])`.
2. **AircraftCommander** calls
   `aircraft.pilot.conductInstrumentApproach(aircraft, 'ils', runwayModel)`.
3. **Pilot** (~13 lines) does the work:
   - Refuse if runway doesn't exist
   - Refuse if MCP altitude below minimum glideslope intercept
   - Set MCP nav1 datum to runway position, course to runway heading
   - Set MCP glideslope angle and altitude mode `APPROACH`
   - Cancel any active hold
   - Set `arrivalRunwayModel` on the FMS
   - Set `pilot.hasApproachClearance = true`

**Known TODOs in the ILS code (do not fix without reading the comments):**

- The aircraft starts descending the moment clearance is issued, even if 20 nm
  from the localizer. Comment at Pilot.js:749-751 says altitude mode should not
  be set to `APPROACH` until established.
- `._interceptCourse()` always returns true. No actual intercept validation at
  Pilot.js:794.

## The command surface

Commands are parsed in this chain:

```
InputController (key handler)
    → ParsedCommand (tokenize + validate)
        → AircraftCommandMap.lookup(alias) → { functionName, ... }
            → AircraftCommander[functionName](aircraft, parsedArgs)
                → aircraft.pilot.<method>()
```

**The map is in** `commands/aircraftCommand/aircraftCommandMap.js`. Each entry
is `{ aliases, functionName, isSystemCommand }`. `aliases` is an array; the map
is keyed by the first alias (lowercased).

**The parsers are in** `commands/parsers/argumentParsers.js`. Each parser takes
the raw args array and returns a normalized form. The command map references
parsers by name (string), and the commander looks them up at runtime.

**To add a new command:**

1. Add a parser to `argumentParsers.js` (e.g.
   `export const caParser = (args) => args`).
2. Add a map entry to `aircraftCommandMap.js` (e.g.
   `clearedApproach: { aliases: ['ca', 'clearedApproach'], functionName: 'runApproach', isSystemCommand: false }`).
3. Add the method to `AircraftCommander` (e.g.
   `runApproach(aircraft, data) { ... }`).
4. Add the method to `Pilot` (e.g. `conductNonPrecisionApproach(...)`).

## The FMS / route system

A route is a string of fix names separated by `.` (direct) or `..` (airway
lookup). Examples:

- `KJFK..DIXIE..CAMRN4.SIE` — depart KJFK, airway to DIXIE, airway to CAMRN4,
  direct to SIE
- `CRI..DMYHL` — direct CRI, then DMYHL

The FMS parses the string into `RouteModel` → `LegModel[]` → `WaypointModel[]`.
Restrictions are inline:

- `@CRI` — hold at CRI
- `^CRI` — fly-over (don't turn early)
- `A1500` — at 15000 ft
- `A1500+` — at or above 15000 ft
- `A800-` — at or below 800 ft
- `S210` — at 210 kts
- `#220` — fly heading 220

**SIDs and STARs** in the airport JSON reuse the same leg/restriction vocabulary
in their `body` field. SIDs have an `exitPoints` map (name → body); STARs have
`entryPoints`. The FMS can splice a SID or STAR into a route via the entry/exit
fix name.

**Procedures** (SIDs, STARs, approaches) are stored in the airport JSON under
`sids`, `stars`, and `approaches` keys. Each is a `ProcedureModel` instance.

## State of the VOR 13 work

**What's done and working:**

- `kjfk-13s.json` is forked from `kjfk.json` with two new fixes (ASALT, DMYHL)
  and a `VOR13` entry in a new top-level `approaches` section. The fork is
  registered in `airportLoadList.json`.
- `navigationLibrary/approachInterceptor.js` is a pure module implementing the
  intercept algorithm (see "The intercept algorithm" below). Tests are in
  `test/navigationLibrary/approachInterceptor.spec.js`.
- `aircraft/FlightManagementSystem/Fms.js` has a new
  `insertProcedure(entryFixName, procedureIcao, exitFixName)` method that
  splices an approach into the active route. Tests are in
  `test/aircraft/FlightManagementSystem/Fms.spec.js`.
- `commands/aircraftCommand/aircraftCommandMap.js` has new `clearedApproach` and
  `missedApproach` entries. `commands/parsers/argumentParsers.js` has a new
  `caParser`.
- `AircraftCommander.runApproach` and `runMissedApproach` exist as methods that
  delegate to the Pilot.

**What's stubbed (not functional):**

- `Pilot.conductNonPrecisionApproach` exists but only sets the arrival runway
  and returns a readback. The TODO at the method captures what needs to happen:
  call the intercept algorithm, splice the procedure via `fms.insertProcedure`,
  set MCP altitude mode to VNAV, apply inline crossing restrictions. **This is
  the single biggest gap in the feature.**

**What's broken (separate from the feature work):**

- The `ca` command and the `ils` command are both broken at runtime. The `ils`
  test fails because `_argumentParsers.ilsParser` evaluates to `undefined` for
  the `ils` entry in the command map. **Do not assume the ILS command works.**
  See `ILS_REGRESSION.md` for the full bug report. This predates the VOR 13 work
  and exists in upstream OpenScope too.

## The intercept algorithm

The algorithm picks the best leg in a procedure to intercept based on the
aircraft's current position and heading. It lives in
`navigationLibrary/approachInterceptor.js` and is pure (no side effects, no
model dependencies).

For each leg in the procedure:

1. Build a **leg line**: from end-fix (E) through start-fix (S), extended 30 nm
   past S.
2. Build an **aircraft line**: from current position, extended 5-10 nm along
   current heading.
3. **Intersect** the two line segments. If no intersection, the leg is not
   geometrically reachable.
4. **Check angle**: the angle between aircraft heading and the inbound course.
   Reject if > 45° (configurable via `max_intercept_angle` in
   `constants/approachConstants.js`).

Surviving candidates are sorted by distance to intercept point (nearest first).
Pick the first. If it fails, try the next. If all fail, refuse the clearance.

**Constants are in** `src/assets/scripts/client/constants/approachConstants.js`:

- `max_intercept_angle` (default 45°)
- `max_intercept_distance_nm` (default 30 — leg line extension)
- `min_intercept_distance_nm` (default 1-2 — exclude fixes too close)
- `acft_forward_look_nm` (default 5-10 — aircraft line extension)

**No altitude check.** The VNAV planner handles descent. The algorithm only
picks the lateral leg.

## The airport config (`kjfk-13s.json`)

The file is large (~21k lines) but mostly data:

- `runways` — 4 runways (13L/31R, 13R/31L, 4L/22R, 4R/22L), each with detailed
  geometry as coordinate arrays
- `maps` — 7 video maps, one per runway config (4s, 13s, 22s, ILS 22s, 31s, 31s
  NTZ, Config Change). Each is a set of polylines. Most of the file size is
  these polylines.
- `sids`, `stars` — procedure bodies using the fix-instruction vocabulary
- `fixes` — named positions used by routes and procedures
- `approaches` (new) — the `VOR13` entry I added

**The `approaches` shape:**

```json
"VOR13": {
    "icao": "VOR13",
    "name": "VOR One Three",
    "type": ["vor", "gps"],
    "iaf": "ASALT",
    "rwy": ["13L", "13R"],
    "procedure": [
        "ASALT",
        ["CRI", "A1500"],
        ["DMYHL", "A800+"]
    ],
    "missedApproach": {
        "heading": 100,
        "fix": "DPK",
        "holdAltitude": 4000
    },
    "draw": [
        ["ASALT", "CRI"],
        ["CRI", "DMYHL"]
    ]
}
```

The `procedure` body reuses the fix-instruction vocabulary. Restrictions are
applied via `pilot.crossFix()`. The `draw` field tells the renderer which
segments to draw on the scope.

## Build and run

```bash
cd openscope-ng/
npm install
npm run build:dev      # dev build (fast, unminified)
npm start              # serves on port 3003
```

Then open `http://localhost:3003/`. To switch to kjfk-13s in the running sim,
type `airport kjfk-13s` in the command bar and press Enter.

**Test commands:**

```bash
npm test               # full ava suite
npm run lint           # eslint
```

## Known issues and gotchas

1. **The `ca` and `ils` commands are both broken.** This is a pre-existing issue
   in upstream OpenScope, not something my VOR 13 work caused. See
   `ILS_REGRESSION.md`.

2. **The `develop` branch is 4 years stale.** As of 2026-08, the project hasn't
   seen commits since 2022. The `package-lock.json` pins to old package versions
   with 93 known CVEs (14 critical). Don't run `npm update` — the project uses
   exact version pins in `package.json`, so `npm update` does nothing. To update
   individual packages, use `npm install <pkg>@<version>` or add `overrides` for
   transitive deps.

3. **The `prepublish` scripts in many packages use `in-publish` /
   `not-in-publish` guards.** In npm 6, `prepublish` runs on `npm install`. The
   guard means the script body is a no-op during install. Don't assume every
   `prepublish` script actually ran.

4. **The `monorepo-symlink-test` packages have a `postinstall` script that runs
   `lerna bootstrap`.** These are test fixtures inside
   `eslint-plugin-react/node_modules/resolve/test/resolver/...`. Lerna is not
   installed. The script does not run. Don't worry about it.

5. **The `pbkdf2@3.0.17` package's `prepublish` is `npm run test`.** The chain
   is `npm run lint && npm run unit` where `unit` is `tape test/*.js`. There is
   no `test/` directory in the installed package, so the glob matches nothing.
   No-op.

6. **`sha.js@2.4.11` has a `prepublish: npm ls && npm run unit`.** This runs the
   test suite at install time. The tests are pure hash computations on hardcoded
   strings. No network, no file I/O outside the package. Verified safe.

7. **The sim was last built against a 4-year-stale lockfile.** If you rebuild,
   the build output in `public/` will contain bundled versions of the same old
   packages. The CVEs travel with the build.

8. **The sim's UI selector has a known broken hover/click state** in the
   4-year-old develop branch. Use the command bar (`airport kjfk-13s`) instead
   of clicking through the UI.

## Files to read first, in order

1. `non-precision-approaches-plan.md` — the original design. 393 lines. Covers
   ILS, the algorithm, the command surface, the config shape. The "What we found
   in the existing code" section is the best on-ramp.
2. `aircraft/Pilot/Pilot.js` line 760+ — the ILS approach. This is the template
   any new approach type follows.
3. `aircraft/AircraftCommander.js` line 730+ — `runIls`, `runApproach`,
   `runMissedApproach`. The dispatch layer.
4. `commands/aircraftCommand/aircraftCommandMap.js` — how commands are
   registered.
5. `navigationLibrary/approachInterceptor.js` — the intercept algorithm. Pure
   module, well-tested.
6. `aircraft/FlightManagementSystem/Fms.js` — the FMS. Look for
   `insertProcedure` (new) and the existing route-splicing methods.
7. `ILS_REGRESSION.md` — if you need to fix the `ca`/`ils` command break, start
   here.
8. `assets/airports/kjfk-13s.json` — the airport config. Mostly coordinate data,
   but the `approaches` section is the VOR 13 definition.

## What the next agent should do

The honest list, in priority order:

1. **Fix the ils/ca command regression** so any approach can be cleared at all.
   See `ILS_REGRESSION.md`.
2. **Fill in `Pilot.conductNonPrecisionApproach`.** The stub currently only sets
   the arrival runway. It needs to: validate the approach exists and the
   aircraft can intercept (call `findBestIntercept` from
   `approachInterceptor.js`); splice the procedure via `fms.insertProcedure`;
   set MCP altitude mode to VNAV; apply any inline crossing restrictions via
   `pilot.crossFix()`; set `hasApproachClearance = true`.
3. **Smoke test**: `ca vor 13l` should vector the aircraft onto the procedure,
   descend via restrictions, and land on 13L. `ca mg` should trigger the missed
   approach.
4. **Update dependencies** if you want the CVEs gone. The 4 patch-level ones
   (cipher-base, minimist, sha.js, request) can be fixed with
   `npm install <pkg>@<newer>`. The 2 majors (`@babel/traverse`, `form-data`)
   are risky. The 4 minor-level are medium risk. Transitive deps need
   `overrides` in `package.json`.

The feature is 70% there. The infrastructure works. The Pilot TODO is the main
remaining work, and the command regression is the main blocker.
