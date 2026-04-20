/**
 * 复制所有商品ID交互处理函数
 * 实际交互逻辑在此文件中实现
 *
 * 逻辑说明：
 * 1. 检查getItemId的产物是否存在于DOM中
 * 2. 如果不存在，先触发getItemId获取商品ID
 * 3. 获取所有订单的商品ID，每行一个写入剪贴板
 */

import { handleGetItemId } from "@/Tmall-MySellerEnhance/action/getItemId/getItemId.action";
import { copyToClipboard } from "@/Tmall-MySellerEnhance/helper";

/**
 * 检查getItemId的产物是否存在于DOM中
 * @returns true表示存在，false表示不存在
 */
function checkItemIdDisplayExists(): boolean {
  const displays = document.querySelectorAll(".tmall-order-enhance-item-code");
  return displays.length > 0;
}

/**
 * 从DOM中获取所有商品ID
 * @returns 商品ID数组
 */
function getAllItemIdsFromDOM(): string[] {
  const itemIds: string[] = [];
  
  // 获取所有商品编码展示元素
  const displays = document.querySelectorAll(".tmall-order-enhance-item-code-value");
  
  displays.forEach((display) => {
    const text = display.textContent?.trim();
    if (text) {
      itemIds.push(text);
    }
  });
  
  return itemIds;
}

/**
 * 主处理函数：复制所有商品ID到剪贴板
 */
export async function handleCopyAllItemIds(): Promise<void> {
  console.log("执行复制所有商品ID逻辑...");
  
  // 1. 检查getItemId的产物是否存在于DOM中
  const itemIdExists = checkItemIdDisplayExists();
  
  if (!itemIdExists) {
    console.log("商品ID展示不存在，先触发getItemId获取商品ID...");
    
    // 先触发getItemId
    await handleGetItemId();
    
    // 等待DOM更新
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 2. 获取所有商品ID
  const itemIds = getAllItemIdsFromDOM();
  
  if (itemIds.length === 0) {
    console.warn("未获取到任何商品ID");
    alert("未获取到商品ID，请确保页面有订单数据");
    return;
  }
  
  console.log(`共获取到 ${itemIds.length} 个商品ID`);
  
  // 3. 将商品ID每行一个写入剪贴板
  const textToCopy = itemIds.join("\n");
  
  const success = await copyToClipboard(textToCopy);
  
  if (success) {
    console.log("商品ID已复制到剪贴板");
    alert(`已复制 ${itemIds.length} 个商品ID到剪贴板`);
  } else {
    console.error("复制到剪贴板失败");
    alert("复制失败，请手动复制");
  }
}