---
name: script-dev-guide
description: 在本项目中新建 Tampermonkey 用户脚本时的开发指南。涵盖脚本基础框架（index.ts + meta.ts）、dev-tool 工具复用（gmFetch、imgCopy、react-inputUpdate、uiframe-check）、以及使用 pnpm build 进行打包构建。当用户请求"新建脚本"、"添加脚本"、"写一个新脚本"、"创建一个油猴脚本"、或询问"怎么打包"、"有哪些工具函数"时使用此 skill。
---

# Script Development Guide

## When to use

- 在本项目中新建一个 Tampermonkey 用户脚本
- 需要了解脚本的标准文件结构（`index.ts`、`meta.ts`、`helper.ts`）
- 查找 `src/dev-tool/` 中已有的可复用工具函数
- 使用 `src/package.json` 中的 scripts 进行打包

## When NOT to use

- 修改已有的脚本逻辑（直接读取脚本代码即可）
- 操作与 Tampermonkey 无关的独立项目
- 纯粹的 TypeScript/JavaScript 语法问题

## Inputs required

- 脚本名称（用于创建文件夹和 `@name`）
- 匹配的 URL 模式（`@match`）
- 所需权限（`@grant`），至少要明确是否需要 `GM_xmlhttpRequest`

---

## Workflow

### 1. 确定脚本名称和目录

脚本名称使用 **PascalCase**（如 `Tmall-GoodsPublishIdCopy`），这将作为：
- `src/` 下的子目录名
- `meta.ts` 中 `@name` 的值
- 构建输出文件名 `{folderName}.build.user.js`

### 2. 创建标准文件结构

每个脚本至少需要两个文件（参照 [`src/example-script/`](src/example-script/index.ts)）：

```
src/{ScriptName}/
├── index.ts    # 入口：主逻辑
├── meta.ts     # 油猴元数据（@name、@match、@grant 等）
└── helper.ts   # 可选：脚本专用辅助函数
```

详细模板和字段说明见 [`references/build-guide.md`](references/build-guide.md)。

### 3. 复用 dev-tool 已有工具函数

在编写脚本逻辑前，**必须先查阅** [`references/dev-tool-reference.md`](references/dev-tool-reference.md) 中列出的工具函数，优先复用而非重复实现。

| 工具 | 用途 | 何时使用 |
|------|------|----------|
| `gmFetch` | GM_xmlhttpRequest 封装 | 需要发起 HTTP 请求 |
| `imgCopy` | 图片复制到剪贴板 | 需要复制图片 |
| `react-inputUpdate` | React 受控组件输入更新 | 页面使用 React 且需要自动填写表单 |
| `uiframe-check` | 页面 UI 框架检测 | 不确定目标页面的前端框架 |

> **原则**：能在 `src/dev-tool/` 中找到的，直接 `import` 使用。只有无法复用的才在自己的脚本目录下实现。

### 4. 构建打包

使用 [`src/package.json`](src/package.json) 中的脚本：

| 命令 | 说明 |
|------|------|
| `pnpm build` | 自动检测最近修改的项目并打包 |
| `pnpm build {FolderName}` | 打包指定项目 |
| `cd src ; pnpm build {FolderName}` | 在工作区根目录执行时的等价写法 |

详细打包流程见 [`references/build-guide.md`](references/build-guide.md)。

**注意**：`dev-tool/` 不会被作为独立项目打包，因为构建脚本（[`src/index.ts`](src/index.ts)）自动排除了它（参见 `validProjectFolders` 过滤逻辑）。

---

## Files

| 文件 | 何时阅读 |
|------|----------|
| [`references/dev-tool-reference.md`](references/dev-tool-reference.md) | 需要查找可复用的工具函数时 |
| [`references/build-guide.md`](references/build-guide.md) | 需要了解 meta.ts 字段、打包命令或脚本模版时 |
| [`src/example-script/`](src/example-script/index.ts) | 需要参考标准脚本目录结构时 |
