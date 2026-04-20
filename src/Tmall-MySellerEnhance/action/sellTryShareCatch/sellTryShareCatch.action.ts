/**
 * 新品试销信息自动获取交互处理函数
 * 实际交互逻辑在此文件中实现
 *
 * 逻辑说明：
 * 1. 获取所有商品表格行 (table > tbody > tr[data-row-key])
 * 2. 遍历每个商品行，提取商品信息：
 *    - 商品图片 URL
 *    - 商品 ID
 *    - 商品名称
 * 3. 点击操作按钮打开详情抽屉
 * 4. 切换到分享 tab
 * 5. 点击生成口令按钮
 * 6. 读取剪切板中的分享链接
 * 7. 验证数据完整性（检测重复链接）
 * 8. 显示采集结果表格
 */

import { showResultsTable, createProgressOverlay, createDualProgressOverlay } from "@/Tmall-MySellerEnhance/ui/component/sellTryShareCatch.ui";
import type { SellTryInfoResult } from "@/Tmall-MySellerEnhance/ui/component/sellTryShareCatch.ui";

/**
 * 数据存储容器
 */
class DataStore {
  private results: SellTryInfoResult[] = [];

  clear(): void {
    this.results.length = 0;
  }

  add(item: SellTryInfoResult): void {
    this.results.push(item);
  }

  getAll(): SellTryInfoResult[] {
    return [...this.results];
  }

  findIndex(text: string): number {
    if (!text || this.results.length === 0) return -1;
    // 从末尾向前比较
    for (let i = this.results.length - 1; i >= 0; i--) {
      if (this.results[i].text === text) return i;
    }
    return -1;
  }
}

// 创建数据存储实例
const dataStore = new DataStore();

// #region 选择器配置
const SELECTORS = {
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

  // Tab 切换
  shareTab: "div.tbd-tabs-nav-wrap div[data-node-key='item']",

  // 抽屉弹窗
  drawerContent: "div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body > div",
  drawerButtons: "div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body > div > button",

  // 分页器
  pagination: "ul.tbd-pagination",
  paginationNext: "li.tbd-pagination-next",
  paginationNextDisabled: "li.tbd-pagination-next.tbd-pagination-disabled",
  paginationItem: "li.tbd-pagination-item",
  paginationItemActive: "li.tbd-pagination-item-active",
} as const;

// 延迟配置
const BUTTON_CLICK_DELAY = 800;
const DRAWER_OPEN_DELAY = 1000;
const PAGE_LOAD_DELAY = 1500;
// #endregion

// #region 分页相关函数
/**
 * 获取分页器信息
 */
function getPaginationInfo(): { currentPage: number; totalPages: number; hasNextPage: boolean } {
  const pagination = document.querySelector<HTMLUListElement>(SELECTORS.pagination);
  if (!pagination) {
    console.warn("未找到分页器");
    return { currentPage: 1, totalPages: 1, hasNextPage: false };
  }

  // 获取当前页码
  const activeItem = pagination.querySelector<HTMLLIElement>(SELECTORS.paginationItemActive);
  const currentPage = activeItem ? parseInt(activeItem.textContent?.trim() || "1", 10) : 1;

  // 获取所有页码项
  const pageItems = Array.from(pagination.querySelectorAll<HTMLLIElement>(SELECTORS.paginationItem));
  const pageNumbers = pageItems
    .map((item) => {
      const text = item.textContent?.trim();
      const num = parseInt(text || "0", 10);
      return num > 0 ? num : 0;
    })
    .filter((num) => num > 0);

  const totalPages = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;

  // 检查是否有下一页
  const nextButton = pagination.querySelector<HTMLLIElement>(SELECTORS.paginationNextDisabled);
  const hasNextPage = !nextButton;

  console.log(`分页信息: 当前第${currentPage}页, 共${totalPages}页, 是否有下一页: ${hasNextPage}`);

  return { currentPage, totalPages, hasNextPage };
}

/**
 * 点击下一页按钮
 */
async function clickNextPage(): Promise<boolean> {
  const pagination = document.querySelector<HTMLUListElement>(SELECTORS.pagination);
  if (!pagination) {
    console.warn("未找到分页器");
    return false;
  }

  // 查找下一页按钮（未禁用的）
  const nextButton = pagination.querySelector<HTMLButtonElement>(
    `${SELECTORS.paginationNext}:not(.tbd-pagination-disabled) button`
  );

  if (!nextButton) {
    console.warn("未找到可点击的下一页按钮");
    return false;
  }

  try {
    nextButton.click();
    await sleep(PAGE_LOAD_DELAY);
    return true;
  } catch (error) {
    console.error("点击下一页失败:", error);
    return false;
  }
}

/**
 * 等待页面数据加载完成
 */
async function waitForPageLoad(): Promise<boolean> {
  await sleep(PAGE_LOAD_DELAY);
  // 验证表格数据是否加载完成
  try {
    getTableRows();
    return true;
  } catch {
    console.warn("页面数据未加载完成，重试中...");
    await sleep(PAGE_LOAD_DELAY);
    try {
      getTableRows();
      return true;
    } catch {
      return false;
    }
  }
}
// #endregion

// #region 工具函数
/**
 * 等待指定的时间（毫秒）
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 清理字符串（去除首尾空白）
 */
function trim(str: string | null | undefined): string {
  return str?.trim() ?? "";
}

/**
 * 安全地点击按钮元素
 */
async function safeClickButton(
  button: HTMLButtonElement | HTMLElement | null,
  delay: number = BUTTON_CLICK_DELAY
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

/**
 * 从剪切板读取分享链接
 */
async function readFromClipboard(): Promise<string> {
  try {
    const text = await navigator.clipboard.readText();
    console.log("剪切板内容:", text);
    return text || "";
  } catch (error) {
    console.error("读取剪切板失败:", error);
    return "";
  }
}

/**
 * 检查并请求剪切板权限
 */
async function ensureClipboardPermission(): Promise<boolean> {
  try {
    await navigator.clipboard.readText();
    return true;
  } catch (err) {
    console.log("正在请求剪切板权限...", err);
    try {
      await navigator.clipboard.readText();
      return true;
    } catch {
      console.error("剪切板权限被拒绝");
      alert("请授予剪切板访问权限以继续执行脚本");
      return false;
    }
  }
}
// #endregion

// #region DOM 操作
/**
 * 从表格行中提取商品信息
 */
function extractItemInfoFromRow(tr: HTMLTableRowElement): SellTryInfoResult | null {
  try {
    // 获取商品图片 URL
    const img = tr.querySelector<HTMLImageElement>(SELECTORS.itemImage);
    const imgUrl = img?.src ?? "";

    // 获取商品 ID
    const itemId = tr.getAttribute(SELECTORS.tableRowKey) ?? "";

    // 获取商品标题
    const itemLink = tr.querySelector(SELECTORS.itemLink);
    const itemName = trim(itemLink?.innerText);

    // 基础数据验证
    if (!itemId) {
      console.warn("商品行缺少 data-row-key 属性", tr);
      return null;
    }

    return { imgUrl, text: "", itemId, itemName };
  } catch (error) {
    console.error("提取商品信息失败:", error);
    return null;
  }
}

/**
 * 获取表格行中的操作按钮
 */
function getActionButtonFromRow(tr: HTMLTableRowElement): HTMLButtonElement | null {
  const tds = tr.querySelectorAll("td");
  if (tds.length === 0) return null;

  const lastTd = tds[tds.length - 1];
  return lastTd?.querySelector("button") ?? null;
}

/**
 * 获取页面表格数据
 */
function getTableRows(): HTMLTableRowElement[] {
  const tbody = document.querySelector(SELECTORS.tableBody);
  if (!tbody) {
    throw new Error("未找到表格数据 (table > tbody)");
  }

  const trs = Array.from(tbody.querySelectorAll<HTMLTableRowElement>(SELECTORS.tableRow));
  if (trs.length === 0) {
    throw new Error("未找到有效的商品行数据");
  }

  return trs;
}

/**
 * 切换到直接分享 tab 页面
 */
async function switchToShareTab(): Promise<boolean> {
  const tabs = document.querySelectorAll<HTMLElement>(SELECTORS.shareTab);
  if (tabs.length === 0) {
    console.warn("未找到分享 tab 元素");
    return false;
  }

  try {
    tabs[0].click();
    await sleep(BUTTON_CLICK_DELAY);
    return true;
  } catch (error) {
    console.error("切换分享 tab 失败:", error);
    return false;
  }
}

/**
 * 点击生成口令按钮
 */
async function clickGenerateTokenButton(): Promise<boolean> {
  const drawerDivs = document.querySelectorAll<HTMLElement>(SELECTORS.drawerContent);

  if (drawerDivs.length === 0) {
    console.warn("未找到抽屉弹窗内容");
    return false;
  }

  const lastDiv = drawerDivs[drawerDivs.length - 1];
  const generateButton = lastDiv.querySelector("button");
  return await safeClickButton(generateButton, BUTTON_CLICK_DELAY);
}

/**
 * 关闭当前抽屉弹窗
 */
async function closeDrawer(): Promise<boolean> {
  const buttonList = document.querySelectorAll(SELECTORS.drawerButtons);

  if (buttonList.length < 2) {
    console.warn("未找到足够的关闭按钮");
    return false;
  }

  return await safeClickButton(buttonList[1] as HTMLElement, BUTTON_CLICK_DELAY);
}

/**
 * 等待抽屉打开
 */
async function waitForDrawerOpen(): Promise<void> {
  await sleep(DRAWER_OPEN_DELAY);
}
// #endregion

/**
 * 处理"获取本页信息"按钮点击事件
 * 执行商品信息采集的完整流程（支持多页采集）
 */
export async function handleSellTryInfo(): Promise<void> {
  // 1. 首先分析分页信息
  const paginationInfo = getPaginationInfo();
  const { currentPage, totalPages, hasNextPage } = paginationInfo;

  // 计算需要获取的页数
  let pagesToFetch = 0;
  if (hasNextPage || totalPages > 1) {
    // 有后续页面，询问用户
    const remainingPages = totalPages - currentPage;
    const input = prompt(
      `当前第 ${currentPage} 页，共 ${totalPages} 页。\n` +
      `后续还有 ${remainingPages} 页需要获取。\n\n` +
      `请输入要向后获取的页数（不输入或输入0则仅获取当前页，输入1为获取两页）:`
    );
    pagesToFetch = parseInt(input || "0", 10);
    if (isNaN(pagesToFetch) || pagesToFetch < 0) pagesToFetch = 0;
    // 限制最大页数不超过剩余页数
    if (pagesToFetch > remainingPages) pagesToFetch = remainingPages;
  }

  const totalPagesToFetch = pagesToFetch + 1; // 包含当前页

  // 2. 根据是否需要多页选择不同的进度遮罩层
  const useDualProgress = pagesToFetch > 0;
  const { overlay, updateProgress, isCancelled } = useDualProgress
    ? createDualProgressOverlay()
    : createProgressOverlay();

  try {
    // 3. 确保有剪切板访问权限
    if (useDualProgress) {
      (updateProgress as (pc: number, pt: number, ic: number, it: number, m: string) => void)(
        0, totalPagesToFetch, 0, 1, "正在请求剪切板权限..."
      );
    } else {
      (updateProgress as (c: number, t: number, m: string) => void)(0, 0, "正在请求剪切板权限...");
    }
    if (!(await ensureClipboardPermission())) {
      overlay.remove();
      return;
    }

    // 检查是否已取消
    if (isCancelled()) {
      overlay.remove();
      return;
    }

    // 4. 清空之前的采集数据
    dataStore.clear();

    // 5. 逐页处理
    let successCount = 0;
    let currentPageNum = currentPage;

    for (let pageIndex = 0; pageIndex < totalPagesToFetch; pageIndex++) {
      // 检查是否已取消
      if (isCancelled()) {
        console.log("用户取消了采集任务");
        try {
          await closeDrawer();
        } catch {
          // 忽略关闭抽屉的错误
        }
        overlay.remove();
        return;
      }

      // 获取当前页的表格数据
      let tableRows: HTMLTableRowElement[];
      try {
        if (useDualProgress) {
          (updateProgress as (pc: number, pt: number, ic: number, it: number, m: string) => void)(
            pageIndex + 1, totalPagesToFetch, 0, 1, "正在获取表格数据..."
          );
        } else {
          (updateProgress as (c: number, t: number, m: string) => void)(0, 1, "正在获取表格数据...");
        }
        tableRows = getTableRows();
      } catch (error) {
        console.error("获取表格数据失败:", error);
        alert(error instanceof Error ? error.message : "获取表格数据失败");
        overlay.remove();
        return;
      }

      const totalItems = tableRows.length;

      // 6. 逐个处理当前页的商品行
      for (let i = 0; i < tableRows.length; i++) {
        // 检查是否已取消
        if (isCancelled()) {
          console.log("用户取消了采集任务");
          try {
            await closeDrawer();
          } catch {
            // 忽略关闭抽屉的错误
          }
          overlay.remove();
          return;
        }

        const tr = tableRows[i];

        // 更新进度（双进度条或单进度条）
        if (useDualProgress) {
          (updateProgress as (pc: number, pt: number, ic: number, it: number, m: string) => void)(
            pageIndex + 1,
            totalPagesToFetch,
            i + 1,
            totalItems,
            `正在处理第 ${pageIndex + 1} 页第 ${i + 1} 个商品...`
          );
        } else {
          (updateProgress as (c: number, t: number, m: string) => void)(i, totalItems, `正在处理第 ${i + 1} 个商品...`);
        }

        try {
          // 提取商品基础信息
          const itemInfo = extractItemInfoFromRow(tr);
          if (!itemInfo) {
            console.warn("跳过无效商品行");
            continue;
          }

          // 获取并点击操作按钮，打开详情抽屉
          const actionButton = getActionButtonFromRow(tr);
          if (!(await safeClickButton(actionButton, 1000))) {
            console.warn("无法打开商品详情抽屉，跳过此项");
            continue;
          }

          // 等待抽屉打开
          await waitForDrawerOpen();

          // 切换到分享 tab
          if (!(await switchToShareTab())) {
            console.warn("切换分享 tab 失败，尝试继续处理");
          }

          // 点击生成口令按钮
          if (!(await clickGenerateTokenButton())) {
            console.warn("生成口令失败，尝试继续处理");
          }

          // 读取剪切板中的分享链接
          itemInfo.text = await readFromClipboard();

          // 验证数据完整性
          if (!itemInfo.text) console.warn("采集到的分享链接为空，但仍记录数据");

          // 检查重复（从末尾向前比较）
          const duplicateIndex = dataStore.findIndex(itemInfo.text);
          if (duplicateIndex !== -1) {
            const errorMsg = `检测到重复分享链接！当前第 ${pageIndex + 1} 页第 ${i + 1} 个TR的分享链接与第 ${duplicateIndex + 1} 个TR的分享链接重复。`;
            console.error(errorMsg);

            // 关闭当前抽屉
            await closeDrawer();

            // 抛出解析错误
            const failData = {
              失败位置: `第 ${pageIndex + 1} 页第 ${i + 1} 个TR`,
              重试次数: 1,
              商品ID: itemInfo.itemId,
              商品名称: itemInfo.itemName,
              分享链接: itemInfo.text,
              重复链接位置: `第 ${duplicateIndex + 1} 个TR`,
            };
            console.error("解析失效数据:", failData);
            alert(`解析失效：在第 ${pageIndex + 1} 页第 ${i + 1} 个TR发生解析失效问题，已重试 1 次仍存在重复。\n\n详细数据：\n${JSON.stringify(failData, null, 2)}`);
            throw new Error(`解析失效：在第 ${pageIndex + 1} 页第 ${i + 1} 个TR发生解析失效问题`);
          }

          // 存储采集结果
          dataStore.add(itemInfo);
          console.log(`已采集商品：${itemInfo.itemId} - ${itemInfo.itemName}`);
          successCount++;

          // 更新进度
          if (useDualProgress) {
            (updateProgress as (pc: number, pt: number, ic: number, it: number, m: string) => void)(
              pageIndex + 1,
              totalPagesToFetch,
              i + 1,
              totalItems,
              `已处理: ${tr.getAttribute("data-row-key") || "未知商品"}`
            );
          } else {
            (updateProgress as (c: number, t: number, m: string) => void)(
              i + 1,
              totalItems,
              `已处理: ${tr.getAttribute("data-row-key") || "未知商品"}`
            );
          }

          // 关闭抽屉，准备处理下一项
          if (!(await closeDrawer())) console.warn("关闭抽屉失败，可能影响后续操作");
        } catch (error) {
          console.error(`处理商品行时发生错误:`, error, tr);
          // 解析失效时中断整个流程
          overlay.remove();
          return;
        }
      }

      // 7. 如果还有下一页，点击下一页继续采集
      if (pageIndex < totalPagesToFetch - 1) {
        console.log(`正在跳转到第 ${pageIndex + 2} 页...`);
        if (!(await clickNextPage())) {
          console.warn("翻页失败，停止采集");
          break;
        }

        // 等待页面加载完成
        if (!(await waitForPageLoad())) {
          console.warn("页面加载失败，停止采集");
          break;
        }
        currentPageNum++;
      }
    }

    // 8. 输出采集结果
    const allResults = dataStore.getAll();
    console.log(`采集完成，成功 ${successCount} 条`);
    console.log("获取到的所有信息：", allResults);

    if (allResults.length === 0) {
      alert("未采集到任何数据，请查看控制台日志。");
    } else {
      // 显示采集结果表格
      showResultsTable(allResults);
    }
  } catch (error) {
    console.error("执行过程中发生未捕获错误:", error);
    alert("执行过程中发生错误，详情请查看控制台。");
  } finally {
    // 移除遮罩层
    overlay.remove();
  }
}
