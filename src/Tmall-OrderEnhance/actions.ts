/**
 * 订单增强交互逻辑 (actions.ts)
 * 交互函数挂载点 - 仅负责导入和挂载，实际逻辑在 /action 目录下实现
 */

// 从 action 目录导入实际交互处理函数
import { handleGetItemId } from "@/Tmall-OrderEnhance/action/getItemId";

// 重新导出供外部使用
export { handleGetItemId };

/**
 * 交互按钮配置列表
 * 用于配置 Drawer 中显示的按钮
 */
export const ACTION_BUTTONS = [
  {
    id: "get-item-id",
    label: "获取商品id",
    icon: "🔗",
    onClick: handleGetItemId,
  },
  // 后续可以在这里添加更多按钮配置
  // {
  //   id: "get-order-id",
  //   label: "获取订单ID",
  //   icon: "📋",
  //   onClick: handleGetOrderId,
  // },
];
