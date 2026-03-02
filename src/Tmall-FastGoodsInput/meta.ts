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
  name: "天猫商品详情交互增强插件 (FastGoodsInput)",

  // @namespace: 脚本的命名空间，用于唯一标识脚本。通常是你的个人域名或 GitHub 个人主页。
  namespace: "https://github.com/ShenHaiSu/Script-Collection",

  // @version: 脚本版本号。
  // 在当前打包逻辑中支持函数形式，每次调用可生成新版本号（例如结合日期、构建次数等）。
  version: () => {
    // 生成 yyyy.mm.dd.hh.mm.ss 格式的版本号
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate()), pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join(
      ".",
    );
  },

  // @description: 脚本的功能描述。建议简明扼要。
  // 支持多语言（例如使用 @description:zh-CN）。
  description: "在商品详情填写页面，提供多种更符合心流的交互方式，提升填写效率，降低错误率。",

  // @author: 脚本作者的名称。
  author: "DaoLuoLTS",

  // @icon: 脚本的图标 URL，显示在管理面板和菜单中。
  icon: "https://www.google.com/s2/favicons?sz=64&domain=sell.publish.tmall.com",

  // @match: 脚本生效的 URL 模式。支持通配符。
  // 在打包逻辑中，数组形式会生成多行 @match 标签。
  match: ["https://sell.publish.tmall.com/tmall/publish.htm?*"],

  // @include / @exclude: 包含或排除特定的 URL。
  exclude: [],

  // @require: 预加载外部 JS 库。例如 jQuery、Vue 等。
  require: [],

  // @resource: 预加载外部资源（如 CSS、图片），可通过 GM_getResourceText/URL 获取。
  resource: [],

  // @grant: 申请脚本权限。常见的有 GM_xmlhttpRequest, GM_setValue, GM_getValue 等。
  // 如果不需要权限，建议设为 "none"。
  grant: ["GM_xmlhttpRequest"],

  // @connect: 允许跨域请求的域名白名单，用于 GM_xmlhttpRequest。
  connect: [],

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
