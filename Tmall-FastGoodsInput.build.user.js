// ==UserScript==
// @name         天猫商品详情交互增强插件 (FastGoodsInput)
// @version      2026.03.02.19.35.58
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

  // Tmall-FastGoodsInput/index.ts
  var featureRegistry = {
    cateLabelLarge: {
      enabled: true,
      // 默认开启
      init: initCateLabelLarge,
      description: "类目文本标签点击自动勾选增强"
    }
    // 后续可以在此处注册新的特性模块
    /*
    anotherFeature: {
      enabled: false,
      init: initAnotherFeature,
      description: '示例扩展特性',
    }
    */
  };
  function bootstrap() {
    console.log("[Tmall-FastGoodsInput] 脚本初始化中...");
    Object.entries(featureRegistry).forEach(([key, config]) => {
      if (config.enabled) {
        try {
          config.init();
          console.log(`[Tmall-FastGoodsInput] 特性 [${key}] (${config.description}) 已成功启动`);
        } catch (error) {
          console.error(`[Tmall-FastGoodsInput] 特性 [${key}] 启动失败:`, error);
        }
      }
    });
  }
  bootstrap();
})();
