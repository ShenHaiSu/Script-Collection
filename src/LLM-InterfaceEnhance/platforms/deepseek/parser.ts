/**
 * DeepSeek 平台数据解析器
 *
 * 负责解析 DeepSeek 的 API 响应和 HTML 页面
 * API 文档参考: example/deepseek/api/usage-amount.md / usage-cost.md
 */

import type { InterceptedResponse, UsageData } from "../../types";

// #region 内部类型（与 DeepSeek v0 API 文档对齐）

/** 用量类型枚举 */
type UsageType =
  | "PROMPT_TOKEN"
  | "PROMPT_CACHE_HIT_TOKEN"
  | "PROMPT_CACHE_MISS_TOKEN"
  | "RESPONSE_TOKEN"
  | "REQUEST";

/** Token 用量项 */
interface TokenUsageItem {
  type: UsageType;
  amount: string;
}

/** 模型用量汇总 */
interface ModelUsageSummary {
  model: string;
  usage: TokenUsageItem[];
}

/** 每日用量 */
interface DayUsage {
  date: string;
  data: ModelUsageSummary[];
}

/** 用量查询 - 顶层响应 */
interface UsageAmountResponse {
  code: number;
  msg: string;
  data: {
    biz_code: number;
    biz_msg: string;
    biz_data: {
      total: ModelUsageSummary[];
      days: DayUsage[];
    };
  };
}

/** 费用项 */
interface CostItem {
  type: UsageType;
  amount: string;
}

/** 模型费用汇总 */
interface ModelCostSummary {
  model: string;
  usage: CostItem[];
}

/** 每日费用 */
interface DayCost {
  date: string;
  data: ModelCostSummary[];
}

/** 费用查询 - 业务数据 */
interface CostBizData {
  total: ModelCostSummary[];
  days: DayCost[];
  currency: string;
}

/** 费用查询 - 顶层响应 */
interface UsageCostResponse {
  code: number;
  msg: string;
  data: {
    biz_code: number;
    biz_msg: string;
    biz_data: CostBizData[];
  };
}

// #endregion

// #region 内部工具函数

/**
 * 解析 Token 用量项，提取各类型的数值
 */
function parseTokenUsage(items: TokenUsageItem[]): {
  promptToken: number;
  cacheHit: number;
  cacheMiss: number;
  responseToken: number;
  requestCount: number;
} {
  const result = {
    promptToken: 0,
    cacheHit: 0,
    cacheMiss: 0,
    responseToken: 0,
    requestCount: 0,
  };

  for (const item of items) {
    const value = parseInt(item.amount, 10) || 0;
    switch (item.type) {
      case "PROMPT_TOKEN":
        result.promptToken = value;
        break;
      case "PROMPT_CACHE_HIT_TOKEN":
        result.cacheHit = value;
        break;
      case "PROMPT_CACHE_MISS_TOKEN":
        result.cacheMiss = value;
        break;
      case "RESPONSE_TOKEN":
        result.responseToken = value;
        break;
      case "REQUEST":
        result.requestCount = value;
        break;
    }
  }

  return result;
}

/**
 * 解析费用项，提取各类型的金额
 */
function parseCostItems(items: CostItem[]): {
  promptCost: number;
  cacheHitCost: number;
  cacheMissCost: number;
  responseCost: number;
  requestCost: number;
} {
  const result = {
    promptCost: 0,
    cacheHitCost: 0,
    cacheMissCost: 0,
    responseCost: 0,
    requestCost: 0,
  };

  for (const item of items) {
    const value = parseFloat(item.amount) || 0;
    switch (item.type) {
      case "PROMPT_TOKEN":
        result.promptCost = value;
        break;
      case "PROMPT_CACHE_HIT_TOKEN":
        result.cacheHitCost = value;
        break;
      case "PROMPT_CACHE_MISS_TOKEN":
        result.cacheMissCost = value;
        break;
      case "RESPONSE_TOKEN":
        result.responseCost = value;
        break;
      case "REQUEST":
        result.requestCost = value;
        break;
    }
  }

  return result;
}

// #endregion

// #region 公共接口

/**
 * 解析 DeepSeek 用量查询响应（/api/v0/usage/amount）
 *
 * 将 API 响应转换为 UsageData[] 格式，用于兼容现有的界面渲染逻辑
 *
 * @param responseData 拦截到的响应数据
 * @returns 解析后的使用数据数组，返回 null 表示无有效数据或解析失败
 */
export function parseDeepSeekResponse(responseData: InterceptedResponse): UsageData[] | null {
  try {
    const json = JSON.parse(responseData.response) as UsageAmountResponse;

    // 检查业务层状态码
    if (json.code !== 0 || json.data?.biz_code !== 0) {
      console.warn(
        `[DeepSeek Parser] 用量接口返回错误: code=${json.code}, biz_code=${json.data?.biz_code}`
      );
      return null;
    }

    const bizData = json.data.biz_data;
    if (!bizData?.days || !Array.isArray(bizData.days) || bizData.days.length === 0) {
      return null;
    }

    const usageData: UsageData[] = [];

    for (const day of bizData.days) {
      for (const model of day.data) {
        const usage = parseTokenUsage(model.usage);
        const totalInput = usage.cacheHit + usage.cacheMiss;
        const totalTokens = totalInput + usage.responseToken;

        // 跳过完全没有用量的条目
        if (usage.requestCount === 0 && totalTokens === 0) continue;

        usageData.push({
          timestamp: new Date(day.date),
          model: model.model || "unknown",
          inputTokens: totalInput,
          outputTokens: usage.responseToken,
          tokens: totalTokens,
          cost: 0, // amount 接口不返回费用数据
        });
      }
    }

    return usageData.length > 0 ? usageData : null;
  } catch (error) {
    console.error("[DeepSeek Parser] 解析用量响应失败:", error);
    return null;
  }
}

/**
 * 解析 DeepSeek 费用查询响应（/api/v0/usage/cost）
 *
 * 将 API 响应转换为 UsageData[] 格式，包含费用信息
 *
 * @param responseData 拦截到的响应数据
 * @returns 解析后的使用数据数组，返回 null 表示无有效数据或解析失败
 */
export function parseDeepSeekCostResponse(responseData: InterceptedResponse): UsageData[] | null {
  try {
    const json = JSON.parse(responseData.response) as UsageCostResponse;

    // 检查业务层状态码
    if (json.code !== 0 || json.data?.biz_code !== 0) {
      console.warn(
        `[DeepSeek Parser] 费用接口返回错误: code=${json.code}, biz_code=${json.data?.biz_code}`
      );
      return null;
    }

    const bizDataArray = json.data.biz_data;
    if (!bizDataArray || !Array.isArray(bizDataArray) || bizDataArray.length === 0) {
      return null;
    }

    // cost 接口的 biz_data 是数组，取第一个元素
    const bizData = bizDataArray[0];
    if (!bizData?.days || !Array.isArray(bizData.days) || bizData.days.length === 0) {
      return null;
    }

    const usageData: UsageData[] = [];

    for (const day of bizData.days) {
      for (const model of day.data) {
        const cost = parseCostItems(model.usage);
        const totalInputCost = cost.promptCost + cost.cacheHitCost + cost.cacheMissCost;
        const totalCost = totalInputCost + cost.responseCost + cost.requestCost;

        // 跳过完全没有费用的条目
        if (totalCost === 0) continue;

        usageData.push({
          timestamp: new Date(day.date),
          model: model.model || "unknown",
          inputTokens: 0, // cost 接口不返回 token 数量
          outputTokens: 0,
          tokens: 0,
          cost: totalCost,
        });
      }
    }

    return usageData.length > 0 ? usageData : null;
  } catch (error) {
    console.error("[DeepSeek Parser] 解析费用响应失败:", error);
    return null;
  }
}

/**
 * 解析 DeepSeek HTML 页面
 *
 * 用于处理 SSR 渲染的 usage 页面（当前 DeepSeek 为 SPA，此方法为兜底）
 *
 * @param html HTML 字符串
 * @returns 解析后的使用数据数组，返回 null 表示无有效数据
 */
export function parseDeepSeekHTML(html: string): UsageData[] | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // 查找使用数据表格
    const table = doc.querySelector("table, .usage-table, [data-usage-table]");
    if (!table) return null;

    // 解析表格行
    const rows = table.querySelectorAll("tr");
    const usageData: UsageData[] = [];

    rows.forEach((row, index) => {
      if (index === 0) return; // 跳过表头

      const cells = row.querySelectorAll("td");
      if (cells.length >= 4) {
        const inputTokens = parseInt(cells[2]?.textContent?.trim() || "0");
        const outputTokens = parseInt(cells[3]?.textContent?.trim() || "0");

        usageData.push({
          timestamp: new Date(cells[0]?.textContent?.trim() || ""),
          model: cells[1]?.textContent?.trim() || "unknown",
          inputTokens,
          outputTokens,
          tokens: inputTokens + outputTokens,
          cost: parseFloat(cells[4]?.textContent?.trim()?.replace("$", "") || "0"),
          status: cells[5]?.textContent?.trim(),
        });
      }
    });

    return usageData.length > 0 ? usageData : null;
  } catch {
    return null;
  }
}

// #endregion
