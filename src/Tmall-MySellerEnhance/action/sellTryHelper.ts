/**
 * 新品试销信息采集辅助函数
 * 仅供 sellTryBasicInfo 和 sellTryShareCatch 两个 action 使用
 */

// #region 选择器配置
/**
 * 通用选择器配置
 */
export const COMMON_SELECTORS = {
  // 表格相关
  tableBody: "table > tbody",
  tableRow: "tr[data-row-key]",
  tableRowKey: "data-row-key",

  // 商品信息
  itemImage: "td img",
  itemLink: "a",
  itemId: "data-row-key",

  // 操作按钮
  actionButton: "td:last-child button",

  // 分页器
  pagination: "ul.tbd-pagination",
  paginationNext: "li.tbd-pagination-next",
  paginationNextDisabled: "li.tbd-pagination-next.tbd-pagination-disabled",
  paginationItem: "li.tbd-pagination-item",
  paginationItemActive: "li.tbd-pagination-item-active",
} as const;

// 延迟配置
export const DELAY_CONFIG = {
  BUTTON_CLICK: 800,
  DRAWER_OPEN: 1000,
  PAGE_LOAD: 1500,
} as const;

// #endregion

// #region 工具函数

/**
 * 等待指定的时间（毫秒）
 * @param ms 毫秒数
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 清理字符串（去除首尾空白）
 * @param str 要清理的字符串
 */
export function trim(str: string | null | undefined): string {
  return str?.trim() ?? "";
}

/**
 * 安全地点击按钮元素
 * @param button 按钮元素
 * @param delay 点击后等待时间（毫秒）
 */
export async function safeClickButton(
  button: HTMLButtonElement | HTMLElement | null,
  delay: number = DELAY_CONFIG.BUTTON_CLICK
): Promise<boolean> {
  if (!button) {
    console.warn("按钮元素不存在，跳过点击操作");
    return false;
  }
  try {
    (button as HTMLElement).click();
    await sleep(delay);
    return true;
  } catch (error) {
    console.error("点击按钮失败:", error);
    return false;
  }
}

// #endregion

// #region 分页相关函数

/**
 * 获取分页器信息
 * @returns 分页信息对象
 */
export function getPaginationInfo(): { currentPage: number; totalPages: number; hasNextPage: boolean } {
  const pagination = document.querySelector<HTMLUListElement>(COMMON_SELECTORS.pagination);
  if (!pagination) {
    console.warn("未找到分页器");
    return { currentPage: 1, totalPages: 1, hasNextPage: false };
  }

  // 获取当前页码
  const activeItem = pagination.querySelector<HTMLLIElement>(COMMON_SELECTORS.paginationItemActive);
  const currentPage = activeItem ? parseInt(activeItem.textContent?.trim() || "1", 10) : 1;

  // 获取所有页码项
  const pageItems = Array.from(pagination.querySelectorAll<HTMLLIElement>(COMMON_SELECTORS.paginationItem));
  const pageNumbers = pageItems
    .map((item) => {
      const text = item.textContent?.trim();
      const num = parseInt(text || "0", 10);
      return num > 0 ? num : 0;
    })
    .filter((num) => num > 0);

  const totalPages = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;

  // 检查是否有下一页
  const nextButton = pagination.querySelector<HTMLLIElement>(COMMON_SELECTORS.paginationNextDisabled);
  const hasNextPage = !nextButton;

  console.log(`分页信息: 当前第${currentPage}页, 共${totalPages}页, 是否有下一页: ${hasNextPage}`);

  return { currentPage, totalPages, hasNextPage };
}

/**
 * 点击下一页按钮
 * @returns 是否点击成功
 */
export async function clickNextPage(): Promise<boolean> {
  const pagination = document.querySelector<HTMLUListElement>(COMMON_SELECTORS.pagination);
  if (!pagination) {
    console.warn("未找到分页器");
    return false;
  }

  // 查找下一页按钮（未禁用的）
  const nextButton = pagination.querySelector<HTMLButtonElement>(
    `${COMMON_SELECTORS.paginationNext}:not(.tbd-pagination-disabled) button`
  );

  if (!nextButton) {
    console.warn("未找到可点击的下一页按钮");
    return false;
  }

  try {
    nextButton.click();
    await sleep(DELAY_CONFIG.PAGE_LOAD);
    return true;
  } catch (error) {
    console.error("点击下一页失败:", error);
    return false;
  }
}

/**
 * 等待页面数据加载完成
 * @returns 是否加载成功
 */
export async function waitForPageLoad(): Promise<boolean> {
  await sleep(DELAY_CONFIG.PAGE_LOAD);
  // 验证表格数据是否加载完成
  try {
    getTableRows();
    return true;
  } catch {
    console.warn("页面数据未加载完成，重试中...");
    await sleep(DELAY_CONFIG.PAGE_LOAD);
    try {
      getTableRows();
      return true;
    } catch {
      return false;
    }
  }
}

// #endregion

// #region DOM 操作

/**
 * 获取页面表格数据
 * @returns 表格行元素数组
 */
export function getTableRows(): HTMLTableRowElement[] {
  const tbody = document.querySelector(COMMON_SELECTORS.tableBody);
  if (!tbody) {
    throw new Error("未找到表格数据 (table > tbody)");
  }

  const trs = Array.from(tbody.querySelectorAll<HTMLTableRowElement>(COMMON_SELECTORS.tableRow));
  if (trs.length === 0) {
    throw new Error("未找到有效的商品行数据");
  }

  return trs;
}

/**
 * 从表格行中提取商品基础信息（图片URL、商品ID、商品名称）
 * @param tr 表格行元素
 * @returns 商品信息对象或null
 */
export function extractItemInfoFromRow(tr: HTMLTableRowElement): { imgUrl: string; itemId: string; itemName: string } | null {
  try {
    // 获取商品图片 URL
    const img = tr.querySelector<HTMLImageElement>(COMMON_SELECTORS.itemImage);
    const imgUrl = img?.src ?? "";

    // 获取商品 ID
    const itemId = tr.getAttribute(COMMON_SELECTORS.tableRowKey) ?? "";

    // 获取商品标题
    const itemLink = tr.querySelector(COMMON_SELECTORS.itemLink);
    const itemName = trim(itemLink?.innerText);

    // 基础数据验证
    if (!itemId) {
      console.warn("商品行缺少 data-row-key 属性", tr);
      return null;
    }

    return { imgUrl, itemId, itemName };
  } catch (error) {
    console.error("提取商品信息失败:", error);
    return null;
  }
}

/**
 * 获取表格行中的操作按钮
 * @param tr 表格行元素
 * @returns 操作按钮元素或null
 */
export function getActionButtonFromRow(tr: HTMLTableRowElement): HTMLButtonElement | null {
  const tds = tr.querySelectorAll("td");
  if (tds.length === 0) return null;

  const lastTd = tds[tds.length - 1];
  return lastTd?.querySelector("button") ?? null;
}

// #endregion
