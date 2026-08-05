[![openScope NG Current Release](https://img.shields.io/github/v/release/aaronhall/openscope-ng.svg)](https://github.com/aaronhall/openscope-ng/releases)
[![Production Build State](https://img.shields.io/github/workflow/status/aaronhall/openscope-ng/protected-branch-checks/master.svg)](https://github.com/aaronhall/openscope-ng/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/aaronhall/openscope-ng/badge.svg?branch=develop)](https://coveralls.io/github/aaronhall/openscope-ng?branch=develop)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)

# openScope NG Air Traffic Control Simulator

Visit https://aaronhall.github.io/openscope-ng to begin playing now!

If you're just getting started, try the tutorial and see the [command reference](documentation/commands.md) for a full list of commands you can use. For information on each airport, see the [airport guide](documentation/airport-guides/airport-guide-directory.md).

If you have questions, comments, or would like to contribute, please [open an issue](https://github.com/aaronhall/openscope-ng/issues) or submit a pull request.

---

## Roadmap

openScope NG is a fork of the [original openScope by Jon Ross](https://github.com/openscope/openscope). The goal is to modernize and extend the base game into a full-featured ATC simulator:

- Full voice support via FOSS STT/TTS and/or provider
- Live traffic, enhanced traffic generation (fly overs, VFR, flight following,
  heli traffic, military traffic, emergencies)
- Full non-precision approach and visual approach support; model complex
  instrument approaches (e.g. VOR DME arcs, circle to land); better approach
  rejection behavior; go arounds, published missed definitions
- Update existing airspaces with current SIDs, STARs and approaches; updated
  video maps; expand satellite airports with traffic; tool to automatically
  update and generate new airspaces from public data
- Simulate TA/RA behavior; better conflict alerts; model real world separation
  requirements
- Expanded and enhanced aircraft (model performance characteristics;
  realistically model airlines and fleets)
- Realistically model real-world traffic across all airports
- Better weather simulation; predefined scenarios and live weather
- Ability to simulate runway configuration changes in-game
- Realistic STARS terminal
- Save files
* Upgrade/modernize dev tooling; audit and fix supply chain security issues
- Incremental Typescript migration
- Enhanced live, in-game regression test suite


---

## Developer Quick Start

_Prerequisites: In order to successfully complete this quick start, you will need to have the following installed locally:_

- [Git](https://git-scm.com/downloads)
- [Node](https://nodejs.org/en/download/)

_Installation directions are beyond the scope of this document.  Instead, search the [Google](http://google.com).  Installing these two packages has been written about ad-nauseum._

From a terminal (or GitBash for Windows users), run the following commands:

1. `git clone https://github.com/aaronhall/openscope-ng.git`
1. `cd openscope-ng`
1. `npm install`
1. `npm run build`
1. `npm run start`

Once that finishes doing its thing, you should see something close to the following in the terminal:

```bash
> node ./public/assets/scripts/server/index.js

Listening on PORT 3003
```

Success!!

If you do not see this message and are having trouble getting set up, please [open an issue](https://github.com/aaronhall/openscope-ng/issues) and include the relevant output.

For more information on the available tools, please view the [Tools Readme](tools/README.md).

## Contributing

Contributions are welcome through issues and pull requests in the [openScope NG repository](https://github.com/aaronhall/openscope-ng). See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution process.

We use the [GitFlow Branching Model](http://nvie.com/posts/a-successful-git-branching-model) for managing branches.  If you would like to contribute, you will be expected to use appropriate branch names based on this methodology (and we can help if you have questions).

Don't know Javascript?  That's cool, we're always looking for beta testers and/or airport contributors.  If you would like to add a new airport, or help update existing airports, please read the [Airport Format Documentation](documentation/airport-format.md) and [Airport File Standards Documentation](documentation/airport-file-standards.md) to get up to speed on what is expected in that file.

## Privacy Disclosures

We use Google Analytics for gathering data about how our app is used. See [Event Tracking](documentation/event-tracking.md) for more information.

## Credits

openScope NG is based on openScope 6.28.0 by Jon Ross. The original work remains covered by the MIT license; this fork preserves that historical attribution and adds the Vite build migration and current maintenance updates.

## License

[MIT License](LICENSE.md)
