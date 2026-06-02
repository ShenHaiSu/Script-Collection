/**
 * 界面渲染器
 *
 * 负责界面数据的更新、事件绑定和交互逻辑
 */

import { state, resetState } from "../state";
import { meta } from "../meta";
import type { PlatformAdapter } from "../platforms/types";
import type { Settings, DEFAULT_SETTINGS } from "../types";
import { hideOriginalInterface, showOriginalInterface } from "../core/ui-manager";
import { MODAL_STYLES } from "./styles/modal.css";
import { renderSettingsModalHTML } from "./templates/settings-modal.html";

/**
 * 绑定界面事件
 */
export function bindEvents(): void {
  // 刷新按钮
  const refreshBtn = document.getElementById("llm-enhance-refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      refreshData();
    });
  }

  // 显示/隐藏原始界面按钮
  const toggleBtn = document.getElementById("llm-enhance-toggle-original");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      if (state.originalInterfaceHidden) {
        showOriginalInterface();
        toggleBtn.textContent = "隐藏原始界面";
      } else {
        hideOriginalInterface();
        toggleBtn.textContent = "显示原始界面";
      }
    });
  }

  // 设置按钮
  const settingsBtn = document.getElementById("llm-enhance-settings");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      openSettings();
    });
  }

  console.log(`${meta.name}: 界面事件已绑定`);
}

/**
 * 启动渲染器（周期性更新界面数据）
 *
 * @param platform 当前平台适配器
 */
export function startRenderer(_platform: PlatformAdapter): void {
  // 初始更新
  updateStats();
  updateUsageTable();

  console.log(`${meta.name}: 渲染器已启动`);
}

/**
 * 更新统计数据
 */
export function updateStats(): void {
  const totalTokens = state.usageData.reduce((sum, item) => sum + item.tokens, 0);
  const totalCost = state.usageData.reduce((sum, item) => sum + item.cost, 0);
  const totalRequests = state.interceptedRequests.length;

  // 更新 DOM
  const totalUsageEl = document.getElementById("total-usage");
  const totalCostEl = document.getElementById("total-cost");
  const totalRequestsEl = document.getElementById("total-requests");
  const lastUpdateEl = document.getElementById("last-update");

  if (totalUsageEl) totalUsageEl.textContent = totalTokens.toLocaleString();
  if (totalCostEl) totalCostEl.textContent = `$${totalCost.toFixed(2)}`;
  if (totalRequestsEl) totalRequestsEl.textContent = totalRequests.toString();
  if (lastUpdateEl) lastUpdateEl.textContent = new Date().toLocaleString();
}

/**
 * 更新使用数据表格
 */
export function updateUsageTable(): void {
  const tableBody = document.getElementById("usage-table-body");
  if (!tableBody) return;

  // 清空表格
  tableBody.innerHTML = "";

  // 填充数据（最近 20 条）
  const recentData = state.usageData.slice(-20).reverse();

  recentData.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.timestamp.toLocaleString()}</td>
      <td>${item.model}</td>
      <td>${item.inputTokens.toLocaleString()}</td>
      <td>${item.outputTokens.toLocaleString()}</td>
      <td>${item.cost.toFixed(4)}</td>
      <td>${item.status || "成功"}</td>
    `;
    tableBody.appendChild(row);
  });
}

/**
 * 更新拦截请求计数
 */
export function updateInterceptedCount(): void {
  const countEl = document.getElementById("intercepted-count");
  if (countEl) {
    countEl.textContent = state.interceptedRequests.length.toString();
  }
}

/**
 * 刷新数据
 */
function refreshData(): void {
  console.log(`${meta.name}: 刷新数据...`);

  // 重置状态
  resetState();

  // 更新界面
  updateStats();
  updateUsageTable();
  updateInterceptedCount();
}

/**
 * 打开设置面板
 */
function openSettings(): void {
  // 创建设置模态框
  const modal = document.createElement("div");
  modal.id = "llm-enhance-settings-modal";
  modal.innerHTML = renderSettingsModalHTML();

  // 添加模态框样式
  const modalStyles = document.createElement("style");
  modalStyles.id = "llm-enhance-modal-styles";
  modalStyles.textContent = MODAL_STYLES;

  document.head.appendChild(modalStyles);
  document.body.appendChild(modal);

  // 绑定事件
  document.getElementById("save-settings")?.addEventListener("click", () => {
    saveSettings();
    closeModal(modal, modalStyles);
  });

  document.getElementById("cancel-settings")?.addEventListener("click", () => {
    closeModal(modal, modalStyles);
  });

  // 点击遮罩层关闭
  const overlay = modal.querySelector(".modal-overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal(modal, modalStyles);
      }
    });
  }
}

/**
 * 关闭模态框
 *
 * @param modal 模态框元素
 * @param modalStyles 模态框样式元素
 */
function closeModal(modal: HTMLElement, modalStyles: HTMLElement): void {
  modal.remove();
  modalStyles.remove();
}

/**
 * 保存设置
 */
function saveSettings(): void {
  const autoRefresh = (
    document.getElementById("auto-refresh") as HTMLInputElement
  )?.checked;
  const showNotifications = (
    document.getElementById("show-notifications") as HTMLInputElement
  )?.checked;
  const refreshInterval = parseInt(
    (document.getElementById("refresh-interval") as HTMLInputElement)?.value ||
      "30"
  );

  const settings: Settings = {
    autoRefresh,
    showNotifications,
    refreshInterval,
  };

  // 保存到 GM 存储
  GM_setValue("llm-enhance-settings", settings);

  console.log(`${meta.name}: 设置已保存`, settings);
}

/**
 * 加载设置
 *
 * @returns 加载的设置，不存在则返回默认设置
 */
export function loadSettings(): Settings {
  try {
    const saved = GM_getValue("llm-enhance-settings") as Settings | undefined;
    if (saved) {
      return saved;
    }
  } catch (error) {
    console.warn(`${meta.name}: 加载设置失败`, error);
  }

  return {
    autoRefresh: true,
    showNotifications: true,
    refreshInterval: 30,
  };
}
