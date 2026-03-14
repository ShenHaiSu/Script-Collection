/**
 * 页面 UI 增强逻辑 (uiEnhance.ts)
 *
 * 此模块作为 UI 功能的入口，负责初始化覆盖层、浮动按钮以及全局事件监听。
 * 具体的 UI 实现已拆分到 ./ui 目录下的子模块中。
 */
import { store } from "./helper";
import { createOverlay, toggleOverlay } from "./ui/overlay";
import { createFloatingTrigger } from "./ui/floatingButton";

/**
 * 脚本初始化增强逻辑
 */
export function initUIEnhance() {
  if (store.isUIInitialized) return;

  console.log("[Tmall-GoodsInfoEnhance] 页面 UI 增强 (Overlay) 初始化...");

  // #region 初始化 UI 组件
  const { overlay, contentContainer } = createOverlay();

  // 注册浮动按钮点击事件
  createFloatingTrigger(() => toggleOverlay(overlay, contentContainer));
  // #endregion

  // #region 注册关闭逻辑
  const closeBtn = overlay.querySelector("button");
  if (closeBtn) {
    closeBtn.onclick = () => toggleOverlay(overlay, contentContainer, false);
  }

  overlay.onclick = (e) => {
    if (e.target === overlay) toggleOverlay(overlay, contentContainer, false);
  };
  // #endregion

  // #region 注册快捷键监听
  /**
   * 监听 Alt + Q 组合键以切换面板状态
   */
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.altKey && e.code === "KeyQ") {
      e.preventDefault();
      toggleOverlay(overlay, contentContainer);
    }
  });
  // #endregion

  store.isUIInitialized = true;
}
