/**
 * 商品列表信息增强功能的 match 函数
 * 用于判定当前页面是否需要显示"商品列表信息增强"按钮
 *
 * 规范说明：
 * 1. 每个特性的 match 函数需要单独实现此文件
 * 2. 函数命名规范：match 开头 + 功能名，如 goodsListInfoMatch
 * 3. 导出 match 函数供 actions.ts 挂载使用
 */

/**
 * 判定当前页面是否为"商品列表"相关页面
 * 匹配规则：URL 的 path 可以匹配 home.htm/SellManage/*?*
 * 例如：SellManage/pre_sale?current=1&pageSize=20
 * @returns true 表示当前页面需要显示该按钮，false 表示隐藏
 */
export function goodsListInfoMatch(): boolean {
  const href = window.location.href;
  
  // 匹配 home.htm/SellManage/ 开头的 URL
  // 使用正则匹配：home.htm/SellManage/ 后面跟着任意字符，然后是 ? 后面跟着任意查询参数
  const matchPattern = /home\.htm\/SellManage\/[^?]*\?/;
  
  return matchPattern.test(href);
}