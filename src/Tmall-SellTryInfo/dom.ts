/**
 * DOM 操作模块
 * 封装所有 DOM 相关操作，提供统一的接口
 */

import { Overlay, TableRowData, ScrapedResult } from "./types";
import { SELECTORS, BUTTON_CLICK_DELAY, DRAWER_OPEN_DELAY, CSS_PREFIX, MESSAGES } from "./config";
import { sleep, trim } from "./utils";

// #region 遮罩层操作
/**
 * 创建页面遮罩层，用于在脚本执行期间阻止用户交互
 * @returns 遮罩层元素及其更新函数
 */
export function createOverlay(): Overlay {
  const overlay = document.createElement("div");
  overlay.id = `${CSS_PREFIX}-overlay`;
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: "9999",
    cursor: "not-allowed",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  });

  // 创建内容容器
  const content = document.createElement("div");
  Object.assign(content.style, {
    textAlign: "center",
    color: "#fff",
    padding: "30px 40px",
    background: "rgba(0, 0, 0, 0.5)",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    maxWidth: "400px",
  });

  // 创建标题
  const title = document.createElement("div");
  Object.assign(title.style, {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
  });
  title.textContent = MESSAGES.scraping;

  // 创建进度条容器
  const progressContainer = document.createElement("div");
  Object.assign(progressContainer.style, {
    width: "300px",
    height: "8px",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "16px",
  });

  // 创建进度条
  const progressBar = document.createElement("div");
  Object.assign(progressBar.style, {
    height: "100%",
    width: "0%",
    background: "linear-gradient(90deg, #1890ff, #52c41a)",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  });
  progressContainer.appendChild(progressBar);

  // 创建进度文本
  const progressText = document.createElement("div");
  Object.assign(progressText.style, {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: "8px",
  });
  progressText.textContent = MESSAGES.preparing;

  // 创建状态文本
  const statusText = document.createElement("div");
  Object.assign(statusText.style, {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.6)",
  });

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
    title.textContent = current >= total ? MESSAGES.completed : MESSAGES.scraping;
  };

  return { element: overlay, updateProgress };
}

/**
 * 移除遮罩层
 * @param overlay 遮罩层元素
 */
export function removeOverlay(overlay: HTMLElement): void {
  overlay.remove();
}
// #endregion

// #region 按钮操作
/**
 * 安全地点击按钮元素
 * @param button 要点击的按钮元素
 * @param delay 点击后等待的时间（毫秒）
 * @returns 是否成功执行点击
 */
export async function safeClickButton(
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
 * 创建按钮元素
 * @param text 按钮文本
 * @param className 样式类名
 * @param style 内联样式
 * @returns 按钮元素
 */
export function createButton(
  text: string,
  className?: string,
  style?: Partial<CSSStyleDeclaration>
): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerText = text;
  button.type = "button";
  if (className) button.className = className;
  if (style) Object.assign(button.style, style);
  return button;
}

/**
 * 为按钮添加点击事件
 * @param button 按钮元素
 * @param handler 点击事件处理函数
 */
export function addButtonClickHandler(button: HTMLButtonElement, handler: (e: MouseEvent) => void | Promise<void>): void {
  button.addEventListener("click", async (e) => {
    e.preventDefault();
    await handler(e);
  });
}
// #endregion

// #region 表格操作
/**
 * 从表格行中提取商品信息
 * @param tr 表格行元素
 * @returns 商品信息对象，如果提取失败则返回 null
 */
export function extractItemInfoFromRow(tr: HTMLTableRowElement): ScrapedResult | null {
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
 * @param tr 表格行元素
 * @returns 操作按钮元素，如果未找到则返回 null
 */
export function getActionButtonFromRow(tr: HTMLTableRowElement): HTMLButtonElement | null {
  const tds = tr.querySelectorAll("td");
  if (tds.length === 0) return null;

  const lastTd = tds[tds.length - 1];
  return lastTd?.querySelector("button") ?? null;
}

/**
 * 获取页面表格数据并采集商品信息
 * @returns 采集到的商品行列表
 */
export function getTableRows(): HTMLTableRowElement[] {
  const tbody = document.querySelector(SELECTORS.tableBody);
  if (!tbody) {
    throw new Error(MESSAGES.noTableData);
  }

  // 获取所有带有 data-row-key 属性的表格行
  const trs = Array.from(tbody.querySelectorAll<HTMLTableRowElement>(SELECTORS.tableRow));
  if (trs.length === 0) {
    throw new Error(MESSAGES.noValidRows);
  }

  return trs;
}

/**
 * 获取表格行数据列表
 * @returns 表格行数据列表
 */
export function getTableRowDataList(): TableRowData[] {
  const rows = getTableRows();
  return rows
    .map((tr) => {
      const info = extractItemInfoFromRow(tr);
      if (!info) return null;
      return {
        element: tr,
        itemId: info.itemId,
        itemName: info.itemName,
        imgUrl: info.imgUrl,
      };
    })
    .filter((row): row is TableRowData => row !== null);
}
// #endregion

// #region Tab 切换操作
/**
 * 切换到直接分享 tab 页面
 * @returns 是否成功切换
 */
export async function switchToShareTab(): Promise<boolean> {
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
// #endregion

// #region 抽屉操作
/**
 * 点击生成口令按钮
 * @returns 是否成功执行
 */
export async function clickGenerateTokenButton(): Promise<boolean> {
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
 * @returns 是否成功关闭
 */
export async function closeDrawer(): Promise<boolean> {
  const buttonList = document.querySelectorAll(SELECTORS.drawerButtons);

  // 注意：索引 1 表示第二个按钮（关闭按钮）
  if (buttonList.length < 2) {
    console.warn("未找到足够的关闭按钮");
    return false;
  }

  return await safeClickButton(buttonList[1] as HTMLElement, BUTTON_CLICK_DELAY);
}

/**
 * 等待抽屉打开
 * @param timeout 超时时间
 */
export async function waitForDrawerOpen(timeout: number = DRAWER_OPEN_DELAY): Promise<void> {
  await sleep(timeout);
}
// #endregion

// #region 剪切板操作
/**
 * 从剪切板读取分享链接
 * @returns 读取到的文本内容，失败时返回空字符串
 */
export async function readFromClipboard(): Promise<string> {
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
 * 写入文本到剪切板
 * @param text 要写入的文本
 * @returns 是否成功
 */
export async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("写入剪切板失败:", error);
    return false;
  }
}

/**
 * 检查并请求剪切板权限
 * @returns 是否成功获取权限
 */
export async function ensureClipboardPermission(): Promise<boolean> {
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
      alert(MESSAGES.noPermission);
      return false;
    }
  }
}
// #endregion

// #region 表单操作
/**
 * 获取页面输入框
 * @returns 输入框列表
 */
export function getFormInputs(): NodeListOf<HTMLInputElement> {
  return document.querySelectorAll<HTMLInputElement>(SELECTORS.formInput);
}

/**
 * 获取目标 div 元素（用于插入按钮）
 * @returns 目标 div 元素
 */
export function getTargetDiv(): HTMLElement | null {
  const inputs = getFormInputs();
  if (inputs.length !== 2) {
    console.error(MESSAGES.noInputFields);
    return null;
  }

  // 获取第一个输入框所在的 form 元素
  const form = inputs[0].closest("form");
  if (!form) {
    console.error(MESSAGES.noForm);
    return null;
  }

  // 获取 form 下的第二个 div，用于插入按钮
  const divs = form.querySelectorAll<HTMLElement>(`:scope > div`);
  if (divs.length < 2) {
    console.error(MESSAGES.noEnoughDivs);
    return null;
  }

  return divs[1];
}

/**
 * 在目标位置插入按钮
 * @param button 要插入的按钮
 * @param targetDiv 目标 div
 */
export function insertButton(button: HTMLButtonElement, targetDiv: HTMLElement): void {
  // 在最前面插入按钮
  targetDiv.insertBefore(button, targetDiv.firstChild);
}
// #endregion

// #region 等待操作
/**
 * 等待页面加载完毕
 */
export async function waitForPageLoad(): Promise<void> {
  if (document.readyState !== "complete") {
    await new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
  }
}

/**
 * 等待目标输入框出现
 * @param expectedCount 期望的输入框数量
 * @returns 输入框列表
 */
export async function waitForInputs(expectedCount: number = 2): Promise<NodeListOf<HTMLInputElement>> {
  return new Promise((resolve) => {
    const check = () => {
      const el = getFormInputs();
      if (el.length === expectedCount) {
        resolve(el);
      } else {
        setTimeout(check, 500);
      }
    };
    check();
  });
}
// #endregion