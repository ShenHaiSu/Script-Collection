import type { FeatureConfig } from "./types";
import { copyProductIdAction } from "./copyProductId";
import { copyAllColorNamesAction } from "./copyColorNames";
import { copyAllSizeNamesAction } from "./copySizeNames";
import { initUIEnhance } from "./uiEnhance";
// 导入黑名单配置，方便用户在此文件中也将看到可配置的选项
export { SIZE_BLACKLIST, COLOR_BLACKLIST } from "./helper";

// #region 注册油猴菜单
/**
 * 注册油猴脚本菜单，方便用户手动触发功能
 */
function registerMenu() {
  if (typeof GM_registerMenuCommand !== "undefined") {
    GM_registerMenuCommand("📋 复制商品 ID", copyProductIdAction);
    GM_registerMenuCommand("🎨 复制所有颜色名称", copyAllColorNamesAction);
    GM_registerMenuCommand("📏 复制所有尺码名称", copyAllSizeNamesAction);
  }
}
// #endregion

// #region 启动逻辑
/**
 * 特性注册表：用于横向扩展新的功能模块
 */
const featureRegistry: Record<string, FeatureConfig> = {
  menuCommand: {
    enabled: true,
    init: registerMenu,
    description: "油猴菜单指令注册",
  },
  uiEnhance: {
    enabled: true,
    init: initUIEnhance,
    description: "页面 UI 增强",
  },
};

/**
 * 脚本主入口函数：根据配置自动挂载各个特性逻辑
 */
function bootstrap() {
  console.log("[Tmall-GoodsInfoEnhance] 脚本加载中...");

  Object.entries(featureRegistry).forEach(([key, config]) => {
    if (config.enabled) {
      try {
        config.init();
        console.log(`[Tmall-GoodsInfoEnhance] 特性 [${key}] (${config.description}) 已成功启动`);
      } catch (error) {
        console.error(`[Tmall-GoodsInfoEnhance] 特性 [${key}] 启动失败:`, error);
      }
    }
  });
}

// 执行启动
bootstrap();
// #endregion
