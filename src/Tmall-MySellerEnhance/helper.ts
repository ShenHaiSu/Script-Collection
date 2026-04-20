/**
 * 天猫后台订单信息增强脚本 - 辅助工具函数
 * 包含通用的工具函数，供各个 action 和 UI 组件使用
 */

// #region 工具函数

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // 使用 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // 兼容旧版浏览器
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const result = document.execCommand("copy");
    document.body.removeChild(textArea);
    return result;
  } catch (error) {
    console.error("复制到剪贴板失败:", error);
    return false;
  }
}

// #endregion
