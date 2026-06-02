# 打包构建指南

## 目录

1. [脚本文件模板](#1-脚本文件模板)
2. [meta.ts 字段参考](#2-metats-字段参考)
3. [构建命令](#3-构建命令)
4. [构建流程说明](#4-构建流程说明)

---

## 1. 脚本文件模板

### index.ts（入口）

```typescript
import { meta } from "./meta";
import { helperFunction } from "./helper";

// 如果脚本不需要立即执行任何操作，可以留空
// 通常包含 DOM 操作、事件监听、API 调用等

console.log(`${meta.name} loaded`);
```

### meta.ts（元数据 - 最小模板）

```typescript
export const meta = {
  name: "脚本名称",
  namespace: "https://github.com/ShenHaiSu/Script-Collection",
  version: "0.1.0",
  description: "脚本功能描述",
  author: "Developer_Name",
  match: ["https://target-site.com/*"],
  grant: ["GM_xmlhttpRequest"],
  connect: ["api.target-site.com"],
  "run-at": "document-end",
};
```

### helper.ts（可选）

```typescript
/** 脚本专用辅助函数 */
export function helperFunction(arg: string): void {
  console.log(`Helper: ${arg}`);
}
```

---

## 2. meta.ts 字段参考

完整示例参见 [`src/example-script/meta.ts`](src/example-script/meta.ts)。

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `name` | `string` | ✅ | 脚本名称，显示在油猴管理面板 |
| `namespace` | `string` | 推荐 | 唯一标识，通常填 GitHub 主页 |
| `version` | `string \| () => string` | 推荐 | 支持函数形式动态生成版本号 |
| `description` | `string` | 推荐 | 功能描述 |
| `author` | `string` | 推荐 | 作者名称 |
| `match` | `string \| string[]` | ✅ | 脚本生效的 URL 模式 |
| `exclude` | `string[]` | 可选 | 排除的 URL |
| `grant` | `string[]` | 推荐 | 权限声明，如 `"GM_xmlhttpRequest"`、`"GM_setValue"` |
| `connect` | `string[]` | 按需 | `GM_xmlhttpRequest` 的跨域白名单 |
| `require` | `string[]` | 可选 | 预加载的外部 JS 库 URL |
| `resource` | `string[]` | 可选 | 预加载资源 |
| `icon` | `string` | 可选 | 图标 URL |
| `"run-at"` | `string` | 可选 | `"document-start"` / `"document-end"` / `"document-idle"` |
| `noframes` | `string` | 可选 | 设为 `""` 禁用在 iframe 中运行 |

> **重要**：带连字符的字段（如 `run-at`）需要用引号包裹键名。

---

## 3. 构建命令

所有命令在项目根目录 `f:/MyProgram/Script-Collection/` 下执行。

### 打包指定项目

```powershell
cd src; pnpm build Tmall-FastGoodsInput
```

等价于在 `src/` 目录下：

```powershell
pnpm build Tmall-FastGoodsInput
```

### 自动检测最近修改的项目并打包

```powershell
cd src; pnpm build
```

此时构建脚本会：
1. 扫描所有包含 `index.ts` + `meta.ts` 的子目录
2. 按文件修改时间排序，取最近修改的 5 个文件
3. 去重后确定目标项目文件夹
4. 依次打包

### 输出

构建产物输出到项目根目录，命名为 `{FolderName}.build.user.js`。

---

## 4. 构建流程说明

构建由 [`src/index.ts`](src/index.ts) 驱动，核心流程：

1. **扫描有效项目**：过滤掉 `node_modules`、`dev-tool`、隐藏目录，要求目标目录同时包含 `index.ts` 和 `meta.ts`
2. **动态导入 meta.ts**：读取 `meta` 导出对象
3. **生成油猴头部**：`generateBanner()` 将 `meta` 对象转换为 `// ==UserScript==` 注释块
4. **esbuild 打包**：以 `IIFE` 格式、ES2020 目标、treeShaking 开启、不压缩（保持可审核性）进行打包，并将 banner 注入输出文件

> **注意**：`dev-tool/` 下的代码不会作为独立项目打包，它们以 `import` 方式被各脚本引用，通过 esbuild 的 tree-shaking 仅打包实际使用的部分。
