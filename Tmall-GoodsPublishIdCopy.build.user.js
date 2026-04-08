// ==UserScript==
// @name         商品提交页id快速复制 (GoodsPublishIdCopy)
// @version      2026.04.08.19.11.47
// @description  在商品提交成功页面，快速复制商品发布ID。
// @author       DaoLuoLTS
// @match        https://sell.publish.tmall.com/tmall/success.htm*
// @namespace    https://github.com/ShenHaiSu/Script-Collection
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tmall.com
// @grant        none
// @run-at       document-end
// @noframes     
// @supportURL   https://github.com/ShenHaiSu/Script-Collection/issues
// ==/UserScript==

"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // Tmall-GoodsPublishIdCopy/helper.ts
  var helper_exports = {};
  __export(helper_exports, {
    copyToClipboard: () => copyToClipboard,
    extractGoodsPublishId: () => extractGoodsPublishId,
    getTargetElement: () => getTargetElement,
    initAndMount: () => initAndMount,
    mountCopyButton: () => mountCopyButton,
    showToast: () => showToast
  });
  function injectButtonStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
    .${STYLE_CLASS} {
      display: inline-block;
      margin-top: 6px;
      padding: 4px 10px;
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-weight: 500;
      color: #333;
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
      line-height: 1.4;
    }
    .${STYLE_CLASS}:hover {
      background: #fff;
      border-color: #999;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    .${STYLE_CLASS}:active {
      background: #eee;
      border-color: #888;
      transform: scale(0.98);
    }
    .${STYLE_CLASS}:focus {
      outline: none;
      border-color: #666;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    }
    .${STYLE_CLASS}:focus:not(:focus-visible) {
      box-shadow: none;
    }
    .${STYLE_CLASS}:focus-visible {
      outline: none;
      border-color: #666;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    }
  `;
    document.head.appendChild(style);
  }
  function extractGoodsPublishId() {
    const element = document.querySelector(TARGET_SELECTOR);
    if (!element) return null;
    const text = element.textContent?.trim();
    if (!text) return null;
    const match = text.match(/商品ID：(\d+)/);
    if (match && match[1]) return match[1];
    return null;
  }
  function getTargetElement() {
    return document.querySelector(TARGET_SELECTOR);
  }
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return fallbackCopyToClipboard(text);
    }
  }
  function fallbackCopyToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.setAttribute("aria-hidden", "true");
    document.body.appendChild(textarea);
    textarea.select();
    let success = false;
    try {
      success = document.execCommand("copy");
    } catch {
      success = false;
    }
    document.body.removeChild(textarea);
    return success;
  }
  function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 16px;
    background: #333;
    color: #fff;
    border-radius: 4px;
    z-index: 999999;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    animation: goodsIdToastFadeIn 0.2s ease;
  `;
    if (!document.getElementById("goods-id-toast-style")) {
      const style = document.createElement("style");
      style.id = "goods-id-toast-style";
      style.textContent = `
      @keyframes goodsIdToastFadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
      document.head.appendChild(style);
    }
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.2s ease";
      setTimeout(() => toast.remove(), 200);
    }, 1800);
  }
  function mountCopyButton(goodsId, container) {
    injectButtonStyles();
    const existingButton = container.querySelector(`.${STYLE_CLASS}`);
    if (existingButton) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = STYLE_CLASS;
    button.textContent = goodsId;
    button.setAttribute("aria-label", `复制商品ID: ${goodsId}`);
    button.addEventListener("click", handleButtonClick);
    container.appendChild(button);
  }
  async function handleButtonClick(event) {
    const button = event.currentTarget;
    const goodsId = button.textContent;
    if (!goodsId) return;
    const success = await copyToClipboard(goodsId);
    if (success) {
      showToast(`已复制: ${goodsId}`);
    } else {
      showToast("复制失败");
    }
  }
  function initAndMount() {
    const goodsId = extractGoodsPublishId();
    if (!goodsId) return false;
    const container = getTargetElement();
    if (!container) return false;
    mountCopyButton(goodsId, container);
    return true;
  }
  var TARGET_SELECTOR, STYLE_CLASS, STYLE_ID;
  var init_helper = __esm({
    "Tmall-GoodsPublishIdCopy/helper.ts"() {
      "use strict";
      TARGET_SELECTOR = "div[class^='infoContainer']>div[class^='title']>div[class^='subtitle']";
      STYLE_CLASS = "goods-id-copy-btn";
      STYLE_ID = "goods-id-copy-btn-style";
    }
  });

  // Tmall-GoodsPublishIdCopy/index.ts
  init_helper();
  console.log("商品提交页ID快速复制脚本已加载！");
  function waitForPageReady() {
    return new Promise((resolve) => {
      if (document.readyState === "complete") {
        resolve();
      } else {
        window.addEventListener("load", () => {
          resolve();
        });
      }
    });
  }
  async function waitForTargetElement(maxAttempts = 10, interval = 300) {
    const { getTargetElement: getTargetElement2 } = await Promise.resolve().then(() => (init_helper(), helper_exports));
    for (let i = 0; i < maxAttempts; i++) {
      const element = getTargetElement2();
      if (element) return true;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    return false;
  }
  async function init() {
    await waitForPageReady();
    const found = await waitForTargetElement();
    if (!found) {
      console.warn("未找到目标元素，脚本初始化失败");
      return;
    }
    const success = initAndMount();
    if (success) {
      console.log("商品ID复制按钮已挂载");
    } else {
      console.warn("商品ID提取失败");
    }
  }
  init();
})();
