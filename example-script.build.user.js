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
// @connect      api.github.com
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

  // dev-tool/gmFetch.ts
  function gmFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      if (typeof GM_xmlhttpRequest === "undefined") {
        reject(new Error("GM_xmlhttpRequest is not defined. Are you running in a Userscript environment?"));
        return;
      }
      GM_xmlhttpRequest({
        method: options.method || "GET",
        url,
        headers: options.headers,
        data: options.body,
        ...options,
        onload: (response) => {
          const gmResponse = {
            ok: response.status >= 200 && response.status < 300,
            status: response.status,
            statusText: response.statusText,
            data: response.response,
            responseText: response.responseText,
            responseHeaders: response.responseHeaders,
            finalUrl: response.finalUrl,
            json: () => {
              try {
                return JSON.parse(response.responseText);
              } catch (e) {
                throw new Error("Failed to parse response as JSON");
              }
            }
          };
          resolve(gmResponse);
        },
        onerror: (error) => {
          reject(error);
        },
        onabort: () => {
          reject(new Error("Request aborted"));
        },
        ontimeout: () => {
          reject(new Error("Request timeout"));
        }
      });
    });
  }

  // example-script/index.ts
  console.log("Hello from Example Script!");
  function greet(name) {
    console.log(`Greetings, ${name}!`);
  }
  async function fetchGithubRepo() {
    try {
      const response = await gmFetch("https://api.github.com/repos/ShenHaiSu/Script-Collection");
      if (response.ok) {
        const data = response.json();
        console.log("GitHub 仓库信息:", data);
      } else {
        console.error("请求失败:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("请求异常:", error);
    }
  }
  greet("Tampermonkey User");
  sayWelcome("Developer");
  fetchGithubRepo();
})();
