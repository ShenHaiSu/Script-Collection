/**
 * 天猫后台订单信息增强脚本
 * 用于在淘宝/天猫订单管理页面增强订单信息的展示
 *
 * 重构说明：
 * 1. 支持整个天猫/千牛后台 (host/*)
 * 2. 每个 action 通过 match 函数动态判定是否显示
 * 3. 监听 SPA 路由变化，动态更新按钮显示状态
 */

// UI 组件
import { createFloatingTrigger, drawerManager, type ActionButtonConfig } from "./ui";

// 交互逻辑
import { ACTION_BUTTONS } from "./actions";

// #region 脚本入口
/**
 * 脚本主入口函数
 * 启动脚本并初始化
 */
function main(): void {
  console.log("天猫后台订单信息增强脚本已启动");
  initScript();
}

// #endregion

// #region 初始化逻辑
/**
 * 初始化脚本逻辑
 * 负责初始化 UI 组件并挂载到页面
 */
function initScript(): void {
  console.log("天猫后台订单信息增强脚本初始化中...");

  // 使用 setInterval 循环检查页面是否加载完成
  const checkInterval = setInterval(() => {
    // 检查页面主要元素是否加载完成
    const isPageReady = document.body !== null;

    if (isPageReady) {
      clearInterval(checkInterval);
      console.log("页面已加载完成，开始初始化 UI");

      // 初始化 UI 组件
      initUI();

      // 监听 SPA 路由变化，动态更新按钮显示状态
      initRouteListener();
    }
  }, 500);
}

/**
 * 初始化 UI 组件
 * 创建浮动按钮和 Drawer
 */
function initUI(): void {
  // 检查是否已经存在 UI 元素，避免重复挂载
  const existingFloatingBtn = document.getElementById("tmall-order-enhance-floating-btn");
  if (existingFloatingBtn) {
    console.log("UI 元素已存在，不再重复挂载");
    return;
  }

  // 初始化 Drawer 组件，传入交互按钮配置
  drawerManager.init(ACTION_BUTTONS as ActionButtonConfig[]);

  // 创建浮动触发按钮，点击时切换 Drawer 显示状态
  createFloatingTrigger(() => {
    drawerManager.toggle();
  });

  console.log("UI 组件初始化完成");
}

/**
 * 初始化路由监听器
 * 用于监听单页面应用的 URL 变化，动态更新按钮显示状态
 */
function initRouteListener(): void {
  // 使用 history.pushState 监听器来捕获 SPA 路由变化
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    // URL 变化后重新检查按钮显示状态
    setTimeout(() => {
      console.log("路由变化，重新检查按钮显示状态");
      drawerManager.refreshButtons();
    }, 100);
  };

  // 监听 popstate 事件（浏览器前进/后退）
  window.addEventListener("popstate", () => {
    setTimeout(() => {
      console.log("浏览器前进/后退，重新检查按钮显示状态");
      drawerManager.refreshButtons();
    }, 100);
  });

  // 额外的轮询机制，确保捕获所有路由变化
  let lastUrl = window.location.href;
  setInterval(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log("URL 轮询检测到变化，重新检查按钮显示状态");
      drawerManager.refreshButtons();
    }
  }, 1000);

  console.log("路由监听器已初始化");
}

// #endregion

// 启动脚本
main();