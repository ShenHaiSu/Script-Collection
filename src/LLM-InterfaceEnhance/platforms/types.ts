/**
 * 平台适配器接口定义
 *
 * 每个 LLM 平台必须实现此接口，以支持横向扩展
 * 新增平台只需创建 platforms/<name>/ 目录并实现此接口
 */

import type { InterceptedResponse, UsageData } from "../types";

/**
 * 平台适配器接口
 *
 * 设计原则：
 * - 平台的网络请求 path 由 interceptPaths 定义
 * - 平台的数据解析行为由 parser 方法定义
 * - 平台的 UI 选择器由 selectors 定义
 */
export interface PlatformAdapter {
  /** 平台名称，用于日志和显示 */
  name: string;

  /** 当前脚本需要匹配的 URL 模式列表（与 meta.ts 的 @match 对应） */
  matchPatterns: string[];

  /** 需要拦截的 API 路径模式（控制拦截哪些请求） */
  interceptPaths: string[];

  /** 页面 DOM 选择器 */
  selectors: {
    /** 主容器选择器 */
    mainContainer: string;
    /** 使用数据表格选择器 */
    usageTable: string;
    /** 其他自定义选择器 */
    [key: string]: string;
  };

  /**
   * 自定义网络请求匹配逻辑
   * 判断某个拦截到的请求是否是本平台关心的使用数据请求
   * @param url 请求URL
   * @param method 请求方法
   * @returns 是否需要处理
   */
  shouldIntercept(url: string, method: string): boolean;

  /**
   * 数据解析器 - 从拦截到的响应中提取 UsageData
   * 每个平台的 API 响应格式不同，由各自的 parser 处理
   * @param responseData 拦截到的原始响应数据
   * @returns 解析后的使用数据数组，返回 null 表示无有效数据
   */
  parseResponse(responseData: InterceptedResponse): UsageData[] | null;

  /**
   * HTML 解析器 - 从 HTML 页面中提取使用数据
   * 某些平台的 usage 页面是 SSR 渲染的 HTML
   * @param html HTML 字符串
   * @returns 解析后的使用数据数组，返回 null 表示无有效数据
   */
  parseHTML(html: string): UsageData[] | null;
}
