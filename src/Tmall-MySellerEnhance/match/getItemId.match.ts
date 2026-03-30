/**
 * 获取商品ID功能的 match 函数
 * 用于判定当前页面是否需要显示"获取商品id"按钮
 *
 * 规范说明：
 * 1. 每个特性的 match 函数需要单独实现此文件
 * 2. 函数命名规范：match 开头 + 功能名，如 getItemIdMatch
 * 3. 导出 match 函数供 actions.ts 挂载使用
 */

/**
 * 判定当前页面是否为"已卖出宝贝"相关页面
 * @returns true 表示当前页面需要显示该按钮，false 表示隐藏
 */
export function getItemIdMatch(): boolean {
  const href = window.location.href;
  return href.includes("trade-platform/tp/sold") || href.includes("trade-platform/tp/order");
}