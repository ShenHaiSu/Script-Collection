/**
 * 新品试销信息自动获取功能的 match 函数
 * 用于判定当前页面是否需要显示"新品试销信息获取"按钮
 *
 * 规范说明：
 * 1. 每个特性的 match 函数需要单独实现此文件
 * 2. 函数命名规范：match 开头 + 功能名，如 sellTryInfoMatch
 * 3. 导出 match 函数供 actions.ts 挂载使用
 */

/**
 * 判定当前页面是否为"新品试销"相关页面
 * 匹配规则：URL 包含 trade-try-buy/merchList
 * 例如：
 * - https://qn.taobao.com/home.htm/trade-try-buy/merchList
 * - https://myseller.taobao.com/home.htm/trade-try-buy/merchList
 * @returns true 表示当前页面需要显示该按钮，false 表示隐藏
 */
export function sellTryInfoMatch(): boolean {
  const href = window.location.href;

  // 匹配新品试销商品列表页面
  // 匹配模式: home.htm/trade-try-buy/merchList
  const matchPattern = /home\.htm\/trade-try-buy\/merchList/;

  return matchPattern.test(href);
}
