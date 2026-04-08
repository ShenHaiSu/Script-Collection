import { initAndMount, showToast } from "./helper";

console.log("商品提交页ID快速复制脚本已加载！");

// #region 初始化

/**
 * 等待页面加载完成后执行
 */
function waitForPageReady(): Promise<void> {
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

/**
 * 等待目标元素出现
 * @param maxAttempts 最大尝试次数
 * @param interval 每次尝试间隔（毫秒）
 * @returns 是否成功找到目标元素
 */
async function waitForTargetElement(maxAttempts: number = 10, interval: number = 300): Promise<boolean> {
  const { getTargetElement } = await import("./helper");

  for (let i = 0; i < maxAttempts; i++) {
    const element = getTargetElement();
    if (element) return true;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return false;
}

/**
 * 初始化脚本
 */
async function init(): Promise<void> {
  // 等待页面加载完成
  await waitForPageReady();

  // 等待目标元素出现
  const found = await waitForTargetElement();

  if (!found) {
    console.warn("未找到目标元素，脚本初始化失败");
    return;
  }

  // 初始化并挂载按钮
  const success = initAndMount();

  if (success) {
    console.log("商品ID复制按钮已挂载");
  } else {
    console.warn("商品ID提取失败");
  }
}

// 启动初始化
init();

// #endregion
