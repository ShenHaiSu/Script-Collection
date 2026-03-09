/**
 * 油猴脚本元数据配置 (meta.ts)
 *
 * 此文件导出的 meta 对象将被打包脚本解析并自动生成油猴脚本的头部注释 (UserScript Banner)。
 */

export const meta = {
  // @name: 脚本的名称。会在油猴管理面板中显示。
  name: "淘宝/天猫商品信息增强插件 (GoodsInfoEnhance)",

  // @namespace: 脚本的命名空间，用于唯一标识脚本。通常是你的个人域名或 GitHub 个人主页。
  namespace: "https://github.com/ShenHaiSu/Script-Collection",

  // @version: 脚本版本号。
  version: () => {
    // 生成 yyyy.mm.dd.hh.mm.ss 格式的版本号
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate()), pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join(
      ".",
    );
  },

  // @description: 脚本的功能描述。建议简明扼要。
  description: "淘宝/天猫商品详情页信息获取增强：复制商品ID、复制所有颜色名称、复制所有尺码名称等。",

  // @author: 脚本作者的名称。
  author: "DaoLuoLTS",

  // @icon: 脚本的图标 URL。
  icon: "https://www.google.com/s2/favicons?sz=64&domain=taobao.com",

  // @match: 脚本生效的 URL 模式。
  match: ["https://item.taobao.com/item.htm*", "https://detail.tmall.com/item.htm*", "https://detail.tmall.hk/item.htm*"],

  // @include / @exclude: 包含或排除特定的 URL。
  exclude: [],

  // @require: 预加载外部 JS 库。
  require: [],

  // @resource: 预加载外部资源。
  resource: [],

  // @grant: 申请脚本权限。
  grant: ["GM_setClipboard", "GM_registerMenuCommand"],

  // @connect: 允许跨域请求的域名白名单。
  connect: [],

  // @run-at: 脚本开始运行的时机。
  "run-at": "document-end",

  // @noframes: 如果定义，则脚本不会在 iframe 中运行。
  noframes: "",

  // @supportURL: 用户反馈问题的地址。
  supportURL: "https://github.com/ShenHaiSu/Script-Collection/issues",
};
