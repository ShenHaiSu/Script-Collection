/**
 * 获取商品 ID 交互处理函数
 * 实际交互逻辑在此文件中实现
 *
 * 逻辑说明：
 * 1. 获取所有订单表格 (每个table代表一个父订单)
 * 2. 遍历每个子订单行，获取商品图片链接
 * 3. 使用gmFetch请求链接获取商品快照
 * 4. 解析HTML中的JSON数据并输出到控制台
 * 5. 在每个子订单行中展示商品编码并添加复制按钮
 */

import { gmFetch } from "@/dev-tool/gmFetch";
import { createItemCodeDisplay, removeAllItemCodeDisplays } from "../ui/itemCodeDisplay";

/**
 * 订单子订单商品信息
 */
interface OrderItemInfo {
  /** 商品图片的a标签href */
  itemUrl: string;
  /** 所属父订单索引 */
  parentOrderIndex: number;
  /** 子订单在父订单中的索引 */
  itemIndex: number;
  /** 对应的 tr 元素 */
  trElement: HTMLTableRowElement;
}

/**
 * 解析商品快照HTML，提取JSON数据
 * @param html 完整的HTML响应内容
 * @returns 解析后的商品快照JSON对象
 */
function parseItemSnapshotHtml(html: string): any {
  // 创建一个临时的DOM解析器
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // 查找body中的script标签
  const scripts = doc.querySelectorAll("body script");

  for (const script of scripts) {
    const scriptContent = script.textContent;
    if (scriptContent) {
      // 尝试查找 JSON.parse() 调用的内容
      // 匹配模式: JSON.parse("...") 或 JSON.parse('...')
      const jsonParseMatch = scriptContent.match(/JSON\.parse\s*\(\s*(['"`])([\s\S]*?)\1\s*\)/);

      if (jsonParseMatch && jsonParseMatch[2]) {
        try {
          // 解析转义的JSON字符串
          const jsonStr = jsonParseMatch[2].replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, "\\");

          return JSON.parse(jsonStr);
        } catch (e) {
          console.error("解析JSON失败:", e);
          // 尝试直接解析整个script内容作为JSON
          try {
            return JSON.parse(scriptContent);
          } catch (e2) {
            console.error("直接解析script内容也失败:", e2);
          }
        }
      }
    }
  }

  // 如果没找到script标签，尝试直接在HTML中查找JSON对象
  // 匹配常见的JSON对象模式
  const jsonObjectMatch = html.match(/\{[\s\S]*"itemId"[\s\S]*\}/);
  if (jsonObjectMatch) {
    try {
      return JSON.parse(jsonObjectMatch[0]);
    } catch (e) {
      console.error("从HTML中提取JSON对象失败:", e);
    }
  }

  return null;
}

/**
 * 从子订单行中获取商品图片链接
 * @param tr 子订单的tr元素
 * @returns 商品详情页URL，如果未找到则返回null
 */
function getItemUrlFromTr(tr: HTMLTableRowElement): string | null {
  // 在tr中查询 td > div > div > a > img
  const img = tr.querySelector<HTMLImageElement>("td > div > div > a > img");

  if (!img) return null;

  // 获取img的父级a标签
  const anchor = img.parentElement;

  if (!anchor || anchor.tagName !== "A") return null;

  const href = anchor.getAttribute("href");
  return href;
}

/**
 * 获取所有订单表格中的子订单商品信息
 * @returns 子订单商品信息列表
 */
function collectOrderItems(): OrderItemInfo[] {
  // 选择器: div.next-table.next-table-medium div.next-table-body > table
  const tables = document.querySelectorAll<HTMLTableElement>("div.next-table.next-table-medium div.next-table-body > table");

  const orderItems: OrderItemInfo[] = [];

  // 遍历每个父订单表格
  tables.forEach((table, parentIndex) => {
    // 获取tbody
    const tbody = table.querySelector<HTMLTableSectionElement>("tbody");

    if (!tbody) {
      console.warn(`父订单 ${parentIndex + 1} 没有tbody`);
      return;
    }

    // 获取所有tr (第一个tr是父订单头信息，从第二个开始是子订单)
    const rows = tbody.querySelectorAll<HTMLTableRowElement>("tr");

    // 从第二个tr开始是子订单信息 (索引1开始)
    for (let i = 1; i < rows.length; i++) {
      const tr = rows[i];
      const itemUrl = getItemUrlFromTr(tr);

      if (itemUrl) {
        orderItems.push({
          itemUrl,
          parentOrderIndex: parentIndex,
          itemIndex: i - 1, // 子订单索引从0开始
          trElement: tr,
        });
      }
    }
  });

  return orderItems;
}

/**
 * 处理单个商品URL，获取并解析商品快照
 * @param itemUrl 商品详情页URL
 * @returns 解析后的商品快照数据
 */
async function fetchItemSnapshot(itemUrl: string): Promise<any> {
  try {
    // 使用gmFetch发送请求，绕过跨域限制
    const response = await gmFetch(itemUrl, {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": navigator.userAgent,
      },
    });

    if (!response.ok) {
      console.error(`请求失败: ${response.status} ${response.statusText}`);
      return null;
    }

    // 解析HTML获取JSON数据
    const jsonData = parseItemSnapshotHtml(response.responseText);

    return jsonData;
  } catch (error) {
    console.error("获取商品快照失败:", error);
    return null;
  }
}

/**
 * 从快照数据中提取商品编码 (itemId)
 * @param snapshotData 商品快照数据
 * @returns 商品编码，如果未找到则返回null
 */
function extractItemId(snapshotData: any): string | number | null {
  if (!snapshotData) return null;

  // 参考 data.json 的结构: baseSnapDO > itemSnapDO > itemId
  try {
    const itemId = snapshotData?.baseSnapDO?.itemSnapDO?.itemId;
    if (itemId !== undefined && itemId !== null) {
      return itemId;
    }
  } catch (e) {
    console.error("提取商品编码失败:", e);
  }

  return null;
}

/**
 * 主处理函数：获取所有子订单的商品快照信息
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
  // 实际获取商品 ID 逻辑
  // ========================================

  // 收集所有子订单的商品信息
  const orderItems = collectOrderItems();

  console.log(`共找到 ${orderItems.length} 个子订单商品`);

  if (orderItems.length === 0) {
    console.warn("未找到任何子订单商品信息");
    alert("未找到子订单商品信息");
    return;
  }

  // 移除之前可能存在的商品编码展示
  removeAllItemCodeDisplays();

  // 遍历每个商品，逐个获取快照数据
  console.log("开始获取商品快照数据...");

  for (let i = 0; i < orderItems.length; i++) {
    const item = orderItems[i];
    console.log(`\n--- 处理第 ${i + 1} 个商品 (父订单${item.parentOrderIndex + 1}, 子订单${item.itemIndex + 1}) ---`);
    console.log("商品URL:", item.itemUrl);

    // 获取商品快照
    const snapshotData = await fetchItemSnapshot(item.itemUrl);

    if (snapshotData) {
      console.log("商品快照数据:", snapshotData);

      // 从快照数据中提取商品编码
      const itemId = extractItemId(snapshotData);

      if (itemId !== null) {
        console.log("商品编码 (itemId):", itemId);

        // 在子订单行中展示商品编码并添加复制按钮
        createItemCodeDisplay({
          itemId: itemId,
          parentOrderIndex: item.parentOrderIndex,
          itemIndex: item.itemIndex,
          trElement: item.trElement,
        });
      } else {
        console.warn("未能从快照数据中提取到商品编码");
      }
    } else {
      console.warn("未能获取到商品快照数据");
    }
  }

  console.log("\n获取商品 ID 逻辑执行完成");
}