/**
 * 数据生成逻辑 (dataGenerator.ts)
 */
import { store, parseProductId } from "../helper";

/**
 * 批量生成 SKU 表格数据
 * @param price 售价
 * @returns 格式化后的表格字符串
 */
export function generateSkuTableData(price: string): string {
  const productId = parseProductId() || "未知ID";

  // 表头
  let result = "颜色\t尺码\t价格（元）\t数量\t商家编码\t\n";

  // 拼接数据
  store.selectedColors.forEach((color) => {
    store.selectedSizes.forEach((size) => {
      result += `${color}\t${size}\t${price}\t200\t${productId}\t\n`;
    });
  });

  return result;
}
