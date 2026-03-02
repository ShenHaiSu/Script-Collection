/**
 * 油猴脚本元数据配置 (meta.ts)
 *
 * 此文件导出的 meta 对象将被打包脚本解析并自动生成油猴脚本的头部注释 (UserScript Banner)。
 *
 * 作用与意义：
 * 1. 声明脚本的基本信息（名称、版本、作者等）
 * 2. 定义脚本的运行范围（匹配的 URL）
 * 3. 申请脚本所需的权限（GM_ API、跨域请求等）
 * 4. 配置脚本的更新与加载策略
 */

export const meta = {
  // @name: 脚本的名称。会在油猴管理面板中显示。
  name: "功能演示示例脚本 (Full Demo Script)",

  // @namespace: 脚本的命名空间，用于唯一标识脚本。通常是你的个人域名或 GitHub 个人主页。
  namespace: "https://github.com/ShenHaiSu/Script-Collection",

  // @version: 脚本版本号。
  // 在当前打包逻辑中支持函数形式，每次调用可生成新版本号（例如结合日期、构建次数等）。
  version: () => "0.1.2",

  // @description: 脚本的功能描述。建议简明扼要，支持多语言（例如使用 @description:zh-CN）。
  description: "这是一个综合演示脚本，展示了如何通过 meta.ts 配置各种常用的油猴脚本头部标签。",

  // @author: 脚本作者的名称。
  author: "Developer_Name",

  // @icon: 脚本的图标 URL，显示在管理面板和菜单中。
  icon: "https://www.google.com/s2/favicons?sz=64&domain=example.com",

  // @match: 脚本生效的 URL 模式。支持通配符。
  // 在打包逻辑中，数组形式会生成多行 @match 标签。
  match: ["https://example.com/*", "https://*.google.com/*", "https://github.com/*"],

  // @include / @exclude: 包含或排除特定的 URL。
  exclude: ["https://example.com/login", "https://example.com/logout"],

  // @require: 预加载外部 JS 库。例如 jQuery、Vue 等。
  require: ["https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js", "https://cdn.jsdelivr.net/npm/dayjs@1.11.0/dayjs.min.js"],

  // @resource: 预加载外部资源（如 CSS、图片），可通过 GM_getResourceText/URL 获取。
  resource: ["MY_CSS https://example.com/style.css", "LOGO_IMG https://example.com/logo.png"],

  // @grant: 申请脚本权限。常见的有 GM_xmlhttpRequest, GM_setValue, GM_getValue 等。
  // 如果不需要权限，建议设为 "none"。
  grant: ["GM_xmlhttpRequest", "GM_setValue", "GM_getValue", "GM_addStyle", "GM_registerMenuCommand"],

  // @connect: 允许跨域请求的域名白名单，用于 GM_xmlhttpRequest。
  connect: ["api.example.com", "bing.com", "api.github.com"],

  // @run-at: 脚本开始运行的时机。
  // document-start: 尽早运行；
  // document-end: DOM 加载完运行；
  // document-idle: 浏览器空闲时运行。
  "run-at": "document-end",

  // @noframes: 如果定义，则脚本不会在 iframe 中运行。
  noframes: "",

  // @updateURL / @downloadURL: 用于脚本自动更新检查的 URL。
  // updateURL: "https://raw.githubusercontent.com/user/repo/main/src/example-script.build.user.js",
  // downloadURL: "https://raw.githubusercontent.com/user/repo/main/src/example-script.build.user.js",

  // @supportURL: 用户反馈问题的地址。
  supportURL: "https://github.com/ShenHaiSu/Script-Collection/issues",
};
