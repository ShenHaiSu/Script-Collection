/**
 * 订单增强交互逻辑 (actions.ts)
 * 交互函数挂载点 - 仅负责导入和挂载，实际逻辑在 /action 目录下实现
 *
 * 重构说明：
 * 1. 每个 action 需要暴露 match 函数，用于判定当前页面是否需要显示该功能按钮
 * 2. 在展开 drawer 之前，会遍历所有 action 执行 match 函数
 * 3. match 返回 true 时显示按钮，返回 false 时隐藏按钮
 * 4. 这样可以实现针对单页面应用的支持，根据当前 URL 动态显示/隐藏功能按钮
 */

// 从 type 目录导入类型定义
import type { ActionConfig } from "@/Tmall-MySellerEnhance/type";

// 从 action 目录导入实际交互处理函数
import { handleGetItemId } from "@/Tmall-MySellerEnhance/action/getItemId/getItemId.action";
import { handleCopyAllItemIds } from "@/Tmall-MySellerEnhance/action/copyAllItemIds/copyAllItemIds.action";
import { handleCopyUniqueItemIds } from "@/Tmall-MySellerEnhance/action/copyUniqueItemIds/copyUniqueItemIds.action";
import { handleGoodsListInfo } from "@/Tmall-MySellerEnhance/action/goodsListInfo/goodsListInfo.action";
import { handleSellTryInfo } from "@/Tmall-MySellerEnhance/action/sellTryShareCatch/sellTryShareCatch.action";

// 从 match 目录导入 match 函数
import { getItemIdMatch } from "@/Tmall-MySellerEnhance/match/getItemId.match";
import { copyAllItemIdsMatch } from "@/Tmall-MySellerEnhance/match/copyAllItemIds.match";
import { copyUniqueItemIdsMatch } from "@/Tmall-MySellerEnhance/match/copyUniqueItemIds.match";
import { goodsListInfoMatch } from "@/Tmall-MySellerEnhance/match/goodsListInfo.match";
import { sellTryInfoMatch } from "@/Tmall-MySellerEnhance/match/sellTryInfo.match";

// 重新导出供外部使用
export { handleGetItemId, handleCopyAllItemIds, handleCopyUniqueItemIds, handleGoodsListInfo, handleSellTryInfo };

// 重新导出类型供外部使用
export type { ActionConfig };

/**
 * 交互按钮配置列表
 * 用于配置 Drawer 中显示的按钮
 * 每个配置项都包含 match 函数，用于动态判定是否显示
 */
export const ACTION_BUTTONS: ActionConfig[] = [
  {
    id: "get-item-id",
    label: "获取本页订单商品ID",
    icon: "🔗",
    onClick: handleGetItemId,
    // match 函数：从 match 目录导入
    match: getItemIdMatch,
  },
  {
    id: "copy-all-item-ids",
    label: "复制所有商品ID",
    icon: "📋",
    onClick: handleCopyAllItemIds,
    // match 函数：从 match 目录导入
    match: copyAllItemIdsMatch,
  },
  {
    id: "copy-unique-item-ids",
    label: "复制去重商品ID",
    icon: "📝",
    onClick: handleCopyUniqueItemIds,
    // match 函数：从 match 目录导入
    match: copyUniqueItemIdsMatch,
  },
  {
    id: "goods-list-info",
    label: "复制商品列表信息",
    icon: "📋",
    onClick: handleGoodsListInfo,
    // match 函数：从 match 目录导入
    match: goodsListInfoMatch,
  },
  {
    id: "sell-try-info",
    label: "获取新品试销分享信息",
    icon: "🛒",
    onClick: handleSellTryInfo,
    // match 函数：从 match 目录导入
    match: sellTryInfoMatch,
    // 点击click之后关闭侧边抽屉
    clickDrawerHide: true,
  },
  // 后续可以在这里添加更多按钮配置
  // {
  //   id: "get-order-id",
  //   label: "获取订单ID",
  //   icon: "📋",
  //   onClick: handleGetOrderId,
  //   match: 由各自的match.ts来实现并暴露match函数,
  // },
];

/**
 * 获取当前页面可用的 action 列表
 * 根据每个 action 的 match 函数返回值动态过滤
 * @returns 匹配成功的 action 配置数组
 */
export function getAvailableActions(): ActionConfig[] {
  return ACTION_BUTTONS.filter((action) => action.match());
}
