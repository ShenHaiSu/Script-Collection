// ==UserScript==
// @name         天猫商品发布页面货号填写后快速跳转 (FastGoodsNo)
// @version      2026.03.21.09.35.36
// @description  在商品发布页面的搜索发品界面，用户输入完毕货号之后直接按下回车键，会自动点击确认按钮，跳转到商品详情页面。
// @author       DaoLuoLTS
// @match        https://sell.publish.tmall.com/tmall/ai/category.htm*
// @namespace    https://github.com/ShenHaiSu/Script-Collection
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tmall.com
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @noframes     
// @supportURL   https://github.com/ShenHaiSu/Script-Collection/issues
// ==/UserScript==

"use strict";
(() => {
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

  // Tmall-FastGoodsNo/utils/timeUtils.ts
  function getCurrentTimeMmss() {
    const now = /* @__PURE__ */ new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return formattedHours + formattedMinutes;
  }

  // Tmall-FastGoodsNo/utils/inputDetector.ts
  function isGoodsNoInput(target) {
    if (!target || target.tagName !== "INPUT") {
      return false;
    }
    const input = target;
    const role = input.getAttribute("role");
    if (role !== "combobox") {
      return false;
    }
    const itemLabel = input.getAttribute("itemlabel");
    if (itemLabel !== "货号") {
      return false;
    }
    const sellCatPropLayout = input.closest("div.sell-catProp-struct-vertical-layout");
    if (!sellCatPropLayout) {
      return false;
    }
    const previousSibling = sellCatPropLayout.previousElementSibling;
    if (!previousSibling || previousSibling.innerText !== "货号") {
      return false;
    }
    return true;
  }
  function isInGoodsNoArea(element) {
    if (!element) {
      return false;
    }
    const sellCatPropLayout = element.closest("div.sell-catProp-struct-vertical-layout");
    if (!sellCatPropLayout) {
      return false;
    }
    const previousSibling = sellCatPropLayout.previousElementSibling;
    return !!previousSibling && previousSibling.innerText === "货号";
  }
  function getInputDebugInfo(input) {
    return {
      tagName: input.tagName,
      role: input.getAttribute("role"),
      itemlabel: input.getAttribute("itemlabel"),
      value: input.value,
      isInGoodsNoArea: isInGoodsNoArea(input)
    };
  }

  // Tmall-FastGoodsNo/utils/shortcutHandler.ts
  async function fillTimeAndProceed(input) {
    const timeValue = getCurrentTimeMmss();
    console.log(`[Alt+1快捷键] 获取当前时间: ${timeValue}`);
    await updateReactInputAsync(input, timeValue);
    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true
    });
    setTimeout(() => {
      input.dispatchEvent(enterEvent);
      console.log(`[Alt+1快捷键] 已触发回车事件，准备自动跳转`);
    }, 100);
  }
  function handleAlt1Shortcut(event) {
    if (!event.altKey) {
      return false;
    }
    if (event.key !== "1" && event.key !== "!") {
      return false;
    }
    console.log("[Alt+1快捷键] 检测到 Alt+1 快捷键");
    const activeElement = document.activeElement;
    if (!isGoodsNoInput(activeElement)) {
      const debugInfo = activeElement?.tagName === "INPUT" ? getInputDebugInfo(activeElement) : { tagName: activeElement?.tagName, role: null, itemlabel: null, value: "", isInGoodsNoArea: false };
      console.log("[Alt+1快捷键] 当前聚焦元素不是货号输入框，跳过", debugInfo);
      return false;
    }
    const input = activeElement;
    event.preventDefault();
    event.stopPropagation();
    console.log("[Alt+1快捷键] 验证通过，准备填充时间");
    fillTimeAndProceed(input).catch((error) => {
      console.error("[Alt+1快捷键] 执行失败:", error);
    });
    return true;
  }
  function registerAlt1Shortcut() {
    const handler = (event) => {
      handleAlt1Shortcut(event);
    };
    document.addEventListener("keydown", handler);
    console.log("[Alt+1快捷键] 已注册 Alt+1 快捷键监听器");
    return () => {
      document.removeEventListener("keydown", handler);
      console.log("[Alt+1快捷键] 已注销 Alt+1 快捷键监听器");
    };
  }

  // Tmall-FastGoodsNo/index.ts
  var unregisterAlt1Shortcut = null;
  function initModule() {
    unregisterAlt1Shortcut = registerAlt1Shortcut();
    console.log("天猫快速货号输入增强模块已初始化");
  }
  initModule();
  function waitForNextButtonAndClick() {
    setTimeout(() => {
      let checkCount = 0;
      const maxChecks = 10;
      const interval = 200;
      const selector = "button.next-btn.next-medium.next-btn-primary";
      const check = () => {
        checkCount++;
        const button = document.querySelector(selector);
        if (!button) {
          console.warn("未找到下一步按钮");
          if (checkCount < maxChecks) setTimeout(check, interval);
          return;
        }
        if (button.disabled) {
          console.log(`按钮检查 (${checkCount}/${maxChecks}): 仍处于禁用状态`);
          if (checkCount < maxChecks) {
            setTimeout(check, interval);
          } else {
            console.error("按钮在多次检查后仍处于禁用状态，尝试强制点击");
            button.click();
          }
        } else {
          console.log(`按钮检查 (${checkCount}/${maxChecks}): 已启用，触发点击`);
          button.click();
        }
      };
      check();
    }, 500);
  }
  document.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;
    const target = event.target;
    if (target.tagName !== "INPUT") return;
    const input = target;
    const sellCatPropLayout = input.closest("div.sell-catProp-struct-vertical-layout");
    if (!sellCatPropLayout) return;
    const previousSibling = sellCatPropLayout.previousElementSibling;
    if (!previousSibling || previousSibling.innerText !== "货号") return;
    console.log("检测到货号输入框回车事件，当前值:", input.value);
    event.preventDefault();
    event.stopPropagation();
    const currentValue = input.value;
    if (!currentValue.trim()) {
      console.log("输入框为空，跳过更新");
      return;
    }
    await updateReactInputAsync(input, currentValue);
    waitForNextButtonAndClick();
  });
})();
