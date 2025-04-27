// ==UserScript==
// @name         HiFini-签到
// @namespace    DaoLuoLTS
// @author       DaoluoLTS
// @collaborator DaoluoLTS
// @copyright    2025, DaoLuoLTS (https://openuserjs.org/users/DaoLuoLTS)
// @homepageURL  https://github.com/ShenHaiSu/Script-Collection
// @supportURL   https://github.com/ShenHaiSu/Script-Collection/issues
// @version      1.0.0
// @description  在HiFiNi的签到页面自动完成签到
// @match        https://hifini.com/sg_sign.htm
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hifini.com
// @updateURL    https://github.com/ShenHaiSu/Script-Collection/raw/refs/heads/main/HiFiNi-AutoSign.build.user.js
// @license      MIT
// ==/UserScript==

(function () {
  const runtimeData = {
    timerFlag: null, // 定时器标志
  };

  runtimeData.timerFlag = setInterval(() => {
    const nodeList = Object.values(document.querySelectorAll("span#sg_sign>div#sign"));
    for (let i = 0; i < nodeList.length; i++) {
      const node = nodeList[i];
      if (node.innerText === "已签") continue;
      node.click();
      clearInterval(runtimeData.timerFlag);
    }
  }, 1000);
})();
