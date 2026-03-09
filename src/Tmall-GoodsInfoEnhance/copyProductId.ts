/**
 * 复制商品 ID 功能 (copyProductId.ts)
 */
import { parseProductId, copyToClipboard } from "./helper";

/**
 * 获取当前商品的 ID 并复制到剪切板
 */
export function copyProductIdAction() {
  const id = parseProductId();
  if (id) {
    copyToClipboard(id);
  } else {
    console.error("[Tmall-GoodsInfoEnhance] 未能解析到商品ID");
  }
}
