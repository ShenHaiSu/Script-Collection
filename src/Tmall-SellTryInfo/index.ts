/**
 * 天猫千牛店铺新品试销信息自动获取脚本
 *
 * 模块化架构：
 * - config.ts: 全局配置
 * - types.ts: 类型定义
 * - utils.ts: 工具函数
 * - dom.ts: DOM 操作
 * - actions/: 动作系统（支持横向扩展）
 * - ui/: UI 组件
 * - meta.ts: 脚本元数据
 */

import { DEBUG_MODE, DEBUG_ITEM_COUNT, MESSAGES } from "./config";
import { dataStore, createDataStore } from "./utils";
import {
  createOverlay,
  removeOverlay,
  getTableRows,
  ensureClipboardPermission,
  getTargetDiv,
  waitForPageLoad,
  waitForInputs,
  extractItemInfoFromRow,
  getActionButtonFromRow,
  safeClickButton,
  switchToShareTab,
  clickGenerateTokenButton,
  readFromClipboard,
  closeDrawer,
} from "./dom";
import { showResultsTable } from "./ui/components";
import { initActions, ActionExecutor, buttonManager, createButtonConfig } from "./actions/index";
import { registerExampleActions, getExampleButtonConfigs } from "./actions/examples";

// #region 核心业务逻辑
/**
 * 处理"获取本页信息"按钮点击事件
 * 执行商品信息采集的完整流程
 */
async function handleGetInfo(): Promise<void> {
  // 1. 创建遮罩层，阻止用户交互
  const { element: overlay, updateProgress } = createOverlay();

  // 创建新的数据存储实例
  const store = createDataStore();

  try {
    // 2. 确保有剪切板访问权限
    updateProgress(0, 0, MESSAGES.requestingPermission);
    if (!(await ensureClipboardPermission())) return;

    // 3. 获取表格行数据
    let tableRows: HTMLTableRowElement[];
    try {
      updateProgress(0, 0, MESSAGES.gettingTableData);
      tableRows = getTableRows();
    } catch (error) {
      console.error("获取表格数据失败:", error);
      alert(error instanceof Error ? error.message : "获取表格数据失败");
      return;
    }

    // 4. 清空之前的采集数据
    store.clear();

    // 5. 逐个处理商品行
    let successCount = 0;
    const total = tableRows.length;

    // DEBUG 模式下仅处理前几条数据
    const processedRows = DEBUG_MODE ? tableRows.slice(0, DEBUG_ITEM_COUNT) : tableRows;
    if (DEBUG_MODE) {
      console.warn(`当前处于 DEBUG 模式，仅处理前 ${DEBUG_ITEM_COUNT} 条数据`);
    }

    for (let i = 0; i < processedRows.length; i++) {
      const tr = processedRows[i];
      updateProgress(i, total, MESSAGES.processingItem(i + 1));

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
        const duplicateIndex = store.findIndex(itemInfo.text);
        if (duplicateIndex !== -1) {
          const errorMsg = `检测到重复分享链接！当前第 ${i + 1} 个TR的分享链接与第 ${duplicateIndex + 1} 个TR的分享链接重复。`;
          console.error(errorMsg);

          // 关闭当前抽屉
          await closeDrawer();

          // 抛出解析错误
          const failData = {
            失败位置: `第 ${i + 1} 个TR`,
            重试次数: 1,
            商品ID: itemInfo.itemId,
            商品名称: itemInfo.itemName,
            分享链接: itemInfo.text,
            重复链接位置: `第 ${duplicateIndex + 1} 个TR`,
          };
          console.error("解析失效数据:", failData);
          alert(`解析失效：在第 ${i + 1} 个TR发生解析失效问题，已重试 1 次仍存在重复。\n\n详细数据：\n${JSON.stringify(failData, null, 2)}`);
          throw new Error(`解析失效：在第 ${i + 1} 个TR发生解析失效问题`);
        }

        // 存储采集结果
        store.add(itemInfo);
        console.log(`已采集商品：${itemInfo.itemId} - ${itemInfo.itemName}`);
        successCount++;

        // 更新进度
        updateProgress(i + 1, total, MESSAGES.processedItem(tr.getAttribute("data-row-key") || "未知商品"));

        // 关闭抽屉，准备处理下一项
        if (!(await closeDrawer())) console.warn("关闭抽屉失败，可能影响后续操作");
      } catch (error) {
        console.error(`处理商品行时发生错误:`, error, tr);
        // 解析失效时中断整个流程
        return;
      }
    }

    // 6. 输出采集结果
    const allResults = store.getAll();
    console.log(MESSAGES.completedWithCount(successCount, processedRows.length));
    console.log("获取到的所有信息：", allResults);

    if (allResults.length === 0) {
      alert(MESSAGES.noData);
    } else {
      // 显示采集结果表格
      showResultsTable(allResults);
    }
  } catch (error) {
    console.error("执行过程中发生未捕获错误:", error);
    alert(MESSAGES.error);
  } finally {
    // 移除遮罩层，恢复用户交互
    removeOverlay(overlay);
  }
}

// #region 初始化脚本逻辑
/**
 * 初始化脚本逻辑
 * 负责在页面加载后插入按钮，并绑定点击事件
 */
async function initScript(): Promise<void> {
  console.log(MESSAGES.initializing);

  // 初始化动作系统
  initActions();

  // 等待页面加载完毕
  await waitForPageLoad();

  // 等待目标输入框出现
  const inputs = await waitForInputs(2);

  if (inputs.length !== 2) {
    console.error(MESSAGES.noInputFields);
    return;
  }

  // 获取目标 div
  const targetDiv = getTargetDiv();
  if (!targetDiv) {
    console.error("无法获取目标容器");
    return;
  }

  // 初始化按钮管理器
  buttonManager.init(targetDiv);

  // 注册主按钮
  buttonManager.registerButton(
    createButtonConfig(
      "btn-get-info",
      "获取本页信息",
      async () => {
        await handleGetInfo();
      },
      10, // 优先级，数字越小越靠前
    ),
  );

  // 注册示例按钮（可选，取消注释以启用）
  // registerExampleActions();
  // const exampleConfigs = getExampleButtonConfigs();
  // exampleConfigs.forEach((config) => buttonManager.registerButton(config));

  console.log(MESSAGES.initialized);
}

// #region 脚本入口
/**
 * 脚本主入口函数
 * 启动脚本并初始化
 */
function main(): void {
  console.log(MESSAGES.started);
  initScript().then(() => {});
}

// 启动脚本
main();
