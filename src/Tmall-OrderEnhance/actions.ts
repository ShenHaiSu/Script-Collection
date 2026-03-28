/**
 * 订单增强交互逻辑 (actions.ts)
 * 存放实际的交互逻辑处理代码，不包含 UI 构建
 */

/**
 * 获取商品 ID 交互处理函数
 */
export async function handleGetItemId(): Promise<void> {
  console.log("执行获取商品 ID 逻辑...");

  // 1. 在 Document 中 query "div.next-table.next-table-medium div.next-table-body"
  const tableBody = document.querySelector<HTMLElement>("div.next-table.next-table-medium div.next-table-body");

  if (!tableBody) {
    console.warn("未找到订单表格容器 div.next-table.next-table-medium div.next-table-body");
    alert("未找到订单表格容器，请确保在订单列表页面");
    return;
  }

  // 2. 获取 childNodes 的 length
  const childNodesLength = tableBody.childNodes.length;

  console.log("表格内容子节点数量:", childNodesLength);

  // 3. 如果 length === 1，检查 innerText 是否为 "没有符合条件的宝贝，请尝试其他搜索条件。"
  if (childNodesLength === 1) {
    const firstChild = tableBody.childNodes[0];
    const innerText = firstChild.textContent?.trim() ?? "";

    const emptyMessage = "没有符合条件的宝贝，请尝试其他搜索条件。";

    if (innerText === emptyMessage) {
      console.log("当前展示订单的位置下没有任何订单展示，无需进行后续操作");
      alert("当前页面没有订单数据");
      return;
    }
  }

  // 4. 如果 length !== 1 或者内容不是 "没有符合条件的宝贝"，说明订单信息列表中有结果
  console.log("订单信息列表中有结果，准备执行获取商品 ID 逻辑");

  // ========================================
  // TODO: 在此处编写实际的获取商品 ID 逻辑
  // ========================================

  console.log("获取商品 ID 逻辑执行完成");
  // alert("获取商品 ID 功能开发中...");
}

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