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

// #region 颜色尺码自动填写类型

/**
 * 颜色尺码自动填写配置项
 */
export interface AutoFillColorSizeOptions {
  // 预留配置项
}

/**
 * 解析后的入参数据
 */
export interface ParsedInputData {
  colors: string[];
  sizes: string[];
}

/**
 * 容器元素信息
 */
export interface ContainerInfo {
  element: HTMLElement;
  type: "color" | "size";
  headerText: string;
}

// #endregion
