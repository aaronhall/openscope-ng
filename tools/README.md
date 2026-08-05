[node]: https://nodejs.org/
[vite]: https://vite.dev/
[express]: https://expressjs.com/

# Tools

## Local dependencies

The project requires Node.js 22.12 or newer. The repository's `.nvmrc` pins
Node.js 24.19.0 for development and CI.

Install dependencies from the project root:

```bash
npm install
```

## Build pipeline

The project uses [Vite][vite] for the client development server and production
build. `tools/prepare-assets.js` prepares generated JSON, Markdown-derived
HTML, and static files in `.vite-public/` before development and builds.

The `public/` directory contains generated deployment output and is not in
source control. Edit application code and styles under `src/`, and edit source
data under `assets/`.

## Folder structure

```txt
assets/
documentation/
public/
src/
test/
tools/
```

- `assets/` contains airport, airline, aircraft, image, font, tutorial, and
  autocomplete source files.
- `documentation/airport-guides/` contains the Markdown source for airport
  guides.
- `public/` contains the generated files served in production.
- `src/` contains the application JavaScript, LESS, and Handlebars templates.
- `test/` contains the Vitest test suite and test helpers.
- `tools/prepare-assets.js` assembles and stages non-module assets for Vite.

## NPM commands

- `npm run dev` starts the Vite development server.
- `npm run build` prepares assets and creates the production build in `public/`.
- `npm run build:dev` creates a development-mode Vite build in `public/`.
- `npm run preview` serves the most recent production build through Vite.
- `npm run start` serves `public/` through the [Express][express] server on
  port 3003, or the port specified by `PORT`.
- `npm run prepare-assets` regenerates the Vite static-asset staging directory.
- `npm run test` runs the Vitest suite.
- `npm run lint` checks JavaScript and configuration files with ESLint.
- `npm run format:check` checks project formatting with Prettier.
