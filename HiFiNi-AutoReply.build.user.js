// ==UserScript==
// @name         Hifini 半自动回复内容
// @namespace    http://tampermonkey.net/
// @version      2025-04-27
// @description  try to take over the world!
// @author       You
// @match        https://hifini.com/thread-256032.htm
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hifini.com
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  // 文本库
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

  // 运行时数据存储
  const runtimeData = {
    timerFlag: null, // 定时器标志
  };

  // 定时器主体，用于检测当前网页是否已经挂载了自动回复按钮
  runtimeData.timerFlag = setInterval(() => {
    const checkResult = document.querySelector("div.col-lg-3.d-none.d-lg-block.aside>a[dl-name]");
    if (!checkResult) mountAutoReplyButton();
    clearInterval(runtimeData.timerFlag);
  }, 500);

  // 挂载自动回复按钮
  function mountAutoReplyButton() {
    // 初始化构建
    const targetParentNode = document.querySelector("div.col-lg-3.d-none.d-lg-block.aside");
    const targetPrevNode = targetParentNode.querySelector("a");
    const newNode = document.createElement("a");
    newNode.setAttribute("class", "btn btn-primary btn-block mb-3 text-white");
    newNode.setAttribute("dl-name", "replyButton");
    newNode.setAttribute("role", "button");
    newNode.innerText = "自动回复帖子"

    // 挂载按钮
    targetParentNode.insertBefore(newNode, targetPrevNode);

    // 绑定点击事件
    newNode.addEventListener("click", () => handleButtonClick());
  }

  // 按钮点击事件处理函数
  function handleButtonClick() {
    // 获取当前输入框
    const textareaNode = document.querySelector("div.message.mt-1>textarea");
    if (!textareaNode) return;

    // 随机选择一条文本,填充文本到输入框
    const randomText = textLibrary[Math.floor(Math.random() * textLibrary.length)];
    textareaNode.value = randomText;

    // 提交回帖按钮
    document.querySelector("div>button[type='submit'][id=submit]").click();
  }
})();
