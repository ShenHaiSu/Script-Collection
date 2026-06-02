/**
 * DeepSeek 平台数据解析器
 *
 * 负责解析 DeepSeek 的 API 响应和 HTML 页面
 */

import type { InterceptedResponse, UsageData } from "../../types";

/**
 * 解析 DeepSeek API 响应
 *
 * DeepSeek 的 usage API 返回格式：
 * { data: [{ created_at, model, input_tokens, output_tokens, total_cost }] }
 *
 * @param responseData 拦截到的响应数据
 * @returns 解析后的使用数据数组
 */
export function parseDeepSeekResponse(responseData: InterceptedResponse): UsageData[] | null {
  try {
    const json = JSON.parse(responseData.response);

    // 格式1: { data: [...] }
    if (json.data && Array.isArray(json.data)) {
      return json.data.map((item: any) => ({
        timestamp: new Date(item.created_at || item.timestamp),
        model: item.model || item.model_name || "unknown",
        inputTokens: item.input_tokens || 0,
        outputTokens: item.output_tokens || 0,
        tokens: (item.input_tokens || 0) + (item.output_tokens || 0),
        cost: item.total_cost || item.cost || 0,
      }));
    }

    // 格式2: { usage: [...] }
    if (json.usage && Array.isArray(json.usage)) {
      return json.usage.map((item: any) => ({
        timestamp: new Date(item.date || item.timestamp),
        model: item.model || "unknown",
        inputTokens: item.input_tokens || 0,
        outputTokens: item.output_tokens || 0,
        tokens: item.total_tokens || 0,
        cost: item.cost || 0,
      }));
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 解析 DeepSeek HTML 页面
 *
 * 用于处理 SSR 渲染的 usage 页面
 *
 * @param html HTML 字符串
 * @returns 解析后的使用数据数组
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
