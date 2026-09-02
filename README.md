# DSH Turn Colors

`@geecraft23/dsh-turn-colors` is a small DeepSeek Harness Web plugin that makes long conversations easier to scan. Every rendered row belonging to the same conversation Turn receives the same subtle background color, and the next Turn receives a different color.

The palette contains six deterministic colors and repeats after six Turns. It includes separate light and dark theme values and does not change message text, spacing, or behavior.

## Requirements

- Node.js `^22.19.0` or `>=24.0.0`
- pnpm `11.7.0`
- DeepSeek Harness with the `web` profile

## Try it locally

Build the plugin from this directory:

```sh
pnpm install
pnpm run check
```

From a DeepSeek Harness source checkout, add this directory to the built-in Web profile:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/dsh-turn-colors
pnpm dsh --profile web --dump-config
pnpm dsh web --no-open
```

Open `http://127.0.0.1:3080`, then view a conversation containing at least two Turns. Restart the Web process after rebuilding or reinstalling the plugin.

To remove the local plugin:

```sh
pnpm dsh plugin --profile web remove @geecraft23/dsh-turn-colors
```

## How it is packaged

- `cordis.patch.yml` inserts the plugin into the selected DSH profile.
- `lib/index.js` is the host-side no-op entry that keeps the Cordis plugin row active.
- `lib/client.js` is the Web client module that observes rendered chat rows and applies the palette.

Run `pnpm pack --dry-run` to inspect the files that would be included in a package without publishing it.

## Current scope

- Web UI only.
- Pending user submissions, steering previews, and Turn status rows remain neutral because they do not yet belong to a persisted Turn.
- The plugin uses the current Harness `data-chat-turn` DOM marker. A future Harness UI change to that marker may require a plugin update.

## License

MIT
