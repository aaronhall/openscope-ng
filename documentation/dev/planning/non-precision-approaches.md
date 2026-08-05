# Non-Precision Approaches — Design Plan

## Goal

Add non-precision approaches (VOR, LOC, RNAV) as a first-class feature in
OpenScope, modeled on the existing ILS machinery. The MVP target is the
VOR 13L/R approach at KJFK, sourced from FAA plate AL-610 (FAA) Amdt 18D
(09 JUL 2026 to 06 AUG 2026).

This document captures the design up to and including the JSON config
shape. Code-level implementation (FMS route splicing, `runApproach`
command, `ca MG` command, the `kjfk-13s.json` airport fork) is out of
scope for this doc.

## What we found in the existing code

### ILS implementation is thin and approach-agnostic

`Pilot.conductInstrumentApproach` (Pilot.js:769-812) is the entry point
for the only currently-supported approach type. It takes `approachType`
as a parameter — the architecture was designed with multiple approach
types in mind. The actual ILS implementation is ~13 lines:

1. Refuse if the runway doesn't exist.
2. Refuse if MCP altitude is below the minimum glideslope intercept
   altitude for the runway.
3. Set the MCP nav1 datum to the runway position, course to the runway
   heading (localizer intercept).
4. Set the MCP glideslope angle and altitude mode `APPROACH`.
5. Cancel any active holding pattern.
6. Set `arrivalRunwayModel` on the FMS.
7. Set `pilot.hasApproachClearance = true`.

The known TODOs in the ILS code:

- *"we should not be setting the altitude mode to 'APP' until established
  on the localizer"* (line 749-751). The aircraft currently starts
  descending the moment clearance is issued, even if it's 20 nm from
  the localizer.
- *"As written, `._interceptCourse()` will always return true."*
  (line 794). No actual intercept validation.

The land trigger is implicit at the runway position. There is no
explicit "land" command — when the aircraft reaches the runway, the
flight phase transitions to `LANDING`.

### The simulation architecture

```
AircraftModel
├── _pilot: Pilot                  ← controller interface
│   ├── _mcp: ModeController       ← mode selectors + field values
│   └── _fms: Fms                  ← owns the route
└── _target: { altitude, heading, speed, turn, ... }
```

The main loop drives `AircraftModel.update()` per aircraft per tick. The
update reads MCP modes, asks the FMS for active-leg state, and populates
`target`. Physics moves the aircraft toward `target`.

**MCP modes** (the "where does the target come from" switchboard):

- `altitudeMode`: `OFF` | `HOLD` | `VNAV` | `APPROACH`
- `headingMode`:  `OFF` | `HOLD` | `LNAV` | `VOR_LOC`
- `speedMode`:    `OFF` | `HOLD` | `VNAV` | `N1`

`HOLD` uses a field value literally. `VNAV` reads altitude restrictions
from the FMS route and plans a descent. `APPROACH` (altitude) is the
ILS glideslope capture. `VOR_LOC` (heading) is the localizer capture.
`LNAV` is lateral nav — follows the FMS route's active leg.

**FMS** parses route strings like
`SIE.CAMRN4..DIXIE..DIXIE6.KJFK31R` into legs (`LegModel`) and
waypoints (`WaypointModel`). Each waypoint can have restrictions
(`@` hold, `^` fly-over, `A`/`S` altitude/speed, `#` heading).

**Pilot** translates ATC-speak into MCP/FMS state changes. The
controller only talks to the Pilot.

### Reusable primitives

A non-precision approach can be built on top of the following existing
machinery:

- **FMS routes with LNAV.** The aircraft can follow any sequence of
  fixes. The route is the source of truth for lateral guidance.
- **VNAV descent planning.** `_calculateTargetedAltitudeVnav`
  (AircraftModel.js:2039-2130) reads altitude restrictions from the
  route and plans a descent. Supports at-or-above (`A70+`),
  at-or-below (`A70-`), and exact (`A70`) restrictions, with
  "latest valid descent" as the heuristic. TOD anticipation is
  implemented via `isBeyondTopOfDescentForWaypointModel`.
- **Hold execution.** `HoldModel` and `HoldCollection` are first-class.
  Holds can be activated via `pilot.initiateHoldingPattern(fixName)`.
- **Cancel landing.** `AircraftModel.cancelLanding()` (AircraftModel.js:816-838)
  sets `hasApproachClearance = false`, climbs to
  `arrivalRunway.elevation + 2000` rounded up to the next 1000, holds
  present heading, calls "going missed approach" on the radio, and
  sets phase to `DESCENT`. Not currently wired to a command.
- **`hasApproachClearance` flag.** Used in three places:
  `AircraftCommander.runHeading` cancels the clearance on any heading
  change; `StripViewModel` shows "runway assigned" in the strip bay;
  `CanvasController` renders the data block with an ILS-lock style.
- **Fix instruction vocabulary.** `@FIX` (hold), `^FIX` (fly-over),
  `A70+`/`A70-`/`A70` (altitude), `S210` (speed), `#220` (heading).
  Already used in SID/STAR `body` and `entryPoints`/`exitPoints`.

## The intercept algorithm

The VOR 13L approach has multiple published segments. Real ATC may
vector an aircraft to join at the IAF, or to a point along the
inbound course, or to any segment of a multi-leg RNAV. The FMS needs
to pick a valid entry leg and route the aircraft through the
remainder of the procedure from there.

### The four scenarios

1. **VOR 13L straight-in.** Controller generally clears for approach by vectoring to the IAP (not intercepting mid-segment).
2. **LOC staircase.** Same shape as #1, more fixes with at-or-above
   restrictions. The leg line is one continuous course.
3. **Winding RNAV (e.g. RNAV (GPS) X RWY 31 into KLGA).** Each
   segment has its own course. The controller may vector to any
   segment. The algorithm must find the best entry leg.
4. **Circling approaches.** Deferred.

### Algorithm

For each leg in the procedure, represent it as a **finite line** on the
intercept geometry:

- **Leg line**: from `E` (end fix) through `S` (start fix), extended
  `D_leg_extend` (default 30 nm) past `S`. Covers the upstream
  intercept zone. Length is `|E - S| + D_leg_extend`.
- **Leg direction**: the inbound course `C` (heading from S to E).

For the aircraft `(A, H)`:

- **Aircraft line**: from `A` to `A + D_acft_extend * unit(H)` (default
  `D_acft_extend` = 5-10 nm). Covers the aircraft's forward path.

For each leg, check:

1. **Intersection**: do the two finite line segments cross? Standard
   2D segment-segment intersection. If no intersection, the leg is
   not geometrically interceptable.
2. **Angle**: the angle between the aircraft's heading `H` and the
   inbound course `C`, in `[0°, 180°]`. Reject if
   `> max_intercept_angle` (default 45°).

No altitude check. The VNAV planner handles descent profiles — if
the aircraft is at or above the first fix's restriction, VNAV plans
a descent to meet it; if it's below, VNAV holds current altitude
or climbs. The "can the aircraft meet this restriction" check is
implicit in VNAV's behavior, not a separate gate. The controller
(the human) decides whether the descent rate is realistic, not
the FMS.
The angle is the absolute difference between `H` and `C` modulo 360°,
clamped to `[0°, 180°]`. 0° means the aircraft is flying along the
leg (same direction); 30° is a shallow intercept (FAA radar-vectoring
norm); 45° is the ICAO allowance; 90° is perpendicular; 180° means
the aircraft is going the wrong way. The default threshold is 45°,
configurable via `max_intercept_angle` in the constants.

Of the surviving candidates, sort by distance to intercept point
(nearest first). Pick the first. If the chosen leg fails for any
reason (aircraft too close to the fix, geometric edge case, etc.),
try the next nearest. If all candidates fail, refuse the clearance.
The controller must vector further.

These should live in a code-level constants file (e.g.
`src/assets/scripts/client/constants/approachConstants.js`), not in
the airport JSON:

- `max_intercept_angle` (default 45°)
- `max_intercept_distance_nm` (default 30 nm — the leg line extension)
- `min_intercept_distance_nm` (default 1-2 nm — exclude fixes too
  close, to avoid weird entry choices)
- `acft_forward_look_nm` (default 5-10 nm — the aircraft line
  extension)

### "Terminating the turn" simplification

When the controller issues "cleared approach," the aircraft's heading
is whatever it is at that moment. If the aircraft is mid-turn, the
algorithm uses the current heading as a snapshot. This is a
simplification — the real pilot would read back the clearance, level
the wings, and configure for the approach — but it matches the
intuition that "the approach clearance stops the turn."

### Arc legs (stretch)

If we ever need to support arcing approach legs (e.g. RF legs on a
complex RNAV), we can split legs into "linear" and "arc" and run a
separate intersection test for arcs (intersect a line with a circular
arc). Deferred for now.


## The command surface

A new `ca` ("cleared approach") command is the general form for issuing
an approach clearance. The existing `i` command stays as a shortcut for
`ca ils <runway>` for backward compatibility.

**Command shape**

```
ca <type> <runway>                                # basic clearance
ca <type> <runway> cross <fix> at <alt>           # with crossing restriction
ca <type> <runway> cross <fix> at <alt> and S<spd># with crossing + speed
```

The `type` is matched against the procedure's `type` field, which is a
list of acceptable in-game codes. For a plate labeled "VOR or GPS RWY
13L/R", the config has `type: ["vor", "gps"]`, and the controller can
issue `ca vor 13l` or `ca gps 13l` — both clear the same procedure.

**Runway matching**

The `runway` argument is the short name (e.g., `13l`), matching the
existing `i` command's format. The config's `rwy` field uses the same
short-name convention: `["13L", "13R"]`.

**Inline crossing restrictions**

The `ca` command accepts optional `cross <fix> at <alt>` clauses
trailing the required `<type> <runway>`. The parser extracts these
and applies them via the existing `pilot.crossFix()` method. The
restrictions take effect immediately and are honored by VNAV during
the descent.

**"Maintain X until established" is not a special case**

The sim handles this naturally: the `ca` command auto-engages VNAV
and inserts the approach procedure, after which the FMS plans a
descent via the route's altitude restrictions. The "maintain 3000" is
just a separate `a 030` (or issued inline), and once the aircraft is
on the approach, the VNAV descent takes over. No special "until
established" tracking is needed in the FMS.

**Insertion order matters**

The `ca` command must insert the approach procedure into the FMS
route *before* applying any inline crossing restrictions, because
the restrictions reference fixes that the insertion adds. The flow:

1. Validate the approach exists, type matches, runway matches.
2. Validate the aircraft can intercept (per the algorithm above).
3. Insert the approach procedure into the FMS route.
4. Apply any inline crossing restrictions.
5. Set MCP altitude mode to VNAV.
6. Set `arrivalRunwayModel` and `pilot.hasApproachClearance = true`.

**Deferred (post-MVP): speed-until-fix and altitude-until-fix**

Real ATC clearances like "maintain 170 or above until Canarsie" with
an explicit cancel-at-fix semantic require a "temporary restriction"
concept in the FMS — a restriction that's active from now until the
aircraft crosses a named fix, then auto-cancels. This is more
involved than the MVP justifies. Deferred.
## The config shape

A new top-level `approaches` section on the airport file. Each
procedure has the following fields:

```json
"approaches": {
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
}
```

The `procedure` body reuses the existing fix-instruction vocabulary:

- `"ASALT"` — the IAF, fly to it. The aircraft is typically already
  here (or heading here) when the approach is cleared; the FMS
  picks up the procedure from the IAF and continues to the runway.
  Holds at the IAF are sequencing tools — issued as a separate
  `hold <fix>` command, not baked into the procedure.

- `[DMYHL, "A800+"]` — at the MAP, at or above 800. The FMS
  descends to the lowest valid altitude by the MAP, which is the
  effective MDA. The MDA is implicit in the last fix's restriction
  and is not a separate config field.

```json
"fixes": {
    "ASALT": ["N40d33.00m0", "W73d52.20m0"],
    "DMYHL": ["N40d38.40m0", "W73d49.20m0"],
    "CRI":   ["N40.6125", "W73.894167"],
    "DPK":   ["N40.791762", "W73.303678"]
}
```

CRI and DPK already exist in `kjfk.json`. ASALT (CRI R-043 / SBJ
R-105) and DMYHL (2.6 DME from CRI on the 041 radial) are new.

The missed approach is a flat object, not a procedure. The `ca MG`
command reads it and does:

1. `setAltitudeFieldValue(climbTo)` + `setAltitudeHold()`
2. `setHeadingFieldValue(heading)` + `setHeadingHold()`
3. `proceedDirect(fix)`
4. `initiateHoldingPattern(fix, { altitude: holdAltitude })`

This is the faked missed approach: "climb to 4000, turn 100, direct
DPK, hold." Real V-1 routing and the exact missed-track geometry are
deferred.

## Open design questions

Resolved:

- **`rwy` as a list:** decided — one approach can serve multiple
  runways via `rwy: ["13L", "13R"]`. Concise for shared procedures
  like the VOR 13L/R.
- **`type` as a list:** decided — `type: ["vor", "gps"]` for plates
  labeled "VOR or GPS". The controller can clear with any listed
  type.
- **Where the tunable constants live:** decided — a single global
  `approachConstants.js` for the MVP, with per-airport overrides
  possible as a future addition.
- **`ca` auto-engages VNAV:** decided — the approach clearance
  engages the descent profile; "maintain X until established" is
  just a regular `a X` command and is naturally superseded by VNAV.
- **Insertion order for crossing restrictions:** decided — insert
  the approach procedure into the FMS route first, then apply any
  inline crossing restrictions (the restrictions reference fixes
  that the insertion adds).
- **`@ASALT` in procedure body:** decided — no hold instruction in
  the procedure body. The IAF is a plain fix; the controller vectors
  the aircraft to it and clears for the approach. Holds at the IAF
  are sequencing tools, issued as a separate `hold <fix>` command
  when needed, not baked into the procedure.
- **Angle check variant:** decided — the angle check is just
  `|H - C| mod 180°` clamped to `[0°, 180°]`. The "track-to-fix"
  variant doesn't apply to the line-intersection geometry. Default
  threshold is 45° (configurable via `max_intercept_angle`).
- **Selection tie-breaker:** decided — sort surviving candidates
  by distance to intercept point (nearest first). Pick the first;
  refuse the clearance.
- **The `mda` field:** decided — drop. The controller never
  actively descends someone to MDA as a command; the MDA is the
  bottom of the approach, reached implicitly by following the
  restrictions. The last fix's `altitudeMinimum` is the source of
  truth. The MDA word only appears in the pilot's readback, not in
  any command, so a separate config field would just be
  documentation dressed up as data.

## What's next (out of scope for this doc)

- `kjfk-13s.json` airport fork with the VOR 13 procedure, runway
  data, fix coordinates, and a 13L/13R spawn pattern.
- FMS route-string splicing logic — how to insert the approach
  procedure into the aircraft's existing route at the entry leg.
  Must happen *before* any inline crossing restrictions are applied.
- Command parser for `ca` — extract the verb, required args (type,
  runway), and any trailing `cross <fix> at <alt>` clauses.
- `AircraftCommander.runApproach` (or extension of `runIls`) — the
  cleared-approach command, including the intercept validation,
  VNAV auto-engagement, and route insertion.
- `AircraftCommander.runMissedApproach` — the `ca MG` command,
  calling `AircraftModel.cancelLanding()`.
- Smoke test: spawn an aircraft, vector onto the approach, clear,
  watch it descend via restrictions, land; then re-test with
  `ca MG`.

**Deferred (post-MVP):**

- "Speed-until-fix" and "altitude-until-fix" inline restrictions.
  Requires a "temporary restriction" concept in the FMS.
- Arc legs (RF) on RNAV approaches.
- Auto-cancel of restrictions at "established" (not needed — VNAV
  takes over naturally).
