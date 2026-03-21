// ==UserScript==
// @name         淘宝/天猫商品信息增强插件 (GoodsInfoEnhance)
// @version      2026.03.21.09.35.36
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
  var SIZE_BLACKLIST = [
    // 示例: "XXL", "XXXL",
    "百人购买",
    "千人加购",
    "80%加购",
    "近期热销"
  ];
  var COLOR_BLACKLIST = [
    // 示例: "定制色", "特殊色",
  ];
  var store = {
    isUIInitialized: false,
    // 标记是否已初始化选中项（默认全选）
    isSelectionInitialized: false,
    // 记录选中的颜色和尺码
    selectedColors: [],
    selectedSizes: [],
    // 是否处于编辑模式
    isEditingColors: false,
    isEditingSizes: false,
    // 用户自定义的属性列表 (若已编辑)
    customColors: null,
    customSizes: null
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
    const blacklist = getBlacklistForLabel(labelText);
    if (group.parentElement?.id === "skuOptionsArea") {
      const itemsContainer = group.children[1];
      if (itemsContainer) {
        const allSpans = Array.from(itemsContainer.querySelectorAll("span"));
        const names = allSpans.map((span) => span.innerText.trim()).filter((text) => text.length > 0);
        const uniqueNames = Array.from(new Set(names));
        return filterByBlacklist(uniqueNames, blacklist);
      }
    }
    const items = Array.from(group.querySelectorAll(SELECTORS.SKU_ITEM_NAME)).map((el) => el.textContent?.trim()).filter((text) => !!text && text.length > 0);
    const uniqueItems = Array.from(new Set(items));
    return filterByBlacklist(uniqueItems, blacklist);
  }
  function getBlacklistForLabel(labelText) {
    if (labelText.includes("尺码") || labelText.includes("尺寸") || labelText.includes("码")) {
      return SIZE_BLACKLIST;
    }
    if (labelText.includes("颜色") || labelText.includes("色")) {
      return COLOR_BLACKLIST;
    }
    return [];
  }
  function filterByBlacklist(items, blacklist) {
    if (blacklist.length === 0) {
      return items;
    }
    return items.filter((item) => !blacklist.includes(item));
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

  // Tmall-GoodsInfoEnhance/ui/styles.ts
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
    ITEM_CHIP_ACTIVE: `
    background: #fff7f2;
    border-color: #ff5000;
    color: #ff5000;
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
    UNSELECT_BTN: `
    background: #999;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
    margin-right: 8px;
  `,
    EDIT_BTN: `
    background: #4b5563;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
    margin-right: 8px;
  `,
    EDIT_TEXTAREA: `
    width: 100%;
    min-height: 100px;
    padding: 8px;
    border: 1px solid #ff5000;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.5;
    font-family: inherit;
    box-sizing: border-box;
    margin-top: 8px;
    resize: vertical;
    white-space: pre;
  `,
    DISABLED_BTN: `
    background: #ccc !important;
    cursor: not-allowed !important;
    opacity: 0.7;
  `,
    INPUT_GROUP: `
    margin-bottom: 24px;
    padding: 16px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #eee;
  `,
    INPUT_LABEL: `
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #444;
  `,
    INPUT_CONTROL: `
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
    outline: none;
  `,
    ACTION_ROW: `
    display: flex;
    gap: 12px;
    margin-top: 16px;
    margin-bottom: 12px;
  `,
    GENERATE_BTN: `
    flex: 1;
    background: #ff5000;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 15px;
    font-weight: bold;
    transition: background 0.2s;
  `,
    CLEAR_BTN: `
    width: 80px;
    background: #666;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 15px;
    transition: background 0.2s;
  `,
    RESULT_TEXTAREA: `
    width: 100%;
    height: 150px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
    font-family: monospace;
    resize: vertical;
    box-sizing: border-box;
    white-space: pre;
    overflow-x: auto;
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

  // Tmall-GoodsInfoEnhance/ui/dataGenerator.ts
  function generateSkuTableData(price) {
    const productId = parseProductId() || "未知ID";
    let result = "颜色	尺码	价格（元）	数量	商家编码	\n";
    store.selectedColors.forEach((color) => {
      store.selectedSizes.forEach((size) => {
        result += `${color}	${size}	${price}	200	${productId}	
`;
      });
    });
    return result;
  }

  // Tmall-GoodsInfoEnhance/ui/content.ts
  function refreshOverlayContent(container) {
    container.innerHTML = "";
    const { currentColors, currentSizes } = syncSkuData();
    renderInfoSections(container, currentColors, currentSizes);
    renderGenerateSection(container);
  }
  function syncSkuData() {
    const currentColors = store.customColors || getSkuItems("颜色");
    const currentSizes = store.customSizes || getSkuItems("尺码");
    if (!store.isSelectionInitialized) {
      if (currentColors.length > 0) store.selectedColors = [...currentColors];
      if (currentSizes.length > 0) store.selectedSizes = [...currentSizes];
      if (currentColors.length > 0 || currentSizes.length > 0) {
        store.isSelectionInitialized = true;
      }
    } else {
      store.selectedColors = store.selectedColors.filter((c) => currentColors.includes(c));
      store.selectedSizes = store.selectedSizes.filter((s) => currentSizes.includes(s));
    }
    return { currentColors, currentSizes };
  }
  function renderInfoSections(container, currentColors, currentSizes) {
    const dataItems = [
      { label: "商品 ID", getData: () => parseProductId() || "未找到", key: "id" },
      { label: "颜色分类", getData: () => currentColors, key: "colors" },
      { label: "尺码/规格", getData: () => currentSizes, key: "sizes" }
    ];
    dataItems.forEach((item) => {
      const section = createSectionElement(item, container);
      container.appendChild(section);
    });
  }
  function createSectionElement(item, container) {
    const section = document.createElement("div");
    section.style.cssText = STYLES.SECTION;
    const titleRow = document.createElement("div");
    titleRow.style.cssText = STYLES.SECTION_TITLE;
    const labelSpan = document.createElement("span");
    labelSpan.innerText = item.label;
    titleRow.appendChild(labelSpan);
    const rawData = item.getData();
    const isArray = Array.isArray(rawData);
    const isEditing = item.key === "colors" && store.isEditingColors || item.key === "sizes" && store.isEditingSizes;
    const btnGroup = createSectionButtonGroup(item, isArray, isEditing, rawData, container, section);
    titleRow.appendChild(btnGroup);
    section.appendChild(titleRow);
    renderSectionBody(section, item, isArray, isEditing, rawData, container);
    return section;
  }
  function createSectionButtonGroup(item, isArray, isEditing, rawData, container, section) {
    const btnGroup = document.createElement("div");
    if (isArray) {
      const editBtn = document.createElement("button");
      editBtn.innerText = isEditing ? "保存" : "编辑";
      editBtn.style.cssText = STYLES.EDIT_BTN;
      editBtn.onclick = () => handleEditToggle(item, isEditing, container, section);
      btnGroup.appendChild(editBtn);
      const unselectBtn = document.createElement("button");
      unselectBtn.innerText = "全不选";
      unselectBtn.style.cssText = STYLES.UNSELECT_BTN + (isEditing ? STYLES.DISABLED_BTN : "");
      unselectBtn.disabled = isEditing;
      unselectBtn.onclick = () => {
        if (item.key === "colors") store.selectedColors = [];
        if (item.key === "sizes") store.selectedSizes = [];
        refreshOverlayContent(container);
      };
      btnGroup.appendChild(unselectBtn);
    }
    const copyBtn = document.createElement("button");
    copyBtn.innerText = isArray ? "全部复制" : "复制";
    copyBtn.style.cssText = STYLES.COPY_BTN + (isEditing ? STYLES.DISABLED_BTN : "");
    copyBtn.disabled = isEditing;
    copyBtn.onclick = () => {
      const text = isArray ? rawData.join("\n") : rawData;
      copyToClipboard(text);
    };
    btnGroup.appendChild(copyBtn);
    return btnGroup;
  }
  function handleEditToggle(item, isEditing, container, section) {
    if (isEditing) {
      const textarea = section.querySelector("textarea");
      if (textarea) {
        const newItems = textarea.value.split("\n").map((s) => s.trim()).filter((s) => s.length > 0);
        if (item.key === "colors") {
          store.customColors = newItems;
          store.selectedColors = [...newItems];
          store.isEditingColors = false;
        } else {
          store.customSizes = newItems;
          store.selectedSizes = [...newItems];
          store.isEditingSizes = false;
        }
      }
    } else {
      if (item.key === "colors") {
        store.selectedColors = [];
        store.isEditingColors = true;
      } else {
        store.selectedSizes = [];
        store.isEditingSizes = true;
      }
    }
    refreshOverlayContent(container);
  }
  function renderSectionBody(section, item, isArray, isEditing, rawData, container) {
    if (isArray) {
      if (isEditing) {
        const textarea = document.createElement("textarea");
        textarea.style.cssText = STYLES.EDIT_TEXTAREA;
        textarea.value = rawData.join("\n");
        textarea.placeholder = "每行输入一个选项...";
        section.appendChild(textarea);
      } else if (rawData.length > 0) {
        const chipContainer = document.createElement("div");
        chipContainer.style.cssText = STYLES.ITEM_CHIP_CONTAINER;
        rawData.forEach((text) => {
          const chip = createChip(text, item.key, container);
          chipContainer.appendChild(chip);
        });
        section.appendChild(chipContainer);
      } else {
        section.appendChild(createInfoBox("未找到"));
      }
    } else {
      section.appendChild(createInfoBox(rawData || "未找到"));
    }
  }
  function createChip(text, key, container) {
    const chip = document.createElement("div");
    chip.innerText = text;
    const isSelected = key === "colors" ? store.selectedColors.includes(text) : store.selectedSizes.includes(text);
    chip.style.cssText = STYLES.ITEM_CHIP + (isSelected ? STYLES.ITEM_CHIP_ACTIVE : "");
    chip.title = isSelected ? "点击取消选中" : "点击选中";
    chip.onclick = () => {
      if (key === "colors") {
        store.selectedColors = isSelected ? store.selectedColors.filter((c) => c !== text) : [...store.selectedColors, text];
      } else {
        store.selectedSizes = isSelected ? store.selectedSizes.filter((s) => s !== text) : [...store.selectedSizes, text];
      }
      refreshOverlayContent(container);
    };
    return chip;
  }
  function createInfoBox(text) {
    const infoBox = document.createElement("div");
    infoBox.style.cssText = STYLES.INFO_CONTENT;
    infoBox.innerText = text;
    return infoBox;
  }
  function renderGenerateSection(container) {
    const section = document.createElement("div");
    section.style.cssText = STYLES.INPUT_GROUP;
    const label = document.createElement("div");
    label.innerText = "💰 售价设置";
    label.style.cssText = STYLES.INPUT_LABEL;
    section.appendChild(label);
    const priceInput = document.createElement("input");
    priceInput.type = "number";
    priceInput.placeholder = "输入售价 (元), 默认 0";
    priceInput.style.cssText = STYLES.INPUT_CONTROL;
    section.appendChild(priceInput);
    const actionRow = document.createElement("div");
    actionRow.style.cssText = STYLES.ACTION_ROW;
    const clearBtn = document.createElement("button");
    clearBtn.innerText = "清空";
    clearBtn.style.cssText = STYLES.CLEAR_BTN;
    const generateBtn = document.createElement("button");
    generateBtn.innerText = "✨ 批量生成表格数据";
    generateBtn.style.cssText = STYLES.GENERATE_BTN;
    actionRow.appendChild(clearBtn);
    actionRow.appendChild(generateBtn);
    section.appendChild(actionRow);
    const resultTextarea = document.createElement("textarea");
    resultTextarea.style.cssText = STYLES.RESULT_TEXTAREA;
    resultTextarea.placeholder = "点击“批量生成”查看结果...";
    section.appendChild(resultTextarea);
    clearBtn.onclick = () => resultTextarea.value = "";
    generateBtn.onclick = () => {
      const result = generateSkuTableData(priceInput.value || "0");
      resultTextarea.value = result;
      resultTextarea.select();
      console.log("[Tmall-GoodsInfoEnhance] 批量数据已生成");
    };
    container.appendChild(section);
  }

  // Tmall-GoodsInfoEnhance/ui/overlay.ts
  function createOverlay() {
    const overlay = document.createElement("div");
    overlay.className = SELECTORS.OVERLAY_CONTAINER_CLASS;
    overlay.style.cssText = STYLES.OVERLAY;
    const card = document.createElement("div");
    card.style.cssText = STYLES.CARD;
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText = STYLES.CLOSE_BTN;
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
        { label: "颜色分类", data: (store.customColors || getSkuItems("颜色")).join("\n") || "未找到" },
        { label: "尺码/规格", data: (store.customSizes || getSkuItems("尺码")).join("\n") || "未找到" }
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
    return { overlay, contentContainer };
  }
  function toggleOverlay(overlay, contentContainer, show) {
    const isShowing = show !== void 0 ? show : overlay.style.display !== "flex";
    if (isShowing) {
      refreshOverlayContent(contentContainer);
      overlay.style.display = "flex";
      document.body.style.overflow = "hidden";
    } else {
      overlay.style.display = "none";
      document.body.style.overflow = "";
    }
  }

  // Tmall-GoodsInfoEnhance/ui/floatingButton.ts
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
    return btn;
  }

  // Tmall-GoodsInfoEnhance/uiEnhance.ts
  function initUIEnhance() {
    if (store.isUIInitialized) return;
    console.log("[Tmall-GoodsInfoEnhance] 页面 UI 增强 (Overlay) 初始化...");
    const { overlay, contentContainer } = createOverlay();
    createFloatingTrigger(() => toggleOverlay(overlay, contentContainer));
    const closeBtn = overlay.querySelector("button");
    if (closeBtn) {
      closeBtn.onclick = () => toggleOverlay(overlay, contentContainer, false);
    }
    document.addEventListener("keydown", (e) => {
      if (e.altKey && e.code === "KeyQ") {
        e.preventDefault();
        toggleOverlay(overlay, contentContainer);
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
