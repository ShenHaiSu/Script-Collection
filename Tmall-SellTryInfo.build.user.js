// ==UserScript==
// @name         天猫千牛店铺新品试销信息自动获取
// @version      2026.03.14.17.08.38
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

  // Tmall-SellTryInfo/index.ts
  var DEBUG_MODE = true;
  async function handleGetInfo() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.zIndex = "9999";
    overlay.style.cursor = "not-allowed";
    overlay.id = "script-overlay";
    document.body.appendChild(overlay);
    try {
      try {
        await navigator.clipboard.readText();
      } catch (err) {
        console.log("正在请求剪切板权限...", err);
        await navigator.clipboard.readText().catch(() => {
          alert("请授予剪切板访问权限以继续执行脚本");
          throw new Error("Clipboard permission denied");
        });
      }
      const tbody = document.querySelector("table > tbody");
      if (!tbody) {
        alert("未找到表格数据 (table > tbody)");
        return;
      }
      let trs = Array.from(tbody.querySelectorAll("tr[data-row-key]"));
      if (trs.length === 0) {
        alert("未找到有效的商品行数据");
        return;
      }
      if (DEBUG_MODE) {
        console.warn("当前处于 DEBUG 模式，仅处理前 2 条数据");
        trs = trs.slice(0, 2);
      }
      dataStore.clear();
      for (const tr of trs) {
        const firstTd = tr.querySelector("td");
        const img = firstTd?.querySelector("img");
        const imgUrl = img?.src || "";
        const tds = tr.querySelectorAll("td");
        const lastTd = tds[tds.length - 1];
        const actionButton = lastTd?.querySelector("button");
        if (!actionButton) continue;
        actionButton.click();
        await sleep(1e3);
        const tabs = document.querySelectorAll("div.tbd-tabs-nav-wrap div[data-node-key='item']");
        if (tabs.length > 0) {
          tabs[0].click();
          await sleep(800);
        }
        const drawerDivs = document.querySelectorAll(
          "div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body > div"
        );
        if (drawerDivs.length > 0) {
          const lastDiv = drawerDivs[drawerDivs.length - 1];
          const firstButtonInLastDiv = lastDiv.querySelector("button");
          if (firstButtonInLastDiv) {
            firstButtonInLastDiv.click();
            await sleep(800);
          }
        }
        const confirmContent = document.querySelector("div.tbd-modal-confirm-paragraph > div.tbd-modal-confirm-content");
        const text = confirmContent?.innerText || "";
        dataStore.add({ imgUrl, text });
        const confirmBtns = document.querySelector("div.tbd-modal-confirm-btns > button");
        if (confirmBtns) {
          confirmBtns.click();
          await sleep(800);
        }
        const drawerBody = document.querySelector("div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body");
        if (drawerBody) {
          const buttons = drawerBody.querySelectorAll("button");
          if (buttons.length >= 2) {
            buttons[1].click();
            await sleep(800);
          }
        }
      }
      console.log("获取到的所有信息：", dataStore.getAll());
      alert("信息获取完成，请查看控制台输出。");
    } catch (error) {
      console.error("执行过程中发生错误:", error);
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
    targetDiv.insertBefore(button, targetDiv.firstChild);
    button.onclick = async () => {
      await handleGetInfo();
    };
  }
  function main() {
    console.log("天猫千牛店铺新品试销信息自动获取脚本已启动");
    initScript();
  }
  main();
})();
