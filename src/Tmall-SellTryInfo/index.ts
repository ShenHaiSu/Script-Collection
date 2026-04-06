import { dataStore, sleep } from "./helper";
import { ScrapedResult } from "./type";
import { showResultsTable } from "./ui/table";

// #region 全局配置
/** 是否开启调试模式（开启后仅采集前两条数据） */
const DEBUG_MODE = false;

/** 调试模式下采集的数据条数 */
const DEBUG_ITEM_COUNT = 2;

/** 按钮点击后的等待时间（毫秒） */
const BUTTON_CLICK_DELAY = 800;

/** 抽屉弹窗打开后的等待时间（毫秒） */
const DRAWER_OPEN_DELAY = 1000;
// #endregion

// #region DOM 操作工具函数
/**
 * 创建页面遮罩层，用于在脚本执行期间阻止用户交互
 * @returns 遮罩层元素及其更新函数
 */
function createOverlay(): {
  overlay: HTMLElement;
  updateProgress: (current: number, total: number, message: string) => void;
} {
  const overlay = document.createElement("div");
  overlay.id = "script-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  overlay.style.zIndex = "9999";
  overlay.style.cursor = "not-allowed";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

  // 创建内容容器
  const content = document.createElement("div");
  content.style.textAlign = "center";
  content.style.color = "#fff";
  content.style.padding = "30px 40px";
  content.style.background = "rgba(0, 0, 0, 0.5)";
  content.style.borderRadius = "12px";
  content.style.backdropFilter = "blur(10px)";
  // content.style.webkitBackdropFilter = "blur(10px)"; // 浏览器兼容性考虑
  content.style.maxWidth = "400px";

  // 创建标题
  const title = document.createElement("div");
  title.style.fontSize = "20px";
  title.style.fontWeight = "600";
  title.style.marginBottom = "20px";
  title.textContent = "正在采集商品信息...";

  // 创建进度条容器
  const progressContainer = document.createElement("div");
  progressContainer.style.width = "300px";
  progressContainer.style.height = "8px";
  progressContainer.style.background = "rgba(255, 255, 255, 0.2)";
  progressContainer.style.borderRadius = "4px";
  progressContainer.style.overflow = "hidden";
  progressContainer.style.marginBottom = "16px";

  // 创建进度条
  const progressBar = document.createElement("div");
  progressBar.style.height = "100%";
  progressBar.style.width = "0%";
  progressBar.style.background = "linear-gradient(90deg, #1890ff, #52c41a)";
  progressBar.style.borderRadius = "4px";
  progressBar.style.transition = "width 0.3s ease";
  progressContainer.appendChild(progressBar);

  // 创建进度文本
  const progressText = document.createElement("div");
  progressText.style.fontSize = "14px";
  progressText.style.color = "rgba(255, 255, 255, 0.8)";
  progressText.style.marginBottom = "8px";
  progressText.textContent = "准备中...";

  // 创建状态文本
  const statusText = document.createElement("div");
  statusText.style.fontSize = "12px";
  statusText.style.color = "rgba(255, 255, 255, 0.6)";
  statusText.textContent = "";

  content.appendChild(title);
  content.appendChild(progressContainer);
  content.appendChild(progressText);
  content.appendChild(statusText);
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // 更新进度的函数
  const updateProgress = (current: number, total: number, message: string) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${current} / ${total} (${percentage}%)`;
    statusText.textContent = message;
    title.textContent = current >= total ? "采集完成!" : "正在采集商品信息...";
  };

  return { overlay, updateProgress };
}

/**
 * 安全地点击按钮元素
 * @param button 要点击的按钮元素
 * @param delay 点击后等待的时间（毫秒）
 * @returns 是否成功执行点击
 */
async function safeClickButton(button: HTMLButtonElement | HTMLElement | null, delay = BUTTON_CLICK_DELAY): Promise<boolean> {
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
 * 从表格行中提取商品信息
 * @param tr 表格行元素
 * @returns 商品信息对象，如果提取失败则返回 null
 */
function extractItemInfoFromRow(tr: HTMLTableRowElement): ScrapedResult | null {
  try {
    // 获取商品图片 URL
    const img = tr.querySelector<HTMLImageElement>("td img");
    const imgUrl = img?.src ?? "";

    // 获取商品 ID
    const itemId = tr.getAttribute("data-row-key") ?? "";

    // 获取商品标题
    const itemLink = tr.querySelector("a");
    const itemName = itemLink?.innerText?.trim() ?? "";

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
 * @param tr 表格行元素
 * @returns 操作按钮元素，如果未找到则返回 null
 */
function getActionButtonFromRow(tr: HTMLTableRowElement): HTMLButtonElement | null {
  const tds = tr.querySelectorAll("td");
  if (tds.length === 0) return null;

  const lastTd = tds[tds.length - 1];
  return lastTd?.querySelector("button") ?? null;
}

// #endregion

// #region 业务操作流程函数
/**
 * 切换到直接分享 tab 页面
 * @returns 是否成功切换
 */
async function switchToShareTab(): Promise<boolean> {
  const tabs = document.querySelectorAll<HTMLElement>("div.tbd-tabs-nav-wrap div[data-node-key='item']");
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
 * @returns 是否成功执行
 */
async function clickGenerateTokenButton(): Promise<boolean> {
  const drawerDivs = document.querySelectorAll<HTMLElement>("div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body > div");

  if (drawerDivs.length === 0) {
    console.warn("未找到抽屉弹窗内容");
    return false;
  }

  const lastDiv = drawerDivs[drawerDivs.length - 1];
  const generateButton = lastDiv.querySelector("button");
  return await safeClickButton(generateButton, BUTTON_CLICK_DELAY);
}

/**
 * 从剪切板读取分享链接
 * @returns 读取到的文本内容，失败时返回空字符串
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
 * 关闭当前抽屉弹窗
 * @returns 是否成功关闭
 */
async function closeDrawer(): Promise<boolean> {
  const buttonList = document.querySelectorAll("div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body > div > button");

  // 注意：索引 1 表示第二个按钮（关闭按钮）
  if (buttonList.length < 2) {
    console.warn("未找到足够的关闭按钮");
    return false;
  }

  return await safeClickButton(buttonList[1] as HTMLElement, BUTTON_CLICK_DELAY);
}

/**
 * 检查分享链接是否与已采集的数据重复
 * @param currentText 当前采集到的分享链接
 * @returns 重复的索引（从末尾向前查找），如果未重复返回 -1
 */
function checkDuplicate(currentText: string): number {
  const allResults = dataStore.getAll();
  if (!currentText || allResults.length === 0) return -1;

  // 从末尾向前比较
  for (let i = allResults.length - 1; i >= 0; i--) {
    if (allResults[i].text === currentText) return i;
  }
  return -1;
}

/**
 * 处理单个商品行的信息采集
 * @param tr 表格行元素
 * @param rowIndex 当前处理的行索引（从0开始）
 * @param retryCount 当前重试次数
 * @returns 是否处理成功
 */
async function processItemRow(tr: HTMLTableRowElement, rowIndex: number, retryCount = 0): Promise<boolean> {
  // 1. 提取商品基础信息
  const itemInfo = extractItemInfoFromRow(tr);
  if (!itemInfo) {
    console.warn("跳过无效商品行");
    return false;
  }

  // 2. 获取并点击操作按钮，打开详情抽屉
  const actionButton = getActionButtonFromRow(tr);
  if (!(await safeClickButton(actionButton, DRAWER_OPEN_DELAY))) {
    console.warn("无法打开商品详情抽屉，跳过此项");
    return false;
  }

  // 3. 切换到分享 tab
  if (!(await switchToShareTab())) {
    console.warn("切换分享 tab 失败，尝试继续处理");
  }

  // 4. 点击生成口令按钮
  if (!(await clickGenerateTokenButton())) {
    console.warn("生成口令失败，尝试继续处理");
  }

  // 5. 读取剪切板中的分享链接
  itemInfo.text = await readFromClipboard();

  // 6. 验证数据完整性
  if (!itemInfo.text) console.warn("采集到的分享链接为空，但仍记录数据");

  // 7. 检查分享链接是否与已采集的数据重复（从末尾向前比较）
  const duplicateIndex = checkDuplicate(itemInfo.text);
  if (duplicateIndex !== -1) {
    const errorMsg = `检测到重复分享链接！当前第 ${rowIndex + 1} 个TR的分享链接与第 ${duplicateIndex + 1} 个TR的分享链接重复。`;
    console.error(errorMsg);

    // 关闭当前抽屉
    await closeDrawer();

    // 如果重试次数小于2次，重新解析当前行
    if (retryCount < 2) {
      console.log(`正在第 ${retryCount + 1} 次重试解析第 ${rowIndex + 1} 个TR...`);
      return await processItemRow(tr, rowIndex, retryCount + 1);
    }

    // 重试超过2次，放弃整体任务
    const failData = {
      失败位置: `第 ${rowIndex + 1} 个TR`,
      重试次数: retryCount + 1,
      商品ID: itemInfo.itemId,
      商品名称: itemInfo.itemName,
      分享链接: itemInfo.text,
      重复链接位置: `第 ${duplicateIndex + 1} 个TR`,
    };
    console.error("解析失效数据:", failData);
    alert(`解析失效：在第 ${rowIndex + 1} 个TR发生解析失效问题，已重试 ${retryCount + 1} 次仍存在重复。\n\n详细数据：\n${JSON.stringify(failData, null, 2)}`);
    throw new Error(`解析失效：在第 ${rowIndex + 1} 个TR发生解析失效问题`);
  }

  // 8. 存储采集结果
  dataStore.add(itemInfo);
  console.log(`已采集商品：${itemInfo.itemId} - ${itemInfo.itemName}`);

  // 9. 关闭抽屉，准备处理下一项
  if (!(await closeDrawer())) console.warn("关闭抽屉失败，可能影响后续操作");

  return true;
}

/**
 * 获取页面表格数据并采集商品信息
 * @returns 采集到的商品行列表
 */
function getTableRows(): HTMLTableRowElement[] {
  const tbody = document.querySelector("table > tbody");
  if (!tbody) {
    throw new Error("未找到表格数据 (table > tbody)");
  }

  // 获取所有带有 data-row-key 属性的表格行
  const trs = Array.from(tbody.querySelectorAll<HTMLTableRowElement>("tr[data-row-key]"));
  if (trs.length === 0) {
    throw new Error("未找到有效的商品行数据");
  }

  // DEBUG 模式下仅处理前几条数据
  if (DEBUG_MODE) {
    console.warn(`当前处于 DEBUG 模式，仅处理前 ${DEBUG_ITEM_COUNT} 条数据`);
    return trs.slice(0, DEBUG_ITEM_COUNT);
  }

  return trs;
}

/**
 * 检查并请求剪切板权限
 * @returns 是否成功获取权限
 */
async function ensureClipboardPermission(): Promise<boolean> {
  try {
    await navigator.clipboard.readText();
    return true;
  } catch (err) {
    console.log("正在请求剪切板权限...", err);
    try {
      // 触发权限请求
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

// #region 核心业务逻辑
/**
 * 处理"获取本页信息"按钮点击事件
 * 执行商品信息采集的完整流程
 */
async function handleGetInfo(): Promise<void> {
  // 1. 创建遮罩层，阻止用户交互
  const { overlay, updateProgress } = createOverlay();

  try {
    // 2. 确保有剪切板访问权限
    updateProgress(0, 0, "正在请求剪切板权限...");
    if (!(await ensureClipboardPermission())) return;

    // 3. 获取表格行数据
    let tableRows: HTMLTableRowElement[];
    try {
      updateProgress(0, 0, "正在获取表格数据...");
      tableRows = getTableRows();
    } catch (error) {
      console.error("获取表格数据失败:", error);
      alert(error instanceof Error ? error.message : "获取表格数据失败");
      return;
    }

    // 4. 清空之前的采集数据
    dataStore.clear();

    // 5. 逐个处理商品行
    let successCount = 0;
    const total = tableRows.length;
    for (let i = 0; i < tableRows.length; i++) {
      const tr = tableRows[i];
      updateProgress(i, total, `正在处理第 ${i + 1} 个商品...`);
      try {
        const success = await processItemRow(tr, i);
        if (success) successCount++;
        updateProgress(i + 1, total, `已处理: ${tr.getAttribute("data-row-key") || "未知商品"}`);
      } catch (error) {
        console.error(`处理商品行时发生错误:`, error, tr);
        // 解析失效时中断整个流程
        return;
      }
    }

    // 6. 输出采集结果
    const allResults = dataStore.getAll();
    console.log(`采集完成，成功 ${successCount}/${tableRows.length} 条`);
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
    // 移除遮罩层，恢复用户交互
    overlay.remove();
  }
}

/**
 * 初始化脚本逻辑
 * 负责在页面加载后插入按钮，并绑定点击事件
 */
async function initScript(): Promise<void> {
  console.log("天猫千牛店铺新品试销信息自动获取脚本初始化中...");

  // 等待页面加载完毕
  if (document.readyState !== "complete") {
    await new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
  }

  // 等待目标输入框出现
  const inputs = await new Promise<NodeListOf<HTMLInputElement>>((resolve) => {
    const check = () => {
      const el = document.querySelectorAll<HTMLInputElement>("form > div input");
      if (el.length === 2) {
        resolve(el);
      } else {
        setTimeout(check, 500);
      }
    };
    check();
  });

  if (inputs.length !== 2) {
    console.error("未找到预期的两个输入框");
    return;
  }

  // 获取第一个输入框所在的 form 元素
  const form = inputs[0].closest("form");
  if (!form) {
    console.error("未找到 form 标签");
    return;
  }

  // 获取 form 下的第二个 div，用于插入按钮
  const divs = form.querySelectorAll(":scope > div");
  if (divs.length < 2) {
    console.error("form 下的 div 数量不足 2 个");
    return;
  }

  const targetDiv = divs[1];

  // 创建"获取本页信息"按钮
  const button = document.createElement("button");
  button.className = "tbd-btn css-fd478t css-var-rb tbd-btn-primary tbd-btn-color-primary tbd-btn-variant-solid tbd-btn-lg";
  button.innerText = "获取本页信息";
  button.style.marginRight = "10px";
  button.type = "button"; // 防止表单提交

  // 在最前面插入按钮
  targetDiv.insertBefore(button, targetDiv.firstChild);

  // 绑定点击事件
  button.addEventListener("click", async (e) => {
    e.preventDefault();
    await handleGetInfo();
  });

  console.log("脚本初始化完成，按钮已添加");
}

// #endregion

// #region 脚本入口
/**
 * 脚本主入口函数
 * 启动脚本并初始化
 */
function main(): void {
  console.log("天猫千牛店铺新品试销信息自动获取脚本已启动");
  initScript().then(() => {});
}

// #endregion

main();
