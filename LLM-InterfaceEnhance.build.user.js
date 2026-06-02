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

  // LLM-InterfaceEnhance/index.ts
  var state = {
    isActive: false,
    platform: null,
    interceptedRequests: [],
    usageData: [],
    originalInterfaceHidden: false,
    newInterfaceCreated: false
  };
  var platformConfigs = [
    {
      name: "DeepSeek",
      matchPatterns: ["https://platform.deepseek.com/usage*"],
      selectors: {
        mainContainer: "body",
        usageTable: "table, .usage-table, [data-usage-table]"
      }
    }
    // 后续可添加更多平台配置
    // {
    //   name: "OpenAI",
    //   matchPatterns: ["https://platform.openai.com/usage*"],
    //   selectors: {
    //     mainContainer: "body",
    //     usageTable: ".usage-table",
    //   },
    // },
  ];
  function detectPlatform() {
    const currentUrl = window.location.href;
    for (const config of platformConfigs) {
      for (const pattern of config.matchPatterns) {
        const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
        if (regex.test(currentUrl)) {
          return config;
        }
      }
    }
    return null;
  }
  function detectUIFramework() {
    const isReact = !!document.querySelector('[data-reactroot], [data-reactroot=""]') || Object.keys(document.body).some((k) => k.startsWith("__react"));
    if (isReact) return "react";
    if (window.__VUE__) return "vue3";
    if (window.Vue) return "vue2";
    if (window.ng) return "angular";
    if (window.jQuery) return "jquery";
    return "unknown";
  }
  function hideOriginalInterface() {
    if (state.originalInterfaceHidden) return;
    try {
      const style = document.createElement("style");
      style.id = "llm-enhance-hide-original";
      style.textContent = `
      /* 隐藏原始界面，但保留我们的新界面 */
      body > *:not(#llm-enhance-container):not(#llm-enhance-styles) {
        display: none !important;
      }
      
      /* 确保新界面可见 */
      #llm-enhance-container {
        display: block !important;
        visibility: visible !important;
      }
    `;
      document.head.appendChild(style);
      state.originalInterfaceHidden = true;
      console.log(`${meta.name}: 原始界面已隐藏`);
    } catch (error) {
      console.error(`${meta.name}: 隐藏原始界面失败`, error);
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
  function createNewInterface() {
    if (state.newInterfaceCreated) return;
    try {
      const container = document.createElement("div");
      container.id = "llm-enhance-container";
      container.innerHTML = `
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
      const styles = document.createElement("style");
      styles.id = "llm-enhance-styles";
      styles.textContent = `
      #llm-enhance-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background: #f5f5f5;
        min-height: 100vh;
      }
      
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
      
      .llm-enhance-content {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
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
      
      .llm-enhance-footer {
        display: flex;
        justify-content: space-between;
        padding-top: 20px;
        border-top: 1px solid #dee2e6;
        color: #6c757d;
        font-size: 12px;
      }
      
      /* 响应式设计 */
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
    `;
      document.head.appendChild(styles);
      document.body.appendChild(container);
      bindInterfaceEvents();
      state.newInterfaceCreated = true;
      console.log(`${meta.name}: 新界面已创建`);
    } catch (error) {
      console.error(`${meta.name}: 创建新界面失败`, error);
    }
  }
  function bindInterfaceEvents() {
    const refreshBtn = document.getElementById("llm-enhance-refresh");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        refreshData();
      });
    }
    const toggleBtn = document.getElementById("llm-enhance-toggle-original");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        if (state.originalInterfaceHidden) {
          showOriginalInterface();
          toggleBtn.textContent = "隐藏原始界面";
        } else {
          hideOriginalInterface();
          toggleBtn.textContent = "显示原始界面";
        }
      });
    }
    const settingsBtn = document.getElementById("llm-enhance-settings");
    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => {
        openSettings();
      });
    }
  }
  function interceptXHR() {
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url, async, username, password) {
      this.__llmEnhance = {
        method,
        url: url.toString(),
        timestamp: Date.now()
      };
      return originalXHROpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function(body) {
      const xhr = this;
      const requestInfo = xhr.__llmEnhance;
      if (requestInfo) {
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
            parseUsageData(responseData);
            console.log(`${meta.name}: 拦截到请求`, requestInfo.url);
          } catch (error) {
            console.error(`${meta.name}: 处理拦截请求失败`, error);
          }
        });
      }
      return originalXHRSend.apply(this, arguments);
    };
    console.log(`${meta.name}: XHR拦截已启用`);
  }
  function interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async function(input, init2) {
      const startTime = Date.now();
      const url = input.toString();
      try {
        const response = await originalFetch.apply(this, arguments);
        const clonedResponse = response.clone();
        clonedResponse.text().then((text) => {
          const responseData = {
            url,
            method: init2?.method || "GET",
            timestamp: startTime,
            response: text,
            status: response.status
          };
          state.interceptedRequests.push(responseData);
          updateInterceptedCount();
          parseUsageData(responseData);
          console.log(`${meta.name}: 拦截到Fetch请求`, url);
        });
        return response;
      } catch (error) {
        throw error;
      }
    };
    console.log(`${meta.name}: Fetch拦截已启用`);
  }
  function parseUsageData(responseData) {
    try {
      let data;
      try {
        data = JSON.parse(responseData.response);
      } catch {
        data = parseHTMLUsageData(responseData.response);
      }
      if (data) {
        const usageData = extractUsageFromResponse(data, responseData.url);
        if (usageData) {
          state.usageData.push(...usageData);
          updateStats();
          updateUsageTable();
        }
      }
    } catch (error) {
      console.error(`${meta.name}: 解析使用数据失败`, error);
    }
  }
  function parseHTMLUsageData(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const table = doc.querySelector(
      state.platform?.selectors.usageTable || "table"
    );
    if (!table) return null;
    const rows = table.querySelectorAll("tr");
    const usageData = [];
    rows.forEach((row, index) => {
      if (index === 0) return;
      const cells = row.querySelectorAll("td");
      if (cells.length >= 4) {
        usageData.push({
          timestamp: cells[0]?.textContent?.trim(),
          model: cells[1]?.textContent?.trim(),
          inputTokens: parseInt(cells[2]?.textContent?.trim() || "0"),
          outputTokens: parseInt(cells[3]?.textContent?.trim() || "0"),
          cost: parseFloat(cells[4]?.textContent?.trim()?.replace("$", "") || "0"),
          status: cells[5]?.textContent?.trim()
        });
      }
    });
    return usageData.length > 0 ? usageData : null;
  }
  function extractUsageFromResponse(data, url) {
    if (url.includes("/usage") || url.includes("/statistics")) {
      if (data.data && Array.isArray(data.data)) {
        return data.data.map((item) => ({
          timestamp: new Date(item.timestamp || item.created_at),
          model: item.model || item.model_name,
          tokens: (item.input_tokens || 0) + (item.output_tokens || 0),
          cost: item.cost || item.total_cost || 0
        }));
      }
      if (data.usage && Array.isArray(data.usage)) {
        return data.usage.map((item) => ({
          timestamp: new Date(item.date || item.timestamp),
          model: item.model,
          tokens: item.total_tokens,
          cost: item.cost
        }));
      }
    }
    return null;
  }
  function updateStats() {
    const totalUsage = state.usageData.reduce((sum, item) => sum + item.tokens, 0);
    const totalCost = state.usageData.reduce((sum, item) => sum + item.cost, 0);
    const totalRequests = state.interceptedRequests.length;
    const totalUsageEl = document.getElementById("total-usage");
    const totalCostEl = document.getElementById("total-cost");
    const totalRequestsEl = document.getElementById("total-requests");
    const lastUpdateEl = document.getElementById("last-update");
    if (totalUsageEl) totalUsageEl.textContent = totalUsage.toLocaleString();
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
      <td>${item.tokens.toLocaleString()}</td>
      <td>${item.cost.toFixed(4)}</td>
      <td>成功</td>
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
    state.usageData = [];
    state.interceptedRequests = [];
    updateStats();
    updateUsageTable();
    updateInterceptedCount();
  }
  function openSettings() {
    const modal = document.createElement("div");
    modal.id = "llm-enhance-settings-modal";
    modal.innerHTML = `
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
    const modalStyles = document.createElement("style");
    modalStyles.textContent = `
    #llm-enhance-settings-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
    }
    
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
    document.head.appendChild(modalStyles);
    document.body.appendChild(modal);
    document.getElementById("save-settings")?.addEventListener("click", () => {
      saveSettings();
      modal.remove();
      modalStyles.remove();
    });
    document.getElementById("cancel-settings")?.addEventListener("click", () => {
      modal.remove();
      modalStyles.remove();
    });
  }
  function saveSettings() {
    const autoRefresh = document.getElementById("auto-refresh")?.checked;
    const showNotifications = document.getElementById("show-notifications")?.checked;
    const refreshInterval = parseInt(
      document.getElementById("refresh-interval")?.value || "30"
    );
    GM_setValue("llm-enhance-settings", {
      autoRefresh,
      showNotifications,
      refreshInterval
    });
    console.log(`${meta.name}: 设置已保存`);
  }
  async function init() {
    console.log(`${meta.name} v${meta.version} 正在初始化...`);
    state.platform = detectPlatform();
    if (!state.platform) {
      console.warn(`${meta.name}: 未检测到支持的LLM平台`);
      return;
    }
    console.log(`${meta.name}: 检测到平台 - ${state.platform.name}`);
    const framework = detectUIFramework();
    console.log(`${meta.name}: 检测到UI框架 - ${framework}`);
    interceptXHR();
    interceptFetch();
    hideOriginalInterface();
    createNewInterface();
    state.isActive = true;
    console.log(`${meta.name}: 初始化完成`);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
