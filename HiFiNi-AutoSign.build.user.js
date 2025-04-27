// ==UserScript==
// @name         HiFini-签到
// @namespace    DaoLuoLTS
// @author       DaoluoLTS
// @collaborator DaoluoLTS
// @copyright    2025, DaoLuoLTS (https://openuserjs.org/users/DaoLuoLTS)
// @homepageURL  https://github.com/ShenHaiSu/Script-Collection
// @supportURL   https://github.com/ShenHaiSu/Script-Collection/issues
// @version      1.0.1
// @description  在HiFiNi的签到页面自动完成签到
// @match        https://hifini.com/sg_sign.htm
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hifini.com
// @updateURL    https://github.com/ShenHaiSu/Script-Collection/raw/refs/heads/main/HiFiNi-AutoSign.build.user.js
// @license      MIT
// ==/UserScript==

/**
 * HiFiNi 自动签到脚本
 * @namespace HiFiniAutoSign
 */
(function () {
  /**
   * 运行时数据对象
   * @type {Object}
   * @property {number|null} timerFlag 定时器标志，用于清除定时器
   */
  const runtimeData = {
    timerFlag: null,
  };

  /**
   * 检查并执行签到操作
   */
  function checkAndSign() {
    try {
      // 获取签到按钮节点列表
      const nodeList = Array.from(document.querySelectorAll("span#sg_sign > div#sign"));
      for (const node of nodeList) {
        if (node.innerText === "已签") continue;
        node.click();
        clearInterval(runtimeData.timerFlag);
        console.log("签到成功！");
        return;
      }
    } catch (error) {
      console.error("签到时发生错误:", error);
    }
  }

  // 设置定时器，每秒检查一次
  runtimeData.timerFlag = setInterval(checkAndSign, 1000);

  // 添加页面卸载事件，确保定时器被清除
  window.addEventListener("beforeunload", () => {
    if (runtimeData.timerFlag) clearInterval(runtimeData.timerFlag);
  });
})();
