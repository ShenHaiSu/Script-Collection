/**
 * 商品编码展示与复制组件 (itemCodeDisplay.ts)
 * 用于在子订单行中展示商品编码并提供复制功能
 */
import { STYLES } from "./styles";

/**
 * 商品编码信息
 */
export interface ItemCodeInfo {
  /** 商品编码 (itemId) */
  itemId: string | number;
  /** 所属父订单索引 */
  parentOrderIndex: number;
  /** 子订单在父订单中的索引 */
  itemIndex: number;
  /** 对应的 tr 元素 */
  trElement: HTMLTableRowElement;
}

/**
 * 创建商品编码展示和复制按钮的样式
 */
const ITEM_CODE_STYLES = {
  CONTAINER: `
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    padding: 6px 8px;
    background: #f5f5f5;
    border-radius: 4px;
    font-size: 12px;
  `,
  // 当没有商家编码时使用的inline-block样式
  CONTAINER_INLINE: `
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-left: 8px;
    padding: 2px 6px;
    background: #f5f5f5;
    border-radius: 3px;
    font-size: 12px;
    vertical-align: middle;
  `,
  LABEL: `
    color: #666;
    white-space: nowrap;
  `,
  VALUE: `
    color: #333;
    font-weight: 500;
    font-family: monospace;
  `,
  COPY_BTN: `
    padding: 2px 8px;
    background: #ff5000;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
    transition: background 0.2s;
  `,
  COPY_BTN_HOVER: `
    background: #ff6a00;
  `,
  COPY_SUCCESS: `
    background: #52c41a;
  `,
};

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

/**
 * 创建商品编码展示和复制按钮
 * @param itemCodeInfo 商品编码信息
 * @returns 创建的容器元素
 */
export function createItemCodeDisplay(itemCodeInfo: ItemCodeInfo): HTMLDivElement {
  const { itemId, trElement } = itemCodeInfo;

  // 创建容器
  const container = document.createElement("div");
  container.className = "tmall-order-enhance-item-code";
  // 样式将在挂载时根据是否有商家编码来确定

  // 创建标签
  const label = document.createElement("span");
  label.className = "tmall-order-enhance-item-code-label";
  label.style.cssText = ITEM_CODE_STYLES.LABEL;
  label.textContent = "商品编码:";

  // 创建编码值
  const value = document.createElement("span");
  value.className = "tmall-order-enhance-item-code-value";
  value.style.cssText = ITEM_CODE_STYLES.VALUE;
  value.textContent = String(itemId);

  // 创建复制按钮
  const copyBtn = document.createElement("button");
  copyBtn.className = "tmall-order-enhance-item-code-copy-btn";
  copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN;
  copyBtn.textContent = "复制";

  // 复制按钮点击事件
  copyBtn.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const textToCopy = String(itemId);
    const success = await copyToClipboard(textToCopy);

    if (success) {
      // 显示复制成功状态
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "已复制";
      copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN + ITEM_CODE_STYLES.COPY_SUCCESS;

      // 2秒后恢复
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN;
      }, 2000);
    } else {
      // 复制失败
      copyBtn.textContent = "复制失败";
      setTimeout(() => {
        copyBtn.textContent = "复制";
      }, 2000);
    }
  };

  // 复制按钮悬停效果
  copyBtn.onmouseenter = () => {
    if (copyBtn.textContent === "复制") {
      copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN + ITEM_CODE_STYLES.COPY_BTN_HOVER;
    }
  };
  copyBtn.onmouseleave = () => {
    if (copyBtn.textContent === "复制") {
      copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN;
    }
  };

  // 组装元素
  container.appendChild(label);
  container.appendChild(value);
  container.appendChild(copyBtn);

  // 将容器插入到 tr 中的合适位置
  // 使用纯HTML元素结构作为锚点，不依赖可能变化的类名
  // 查找包含"商家编码："文本的div，将商品编码追加到该div内部
  
  const firstTd = trElement.querySelector("td");
  if (firstTd) {
    // 查找 td 下的第一个 div (next-table-cell-wrapper)
    const wrapper = firstTd.querySelector(":scope > div");
    if (wrapper) {
      // 查找 wrapper 下的第一个 div (商品信息容器)
      const productContainer = wrapper.querySelector(":scope > div");
      if (productContainer) {
        // 优先查找包含"商家编码："文本的div
        // 使用文本内容查找，不依赖类名
        const sellerCodeElement = Array.from(productContainer.querySelectorAll("div")).find(
          (div) => div.textContent && div.textContent.includes("商家编码：")
        );
        
        if (sellerCodeElement) {
          // 商家编码存在，将商品编码追加到该div内部（作为子元素）
          // 使用默认的 block 样式
          container.style.cssText = ITEM_CODE_STYLES.CONTAINER;
          sellerCodeElement.appendChild(container);
        } else {
          // 商家编码不存在，使用 inline-block 样式并添加到商品信息容器内的最后
          container.style.cssText = ITEM_CODE_STYLES.CONTAINER_INLINE;
          
          const lastDiv = productContainer.querySelector(":scope > div:last-child");
          if (lastDiv) {
            lastDiv.parentNode?.insertBefore(container, lastDiv.nextSibling);
          } else {
            productContainer.lastChild?.appendChild(container);
          }
        }
      } else {
        // 如果没有找到商品信息容器，直接添加到 wrapper
        container.style.cssText = ITEM_CODE_STYLES.CONTAINER_INLINE;
        wrapper.appendChild(container);
      }
    } else {
      container.style.cssText = ITEM_CODE_STYLES.CONTAINER_INLINE;
      firstTd.appendChild(container);
    }
  } else {
    container.style.cssText = ITEM_CODE_STYLES.CONTAINER_INLINE;
    trElement.appendChild(container);
  }

  console.log(`商品编码展示已添加到子订单 (商品编码: ${itemId})`);

  return container;
}

/**
 * 批量创建商品编码展示
 * @param itemCodes 商品编码信息列表
 */
export function createItemCodeDisplays(itemCodes: ItemCodeInfo[]): void {
  itemCodes.forEach((itemCodeInfo) => {
    createItemCodeDisplay(itemCodeInfo);
  });
}

/**
 * 移除所有商品编码展示
 */
export function removeAllItemCodeDisplays(): void {
  const displays = document.querySelectorAll(".tmall-order-enhance-item-code");
  displays.forEach((display) => {
    display.remove();
  });
  console.log("已移除所有商品编码展示");
}