/**
 * 天猫后台订单信息增强脚本
 * 用于在淘宝/天猫订单管理页面增强订单信息的展示
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

// #endregion

// 启动脚本
main();