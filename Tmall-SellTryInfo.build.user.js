// ==UserScript==
// @name         天猫千牛店铺新品试销信息自动获取
// @version      2026.03.28.22.42.31
// @description  在新品试销的商品列表页面，自动获取整页的商品图片以及分享链接文本。
// @author       DaoLuoLTS
// @match        https://qn.taobao.com/home.htm/trade-try-buy/merchList*
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
  // Tmall-SellTryInfo/helper.ts
  var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  var dataStore = {
    results: [],
    clear() {
      this.results = [];
    },
    add(item) {
      this.results.push(item);
    },
    getAll() {
      return this.results;
    }
  };

  // dev-tool/imgCopy.ts
  function getImageSource(options) {
    if (options.imgElement) {
      return options.imgElement.src;
    }
    if (options.imgUrl) {
      return options.imgUrl;
    }
    return null;
  }
  function addTimestamp(url) {
    const connector = url.includes("?") ? "&" : "?";
    return `${url}${connector}timestamp=${Date.now()}`;
  }
  async function copyImageToClipboard(options) {
    const { bypassCache = true, canvasWidth, canvasHeight, onSuccess, onError } = options;
    const source = getImageSource(options);
    if (!source) {
      const error = new Error("必须提供 imgElement 或 imgUrl 参数");
      onError?.(error);
      throw error;
    }
    const canvas = document.createElement("canvas");
    const tempImg = new Image();
    tempImg.crossOrigin = "anonymous";
    return new Promise((resolve, reject) => {
      tempImg.onload = () => {
        try {
          const targetWidth = canvasWidth || tempImg.naturalWidth;
          const targetHeight = canvasHeight || tempImg.naturalHeight;
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("无法获取 Canvas 2D 上下文");
          }
          ctx.drawImage(tempImg, 0, 0, targetWidth, targetHeight);
          canvas.toBlob(async (blob) => {
            if (!blob) {
              const error = new Error("无法创建图片 Blob");
              onError?.(error);
              reject(error);
              return;
            }
            try {
              const data = [new ClipboardItem({ "image/png": blob })];
              await navigator.clipboard.write(data);
              console.log("%c [Canvas] 复制成功！", "color: #4caf50; font-weight: bold;");
              onSuccess?.();
              resolve();
            } catch (err) {
              const error = err instanceof Error ? err : new Error("写入剪贴板失败");
              console.error("写入剪贴板失败:", error);
              onError?.(error);
              reject(error);
            }
          }, "image/png");
        } catch (err) {
          const error = err instanceof Error ? err : new Error("处理图片时发生错误");
          console.error("处理图片时发生错误:", error);
          onError?.(error);
          reject(error);
        }
      };
      tempImg.onerror = () => {
        const error = new Error("图片加载失败，请检查 CORS 策略");
        console.error(error.message);
        onError?.(error);
        reject(error);
      };
      tempImg.src = bypassCache ? addTimestamp(source) : source;
    });
  }
  async function copyImageUrlToClipboard(imgUrl, options) {
    return copyImageToClipboard({ ...options, imgUrl });
  }

  // Tmall-SellTryInfo/ui/tableCopy.ts
  async function copyTableStructure(data) {
    const rows = data.map((item) => {
      return `  <tr>
    <td><img src='${item.imgUrl}'></td>
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

  // Tmall-SellTryInfo/ui/table.ts
  function createStyles() {
    const styleId = "sell-try-info-table-styles";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
    .sell-try-info-overlay {
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

    .sell-try-info-table-container {
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

    .sell-try-info-table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
    }

    .sell-try-info-table-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .sell-try-info-table-close {
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

    .sell-try-info-table-close:hover {
      background: #f5f5f5;
      color: #333;
    }

    .sell-try-info-table-wrapper {
      overflow: auto;
      flex: 1;
    }

    .sell-try-info-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .sell-try-info-table th {
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

    .sell-try-info-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      vertical-align: middle;
    }

    .sell-try-info-table tbody tr:hover {
      background: #f9f9f9;
    }

    .sell-try-info-table .img-cell {
      width: 80px;
      text-align: center;
    }

    .sell-try-info-table .img-cell img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s;
    }

    .sell-try-info-table .img-cell img:hover {
      border-color: #1890ff;
    }

    .sell-try-info-table .text-cell {
      cursor: pointer;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: background 0.2s;
    }

    .sell-try-info-table .text-cell:hover {
      background: #e6f7ff;
    }

    .sell-try-info-table .item-name {
      font-weight: 500;
      color: #333;
    }

    .sell-try-info-table .item-id {
      color: #666;
      font-family: monospace;
    }

    .sell-try-info-table .share-text {
      color: #1890ff;
      word-break: break-all;
    }

    .sell-try-info-toast {
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
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    .sell-try-info-table-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 12px 20px;
      border-top: 1px solid #eee;
      background: #fafafa;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    .sell-try-info-table-footer-btn {
      background: #1890ff;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .sell-try-info-table-footer-btn:hover {
      background: #40a9ff;
    }

    .sell-try-info-table-footer-btn:active {
      background: #096dd9;
    }
  `;
    document.head.appendChild(style);
  }
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "sell-try-info-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2e3);
  }
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("已复制到剪贴板");
    } catch (error) {
      console.error("复制失败:", error);
      showToast("复制失败，请手动复制");
    }
  }
  function createTableContainer(data) {
    const container = document.createElement("div");
    container.className = "sell-try-info-table-container";
    const header = document.createElement("div");
    header.className = "sell-try-info-table-header";
    header.innerHTML = `
    <h3>采集结果 (${data.length} 条)</h3>
    <button class="sell-try-info-table-close" title="关闭">&times;</button>
  `;
    header.querySelector(".sell-try-info-table-close")?.addEventListener("click", () => {
      container.remove();
      const overlay = document.querySelector(".sell-try-info-overlay");
      if (overlay) {
        overlay.remove();
      }
    });
    const wrapper = document.createElement("div");
    wrapper.className = "sell-try-info-table-wrapper";
    const table = document.createElement("table");
    table.className = "sell-try-info-table";
    const thead = document.createElement("thead");
    thead.innerHTML = `
    <tr>
      <th class="img-cell">图片</th>
      <th>商品ID</th>
      <th>商品标题</th>
      <th>分享链接</th>
    </tr>
  `;
    const tbody = document.createElement("tbody");
    tbody.addEventListener("click", async (e) => {
      const target = e.target;
      if (target.tagName === "IMG") {
        const imgUrl = target.dataset.url;
        if (imgUrl) {
          try {
            await copyImageUrlToClipboard(imgUrl, {
              canvasWidth: 800,
              canvasHeight: 800,
              onSuccess: () => showToast("图片已复制到剪贴板 (800x800)"),
              onError: (error) => {
                console.error("复制图片失败:", error);
                showToast("复制图片失败，请重试");
              }
            });
          } catch (error) {
            console.error("复制图片失败:", error);
            showToast("复制图片失败，请重试");
          }
        }
        return;
      }
      const cell = target.closest(".text-cell");
      if (cell) {
        const text = cell.dataset.copy;
        if (text) {
          await copyToClipboard(text);
        }
      }
    });
    data.forEach((item) => {
      const tr = document.createElement("tr");
      const imgCell = document.createElement("td");
      imgCell.className = "img-cell";
      const img = document.createElement("img");
      img.src = item.imgUrl;
      img.alt = item.itemName;
      img.dataset.url = item.imgUrl;
      img.title = "点击复制图片链接";
      imgCell.appendChild(img);
      const idCell = document.createElement("td");
      idCell.className = "text-cell item-id";
      idCell.dataset.copy = item.itemId;
      idCell.title = "点击复制";
      idCell.textContent = item.itemId;
      const nameCell = document.createElement("td");
      nameCell.className = "text-cell item-name";
      nameCell.dataset.copy = item.itemName;
      nameCell.title = "点击复制";
      nameCell.textContent = item.itemName;
      const textCell = document.createElement("td");
      textCell.className = "text-cell share-text";
      textCell.dataset.copy = item.text;
      textCell.title = "点击复制";
      textCell.textContent = item.text;
      tr.appendChild(imgCell);
      tr.appendChild(idCell);
      tr.appendChild(nameCell);
      tr.appendChild(textCell);
      tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    wrapper.appendChild(table);
    const footer = document.createElement("div");
    footer.className = "sell-try-info-table-footer";
    const copyBtn = document.createElement("button");
    copyBtn.className = "sell-try-info-table-footer-btn";
    copyBtn.textContent = "表结构复制";
    copyBtn.addEventListener("click", async () => {
      try {
        await copyTableStructure(data);
        showToast("表结构已复制到剪贴板");
      } catch (error) {
        console.error("复制表结构失败:", error);
        showToast("复制失败，请重试");
      }
    });
    footer.appendChild(copyBtn);
    container.appendChild(header);
    container.appendChild(wrapper);
    container.appendChild(footer);
    return container;
  }
  function showResultsTable(data) {
    createStyles();
    const existingContainer = document.querySelector(".sell-try-info-table-container");
    if (existingContainer) existingContainer.remove();
    const existingOverlay = document.querySelector(".sell-try-info-overlay");
    if (existingOverlay) existingOverlay.remove();
    const overlay = document.createElement("div");
    overlay.className = "sell-try-info-overlay";
    document.body.appendChild(overlay);
    const container = createTableContainer(data);
    document.body.appendChild(container);
  }

  // Tmall-SellTryInfo/index.ts
  var DEBUG_MODE = false;
  var DEBUG_ITEM_COUNT = 2;
  var BUTTON_CLICK_DELAY = 800;
  var DRAWER_OPEN_DELAY = 1e3;
  function createOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "script-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    overlay.style.zIndex = "9999";
    overlay.style.cursor = "not-allowed";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    const content = document.createElement("div");
    content.style.textAlign = "center";
    content.style.color = "#fff";
    content.style.padding = "30px 40px";
    content.style.background = "rgba(0, 0, 0, 0.5)";
    content.style.borderRadius = "12px";
    content.style.backdropFilter = "blur(10px)";
    content.style.maxWidth = "400px";
    const title = document.createElement("div");
    title.style.fontSize = "20px";
    title.style.fontWeight = "600";
    title.style.marginBottom = "20px";
    title.textContent = "正在采集商品信息...";
    const progressContainer = document.createElement("div");
    progressContainer.style.width = "300px";
    progressContainer.style.height = "8px";
    progressContainer.style.background = "rgba(255, 255, 255, 0.2)";
    progressContainer.style.borderRadius = "4px";
    progressContainer.style.overflow = "hidden";
    progressContainer.style.marginBottom = "16px";
    const progressBar = document.createElement("div");
    progressBar.style.height = "100%";
    progressBar.style.width = "0%";
    progressBar.style.background = "linear-gradient(90deg, #1890ff, #52c41a)";
    progressBar.style.borderRadius = "4px";
    progressBar.style.transition = "width 0.3s ease";
    progressContainer.appendChild(progressBar);
    const progressText = document.createElement("div");
    progressText.style.fontSize = "14px";
    progressText.style.color = "rgba(255, 255, 255, 0.8)";
    progressText.style.marginBottom = "8px";
    progressText.textContent = "准备中...";
    const statusText = document.createElement("div");
    statusText.style.fontSize = "12px";
    statusText.style.color = "rgba(255, 255, 255, 0.6)";
    statusText.textContent = "";
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
      title.textContent = current >= total ? "采集完成!" : "正在采集商品信息...";
    };
    return { overlay, updateProgress };
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
  function extractItemInfoFromRow(tr) {
    try {
      const img = tr.querySelector("td img");
      const imgUrl = img?.src ?? "";
      const itemId = tr.getAttribute("data-row-key") ?? "";
      const itemLink = tr.querySelector("a");
      const itemName = itemLink?.innerText?.trim() ?? "";
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
  async function switchToShareTab() {
    const tabs = document.querySelectorAll("div.tbd-tabs-nav-wrap div[data-node-key='item']");
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
    const drawerDivs = document.querySelectorAll(
      "div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body > div"
    );
    if (drawerDivs.length === 0) {
      console.warn("未找到抽屉弹窗内容");
      return false;
    }
    const lastDiv = drawerDivs[drawerDivs.length - 1];
    const generateButton = lastDiv.querySelector("button");
    return await safeClickButton(generateButton, BUTTON_CLICK_DELAY);
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
  async function closeDrawer() {
    const buttonList = document.querySelectorAll(
      "div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body > div > button"
    );
    if (buttonList.length < 2) {
      console.warn("未找到足够的关闭按钮");
      return false;
    }
    return await safeClickButton(buttonList[1], BUTTON_CLICK_DELAY);
  }
  async function processItemRow(tr) {
    const itemInfo = extractItemInfoFromRow(tr);
    if (!itemInfo) {
      console.warn("跳过无效商品行");
      return false;
    }
    const actionButton = getActionButtonFromRow(tr);
    if (!await safeClickButton(actionButton, DRAWER_OPEN_DELAY)) {
      console.warn("无法打开商品详情抽屉，跳过此项");
      return false;
    }
    if (!await switchToShareTab()) {
      console.warn("切换分享 tab 失败，尝试继续处理");
    }
    if (!await clickGenerateTokenButton()) {
      console.warn("生成口令失败，尝试继续处理");
    }
    itemInfo.text = await readFromClipboard();
    if (!itemInfo.text) {
      console.warn("采集到的分享链接为空，但仍记录数据");
    }
    dataStore.add(itemInfo);
    console.log(`已采集商品：${itemInfo.itemId} - ${itemInfo.itemName}`);
    if (!await closeDrawer()) {
      console.warn("关闭抽屉失败，可能影响后续操作");
    }
    return true;
  }
  function getTableRows() {
    const tbody = document.querySelector("table > tbody");
    if (!tbody) {
      throw new Error("未找到表格数据 (table > tbody)");
    }
    const trs = Array.from(tbody.querySelectorAll("tr[data-row-key]"));
    if (trs.length === 0) {
      throw new Error("未找到有效的商品行数据");
    }
    if (DEBUG_MODE) {
      console.warn(`当前处于 DEBUG 模式，仅处理前 ${DEBUG_ITEM_COUNT} 条数据`);
      return trs.slice(0, DEBUG_ITEM_COUNT);
    }
    return trs;
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
        alert("请授予剪切板访问权限以继续执行脚本");
        return false;
      }
    }
  }
  async function handleGetInfo() {
    const { overlay, updateProgress } = createOverlay();
    try {
      updateProgress(0, 0, "正在请求剪切板权限...");
      if (!await ensureClipboardPermission()) return;
      let tableRows;
      try {
        updateProgress(0, 0, "正在获取表格数据...");
        tableRows = getTableRows();
      } catch (error) {
        console.error("获取表格数据失败:", error);
        alert(error instanceof Error ? error.message : "获取表格数据失败");
        return;
      }
      dataStore.clear();
      let successCount = 0;
      const total = tableRows.length;
      for (let i = 0; i < tableRows.length; i++) {
        const tr = tableRows[i];
        updateProgress(i, total, `正在处理第 ${i + 1} 个商品...`);
        try {
          const success = await processItemRow(tr);
          if (success) {
            successCount++;
          }
          updateProgress(i + 1, total, `已处理: ${tr.getAttribute("data-row-key") || "未知商品"}`);
        } catch (error) {
          console.error(`处理商品行时发生错误:`, error, tr);
        }
      }
      const allResults = dataStore.getAll();
      console.log(`采集完成，成功 ${successCount}/${tableRows.length} 条`);
      console.log("获取到的所有信息：", allResults);
      if (allResults.length === 0) {
        alert("未采集到任何数据，请查看控制台日志。");
      } else {
        showResultsTable(allResults);
      }
    } catch (error) {
      console.error("执行过程中发生未捕获错误:", error);
      alert("执行过程中发生错误，详情请查看控制台。");
    } finally {
      overlay.remove();
    }
  }
  async function initScript() {
    console.log("天猫千牛店铺新品试销信息自动获取脚本初始化中...");
    if (document.readyState !== "complete") {
      await new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
    }
    const inputs = await new Promise((resolve) => {
      const check = () => {
        const el = document.querySelectorAll("form > div input");
        if (el.length === 2) {
          resolve(el);
        } else {
          setTimeout(check, 500);
        }
      };
      check();
    });
    if (inputs.length !== 2) {
      console.error("未找到预期的两个输入框");
      return;
    }
    const form = inputs[0].closest("form");
    if (!form) {
      console.error("未找到 form 标签");
      return;
    }
    const divs = form.querySelectorAll(":scope > div");
    if (divs.length < 2) {
      console.error("form 下的 div 数量不足 2 个");
      return;
    }
    const targetDiv = divs[1];
    const button = document.createElement("button");
    button.className = "tbd-btn css-fd478t css-var-rb tbd-btn-primary tbd-btn-color-primary tbd-btn-variant-solid tbd-btn-lg";
    button.innerText = "获取本页信息";
    button.style.marginRight = "10px";
    button.type = "button";
    targetDiv.insertBefore(button, targetDiv.firstChild);
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      await handleGetInfo();
    });
    console.log("脚本初始化完成，按钮已添加");
  }
  function main() {
    console.log("天猫千牛店铺新品试销信息自动获取脚本已启动");
    initScript().then(() => {
    });
  }
  main();
})();
