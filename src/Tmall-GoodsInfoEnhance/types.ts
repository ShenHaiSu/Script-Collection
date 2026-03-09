/**
 * 类型定义 (types.ts)
 */

export interface FeatureConfig {
  enabled: boolean;
  init: () => void;
  description: string;
}

export interface SkuItem {
  name: string;
  element: HTMLElement;
}
