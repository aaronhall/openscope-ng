[![openScope NG Current Release](https://img.shields.io/github/v/release/aaronhall/openscope-ng.svg)](https://github.com/aaronhall/openscope-ng/releases)
[![Production Build State](https://img.shields.io/github/actions/workflow/status/aaronhall/openscope-ng/push.yml?branch=master)](https://github.com/aaronhall/openscope-ng/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/aaronhall/openscope-ng/badge.svg?branch=develop)](https://coveralls.io/github/aaronhall/openscope-ng?branch=develop)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)

# openScope NG Air Traffic Control Simulator

openScope NG is a fork of the [original openScope by Jon Ross et. al.](https://github.com/openscope/openscope), based on the upstream 6.29.0-BETA (develop) codebase. The goal is to modernize and extend the base game into a full-featured ATC simulator.

Visit https://aaronhall.github.io/openscope-ng to begin playing now!

If you're just getting started, try the tutorial and see the [command reference](documentation/commands.md) for a full list of commands you can use. For information on each airport, see the [airport guide](documentation/airport-guides/airport-guide-directory.md).

For questions, comments, or to report issues, please open an [issue](https://github.com/aaronhall/openscope-ng/issues).

### Project Roadmap

- [ ] Full voice support via FOSS STT/TTS and/or provider
- [ ] Live traffic, enhanced traffic generation (fly overs, VFR, flight following,
 heli traffic, military traffic, emergencies)
- [ ] Full non-precision approach and visual approach support; model complex
  instrument approaches (e.g. VOR DME arcs, circle to land); better approach
  rejection behavior; go arounds, published missed definitions
- [ ] Update existing airspaces with current SIDs, STARs and approaches; updated
  video maps; expand satellite airports with traffic; tool to automatically
  update and generate new airspaces from public data
- [ ] Simulate TA/RA behavior; better conflict alerts; model real world separation
  requirements
- [ ] Expanded and enhanced aircraft (model performance characteristics;
  realistically model airlines and fleets)
- [ ] Realistically model real-world traffic across all airports
- [ ] Better weather simulation; predefined scenarios and live weather
- [ ] Ability to simulate runway configuration changes in-game
- [ ] Realistic STARS terminal
- [ ] Save files
- [ ] Upgrade/modernize dev tooling; audit and fix supply chain security issues
- [ ] Incremental Typescript migration
- [ ] Enhanced live, in-game regression test suite

---

## Developer Quick Start

_Prerequisites: In order to successfully complete this quick start, you will need to have the following installed locally:_

- [Git](https://git-scm.com/downloads)
- [Node](https://nodejs.org/en/download/) 22.12 or newer

_Installation directions are beyond the scope of this document.  Instead, search the [Google](http://google.com).  Installing these two packages has been written about ad-nauseum._

From a terminal (or GitBash for Windows users), run the following commands:

1. `git clone https://github.com/aaronhall/openscope-ng.git`
1. `cd openscope-ng`
1. `npm install`
1. `npm run build`
1. `npm run start`

For active development with hot reload, use `npm run dev` (the Vite development server) instead of `npm run build` + `npm run start`.

Once that finishes doing its thing, you should see something close to the following in the terminal:

```bash
> openscope-ng@0.1.0 start
> node src/assets/scripts/server/index.js

Listening on PORT 3003
```

Success!!

If you do not see this message and are having trouble getting set up, please [open an issue](https://github.com/aaronhall/openscope-ng/issues) and someone will be able to troubleshoot with you.

For more information on the available tools, please view the [Tools Readme](tools/README.md).

## Contributing

This project is a fork of [openScope](https://github.com/openscope/openscope), and contributions are welcome:

- Open an [issue](https://github.com/aaronhall/openscope-ng/issues) to report a bug or propose a feature.
- Fork the repository, create a branch off `develop`, and open a pull request back into `develop`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution guidelines.

Don't know Typescript/Javascript?  That's cool, we're always looking for beta testers and/or airport contributors.  If you would like to add a new airport, or help update existing airports, please read the [Airport Format Documentation](documentation/airport-format.md) and [Airport File Standards Documentation](documentation/airport-file-standards.md) to get up to speed on what is expected in that file.

## License

[MIT License](LICENSE.md)
