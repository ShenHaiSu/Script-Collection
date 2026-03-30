// ==UserScript==
// @name         天猫后台订单信息增强
// @version      2026.03.30.19.04.12
// @description  增强千牛天猫后台的已卖出宝贝的订单信息，展示更多实用性的信息内容。
// @author       DaoLuoLTS
// @match        https://myseller.taobao.com/home.htm/trade-platform/tp/sold*
// @match        https://qn.taobao.com/home.htm/trade-platform/tp/sold*
// @namespace    https://github.com/ShenHaiSu/Script-Collection
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tmall.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_fetch
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @noframes     
// @supportURL   https://github.com/ShenHaiSu/Script-Collection/issues
// ==/UserScript==

"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // Tmall-OrderEnhance/ui/styles.ts
  var STYLES = {
    /**
     * 浮动触发按钮样式
     */
    FLOATING_BTN: `
    position: fixed;
    right: 20px;
    bottom: 80px;
    width: 56px;
    height: 56px;
    background: #ff5000;
    color: white;
    border-radius: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(255, 80, 0, 0.4);
    z-index: 99998;
    font-size: 24px;
    transition: transform 0.2s, background 0.2s;
  `,
    /**
     * Drawer 遮罩层样式
     */
    DRAWER_MASK: `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99999;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s;
  `,
    /**
     * Drawer 遮罩层显示状态
     */
    DRAWER_MASK_VISIBLE: `
    opacity: 1;
    visibility: visible;
  `,
    /**
     * Drawer 容器样式
     */
    DRAWER_CONTAINER: `
    position: fixed;
    top: 0;
    right: 0;
    width: 320px;
    height: 100%;
    background: #fff;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    z-index: 100000;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  `,
    /**
     * Drawer 容器显示状态
     */
    DRAWER_CONTAINER_VISIBLE: `
    transform: translateX(0);
  `,
    /**
     * Drawer 头部样式
     */
    DRAWER_HEADER: `
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
  `,
    /**
     * Drawer 标题样式
     */
    DRAWER_TITLE: `
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0;
  `,
    /**
     * Drawer 关闭按钮样式
     */
    DRAWER_CLOSE_BTN: `
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 20px;
    color: #999;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    transition: background 0.2s;
  `,
    /**
     * Drawer 内容区域样式
     */
    DRAWER_CONTENT: `
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  `,
    /**
     * 交互按钮组容器样式
     */
    ACTION_BUTTONS_CONTAINER: `
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
    /**
     * 交互按钮样式
     */
    ACTION_BUTTON: `
    width: 100%;
    padding: 12px 16px;
    background: #fff7f2;
    border: 1px solid #ffdec7;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    text-align: left;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
  `,
    /**
     * 交互按钮 hover 状态样式
     */
    ACTION_BUTTON_HOVER: `
    background: #ff5000;
    border-color: #ff5000;
    color: #fff;
  `,
    /**
     * 交互按钮图标样式
     */
    ACTION_BUTTON_ICON: `
    font-size: 18px;
    width: 24px;
    text-align: center;
  `,
    /**
     * 交互按钮文字样式
     */
    ACTION_BUTTON_TEXT: `
    flex: 1;
  `
  };

  // Tmall-OrderEnhance/ui/floatingButton.ts
  function createFloatingTrigger(onToggle) {
    const btn = document.createElement("div");
    btn.id = "tmall-order-enhance-floating-btn";
    btn.innerHTML = "📋";
    btn.title = "订单增强工具";
    btn.style.cssText = STYLES.FLOATING_BTN;
    btn.onmouseenter = () => {
      btn.style.transform = "scale(1.1)";
      btn.style.background = "#ff6a00";
    };
    btn.onmouseleave = () => {
      btn.style.transform = "scale(1)";
      btn.style.background = "#ff5000";
    };
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onToggle();
    };
    document.body.appendChild(btn);
    console.log("浮动触发按钮已挂载");
    return btn;
  }

  // Tmall-OrderEnhance/ui/drawer.ts
  var DrawerManager = class {
    constructor() {
      __publicField(this, "state", {
        isOpen: false,
        maskElement: null,
        containerElement: null,
        actionButtons: []
      });
    }
    /**
     * 初始化 Drawer 组件
     * @param actionButtons 交互按钮配置列表
     */
    init(actionButtons) {
      this.state.actionButtons = actionButtons;
      this.createElements();
      console.log("Drawer 组件已初始化");
    }
    /**
     * 创建 Drawer 相关的 DOM 元素
     */
    createElements() {
      this.state.maskElement = document.createElement("div");
      this.state.maskElement.id = "tmall-order-enhance-drawer-mask";
      this.state.maskElement.style.cssText = STYLES.DRAWER_MASK;
      this.state.maskElement.onclick = () => this.close();
      this.state.containerElement = document.createElement("div");
      this.state.containerElement.id = "tmall-order-enhance-drawer";
      this.state.containerElement.style.cssText = STYLES.DRAWER_CONTAINER;
      this.state.containerElement.innerHTML = this.buildDrawerContent();
      document.body.appendChild(this.state.maskElement);
      document.body.appendChild(this.state.containerElement);
      this.bindButtonEvents();
    }
    /**
     * 构建 Drawer 的 HTML 内容
     */
    buildDrawerContent() {
      const buttonsHtml = this.state.actionButtons.map(
        (btn) => `
        <button
          class="tmall-order-enhance-action-btn"
          data-action-id="${btn.id}"
          style="${STYLES.ACTION_BUTTON}"
        >
          <span class="tmall-order-enhance-action-btn-icon" style="${STYLES.ACTION_BUTTON_ICON}">${btn.icon}</span>
          <span class="tmall-order-enhance-action-btn-text" style="${STYLES.ACTION_BUTTON_TEXT}">${btn.label}</span>
        </button>
      `
      ).join("");
      return `
      <div style="${STYLES.DRAWER_HEADER}">
        <h3 style="${STYLES.DRAWER_TITLE}">订单增强工具</h3>
        <button id="tmall-order-enhance-drawer-close" style="${STYLES.DRAWER_CLOSE_BTN}">✕</button>
      </div>
      <div style="${STYLES.DRAWER_CONTENT}">
        <div style="${STYLES.ACTION_BUTTONS_CONTAINER}">
          ${buttonsHtml}
        </div>
      </div>
    `;
    }
    /**
     * 绑定按钮事件
     */
    bindButtonEvents() {
      const closeBtn = document.getElementById("tmall-order-enhance-drawer-close");
      if (closeBtn) {
        closeBtn.onclick = () => this.close();
      }
      const actionButtons = document.querySelectorAll(".tmall-order-enhance-action-btn");
      actionButtons.forEach((btn) => {
        btn.onmouseenter = () => {
          btn.style.cssText = STYLES.ACTION_BUTTON + STYLES.ACTION_BUTTON_HOVER;
        };
        btn.onmouseleave = () => {
          btn.style.cssText = STYLES.ACTION_BUTTON;
        };
        btn.onclick = () => {
          const actionId = btn.getAttribute("data-action-id");
          const actionConfig = this.state.actionButtons.find((b) => b.id === actionId);
          if (actionConfig) {
            actionConfig.onClick();
          }
        };
      });
    }
    /**
     * 打开 Drawer
     */
    open() {
      if (!this.state.maskElement || !this.state.containerElement) {
        console.error("Drawer 组件未初始化");
        return;
      }
      this.state.isOpen = true;
      this.state.maskElement.style.cssText = STYLES.DRAWER_MASK + STYLES.DRAWER_MASK_VISIBLE;
      this.state.containerElement.style.cssText = STYLES.DRAWER_CONTAINER + STYLES.DRAWER_CONTAINER_VISIBLE;
      console.log("Drawer 已打开");
    }
    /**
     * 关闭 Drawer
     */
    close() {
      if (!this.state.maskElement || !this.state.containerElement) {
        console.error("Drawer 组件未初始化");
        return;
      }
      this.state.isOpen = false;
      this.state.maskElement.style.cssText = STYLES.DRAWER_MASK;
      this.state.containerElement.style.cssText = STYLES.DRAWER_CONTAINER;
      console.log("Drawer 已关闭");
    }
    /**
     * 切换 Drawer 状态
     */
    toggle() {
      if (this.state.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
    /**
     * 获取当前状态
     */
    isOpened() {
      return this.state.isOpen;
    }
    /**
     * 销毁 Drawer 组件
     */
    destroy() {
      if (this.state.maskElement) {
        this.state.maskElement.remove();
        this.state.maskElement = null;
      }
      if (this.state.containerElement) {
        this.state.containerElement.remove();
        this.state.containerElement = null;
      }
      this.state.isOpen = false;
      console.log("Drawer 组件已销毁");
    }
  };
  var drawerManager = new DrawerManager();

  // Tmall-OrderEnhance/ui/itemCodeDisplay.ts
  var ITEM_CODE_STYLES = {
    CONTAINER: `
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    padding: 6px 8px;
    background: #f5f5f5;
    border-radius: 4px;
    font-size: 12px;
  `,
    // 当没有商家编码时使用的inline-block样式
    CONTAINER_INLINE: `
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-left: 8px;
    padding: 2px 6px;
    background: #f5f5f5;
    border-radius: 3px;
    font-size: 12px;
    vertical-align: middle;
  `,
    LABEL: `
    color: #666;
    white-space: nowrap;
  `,
    VALUE: `
    color: #333;
    font-weight: 500;
    font-family: monospace;
  `,
    COPY_BTN: `
    padding: 2px 8px;
    background: #ff5000;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
    transition: background 0.2s;
  `,
    COPY_BTN_HOVER: `
    background: #ff6a00;
  `,
    COPY_SUCCESS: `
    background: #52c41a;
  `
  };
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand("copy");
      document.body.removeChild(textArea);
      return result;
    } catch (error) {
      console.error("复制到剪贴板失败:", error);
      return false;
    }
  }
  function createItemCodeDisplay(itemCodeInfo) {
    const { itemId, trElement } = itemCodeInfo;
    const container = document.createElement("div");
    container.className = "tmall-order-enhance-item-code";
    const label = document.createElement("span");
    label.className = "tmall-order-enhance-item-code-label";
    label.style.cssText = ITEM_CODE_STYLES.LABEL;
    label.textContent = "商品编码:";
    const value = document.createElement("span");
    value.className = "tmall-order-enhance-item-code-value";
    value.style.cssText = ITEM_CODE_STYLES.VALUE;
    value.textContent = String(itemId);
    const copyBtn = document.createElement("button");
    copyBtn.className = "tmall-order-enhance-item-code-copy-btn";
    copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN;
    copyBtn.textContent = "复制";
    copyBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const textToCopy = String(itemId);
      const success = await copyToClipboard(textToCopy);
      if (success) {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "已复制";
        copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN + ITEM_CODE_STYLES.COPY_SUCCESS;
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN;
        }, 2e3);
      } else {
        copyBtn.textContent = "复制失败";
        setTimeout(() => {
          copyBtn.textContent = "复制";
        }, 2e3);
      }
    };
    copyBtn.onmouseenter = () => {
      if (copyBtn.textContent === "复制") {
        copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN + ITEM_CODE_STYLES.COPY_BTN_HOVER;
      }
    };
    copyBtn.onmouseleave = () => {
      if (copyBtn.textContent === "复制") {
        copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN;
      }
    };
    container.appendChild(label);
    container.appendChild(value);
    container.appendChild(copyBtn);
    const firstTd = trElement.querySelector("td");
    if (firstTd) {
      const wrapper = firstTd.querySelector(":scope > div");
      if (wrapper) {
        const productContainer = wrapper.querySelector(":scope > div");
        if (productContainer) {
          const sellerCodeElement = Array.from(productContainer.querySelectorAll("div")).find(
            (div) => div.textContent && div.textContent.includes("商家编码：")
          );
          if (sellerCodeElement) {
            container.style.cssText = ITEM_CODE_STYLES.CONTAINER;
            sellerCodeElement.appendChild(container);
          } else {
            container.style.cssText = ITEM_CODE_STYLES.CONTAINER_INLINE;
            const lastDiv = productContainer.querySelector(":scope > div:last-child");
            if (lastDiv) {
              lastDiv.parentNode?.insertBefore(container, lastDiv.nextSibling);
            } else {
              productContainer.lastChild?.appendChild(container);
            }
          }
        } else {
          container.style.cssText = ITEM_CODE_STYLES.CONTAINER_INLINE;
          wrapper.appendChild(container);
        }
      } else {
        container.style.cssText = ITEM_CODE_STYLES.CONTAINER_INLINE;
        firstTd.appendChild(container);
      }
    } else {
      container.style.cssText = ITEM_CODE_STYLES.CONTAINER_INLINE;
      trElement.appendChild(container);
    }
    console.log(`商品编码展示已添加到子订单 (商品编码: ${itemId})`);
    return container;
  }
  function removeAllItemCodeDisplays() {
    const displays = document.querySelectorAll(".tmall-order-enhance-item-code");
    displays.forEach((display) => {
      display.remove();
    });
    console.log("已移除所有商品编码展示");
  }

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

  // Tmall-OrderEnhance/action/getItemId.ts
  function parseItemSnapshotHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const scripts = doc.querySelectorAll("body script");
    for (const script of scripts) {
      const scriptContent = script.textContent;
      if (scriptContent) {
        const jsonParseMatch = scriptContent.match(/JSON\.parse\s*\(\s*(['"`])([\s\S]*?)\1\s*\)/);
        if (jsonParseMatch && jsonParseMatch[2]) {
          try {
            const jsonStr = jsonParseMatch[2].replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, "\\");
            return JSON.parse(jsonStr);
          } catch (e) {
            console.error("解析JSON失败:", e);
            try {
              return JSON.parse(scriptContent);
            } catch (e2) {
              console.error("直接解析script内容也失败:", e2);
            }
          }
        }
      }
    }
    const jsonObjectMatch = html.match(/\{[\s\S]*"itemId"[\s\S]*\}/);
    if (jsonObjectMatch) {
      try {
        return JSON.parse(jsonObjectMatch[0]);
      } catch (e) {
        console.error("从HTML中提取JSON对象失败:", e);
      }
    }
    return null;
  }
  function getItemUrlFromTr(tr) {
    const img = tr.querySelector("td > div > div > a > img");
    if (!img) return null;
    const anchor = img.parentElement;
    if (!anchor || anchor.tagName !== "A") return null;
    const href = anchor.getAttribute("href");
    return href;
  }
  function collectOrderItems() {
    const tables = document.querySelectorAll("div.next-table.next-table-medium div.next-table-body > table");
    const orderItems = [];
    tables.forEach((table, parentIndex) => {
      const tbody = table.querySelector("tbody");
      if (!tbody) {
        console.warn(`父订单 ${parentIndex + 1} 没有tbody`);
        return;
      }
      const rows = tbody.querySelectorAll("tr");
      for (let i = 1; i < rows.length; i++) {
        const tr = rows[i];
        const itemUrl = getItemUrlFromTr(tr);
        if (itemUrl) {
          orderItems.push({
            itemUrl,
            parentOrderIndex: parentIndex,
            itemIndex: i - 1,
            // 子订单索引从0开始
            trElement: tr
          });
        }
      }
    });
    return orderItems;
  }
  async function fetchItemSnapshot(itemUrl) {
    try {
      const response = await gmFetch(itemUrl, {
        method: "GET",
        headers: {
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "User-Agent": navigator.userAgent
        }
      });
      if (!response.ok) {
        console.error(`请求失败: ${response.status} ${response.statusText}`);
        return null;
      }
      const jsonData = parseItemSnapshotHtml(response.responseText);
      return jsonData;
    } catch (error) {
      console.error("获取商品快照失败:", error);
      return null;
    }
  }
  function extractItemId(snapshotData) {
    if (!snapshotData) return null;
    try {
      const itemId = snapshotData?.baseSnapDO?.itemSnapDO?.itemId;
      if (itemId !== void 0 && itemId !== null) {
        return itemId;
      }
    } catch (e) {
      console.error("提取商品编码失败:", e);
    }
    return null;
  }
  async function handleGetItemId() {
    console.log("执行获取商品 ID 逻辑...");
    const tableBody = document.querySelector("div.next-table.next-table-medium div.next-table-body");
    if (!tableBody) {
      console.warn("未找到订单表格容器 div.next-table.next-table-medium div.next-table-body");
      alert("未找到订单表格容器，请确保在订单列表页面");
      return;
    }
    const childNodesLength = tableBody.childNodes.length;
    console.log("表格内容子节点数量:", childNodesLength);
    if (childNodesLength === 1) {
      const firstChild = tableBody.childNodes[0];
      const innerText = firstChild.textContent?.trim() ?? "";
      const emptyMessage = "没有符合条件的宝贝，请尝试其他搜索条件。";
      if (innerText === emptyMessage) {
        console.log("当前展示订单的位置下没有任何订单展示，无需进行后续操作");
        alert("当前页面没有订单数据");
        return;
      }
    }
    console.log("订单信息列表中有结果，准备执行获取商品 ID 逻辑");
    const orderItems = collectOrderItems();
    console.log(`共找到 ${orderItems.length} 个子订单商品`);
    if (orderItems.length === 0) {
      console.warn("未找到任何子订单商品信息");
      alert("未找到子订单商品信息");
      return;
    }
    removeAllItemCodeDisplays();
    console.log("开始获取商品快照数据...");
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      console.log(`
--- 处理第 ${i + 1} 个商品 (父订单${item.parentOrderIndex + 1}, 子订单${item.itemIndex + 1}) ---`);
      console.log("商品URL:", item.itemUrl);
      const snapshotData = await fetchItemSnapshot(item.itemUrl);
      if (snapshotData) {
        console.log("商品快照数据:", snapshotData);
        const itemId = extractItemId(snapshotData);
        if (itemId !== null) {
          console.log("商品编码 (itemId):", itemId);
          createItemCodeDisplay({
            itemId,
            parentOrderIndex: item.parentOrderIndex,
            itemIndex: item.itemIndex,
            trElement: item.trElement
          });
        } else {
          console.warn("未能从快照数据中提取到商品编码");
        }
      } else {
        console.warn("未能获取到商品快照数据");
      }
    }
    console.log("\n获取商品 ID 逻辑执行完成");
  }

  // Tmall-OrderEnhance/actions.ts
  var ACTION_BUTTONS = [
    {
      id: "get-item-id",
      label: "获取商品id",
      icon: "🔗",
      onClick: handleGetItemId
    }
    // 后续可以在这里添加更多按钮配置
    // {
    //   id: "get-order-id",
    //   label: "获取订单ID",
    //   icon: "📋",
    //   onClick: handleGetOrderId,
    // },
  ];

  // Tmall-OrderEnhance/index.ts
  function main() {
    console.log("天猫后台订单信息增强脚本已启动");
    initScript();
  }
  function initScript() {
    console.log("天猫后台订单信息增强脚本初始化中...");
    const checkInterval = setInterval(() => {
      const isPageReady = document.body !== null;
      if (isPageReady) {
        clearInterval(checkInterval);
        console.log("页面已加载完成，开始初始化 UI");
        initUI();
      }
    }, 500);
  }
  function initUI() {
    const existingFloatingBtn = document.getElementById("tmall-order-enhance-floating-btn");
    if (existingFloatingBtn) {
      console.log("UI 元素已存在，不再重复挂载");
      return;
    }
    drawerManager.init(ACTION_BUTTONS);
    createFloatingTrigger(() => {
      drawerManager.toggle();
    });
    console.log("UI 组件初始化完成");
  }
  main();
})();
