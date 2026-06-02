/**
 * LLM Interface Enhance - 全局状态管理
 *
 * 集中管理应用运行时状态，便于调试和状态追踪
 */

import type { InterceptedResponse, UsageData } from "./types";

/**
 * 应用全局状态
 */
export const state = {
  /** 是否已激活 */
  isActive: false as boolean,

  /** 当前检测到的平台名称 */
  platformName: null as string | null,

  /** 拦截到的请求列表 */
  interceptedRequests: [] as InterceptedResponse[],

  /** 解析后的使用数据列表 */
  usageData: [] as UsageData[],

  /** 原始界面是否已隐藏 */
  originalInterfaceHidden: false as boolean,

  /** 新界面是否已创建 */
  newInterfaceCreated: false as boolean,
};

/**
 * 重置状态（用于刷新数据）
 */
export function resetState(): void {
  state.usageData = [];
  state.interceptedRequests = [];
}
