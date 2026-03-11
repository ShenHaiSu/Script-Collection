// ==UserScript==
// @name         天猫商品详情交互增强插件 (FastGoodsInput)
// @version      2026.03.11.21.55.38
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
