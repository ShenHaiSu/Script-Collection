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
  name: "LLM Interface Enhance",

  // @namespace: 脚本的命名空间，用于唯一标识脚本。通常是你的个人域名或 GitHub 个人主页。
  namespace: "https://github.com/ShenHaiSu/Script-Collection",

  // @version: 脚本版本号。
  version: "0.1.0",

  // @description: 脚本的功能描述。建议简明扼要，支持多语言（例如使用 @description:zh-CN）。
  description: "优化增强各类LLM平台的控制台账单界面，创造多端适配响应式布局的更加优质的交互界面。支持XHR请求截取、HTML元素动态解析等功能。",

  // @author: 脚本作者的名称。
  author: "Developer_Name",

  // @icon: 脚本的图标 URL，显示在管理面板和菜单中。
  icon: "https://www.google.com/s2/favicons?sz=64&domain=deepseek.com",

  // @match: 脚本生效的 URL 模式。支持通配符。
  // 首先支持 DeepSeek 平台，后续可添加更多 LLM 平台
  match: [
    "https://platform.deepseek.com/usage*",
    // 后续可添加更多 LLM 平台，例如：
    // "https://chat.openai.com/*",
    // "https://chatgpt.com/*",
    // "https://bard.google.com/*",
    // "https://copilot.microsoft.com/*",
    // "https://huggingface.co/chat/*",
  ],

  // @grant: 申请脚本权限。常见的有 GM_xmlhttpRequest, GM_setValue, GM_getValue 等。
  grant: [
    "GM_xmlhttpRequest",
    "GM_setValue",
    "GM_getValue",
    "GM_addStyle",
    "GM_registerMenuCommand",
  ],

  // @connect: 允许跨域请求的域名白名单，用于 GM_xmlhttpRequest。
  connect: [
    "platform.deepseek.com",
    // 后续可添加更多域名
  ],

  // @run-at: 脚本开始运行的时机。
  "run-at": "document-end",

  // @noframes: 如果定义，则脚本不会在 iframe 中运行。
  noframes: "",

  // @supportURL: 用户反馈问题的地址。
  supportURL: "https://github.com/ShenHaiSu/Script-Collection/issues",
};