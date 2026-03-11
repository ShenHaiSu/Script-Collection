import { initCateLabelLarge } from "./cateLabelLarge";
import { initTabToOverlayInput } from "./tabToOverlayInput";
import { initKeyboardNavigation } from "./keyboardNavigation";
import type { FeatureConfig } from "./types";

// #region 配置与特性注册
/**
 * 特性注册表：用于横向扩展新的功能模块
 */
const featureRegistry: Record<string, FeatureConfig> = {
  cateLabelLarge: {
    enabled: true, // 默认开启
    init: initCateLabelLarge,
    description: "类目文本标签点击自动勾选增强",
  },
  tabToOverlayInput: {
    enabled: true, // 默认开启
    init: initTabToOverlayInput,
    description: "Tab 键快速聚焦浮层输入框",
  },
  keyboardNavigation: {
    enabled: true, // 默认开启
    init: initKeyboardNavigation,
    description: "搜索下拉框键盘上下键选择与回车确认",
  },
  // 后续可以在此处注册新的特性模块
  /*
  anotherFeature: {
    enabled: false,
    init: initAnotherFeature,
    description: '示例扩展特性',
  }
  */
};
// #endregion

// #region 核心启动逻辑
/**
 * 脚本主入口函数：根据配置自动挂载各个特性逻辑
 */
function bootstrap() {
  console.log("[Tmall-FastGoodsInput] 脚本初始化中...");

  Object.entries(featureRegistry).forEach(([key, config]) => {
    if (config.enabled) {
      try {
        config.init();
        console.log(`[Tmall-FastGoodsInput] 特性 [${key}] (${config.description}) 已成功启动`);
      } catch (error) {
        console.error(`[Tmall-FastGoodsInput] 特性 [${key}] 启动失败:`, error);
      }
    }
  });
}

// 执行启动
bootstrap();
// #endregion
