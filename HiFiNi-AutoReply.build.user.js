// ==UserScript==
// @name         Hifini 半自动回复内容
// @namespace    DaoLuoLTS
// @author       DaoluoLTS
// @collaborator DaoluoLTS
// @copyright    2025, DaoLuoLTS (https://openuserjs.org/users/DaoLuoLTS)
// @homepageURL  https://github.com/ShenHaiSu/Script-Collection
// @supportURL   https://github.com/ShenHaiSu/Script-Collection/issues
// @version      1.0.1
// @description  在HiFiNi的主题界面点击按钮自动回帖
// @match        https://hifini.com/thread-*.htm
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hifini.com
// @updateURL    https://github.com/ShenHaiSu/Script-Collection/raw/refs/heads/main/HiFiNi-AutoReply.build.user.js
// @license      MIT
// ==/UserScript==

(function () {
  /**
   * 文本库，包含自动回复的预设文本内容。
   * @type {string[]}
   */
  const textLibrary = [
    "感谢楼主的分享，内容很有意思！",
    "感谢分享！",
    "楼主分享的内容太棒了，很给力！",
    "这分享的内容真是好用，很强！",
    "谢谢楼主的详细分享！",
    "必须点赞，支持楼主的精彩分享！",
    "楼主的分享太厉害了，太牛了！",
    "分享得非常完美，感谢感谢！",
    "感谢大佬的分享，太感谢了！",
    "必须顶起来，让更多人看到这么好的分享！",
  ];

  /**
   * 运行时数据存储对象。
   * @type {{ timerFlag: number | null }}
   */
  const runtimeData = {
    timerFlag: null, // 定时器标志
  };

  /**
   * 定时器主体，用于检测当前网页是否已经挂载了自动回复按钮。
   * 持续检测直到成功挂载按钮
   */
  runtimeData.timerFlag = setInterval(() => {
    try {
      const checkResult = document.querySelector("div.col-lg-3.d-none.d-lg-block.aside>a[dl-name]");
      if (!checkResult) {
        mountAutoReplyButton();
      } else {
        clearInterval(runtimeData.timerFlag);
      }
    } catch (error) {
      console.error('自动回复脚本错误:', error);
    }
  }, 500);

  /**
   * 挂载自动回复按钮到页面的指定位置。
   */
  function mountAutoReplyButton() {
    // 缓存常用选择器
    const parentSelector = "div.col-lg-3.d-none.d-lg-block.aside";
    const prevNodeSelector = "a";
    
    try {
      /**
       * 目标父节点，用于挂载按钮。
       * @type {HTMLElement | null}
       */
      const targetParentNode = document.querySelector(parentSelector);
      if (!targetParentNode) return;

      /**
       * 按钮挂载位置的参考节点。
       * @type {HTMLElement | null}
       */
      const targetPrevNode = targetParentNode.querySelector(prevNodeSelector);

      // 创建新的按钮节点
      const newNode = document.createElement("a");
      newNode.setAttribute("class", "btn btn-primary btn-block mb-3 text-white");
      newNode.setAttribute("dl-name", "replyButton");
      newNode.setAttribute("role", "button");
      newNode.innerText = "自动回复帖子";

      // 挂载按钮
      targetParentNode.insertBefore(newNode, targetPrevNode);

      // 绑定点击事件
      newNode.addEventListener("click", () => handleButtonClick());
    } catch (error) {
      console.error('挂载自动回复按钮错误:', error);
    }
  }

  /**
   * 自动回复按钮的点击事件处理函数。
   */
  function handleButtonClick() {
    try {
      // 缓存常用选择器
      const textareaSelector = "div.message.mt-1>textarea";
      const submitButtonSelector = "div>button[type='submit'][id=submit]";
      
      /**
       * 获取当前输入框节点。
       * @type {HTMLTextAreaElement | null}
       */
      const textareaNode = document.querySelector(textareaSelector);
      if (!textareaNode) return;

      // 随机选择一条文本，填充到输入框
      const randomText = textLibrary[Math.floor(Math.random() * textLibrary.length)];
      textareaNode.value = randomText;

      /**
       * 提交回帖按钮节点。
       * @type {HTMLButtonElement | null}
       */
      const submitButton = document.querySelector(submitButtonSelector);
      if (submitButton) submitButton.click();
    } catch (error) {
      console.error('自动回复按钮点击错误:', error);
    }
  }
})();
