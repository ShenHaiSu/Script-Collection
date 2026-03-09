/**
 * 页面 UI 增强逻辑 (uiEnhance.ts)
 */
import { SELECTORS, copyToClipboard, store, getSkuItems, parseProductId } from "./helper";

// #region 样式常量
const STYLES = {
  OVERLAY: `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 99999;
    display: none;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(5px);
    transition: opacity 0.3s;
  `,
  CARD: `
    background: #fff;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    width: 80%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  `,
  CLOSE_BTN: `
    position: absolute;
    top: 12px;
    right: 12px;
    cursor: pointer;
    font-size: 24px;
    color: #999;
    border: none;
    background: transparent;
    line-height: 1;
  `,
  TITLE: `
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: bold;
    color: #333;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
  `,
  SECTION: `
    margin-bottom: 24px;
    padding: 16px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #eee;
  `,
  SECTION_TITLE: `
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #444;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  INFO_CONTENT: `
    font-size: 14px;
    color: #666;
    word-break: break-all;
    white-space: pre-wrap;
    max-height: 150px;
    overflow-y: auto;
    background: #fff;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  `,
  ITEM_CHIP_CONTAINER: `
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px;
  `,
  ITEM_CHIP: `
    padding: 6px 12px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
  `,
  COPY_BTN: `
    background: #ff5000;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
  `,
  FLOATING_BTN: `
    position: fixed;
    right: 20px;
    bottom: 80px;
    width: 56px;
    height: 56px;
    background: #ff5000;
    color: white;
    border-radius: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(255, 80, 0, 0.4);
    z-index: 99998;
    font-size: 24px;
    transition: transform 0.2s, background 0.2s;
  `,
};
// #endregion

/**
 * 创建并初始化覆盖层 UI
 */
function createOverlay(): HTMLDivElement {
  const overlay = document.createElement("div");
  overlay.className = SELECTORS.OVERLAY_CONTAINER_CLASS;
  overlay.style.cssText = STYLES.OVERLAY;

  const card = document.createElement("div");
  card.style.cssText = STYLES.CARD;

  // #region 关闭按钮
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  closeBtn.style.cssText = STYLES.CLOSE_BTN;
  closeBtn.onclick = () => (overlay.style.display = "none");
  card.appendChild(closeBtn);
  // #endregion

  // #region 标题
  const titleRow = document.createElement("div");
  titleRow.style.cssText = STYLES.TITLE + "display: flex; justify-content: space-between; align-items: center; padding-right: 40px;";

  const titleText = document.createElement("span");
  titleText.innerText = "📦 商品信息获取增强";
  titleRow.appendChild(titleText);

  const copyAllBtn = document.createElement("button");
  copyAllBtn.innerText = "全部复制";
  copyAllBtn.style.cssText = STYLES.COPY_BTN + "background: #333;";
  copyAllBtn.onclick = () => {
    const dataItems = [
      { label: "商品 ID", data: parseProductId() || "未找到" },
      { label: "颜色分类", data: getSkuItems("颜色").join("\n") || "未找到" },
      { label: "尺码/规格", data: getSkuItems("尺码").join("\n") || "未找到" },
    ];
    const allText = dataItems.map((item) => `【${item.label}】\n${item.data}`).join("\n\n");
    copyToClipboard(allText);
  };
  titleRow.appendChild(copyAllBtn);

  card.appendChild(titleRow);
  // #endregion

  // #region 信息区块容器
  const contentContainer = document.createElement("div");
  card.appendChild(contentContainer);
  // #endregion

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // 点击背景关闭
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.style.display = "none";
  };

  return overlay;
}

/**
 * 刷新覆盖层中的数据内容
 * @param container 放置内容的容器
 */
function refreshOverlayContent(container: HTMLElement) {
  container.innerHTML = "";

  // 定义要展示的数据项
  const dataItems = [
    { label: "商品 ID", getData: () => parseProductId() || "未找到" },
    { label: "颜色分类", getData: () => getSkuItems("颜色") },
    { label: "尺码/规格", getData: () => getSkuItems("尺码") },
  ];

  dataItems.forEach((item) => {
    const section = document.createElement("div");
    section.style.cssText = STYLES.SECTION;

    const titleRow = document.createElement("div");
    titleRow.style.cssText = STYLES.SECTION_TITLE;

    const labelSpan = document.createElement("span");
    labelSpan.innerText = item.label;
    titleRow.appendChild(labelSpan);

    const rawData = item.getData();
    const isArray = Array.isArray(rawData);
    const bulkText = isArray ? (rawData as string[]).join("\n") : (rawData as string);

    // 复制全部按钮
    const copyBtn = document.createElement("button");
    copyBtn.innerText = isArray ? "全部复制" : "复制";
    copyBtn.style.cssText = STYLES.COPY_BTN;
    copyBtn.onmouseenter = () => (copyBtn.style.background = "#e64500");
    copyBtn.onmouseleave = () => (copyBtn.style.background = "#ff5000");
    copyBtn.onclick = () => copyToClipboard(bulkText);
    titleRow.appendChild(copyBtn);

    section.appendChild(titleRow);

    if (isArray && (rawData as string[]).length > 0) {
      // 渲染为按钮组
      const chipContainer = document.createElement("div");
      chipContainer.style.cssText = STYLES.ITEM_CHIP_CONTAINER;

      (rawData as string[]).forEach((text) => {
        const chip = document.createElement("div");
        chip.innerText = text;
        chip.style.cssText = STYLES.ITEM_CHIP;
        chip.title = "点击复制该项";

        chip.onmouseenter = () => {
          chip.style.borderColor = "#ff5000";
          chip.style.color = "#ff5000";
        };
        chip.onmouseleave = () => {
          chip.style.borderColor = "#ddd";
          chip.style.color = "#333";
        };
        chip.onclick = () => copyToClipboard(text);

        chipContainer.appendChild(chip);
      });
      section.appendChild(chipContainer);
    } else {
      // 渲染为普通文本
      const infoBox = document.createElement("div");
      infoBox.style.cssText = STYLES.INFO_CONTENT;
      infoBox.innerText = bulkText || "未找到";
      section.appendChild(infoBox);
    }

    container.appendChild(section);
  });
}

/**
 * 创建浮动触发按钮
 */
function createFloatingTrigger(onToggle: () => void) {
  const btn = document.createElement("div");
  btn.className = SELECTORS.FLOATING_TRIGGER_CLASS;
  btn.innerHTML = "📋";
  btn.title = "打开商品信息面板";
  btn.style.cssText = STYLES.FLOATING_BTN;

  btn.onmouseenter = () => (btn.style.transform = "scale(1.1)");
  btn.onmouseleave = () => (btn.style.transform = "scale(1)");
  btn.onclick = onToggle;

  document.body.appendChild(btn);
}

/**
 * 脚本初始化增强逻辑
 */
export function initUIEnhance() {
  if (store.isUIInitialized) return;

  console.log("[Tmall-GoodsInfoEnhance] 页面 UI 增强 (Overlay) 初始化...");

  const overlay = createOverlay();
  const contentContainer = overlay.querySelector("div > div:last-child") as HTMLElement;

  const toggleOverlay = () => {
    if (overlay.style.display === "flex") {
      overlay.style.display = "none";
    } else {
      refreshOverlayContent(contentContainer);
      overlay.style.display = "flex";
    }
  };

  // 注册浮动按钮点击事件
  createFloatingTrigger(toggleOverlay);

  // #region 注册快捷键监听
  /**
   * 监听 Alt + Q 组合键以切换面板状态
   */
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    // 检查是否按下 Alt + Q
    if (e.altKey && e.code === "KeyQ") {
      e.preventDefault();
      toggleOverlay();
    }
  });
  // #endregion

  store.isUIInitialized = true;
}
