/**
 * 脚本特性配置项
 */
export interface FeatureConfig {
  /** 特性开关 */
  enabled: boolean;
  /** 特性初始化函数 */
  init: () => void;
  /** 特性名称描述 */
  description: string;
}