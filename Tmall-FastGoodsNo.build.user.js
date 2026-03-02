// ==UserScript==
// @name         天猫商品发布页面货号填写后快速跳转 (FastGoodsNo)
// @version      2026.03.02.12.43.30
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
    element.value = actualNewValue;
    const valueTracker = element._valueTracker;
    if (valueTracker) {
      valueTracker.setValue(actualOldValue);
    }
    const inputEvent = new Event("input", {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(inputEvent);
    const changeEvent = new Event("change", {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(changeEvent);
    const blurEvent = new FocusEvent("blur", {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(blurEvent);
  }

  // Tmall-FastGoodsNo/index.ts
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }
    const target = event.target;
    if (target.tagName !== "INPUT") {
      return;
    }
    const input = target;
    const sellCatPropLayout = input.closest("div.sell-catProp-struct-vertical-layout");
    if (!sellCatPropLayout) {
      return;
    }
    const previousSibling = sellCatPropLayout.previousElementSibling;
    if (!previousSibling || previousSibling.innerText !== "货号") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    updateReactInput(input);
    setTimeout(() => {
      const buttons = document.querySelectorAll("button.next-btn.next-medium.next-btn-primary");
      if (buttons.length > 0) {
        const button = buttons[0];
        if (button.disabled) {
          console.error("按钮仍处于禁用状态，无法点击");
        } else {
          button.click();
        }
      } else {
        console.error("未找到按钮：button.next-btn.next-medium.next-btn-primary");
      }
    }, 1e3);
  });
})();
