/**
 * LLM Interface Enhance - 全局类型定义
 *
 * 集中管理所有共享类型，避免循环依赖
 */

/**
 * 拦截到的响应数据
 */
export interface InterceptedResponse {
  /** 请求URL */
  url: string;
  /** 请求方法 */
  method: string;
  /** 请求发起时间戳 */
  timestamp: number;
  /** 响应原始文本 */
  response: string;
  /** HTTP状态码 */
  status: number;
}

/**
 * 解析后的使用数据
 */
export interface UsageData {
  /** 时间戳 */
  timestamp: Date;
  /** 模型名称 */
  model: string;
  /** 输入Token数 */
  inputTokens: number;
  /** 输出Token数 */
  outputTokens: number;
  /** 总Token数 */
  tokens: number;
  /** 费用 */
  cost: number;
  /** 状态（可选） */
  status?: string;
}

/**
 * 全局设置
 */
export interface Settings {
  /** 自动刷新数据 */
  autoRefresh: boolean;
  /** 显示通知 */
  showNotifications: boolean;
  /** 刷新间隔（秒） */
  refreshInterval: number;
}

/**
 * 默认设置
 */
export const DEFAULT_SETTINGS: Settings = {
  autoRefresh: true,
  showNotifications: true,
  refreshInterval: 30,
};
