# daisy-custom

A personal Vue + daisyUI component registry. Components are copied into your
project as source (like shadcn), so you own and can edit them.

## Install components into another project

Run from that project's root (or use `pnpm dlx` / `yarn dlx` / `bunx`):

```sh
npx daisy-custom@latest list                 # what's available
npx daisy-custom@latest add toast            # one component
npx daisy-custom@latest add table --examples # plus its demo files
```

Files land in `src/components/ui/<component>/`. Anything a component needs
(e.g. `table` needs `icon` and `pagination`) is copied too, and missing npm
packages are installed with your package manager. See [cli/README.md](cli/README.md)
for all options.

The CLI lives in [cli/](cli/) and is published to npm. It downloads components
from this repo's `main` branch at run time, so pushing here is all it takes to
ship a component change. Pin a version with `--ref v0.3.0` (any tag or commit).

### Releasing the CLI

Only needed when `cli/index.mjs` changes, not for component changes:

```sh
cd cli
npm login               # first time only
npm version patch       # 0.1.0 -> 0.1.1
npm publish
```

## Adding a component to the registry

1. Put its files in `src/registry/<component>/`.
2. Add an entry to `registry.config.mjs`.
3. Run `pnpm registry` to regenerate `registry.json`, then commit and push.

## Developing this repo

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
pnpm build

# Runs the end-to-end tests
pnpm test:e2e
# Runs the tests only on Chromium
pnpm test:e2e --project=chromium
# Runs the tests of a specific file
pnpm test:e2e tests/example.spec.ts
# Runs the tests in debug mode
pnpm test:e2e --debug
```
