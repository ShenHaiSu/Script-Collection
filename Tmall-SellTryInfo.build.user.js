// ==UserScript==
// @name         天猫千牛店铺新品试销信息自动获取
// @version      2026.04.08.20.15.12
// @description  在新品试销的商品列表页面，自动获取整页的商品图片以及分享链接文本。
// @author       DaoLuoLTS
// @match        https://qn.taobao.com/home.htm/trade-try-buy/merchList*
// @match        https://myseller.taobao.com/home.htm/trade-try-buy/merchList*
// @namespace    https://github.com/ShenHaiSu/Script-Collection
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tmall.com
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// @noframes     
// @supportURL   https://github.com/ShenHaiSu/Script-Collection/issues
// ==/UserScript==

"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // Tmall-SellTryInfo/config.ts
  var DEBUG_MODE, DEBUG_ITEM_COUNT, BUTTON_CLICK_DELAY, DRAWER_OPEN_DELAY, SELECTORS, CSS_PREFIX, MESSAGES;
  var init_config = __esm({
    "Tmall-SellTryInfo/config.ts"() {
      "use strict";
      DEBUG_MODE = false;
      DEBUG_ITEM_COUNT = 2;
      BUTTON_CLICK_DELAY = 800;
      DRAWER_OPEN_DELAY = 1e3;
      SELECTORS = {
        // 表格相关
        tableBody: "table > tbody",
        tableRow: "tr[data-row-key]",
        tableRowKey: "data-row-key",
        // 商品信息
        itemImage: "td img",
        itemLink: "a",
        itemId: "data-row-key",
        // 操作按钮
        actionButton: "td:last-child button",
        // Tab 切换
        shareTab: "div.tbd-tabs-nav-wrap div[data-node-key='item']",
        // 抽屉弹窗
        drawerContent: "div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body > div",
        drawerButtons: "div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body > div > button",
        // 表单相关
        formInput: "form > div input",
        formDiv: "form > div"
      };
      CSS_PREFIX = "sell-try-info";
      MESSAGES = {
        // 遮罩层
        scraping: "正在采集商品信息...",
        completed: "采集完成!",
        preparing: "准备中...",
        // 进度
        requestingPermission: "正在请求剪切板权限...",
        gettingTableData: "正在获取表格数据...",
        processingItem: (index) => `正在处理第 ${index} 个商品...`,
        processedItem: (id) => `已处理: ${id}`,
        // 错误
        noPermission: "请授予剪切板访问权限以继续执行脚本",
        noTableData: "未找到表格数据 (table > tbody)",
        noValidRows: "未找到有效的商品行数据",
        noInputFields: "未找到预期的两个输入框",
        noForm: "未找到 form 标签",
        noEnoughDivs: "form 下的 div 数量不足 2 个",
        // 完成
        noData: "未采集到任何数据，请查看控制台日志。",
        completedWithCount: (success, total) => `采集完成，成功 ${success}/${total} 条`,
        error: "执行过程中发生错误，详情请查看控制台。",
        // 初始化
        initializing: "天猫千牛店铺新品试销信息自动获取脚本初始化中...",
        initialized: "脚本初始化完成，按钮已添加",
        started: "天猫千牛店铺新品试销信息自动获取脚本已启动"
      };
    }
  });

  // Tmall-SellTryInfo/utils.ts
  function createDataStore() {
    const results = [];
    return {
      get results() {
        return results;
      },
      clear() {
        results.length = 0;
      },
      add(item) {
        results.push(item);
      },
      getAll() {
        return [...results];
      },
      getByIndex(index) {
        return results[index];
      },
      removeByIndex(index) {
        if (index >= 0 && index < results.length) {
          results.splice(index, 1);
          return true;
        }
        return false;
      },
      findIndex(text) {
        if (!text || results.length === 0) return -1;
        for (let i = results.length - 1; i >= 0; i--) {
          if (results[i].text === text) return i;
        }
        return -1;
      }
    };
  }
  function trim(str) {
    return str?.trim() ?? "";
  }
  var sleep, dataStore;
  var init_utils = __esm({
    "Tmall-SellTryInfo/utils.ts"() {
      "use strict";
      sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      dataStore = createDataStore();
    }
  });

  // Tmall-SellTryInfo/dom.ts
  var dom_exports = {};
  __export(dom_exports, {
    addButtonClickHandler: () => addButtonClickHandler,
    clickGenerateTokenButton: () => clickGenerateTokenButton,
    closeDrawer: () => closeDrawer,
    createButton: () => createButton,
    createOverlay: () => createOverlay,
    ensureClipboardPermission: () => ensureClipboardPermission,
    extractItemInfoFromRow: () => extractItemInfoFromRow,
    getActionButtonFromRow: () => getActionButtonFromRow,
    getFormInputs: () => getFormInputs,
    getTableRowDataList: () => getTableRowDataList,
    getTableRows: () => getTableRows,
    getTargetDiv: () => getTargetDiv,
    insertButton: () => insertButton,
    readFromClipboard: () => readFromClipboard,
    removeOverlay: () => removeOverlay,
    safeClickButton: () => safeClickButton,
    switchToShareTab: () => switchToShareTab,
    waitForDrawerOpen: () => waitForDrawerOpen,
    waitForInputs: () => waitForInputs,
    waitForPageLoad: () => waitForPageLoad,
    writeToClipboard: () => writeToClipboard
  });
  function createOverlay() {
    const overlay = document.createElement("div");
    overlay.id = `${CSS_PREFIX}-overlay`;
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      zIndex: "9999",
      cursor: "not-allowed",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    });
    const content = document.createElement("div");
    Object.assign(content.style, {
      textAlign: "center",
      color: "#fff",
      padding: "30px 40px",
      background: "rgba(0, 0, 0, 0.5)",
      borderRadius: "12px",
      backdropFilter: "blur(10px)",
      maxWidth: "400px"
    });
    const title = document.createElement("div");
    Object.assign(title.style, {
      fontSize: "20px",
      fontWeight: "600",
      marginBottom: "20px"
    });
    title.textContent = MESSAGES.scraping;
    const progressContainer = document.createElement("div");
    Object.assign(progressContainer.style, {
      width: "300px",
      height: "8px",
      background: "rgba(255, 255, 255, 0.2)",
      borderRadius: "4px",
      overflow: "hidden",
      marginBottom: "16px"
    });
    const progressBar = document.createElement("div");
    Object.assign(progressBar.style, {
      height: "100%",
      width: "0%",
      background: "linear-gradient(90deg, #1890ff, #52c41a)",
      borderRadius: "4px",
      transition: "width 0.3s ease"
    });
    progressContainer.appendChild(progressBar);
    const progressText = document.createElement("div");
    Object.assign(progressText.style, {
      fontSize: "14px",
      color: "rgba(255, 255, 255, 0.8)",
      marginBottom: "8px"
    });
    progressText.textContent = MESSAGES.preparing;
    const statusText = document.createElement("div");
    Object.assign(statusText.style, {
      fontSize: "12px",
      color: "rgba(255, 255, 255, 0.6)"
    });
    content.appendChild(title);
    content.appendChild(progressContainer);
    content.appendChild(progressText);
    content.appendChild(statusText);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    const updateProgress = (current, total, message) => {
      const percentage = total > 0 ? Math.round(current / total * 100) : 0;
      progressBar.style.width = `${percentage}%`;
      progressText.textContent = `${current} / ${total} (${percentage}%)`;
      statusText.textContent = message;
      title.textContent = current >= total ? MESSAGES.completed : MESSAGES.scraping;
    };
    return { element: overlay, updateProgress };
  }
  function removeOverlay(overlay) {
    overlay.remove();
  }
  async function safeClickButton(button, delay = BUTTON_CLICK_DELAY) {
    if (!button) {
      console.warn("按钮元素不存在，跳过点击操作");
      return false;
    }
    try {
      button.click();
      await sleep(delay);
      return true;
    } catch (error) {
      console.error("点击按钮失败:", error);
      return false;
    }
  }
  function createButton(text, className, style) {
    const button = document.createElement("button");
    button.innerText = text;
    button.type = "button";
    if (className) button.className = className;
    if (style) Object.assign(button.style, style);
    return button;
  }
  function addButtonClickHandler(button, handler) {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      await handler(e);
    });
  }
  function extractItemInfoFromRow(tr) {
    try {
      const img = tr.querySelector(SELECTORS.itemImage);
      const imgUrl = img?.src ?? "";
      const itemId = tr.getAttribute(SELECTORS.tableRowKey) ?? "";
      const itemLink = tr.querySelector(SELECTORS.itemLink);
      const itemName = trim(itemLink?.innerText);
      if (!itemId) {
        console.warn("商品行缺少 data-row-key 属性", tr);
        return null;
      }
      return { imgUrl, text: "", itemId, itemName };
    } catch (error) {
      console.error("提取商品信息失败:", error);
      return null;
    }
  }
  function getActionButtonFromRow(tr) {
    const tds = tr.querySelectorAll("td");
    if (tds.length === 0) return null;
    const lastTd = tds[tds.length - 1];
    return lastTd?.querySelector("button") ?? null;
  }
  function getTableRows() {
    const tbody = document.querySelector(SELECTORS.tableBody);
    if (!tbody) {
      throw new Error(MESSAGES.noTableData);
    }
    const trs = Array.from(tbody.querySelectorAll(SELECTORS.tableRow));
    if (trs.length === 0) {
      throw new Error(MESSAGES.noValidRows);
    }
    return trs;
  }
  function getTableRowDataList() {
    const rows = getTableRows();
    return rows.map((tr) => {
      const info = extractItemInfoFromRow(tr);
      if (!info) return null;
      return {
        element: tr,
        itemId: info.itemId,
        itemName: info.itemName,
        imgUrl: info.imgUrl
      };
    }).filter((row) => row !== null);
  }
  async function switchToShareTab() {
    const tabs = document.querySelectorAll(SELECTORS.shareTab);
    if (tabs.length === 0) {
      console.warn("未找到分享 tab 元素");
      return false;
    }
    try {
      tabs[0].click();
      await sleep(BUTTON_CLICK_DELAY);
      return true;
    } catch (error) {
      console.error("切换分享 tab 失败:", error);
      return false;
    }
  }
  async function clickGenerateTokenButton() {
    const drawerDivs = document.querySelectorAll(SELECTORS.drawerContent);
    if (drawerDivs.length === 0) {
      console.warn("未找到抽屉弹窗内容");
      return false;
    }
    const lastDiv = drawerDivs[drawerDivs.length - 1];
    const generateButton = lastDiv.querySelector("button");
    return await safeClickButton(generateButton, BUTTON_CLICK_DELAY);
  }
  async function closeDrawer() {
    const buttonList = document.querySelectorAll(SELECTORS.drawerButtons);
    if (buttonList.length < 2) {
      console.warn("未找到足够的关闭按钮");
      return false;
    }
    return await safeClickButton(buttonList[1], BUTTON_CLICK_DELAY);
  }
  async function waitForDrawerOpen(timeout = DRAWER_OPEN_DELAY) {
    await sleep(timeout);
  }
  async function readFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      console.log("剪切板内容:", text);
      return text || "";
    } catch (error) {
      console.error("读取剪切板失败:", error);
      return "";
    }
  }
  async function writeToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("写入剪切板失败:", error);
      return false;
    }
  }
  async function ensureClipboardPermission() {
    try {
      await navigator.clipboard.readText();
      return true;
    } catch (err) {
      console.log("正在请求剪切板权限...", err);
      try {
        await navigator.clipboard.readText();
        return true;
      } catch {
        console.error("剪切板权限被拒绝");
        alert(MESSAGES.noPermission);
        return false;
      }
    }
  }
  function getFormInputs() {
    return document.querySelectorAll(SELECTORS.formInput);
  }
  function getTargetDiv() {
    const inputs = getFormInputs();
    if (inputs.length !== 2) {
      console.error(MESSAGES.noInputFields);
      return null;
    }
    const form = inputs[0].closest("form");
    if (!form) {
      console.error(MESSAGES.noForm);
      return null;
    }
    const divs = form.querySelectorAll(`:scope > div`);
    if (divs.length < 2) {
      console.error(MESSAGES.noEnoughDivs);
      return null;
    }
    return divs[1];
  }
  function insertButton(button, targetDiv) {
    targetDiv.insertBefore(button, targetDiv.firstChild);
  }
  async function waitForPageLoad() {
    if (document.readyState !== "complete") {
      await new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
    }
  }
  async function waitForInputs(expectedCount = 2) {
    return new Promise((resolve) => {
      const check = () => {
        const el = getFormInputs();
        if (el.length === expectedCount) {
          resolve(el);
        } else {
          setTimeout(check, 500);
        }
      };
      check();
    });
  }
  var init_dom = __esm({
    "Tmall-SellTryInfo/dom.ts"() {
      "use strict";
      init_config();
      init_utils();
    }
  });

  // Tmall-SellTryInfo/index.ts
  init_config();
  init_utils();
  init_dom();

  // Tmall-SellTryInfo/ui/components.ts
  init_config();
  function createStyles() {
    const styleId = `${CSS_PREFIX}-table-styles`;
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
    .${CSS_PREFIX}-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 9999;
    }

    .${CSS_PREFIX}-table-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      max-width: 90vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .${CSS_PREFIX}-table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
    }

    .${CSS_PREFIX}-table-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .${CSS_PREFIX}-table-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }

    .${CSS_PREFIX}-table-close:hover {
      background: #f5f5f5;
      color: #333;
    }

    .${CSS_PREFIX}-table-wrapper {
      overflow: auto;
      flex: 1;
    }

    .${CSS_PREFIX}-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .${CSS_PREFIX}-table th {
      background: #f8f8f8;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #e0e0e0;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .${CSS_PREFIX}-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      vertical-align: middle;
    }

    .${CSS_PREFIX}-table tbody tr:hover {
      background: #f9f9f9;
    }

    .${CSS_PREFIX}-table .img-cell {
      width: 80px;
      text-align: center;
    }

    .${CSS_PREFIX}-table .img-cell img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s;
    }

    .${CSS_PREFIX}-table .img-cell img:hover {
      border-color: #1890ff;
    }

    .${CSS_PREFIX}-table .text-cell {
      cursor: pointer;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: background 0.2s;
    }

    .${CSS_PREFIX}-table .text-cell:hover {
      background: #e6f7ff;
    }

    .${CSS_PREFIX}-table .item-name {
      font-weight: 500;
      color: #333;
    }

    .${CSS_PREFIX}-table .item-id {
      color: #666;
      font-family: monospace;
    }

    .${CSS_PREFIX}-table .share-text {
      color: #1890ff;
      word-break: break-all;
    }

    .${CSS_PREFIX}-toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.75);
      color: #fff;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 10001;
      animation: ${CSS_PREFIX}-fadeIn 0.3s;
    }

    @keyframes ${CSS_PREFIX}-fadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    .${CSS_PREFIX}-table-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 12px 20px;
      border-top: 1px solid #eee;
      background: #fafafa;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    .${CSS_PREFIX}-table-footer-btn {
      background: #1890ff;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .${CSS_PREFIX}-table-footer-btn:hover {
      background: #40a9ff;
    }

    .${CSS_PREFIX}-table-footer-btn + .${CSS_PREFIX}-table-footer-btn {
      margin-left: 10px;
    }
  `;
    document.head.appendChild(style);
  }
  async function copyImageToClipboard(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 800;
          canvas.height = 800;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("无法获取canvas上下文"));
            return;
          }
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 800, 800);
          canvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error("无法创建图片blob"));
              return;
            }
            try {
              await navigator.clipboard.write([
                new ClipboardItem({
                  [blob.type]: blob
                })
              ]);
              showToast("图片已复制到剪贴板");
              resolve();
            } catch (e) {
              reject(e);
            }
          }, "image/png");
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => {
        reject(new Error("图片加载失败"));
      };
      img.src = imageUrl;
    });
  }
  function showResultsTable(data) {
    createStyles();
    const overlay = document.createElement("div");
    overlay.className = `${CSS_PREFIX}-overlay`;
    overlay.id = `${CSS_PREFIX}-results-overlay`;
    const container = document.createElement("div");
    container.className = `${CSS_PREFIX}-table-container`;
    container.id = `${CSS_PREFIX}-results-container`;
    const header = document.createElement("div");
    header.className = `${CSS_PREFIX}-table-header`;
    const title = document.createElement("h3");
    title.textContent = `采集结果 (${data.length} 条)`;
    const closeBtn = document.createElement("button");
    closeBtn.className = `${CSS_PREFIX}-table-close`;
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => {
      overlay.remove();
      container.remove();
    };
    header.appendChild(title);
    header.appendChild(closeBtn);
    const wrapper = document.createElement("div");
    wrapper.className = `${CSS_PREFIX}-table-wrapper`;
    const table = document.createElement("table");
    table.className = `${CSS_PREFIX}-table`;
    const thead = document.createElement("thead");
    thead.innerHTML = `
    <tr>
      <th class="img-cell">图片</th>
      <th>商品ID</th>
      <th>商品标题</th>
      <th>分享链接</th>
    </tr>
  `;
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    tbody.dataset.cssPrefix = CSS_PREFIX;
    const dataMap = /* @__PURE__ */ new Map();
    data.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.dataset.index = String(index);
      dataMap.set(index, item);
      const imgTd = document.createElement("td");
      imgTd.className = "img-cell";
      imgTd.dataset.type = "image";
      const img = document.createElement("img");
      img.src = item.imgUrl;
      img.alt = item.itemName;
      img.title = "点击复制图片到剪贴板";
      imgTd.appendChild(img);
      tr.appendChild(imgTd);
      const idTd = document.createElement("td");
      idTd.className = "text-cell item-id";
      idTd.textContent = item.itemId;
      idTd.title = "点击复制商品ID";
      idTd.dataset.type = "item-id";
      tr.appendChild(idTd);
      const titleTd = document.createElement("td");
      titleTd.className = "text-cell item-name";
      titleTd.textContent = item.itemName;
      titleTd.title = "点击复制商品标题";
      titleTd.dataset.type = "item-name";
      tr.appendChild(titleTd);
      const textTd = document.createElement("td");
      textTd.className = "text-cell share-text";
      textTd.textContent = item.text;
      textTd.title = "点击复制分享链接";
      textTd.dataset.type = "share-text";
      tr.appendChild(textTd);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tbody.addEventListener("click", async (event) => {
      const target = event.target;
      const td = target.closest("td");
      if (!td) return;
      const tr = td.closest("tr");
      if (!tr) return;
      const index = parseInt(tr.dataset.index || "-1", 10);
      const item = dataMap.get(index);
      if (!item) return;
      const type = td.dataset.type;
      try {
        if (type === "image") {
          await copyImageToClipboard(item.imgUrl);
        } else if (type === "item-id") {
          await navigator.clipboard.writeText(item.itemId);
          showToast("商品ID已复制到剪贴板");
        } else if (type === "item-name") {
          await navigator.clipboard.writeText(item.itemName);
          showToast("商品标题已复制到剪贴板");
        } else if (type === "share-text") {
          await navigator.clipboard.writeText(item.text);
          showToast("分享链接已复制到剪贴板");
        }
      } catch (e) {
        console.error("复制失败:", e);
        showToast("复制失败，请重试");
      }
    });
    wrapper.appendChild(table);
    const footer = document.createElement("div");
    footer.className = `${CSS_PREFIX}-table-footer`;
    const copyWithSeparatorBtn = document.createElement("button");
    copyWithSeparatorBtn.className = `${CSS_PREFIX}-table-footer-btn`;
    copyWithSeparatorBtn.textContent = "复制表格HTML(带分隔)";
    copyWithSeparatorBtn.onclick = async () => {
      try {
        await copyTableStructureWithSeparator(data);
        showToast("带分隔的表格HTML已复制到剪贴板");
      } catch (e) {
        console.error("复制失败:", e);
        showToast("复制失败，请重试");
      }
    };
    const copyBtn = document.createElement("button");
    copyBtn.className = `${CSS_PREFIX}-table-footer-btn`;
    copyBtn.textContent = "复制表格HTML";
    copyBtn.onclick = async () => {
      try {
        await copyTableStructure(data);
        showToast("表格HTML已复制到剪贴板");
      } catch (e) {
        console.error("复制失败:", e);
        showToast("复制失败，请重试");
      }
    };
    const exportBtn = document.createElement("button");
    exportBtn.className = `${CSS_PREFIX}-table-footer-btn`;
    exportBtn.textContent = "导出JSON";
    exportBtn.onclick = () => {
      const json = JSON.stringify(data, null, 2);
      navigator.clipboard.writeText(json).then(() => {
        showToast("JSON已复制到剪贴板");
      });
    };
    footer.appendChild(copyWithSeparatorBtn);
    footer.appendChild(copyBtn);
    footer.appendChild(exportBtn);
    container.appendChild(header);
    container.appendChild(wrapper);
    container.appendChild(footer);
    document.body.appendChild(overlay);
    document.body.appendChild(container);
    overlay.onclick = () => {
      overlay.remove();
      container.remove();
    };
  }
  async function copyTableStructure(data) {
    const rows = data.map((item) => {
      return `  <tr>
    <td><img src='${item.imgUrl}' width='200' height='200'></td>
    <td><span>${item.text}</span></td>
  </tr>`;
    }).join("\n");
    const tableHtml = `<table>
${rows}
</table>`;
    try {
      await navigator.clipboard.writeText(tableHtml);
    } catch (error) {
      console.error("复制失败:", error);
      throw error;
    }
  }
  async function copyTableStructureWithSeparator(data) {
    const rows = [];
    data.forEach((item, index) => {
      rows.push(`  <tr>
    <td><img src='${item.imgUrl}' width='200' height='200'></td>
    <td><span>${item.text}</span></td>
  </tr>`);
      if ((index + 1) % 3 === 0 && index < data.length - 1) {
        rows.push(`  <tr>
    <td></td>
    <td></td>
  </tr>`);
      }
    });
    const tableHtml = `<table>
${rows.join("\n")}
</table>`;
    try {
      await navigator.clipboard.writeText(tableHtml);
    } catch (error) {
      console.error("复制失败:", error);
      throw error;
    }
  }
  var toastTimer = null;
  function showToast(config) {
    if (toastTimer) {
      clearTimeout(toastTimer);
      const existingToast = document.querySelector(`.${CSS_PREFIX}-toast`);
      if (existingToast) {
        existingToast.remove();
      }
    }
    const message = typeof config === "string" ? config : config.message;
    const duration = (typeof config === "string" ? 3e3 : config.duration) ?? 3e3;
    const position = (typeof config === "string" ? "bottom" : config.position) ?? "bottom";
    const toast = document.createElement("div");
    toast.className = `${CSS_PREFIX}-toast`;
    toast.textContent = message;
    if (position === "top") {
      toast.style.top = "20px";
      toast.style.bottom = "auto";
      toast.style.transform = "translateX(-50%)";
    } else if (position === "center") {
      toast.style.top = "50%";
      toast.style.bottom = "auto";
      toast.style.transform = "translate(-50%, -50%)";
    }
    document.body.appendChild(toast);
    toastTimer = setTimeout(() => {
      toast.remove();
      toastTimer = null;
    }, duration);
  }

  // Tmall-SellTryInfo/actions/index.ts
  init_utils();
  init_config();
  var ActionRegistryImpl = class {
    constructor() {
      __publicField(this, "actions", /* @__PURE__ */ new Map());
      __publicField(this, "priorities", /* @__PURE__ */ new Map());
    }
    register(action) {
      if (this.actions.has(action.id)) {
        console.warn(`动作 ${action.id} 已存在，将被覆盖`);
      }
      this.actions.set(action.id, action);
      console.log(`动作已注册: ${action.id} - ${action.name}`);
    }
    unregister(id) {
      return this.actions.delete(id);
    }
    get(id) {
      return this.actions.get(id);
    }
    getAll() {
      return Array.from(this.actions.values());
    }
    getByPriority() {
      return this.getAll().sort((a, b) => {
        const priorityA = this.priorities.get(a.id) ?? 100;
        const priorityB = this.priorities.get(b.id) ?? 100;
        return priorityA - priorityB;
      });
    }
    /**
     * 设置动作优先级
     * @param id 动作ID
     * @param priority 优先级（数字越小越靠前）
     */
    setPriority(id, priority) {
      this.priorities.set(id, priority);
    }
  };
  var actionRegistry = new ActionRegistryImpl();
  var BaseAction = class {
    constructor(config) {
      __publicField(this, "description");
      __publicField(this, "icon");
      __publicField(this, "priority", 100);
      if (config) {
        this.description = config.description;
        this.icon = config.icon;
        if (config.priority !== void 0) {
          this.priority = config.priority;
          setTimeout(() => {
            actionRegistry.setPriority(this.id, config.priority);
          }, 0);
        }
      }
    }
    canExecute(context) {
      return true;
    }
    /**
     * 获取动作配置
     */
    getConfig() {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        priority: this.priority
      };
    }
  };
  var ScrapeShareTextAction = class extends BaseAction {
    constructor() {
      super({ id: "scrape-share-text", name: "获取本页信息", priority: 10 });
      __publicField(this, "id", "scrape-share-text");
      __publicField(this, "name", "获取本页信息");
      __publicField(this, "description", "采集商品图片和分享链接文本");
      __publicField(this, "icon", "📋");
    }
    async execute(context) {
      const { row, rowIndex, results, dataStore: dataStore3, updateProgress } = context;
      const { extractItemInfoFromRow: extractItemInfoFromRow2, getActionButtonFromRow: getActionButtonFromRow2, safeClickButton: safeClickButton2, switchToShareTab: switchToShareTab2, clickGenerateTokenButton: clickGenerateTokenButton2, readFromClipboard: readFromClipboard2, closeDrawer: closeDrawer2, waitForDrawerOpen: waitForDrawerOpen2 } = await Promise.resolve().then(() => (init_dom(), dom_exports));
      const itemInfo = extractItemInfoFromRow2(row);
      if (!itemInfo) {
        console.warn("跳过无效商品行");
        return false;
      }
      const actionButton = getActionButtonFromRow2(row);
      if (!await safeClickButton2(actionButton, 1e3)) {
        console.warn("无法打开商品详情抽屉，跳过此项");
        return false;
      }
      if (!await switchToShareTab2()) {
        console.warn("切换分享 tab 失败，尝试继续处理");
      }
      if (!await clickGenerateTokenButton2()) {
        console.warn("生成口令失败，尝试继续处理");
      }
      itemInfo.text = await readFromClipboard2();
      if (!itemInfo.text) console.warn("采集到的分享链接为空，但仍记录数据");
      const duplicateIndex = dataStore3.findIndex(itemInfo.text);
      if (duplicateIndex !== -1) {
        const errorMsg = `检测到重复分享链接！当前第 ${rowIndex + 1} 个TR的分享链接与第 ${duplicateIndex + 1} 个TR的分享链接重复。`;
        console.error(errorMsg);
        await closeDrawer2();
        throw new Error(`解析失效：在第 ${rowIndex + 1} 个TR发生解析失效问题`);
      }
      dataStore3.add(itemInfo);
      console.log(`已采集商品：${itemInfo.itemId} - ${itemInfo.itemName}`);
      if (!await closeDrawer2()) console.warn("关闭抽屉失败，可能影响后续操作");
      return true;
    }
  };
  var ButtonManager = class {
    constructor() {
      __publicField(this, "buttons", /* @__PURE__ */ new Map());
      __publicField(this, "container", null);
    }
    /**
     * 初始化按钮管理器
     * @param container 按钮容器元素
     */
    init(container) {
      this.container = container;
    }
    /**
     * 注册按钮
     * @param config 按钮配置
     */
    registerButton(config) {
      if (this.buttons.has(config.id)) {
        this.removeButton(config.id);
      }
      const button = document.createElement("button");
      button.id = config.id;
      button.innerText = config.text;
      button.type = "button";
      if (config.className) {
        button.className = config.className;
      }
      if (config.style) {
        Object.assign(button.style, config.style);
      }
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        await config.onClick(e);
      });
      this.buttons.set(config.id, button);
      if (this.container) {
        this.addToContainer(button, config.order);
      }
      return button;
    }
    /**
     * 移除按钮
     * @param id 按钮ID
     */
    removeButton(id) {
      const button = this.buttons.get(id);
      if (button) {
        button.remove();
        this.buttons.delete(id);
        return true;
      }
      return false;
    }
    /**
     * 获取按钮
     * @param id 按钮ID
     */
    getButton(id) {
      return this.buttons.get(id);
    }
    /**
     * 显示按钮
     * @param id 按钮ID
     */
    showButton(id) {
      const button = this.buttons.get(id);
      if (button) {
        button.style.display = "";
      }
    }
    /**
     * 隐藏按钮
     * @param id 按钮ID
     */
    hideButton(id) {
      const button = this.buttons.get(id);
      if (button) {
        button.style.display = "none";
      }
    }
    /**
     * 将按钮添加到容器
     * @param button 按钮元素
     * @param order 排序顺序
     */
    addToContainer(button, order) {
      if (!this.container) return;
      const existingButtons = Array.from(this.container.children);
      if (order === void 0 || existingButtons.length === 0) {
        this.container.appendChild(button);
        return;
      }
      let inserted = false;
      for (let i = 0; i < existingButtons.length; i++) {
        const existingButton = existingButtons[i];
        const existingOrder = this.getButtonOrder(existingButton);
        if (order < existingOrder) {
          this.container.insertBefore(button, existingButton);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        this.container.appendChild(button);
      }
    }
    /**
     * 获取按钮的排序顺序
     */
    getButtonOrder(button) {
      const id = button.id;
      const config = this.buttons.get(id);
      const order = config?.style?.order;
      return order !== void 0 ? typeof order === "number" ? order : parseInt(order, 10) || 100 : 100;
    }
  };
  var buttonManager = new ButtonManager();
  function initActions() {
    actionRegistry.register(new ScrapeShareTextAction());
    console.log("动作系统初始化完成");
  }
  function createButtonConfig(id, text, onClick, order = 100) {
    return {
      id,
      text,
      className: "tbd-btn css-fd478t css-var-rb tbd-btn-primary tbd-btn-color-primary tbd-btn-variant-solid tbd-btn-lg",
      style: {
        marginRight: "10px"
      },
      onClick,
      order
    };
  }

  // Tmall-SellTryInfo/index.ts
  async function handleGetInfo() {
    const { element: overlay, updateProgress } = createOverlay();
    const store = createDataStore();
    try {
      updateProgress(0, 0, MESSAGES.requestingPermission);
      if (!await ensureClipboardPermission()) return;
      let tableRows;
      try {
        updateProgress(0, 0, MESSAGES.gettingTableData);
        tableRows = getTableRows();
      } catch (error) {
        console.error("获取表格数据失败:", error);
        alert(error instanceof Error ? error.message : "获取表格数据失败");
        return;
      }
      store.clear();
      let successCount = 0;
      const total = tableRows.length;
      const processedRows = DEBUG_MODE ? tableRows.slice(0, DEBUG_ITEM_COUNT) : tableRows;
      if (DEBUG_MODE) {
        console.warn(`当前处于 DEBUG 模式，仅处理前 ${DEBUG_ITEM_COUNT} 条数据`);
      }
      for (let i = 0; i < processedRows.length; i++) {
        const tr = processedRows[i];
        updateProgress(i, total, MESSAGES.processingItem(i + 1));
        try {
          const itemInfo = extractItemInfoFromRow(tr);
          if (!itemInfo) {
            console.warn("跳过无效商品行");
            continue;
          }
          const actionButton = getActionButtonFromRow(tr);
          if (!await safeClickButton(actionButton, 1e3)) {
            console.warn("无法打开商品详情抽屉，跳过此项");
            continue;
          }
          if (!await switchToShareTab()) {
            console.warn("切换分享 tab 失败，尝试继续处理");
          }
          if (!await clickGenerateTokenButton()) {
            console.warn("生成口令失败，尝试继续处理");
          }
          itemInfo.text = await readFromClipboard();
          if (!itemInfo.text) console.warn("采集到的分享链接为空，但仍记录数据");
          const duplicateIndex = store.findIndex(itemInfo.text);
          if (duplicateIndex !== -1) {
            const errorMsg = `检测到重复分享链接！当前第 ${i + 1} 个TR的分享链接与第 ${duplicateIndex + 1} 个TR的分享链接重复。`;
            console.error(errorMsg);
            await closeDrawer();
            const failData = {
              失败位置: `第 ${i + 1} 个TR`,
              重试次数: 1,
              商品ID: itemInfo.itemId,
              商品名称: itemInfo.itemName,
              分享链接: itemInfo.text,
              重复链接位置: `第 ${duplicateIndex + 1} 个TR`
            };
            console.error("解析失效数据:", failData);
            alert(`解析失效：在第 ${i + 1} 个TR发生解析失效问题，已重试 1 次仍存在重复。

详细数据：
${JSON.stringify(failData, null, 2)}`);
            throw new Error(`解析失效：在第 ${i + 1} 个TR发生解析失效问题`);
          }
          store.add(itemInfo);
          console.log(`已采集商品：${itemInfo.itemId} - ${itemInfo.itemName}`);
          successCount++;
          updateProgress(i + 1, total, MESSAGES.processedItem(tr.getAttribute("data-row-key") || "未知商品"));
          if (!await closeDrawer()) console.warn("关闭抽屉失败，可能影响后续操作");
        } catch (error) {
          console.error(`处理商品行时发生错误:`, error, tr);
          return;
        }
      }
      const allResults = store.getAll();
      console.log(MESSAGES.completedWithCount(successCount, processedRows.length));
      console.log("获取到的所有信息：", allResults);
      if (allResults.length === 0) {
        alert(MESSAGES.noData);
      } else {
        showResultsTable(allResults);
      }
    } catch (error) {
      console.error("执行过程中发生未捕获错误:", error);
      alert(MESSAGES.error);
    } finally {
      removeOverlay(overlay);
    }
  }
  async function initScript() {
    console.log(MESSAGES.initializing);
    initActions();
    await waitForPageLoad();
    const inputs = await waitForInputs(2);
    if (inputs.length !== 2) {
      console.error(MESSAGES.noInputFields);
      return;
    }
    const targetDiv = getTargetDiv();
    if (!targetDiv) {
      console.error("无法获取目标容器");
      return;
    }
    buttonManager.init(targetDiv);
    buttonManager.registerButton(
      createButtonConfig(
        "btn-get-info",
        "获取本页信息",
        async () => {
          await handleGetInfo();
        },
        10
        // 优先级，数字越小越靠前
      )
    );
    console.log(MESSAGES.initialized);
  }
  function main() {
    console.log(MESSAGES.started);
    initScript().then(() => {
    });
  }
  main();
})();
