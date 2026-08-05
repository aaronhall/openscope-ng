Here's how the pieces map from what you have to what's standard now (mid-2026):

## The old → new map

| What it does       | You have                                                        | Modern replacement                                    | Why                                                                                                                                                                                                                                                                 |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build/bundle       | `gulp` + `browserify` + `babelify`                              | **Vite**                                              | Gulp/Browserify manually wire together transforms; Vite handles bundling, dev server, and transforms out of the box with far less config. It's now the default build tool across nearly every major framework.                                                      |
| Test runner        | `ava` 1.4.1                                                     | **Vitest**                                            | Vitest has effectively replaced both Jest and Ava as the default. It shares config with Vite, runs fast, and has a much larger, more current plugin ecosystem than Ava does today.                                                                                  |
| Transpilation      | `@babel/*` (manually wired plugins)                             | **esbuild/Rolldown** (bundled inside Vite) or **swc** | You currently hand-list individual Babel plugins (`optional-chaining`, `nullish-coalescing`, etc.) because your Babel/preset-env is from 2019 and doesn't know about newer syntax. Vite's built-in transform handles current JS syntax without per-feature plugins. |
| Linting            | `eslint` 5 + `eslint-config-airbnb`                             | **ESLint 9 with flat config** (`eslint.config.js`)    | ESLint's config format changed entirely — the old `.eslintrc` style is deprecated. Airbnb's config hasn't kept pace as the go-to; many projects now compose flat configs directly or use **Biome** or **Oxlint** for a much faster, Rust-based linter.              |
| Formatting         | (nothing — style presumably enforced by eslint rules)           | **Prettier**                                          | Decouples "is this code correct" (ESLint's job) from "is this code formatted consistently" (Prettier's job), so lint rules aren't fighting style debates.                                                                                                           |
| CSS preprocessing  | `gulp-less`                                                     | **Vite's built-in Less/Sass support**                 | Vite handles preprocessor files natively via plugins, no gulp pipeline needed.                                                                                                                                                                                      |
| Coverage           | CI Coveralls action; no Vitest coverage provider configured yet | **Vitest's built-in coverage** (follow-up)            | The unused direct `coveralls` package was removed, but the existing GitHub Action remains until coverage is migrated explicitly.                                                                                                                                    |
| Dependency updates | manual                                                          | **Renovate**                                          | Opens PRs automatically for outdated/vulnerable deps, which sidesteps the exact situation you're in now.                                                                                                                                                            |

There's also a newer option called **Vite+** (from the Vite/Vue creator's
company, released ~March 2026) that bundles Vite, Vitest, a linter (Oxlint), a
formatter (Oxfmt), and the bundler into one CLI/config — worth knowing about,
but I'd treat it as optional polish rather than the first move, since it's newer
and has a smaller community track record than assembling Vite + Vitest + ESLint
yourself.

## Suggested phased approach

Given you said you're not deeply familiar with this stack, I'd strongly avoid a
big-bang rewrite. Suggested order, each phase independently shippable:

**Phase 1 — Testing (lowest risk, most isolated)** Swap Ava for Vitest first.
Tests don't touch your production build pipeline, so this is safe to do in
isolation and gives you a feel for the new tooling with minimal blast radius.

```bash
npm install -D vitest
```

Vitest is largely Jest/Ava-API-compatible (`describe`, `it`, `expect`), so most
existing test files need only minor syntax tweaks, not a rewrite.

**Phase 2 — Linting & formatting (also isolated)** Greenfield setup (no
`.eslintrc` exists on disk — `npm run lint` is currently broken). Steps:

1. **Install new stack:**
   `npm install -D eslint@^9 @eslint/js globals eslint-plugin-import eslint-plugin-jsdoc eslint-config-prettier prettier@^3`
2. **Remove old stack:**
   `npm uninstall eslint eslint-config-airbnb eslint-plugin-react eslint-plugin-jsx-a11y babel-eslint gulp-eslint`
   (drop `eslint-plugin-import@2.17.2`; new version comes from step 1)
3. **Create `eslint.config.mjs`** (`.mjs` because no `"type": "module"` in
   `package.json` — same reason we got the `vitest.config.js` ESM warning):
   `@eslint/js` recommended + `globals` (browser+node) +
   `eslint-plugin-import` + `eslint-plugin-jsdoc` +
   `eslint-config-prettier/flat` last
4. **Create `.prettierrc.json`** (4-space, single quotes, semicolons, 100 width
   — match existing code) and `.prettierignore` (node_modules, public, coverage,
   package-lock.json)
5. **Update `package.json` scripts:** `lint: eslint .`,
   `lint:fix: eslint . --fix`, `format: prettier --write .`,
   `format:check: prettier --check .`; bump `engines.node` to `>=20.0.0`
6. **Run `npm run lint` — assess errors, fix incrementally** (a fresh ESLint 9
   config on a 6-year-old codebase will surface many; don't try to fix them all
   in one PR)
7. **Run `npm run format`** to apply Prettier once
8. **Verify:** `npm test` still 1317 passing, `npm audit` same or lower

**Phase 3 — Replace the build pipeline with Vite (highest risk)** Replace
Gulp, Browserify, and Babel with Vite while preserving the existing `public/`
deployment contract. Keep the old Gulp build available in parallel until the
Vite output passes verification, then remove the legacy pipeline. Record any
implementation deviations in the notes below.

### Phase 3 execution plan

1. **Establish the Vite output contract**
   - Add a repository-root `index.html` and `vite.config.mjs`.
   - Use `.vite-public/` as generated static-asset staging and continue emitting
     production output to `public/`.
   - Add `dev`, `preview`, and Vite-based `build` scripts while retaining the
     existing `start`/`server` production server contract.
   - Configure source maps and an explicit browser target rather than silently
     adopting Vite's default target.

2. **Replace Handlebars/Gulp markup compilation**
   - Add an inline Vite plugin using `transformIndexHtml` to compile
     `src/index.hbs` and its partials with the existing Handlebars helpers and
     layouts.
   - Supply package version and build date during compilation.
   - Watch `src/**/*.hbs` in development and trigger a full reload when a
     template changes.
   - Preserve the Handlebars layout structure; add a standards `<!doctype html>` so Vite development and production pages avoid quirks mode. The Vite plugin rewrites its legacy CSS and bundle tags to Vite source entries.

3. **Replace media and data tasks with a Node asset-preparation step**
   - Create `tools/prepare-assets.js` and run it before development and builds.
   - Reproduce the current output under `.vite-public/assets/`: static images,
     fonts, tutorial, autocomplete, and airport files; minified airport JSON
     and GeoJSON; assembled aircraft and airline JSON; airport-guide HTML JSON;
     and latest-entry changelog JSON.
   - Keep generated files out of tracked `assets/` source directories.

4. **Move client and CSS processing to Vite**
   - Convert the remaining client `require()` calls to ESM imports (`raf`,
     `util`, and Handlebars).
   - Import `src/assets/style/main.less` from the Vite HTML entry.
   - Add direct `vite`, `less`, `postcss`, and `autoprefixer` dependencies,
     plus `postcss.config.cjs`, while preserving the existing autoprefixing
     policy.
   - Audit CSS and runtime asset URLs, especially the font paths in
     `src/assets/style/base/font.less` and the application's string-based
     `assets/...` requests.

5. **Keep the Node server, remove its copy step**
   - Update `src/assets/scripts/server/index.js` to serve `public/` directly.
   - Run the source server directly from `npm start`; Vite owns development
     serving and production client bundling.

6. **Cut over scripts, dependencies, and CI**
   - Replace Gulp scripts with `dev`, `build`, `build:dev`, `preview`, and
     `prepare-assets` scripts, with `predev`, `prebuild`, and `prebuild:dev`
     hooks for asset preparation.
   - Remove `Gulpfile.js`, Gulp task modules, Browserify/Babel configuration,
     and dependencies that are no longer referenced.
   - Remove `lint-diff`; its only release requires ESLint 4, so CI now runs
     the full `npm run lint` command instead.
   - Align `@eslint/js` with ESLint 9 so regular `npm install` resolves cleanly.
   - Retain Handlebars and Showdown where the client or replacement asset
     pipeline still uses them.
   - Remove the unused direct `coveralls` package while retaining the existing
     Coveralls GitHub Action pending an explicit Vitest coverage migration.
   - Align `.nvmrc`, `package.json`, and both GitHub workflows on Node 24.19.0
     with an engine floor of Node 22.12.0. Node 24 is the pinned LTS runtime;
     update `setup-node` to v4 and remove the old Node 11 CI versions.
   - Update `tools/README.md` to describe the Vite pipeline and commands.

### Phase 3 verification

Run the following after the cutover:

1. `npm install` must resolve cleanly without `--legacy-peer-deps`.
2. `npm run prepare-assets` and inspect the complete generated asset tree.
3. `npm run build` and `npm run build:dev`; verify `public/index.html`, built
   JS/CSS, source maps, JSON, guides, images, fonts, and airport data.
4. Start the production server and request `/`, airport data, guides, changelog,
   images, and fonts.
5. Run `npm run dev` and smoke-test the Vite HTML entry and static assets.
6. Run `npm test`, `npm run lint`, and `npm run format:check`.

Acceptance criterion: no Gulp, Browserify, or Babel code remains on the build
path; `public/` remains deployable through the existing static configuration
and server; and the simulator's browser behavior remains unchanged.

### Phase 3 implementation notes

- The old Gulp build remained available until the Vite build, Vite preview,
  production Express server, and development server all passed smoke tests.
- `src/templates/layout.hbs` was preserved structurally; a standards doctype was added after verification exposed quirks mode in the Vite page. The Vite plugin rewrites its legacy stylesheet and bundle references, which preserved a working parallel build during migration.
- Vite `server.strictPort` and `preview.strictPort` are enabled so a second process fails instead of silently moving to another port and leaving browsers pointed at a stale server.
- Vitest coverage was not wired in this phase. The direct `coveralls` package
  was unused and removed, while the CI Coveralls Action remains as a follow-up
  dependency until coverage generation is migrated.
- `lint-diff` was removed because its peer dependency only supports ESLint 4;
  CI now runs the full ESLint configuration.

Relevant Vite documentation: [Getting Started](https://vite.dev/guide/),
[Static Assets](https://vite.dev/guide/assets), [CSS/LESS](https://vite.dev/guide/features#css),
[Plugin API](https://vite.dev/guide/api-plugin), and [Production Builds](https://vite.dev/guide/build).


**Phase 4 — Optional: TypeScript** Not required, but if you want it, adopt
incrementally — Vite supports `.ts` files immediately with zero extra config,
and you can convert file-by-file rather than all at once (`allowJs: true` in
`tsconfig.json` lets JS and TS coexist during the transition).


