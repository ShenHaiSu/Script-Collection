import { initCateLabelLarge } from "./cateLabelLarge";
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
