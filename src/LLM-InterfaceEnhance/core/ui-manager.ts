/**
 * UI 管理器
 *
 * 负责界面的基础操作：注入样式、隐藏/显示原始界面、创建容器
 */

import { state } from "../state";
import { meta } from "../meta";
import { HIDE_ORIGINAL_STYLES } from "../ui/styles/hide-original.css";
import { MAIN_STYLES } from "../ui/styles/main.css";
import { renderMainPanelHTML } from "../ui/templates/main-panel.html";

/**
 * 注入所有样式
 */
export function injectStyles(): void {
  injectMainStyles();
  console.log(`${meta.name}: 样式已注入`);
}

/**
 * 注入主界面样式
 */
function injectMainStyles(): void {
  // 移除已有的样式（避免重复注入）
  removeExistingStyles("llm-enhance-styles");

  const style = document.createElement("style");
  style.id = "llm-enhance-styles";
  style.textContent = MAIN_STYLES;
  document.head.appendChild(style);
}

/**
 * 隐藏原始界面
 */
export function hideOriginalInterface(): void {
  if (state.originalInterfaceHidden) return;

  try {
    removeExistingStyles("llm-enhance-hide-original");

    const style = document.createElement("style");
    style.id = "llm-enhance-hide-original";
    style.textContent = HIDE_ORIGINAL_STYLES;
    document.head.appendChild(style);

    state.originalInterfaceHidden = true;
    console.log(`${meta.name}: 原始界面已隐藏`);
  } catch (error) {
    console.error(`${meta.name}: 隐藏原始界面失败`, error);
  }
}

/**
 * 显示原始界面（用于调试或切换）
 */
export function showOriginalInterface(): void {
  const styleElement = document.getElementById("llm-enhance-hide-original");
  if (styleElement) {
    styleElement.remove();
    state.originalInterfaceHidden = false;
    console.log(`${meta.name}: 原始界面已显示`);
  }
}

/**
 * 创建主容器并注入到页面
 */
export function createMainContainer(): void {
  if (state.newInterfaceCreated) return;

  try {
    const container = document.createElement("div");
    container.id = "llm-enhance-container";
    container.innerHTML = renderMainPanelHTML();

    document.body.appendChild(container);

    state.newInterfaceCreated = true;
    console.log(`${meta.name}: 新界面已创建`);
  } catch (error) {
    console.error(`${meta.name}: 创建新界面失败`, error);
  }
}

/**
 * 移除已有的样式元素（避免重复注入）
 *
 * @param styleId 样式元素 ID
 */
function removeExistingStyles(styleId: string): void {
  const existing = document.getElementById(styleId);
  if (existing) {
    existing.remove();
  }
}
