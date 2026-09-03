# DSH Turn Colors

English | [简体中文](README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/%40geecraft23%2Fdsh-turn-colors.svg)](https://www.npmjs.com/package/@geecraft23/dsh-turn-colors)

`@geecraft23/dsh-turn-colors` adds subtle background colors to conversations in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web. A user message and its final Assistant reply share one color; the next Turn uses another. System prompts, reasoning, tools, and message actions stay unchanged.

## Preview

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/geecraft23/dsh-turn-colors/main/docs/assets/turn-colors-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/geecraft23/dsh-turn-colors/main/docs/assets/turn-colors-light.png">
  <img alt="DeepSeek Harness conversation with matching colors on each user message and final Assistant reply." src="https://raw.githubusercontent.com/geecraft23/dsh-turn-colors/main/docs/assets/turn-colors-light.png">
</picture>

## Install

Requires Node.js `^22.19.0` or `>=24.0.0` and pnpm. The commands use the current DSH alpha release; this plugin is tested with `0.1.2-alpha.5`.

Add the plugin to the `web` Profile once:

```sh
npx @deepseek-ai/dsh@alpha plugin --profile web add @geecraft23/dsh-turn-colors
```

## Use

Start DeepSeek Harness Web:

```sh
npx @deepseek-ai/dsh@alpha web
```

The plugin is saved in the `web` Profile, so the launch command does not need the package name again.

## Remove

```sh
npx @deepseek-ai/dsh@alpha plugin --profile web remove @geecraft23/dsh-turn-colors
```

Restart DeepSeek Harness Web after removing it.

## License

[MIT](LICENSE)
