## Scope

This is a small mechanical version reset, plus a broader fork-identity pass.

### 1. Package identity and semver

Files:

- `package.json`
- `package-lock.json`

Changes:

- Set package version from `6.28.0` to `0.1.0`.
- Rename the npm/package identity from `openscope` to a valid lowercase package
  name, likely `openscope-ng`.
  - npm package names cannot contain spaces or uppercase characters.
  - The display name can still be **openScope NG**.

The Vite build already reads `package.json.version` and injects it into the
generated HTML. Changing the package version will therefore update
automatically:

- `window.GLOBAL.VERSION`
- Settings → displayed simulator version
- Changelog version heading
- Asset cache-busting query parameters
- Build metadata comments

No separate version constant is currently required.

### 2. New changelog baseline

`CHANGELOG.md` currently starts with the historical upstream `6.28.0` entry.

Recommended approach:

```md
# 0.1.0 (release date)

### Fork

- First openScope NG release based on openScope 6.28.0.
- Includes the Vite build migration and current maintenance updates.

# 6.28.0 (July 3, 2022)

...
```

Do not rewrite the old version history. Keeping it preserves provenance and
makes the fork’s starting point clear. The asset-preparation script uses the
first changelog entry as the runtime changelog, so adding a `0.1.0` entry is
required if the application should display fork-specific release notes.

### 3. User-facing branding

Current visible references include:

- `src/templates/layout.hbs`
  - document title
  - Open Graph title/site name
  - canonical project URL: `https://aaronhall.github.io/openscope-ng`
- `src/templates/_loadingView.hbs`
  - loading-screen brand
- `src/assets/scripts/client/ui/SettingsController.js`
  - settings footer currently says `openScope ATC Simulator`
- `assets/tutorial/tutorial.json`
  - tutorial text and command-reference links
- `README.md`
- `CONTRIBUTING.md`
- various documentation pages

These should be changed to the chosen display name, probably:

> openScope NG Air Traffic Control Simulator

The branding pass should also update metadata such as `og:title`,
`og:site_name`, and `title`.

### 4. Repository and external-link migration

The code and documentation still point to the upstream project. Fork-owned links
should use:

- Repository: `https://github.com/aaronhall/openscope-ng`
- Project URL: `https://aaronhall.github.io/openscope-ng`

The code and documentation should update:

- `package.json`
  - repository: `https://github.com/aaronhall/openscope-ng`
  - bugs: `https://github.com/aaronhall/openscope-ng/issues`
  - homepage: `https://aaronhall.github.io/openscope-ng`
- README badges and clone instructions
- footer GitHub and command-reference links
- changelog “view all releases” link
- tutorial command-reference links
- documentation links to `github.com/aaronhall/openscope-ng`
- GitHub Actions workflow assumptions
- upstream Slack links
- upstream website links, using the project URL where appropriate

These should be classified before editing:

#### Must update

Links that users should follow for the fork:

- repository URL
- issue tracker
- releases
- README badges
- clone instructions
- footer GitHub link
- command-reference links
- current documentation links

#### Usually preserve

Historical links in the old changelog, especially links documenting upstream
issues and releases. Rewriting those would damage historical provenance.

### 5. Deployment target

The fork's project URL is `https://aaronhall.github.io/openscope-ng`.

The implementation should update current user-facing and documentation links to
that URL where they refer to the deployed project. Deployment-specific
configuration outside the GitHub Pages target is out of scope. Existing files
not needed for the GitHub Pages target should not be changed as part of this
rename.

CI workflows trigger on `master` and `develop`, and their documentation assumes
the original branching/release model. Confirm whether those assumptions remain
appropriate for the fork.

### 6. Licensing and attribution

`LICENSE.md` currently attributes the original work to Jon Ross and grants MIT
permissions.

The fork should:

- retain the existing MIT license and copyright notice
- add clear fork attribution in the README
- state the upstream starting point and the fork’s changes
- avoid implying that the fork owns the historical upstream work

No license change is required for the requested rename/version reset.

### 7. Schema and historical domain references

Some schema identifiers still use `openscope.co`, for example:

- airport schema `$id`
- tutorial schema `$id`
- autocomplete schema `$id`

These are not ordinary user-facing links. Changing them can affect schema
identity and compatibility. Unless the fork establishes a new schema namespace,
I recommend leaving them unchanged initially and documenting that the fork
remains data-format compatible with the upstream project.

### 8. Verification required after implementation

The implementation should verify:

- `package.json` and `package-lock.json` both report `0.1.0`.
- `npm pack --dry-run` reports the intended package identity.
- Production HTML contains `0.1.0`.
- Settings displays `openScope NG ATC Simulator v0.1.0`.
- The runtime changelog displays the new `0.1.0` entry.
- README and application links point to `https://github.com/aaronhall/openscope-ng` or `https://aaronhall.github.io/openscope-ng` as appropriate.
- No upstream operational links remain unintentionally.
- Historical changelog links remain intact.
- `npm run prepare-assets`
- `npm run build`
- `npm test`
- `npm run lint`
- `npm run format:check`
- Browser smoke test covering loading screen, Settings, Changelog, tutorial, and
  external-link targets.

This document changes planning scope only; implementation files remain unchanged.


