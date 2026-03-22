// #region 导入
import { updateReactInputAsync } from "@/dev-tool/react-inputUpdate";
import type { AutoFillColorSizeOptions, ParsedInputData, ContainerInfo } from "@/Tmall-FastGoodsInput/types";
// #endregion

// #region 变量定义
let isInitialized = false;
// 遮罩层元素引用
let overlay: HTMLDivElement | null = null;
let textarea: HTMLTextAreaElement | null = null;
let progressContainer: HTMLDivElement | null = null;
let progressBar: HTMLDivElement | null = null;
let progressLog: HTMLDivElement | null = null;
// 当前进度状态
let currentProgress = 0;
let totalItems = 0;
// #endregion

// #region 样式定义
const STYLES = {
  OVERLAY: `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 99999;
    display: none;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(5px);
    transition: opacity 0.3s;
  `,
  CARD: `
    background: #fff;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    width: 80%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  `,
  CLOSE_BTN: `
    position: absolute;
    top: 12px;
    right: 12px;
    cursor: pointer;
    font-size: 24px;
    color: #999;
    border: none;
    background: transparent;
    line-height: 1;
  `,
  TITLE: `
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: bold;
    color: #333;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
  `,
  TEXTAREA: `
    width: 100%;
    min-height: 200px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    font-family: monospace;
    resize: vertical;
    box-sizing: border-box;
  `,
  BUTTON_ROW: `
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
  `,
  BUTTON: `
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    border: none;
    transition: background 0.2s;
  `,
  CONFIRM_BTN: `
    background: #007bff;
    color: white;
  `,
  CANCEL_BTN: `
    background: #f0f0f0;
    color: #333;
  `,
  HINT: `
    font-size: 12px;
    color: #666;
    margin-bottom: 12px;
    line-height: 1.5;
  `,
  PROGRESS_CONTAINER: `
    display: none;
    flex-direction: column;
    gap: 16px;
  `,
  PROGRESS_BAR_WRAPPER: `
    width: 100%;
    height: 24px;
    background: #e9ecef;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
  `,
  PROGRESS_BAR: `
    height: 100%;
    background: linear-gradient(90deg, #007bff, #0056b3);
    border-radius: 12px;
    transition: width 0.3s ease;
    width: 0%;
  `,
  PROGRESS_TEXT: `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    font-weight: bold;
    color: #333;
  `,
  PROGRESS_LOG: `
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 12px;
    font-family: monospace;
    font-size: 13px;
    line-height: 1.6;
  `,
  LOG_ITEM: `
    margin-bottom: 4px;
    color: #495057;
  `,
  LOG_ITEM_SUCCESS: `
    color: #28a745;
  `,
};
// #endregion

// #region 核心逻辑

/**
 * 解析用户输入的文本
 * 格式：
 * 【商品 ID】
 * 908498255171
 *
 * 【颜色分类】
 * 7113B-浅蓝色
 * 7113B-深蓝色
 * ...
 *
 * 【尺码/规格】
 * 28
 * 29
 * ...
 * @param text 用户输入的文本
 * @returns 解析后的颜色和尺码数组
 */
function parseInputText(text: string): ParsedInputData {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const result: ParsedInputData = {
    colors: [],
    sizes: [],
  };

  let currentSection: "itemId" | "colors" | "sizes" | "none" = "none";

  for (const line of lines) {
    // 跳过商品 ID 行
    if (line.includes("商品 ID")) {
      currentSection = "itemId";
      continue;
    }

    // 检测章节标题
    if (line.includes("颜色分类")) {
      currentSection = "colors";
      continue;
    }
    if (line.includes("尺码") || line.includes("规格")) {
      currentSection = "sizes";
      continue;
    }

    // 根据当前章节添加到对应数组
    if (currentSection === "itemId") {
      continue;
    } else if (currentSection === "colors") {
      result.colors.push(line);
    } else if (currentSection === "sizes") {
      result.sizes.push(line);
    }
  }

  console.log("[Tmall-FastGoodsInput] 解析结果:", result);
  return result;
}

/**
 * 在 div.sell-component-sale-props 下查找颜色和尺码容器
 * @param salePropsElement 销售属性容器元素
 * @returns 颜色和尺码容器信息
 */
function findColorAndSizeContainers(salePropsElement: HTMLElement): { colorContainer: ContainerInfo | null; sizeContainer: ContainerInfo | null } {
  const childDivs = salePropsElement.querySelectorAll(":scope > div");

  let colorContainer: ContainerInfo | null = null;
  let sizeContainer: ContainerInfo | null = null;

  for (const div of childDivs) {
    const header = div.querySelector(":scope > div.header");
    if (!header) continue;

    const headerText = header.textContent || "";

    if (headerText.includes("颜色")) {
      colorContainer = {
        element: div as HTMLElement,
        type: "color",
        headerText,
      };
      console.log("[Tmall-FastGoodsInput] 找到颜色容器:", headerText);
    } else if (headerText.includes("尺码") || headerText.includes("规格")) {
      sizeContainer = {
        element: div as HTMLElement,
        type: "size",
        headerText,
      };
      console.log("[Tmall-FastGoodsInput] 找到尺码容器:", headerText);
    }
  }

  return { colorContainer, sizeContainer };
}

/**
 * 等待指定时间
 * @param ms 毫秒数
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 自动化添加颜色（异步）
 * @param container 颜色容器元素
 * @param colors 要添加的颜色列表
 * @param onProgress 进度回调函数 (current, total, currentItem)
 */
async function addColors(
  container: HTMLElement,
  colors: string[],
  onProgress?: (current: number, total: number, currentItem: string) => void,
): Promise<void> {
  console.log("[Tmall-FastGoodsInput] 开始添加颜色:", colors);

  // 1. 查找 ul 元素
  const ul = container.querySelector("ul");
  if (!ul) {
    console.error("[Tmall-FastGoodsInput] 未找到 ul 元素");
    return;
  }

  // 2. 遍历颜色列表，添加到对应的奇数索引 input
  for (let i = 0; i < colors.length; i++) {
    // 每次循环时重新获取 input 列表
    const inputs = ul.querySelectorAll("input");
    console.log(`[Tmall-FastGoodsInput] 第 ${i + 1} 次循环，找到 ${inputs.length} 个 input 元素`);

    if (inputs.length === 0) {
      console.error("[Tmall-FastGoodsInput] 未找到任何 input 元素");
      return;
    }

    // 计算input索引：奇数个input是需要操作的（索引 0, 2, 4...）
    const inputIndex = i * 2;

    // 检查是否超出范围
    if (inputIndex >= inputs.length) {
      console.warn(`[Tmall-FastGoodsInput] 颜色 "${colors[i]}" 对应的 input 索引 ${inputIndex} 超出范围`);
      break;
    }

    const input = inputs[inputIndex] as HTMLInputElement;
    const oldValue = input.value;

    console.log(`[Tmall-FastGoodsInput] 添加颜色 "${colors[i]}" 到索引 ${inputIndex}`);

    // 3. 使用异步函数更新 input，等待 React 状态更新
    await updateReactInputAsync(input, colors[i], 100);

    // 4. 等待 React DOM 更新完成
    await wait(200);

    // 5. 查找并点击添加按钮
    const addButton = ul.querySelector("button.add") as HTMLButtonElement;
    if (addButton) {
      console.log(`[Tmall-FastGoodsInput] 点击添加按钮`);
      addButton.click();
      // 等待按钮点击后的 DOM 更新
      await wait(200);
    } else {
      console.warn("[Tmall-FastGoodsInput] 未找到添加按钮");
    }

    // 6. 触发进度回调
    if (onProgress) {
      onProgress(i + 1, colors.length, colors[i]);
    }
  }

  console.log("[Tmall-FastGoodsInput] 颜色添加完成");
}

/**
 * 自动化添加尺码（异步）
 * @param container 尺码容器元素
 * @param sizes 要添加的尺码列表
 * @param onProgress 进度回调函数 (current, total, currentItem)
 */
async function addSizes(
  container: HTMLElement,
  sizes: string[],
  onProgress?: (current: number, total: number, currentItem: string) => void,
): Promise<void> {
  console.log("[Tmall-FastGoodsInput] 开始添加尺码:", sizes);

  // 1. 查找 ul 元素
  const ul = container.querySelector("ul");
  if (!ul) {
    console.error("[Tmall-FastGoodsInput] 未找到 ul 元素");
    return;
  }

  // 2. 遍历尺码列表，添加到对应的奇数索引 input
  for (let i = 0; i < sizes.length; i++) {
    // 每次循环时重新获取 input 列表
    const inputs = ul.querySelectorAll("input");
    console.log(`[Tmall-FastGoodsInput] 第 ${i + 1} 次循环，找到 ${inputs.length} 个 input 元素`);

    if (inputs.length === 0) {
      console.error("[Tmall-FastGoodsInput] 未找到任何 input 元素");
      return;
    }

    // 计算input索引：奇数个input是需要操作的（索引 0, 2, 4...）
    const inputIndex = i * 2;

    // 检查是否超出范围
    if (inputIndex >= inputs.length) {
      console.warn(`[Tmall-FastGoodsInput] 尺码 "${sizes[i]}" 对应的 input 索引 ${inputIndex} 超出范围`);
      break;
    }

    const input = inputs[inputIndex] as HTMLInputElement;
    const oldValue = input.value;

    console.log(`[Tmall-FastGoodsInput] 添加尺码 "${sizes[i]}" 到索引 ${inputIndex}`);

    // 3. 使用异步函数更新 input，等待 React 状态更新
    await updateReactInputAsync(input, sizes[i], 100);

    // 4. 等待 React DOM 更新完成
    await wait(200);

    // 5. 查找并点击添加按钮
    const addButton = ul.querySelector("button.size-option-add-btn") as HTMLButtonElement;
    if (addButton) {
      console.log(`[Tmall-FastGoodsInput] 点击添加按钮`);
      addButton.click();
      // 等待按钮点击后的 DOM 更新
      await wait(200);
    } else {
      console.warn("[Tmall-FastGoodsInput] 未找到添加按钮");
    }

    // 6. 触发进度回调
    if (onProgress) {
      onProgress(i + 1, sizes.length, sizes[i]);
    }
  }

  console.log("[Tmall-FastGoodsInput] 尺码添加完成");
}

/**
 * 创建遮罩层和输入界面
 */
function createOverlayUI(): void {
  // 如果已存在则不重复创建
  if (overlay) return;

  // 创建遮罩层
  overlay = document.createElement("div");
  overlay.style.cssText = STYLES.OVERLAY;

  // 创建内容卡片
  const card = document.createElement("div");
  card.style.cssText = STYLES.CARD;

  // 关闭按钮
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  closeBtn.style.cssText = STYLES.CLOSE_BTN;
  closeBtn.onclick = hideOverlay;
  card.appendChild(closeBtn);

  // 标题
  const title = document.createElement("h3");
  title.innerText = "🎨 自动填写商品颜色和尺码";
  title.style.cssText = STYLES.TITLE;
  card.appendChild(title);

  // 提示文字
  const hint = document.createElement("div");
  hint.innerHTML = "请输入颜色和尺码信息：<br/>【颜色分类】每行一个颜色<br/>【尺码/规格】每行一个尺码<br/>商品ID会自动忽略";
  hint.style.cssText = STYLES.HINT;
  card.appendChild(hint);

  // textarea 输入框
  textarea = document.createElement("textarea");
  textarea.style.cssText = STYLES.TEXTAREA;
  textarea.placeholder = "【商品 ID】\n908498255171\n\n【颜色分类】\n7113B-浅蓝色\n7113B-深蓝色\n\n【尺码/规格】\n28\n29\n30";
  card.appendChild(textarea);

  // 进度展示容器
  progressContainer = document.createElement("div");
  progressContainer.style.cssText = STYLES.PROGRESS_CONTAINER;

  // 进度条外包装
  const progressBarWrapper = document.createElement("div");
  progressBarWrapper.style.cssText = STYLES.PROGRESS_BAR_WRAPPER;

  // 进度条
  progressBar = document.createElement("div");
  progressBar.style.cssText = STYLES.PROGRESS_BAR;
  progressBarWrapper.appendChild(progressBar);

  // 进度文字
  const progressText = document.createElement("div");
  progressText.style.cssText = STYLES.PROGRESS_TEXT;
  progressText.id = "progress-text";
  progressText.innerText = "0%";
  progressBarWrapper.appendChild(progressText);

  progressContainer.appendChild(progressBarWrapper);

  // 进度日志
  progressLog = document.createElement("div");
  progressLog.style.cssText = STYLES.PROGRESS_LOG;
  progressLog.id = "progress-log";
  progressContainer.appendChild(progressLog);

  card.appendChild(progressContainer);

  // 按钮行
  const buttonRow = document.createElement("div");
  buttonRow.style.cssText = STYLES.BUTTON_ROW;

  // 取消按钮
  const cancelBtn = document.createElement("button");
  cancelBtn.innerText = "取消";
  cancelBtn.style.cssText = STYLES.BUTTON + STYLES.CANCEL_BTN;
  cancelBtn.onclick = hideOverlay;
  buttonRow.appendChild(cancelBtn);

  // 确认按钮
  const confirmBtn = document.createElement("button");
  confirmBtn.innerText = "确认填写";
  confirmBtn.style.cssText = STYLES.BUTTON + STYLES.CONFIRM_BTN;
  confirmBtn.onclick = handleConfirm;
  buttonRow.appendChild(confirmBtn);

  card.appendChild(buttonRow);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

/**
 * 显示输入界面，隐藏进度界面
 */
function showInputUI(): void {
  if (textarea) textarea.style.display = "block";
  if (progressContainer) progressContainer.style.display = "none";
}

/**
 * 显示进度界面，隐藏输入界面
 */
function showProgressUI(): void {
  if (textarea) textarea.style.display = "none";
  if (progressContainer) progressContainer.style.display = "flex";
  // 重置进度
  currentProgress = 0;
  updateProgressBar(0);
  if (progressLog) progressLog.innerHTML = "";
}

/**
 * 更新进度条
 * @param progress 进度百分比 (0-100)
 */
function updateProgressBar(progress: number): void {
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
  const progressText = document.getElementById("progress-text");
  if (progressText) {
    progressText.innerText = `${Math.round(progress)}%`;
  }
}

/**
 * 添加进度日志
 * @param message 日志消息
 * @param isSuccess 是否成功（绿色显示）
 */
function addProgressLog(message: string, isSuccess: boolean = false): void {
  if (!progressLog) return;
  const logItem = document.createElement("div");
  logItem.style.cssText = STYLES.LOG_ITEM + (isSuccess ? STYLES.LOG_ITEM_SUCCESS : "");
  logItem.innerText = message;
  progressLog.appendChild(logItem);
  // 自动滚动到底部
  progressLog.scrollTop = progressLog.scrollHeight;
}

/**
 * 显示遮罩层
 */
function showOverlay(): void {
  if (!overlay) {
    createOverlayUI();
  }
  if (overlay) {
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    // 显示输入界面
    showInputUI();
    // 聚焦到 textarea
    if (textarea) textarea.focus();
  }
}

/**
 * 隐藏遮罩层
 */
function hideOverlay(): void {
  if (overlay) {
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }
  // 清空 textarea
  if (textarea) textarea.value = "";
  // 重置进度状态
  currentProgress = 0;
  totalItems = 0;
  if (progressBar) progressBar.style.width = "0%";
  if (progressLog) progressLog.innerHTML = "";
}

/**
 * 处理确认按钮点击
 * 实现批量解析和填写逻辑
 */
async function handleConfirm(): Promise<void> {
  const inputText = textarea?.value || "";
  console.log("[Tmall-FastGoodsInput] 批量入参:", inputText);

  if (!inputText.trim()) {
    alert("请输入颜色和尺码信息");
    return;
  }

  // 1. 解析输入格式
  const parsedData = parseInputText(inputText);

  if (parsedData.colors.length === 0 && parsedData.sizes.length === 0) {
    alert("未能解析出颜色或尺码信息，请检查输入格式");
    return;
  }

  // 2. 找到销售属性容器
  const salePropsElement = document.querySelector("div.sell-component-sale-props");
  if (!salePropsElement) {
    alert("未找到销售属性容器 (div.sell-component-sale-props)");
    hideOverlay();
    return;
  }

  // 3. 找到颜色和尺码容器
  const { colorContainer, sizeContainer } = findColorAndSizeContainers(salePropsElement as HTMLElement);

  if (!colorContainer && !sizeContainer) {
    alert("未找到颜色或尺码容器");
    hideOverlay();
    return;
  }

  // 4. 切换到进度展示界面
  showProgressUI();

  // 计算总项目数
  const totalColors = colorContainer ? parsedData.colors.length : 0;
  const totalSizes = sizeContainer ? parsedData.sizes.length : 0;
  totalItems = totalColors + totalSizes;
  currentProgress = 0;

  addProgressLog(`开始自动填写...`);
  addProgressLog(`颜色: ${totalColors}个, 尺码: ${totalSizes}个`);

  // 5. 执行自动化添加（异步等待）
  try {
    // 添加颜色
    if (colorContainer && parsedData.colors.length > 0) {
      addProgressLog(`开始填写颜色...`);

      await addColors(colorContainer.element, parsedData.colors, (current, total, currentItem) => {
        // 更新进度
        currentProgress = ((current + (totalSizes > 0 ? 0 : 0)) / totalItems) * 100;
        updateProgressBar(currentProgress);
        addProgressLog(`✓ 完成 颜色填写: ${currentItem}`, true);
      });
    }

    // 添加尺码
    if (sizeContainer && parsedData.sizes.length > 0) {
      addProgressLog(`开始填写尺码...`);

      await addSizes(sizeContainer.element, parsedData.sizes, (current, total, currentItem) => {
        // 更新进度
        const colorOffset = totalColors;
        currentProgress = ((colorOffset + current) / totalItems) * 100;
        updateProgressBar(currentProgress);
        addProgressLog(`✓ 完成 尺码填写: ${currentItem}`, true);
      });
    }

    // 完成
    updateProgressBar(100);
    addProgressLog(`✅ 全部填写完成!`, true);

    console.log("[Tmall-FastGoodsInput] 批量填写完成", {
      colors: parsedData.colors,
      sizes: parsedData.sizes,
    });

    // 延迟一下再关闭，让用户看到完成状态
    setTimeout(() => {
      hideOverlay();
    }, 1500);
  } catch (error) {
    console.error("[Tmall-FastGoodsInput] 批量填写出错:", error);
    addProgressLog(`❌ 填写出错: ${error}`, false);
    alert("填写过程中出现错误，请查看控制台");
    hideOverlay();
  }
}

/**
 * 键盘按下事件处理函数
 * 监听 Alt + 1 组合键
 */
function handleKeyDown(event: KeyboardEvent) {
  // 1. 检查是否按下 Alt + 1
  if (!event.altKey || event.key !== "1") return;

  const activeElement = document.activeElement;

  // 2. 检查当前焦点是否为 input 标签
  if (!(activeElement instanceof HTMLInputElement)) return;

  // 3. 检查是否 closest 于 div.sell-component-sale-props
  const salePropsElement = activeElement.closest("div.sell-component-sale-props");
  if (!salePropsElement) return;

  // 通过所有检查，进入特性逻辑
  event.preventDefault();
  event.stopPropagation();

  console.log("[Tmall-FastGoodsInput] 检测到在销售属性区域，按下 Alt+1，显示批量填写浮层");

  // 显示遮罩层
  showOverlay();
}

/**
 * 初始化颜色尺码自动填写特性
 * @param options 配置项
 */
export function initAutoFillColorSize(options?: AutoFillColorSizeOptions) {
  if (isInitialized) return;
  isInitialized = true;

  console.log("[Tmall-FastGoodsInput] 颜色尺码自动填写特性已加载");

  // 监听键盘事件
  document.addEventListener("keydown", handleKeyDown, true);
}
// #endregion
