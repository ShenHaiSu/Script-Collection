// ==UserScript==
// @name         天猫商品详情交互增强插件 (FastGoodsInput)
// @version      2026.03.24.22.07.07
// @description  在商品详情填写页面，提供多种更符合心流的交互方式，提升填写效率，降低错误率。
// @author       DaoLuoLTS
// @match        https://sell.publish.tmall.com/tmall/publish.htm?*
// @namespace    https://github.com/ShenHaiSu/Script-Collection
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sell.publish.tmall.com
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @noframes     
// @supportURL   https://github.com/ShenHaiSu/Script-Collection/issues
// ==/UserScript==

"use strict";
(() => {
  // Tmall-FastGoodsInput/cateLabelLarge.ts
  var isCateLabelLargeChecked = false;
  function handleTreeLabelClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches("div.next-tree-node-label.next-tree-node-label-selectable")) return;
    const wrapper = target.closest("div.next-tree-node-label-wrapper");
    if (!wrapper) return;
    const checkboxWrapper = wrapper.previousElementSibling;
    if (!(checkboxWrapper instanceof HTMLElement)) return;
    if (checkboxWrapper.matches("label.next-checkbox-wrapper")) {
      checkboxWrapper.click();
    }
  }
  function initCateLabelLarge() {
    if (isCateLabelLargeChecked) return;
    isCateLabelLargeChecked = true;
    console.log("[Tmall-FastGoodsInput] 类目文本标签点击自动勾选增强");
    document.addEventListener("click", handleTreeLabelClick, true);
  }

  // Tmall-FastGoodsInput/helper.ts
  function isInput(element) {
    return element instanceof HTMLInputElement;
  }

  // Tmall-FastGoodsInput/tabToOverlayInput.ts
  var isTabToOverlayInputInitialized = false;
  function handleKeyDown(event) {
    if (event._skipTabToOverlayInput) return;
    if (event.key !== "Tab") return;
    const target = event.target;
    if (!isInput(target)) return;
    const popupSpan = target.closest('span[aria-haspopup="true"][aria-expanded="true"]');
    if (!popupSpan) return;
    const openedOverlay = document.querySelector("div.next-overlay-wrapper.opened");
    if (!openedOverlay) return;
    const overlayInputs = openedOverlay.querySelectorAll("input");
    const firstInput = overlayInputs[0];
    if (!(firstInput instanceof HTMLInputElement)) return;
    event.preventDefault();
    firstInput.focus();
  }
  function initTabToOverlayInput() {
    if (isTabToOverlayInputInitialized) return;
    isTabToOverlayInputInitialized = true;
    console.log("[Tmall-FastGoodsInput] Tab 快捷聚焦到浮层输入框功能已启用");
    document.addEventListener("keydown", handleKeyDown, true);
  }

  // Tmall-FastGoodsInput/keyboardNavigation.ts
  var SELECTED_CLASS = "tmall-fast-input-selected";
  function injectStyles() {
    const style = document.createElement("style");
    style.innerHTML = `
    .${SELECTED_CLASS} {
      outline: 2px solid #ff4400 !important;
      outline-offset: -2px;
      background-color: rgba(255, 68, 0, 0.1) !important;
      transition: all 0.1s ease;
      z-index: 10;
      position: relative;
    }
  `;
    document.head.appendChild(style);
  }
  var currentItems = [];
  var currentIndex = -1;
  function resetState() {
    if (currentIndex >= 0 && currentItems[currentIndex]) {
      currentItems[currentIndex].classList.remove(SELECTED_CLASS);
    }
    currentItems = [];
    currentIndex = -1;
  }
  function updateHighlight() {
    currentItems.forEach((item, index) => {
      if (index === currentIndex) {
        item.classList.add(SELECTED_CLASS);
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else {
        item.classList.remove(SELECTED_CLASS);
      }
    });
  }
  function getNavigationContext(activeElement) {
    if (!isInput(activeElement)) return [];
    const optionsSearch = activeElement.closest("div.options-search");
    if (!optionsSearch) return [];
    const optionsContent = optionsSearch.nextElementSibling;
    if (!optionsContent || !optionsContent.classList.contains("options-content")) return [];
    const items = Array.from(optionsContent.querySelectorAll("div.options-item"));
    if (items.length === 0) {
      resetState();
      return [];
    }
    if (currentItems.length !== items.length || !currentItems.every((item, i) => item === items[i])) {
      resetState();
      currentItems = items;
    }
    return currentItems;
  }
  function simulateTab(sourceInput) {
    setTimeout(() => {
      if (!document.body.contains(sourceInput)) return;
      sourceInput.focus();
      const tabEvent = new KeyboardEvent("keydown", {
        key: "Tab",
        code: "Tab",
        keyCode: 9,
        bubbles: true,
        cancelable: true
      });
      tabEvent._skipTabToOverlayInput = true;
      sourceInput.dispatchEvent(tabEvent);
    }, 200);
  }
  function handleArrowKey(event, direction, items) {
    event.preventDefault();
    if (currentIndex === -1) {
      currentIndex = direction === "down" ? 0 : items.length - 1;
    } else {
      const step = direction === "down" ? 1 : -1;
      currentIndex = (currentIndex + step + items.length) % items.length;
    }
    updateHighlight();
  }
  function handleEnterKey(event, items) {
    if (currentIndex < 0 || !items[currentIndex]) return;
    event.preventDefault();
    const popupSpan = document.querySelector('span[aria-expanded="true"][aria-haspopup="true"]');
    const sourceInput = popupSpan?.querySelector("input");
    items[currentIndex].click();
    resetState();
    if (sourceInput instanceof HTMLInputElement) {
      simulateTab(sourceInput);
    }
  }
  function handleKeyDown2(event) {
    const items = getNavigationContext(document.activeElement);
    if (items.length === 0) return;
    switch (event.key) {
      case "ArrowDown":
        handleArrowKey(event, "down", items);
        break;
      case "ArrowUp":
        handleArrowKey(event, "up", items);
        break;
      case "Enter":
        handleEnterKey(event, items);
        break;
      case "Escape":
        resetState();
        break;
    }
  }
  function initKeyboardNavigation() {
    injectStyles();
    document.addEventListener("keydown", handleKeyDown2, true);
  }

  // dev-tool/react-inputUpdate.ts
  function updateReactInput(element, oldValue, newValue) {
    if (!element) {
      console.error("updateReactInput: element 不能为空");
      return;
    }
    const actualOldValue = oldValue !== void 0 ? oldValue : element.value;
    const actualNewValue = newValue !== void 0 ? newValue : actualOldValue;
    const setNativeValue = (el, val) => {
      const prototype = Object.getPrototypeOf(el);
      const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
      if (valueSetter) {
        valueSetter.call(el, val);
      } else {
        el.value = val;
      }
    };
    const valueTracker = element._valueTracker;
    if (valueTracker) {
      valueTracker.setValue(actualOldValue);
    }
    if (actualOldValue === actualNewValue) {
      setNativeValue(element, actualNewValue + "​");
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
    setNativeValue(element, actualNewValue);
    let inputEvent;
    try {
      inputEvent = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText",
        data: actualNewValue
      });
    } catch (e) {
      inputEvent = new Event("input", { bubbles: true, cancelable: true });
    }
    element.dispatchEvent(inputEvent);
    element.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    element.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    element.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
    console.log(`updateReactInput: 已触发更新 [${actualOldValue}] -> [${actualNewValue}]`);
  }
  function updateReactInputAsync(element, newValue, delay = 50) {
    return new Promise((resolve) => {
      element.blur();
      setTimeout(() => {
        element.focus();
        updateReactInput(element, void 0, newValue);
        resolve();
      }, delay);
    });
  }

  // Tmall-FastGoodsInput/genProductCode.ts
  var currentOptions = { prefix: "JGJ" };
  var isInitialized = false;
  function generateProductCode() {
    const now = /* @__PURE__ */ new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${currentOptions.prefix}${month}${day}${hours}${minutes}`;
  }
  function handleKeyDown3(event) {
    if (!event.altKey || event.key !== "1") return;
    const activeElement = document.activeElement;
    if (!(activeElement instanceof HTMLInputElement) || activeElement.id !== "productCode") return;
    event.preventDefault();
    event.stopPropagation();
    const newCode = generateProductCode();
    console.log(`[Tmall-FastGoodsInput] 生成货号: ${newCode}`);
    updateReactInput(activeElement, void 0, newCode);
  }
  function initGenProductCode(options) {
    if (isInitialized) return;
    isInitialized = true;
    if (options?.prefix) {
      currentOptions.prefix = options.prefix;
    }
    console.log(`[Tmall-FastGoodsInput] 货号快速生成特性已加载 (前缀: ${currentOptions.prefix})`);
    document.addEventListener("keydown", handleKeyDown3, true);
  }

  // Tmall-FastGoodsInput/autoFillColorSize.ts
  var isInitialized2 = false;
  var overlay = null;
  var textarea = null;
  var progressContainer = null;
  var progressBar = null;
  var progressLog = null;
  var currentProgress = 0;
  var totalItems = 0;
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
    max-width: 500px;
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
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: bold;
    color: #333;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
  `,
    TEXTAREA: `
    width: 100%;
    min-height: 200px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    font-family: monospace;
    resize: vertical;
    box-sizing: border-box;
  `,
    BUTTON_ROW: `
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
  `,
    BUTTON: `
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    border: none;
    transition: background 0.2s;
  `,
    CONFIRM_BTN: `
    background: #007bff;
    color: white;
  `,
    CANCEL_BTN: `
    background: #f0f0f0;
    color: #333;
  `,
    HINT: `
    font-size: 12px;
    color: #666;
    margin-bottom: 12px;
    line-height: 1.5;
  `,
    PROGRESS_CONTAINER: `
    display: none;
    flex-direction: column;
    gap: 16px;
  `,
    PROGRESS_BAR_WRAPPER: `
    width: 100%;
    height: 24px;
    background: #e9ecef;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
  `,
    PROGRESS_BAR: `
    height: 100%;
    background: linear-gradient(90deg, #007bff, #0056b3);
    border-radius: 12px;
    transition: width 0.3s ease;
    width: 0%;
  `,
    PROGRESS_TEXT: `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    font-weight: bold;
    color: #333;
  `,
    PROGRESS_LOG: `
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 12px;
    font-family: monospace;
    font-size: 13px;
    line-height: 1.6;
  `,
    LOG_ITEM: `
    margin-bottom: 4px;
    color: #495057;
  `,
    LOG_ITEM_SUCCESS: `
    color: #28a745;
  `
  };
  function parseInputText(text) {
    const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
    const result = {
      colors: [],
      sizes: []
    };
    let currentSection = "none";
    for (const line of lines) {
      if (line.includes("商品 ID")) {
        currentSection = "itemId";
        continue;
      }
      if (line.includes("颜色分类")) {
        currentSection = "colors";
        continue;
      }
      if (line.includes("尺码") || line.includes("规格")) {
        currentSection = "sizes";
        continue;
      }
      if (currentSection === "itemId") {
        continue;
      } else if (currentSection === "colors") {
        result.colors.push(line);
      } else if (currentSection === "sizes") {
        result.sizes.push(line);
      }
    }
    console.log("[Tmall-FastGoodsInput] 解析结果:", result);
    return result;
  }
  function findColorAndSizeContainers(salePropsElement) {
    const childDivs = salePropsElement.querySelectorAll(":scope > div");
    let colorContainer = null;
    let sizeContainer = null;
    for (const div of childDivs) {
      const header = div.querySelector(":scope > div.header");
      if (!header) continue;
      const headerText = header.textContent || "";
      if (headerText.includes("颜色")) {
        colorContainer = {
          element: div,
          type: "color",
          headerText
        };
        console.log("[Tmall-FastGoodsInput] 找到颜色容器:", headerText);
      } else if (headerText.includes("尺码") || headerText.includes("规格")) {
        sizeContainer = {
          element: div,
          type: "size",
          headerText
        };
        console.log("[Tmall-FastGoodsInput] 找到尺码容器:", headerText);
      }
    }
    return { colorContainer, sizeContainer };
  }
  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function addColors(container, colors, onProgress) {
    console.log("[Tmall-FastGoodsInput] 开始添加颜色:", colors);
    const ul = container.querySelector("ul");
    if (!ul) {
      console.error("[Tmall-FastGoodsInput] 未找到 ul 元素");
      return;
    }
    for (let i = 0; i < colors.length; i++) {
      const inputs = ul.querySelectorAll("input");
      console.log(`[Tmall-FastGoodsInput] 第 ${i + 1} 次循环，找到 ${inputs.length} 个 input 元素`);
      if (inputs.length === 0) {
        console.error("[Tmall-FastGoodsInput] 未找到任何 input 元素");
        return;
      }
      const inputIndex = i * 2;
      if (inputIndex >= inputs.length) {
        console.warn(`[Tmall-FastGoodsInput] 颜色 "${colors[i]}" 对应的 input 索引 ${inputIndex} 超出范围`);
        break;
      }
      const input = inputs[inputIndex];
      console.log(`[Tmall-FastGoodsInput] 添加颜色 "${colors[i]}" 到索引 ${inputIndex}`);
      await updateReactInputAsync(input, colors[i], 100);
      await wait(200);
      const addButton = ul.querySelector("button.add");
      if (addButton) {
        console.log(`[Tmall-FastGoodsInput] 点击添加按钮`);
        addButton.click();
        await wait(200);
      } else {
        console.warn("[Tmall-FastGoodsInput] 未找到添加按钮");
      }
      if (onProgress) {
        onProgress(i + 1, colors.length, colors[i]);
      }
    }
    console.log("[Tmall-FastGoodsInput] 颜色添加完成");
  }
  async function addSizes(container, sizes, onProgress) {
    console.log("[Tmall-FastGoodsInput] 开始添加尺码:", sizes);
    const ul = container.querySelector("ul");
    if (!ul) {
      console.error("[Tmall-FastGoodsInput] 未找到 ul 元素");
      return;
    }
    for (let i = 0; i < sizes.length; i++) {
      const inputs = ul.querySelectorAll("input");
      console.log(`[Tmall-FastGoodsInput] 第 ${i + 1} 次循环，找到 ${inputs.length} 个 input 元素`);
      if (inputs.length === 0) {
        console.error("[Tmall-FastGoodsInput] 未找到任何 input 元素");
        return;
      }
      const inputIndex = i * 2;
      if (inputIndex >= inputs.length) {
        console.warn(`[Tmall-FastGoodsInput] 尺码 "${sizes[i]}" 对应的 input 索引 ${inputIndex} 超出范围`);
        break;
      }
      const input = inputs[inputIndex];
      const oldValue = input.value;
      console.log(`[Tmall-FastGoodsInput] 添加尺码 "${sizes[i]}" 到索引 ${inputIndex}`);
      await updateReactInputAsync(input, sizes[i], 100);
      await wait(200);
      const addButton = ul.querySelector("button.size-option-add-btn");
      if (addButton) {
        console.log(`[Tmall-FastGoodsInput] 点击添加按钮`);
        addButton.click();
        await wait(200);
      } else {
        console.warn("[Tmall-FastGoodsInput] 未找到添加按钮");
      }
      if (onProgress) {
        onProgress(i + 1, sizes.length, sizes[i]);
      }
    }
    console.log("[Tmall-FastGoodsInput] 尺码添加完成");
  }
  function createOverlayUI() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.style.cssText = STYLES.OVERLAY;
    const card = document.createElement("div");
    card.style.cssText = STYLES.CARD;
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText = STYLES.CLOSE_BTN;
    closeBtn.onclick = hideOverlay;
    card.appendChild(closeBtn);
    const title = document.createElement("h3");
    title.innerText = "🎨 自动填写商品颜色和尺码";
    title.style.cssText = STYLES.TITLE;
    card.appendChild(title);
    const hint = document.createElement("div");
    hint.innerHTML = "请输入颜色和尺码信息：<br/>【颜色分类】每行一个颜色<br/>【尺码/规格】每行一个尺码<br/>商品ID会自动忽略";
    hint.style.cssText = STYLES.HINT;
    card.appendChild(hint);
    textarea = document.createElement("textarea");
    textarea.style.cssText = STYLES.TEXTAREA;
    textarea.placeholder = "【商品 ID】\n908498255171\n\n【颜色分类】\n7113B-浅蓝色\n7113B-深蓝色\n\n【尺码/规格】\n28\n29\n30";
    card.appendChild(textarea);
    progressContainer = document.createElement("div");
    progressContainer.style.cssText = STYLES.PROGRESS_CONTAINER;
    const progressBarWrapper = document.createElement("div");
    progressBarWrapper.style.cssText = STYLES.PROGRESS_BAR_WRAPPER;
    progressBar = document.createElement("div");
    progressBar.style.cssText = STYLES.PROGRESS_BAR;
    progressBarWrapper.appendChild(progressBar);
    const progressText = document.createElement("div");
    progressText.style.cssText = STYLES.PROGRESS_TEXT;
    progressText.id = "progress-text";
    progressText.innerText = "0%";
    progressBarWrapper.appendChild(progressText);
    progressContainer.appendChild(progressBarWrapper);
    progressLog = document.createElement("div");
    progressLog.style.cssText = STYLES.PROGRESS_LOG;
    progressLog.id = "progress-log";
    progressContainer.appendChild(progressLog);
    card.appendChild(progressContainer);
    const buttonRow = document.createElement("div");
    buttonRow.style.cssText = STYLES.BUTTON_ROW;
    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "取消";
    cancelBtn.style.cssText = STYLES.BUTTON + STYLES.CANCEL_BTN;
    cancelBtn.onclick = hideOverlay;
    buttonRow.appendChild(cancelBtn);
    const confirmBtn = document.createElement("button");
    confirmBtn.innerText = "确认填写";
    confirmBtn.style.cssText = STYLES.BUTTON + STYLES.CONFIRM_BTN;
    confirmBtn.onclick = handleConfirm;
    buttonRow.appendChild(confirmBtn);
    card.appendChild(buttonRow);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }
  function showInputUI() {
    if (textarea) textarea.style.display = "block";
    if (progressContainer) progressContainer.style.display = "none";
  }
  function showProgressUI() {
    if (textarea) textarea.style.display = "none";
    if (progressContainer) progressContainer.style.display = "flex";
    currentProgress = 0;
    updateProgressBar(0);
    if (progressLog) progressLog.innerHTML = "";
  }
  function updateProgressBar(progress) {
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    const progressText = document.getElementById("progress-text");
    if (progressText) {
      progressText.innerText = `${Math.round(progress)}%`;
    }
  }
  function addProgressLog(message, isSuccess = false) {
    if (!progressLog) return;
    const logItem = document.createElement("div");
    logItem.style.cssText = STYLES.LOG_ITEM + (isSuccess ? STYLES.LOG_ITEM_SUCCESS : "");
    logItem.innerText = message;
    progressLog.appendChild(logItem);
    progressLog.scrollTop = progressLog.scrollHeight;
  }
  function showOverlay() {
    if (!overlay) {
      createOverlayUI();
    }
    if (overlay) {
      overlay.style.display = "flex";
      document.body.style.overflow = "hidden";
      showInputUI();
      if (textarea) textarea.focus();
    }
  }
  function hideOverlay() {
    if (overlay) {
      overlay.style.display = "none";
      document.body.style.overflow = "";
    }
    if (textarea) textarea.value = "";
    currentProgress = 0;
    totalItems = 0;
    if (progressBar) progressBar.style.width = "0%";
    if (progressLog) progressLog.innerHTML = "";
  }
  async function handleConfirm() {
    const inputText = textarea?.value || "";
    console.log("[Tmall-FastGoodsInput] 批量入参:", inputText);
    if (!inputText.trim()) {
      alert("请输入颜色和尺码信息");
      return;
    }
    const parsedData = parseInputText(inputText);
    if (parsedData.colors.length === 0 && parsedData.sizes.length === 0) {
      alert("未能解析出颜色或尺码信息，请检查输入格式");
      return;
    }
    const salePropsElement = document.querySelector("div.sell-component-sale-props");
    if (!salePropsElement) {
      alert("未找到销售属性容器 (div.sell-component-sale-props)");
      hideOverlay();
      return;
    }
    const { colorContainer, sizeContainer } = findColorAndSizeContainers(salePropsElement);
    if (!colorContainer && !sizeContainer) {
      alert("未找到颜色或尺码容器");
      hideOverlay();
      return;
    }
    showProgressUI();
    const totalColors = colorContainer ? parsedData.colors.length : 0;
    const totalSizes = sizeContainer ? parsedData.sizes.length : 0;
    totalItems = totalColors + totalSizes;
    currentProgress = 0;
    addProgressLog(`开始自动填写...`);
    addProgressLog(`颜色: ${totalColors}个, 尺码: ${totalSizes}个`);
    try {
      if (colorContainer && parsedData.colors.length > 0) {
        addProgressLog(`开始填写颜色...`);
        await addColors(colorContainer.element, parsedData.colors, (current, total, currentItem) => {
          currentProgress = (current + (totalSizes > 0 ? 0 : 0)) / totalItems * 100;
          updateProgressBar(currentProgress);
          addProgressLog(`✓ 完成 颜色填写: ${currentItem}`, true);
        });
      }
      if (sizeContainer && parsedData.sizes.length > 0) {
        addProgressLog(`开始填写尺码...`);
        await addSizes(sizeContainer.element, parsedData.sizes, (current, total, currentItem) => {
          currentProgress = (totalColors + current) / totalItems * 100;
          updateProgressBar(currentProgress);
          addProgressLog(`✓ 完成 尺码填写: ${currentItem}`, true);
        });
      }
      updateProgressBar(100);
      addProgressLog(`✅ 全部填写完成!`, true);
      console.log("[Tmall-FastGoodsInput] 批量填写完成", {
        colors: parsedData.colors,
        sizes: parsedData.sizes
      });
      setTimeout(() => {
        hideOverlay();
      }, 1500);
    } catch (error) {
      console.error("[Tmall-FastGoodsInput] 批量填写出错:", error);
      addProgressLog(`❌ 填写出错: ${error}`, false);
      alert("填写过程中出现错误，请查看控制台");
      hideOverlay();
    }
  }
  function handleKeyDown4(event) {
    if (!event.altKey || event.key !== "1") return;
    const activeElement = document.activeElement;
    if (!(activeElement instanceof HTMLInputElement)) return;
    const salePropsElement = activeElement.closest("div.sell-component-sale-props");
    if (!salePropsElement) return;
    event.preventDefault();
    event.stopPropagation();
    console.log("[Tmall-FastGoodsInput] 检测到在销售属性区域，按下 Alt+1，显示批量填写浮层");
    showOverlay();
  }
  function initAutoFillColorSize(options) {
    if (isInitialized2) return;
    isInitialized2 = true;
    console.log("[Tmall-FastGoodsInput] 颜色尺码自动填写特性已加载");
    document.addEventListener("keydown", handleKeyDown4, true);
  }

  // Tmall-FastGoodsInput/quickFillShipping.ts
  var isInitialized3 = false;
  function handleKeyDown5(event) {
    if (!event.altKey || event.key !== "1") return;
    const activeElement = document.activeElement;
    if (!(activeElement instanceof HTMLInputElement)) return;
    const subTitleElement = activeElement.closest("div#struct-tmSubTitle");
    if (!subTitleElement) return;
    event.preventDefault();
    event.stopPropagation();
    console.log("[Tmall-FastGoodsInput] 检测到在副标题区域，按下 Alt+1，填写快递信息");
    updateReactInput(activeElement, void 0, "顺丰包邮 包运费险");
  }
  function initQuickFillShipping() {
    if (isInitialized3) return;
    isInitialized3 = true;
    console.log("[Tmall-FastGoodsInput] 快递信息快速填写特性已加载");
    document.addEventListener("keydown", handleKeyDown5, true);
  }

  // Tmall-FastGoodsInput/index.ts
  var featureRegistry = {
    cateLabelLarge: {
      enabled: true,
      // 默认开启
      init: initCateLabelLarge,
      description: "类目文本标签点击自动勾选增强"
    },
    tabToOverlayInput: {
      enabled: true,
      // 默认开启
      init: initTabToOverlayInput,
      description: "Tab 键快速聚焦浮层输入框"
    },
    keyboardNavigation: {
      enabled: true,
      // 默认开启
      init: initKeyboardNavigation,
      description: "搜索下拉框键盘上下键选择与回车确认"
    },
    genProductCode: {
      enabled: true,
      // 默认开启
      init: initGenProductCode,
      description: "Alt + 1 快速生成唯一货号",
      options: {
        prefix: "JGJ"
        // 这里可以配置前缀
      }
    },
    autoFillColorSize: {
      enabled: true,
      // 默认开启
      init: initAutoFillColorSize,
      description: "Alt + 1 自动填写商品颜色和尺码"
    },
    quickFillShipping: {
      enabled: true,
      // 默认开启
      init: initQuickFillShipping,
      description: "Alt + 1 快速填写快递信息（顺丰包邮 包运费险）"
    }
  };
  function bootstrap() {
    console.log("[Tmall-FastGoodsInput] 脚本初始化中...");
    Object.entries(featureRegistry).forEach(([key, config]) => {
      if (config.enabled) {
        try {
          config.init(config.options);
          console.log(`[Tmall-FastGoodsInput] 特性 [${key}] (${config.description}) 已成功启动`);
        } catch (error) {
          console.error(`[Tmall-FastGoodsInput] 特性 [${key}] 启动失败:`, error);
        }
      }
    });
  }
  bootstrap();
})();
