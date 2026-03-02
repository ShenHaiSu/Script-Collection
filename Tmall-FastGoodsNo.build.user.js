// ==UserScript==
// @name         天猫商品发布页面货号填写后快速跳转 (FastGoodsNo)
// @version      2026.03.02.19.35.58
// @description  在商品发布页面的搜索发品界面，用户输入完毕货号之后直接按下回车键，会自动点击确认按钮，跳转到商品详情页面。
// @author       DaoLuoLTS
// @match        https://sell.publish.tmall.com/tmall/ai/category.htm?*
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
    const valueTracker = element._valueTracker;
    if (valueTracker) {
      valueTracker.setValue(actualOldValue);
    }
    if (actualOldValue === actualNewValue) {
      element.value = actualNewValue + "​";
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
    element.value = actualNewValue;
    const dispatchComposition = (type, data) => {
      try {
        element.dispatchEvent(new CompositionEvent(type, { bubbles: true, data }));
      } catch (e) {
      }
    };
    dispatchComposition("compositionstart", actualOldValue);
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
    dispatchComposition("compositionend", actualNewValue);
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

  // Tmall-FastGoodsNo/index.ts
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
