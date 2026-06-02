/**
 * DeepSeek 平台配置
 *
 * 定义 DeepSeek 平台的匹配规则、选择器和拦截路径
 */

import type { PlatformAdapter } from "../types";
import { parseDeepSeekResponse, parseDeepSeekCostResponse, parseDeepSeekHTML } from "./parser";

/**
 * DeepSeek 平台适配器
 */
export const deepseekAdapter: PlatformAdapter = {
  name: "DeepSeek",

  /** URL 匹配模式（与 meta.ts 的 @match 对应） */
  matchPatterns: ["https://platform.deepseek.com/usage*"],

  /** 需要拦截的 API 路径 */
  interceptPaths: [
    "/api/v0/usage/amount",
    "/api/v0/usage/cost",
  ],

  /** 页面 DOM 选择器 */
  selectors: {
    mainContainer: "body",
    usageTable: "table, .usage-table, [data-usage-table]",
  },

  /**
   * 判断是否需要拦截该请求
   * @param url 请求URL
   * @param _method 请求方法
   * @returns 是否需要拦截
   */
  shouldIntercept(url: string, _method: string): boolean {
    return this.interceptPaths.some((path) => url.includes(path));
  },

  /**
   * 解析 API 响应
   * @param responseData 拦截到的响应数据
   * @returns 解析后的使用数据
   */
  parseResponse(responseData) {
    // 根据请求 URL 区分使用不同的解析器
    if (responseData.url.includes("/api/v0/usage/cost")) {
      return parseDeepSeekCostResponse(responseData);
    }
    return parseDeepSeekResponse(responseData);
  },

  /**
   * 解析 HTML 页面
   * @param html HTML 字符串
   * @returns 解析后的使用数据
   */
  parseHTML(html) {
    return parseDeepSeekHTML(html);
  },
};
