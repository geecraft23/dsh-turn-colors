# DSH Turn Colors

[English](README.md) | 简体中文

[![npm version](https://img.shields.io/npm/v/%40geecraft23%2Fdsh-turn-colors.svg)](https://www.npmjs.com/package/@geecraft23/dsh-turn-colors)
[![CI](https://github.com/geecraft23/dsh-turn-colors/actions/workflows/ci.yml/badge.svg)](https://github.com/geecraft23/dsh-turn-colors/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

`@geecraft23/dsh-turn-colors` 是一个安装到 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `web` Profile 的 Bundle。它为每个对话 Turn 分配一种柔和且确定的颜色，并将同一种颜色用于该 Turn 中已持久化的用户输入气泡与模型完成后的最终文字回复；系统提示词、推理、工具内容和消息操作区保持中性。

调色板包含六种颜色，按 Turn 编号循环，并分别适配浅色与深色主题。背景只贴合内容区域，不会铺满整行对话。

## 着色范围

| 着色 | 保持中性 |
| --- | --- |
| 已持久化的用户输入 | 系统提示词与注入上下文 |
| 已接纳的 steering 输入 | 中间 Assistant 文本与推理 |
| 每个 Turn 完成后的最终 Assistant 文字回复 | 工具调用及结果、Turn-process 摘要与图片 |
| | 复制、分支、反馈、用量、时间、状态及其他消息操作 |
| | 尚未提交的输入预览 |

插件不会发起网络请求，也不会保存任何对话内容。

## 环境要求

- Node.js `^22.19.0` 或 `>=24.0.0`
- `dsh plugin` 可以在 `PATH` 中找到 pnpm
- `@deepseek-ai/dsh@0.1.2-alpha.5`

当前版本已在 DeepSeek Harness `0.1.2-alpha.5` 与 Cordis `4.0.2` 上完成测试。DSH `0.1.1-rc.2` 尚未提供本版本依赖的聊天标记，因此下面的 Registry 安装与启动命令会固定到兼容的 Harness 版本。

## 安装

只需执行一次，把 Bundle 加入持久化的 `web` Profile：

```sh
npx @deepseek-ai/dsh@0.1.2-alpha.5 plugin --profile web add @geecraft23/dsh-turn-colors
```

随后启动同一个 Profile：

```sh
npx @deepseek-ai/dsh@0.1.2-alpha.5 web
```

`dsh web` 是启动 `dsh --profile web` 的简写。启动命令里不再出现插件包名，是因为 Bundle 成员关系已经持久化在 Profile 中。

## 验证

先在不启动应用的情况下检查最终组合配置：

```sh
npx @deepseek-ai/dsh@0.1.2-alpha.5 --profile web --dump-config
```

输出中应包含 `# == @geecraft23/dsh-turn-colors` Bundle 层，以及 `id: turn-colors` plugin 行。这一步只能证明配置组合正确，不能证明浏览器代码已经执行。

然后运行 `web`，打开 DSH 自动打开或打印出的浏览器地址。至少完成两个对话 Turn，并确认：

- 同一 Turn 的用户输入与最终回答颜色相同。
- 下一个 Turn 使用不同颜色。
- 系统、推理、工具、过程、状态与操作行保持中性。
- 浅色与深色主题下都能正常阅读。

使用 `--no-open` 时，请打开 `dsh web:` 日志行打印的完整地址，包括其中的 token。

## 工作原理

- **Bundle** — 当前 npm 包，通过 `dsh plugin` 一次性加入 `web` Profile。
- **Profile** — 用户拥有的、持久化且有顺序的组合；本插件面向 `web`。
- **Cordis plugin** — Harness 从 Bundle 中实际加载的运行时模块。
- **Patch 层** — `cordis.patch.yml` 会把 `turn-colors` Cordis plugin 行插入最终组合配置。它是 DSH patch 文档，不是 JSON Patch，也不会改写 Profile 自己的 patch 文件。

Host 入口有意不执行 UI 工作。它的 `./client` 入口会在浏览器中安装一份样式表、观察已渲染的聊天 DOM、只标记符合条件的内容，并在 Cordis 卸载插件时清除所有由插件添加的状态。

## 本地开发

```sh
git clone https://github.com/geecraft23/dsh-turn-colors.git
cd dsh-turn-colors
pnpm install
pnpm run check
pnpm pack --dry-run
```

`pnpm run check` 会执行严格 TypeScript 检查、jsdom 行为测试、类型声明生成与运行时代码构建。测试覆盖调色板循环、应着色和应排除的界面、动态 DOM 变化、节点移除、卸载清理，以及浅色/深色 CSS。

在另一个兼容 alpha.5 的 DeepSeek Harness 源码 checkout 中，先完成一次 Harness 准备，再将本地项目加入 `web`：

```sh
pnpm install
pnpm run build
pnpm dsh plugin --profile web add link:/absolute/path/to/dsh-turn-colors
pnpm dsh --profile web --dump-config
pnpm dsh web
```

只修改客户端代码时，在本项目中运行 `pnpm run check` 后刷新浏览器即可。修改 Bundle 成员关系、patch 层或 Host 端运行时行为后，需要重启 Harness。

## 限制与兼容性

- 仅支持 Web UI（`dsh.client.platform` 为 `web`）。
- 六色调色板目前固定，尚无设置界面。
- 草稿在进入持久化 Turn 前保持中性。
- 最终 Assistant 文字回复会在 Turn 完成后获得颜色。
- 当前版本依赖 Harness 现有的聊天 DOM 标记与 Assistant 渲染结构。Harness 仍处于开发者预览阶段，未来的 UI 变化可能要求插件同步更新。

## 卸载

```sh
npx @deepseek-ai/dsh@0.1.2-alpha.5 plugin --profile web remove @geecraft23/dsh-turn-colors
```

随后重启 Web 进程。卸载只会从 `web` 中移除依赖和 Bundle 层，不会修改历史对话。

## 参与贡献

欢迎提交范围明确的 Issue 和 Pull Request。提交 PR 前请运行 `pnpm run check`，并注明测试使用的 DSH 版本。涉及可见行为时，请附上截图或短视频。

## 许可证

[MIT](LICENSE)
