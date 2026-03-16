/**
 * 内部工具类与配置中心 (helper.ts)
 *
 * 作用：
 * 1. 存储全局选择器和常量配置。
 * 2. 提供通用的 DOM 操作和剪切板工具函数。
 * 3. 作为内部状态存储（Store）。
 */

// #region 配置与常量
/**
 * 页面选择器配置
 */
export const SELECTORS = {
  // SKU 属性组容器
  SKU_GROUPS: [
    ".sku-prop", // 淘宝
    ".tm-sku-prop", // 天猫
    ".sku-item-wrapper", // 其他变体
  ],
  // SKU 标题标签
  SKU_TITLE: ".sku-title, .tm-label",
  // SKU 项容器 (li 或 div)
  SKU_ITEM: "li, .sku-item",
  // SKU 项名称文本元素
  SKU_ITEM_NAME: ".sku-item-name, .sku-item-text, span, a",
  // 注入的复制按钮类名
  ENHANCED_BTN_CLASS: "copy-btn-enhanced",
  // 覆盖层容器类名
  OVERLAY_CONTAINER_CLASS: "goods-info-overlay-container",
  // 浮动触发按钮类名
  FLOATING_TRIGGER_CLASS: "goods-info-floating-trigger",
};

/**
 * 内部状态存储 (Store)
 */
export const store = {
  isUIInitialized: false,
  // 标记是否已初始化选中项（默认全选）
  isSelectionInitialized: false,
  // 记录选中的颜色和尺码
  selectedColors: [] as string[],
  selectedSizes: [] as string[],
  // 是否处于编辑模式
  isEditingColors: false,
  isEditingSizes: false,
  // 用户自定义的属性列表 (若已编辑)
  customColors: null as string[] | null,
  customSizes: null as string[] | null,
  // 可以根据需要扩展更多状态
};
// #endregion

// #region 工具函数
/**
 * 将文本推送到用户剪切板
 * @param text 要复制的文本
 */
export function copyToClipboard(text: string) {
  if (typeof GM_setClipboard !== "undefined") {
    GM_setClipboard(text, "text");
    console.log(`[Tmall-GoodsInfoEnhance] 已复制: ${text}`);
  } else {
    navigator.clipboard.writeText(text).then(() => {
      console.log(`[Tmall-GoodsInfoEnhance] 已复制: ${text}`);
    });
  }
}

/**
 * 从当前 URL 解析商品 ID
 * @returns 商品 ID 或 null
 */
export function parseProductId(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

/**
 * 获取指定类别的 SKU 项元素组
 * @param labelText 属性标签名（如 "颜色" 或 "尺码"）
 * @returns 包含 SKU 元素的属性组 HTMLElement
 */
export function getSkuPropGroup(labelText: string): HTMLElement | null {
  // #region 针对 detail.tmall.com 的新结构解析逻辑
  const tmallMainDivs = Array.from(document.querySelectorAll("div#skuOptionsArea > div"));
  for (const div of tmallMainDivs) {
    // 更加宽松的标题匹配：在第一个子容器中查找包含文本的 span
    const titleContainer = div.children[0];
    if (titleContainer) {
      const spans = Array.from(titleContainer.querySelectorAll("span"));
      const match = spans.find((s) => s.innerText.trim().includes(labelText));
      if (match) {
        return div as HTMLElement;
      }
    }
  }
  // #endregion

  // #region 原有通用逻辑（作为备选方案）
  for (const selector of SELECTORS.SKU_GROUPS) {
    const groups = document.querySelectorAll(selector);
    for (const group of Array.from(groups)) {
      const title = group.querySelector(SELECTORS.SKU_TITLE)?.textContent || "";
      if (title.includes(labelText)) {
        return group as HTMLElement;
      }
    }
  }
  // #endregion

  return null;
}

/**
 * 获取指定 SKU 属性项的名称列表
 * @param labelText 属性标签名
 * @returns SKU 名称数组
 */
export function getSkuItems(labelText: string): string[] {
  const group = getSkuPropGroup(labelText);
  if (!group) return [];

  // #region 针对 detail.tmall.com 的新结构提取逻辑
  if (group.parentElement?.id === "skuOptionsArea") {
    const itemsContainer = group.children[1];
    if (itemsContainer) {
      // 颜色分类通常有图片，其 span 可能不是第一个子元素，或者第一个 span 是空的背景图
      // 我们寻找 itemsContainer 下所有带有文本内容的 span
      const allSpans = Array.from(itemsContainer.querySelectorAll("span"));
      const names = allSpans.map((span) => (span as HTMLElement).innerText.trim()).filter((text) => text.length > 0);
      return Array.from(new Set(names));
    }
  }
  // #endregion

  // #region 原有通用逻辑
  const items = Array.from(group.querySelectorAll(SELECTORS.SKU_ITEM_NAME))
    .map((el) => el.textContent?.trim())
    .filter((text): text is string => !!text && text.length > 0);

  return Array.from(new Set(items));
  // #endregion
}

/**
 * 通用的 SKU 名称复制逻辑
 * @param labelText 属性标签名
 */
export function copySkuByLabel(labelText: string) {
  const items = getSkuItems(labelText);
  if (items.length > 0) {
    copyToClipboard(items.join("\n"));
  } else {
    console.warn(`[Tmall-GoodsInfoEnhance] 未找到 ${labelText} 属性`);
  }
}
// #endregion
