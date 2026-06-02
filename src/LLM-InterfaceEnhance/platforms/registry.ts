/**
 * 平台注册表
 *
 * 负责注册所有平台适配器，并提供平台检测功能
 * 新增平台只需在此数组中注册即可
 */

import type { PlatformAdapter } from "./types";
import { deepseekAdapter } from "./deepseek";

/**
 * 已注册的平台适配器列表
 *
 * 新增平台时，只需：
 * 1. 创建 platforms/<name>/ 目录，实现 PlatformAdapter
 * 2. 在此数组中添加适配器实例
 */
const adapters: PlatformAdapter[] = [
  deepseekAdapter,
  // openaiAdapter,    // 后续添加
  // anthropicAdapter, // 后续添加
  // geminiAdapter,    // 后续添加
];

/**
 * 获取所有已注册的平台适配器
 * @returns 平台适配器数组
 */
export function getRegisteredAdapters(): readonly PlatformAdapter[] {
  return adapters;
}

/**
 * 根据当前 URL 检测并返回匹配的平台适配器
 *
 * @returns 匹配的平台适配器，未匹配返回 null
 */
export function detectPlatform(): PlatformAdapter | null {
  const currentUrl = window.location.href;

  for (const adapter of adapters) {
    for (const pattern of adapter.matchPatterns) {
      const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
      if (regex.test(currentUrl)) {
        return adapter;
      }
    }
  }

  return null;
}
