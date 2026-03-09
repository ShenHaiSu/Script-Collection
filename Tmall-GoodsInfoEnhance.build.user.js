// ==UserScript==
// @name         淘宝/天猫商品信息增强插件 (GoodsInfoEnhance)
// @version      2026.03.09.22.00.45
// @description  淘宝/天猫商品详情页信息获取增强：复制商品ID、复制所有颜色名称、复制所有尺码名称等。
// @author       DaoLuoLTS
// @match        https://item.taobao.com/item.htm*
// @match        https://detail.tmall.com/item.htm*
// @match        https://detail.tmall.hk/item.htm*
// @namespace    https://github.com/ShenHaiSu/Script-Collection
// @icon         https://www.google.com/s2/favicons?sz=64&domain=taobao.com
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @noframes     
// @supportURL   https://github.com/ShenHaiSu/Script-Collection/issues
// ==/UserScript==

"use strict";
(() => {
  // Tmall-GoodsInfoEnhance/helper.ts
  var SELECTORS = {
    // SKU 属性组容器
    SKU_GROUPS: [
      ".sku-prop",
      // 淘宝
      ".tm-sku-prop",
      // 天猫
      ".sku-item-wrapper"
      // 其他变体
    ],
    // SKU 标题标签
    SKU_TITLE: ".sku-title, .tm-label",
    // SKU 项容器 (li 或 div)
    SKU_ITEM: "li, .sku-item",
    // SKU 项名称文本元素
    SKU_ITEM_NAME: ".sku-item-name, .sku-item-text, span, a",
    // 注入的复制按钮类名
    ENHANCED_BTN_CLASS: "copy-btn-enhanced",
    // 覆盖层容器类名
    OVERLAY_CONTAINER_CLASS: "goods-info-overlay-container",
    // 浮动触发按钮类名
    FLOATING_TRIGGER_CLASS: "goods-info-floating-trigger"
  };
  var store = {
    isUIInitialized: false
    // 可以根据需要扩展更多状态
  };
  function copyToClipboard(text) {
    if (typeof GM_setClipboard !== "undefined") {
      GM_setClipboard(text, "text");
      console.log(`[Tmall-GoodsInfoEnhance] 已复制: ${text}`);
    } else {
      navigator.clipboard.writeText(text).then(() => {
        console.log(`[Tmall-GoodsInfoEnhance] 已复制: ${text}`);
      });
    }
  }
  function parseProductId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }
  function getSkuPropGroup(labelText) {
    const tmallMainDivs = Array.from(document.querySelectorAll("div#skuOptionsArea > div"));
    for (const div of tmallMainDivs) {
      const titleContainer = div.children[0];
      if (titleContainer) {
        const spans = Array.from(titleContainer.querySelectorAll("span"));
        const match = spans.find((s) => s.innerText.trim().includes(labelText));
        if (match) {
          return div;
        }
      }
    }
    for (const selector of SELECTORS.SKU_GROUPS) {
      const groups = document.querySelectorAll(selector);
      for (const group of Array.from(groups)) {
        const title = group.querySelector(SELECTORS.SKU_TITLE)?.textContent || "";
        if (title.includes(labelText)) {
          return group;
        }
      }
    }
    return null;
  }
  function getSkuItems(labelText) {
    const group = getSkuPropGroup(labelText);
    if (!group) return [];
    if (group.parentElement?.id === "skuOptionsArea") {
      const itemsContainer = group.children[1];
      if (itemsContainer) {
        const allSpans = Array.from(itemsContainer.querySelectorAll("span"));
        const names = allSpans.map((span) => span.innerText.trim()).filter((text) => text.length > 0);
        return Array.from(new Set(names));
      }
    }
    const items = Array.from(group.querySelectorAll(SELECTORS.SKU_ITEM_NAME)).map((el) => el.textContent?.trim()).filter((text) => !!text && text.length > 0);
    return Array.from(new Set(items));
  }
  function copySkuByLabel(labelText) {
    const items = getSkuItems(labelText);
    if (items.length > 0) {
      copyToClipboard(items.join("\n"));
    } else {
      console.warn(`[Tmall-GoodsInfoEnhance] 未找到 ${labelText} 属性`);
    }
  }

  // Tmall-GoodsInfoEnhance/copyProductId.ts
  function copyProductIdAction() {
    const id = parseProductId();
    if (id) {
      copyToClipboard(id);
    } else {
      console.error("[Tmall-GoodsInfoEnhance] 未能解析到商品ID");
    }
  }

  // Tmall-GoodsInfoEnhance/copyColorNames.ts
  function copyAllColorNamesAction() {
    copySkuByLabel("颜色");
  }

  // Tmall-GoodsInfoEnhance/copySizeNames.ts
  function copyAllSizeNamesAction() {
    copySkuByLabel("尺码");
  }

  // Tmall-GoodsInfoEnhance/uiEnhance.ts
  var STYLES = {
    OVERLAY: `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 99999;
    display: none;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(5px);
    transition: opacity 0.3s;
  `,
    CARD: `
    background: #fff;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    width: 80%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  `,
    CLOSE_BTN: `
    position: absolute;
    top: 12px;
    right: 12px;
    cursor: pointer;
    font-size: 24px;
    color: #999;
    border: none;
    background: transparent;
    line-height: 1;
  `,
    TITLE: `
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: bold;
    color: #333;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
  `,
    SECTION: `
    margin-bottom: 24px;
    padding: 16px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #eee;
  `,
    SECTION_TITLE: `
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #444;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
    INFO_CONTENT: `
    font-size: 14px;
    color: #666;
    word-break: break-all;
    white-space: pre-wrap;
    max-height: 150px;
    overflow-y: auto;
    background: #fff;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  `,
    ITEM_CHIP_CONTAINER: `
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px;
  `,
    ITEM_CHIP: `
    padding: 6px 12px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
  `,
    COPY_BTN: `
    background: #ff5000;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
  `,
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
  `
  };
  function createOverlay() {
    const overlay = document.createElement("div");
    overlay.className = SELECTORS.OVERLAY_CONTAINER_CLASS;
    overlay.style.cssText = STYLES.OVERLAY;
    const card = document.createElement("div");
    card.style.cssText = STYLES.CARD;
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText = STYLES.CLOSE_BTN;
    closeBtn.onclick = () => overlay.style.display = "none";
    card.appendChild(closeBtn);
    const titleRow = document.createElement("div");
    titleRow.style.cssText = STYLES.TITLE + "display: flex; justify-content: space-between; align-items: center; padding-right: 40px;";
    const titleText = document.createElement("span");
    titleText.innerText = "📦 商品信息获取增强";
    titleRow.appendChild(titleText);
    const copyAllBtn = document.createElement("button");
    copyAllBtn.innerText = "全部复制";
    copyAllBtn.style.cssText = STYLES.COPY_BTN + "background: #333;";
    copyAllBtn.onclick = () => {
      const dataItems = [
        { label: "商品 ID", data: parseProductId() || "未找到" },
        { label: "颜色分类", data: getSkuItems("颜色").join("\n") || "未找到" },
        { label: "尺码/规格", data: getSkuItems("尺码").join("\n") || "未找到" }
      ];
      const allText = dataItems.map((item) => `【${item.label}】
${item.data}`).join("\n\n");
      copyToClipboard(allText);
    };
    titleRow.appendChild(copyAllBtn);
    card.appendChild(titleRow);
    const contentContainer = document.createElement("div");
    card.appendChild(contentContainer);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.style.display = "none";
    };
    return overlay;
  }
  function refreshOverlayContent(container) {
    container.innerHTML = "";
    const dataItems = [
      { label: "商品 ID", getData: () => parseProductId() || "未找到" },
      { label: "颜色分类", getData: () => getSkuItems("颜色") },
      { label: "尺码/规格", getData: () => getSkuItems("尺码") }
    ];
    dataItems.forEach((item) => {
      const section = document.createElement("div");
      section.style.cssText = STYLES.SECTION;
      const titleRow = document.createElement("div");
      titleRow.style.cssText = STYLES.SECTION_TITLE;
      const labelSpan = document.createElement("span");
      labelSpan.innerText = item.label;
      titleRow.appendChild(labelSpan);
      const rawData = item.getData();
      const isArray = Array.isArray(rawData);
      const bulkText = isArray ? rawData.join("\n") : rawData;
      const copyBtn = document.createElement("button");
      copyBtn.innerText = isArray ? "全部复制" : "复制";
      copyBtn.style.cssText = STYLES.COPY_BTN;
      copyBtn.onmouseenter = () => copyBtn.style.background = "#e64500";
      copyBtn.onmouseleave = () => copyBtn.style.background = "#ff5000";
      copyBtn.onclick = () => copyToClipboard(bulkText);
      titleRow.appendChild(copyBtn);
      section.appendChild(titleRow);
      if (isArray && rawData.length > 0) {
        const chipContainer = document.createElement("div");
        chipContainer.style.cssText = STYLES.ITEM_CHIP_CONTAINER;
        rawData.forEach((text) => {
          const chip = document.createElement("div");
          chip.innerText = text;
          chip.style.cssText = STYLES.ITEM_CHIP;
          chip.title = "点击复制该项";
          chip.onmouseenter = () => {
            chip.style.borderColor = "#ff5000";
            chip.style.color = "#ff5000";
          };
          chip.onmouseleave = () => {
            chip.style.borderColor = "#ddd";
            chip.style.color = "#333";
          };
          chip.onclick = () => copyToClipboard(text);
          chipContainer.appendChild(chip);
        });
        section.appendChild(chipContainer);
      } else {
        const infoBox = document.createElement("div");
        infoBox.style.cssText = STYLES.INFO_CONTENT;
        infoBox.innerText = bulkText || "未找到";
        section.appendChild(infoBox);
      }
      container.appendChild(section);
    });
  }
  function createFloatingTrigger(onToggle) {
    const btn = document.createElement("div");
    btn.className = SELECTORS.FLOATING_TRIGGER_CLASS;
    btn.innerHTML = "📋";
    btn.title = "打开商品信息面板";
    btn.style.cssText = STYLES.FLOATING_BTN;
    btn.onmouseenter = () => btn.style.transform = "scale(1.1)";
    btn.onmouseleave = () => btn.style.transform = "scale(1)";
    btn.onclick = onToggle;
    document.body.appendChild(btn);
  }
  function initUIEnhance() {
    if (store.isUIInitialized) return;
    console.log("[Tmall-GoodsInfoEnhance] 页面 UI 增强 (Overlay) 初始化...");
    const overlay = createOverlay();
    const contentContainer = overlay.querySelector("div > div:last-child");
    const toggleOverlay = () => {
      if (overlay.style.display === "flex") {
        overlay.style.display = "none";
      } else {
        refreshOverlayContent(contentContainer);
        overlay.style.display = "flex";
      }
    };
    createFloatingTrigger(toggleOverlay);
    document.addEventListener("keydown", (e) => {
      if (e.altKey && e.code === "KeyQ") {
        e.preventDefault();
        toggleOverlay();
      }
    });
    store.isUIInitialized = true;
  }

  // Tmall-GoodsInfoEnhance/index.ts
  function registerMenu() {
    if (typeof GM_registerMenuCommand !== "undefined") {
      GM_registerMenuCommand("📋 复制商品 ID", copyProductIdAction);
      GM_registerMenuCommand("🎨 复制所有颜色名称", copyAllColorNamesAction);
      GM_registerMenuCommand("📏 复制所有尺码名称", copyAllSizeNamesAction);
    }
  }
  var featureRegistry = {
    menuCommand: {
      enabled: true,
      init: registerMenu,
      description: "油猴菜单指令注册"
    },
    uiEnhance: {
      enabled: true,
      init: initUIEnhance,
      description: "页面 UI 增强"
    }
  };
  function bootstrap() {
    console.log("[Tmall-GoodsInfoEnhance] 脚本加载中...");
    Object.entries(featureRegistry).forEach(([key, config]) => {
      if (config.enabled) {
        try {
          config.init();
          console.log(`[Tmall-GoodsInfoEnhance] 特性 [${key}] (${config.description}) 已成功启动`);
        } catch (error) {
          console.error(`[Tmall-GoodsInfoEnhance] 特性 [${key}] 启动失败:`, error);
        }
      }
    });
  }
  bootstrap();
})();
