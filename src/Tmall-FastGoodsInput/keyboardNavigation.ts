import { isInput } from "./helper";

// #region 样式与常量
/**
 * 键盘导航功能模块：为商品详情填写页面的下拉搜索框提供键盘上下键和回车键的交互增强
 */

const SELECTED_CLASS = "tmall-fast-input-selected";

/**
 * 注入全局样式，用于展示选中的元素框线
 */
function injectStyles() {
  const style = document.createElement("style");
  style.innerHTML = `
    .${SELECTED_CLASS} {
      outline: 2px solid #ff4400 !important;
      outline-offset: -2px;
      background-color: rgba(255, 68, 0, 0.1) !important;
      transition: all 0.1s ease;
      z-index: 10;
      position: relative;
    }
  `;
  document.head.appendChild(style);
}
// #endregion

// #region 状态维护
/**
 * 当前搜索结果中的选项列表
 */
let currentItems: HTMLElement[] = [];

/**
 * 当前选中的索引位置
 */
let currentIndex: number = -1;

/**
 * 重置当前选择状态
 */
function resetState() {
  if (currentIndex >= 0 && currentItems[currentIndex]) {
    currentItems[currentIndex].classList.remove(SELECTED_CLASS);
  }
  currentItems = [];
  currentIndex = -1;
}

/**
 * 更新视觉高亮
 */
function updateHighlight() {
  currentItems.forEach((item, index) => {
    if (index === currentIndex) {
      item.classList.add(SELECTED_CLASS);
      // 确保选中的项在视图中可见
      item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      item.classList.remove(SELECTED_CLASS);
    }
  });
}
// #endregion

// #region 辅助逻辑
/**
 * 获取当前的导航上下文环境（搜索框及其项）
 * @param activeElement 当前焦点元素
 * @returns 包含 items 的数组，如果环境不匹配则返回空数组
 */
function getNavigationContext(activeElement: Element | null): HTMLElement[] {
  // 1. 必须在焦点为 input 的时候触发
  if (!isInput(activeElement)) return [];

  // 2. 检查 DOM 结构：input -> closest div.options-search
  const optionsSearch = activeElement.closest("div.options-search");
  if (!optionsSearch) return [];

  // 3. 检查 div.options-search 的下一个兄弟元素必须是 div.options-content
  const optionsContent = optionsSearch.nextElementSibling;
  if (!optionsContent || !optionsContent.classList.contains("options-content")) return [];

  // 4. 获取 div.options-content 下的所有 div.options-item
  const items = Array.from(optionsContent.querySelectorAll("div.options-item")) as HTMLElement[];
  if (items.length === 0) {
    resetState();
    return [];
  }

  // 如果 items 发生了变化（比如搜索内容变了），同步内存状态
  if (currentItems.length !== items.length || !currentItems.every((item, i) => item === items[i])) {
    resetState();
    currentItems = items;
  }

  return currentItems;
}

/**
 * 模拟 Tab 按键行为并通知其他特性规避
 * @param sourceInput 起始输入框
 */
function simulateTab(sourceInput: HTMLInputElement) {
  setTimeout(() => {
    // 确保输入框仍然在 DOM 中且可聚焦
    if (!document.body.contains(sourceInput)) return;

    sourceInput.focus();
    // 触发模拟的 Tab 事件，并带上规避标记
    const tabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      code: "Tab",
      keyCode: 9,
      bubbles: true,
      cancelable: true,
    });
    // 显式打上标记，让 tabToOverlayInput.ts 规避
    (tabEvent as any)._skipTabToOverlayInput = true;
    sourceInput.dispatchEvent(tabEvent);
  }, 200); // 延时 200ms 等待 DOM 刷新和浮层关闭
}

/**
 * 处理方向键逻辑
 * @param event 键盘事件
 * @param direction 方向 "up" | "down"
 * @param items 当前选项列表
 */
function handleArrowKey(event: KeyboardEvent, direction: "up" | "down", items: HTMLElement[]) {
  event.preventDefault();
  if (currentIndex === -1) {
    currentIndex = direction === "down" ? 0 : items.length - 1;
  } else {
    const step = direction === "down" ? 1 : -1;
    currentIndex = (currentIndex + step + items.length) % items.length;
  }
  updateHighlight();
}

/**
 * 处理回车键确认逻辑
 * @param event 键盘事件
 * @param items 当前选项列表
 */
function handleEnterKey(event: KeyboardEvent, items: HTMLElement[]) {
  if (currentIndex < 0 || !items[currentIndex]) return;

  event.preventDefault();

  // 记录当前活跃的弹出层容器及其输入框（用于后续 Tab 模拟）
  const popupSpan = document.querySelector('span[aria-expanded="true"][aria-haspopup="true"]');
  const sourceInput = popupSpan?.querySelector("input");

  // 触发点击并清理状态
  items[currentIndex].click();
  resetState();

  // 异步触发 Tab 行为
  if (sourceInput instanceof HTMLInputElement) {
    simulateTab(sourceInput);
  }
}
// #endregion

// #region 核心逻辑
/**
 * 处理键盘按键事件
 * @param event 键盘事件
 */
function handleKeyDown(event: KeyboardEvent) {
  const items = getNavigationContext(document.activeElement);
  if (items.length === 0) return;

  switch (event.key) {
    case "ArrowDown":
      handleArrowKey(event, "down", items);
      break;
    case "ArrowUp":
      handleArrowKey(event, "up", items);
      break;
    case "Enter":
      handleEnterKey(event, items);
      break;
    case "Escape":
      resetState();
      break;
  }
}

/**
 * 初始化键盘导航特性
 */
export function initKeyboardNavigation() {
  injectStyles();
  document.addEventListener("keydown", handleKeyDown, true); // 使用捕获模式以优先处理
}
// #endregion
