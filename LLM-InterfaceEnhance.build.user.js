// ==UserScript==
// @name         LLM Interface Enhance
// @version      0.1.0
// @description  优化增强各类LLM平台的控制台账单界面，创造多端适配响应式布局的更加优质的交互界面。支持XHR请求截取、HTML元素动态解析等功能。
// @author       Developer_Name
// @match        https://platform.deepseek.com/usage*
// @namespace    https://github.com/ShenHaiSu/Script-Collection
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deepseek.com
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @connect      platform.deepseek.com
// @run-at       document-end
// @noframes     
// @supportURL   https://github.com/ShenHaiSu/Script-Collection/issues
// ==/UserScript==

"use strict";
(() => {
  // LLM-InterfaceEnhance/meta.ts
  var meta = {
    // @name: 脚本的名称。会在油猴管理面板中显示。
    name: "LLM Interface Enhance",
    // @namespace: 脚本的命名空间，用于唯一标识脚本。通常是你的个人域名或 GitHub 个人主页。
    namespace: "https://github.com/ShenHaiSu/Script-Collection",
    // @version: 脚本版本号。
    version: "0.1.0",
    // @description: 脚本的功能描述。建议简明扼要，支持多语言（例如使用 @description:zh-CN）。
    description: "优化增强各类LLM平台的控制台账单界面，创造多端适配响应式布局的更加优质的交互界面。支持XHR请求截取、HTML元素动态解析等功能。",
    // @author: 脚本作者的名称。
    author: "Developer_Name",
    // @icon: 脚本的图标 URL，显示在管理面板和菜单中。
    icon: "https://www.google.com/s2/favicons?sz=64&domain=deepseek.com",
    // @match: 脚本生效的 URL 模式。支持通配符。
    // 首先支持 DeepSeek 平台，后续可添加更多 LLM 平台
    match: [
      "https://platform.deepseek.com/usage*"
      // 后续可添加更多 LLM 平台，例如：
      // "https://chat.openai.com/*",
      // "https://chatgpt.com/*",
      // "https://bard.google.com/*",
      // "https://copilot.microsoft.com/*",
      // "https://huggingface.co/chat/*",
    ],
    // @grant: 申请脚本权限。常见的有 GM_xmlhttpRequest, GM_setValue, GM_getValue 等。
    grant: [
      "GM_xmlhttpRequest",
      "GM_setValue",
      "GM_getValue",
      "GM_addStyle",
      "GM_registerMenuCommand"
    ],
    // @connect: 允许跨域请求的域名白名单，用于 GM_xmlhttpRequest。
    connect: [
      "platform.deepseek.com"
      // 后续可添加更多域名
    ],
    // @run-at: 脚本开始运行的时机。
    "run-at": "document-end",
    // @noframes: 如果定义，则脚本不会在 iframe 中运行。
    noframes: "",
    // @supportURL: 用户反馈问题的地址。
    supportURL: "https://github.com/ShenHaiSu/Script-Collection/issues"
  };

  // LLM-InterfaceEnhance/platforms/deepseek/parser.ts
  function parseTokenUsage(items) {
    const result = {
      promptToken: 0,
      cacheHit: 0,
      cacheMiss: 0,
      responseToken: 0,
      requestCount: 0
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
  function parseCostItems(items) {
    const result = {
      promptCost: 0,
      cacheHitCost: 0,
      cacheMissCost: 0,
      responseCost: 0,
      requestCost: 0
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
  function parseDeepSeekResponse(responseData) {
    try {
      const json = JSON.parse(responseData.response);
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
      const usageData = [];
      for (const day of bizData.days) {
        for (const model of day.data) {
          const usage = parseTokenUsage(model.usage);
          const totalInput = usage.cacheHit + usage.cacheMiss;
          const totalTokens = totalInput + usage.responseToken;
          if (usage.requestCount === 0 && totalTokens === 0) continue;
          usageData.push({
            timestamp: new Date(day.date),
            model: model.model || "unknown",
            inputTokens: totalInput,
            outputTokens: usage.responseToken,
            tokens: totalTokens,
            cost: 0
            // amount 接口不返回费用数据
          });
        }
      }
      return usageData.length > 0 ? usageData : null;
    } catch (error) {
      console.error("[DeepSeek Parser] 解析用量响应失败:", error);
      return null;
    }
  }
  function parseDeepSeekCostResponse(responseData) {
    try {
      const json = JSON.parse(responseData.response);
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
      const bizData = bizDataArray[0];
      if (!bizData?.days || !Array.isArray(bizData.days) || bizData.days.length === 0) {
        return null;
      }
      const usageData = [];
      for (const day of bizData.days) {
        for (const model of day.data) {
          const cost = parseCostItems(model.usage);
          const totalInputCost = cost.promptCost + cost.cacheHitCost + cost.cacheMissCost;
          const totalCost = totalInputCost + cost.responseCost + cost.requestCost;
          if (totalCost === 0) continue;
          usageData.push({
            timestamp: new Date(day.date),
            model: model.model || "unknown",
            inputTokens: 0,
            // cost 接口不返回 token 数量
            outputTokens: 0,
            tokens: 0,
            cost: totalCost
          });
        }
      }
      return usageData.length > 0 ? usageData : null;
    } catch (error) {
      console.error("[DeepSeek Parser] 解析费用响应失败:", error);
      return null;
    }
  }
  function parseDeepSeekHTML(html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const table = doc.querySelector("table, .usage-table, [data-usage-table]");
      if (!table) return null;
      const rows = table.querySelectorAll("tr");
      const usageData = [];
      rows.forEach((row, index) => {
        if (index === 0) return;
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
            status: cells[5]?.textContent?.trim()
          });
        }
      });
      return usageData.length > 0 ? usageData : null;
    } catch {
      return null;
    }
  }

  // LLM-InterfaceEnhance/platforms/deepseek/config.ts
  var deepseekAdapter = {
    name: "DeepSeek",
    /** URL 匹配模式（与 meta.ts 的 @match 对应） */
    matchPatterns: ["https://platform.deepseek.com/usage*"],
    /** 需要拦截的 API 路径 */
    interceptPaths: [
      "/api/v0/usage/amount",
      "/api/v0/usage/cost"
    ],
    /** 页面 DOM 选择器 */
    selectors: {
      mainContainer: "body",
      usageTable: "table, .usage-table, [data-usage-table]"
    },
    /**
     * 判断是否需要拦截该请求
     * @param url 请求URL
     * @param _method 请求方法
     * @returns 是否需要拦截
     */
    shouldIntercept(url, _method) {
      return this.interceptPaths.some((path) => url.includes(path));
    },
    /**
     * 解析 API 响应
     * @param responseData 拦截到的响应数据
     * @returns 解析后的使用数据
     */
    parseResponse(responseData) {
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
    }
  };

  // dev-tool/gmFetch.ts
  function gmFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      if (typeof GM_xmlhttpRequest === "undefined") {
        reject(new Error("GM_xmlhttpRequest is not defined. Are you running in a Userscript environment?"));
        return;
      }
      GM_xmlhttpRequest({
        method: options.method || "GET",
        url,
        headers: options.headers,
        data: options.body,
        ...options,
        onload: (response) => {
          const gmResponse = {
            ok: response.status >= 200 && response.status < 300,
            status: response.status,
            statusText: response.statusText,
            data: response.response,
            responseText: response.responseText,
            responseHeaders: response.responseHeaders,
            finalUrl: response.finalUrl,
            json: () => {
              try {
                return JSON.parse(response.responseText);
              } catch (e) {
                throw new Error("Failed to parse response as JSON");
              }
            }
          };
          resolve(gmResponse);
        },
        onerror: (error) => {
          reject(error);
        },
        onabort: () => {
          reject(new Error("Request aborted"));
        },
        ontimeout: () => {
          reject(new Error("Request timeout"));
        }
      });
    });
  }

  // LLM-InterfaceEnhance/platforms/deepseek/fetcher.ts
  var BASE_URL = "https://platform.deepseek.com";
  var TAG = "[DeepSeek Fetcher]";
  var API_AMOUNT = "/api/v0/usage/amount";
  var API_COST = "/api/v0/usage/cost";
  function getCurrentYearMonth() {
    const now = /* @__PURE__ */ new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };
  }
  function printSeparator(title) {
    console.log(`${TAG} ${"=".repeat(20)} ${title} ${"=".repeat(20)}`);
  }
  async function fetchUsageAmount(year, month) {
    const url = `${BASE_URL}${API_AMOUNT}?year=${year}&month=${month}`;
    console.log(`${TAG} 获取用量数据: ${url}`);
    try {
      const response = await gmFetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      if (!response.ok) {
        console.error(
          `${TAG} 用量请求失败 - HTTP ${response.status}: ${response.statusText}`
        );
        console.error(`${TAG} 响应内容:`, response.responseText?.substring(0, 500));
        return [];
      }
      const interceptedData = {
        url,
        method: "GET",
        timestamp: Date.now(),
        response: response.responseText,
        status: response.status
      };
      const parsed = parseDeepSeekResponse(interceptedData);
      if (parsed && parsed.length > 0) {
        console.log(`${TAG} 用量数据获取成功，共 ${parsed.length} 条记录`);
        printSeparator(`${year}年${month}月 用量汇总`);
        const modelMap = /* @__PURE__ */ new Map();
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
            "Token总计": stats.tokens.toLocaleString()
          });
        }
        printSeparator(`${year}年${month}月 每日明细`);
        const activeDays = parsed.filter((item) => item.tokens > 0);
        if (activeDays.length > 0) {
          console.table(
            activeDays.map((item) => ({
              日期: item.timestamp.toISOString().split("T")[0],
              模型: item.model,
              输入: item.inputTokens.toLocaleString(),
              输出: item.outputTokens.toLocaleString(),
              合计: item.tokens.toLocaleString()
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
  async function fetchUsageCost(year, month) {
    const url = `${BASE_URL}${API_COST}?year=${year}&month=${month}`;
    console.log(`${TAG} 获取费用数据: ${url}`);
    try {
      const response = await gmFetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      if (!response.ok) {
        console.error(
          `${TAG} 费用请求失败 - HTTP ${response.status}: ${response.statusText}`
        );
        console.error(`${TAG} 响应内容:`, response.responseText?.substring(0, 500));
        return [];
      }
      const interceptedData = {
        url,
        method: "GET",
        timestamp: Date.now(),
        response: response.responseText,
        status: response.status
      };
      const parsed = parseDeepSeekCostResponse(interceptedData);
      if (parsed && parsed.length > 0) {
        console.log(`${TAG} 费用数据获取成功，共 ${parsed.length} 条记录`);
        printSeparator(`${year}年${month}月 费用汇总`);
        const modelMap = /* @__PURE__ */ new Map();
        for (const item of parsed) {
          modelMap.set(item.model, (modelMap.get(item.model) || 0) + item.cost);
        }
        let totalCost = 0;
        for (const [model, cost] of modelMap) {
          console.log(`${TAG} 模型: ${model} - 费用: ¥${cost.toFixed(8)}`);
          totalCost += cost;
        }
        console.log(`${TAG} 月度费用总计: ¥${totalCost.toFixed(8)}`);
        printSeparator(`${year}年${month}月 每日费用明细`);
        const activeDays = parsed.filter((item) => item.cost > 0);
        if (activeDays.length > 0) {
          console.table(
            activeDays.map((item) => ({
              日期: item.timestamp.toISOString().split("T")[0],
              模型: item.model,
              "费用(CNY)": item.cost.toFixed(8)
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
  async function fetchAllDeepSeekData(year, month) {
    const { year: defaultYear, month: defaultMonth } = getCurrentYearMonth();
    const queryYear = year ?? defaultYear;
    const queryMonth = month ?? defaultMonth;
    printSeparator(`DeepSeek 数据获取开始 (${queryYear}年${queryMonth}月)`);
    const [usage, cost] = await Promise.all([
      fetchUsageAmount(queryYear, queryMonth),
      fetchUsageCost(queryYear, queryMonth)
    ]);
    printSeparator("DeepSeek 数据获取完成");
    console.log(`${TAG} 用量记录: ${usage.length} 条, 费用记录: ${cost.length} 条`);
    return { usage, cost };
  }

  // LLM-InterfaceEnhance/platforms/registry.ts
  var adapters = [
    deepseekAdapter
    // openaiAdapter,    // 后续添加
    // anthropicAdapter, // 后续添加
    // geminiAdapter,    // 后续添加
  ];
  function detectPlatform() {
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

  // LLM-InterfaceEnhance/core/platform-detector.ts
  function detectUIFramework() {
    const isReact = !!document.querySelector('[data-reactroot], [data-reactroot=""]') || Object.keys(document.body).some((k) => k.startsWith("__react"));
    if (isReact) return "react";
    if (window.__VUE__) return "vue3";
    if (window.Vue) return "vue2";
    if (window.ng) return "angular";
    if (window.jQuery) return "jquery";
    return "unknown";
  }

  // LLM-InterfaceEnhance/state.ts
  var state = {
    /** 是否已激活 */
    isActive: false,
    /** 当前检测到的平台名称 */
    platformName: null,
    /** 拦截到的请求列表 */
    interceptedRequests: [],
    /** 解析后的使用数据列表 */
    usageData: [],
    /** 原始界面是否已隐藏 */
    originalInterfaceHidden: false,
    /** 新界面是否已创建 */
    newInterfaceCreated: false,
    /** 增强面板是否可见 */
    enhancedPanelVisible: false
  };
  function resetState() {
    state.usageData = [];
    state.interceptedRequests = [];
  }

  // LLM-InterfaceEnhance/ui/styles/hide-original.css.ts
  var HIDE_ORIGINAL_STYLES = `
  /* 隐藏原始界面，但保留我们的新界面和切换按钮 */
  body > *:not(#llm-enhance-container):not(#llm-enhance-styles):not(#llm-enhance-hide-original):not(#llm-enhance-toggle-btn) {
    display: none !important;
  }
  
  /* 确保新界面可见 */
  #llm-enhance-container {
    display: block !important;
    visibility: visible !important;
  }

  /* 确保切换按钮始终可见 */
  #llm-enhance-toggle-btn {
    display: flex !important;
    visibility: visible !important;
  }
`;

  // LLM-InterfaceEnhance/ui/styles/main.css.ts
  var MAIN_STYLES = `
  /* 主容器 */
  #llm-enhance-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background: #f5f5f5;
    min-height: 100vh;
  }
  
  /* 头部 */
  .llm-enhance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .llm-enhance-header h1 {
    margin: 0;
    color: #333;
    font-size: 24px;
  }
  
  /* 控制按钮组 */
  .llm-enhance-controls {
    display: flex;
    gap: 10px;
  }
  
  .llm-enhance-controls button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #007bff;
    color: white;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  }
  
  .llm-enhance-controls button:hover {
    background: #0056b3;
  }
  
  /* 内容区域 */
  .llm-enhance-content {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  /* 统计卡片网格 */
  .llm-enhance-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .stat-card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 6px;
    text-align: center;
    border: 1px solid #e9ecef;
  }
  
  .stat-card h3 {
    margin: 0 0 10px 0;
    color: #6c757d;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .stat-card p {
    margin: 0;
    font-size: 28px;
    font-weight: bold;
    color: #495057;
  }
  
  /* 表格容器 */
  .llm-enhance-table-container {
    overflow-x: auto;
    margin-bottom: 20px;
  }
  
  #usage-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  #usage-table th,
  #usage-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }
  
  #usage-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #495057;
    position: sticky;
    top: 0;
  }
  
  #usage-table tr:hover {
    background: #f8f9fa;
  }
  
  /* 页脚 */
  .llm-enhance-footer {
    display: flex;
    justify-content: space-between;
    padding-top: 20px;
    border-top: 1px solid #dee2e6;
    color: #6c757d;
    font-size: 12px;
  }
  
  /* 响应式设计 - 平板 */
  @media (max-width: 768px) {
    .llm-enhance-header {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }
    
    .llm-enhance-controls {
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .llm-enhance-stats {
      grid-template-columns: 1fr;
    }
    
    .llm-enhance-footer {
      flex-direction: column;
      gap: 5px;
      text-align: center;
    }
  }
  
  /* 响应式设计 - 手机 */
  @media (max-width: 480px) {
    #llm-enhance-container {
      padding: 10px;
    }
    
    .llm-enhance-header h1 {
      font-size: 20px;
    }
    
    .llm-enhance-controls button {
      padding: 6px 12px;
      font-size: 12px;
    }
    
    .stat-card p {
      font-size: 24px;
    }
  }

  /* 入口切换按钮 */
  #llm-enhance-toggle-btn {
    position: fixed;
    top: 8px;
    right: 20px;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    background: rgb(0, 0, 0);
    color: white;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s, transform 0.1s;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    line-height: 1;
  }

  #llm-enhance-toggle-btn:hover {
    background: rgb(40, 40, 40);
    transform: scale(1.05);
  }

  #llm-enhance-toggle-btn:active {
    transform: scale(0.95);
  }
`;

  // LLM-InterfaceEnhance/ui/templates/main-panel.html.ts
  function renderMainPanelHTML() {
    return `
    <div class="llm-enhance-header">
      <h1>LLM 使用情况面板</h1>
      <div class="llm-enhance-controls">
        <button id="llm-enhance-refresh">刷新数据</button>
        <button id="llm-enhance-toggle-original">显示原始界面</button>
        <button id="llm-enhance-settings">设置</button>
      </div>
    </div>
    
    <div class="llm-enhance-content">
      <div class="llm-enhance-stats">
        <div class="stat-card">
          <h3>总使用量</h3>
          <p id="total-usage">0</p>
        </div>
        <div class="stat-card">
          <h3>总费用</h3>
          <p id="total-cost">$0.00</p>
        </div>
        <div class="stat-card">
          <h3>请求数</h3>
          <p id="total-requests">0</p>
        </div>
      </div>
      
      <div class="llm-enhance-table-container">
        <table id="usage-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>模型</th>
              <th>输入Token</th>
              <th>输出Token</th>
              <th>费用</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody id="usage-table-body">
            <!-- 动态填充 -->
          </tbody>
        </table>
      </div>
      
      <div class="llm-enhance-footer">
        <p>数据最后更新: <span id="last-update">-</span></p>
        <p>拦截的请求数: <span id="intercepted-count">0</span></p>
      </div>
    </div>
  `;
  }

  // LLM-InterfaceEnhance/core/ui-manager.ts
  function injectStyles() {
    injectMainStyles();
    console.log(`${meta.name}: 样式已注入`);
  }
  function injectMainStyles() {
    removeExistingStyles("llm-enhance-styles");
    const style = document.createElement("style");
    style.id = "llm-enhance-styles";
    style.textContent = MAIN_STYLES;
    document.head.appendChild(style);
  }
  function hideOriginalInterface() {
    if (state.originalInterfaceHidden) return;
    try {
      removeExistingStyles("llm-enhance-hide-original");
      const style = document.createElement("style");
      style.id = "llm-enhance-hide-original";
      style.textContent = HIDE_ORIGINAL_STYLES;
      document.head.appendChild(style);
      state.originalInterfaceHidden = true;
      console.log(`${meta.name}: 原始界面已隐藏`);
    } catch (error) {
      console.error(`${meta.name}: 隐藏原始界面失败`, error);
    }
  }
  function createToggleButton() {
    if (document.getElementById("llm-enhance-toggle-btn")) return;
    const btn = document.createElement("div");
    btn.id = "llm-enhance-toggle-btn";
    btn.innerHTML = "📊 增强面板";
    btn.addEventListener("click", () => {
      if (state.enhancedPanelVisible) {
        hideEnhancedPanel();
      } else {
        showEnhancedPanel();
      }
    });
    document.body.appendChild(btn);
    console.log(`${meta.name}: 入口切换按钮已创建`);
  }
  function showEnhancedPanel() {
    hideOriginalInterface();
    const container = document.getElementById("llm-enhance-container");
    if (container) {
      container.style.display = "";
      state.enhancedPanelVisible = true;
      console.log(`${meta.name}: 增强面板已显示`);
    }
  }
  function hideEnhancedPanel() {
    showOriginalInterface();
    const container = document.getElementById("llm-enhance-container");
    if (container) {
      container.style.display = "none";
      state.enhancedPanelVisible = false;
      console.log(`${meta.name}: 增强面板已隐藏`);
    }
  }
  function showOriginalInterface() {
    const styleElement = document.getElementById("llm-enhance-hide-original");
    if (styleElement) {
      styleElement.remove();
      state.originalInterfaceHidden = false;
      console.log(`${meta.name}: 原始界面已显示`);
    }
  }
  function createMainContainer() {
    if (state.newInterfaceCreated) return;
    try {
      const container = document.createElement("div");
      container.id = "llm-enhance-container";
      container.innerHTML = renderMainPanelHTML();
      container.style.display = "none";
      document.body.appendChild(container);
      state.newInterfaceCreated = true;
      console.log(`${meta.name}: 新界面已创建（初始隐藏）`);
    } catch (error) {
      console.error(`${meta.name}: 创建新界面失败`, error);
    }
  }
  function removeExistingStyles(styleId) {
    const existing = document.getElementById(styleId);
    if (existing) {
      existing.remove();
    }
  }

  // LLM-InterfaceEnhance/ui/styles/modal.css.ts
  var MODAL_STYLES = `
  /* 模态框容器 */
  #llm-enhance-settings-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
  }
  
  /* 遮罩层 */
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 弹窗内容 */
  .modal-content {
    background: white;
    padding: 30px;
    border-radius: 8px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
  
  .modal-content h2 {
    margin-top: 0;
    color: #333;
  }
  
  /* 设置项组 */
  .setting-group {
    margin-bottom: 15px;
  }
  
  .setting-group label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }
  
  .setting-group input[type="number"] {
    width: 80px;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  /* 弹窗按钮组 */
  .modal-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
  }
  
  .modal-buttons button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  #save-settings {
    background: #28a745;
    color: white;
  }
  
  #cancel-settings {
    background: #6c757d;
    color: white;
  }
`;

  // LLM-InterfaceEnhance/ui/templates/settings-modal.html.ts
  function renderSettingsModalHTML() {
    return `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>设置</h2>
        <div class="setting-group">
          <label>
            <input type="checkbox" id="auto-refresh" checked> 自动刷新数据
          </label>
        </div>
        <div class="setting-group">
          <label>
            <input type="checkbox" id="show-notifications" checked> 显示通知
          </label>
        </div>
        <div class="setting-group">
          <label>
            刷新间隔（秒）:
            <input type="number" id="refresh-interval" value="30" min="5" max="300">
          </label>
        </div>
        <div class="modal-buttons">
          <button id="save-settings">保存</button>
          <button id="cancel-settings">取消</button>
        </div>
      </div>
    </div>
  `;
  }

  // LLM-InterfaceEnhance/ui/renderer.ts
  function bindEvents() {
    const refreshBtn = document.getElementById("llm-enhance-refresh");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        refreshData();
      });
    }
    const toggleBtn = document.getElementById("llm-enhance-toggle-original");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        hideEnhancedPanel();
      });
    }
    const settingsBtn = document.getElementById("llm-enhance-settings");
    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => {
        openSettings();
      });
    }
    console.log(`${meta.name}: 界面事件已绑定`);
  }
  function startRenderer(_platform) {
    updateStats();
    updateUsageTable();
    console.log(`${meta.name}: 渲染器已启动`);
  }
  function updateStats() {
    const totalTokens = state.usageData.reduce((sum, item) => sum + item.tokens, 0);
    const totalCost = state.usageData.reduce((sum, item) => sum + item.cost, 0);
    const totalRequests = state.interceptedRequests.length;
    const totalUsageEl = document.getElementById("total-usage");
    const totalCostEl = document.getElementById("total-cost");
    const totalRequestsEl = document.getElementById("total-requests");
    const lastUpdateEl = document.getElementById("last-update");
    if (totalUsageEl) totalUsageEl.textContent = totalTokens.toLocaleString();
    if (totalCostEl) totalCostEl.textContent = `$${totalCost.toFixed(2)}`;
    if (totalRequestsEl) totalRequestsEl.textContent = totalRequests.toString();
    if (lastUpdateEl) lastUpdateEl.textContent = (/* @__PURE__ */ new Date()).toLocaleString();
  }
  function updateUsageTable() {
    const tableBody = document.getElementById("usage-table-body");
    if (!tableBody) return;
    tableBody.innerHTML = "";
    const recentData = state.usageData.slice(-20).reverse();
    recentData.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${item.timestamp.toLocaleString()}</td>
      <td>${item.model}</td>
      <td>${item.inputTokens.toLocaleString()}</td>
      <td>${item.outputTokens.toLocaleString()}</td>
      <td>${item.cost.toFixed(4)}</td>
      <td>${item.status || "成功"}</td>
    `;
      tableBody.appendChild(row);
    });
  }
  function updateInterceptedCount() {
    const countEl = document.getElementById("intercepted-count");
    if (countEl) {
      countEl.textContent = state.interceptedRequests.length.toString();
    }
  }
  function refreshData() {
    console.log(`${meta.name}: 刷新数据...`);
    resetState();
    updateStats();
    updateUsageTable();
    updateInterceptedCount();
  }
  function openSettings() {
    const modal = document.createElement("div");
    modal.id = "llm-enhance-settings-modal";
    modal.innerHTML = renderSettingsModalHTML();
    const modalStyles = document.createElement("style");
    modalStyles.id = "llm-enhance-modal-styles";
    modalStyles.textContent = MODAL_STYLES;
    document.head.appendChild(modalStyles);
    document.body.appendChild(modal);
    document.getElementById("save-settings")?.addEventListener("click", () => {
      saveSettings();
      closeModal(modal, modalStyles);
    });
    document.getElementById("cancel-settings")?.addEventListener("click", () => {
      closeModal(modal, modalStyles);
    });
    const overlay = modal.querySelector(".modal-overlay");
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          closeModal(modal, modalStyles);
        }
      });
    }
  }
  function closeModal(modal, modalStyles) {
    modal.remove();
    modalStyles.remove();
  }
  function saveSettings() {
    const autoRefresh = document.getElementById("auto-refresh")?.checked;
    const showNotifications = document.getElementById("show-notifications")?.checked;
    const refreshInterval = parseInt(
      document.getElementById("refresh-interval")?.value || "30"
    );
    const settings = {
      autoRefresh,
      showNotifications,
      refreshInterval
    };
    GM_setValue("llm-enhance-settings", settings);
    console.log(`${meta.name}: 设置已保存`, settings);
  }

  // LLM-InterfaceEnhance/core/interceptor.ts
  function setupInterceptors(platform) {
    interceptXHR(platform);
    interceptFetch(platform);
    console.log(`${meta.name}: 请求拦截器已启用`);
  }
  function interceptXHR(platform) {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url, async, username, password) {
      this.__llmEnhance = {
        method,
        url: url.toString(),
        timestamp: Date.now()
      };
      return originalOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function(body) {
      const xhr = this;
      const requestInfo = xhr.__llmEnhance;
      if (requestInfo && platform.shouldIntercept(requestInfo.url, requestInfo.method)) {
        xhr.addEventListener("load", function() {
          try {
            const responseData = {
              url: requestInfo.url,
              method: requestInfo.method,
              timestamp: requestInfo.timestamp,
              response: xhr.responseText,
              status: xhr.status
            };
            state.interceptedRequests.push(responseData);
            updateInterceptedCount();
            const parsed = platform.parseResponse(responseData);
            if (parsed && parsed.length > 0) {
              state.usageData.push(...parsed);
            }
            console.log(`${meta.name}: [${platform.name}] 拦截到 XHR 请求`, requestInfo.url);
          } catch (error) {
            console.error(`${meta.name}: 处理拦截请求失败`, error);
          }
        });
      }
      return originalSend.apply(this, arguments);
    };
    console.log(`${meta.name}: XHR 拦截已启用`);
  }
  function interceptFetch(platform) {
    const originalFetch = window.fetch;
    window.fetch = async function(input, init2) {
      const startTime = Date.now();
      const url = input.toString();
      const method = init2?.method || "GET";
      if (!platform.shouldIntercept(url, method)) {
        return originalFetch.apply(this, arguments);
      }
      try {
        const response = await originalFetch.apply(this, arguments);
        const clonedResponse = response.clone();
        clonedResponse.text().then((text) => {
          const responseData = {
            url,
            method,
            timestamp: startTime,
            response: text,
            status: response.status
          };
          state.interceptedRequests.push(responseData);
          updateInterceptedCount();
          const parsed = platform.parseResponse(responseData);
          if (parsed && parsed.length > 0) {
            state.usageData.push(...parsed);
          }
          console.log(`${meta.name}: [${platform.name}] 拦截到 Fetch 请求`, url);
        });
        return response;
      } catch (error) {
        throw error;
      }
    };
    console.log(`${meta.name}: Fetch 拦截已启用`);
  }

  // LLM-InterfaceEnhance/index.ts
  async function init() {
    console.log(`${meta.name} v${meta.version} 正在初始化...`);
    const platform = detectPlatform();
    if (!platform) {
      console.warn(`${meta.name}: 未检测到支持的LLM平台`);
      return;
    }
    console.log(`${meta.name}: 检测到平台 - ${platform.name}`);
    const framework = detectUIFramework();
    console.log(`${meta.name}: 检测到UI框架 - ${framework}`);
    injectStyles();
    setupInterceptors(platform);
    if (platform.name === "DeepSeek") {
      console.log(`${meta.name}: 开始主动获取 DeepSeek 数据...`);
      fetchAllDeepSeekData().then(({ usage, cost }) => {
        if (usage.length > 0) {
          state.usageData.push(...usage);
        }
        if (cost.length > 0) {
          state.usageData.push(...cost);
        }
        console.log(`${meta.name}: 主动数据获取完成，已合并 ${usage.length + cost.length} 条记录`);
      }).catch((error) => {
        console.error(`${meta.name}: 主动数据获取失败`, error);
      });
    }
    createMainContainer();
    bindEvents();
    startRenderer(platform);
    createToggleButton();
    console.log(`${meta.name}: 初始化完成`);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
