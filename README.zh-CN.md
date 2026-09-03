# DSH Turn Colors

[English](README.md) | 简体中文

[![npm version](https://img.shields.io/npm/v/%40geecraft23%2Fdsh-turn-colors.svg)](https://www.npmjs.com/package/@geecraft23/dsh-turn-colors)

`@geecraft23/dsh-turn-colors` 为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web 的对话增加柔和的背景色。同一轮中的用户输入和模型最终回复使用同一种颜色，下一轮会换一种颜色；系统提示词、推理过程、工具调用和操作区保持不变。

## 效果预览

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/geecraft23/dsh-turn-colors/main/docs/assets/turn-colors-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/geecraft23/dsh-turn-colors/main/docs/assets/turn-colors-light.png">
  <img alt="DeepSeek Harness 对话界面：每轮的用户输入与模型最终回复使用相同颜色。" src="https://raw.githubusercontent.com/geecraft23/dsh-turn-colors/main/docs/assets/turn-colors-light.png">
</picture>

## 安装

需要 Node.js `^22.19.0` 或 `>=24.0.0`，并确保 pnpm 可用。下面使用当前 DSH alpha 版本；本插件已在 `0.1.2-alpha.5` 上测试。

执行一次，把插件加入 `web` Profile：

```sh
npx @deepseek-ai/dsh@alpha plugin --profile web add @geecraft23/dsh-turn-colors
```

## 使用

启动 DeepSeek Harness Web：

```sh
npx @deepseek-ai/dsh@alpha web
```

插件已经保存在 `web` Profile 中，所以启动时不需要再次写包名。

## 卸载

```sh
npx @deepseek-ai/dsh@alpha plugin --profile web remove @geecraft23/dsh-turn-colors
```

卸载后重启 DeepSeek Harness Web。

## 许可证

[MIT](LICENSE)
