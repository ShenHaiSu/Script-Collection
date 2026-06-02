/**
 * DeepSeek 数据主动获取器
 *
 * 通过 GM_xmlhttpRequest 主动调用 DeepSeek API 获取用量和费用数据，
 * 并将结果输出到 console 供调试和验证。
 *
 * 与被动拦截（interceptor）互补：
 * - 拦截器：捕获页面自身发起的请求
 * - 获取器：主动发起请求，确保数据完整性
 */

import { gmFetch } from "../../../dev-tool/gmFetch";
import type { UsageData } from "../../types";
import {
  parseDeepSeekResponse,
  parseDeepSeekCostResponse,
} from "./parser";

// #region 常量

const BASE_URL = "https://platform.deepseek.com";
const TAG = "[DeepSeek Fetcher]";

/** 用量查询 API 路径 */
const API_AMOUNT = "/api/v0/usage/amount";

/** 费用查询 API 路径 */
const API_COST = "/api/v0/usage/cost";

// #endregion

// #region 内部工具

/**
 * 获取当前年月
 */
function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

/**
 * 打印分隔线
 */
function printSeparator(title: string): void {
  console.log(`${TAG} ${"=".repeat(20)} ${title} ${"=".repeat(20)}`);
}

// #endregion

// #region 公共接口

/**
 * 获取指定月份的 Token 用量数据
 *
 * 调用 GET /api/v0/usage/amount?year={year}&month={month}
 * 文档参考: example/deepseek/api/usage-amount.md
 *
 * @param year 查询年份
 * @param month 查询月份（1-12）
 * @returns 解析后的使用数据数组，失败返回空数组
 */
export async function fetchUsageAmount(
  year: number,
  month: number
): Promise<UsageData[]> {
  const url = `${BASE_URL}${API_AMOUNT}?year=${year}&month=${month}`;
  console.log(`${TAG} 获取用量数据: ${url}`);

  try {
    const response = await gmFetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    // HTTP 层错误
    if (!response.ok) {
      console.error(
        `${TAG} 用量请求失败 - HTTP ${response.status}: ${response.statusText}`
      );
      console.error(`${TAG} 响应内容:`, response.responseText?.substring(0, 500));
      return [];
    }

    // 构造 InterceptedResponse 格式交由 parser 处理
    const interceptedData = {
      url,
      method: "GET",
      timestamp: Date.now(),
      response: response.responseText,
      status: response.status,
    };

    const parsed = parseDeepSeekResponse(interceptedData);

    if (parsed && parsed.length > 0) {
      console.log(`${TAG} 用量数据获取成功，共 ${parsed.length} 条记录`);
      printSeparator(`${year}年${month}月 用量汇总`);

      // 按模型分组汇总
      const modelMap = new Map<string, { inputTokens: number; outputTokens: number; tokens: number }>();
      for (const item of parsed) {
        const existing = modelMap.get(item.model) || { inputTokens: 0, outputTokens: 0, tokens: 0 };
        existing.inputTokens += item.inputTokens;
        existing.outputTokens += item.outputTokens;
        existing.tokens += item.tokens;
        modelMap.set(item.model, existing);
      }

      for (const [model, stats] of modelMap) {
        console.log(`${TAG} 模型: ${model}`);
        console.table({
          "输入Token": stats.inputTokens.toLocaleString(),
          "输出Token": stats.outputTokens.toLocaleString(),
          "Token总计": stats.tokens.toLocaleString(),
        });
      }

      // 输出每日明细（仅活跃日期）
      printSeparator(`${year}年${month}月 每日明细`);
      const activeDays = parsed.filter((item) => item.tokens > 0);
      if (activeDays.length > 0) {
        console.table(
          activeDays.map((item) => ({
            日期: item.timestamp.toISOString().split("T")[0],
            模型: item.model,
            输入: item.inputTokens.toLocaleString(),
            输出: item.outputTokens.toLocaleString(),
            合计: item.tokens.toLocaleString(),
          }))
        );
      } else {
        console.log(`${TAG} 本月无活跃使用记录`);
      }
    } else {
      console.log(`${TAG} 用量数据为空`);
    }

    return parsed || [];
  } catch (error) {
    console.error(`${TAG} 获取用量数据异常:`, error);
    if (error instanceof Error) {
      console.error(`${TAG} 错误: ${error.name} - ${error.message}`);
    }
    return [];
  }
}

/**
 * 获取指定月份的费用数据
 *
 * 调用 GET /api/v0/usage/cost?year={year}&month={month}
 * 文档参考: example/deepseek/api/usage-cost.md
 *
 * @param year 查询年份
 * @param month 查询月份（1-12）
 * @returns 解析后的使用数据数组（含费用），失败返回空数组
 */
export async function fetchUsageCost(
  year: number,
  month: number
): Promise<UsageData[]> {
  const url = `${BASE_URL}${API_COST}?year=${year}&month=${month}`;
  console.log(`${TAG} 获取费用数据: ${url}`);

  try {
    const response = await gmFetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    // HTTP 层错误
    if (!response.ok) {
      console.error(
        `${TAG} 费用请求失败 - HTTP ${response.status}: ${response.statusText}`
      );
      console.error(`${TAG} 响应内容:`, response.responseText?.substring(0, 500));
      return [];
    }

    // 构造 InterceptedResponse 格式交由 parser 处理
    const interceptedData = {
      url,
      method: "GET",
      timestamp: Date.now(),
      response: response.responseText,
      status: response.status,
    };

    const parsed = parseDeepSeekCostResponse(interceptedData);

    if (parsed && parsed.length > 0) {
      console.log(`${TAG} 费用数据获取成功，共 ${parsed.length} 条记录`);
      printSeparator(`${year}年${month}月 费用汇总`);

      // 按模型分组汇总费用
      const modelMap = new Map<string, number>();
      for (const item of parsed) {
        modelMap.set(item.model, (modelMap.get(item.model) || 0) + item.cost);
      }

      let totalCost = 0;
      for (const [model, cost] of modelMap) {
        console.log(`${TAG} 模型: ${model} - 费用: ¥${cost.toFixed(8)}`);
        totalCost += cost;
      }
      console.log(`${TAG} 月度费用总计: ¥${totalCost.toFixed(8)}`);

      // 输出每日费用明细（仅活跃日期）
      printSeparator(`${year}年${month}月 每日费用明细`);
      const activeDays = parsed.filter((item) => item.cost > 0);
      if (activeDays.length > 0) {
        console.table(
          activeDays.map((item) => ({
            日期: item.timestamp.toISOString().split("T")[0],
            模型: item.model,
            "费用(CNY)": item.cost.toFixed(8),
          }))
        );
      } else {
        console.log(`${TAG} 本月无产生费用的记录`);
      }
    } else {
      console.log(`${TAG} 费用数据为空`);
    }

    return parsed || [];
  } catch (error) {
    console.error(`${TAG} 获取费用数据异常:`, error);
    if (error instanceof Error) {
      console.error(`${TAG} 错误: ${error.name} - ${error.message}`);
    }
    return [];
  }
}

/**
 * 执行完整的 DeepSeek 数据获取测试
 *
 * 并行获取用量和费用数据，将结果输出到 console
 * 在油猴脚本初始化时自动调用
 *
 * @param year 查询年份（可选，默认当前年份）
 * @param month 查询月份（可选，默认当前月份）
 */
export async function fetchAllDeepSeekData(
  year?: number,
  month?: number
): Promise<{ usage: UsageData[]; cost: UsageData[] }> {
  const { year: defaultYear, month: defaultMonth } = getCurrentYearMonth();
  const queryYear = year ?? defaultYear;
  const queryMonth = month ?? defaultMonth;

  printSeparator(`DeepSeek 数据获取开始 (${queryYear}年${queryMonth}月)`);

  // 并行获取
  const [usage, cost] = await Promise.all([
    fetchUsageAmount(queryYear, queryMonth),
    fetchUsageCost(queryYear, queryMonth),
  ]);

  printSeparator("DeepSeek 数据获取完成");
  console.log(`${TAG} 用量记录: ${usage.length} 条, 费用记录: ${cost.length} 条`);

  return { usage, cost };
}

// #endregion
