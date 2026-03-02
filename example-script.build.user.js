// ==UserScript==
// @name         功能演示示例脚本 (Full Demo Script)
// @version      0.1.2
// @description  这是一个综合演示脚本，展示了如何通过 meta.ts 配置各种常用的油猴脚本头部标签。
// @author       Developer_Name
// @match        https://example.com/*
// @match        https://*.google.com/*
// @match        https://github.com/*
// @namespace    https://github.com/ShenHaiSu/Script-Collection
// @icon         https://www.google.com/s2/favicons?sz=64&domain=example.com
// @exclude      https://example.com/login
// @exclude      https://example.com/logout
// @require      https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/dayjs@1.11.0/dayjs.min.js
// @resource     MY_CSS https://example.com/style.css
// @resource     LOGO_IMG https://example.com/logo.png
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @connect      api.example.com
// @connect      bing.com
// @run-at       document-end
// @noframes     
// @supportURL   https://github.com/ShenHaiSu/Script-Collection/issues
// ==/UserScript==

"use strict";
(() => {
  // example-script/helper.ts
  function sayWelcome(name) {
    console.log(`Welcome, ${name}! This message is from helper.ts.`);
  }

  // example-script/index.ts
  console.log("Hello from Example Script!");
  function greet(name) {
    console.log(`Greetings, ${name}!`);
  }
  greet("Tampermonkey User");
  sayWelcome("Developer");
})();
