// #region 常量定义

/** 目标选择器 */
const TARGET_SELECTOR = "div[class^='infoContainer']>div[class^='title']>div[class^='subtitle']";

/** 样式类名 */
const STYLE_CLASS = "goods-id-copy-btn";

/** 样式ID */
const STYLE_ID = "goods-id-copy-btn-style";

// #endregion

// #region 样式管理

/**
 * 注入按钮样式
 */
function injectButtonStyles(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .${STYLE_CLASS} {
      display: inline-block;
      margin-top: 6px;
      padding: 4px 10px;
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-weight: 500;
      color: #333;
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
      line-height: 1.4;
    }
    .${STYLE_CLASS}:hover {
      background: #fff;
      border-color: #999;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    .${STYLE_CLASS}:active {
      background: #eee;
      border-color: #888;
      transform: scale(0.98);
    }
    .${STYLE_CLASS}:focus {
      outline: none;
      border-color: #666;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    }
    .${STYLE_CLASS}:focus:not(:focus-visible) {
      box-shadow: none;
    }
    .${STYLE_CLASS}:focus-visible {
      outline: none;
      border-color: #666;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    }
  `;
  document.head.appendChild(style);
}

// #endregion

// #region 商品ID解析

/**
 * 从页面中提取商品发布ID
 * @returns 商品发布ID，如果未找到则返回 null
 */
export function extractGoodsPublishId(): string | null {
  const element = document.querySelector<HTMLElement>(TARGET_SELECTOR);

  if (!element) return null;

  const text = element.textContent?.trim();

  if (!text) return null;

  // 从字符串中提取纯数字的商品ID
  // 格式：商品ID：1033120876357，您可以在商品列表中根据商品ID搜索找到该商品。
  const match = text.match(/商品ID：(\d+)/);

  if (match && match[1]) return match[1];

  return null;
}

/**
 * 获取目标元素
 * @returns 目标元素，如果未找到则返回 null
 */
export function getTargetElement(): HTMLElement | null {
  return document.querySelector<HTMLElement>(TARGET_SELECTOR);
}

// #endregion

// #region 剪贴板操作

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 兼容旧版浏览器
    return fallbackCopyToClipboard(text);
  }
}

/**
 * 兼容旧版浏览器的复制方法
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
function fallbackCopyToClipboard(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.setAttribute("aria-hidden", "true");
  document.body.appendChild(textarea);
  textarea.select();

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  }

  document.body.removeChild(textarea);
  return success;
}

// #endregion

// #region 提示消息

/**
 * 显示提示消息
 * @param message 消息内容
 */
export function showToast(message: string): void {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 16px;
    background: #333;
    color: #fff;
    border-radius: 4px;
    z-index: 999999;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    animation: goodsIdToastFadeIn 0.2s ease;
  `;

  // 添加动画样式（如果尚未添加）
  if (!document.getElementById("goods-id-toast-style")) {
    const style = document.createElement("style");
    style.id = "goods-id-toast-style";
    style.textContent = `
      @keyframes goodsIdToastFadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.2s ease";
    setTimeout(() => toast.remove(), 200);
  }, 1800);
}

// #endregion

// #region 按钮创建

/**
 * 创建并挂载复制按钮
 * @param goodsId 商品ID
 * @param container 目标容器元素
 */
export function mountCopyButton(goodsId: string, container: HTMLElement): void {
  // 注入样式
  injectButtonStyles();

  // 检查是否已存在按钮
  const existingButton = container.querySelector(`.${STYLE_CLASS}`);
  if (existingButton) return;

  // 创建按钮
  const button = document.createElement("button");
  button.type = "button";
  button.className = STYLE_CLASS;
  button.textContent = goodsId;
  button.setAttribute("aria-label", `复制商品ID: ${goodsId}`);

  // 绑定点击事件
  button.addEventListener("click", handleButtonClick);

  // 追加到容器最后
  container.appendChild(button);
}

/**
 * 处理按钮点击事件
 * @param event 点击事件
 */
async function handleButtonClick(event: Event): Promise<void> {
  const button = event.currentTarget as HTMLButtonElement;
  const goodsId = button.textContent;

  if (!goodsId) return;

  const success = await copyToClipboard(goodsId);

  if (success) {
    showToast(`已复制: ${goodsId}`);
  } else {
    showToast("复制失败");
  }
}

// #endregion

// #region 初始化

/**
 * 初始化并挂载按钮
 * @returns 是否成功挂载
 */
export function initAndMount(): boolean {
  const goodsId = extractGoodsPublishId();

  if (!goodsId) return false;

  const container = getTargetElement();

  if (!container) return false;

  mountCopyButton(goodsId, container);
  return true;
}

// #endregion
