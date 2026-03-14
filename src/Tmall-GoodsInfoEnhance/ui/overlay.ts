/**
 * 覆盖层组件 (overlay.ts)
 */
import { SELECTORS, parseProductId, copyToClipboard, store, getSkuItems } from "../helper";
import { STYLES } from "./styles";
import { refreshOverlayContent } from "./content";

/**
 * 创建并初始化覆盖层 UI
 * @returns 包含覆盖层元素和内容容器的对象
 */
export function createOverlay(): { overlay: HTMLDivElement; contentContainer: HTMLDivElement } {
  const overlay = document.createElement("div");
  overlay.className = SELECTORS.OVERLAY_CONTAINER_CLASS;
  overlay.style.cssText = STYLES.OVERLAY;

  const card = document.createElement("div");
  card.style.cssText = STYLES.CARD;

  // #region 关闭按钮
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  closeBtn.style.cssText = STYLES.CLOSE_BTN;
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
      { label: "颜色分类", data: (store.customColors || getSkuItems("颜色")).join("\n") || "未找到" },
      { label: "尺码/规格", data: (store.customSizes || getSkuItems("尺码")).join("\n") || "未找到" },
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

  return { overlay, contentContainer };
}

/**
 * 切换覆盖层显示状态
 * @param overlay 覆盖层元素
 * @param contentContainer 内容容器
 * @param show 是否显示 (可选)
 */
export function toggleOverlay(overlay: HTMLElement, contentContainer: HTMLElement, show?: boolean) {
  const isShowing = show !== undefined ? show : overlay.style.display !== "flex";

  if (isShowing) {
    refreshOverlayContent(contentContainer);
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden"; // 禁用页面滚动
  } else {
    overlay.style.display = "none";
    document.body.style.overflow = ""; // 恢复页面滚动
  }
}
