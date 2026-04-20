/**
 * 新品试销基本信息匹配函数
 * 判定当前页面是否需要显示"批量获取基本信息"功能按钮
 */

/**
 * 匹配函数 - 判定当前页面是否需要显示该功能按钮
 * @returns true 表示当前页面需要显示该按钮，false 表示隐藏
 */
export function sellTryBasicInfoMatch(): boolean {
  // 匹配新品试销商品列表页面
  const url = window.location.href;
  
  // 检查是否在新品试销商品列表页面
  const isSellTryMerchList = 
    url.includes("trade-try-buy/merchList") || 
    url.includes("trade-try-buy%2FmerchList");
  
  // 检查是否存在分页器和商品表格
  const hasPagination = document.querySelector("ul.tbd-pagination") !== null;
  const hasTableBody = document.querySelector("table > tbody") !== null;
  
  // 检查是否存在商品行
  const hasTableRows = document.querySelector("tr[data-row-key]") !== null;
  
  // 只有在新品试销商品列表页面且有数据时才显示
  return isSellTryMerchList && hasPagination && hasTableBody && hasTableRows;
}
