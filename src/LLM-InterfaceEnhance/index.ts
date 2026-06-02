/**
 * LLM Interface Enhance - 主入口文件
 *
 * 职责：仅负责初始化编排，不包含任何业务逻辑
 * 所有功能模块已拆分到 core/、ui/、platforms/ 目录
 */

import { meta } from "./meta";
import { detectPlatform } from "./platforms/registry";
import { detectUIFramework } from "./core/platform-detector";
import { setupInterceptors } from "./core/interceptor";
import { injectStyles, hideOriginalInterface, createMainContainer } from "./core/ui-manager";
import { bindEvents, startRenderer } from "./ui/renderer";

/**
 * 主初始化函数
 *
 * 编排整个脚本的启动流程：
 * 1. 检测当前平台
 * 2. 检测 UI 框架
 * 3. 注入样式
 * 4. 设置请求拦截
 * 5. 创建新界面
 * 6. 绑定事件 & 启动渲染器
 */
async function init(): Promise<void> {
  console.log(`${meta.name} v${meta.version} 正在初始化...`);

  // 1. 检测当前平台
  const platform = detectPlatform();
  if (!platform) {
    console.warn(`${meta.name}: 未检测到支持的LLM平台`);
    return;
  }
  console.log(`${meta.name}: 检测到平台 - ${platform.name}`);

  // 2. 检测 UI 框架
  const framework = detectUIFramework();
  console.log(`${meta.name}: 检测到UI框架 - ${framework}`);

  // 3. 注入样式
  injectStyles();

  // 4. 设置请求拦截（传入平台适配器）
  setupInterceptors(platform);

  // 5. 隐藏原始界面
  hideOriginalInterface();

  // 6. 创建新界面
  createMainContainer();

  // 7. 绑定事件 & 启动渲染器
  bindEvents();
  startRenderer(platform);

  console.log(`${meta.name}: 初始化完成`);
}

// #region 启动
// 等待 DOM 加载完成后初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  // DOM 已加载，直接初始化
  init();
}
// #endregion
