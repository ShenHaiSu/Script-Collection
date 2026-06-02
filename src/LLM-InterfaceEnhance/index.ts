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
import { injectStyles, createMainContainer, createToggleButton } from "./core/ui-manager";
import { bindEvents, startRenderer } from "./ui/renderer";
import { state } from "./state";
import { fetchAllDeepSeekData } from "./platforms/deepseek";

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

  // 5. 主动获取 DeepSeek 数据并输出到 console
  if (platform.name === "DeepSeek") {
    console.log(`${meta.name}: 开始主动获取 DeepSeek 数据...`);
    fetchAllDeepSeekData()
      .then(({ usage, cost }) => {
        // 将主动获取的数据合并到全局状态
        if (usage.length > 0) {
          state.usageData.push(...usage);
        }
        if (cost.length > 0) {
          state.usageData.push(...cost);
        }
        console.log(`${meta.name}: 主动数据获取完成，已合并 ${usage.length + cost.length} 条记录`);
      })
      .catch((error) => {
        console.error(`${meta.name}: 主动数据获取失败`, error);
      });
  }

  // 6. 创建增强面板（初始隐藏，等待用户点击入口按钮）
  createMainContainer();

  // 7. 绑定事件 & 启动渲染器
  bindEvents();
  startRenderer(platform);

  // 8. 创建入口切换按钮
  createToggleButton();

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
