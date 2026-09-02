# DSH Turn Colors

English | [简体中文](README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/%40geecraft23%2Fdsh-turn-colors.svg)](https://www.npmjs.com/package/@geecraft23/dsh-turn-colors)
[![CI](https://github.com/geecraft23/dsh-turn-colors/actions/workflows/ci.yml/badge.svg)](https://github.com/geecraft23/dsh-turn-colors/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

`@geecraft23/dsh-turn-colors` is an installable [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Bundle for the `web` Profile. It gives each conversation Turn a subtle, deterministic color shared by the durable user-input bubble and that Turn's completed final Assistant prose, while leaving system prompts, reasoning, tools, and message actions neutral.

The six-color palette repeats by Turn number and provides separate light- and dark-theme values. Backgrounds hug the content instead of filling the transcript row.

## What it colors

| Colored | Kept neutral |
| --- | --- |
| Persisted user input | System prompts and injected context |
| Admitted steering input | Intermediate Assistant text and reasoning |
| The completed final Assistant prose for each Turn | Tool calls and results, Turn-process summaries, and images |
| | Copy, branch, feedback, usage, time, status, and other message actions |
| | Pending submission previews |

The plugin makes no network requests and stores no conversation content.

## Requirements

- Node.js `^22.19.0` or `>=24.0.0`
- pnpm on `PATH` for `dsh plugin`
- `@deepseek-ai/dsh@0.1.2-alpha.5`

The current release is tested with DeepSeek Harness `0.1.2-alpha.5` and Cordis `4.0.2`. DSH `0.1.1-rc.2` does not expose the chat markers this release needs, so the Registry install and launch commands below pin the compatible Harness version.

## Install

Add the Bundle to the persistent `web` Profile once:

```sh
npx @deepseek-ai/dsh@0.1.2-alpha.5 plugin --profile web add @geecraft23/dsh-turn-colors
```

Then launch the same Profile:

```sh
npx @deepseek-ai/dsh@0.1.2-alpha.5 web
```

`dsh web` is shorthand for launching `dsh --profile web`. The package name is absent from the launch command because Bundle membership is stored in the Profile.

## Verify

First, inspect the composed configuration without starting the application:

```sh
npx @deepseek-ai/dsh@0.1.2-alpha.5 --profile web --dump-config
```

The output should contain a `# == @geecraft23/dsh-turn-colors` Bundle layer and an `id: turn-colors` plugin row. This proves composition, not browser execution.

Next, run `web` and open the browser URL that DSH opens or prints. Complete at least two conversation Turns and confirm:

- A Turn's user input and completed final answer share one color.
- The next Turn uses a different color.
- System, reasoning, tool, process, status, and action rows remain neutral.
- The behavior remains readable in both light and dark themes.

When using `--no-open`, open the complete URL printed on the `dsh web:` line, including its token.

## How it works

- **Bundle** — this npm package, added once to the `web` Profile with `dsh plugin`.
- **Profile** — the user-owned, persistent, ordered composition; this plugin targets `web`.
- **Cordis plugin** — the runtime module that Harness loads from the Bundle.
- **Patch layer** — `cordis.patch.yml` inserts the `turn-colors` Cordis plugin row into the composed configuration. It is a DSH patch document, not JSON Patch, and does not rewrite the Profile's own patch file.

The Host entry intentionally performs no UI work. Its `./client` entry installs one browser stylesheet, observes the rendered chat DOM, marks only eligible content, and removes all plugin-owned state when Cordis disposes it.

## Local development

```sh
git clone https://github.com/geecraft23/dsh-turn-colors.git
cd dsh-turn-colors
pnpm install
pnpm run check
pnpm pack --dry-run
```

`pnpm run check` runs strict TypeScript checks, jsdom behavior tests, declaration generation, and runtime builds. The tests cover palette cycling, included and excluded surfaces, dynamic DOM changes, removal, cleanup, and light/dark CSS.

From a separate, alpha.5-compatible DeepSeek Harness source checkout, prepare Harness once and then add the local project to `web`:

```sh
pnpm install
pnpm run build
pnpm dsh plugin --profile web add link:/absolute/path/to/dsh-turn-colors
pnpm dsh --profile web --dump-config
pnpm dsh web
```

After a client-only code change, run `pnpm run check` in this project and refresh the browser. Restart Harness after changing Bundle membership, the patch layer, or Host-side runtime behavior.

## Limitations and compatibility

- Web UI only (`dsh.client.platform` is `web`).
- The six-color palette is fixed; there is no settings surface yet.
- Pending drafts stay neutral until they belong to a persisted Turn.
- Final Assistant prose receives its color after the Turn completes.
- This release depends on current Harness chat DOM markers and the Assistant renderer structure. Harness is in developer preview, so a future UI change may require a plugin update.

## Uninstall

```sh
npx @deepseek-ai/dsh@0.1.2-alpha.5 plugin --profile web remove @geecraft23/dsh-turn-colors
```

Restart the Web process afterward. Removal deletes the dependency and Bundle layer from `web`; it does not modify conversation history.

## Contributing

Focused issues and pull requests are welcome. Before opening a pull request, run `pnpm run check` and include the tested DSH version. For visible behavior changes, include a screenshot or short recording.

## License

[MIT](LICENSE)
