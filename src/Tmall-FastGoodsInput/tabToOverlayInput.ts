import { isInput } from "./helper";

// #region 变量定义
/**
 * 记录是否已经初始化过按键监听
 */
let isTabToOverlayInputInitialized = false;
// #endregion

// #region 核心逻辑
/**
 * 处理按键按下事件
 * @param event 键盘事件
 */
function handleKeyDown(event: KeyboardEvent) {
  // 0. 规避来自其他特性的模拟按键
  if ((event as any)._skipTabToOverlayInput) return;

  // 1. 检查按键是否为 Tab 键
  if (event.key !== "Tab") return;

  // 2. 检查当前焦点元素是否为 input
  const target = event.target;
  if (!isInput(target)) return;

  // 3. 检查当前元素的 closest 有没有 span[aria-haspopup=true][aria-expanded=true]
  // 如果没有，也跳过主逻辑，结束掉函数
  const popupSpan = target.closest('span[aria-haspopup="true"][aria-expanded="true"]');
  if (!popupSpan) return;

  // 4. 检查当前 document 下是否有打开的 overlay 及其内部的 input
  // 逻辑：document.querySelectorAll('div.next-overlay-wrapper.opened')[0].querySelectorAll('input')
  const openedOverlay = document.querySelector("div.next-overlay-wrapper.opened");
  if (!openedOverlay) return;

  const overlayInputs = openedOverlay.querySelectorAll("input");
  const firstInput = overlayInputs[0];

  // 如果没有 input，也跳过逻辑不进行操作
  if (!(firstInput instanceof HTMLInputElement)) return;

  // 5. 最后给这个 input 标签给聚焦上
  event.preventDefault(); // 阻止默认 Tab 行为，以确保聚焦到我们指定的 input
  firstInput.focus();
}

/**
 * 初始化 Tab 快捷聚焦到浮层输入框功能
 */
export function initTabToOverlayInput() {
  if (isTabToOverlayInputInitialized) return;
  isTabToOverlayInputInitialized = true;

  console.log("[Tmall-FastGoodsInput] Tab 快捷聚焦到浮层输入框功能已启用");

  // 在 document 上注册按键监听
  document.addEventListener("keydown", handleKeyDown, true);
}
// #endregion
