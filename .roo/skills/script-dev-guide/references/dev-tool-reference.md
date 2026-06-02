# dev-tool 工具函数参考

## 目录

1. [gmFetch - HTTP 请求封装](#1-gmfetch)
2. [imgCopy - 图片剪贴板复制](#2-imgcopy)
3. [react-inputUpdate - React 受控组件输入](#3-react-inputupdate)
4. [uiframe-check - UI 框架检测](#4-uiframe-check)

---

## 1. gmFetch

**文件**: [`src/dev-tool/gmFetch.ts`](src/dev-tool/gmFetch.ts)

封装了 Tampermonkey 的 `GM_xmlhttpRequest`，返回 Promise，调用方式类似标准 `fetch`。

### 导出

```typescript
export function gmFetch(url: string, options?: GmFetchOptions): Promise<GmFetchResponse>

export interface GmFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD";
  headers?: Record<string, string>;
  body?: string | FormData | Blob | ArrayBuffer;
  // 也接受 Tampermonkey.Request 的其他字段，如 timeout、responseType 等
}

export interface GmFetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  data: any;
  responseText: string;
  responseHeaders: string;
  finalUrl: string;
  json: <T = any>() => T;
}
```

### 使用示例

```typescript
import { gmFetch } from "../dev-tool/gmFetch";

const res = await gmFetch("https://api.example.com/data");
if (res.ok) {
  const data = res.json<MyType>();
  console.log(data);
}
```

### 注意

- 需要在 `meta.ts` 的 `grant` 中包含 `"GM_xmlhttpRequest"`
- 跨域请求需在 `meta.ts` 的 `connect` 中添加目标域名

---

## 2. imgCopy

**文件**: [`src/dev-tool/imgCopy.ts`](src/dev-tool/imgCopy.ts)

将图片复制到系统剪贴板，支持从 `<img>` 元素或 URL 两种入参方式。

### 导出

```typescript
// 通用函数
export async function copyImageToClipboard(options: ImageCopyOptions): Promise<void>

// 便捷函数：从 HTMLImageElement 复制
export async function copyImageElementToClipboard(imgElement: HTMLImageElement, options?: Omit<ImageCopyOptions, 'imgElement'>): Promise<void>

// 便捷函数：从 URL 复制
export async function copyImageUrlToClipboard(imgUrl: string, options?: Omit<ImageCopyOptions, 'imgUrl'>): Promise<void>

export interface ImageCopyOptions {
  imgElement?: HTMLImageElement;
  imgUrl?: string;
  bypassCache?: boolean;     // 默认 true，添加时间戳绕过缓存
  canvasWidth?: number;
  canvasHeight?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

### 使用示例

```typescript
import { copyImageUrlToClipboard } from "../dev-tool/imgCopy";

await copyImageUrlToClipboard("https://example.com/image.png", {
  onSuccess: () => console.log("复制成功"),
});
```

---

## 3. react-inputUpdate

**文件**: [`src/dev-tool/react-inputUpdate.ts`](src/dev-tool/react-inputUpdate.ts)

在 React 受控组件环境下更新 input/textarea/select 的值，通过原生 setter 和事件模拟触发 React 状态更新。

### 导出

```typescript
// 同步更新单个元素
export function updateReactInput(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  oldValue?: string,
  newValue?: string
): void

// 异步更新（含 blur/focus 循环 + 延迟，适用于复杂 React 应用）
export function updateReactInputAsync(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  newValue: string,
  delay?: number  // 默认 50ms
): Promise<void>

// 批量更新
export function updateReactInputs(
  updates: Array<{
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    oldValue?: string;
    newValue?: string;
  }>
): void
```

### 使用示例

```typescript
import { updateReactInput } from "../dev-tool/react-inputUpdate";

const input = document.querySelector<HTMLInputElement>("#my-input");
if (input) {
  updateReactInput(input, undefined, "新值");
}
```

### 注意事项

- 仅对 React 控制的表单元素有效
- 可先用 [`uiframe-check`](src/dev-tool/uiframe-check.js) 确认页面框架
- 对于特别复杂的表单，优先尝试 `updateReactInputAsync`

---

## 4. uiframe-check

**文件**: [`src/dev-tool/uiframe-check.js`](src/dev-tool/uiframe-check.js)

在浏览器控制台运行，检测当前页面的前端 UI 框架及版本。这是一个纯 JS 的自执行函数（IIFE），不是 TypeScript 模块，因此使用方式不同于其他工具。

### 检测能力

| 框架 | 检测方式 | 示例返回值 |
|------|----------|-----------|
| Vue 3+ | `window.__VUE__` | `vue3` |
| Vue 2 | `window.Vue` / `[__vue__]` | `vue2` |
| React 16+ | `__reactContainer` / `__reactFiber` | `react16+` |
| React 15 | `[data-reactroot]` | `react15` |
| Angular | `window.ng.probe` / `[ng-version]` | `angular{version}` |
| jQuery | `window.jQuery.fn.jquery` | `jquery{version}` |

### 使用方式

此文件一般不在脚本中 import，而是在**开发阶段手动粘贴到浏览器控制台**执行，用于快速确认目标页面的框架类型。

在脚本代码中判断框架也可以通过检查 DOM 属性：

```typescript
// 简单判断是否为 React 页面
const isReact = !!document.querySelector('[data-reactroot], [data-reactroot=""]')
  || Object.keys(document.body).some(k => k.startsWith('__react'));
```
