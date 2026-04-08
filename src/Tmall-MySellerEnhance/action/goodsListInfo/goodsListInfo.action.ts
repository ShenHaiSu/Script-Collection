/**
 * 商品列表信息增强交互处理函数
 * 实际交互逻辑在此文件中实现
 *
 * 逻辑说明：
 * 1. 在 Document 中 query table[role="table"] > tbody
 * 2. 遍历 tbody 中的所有 tr
 * 3. 采集每个 tr 中的商品数据：
 *    - 商品标题内容
 *    - 商品图片
 *    - 商品id
 *    - 商品编码（商家编码）
 *    - 价格
 *    - 库存
 *    - 累计销量
 *    - 30日销量
 *    - 创建时间
 * 4. 保存为数组
 * 5. 构造纯文本表格并复制到剪贴板
 */

import { copyToClipboard } from "@/Tmall-MySellerEnhance/ui/component/getItemId.ui";

/**
 * 商品列表数据项
 */
interface GoodsListItem {
  /** 商品图片URL */
  imageUrl: string;
  /** 商品ID */
  itemId: string;
  /** 商家编码 */
  itemCode: string;
  /** 商品标题 */
  title: string;
  /** 价格 */
  price: string;
  /** 库存 */
  stock: string;
  /** 累计销量 */
  totalSales: string;
  /** 30日销量 */
  thirtyDaySales: string;
  /** 创建时间 */
  createTime: string;
}

/**
 * 从 tr 元素中提取商品数据
 * @param tr 商品行的 tr 元素
 * @returns 商品数据对象
 */
function extractGoodsDataFromTr(tr: HTMLTableRowElement): GoodsListItem | null {
  try {
    // 获取所有 td
    const tds = tr.querySelectorAll<HTMLTableCellElement>("td");
    
    if (tds.length < 9) {
      console.warn("td 数量不足，跳过该行");
      return null;
    }

    // 第二列：商品标题（包含图片、ID、商家编码）
    const titleTd = tds[1];
    // 第三列：价格
    const priceTd = tds[2];
    // 第四列：库存
    const stockTd = tds[3];
    // 第五列：累计销量
    const totalSalesTd = tds[4];
    // 第六列：30日销量
    const thirtyDaySalesTd = tds[5];
    // 第八列：创建时间
    const createTimeTd = tds[7];

    // 提取商品图片
    const img = titleTd.querySelector<HTMLImageElement>("img.product-desc-extend-image");
    const imageUrl = img?.src || "";

    // 提取商品ID（从包含 "ID:" 的文本中）
    const idSpan = Array.from(titleTd.querySelectorAll("span")).find(
      (span) => span.textContent && span.textContent.includes("ID:")
    );
    let itemId = "";
    if (idSpan) {
      const match = idSpan.textContent?.match(/ID:(\d+)/);
      itemId = match ? match[1] : "";
    }

    // 提取商家编码（从包含 "编码:" 的文本中）
    const codeSpan = Array.from(titleTd.querySelectorAll("span")).find(
      (span) => span.textContent && span.textContent.includes("编码:")
    );
    let itemCode = "";
    if (codeSpan) {
      const match = codeSpan.textContent?.match(/编码:(\d+)/);
      itemCode = match ? match[1] : "";
    }

    // 提取商品标题
    const titleLink = titleTd.querySelector<HTMLAnchorElement>("a.title-link");
    const title = titleLink?.textContent?.trim() || "";

    // 提取价格
    const priceSpan = priceTd.querySelector(".price-value span");
    const price = priceSpan?.textContent?.trim() || "";

    // 提取库存
    const stockSpan = stockTd.querySelector(".quantity-item-label span.quantity");
    const stock = stockSpan?.textContent?.trim() || "";

    // 提取累计销量
    const totalSalesSpan = totalSalesTd.querySelector("span");
    const totalSales = totalSalesSpan?.textContent?.trim() || "";

    // 提取30日销量
    const thirtyDaySalesDiv = thirtyDaySalesTd.querySelector(".text-async-label");
    const thirtyDaySales = thirtyDaySalesDiv?.textContent?.trim() || "";

    // 提取创建时间
    const createTimeDiv = createTimeTd.querySelector(".product-desc-span");
    const createTime = createTimeDiv?.textContent?.trim() || "";

    return {
      imageUrl,
      itemId,
      itemCode,
      title,
      price,
      stock,
      totalSales,
      thirtyDaySales,
      createTime,
    };
  } catch (error) {
    console.error("提取商品数据失败:", error);
    return null;
  }
}

/**
 * 采集所有商品数据
 * @returns 商品数据数组
 */
function collectGoodsListData(): GoodsListItem[] {
  // 查找 table[role="table"] > tbody
  const table = document.querySelector<HTMLTableElement>('table[role="table"]');
  
  if (!table) {
    console.warn("未找到 table[role=\"table\"]");
    return [];
  }

  const tbody = table.querySelector<HTMLTableSectionElement>("tbody");
  
  if (!tbody) {
    console.warn("未找到 tbody");
    return [];
  }

  const rows = tbody.querySelectorAll<HTMLTableRowElement>("tr");
  
  console.log(`找到 ${rows.length} 个 tr`);

  const goodsList: GoodsListItem[] = [];

  rows.forEach((tr, index) => {
    // 跳过表头行（通常第一个tr是表头，可以通过class判断）
    if (tr.classList.contains("next-table-header")) {
      console.log(`跳过表头行 ${index}`);
      return;
    }

    const goodsData = extractGoodsDataFromTr(tr);
    
    if (goodsData) {
      goodsList.push(goodsData);
      console.log(`采集到商品 ${index}:`, goodsData.title);
    }
  });

  return goodsList;
}

/**
 * 构造纯文本表格
 * @param goodsList 商品数据数组
 * @returns 纯文本表格字符串
 */
function buildTextTable(goodsList: GoodsListItem[]): string {
  // 表头
  const header = ["商品图片", "商品ID", "商家编码", "商品标题", "价格", "库存", "累计销量", "30日销量", "创建时间"];
  
  // 构建表头行
  let tableText = header.join("\t") + "\n";

  // 构建数据行
  goodsList.forEach((item) => {
    // 不再输出图片到表格文本中（WPS无法解析webp图片）
    const row = [
      "",
      item.itemId,
      item.itemCode,
      item.title,
      item.price,
      item.stock,
      item.totalSales,
      item.thirtyDaySales,
      item.createTime,
    ];
    tableText += row.join("\t") + "\n";
  });

  return tableText;
}

/**
 * 主处理函数：采集商品列表数据并复制到剪贴板
 */
export async function handleGoodsListInfo(): Promise<void> {
  console.log("执行商品列表信息增强逻辑...");

  // 1. 查找 table[role="table"] > tbody
  const table = document.querySelector<HTMLTableElement>('table[role="table"]');

  if (!table) {
    console.warn("未找到 table[role=\"table\"]");
    alert("未找到商品列表表格，请确保在商品列表页面");
    return;
  }

  const tbody = table.querySelector<HTMLTableSectionElement>("tbody");

  if (!tbody) {
    console.warn("未找到 tbody");
    alert("未找到商品列表数据，请确保在商品列表页面");
    return;
  }

  // 2. 检查是否有数据
  const rows = tbody.querySelectorAll<HTMLTableRowElement>("tr");
  
  // 过滤掉表头行
  const dataRows = Array.from(rows).filter(
    (tr) => !tr.classList.contains("next-table-header") && tr.querySelectorAll("td").length >= 8
  );

  if (dataRows.length === 0) {
    console.log("当前页面没有商品数据");
    alert("当前页面没有商品数据");
    return;
  }

  console.log(`共有 ${dataRows.length} 条商品数据`);

  // 3. 采集商品数据
  const goodsList = collectGoodsListData();

  console.log(`采集到 ${goodsList.length} 条商品数据`);

  if (goodsList.length === 0) {
    console.warn("未能采集到任何商品数据");
    alert("未能采集到商品数据");
    return;
  }

  // 4. 构造纯文本表格
  const tableText = buildTextTable(goodsList);

  console.log("生成的表格文本:", tableText);

  // 5. 复制到剪贴板
  const success = await copyToClipboard(tableText);

  if (success) {
    console.log("已成功复制到剪贴板");
    alert(`已成功复制 ${goodsList.length} 条商品数据到剪贴板`);
  } else {
    console.error("复制到剪贴板失败");
    alert("复制到剪贴板失败，请手动复制");
  }
}