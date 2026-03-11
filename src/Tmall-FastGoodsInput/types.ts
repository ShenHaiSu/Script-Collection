/**
 * 脚本特性配置项
 */
export interface FeatureConfig<T = any> {
  /** 特性开关 */
  enabled: boolean;
  /** 特性初始化函数 */
  init: (options?: T) => void;
  /** 特性名称描述 */
  description: string;
  /** 可选的初始化配置项 */
  options?: T;
}
