/**
 * 新品试销基本信息批量获取
 * 直接从HTML结构中爬取商品ID、商品图片、商品标题，无需模拟交互
 *
 * 逻辑说明：
 * 1. 获取分页器信息
 * 2. 询问用户需要获取的页数
 * 3. 逐页爬取商品基本信息（图片、ID、标题）
 * 4. 显示采集结果表格
 */

import {
  getPaginationInfo,
  clickNextPage,
  waitForPageLoad,
  getTableRows,
  extractItemInfoFromRow,
  sleep,
  DELAY_CONFIG,
} from "@/Tmall-MySellerEnhance/helper";
import { showBasicInfoResultsTable, createBasicInfoProgressOverlay } from "@/Tmall-MySellerEnhance/ui/component/sellTryBasicInfo.ui";
import type { SellTryBasicInfoResult } from "@/Tmall-MySellerEnhance/ui/component/sellTryBasicInfo.ui";

/**
 * 数据存储容器
 */
class BasicInfoDataStore {
  private results: SellTryBasicInfoResult[] = [];

  clear(): void {
    this.results.length = 0;
  }

  add(item: SellTryBasicInfoResult): void {
    this.results.push(item);
  }

  getAll(): SellTryBasicInfoResult[] {
    return [...this.results];
  }
}

// 创建数据存储实例
const basicInfoDataStore = new BasicInfoDataStore();

/**
 * 处理"批量获取基本信息"按钮点击事件
 * 执行商品基本信息采集的完整流程（支持多页采集）
 */
export async function handleSellTryBasicInfo(): Promise<void> {
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
        `请输入要向后获取的页数（不输入或输入0则仅获取当前页，输入1为获取两页）:`,
    );
    pagesToFetch = parseInt(input || "0", 10);
    if (isNaN(pagesToFetch) || pagesToFetch < 0) pagesToFetch = 0;
    // 限制最大页数不超过剩余页数
    if (pagesToFetch > remainingPages) pagesToFetch = remainingPages;
  }

  const totalPagesToFetch = pagesToFetch + 1; // 包含当前页

  // 2. 创建进度遮罩层
  const { overlay, updateProgress, isCancelled } = createBasicInfoProgressOverlay(totalPagesToFetch);

  try {
    // 3. 清空之前的采集数据
    basicInfoDataStore.clear();

    // 4. 逐页处理
    let successCount = 0;

    for (let pageIndex = 0; pageIndex < totalPagesToFetch; pageIndex++) {
      // 检查是否已取消
      if (isCancelled()) {
        console.log("用户取消了采集任务");
        overlay.remove();
        return;
      }

      // 获取当前页的表格数据
      let tableRows: HTMLTableRowElement[];
      try {
        updateProgress(pageIndex + 1, totalPagesToFetch, 0, 1, "正在获取表格数据...");
        tableRows = getTableRows();
      } catch (error) {
        console.error("获取表格数据失败:", error);
        alert(error instanceof Error ? error.message : "获取表格数据失败");
        overlay.remove();
        return;
      }

      const totalItems = tableRows.length;

      // 5. 逐个处理当前页的商品行（直接爬取，无需交互）
      for (let i = 0; i < tableRows.length; i++) {
        // 检查是否已取消
        if (isCancelled()) {
          console.log("用户取消了采集任务");
          overlay.remove();
          return;
        }

        const tr = tableRows[i];

        // 更新进度
        updateProgress(pageIndex + 1, totalPagesToFetch, i + 1, totalItems, `正在获取第 ${pageIndex + 1} 页第 ${i + 1} 个商品信息...`);

        try {
          // 直接从HTML结构中提取商品基本信息
          const itemInfo = extractItemInfoFromRow(tr);
          if (!itemInfo) {
            console.warn("跳过无效商品行");
            continue;
          }

          // 存储采集结果
          basicInfoDataStore.add(itemInfo);
          console.log(`已获取商品：${itemInfo.itemId} - ${itemInfo.itemName}`);
          successCount++;

          // 更新进度
          updateProgress(pageIndex + 1, totalPagesToFetch, i + 1, totalItems, `已获取: ${itemInfo.itemId}`);

          // 短暂延迟，避免过快
          await sleep(50);
        } catch (error) {
          console.error(`处理商品行时发生错误:`, error, tr);
        }
      }

      // 6. 如果还有下一页，点击下一页继续采集
      if (pageIndex < totalPagesToFetch - 1) {
        console.log(`正在跳转到第 ${pageIndex + 2} 页...`);

        // 更新进度
        updateProgress(pageIndex + 1, totalPagesToFetch, totalItems, totalItems, `正在翻页到第 ${pageIndex + 2} 页...`);

        if (!(await clickNextPage())) {
          console.warn("翻页失败，停止采集");
          break;
        }

        // 等待页面加载完成
        if (!(await waitForPageLoad())) {
          console.warn("页面加载失败，停止采集");
          break;
        }
      }
    }

    // 7. 输出采集结果
    const allResults = basicInfoDataStore.getAll();
    console.log(`采集完成，成功 ${successCount} 条`);
    console.log("获取到的所有信息：", allResults);

    if (allResults.length === 0) {
      alert("未采集到任何数据，请查看控制台日志。");
    } else {
      // 显示采集结果表格
      showBasicInfoResultsTable(allResults);
    }
  } catch (error) {
    console.error("执行过程中发生未捕获错误:", error);
    alert("执行过程中发生错误，详情请查看控制台。");
  } finally {
    // 移除遮罩层
    overlay.remove();
  }
}
