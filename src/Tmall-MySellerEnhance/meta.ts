/**
 * 油猴脚本元数据配置 (meta.ts)
 *
 * 此文件导出的 meta 对象将被打包脚本解析并自动生成油猴脚本的头部注释 (UserScript Banner)。
 */

export const meta = {
  // @name: 脚本的名称。会在油猴管理面板中显示。
  name: "天猫后台订单信息增强",

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

  // @description: 脚本的功能描述。建议简明扼要，支持多语言（例如使用 @description:zh-CN）。
  description: "增强千牛天猫后台的已卖出宝贝的订单信息，展示更多实用性的信息内容。",

  // @author: 脚本作者的名称。
  author: "DaoLuoLTS",

  // @icon: 脚本的图标 URL，显示在管理面板和菜单中。
  icon: "https://www.google.com/s2/favicons?sz=64&domain=tmall.com",

  // @match: 脚本生效的 URL 模式。支持通配符。
  // 修改为 host/* 以支持整个天猫/千牛后台，因为后台是单页面应用，href会跳来跳去
  match: [
    "https://myseller.taobao.com/*",
    "https://qn.taobao.com/*",
    // 新品试销页面
    "https://qn.taobao.com/home.htm/trade-try-buy/merchList*",
    "https://myseller.taobao.com/home.htm/trade-try-buy/merchList*",
  ],

  // @grant: 申请脚本权限。常见的有 GM_xmlhttpRequest, GM_setValue, GM_getValue 等。
  grant: ["GM_setValue", "GM_getValue", "GM_fetch", "GM_xmlhttpRequest"],

  // @run-at: 脚本开始运行的时机。
  "run-at": "document-end",

  // @noframes: 如果定义，则脚本不会在 iframe 中运行。
  noframes: "",

  // @supportURL: 用户反馈问题的地址。
  supportURL: "https://github.com/ShenHaiSu/Script-Collection/issues",
};