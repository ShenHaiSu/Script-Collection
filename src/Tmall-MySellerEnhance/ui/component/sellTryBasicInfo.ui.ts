/**
 * 新品试销基本信息 UI 组件
 * 用于构建采集结果的展示界面
 */

import { copyToClipboard } from "@/Tmall-MySellerEnhance/helper";

/**
 * 采集结果数据类型
 */
export interface SellTryBasicInfoResult {
  /** 商品图片 URL */
  imgUrl: string;
  /** 商品 ID */
  itemId: string;
  /** 商品名称 */
  itemName: string;
}

/**
 * 进度更新回调函数类型
 */
export type BasicInfoProgressUpdateCallback = (
  pageCurrent: number,
  pageTotal: number,
  itemCurrent: number,
  itemTotal: number,
  message: string
) => void;

/**
 * 取消任务回调函数类型
 */
export type BasicInfoCancelTaskCallback = () => void;

/**
 * 检查是否已取消的回调函数类型
 */
export type BasicInfoIsCancelledCallback = () => boolean;

// #region Toast 提示功能
let toastTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 显示 Toast 提示
 * @param message 提示消息
 * @param duration 显示时长（毫秒）
 */
function showToast(message: string, duration: number = 2000): void {
  // 清除之前的 toast
  if (toastTimer) {
    clearTimeout(toastTimer);
    const existingToast = document.getElementById("sell-try-basic-info-toast");
    if (existingToast) {
      existingToast.remove();
    }
  }

  // 创建 toast 元素
  const toast = document.createElement("div");
  toast.id = "sell-try-basic-info-toast";
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0, 0, 0, 0.75)",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "4px",
    fontSize: "14px",
    zIndex: "10001",
    animation: "sellTryBasicInfoFadeIn 0.3s",
  });
  toast.textContent = message;

  // 添加动画样式
  const style = document.createElement("style");
  style.textContent = `
    @keyframes sellTryBasicInfoFadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  if (!document.getElementById("sell-try-basic-info-toast-style")) {
    style.id = "sell-try-basic-info-toast-style";
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // 设置自动关闭
  toastTimer = setTimeout(() => {
    toast.remove();
    toastTimer = null;
  }, duration);
}

// #region 进度遮罩层

/**
 * 创建基本信息采集进度遮罩层
 * @param totalPages 总页数
 * @returns 遮罩层元素、进度更新函数和取消函数
 */
export function createBasicInfoProgressOverlay(totalPages: number): {
  overlay: HTMLDivElement;
  updateProgress: BasicInfoProgressUpdateCallback;
  cancelTask: BasicInfoCancelTaskCallback;
  isCancelled: BasicInfoIsCancelledCallback;
} {
  // 创建遮罩层
  const overlay = document.createElement("div");
  overlay.id = "sell-try-basic-info-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: "9999",
    cursor: "not-allowed",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  });

  // 创建内容容器
  const content = document.createElement("div");
  Object.assign(content.style, {
    textAlign: "center",
    color: "#fff",
    padding: "30px 40px",
    background: "rgba(0, 0, 0, 0.5)",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    maxWidth: "450px",
  });

  // 创建标题
  const title = document.createElement("div");
  Object.assign(title.style, {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
  });
  title.textContent = "正在批量获取商品基本信息...";

  // ===== 页面进度条 =====
  // 页面进度标签
  const pageLabel = document.createElement("div");
  Object.assign(pageLabel.style, {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: "6px",
    textAlign: "left",
    width: "300px",
  });
  pageLabel.textContent = "页面进度";

  // 页面进度条容器
  const pageProgressContainer = document.createElement("div");
  Object.assign(pageProgressContainer.style, {
    width: "300px",
    height: "10px",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "5px",
    overflow: "hidden",
    marginBottom: "16px",
  });

  // 页面进度条
  const pageProgressBar = document.createElement("div");
  Object.assign(pageProgressBar.style, {
    height: "100%",
    width: "0%",
    background: "linear-gradient(90deg, #722ed1, #9254de)",
    borderRadius: "5px",
    transition: "width 0.3s ease",
  });
  pageProgressContainer.appendChild(pageProgressBar);

  // ===== 当前页进度条 =====
  // 当前页进度标签
  const itemLabel = document.createElement("div");
  Object.assign(itemLabel.style, {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: "6px",
    textAlign: "left",
    width: "300px",
  });
  itemLabel.textContent = "当前页进度";

  // 当前页进度条容器
  const itemProgressContainer = document.createElement("div");
  Object.assign(itemProgressContainer.style, {
    width: "300px",
    height: "10px",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "5px",
    overflow: "hidden",
    marginBottom: "16px",
  });

  // 当前页进度条
  const itemProgressBar = document.createElement("div");
  Object.assign(itemProgressBar.style, {
    height: "100%",
    width: "0%",
    background: "linear-gradient(90deg, #1890ff, #52c41a)",
    borderRadius: "5px",
    transition: "width 0.3s ease",
  });
  itemProgressContainer.appendChild(itemProgressBar);

  // 创建状态文本
  const statusText = document.createElement("div");
  Object.assign(statusText.style, {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: "8px",
  });

  // 创建按钮容器
  const buttonContainer = document.createElement("div");
  Object.assign(buttonContainer.style, {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "20px",
  });

  // 创建取消按钮
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "取消采集";
  Object.assign(cancelBtn.style, {
    padding: "8px 20px",
    cursor: "pointer",
    backgroundColor: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)",
  });
  // 鼠标悬停效果
  cancelBtn.onmouseenter = () => {
    cancelBtn.style.backgroundColor = "#ff7875";
    cancelBtn.style.transform = "translateY(-1px)";
  };
  cancelBtn.onmouseleave = () => {
    cancelBtn.style.backgroundColor = "#ff4d4f";
    cancelBtn.style.transform = "translateY(0)";
  };

  buttonContainer.appendChild(cancelBtn);
  content.appendChild(title);
  content.appendChild(pageLabel);
  content.appendChild(pageProgressContainer);
  content.appendChild(itemLabel);
  content.appendChild(itemProgressContainer);
  content.appendChild(statusText);
  content.appendChild(buttonContainer);
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // 标记是否已取消
  let isCancelled = false;

  // 更新进度的函数
  const updateProgress = (
    pageCurrent: number,
    pageTotal: number,
    itemCurrent: number,
    itemTotal: number,
    message: string
  ) => {
    // 计算页面进度百分比
    const pagePercentage = pageTotal > 0 ? Math.round((pageCurrent / pageTotal) * 100) : 0;
    pageProgressBar.style.width = `${pagePercentage}%`;
    pageLabel.textContent = `页面进度: ${pageCurrent} / ${pageTotal} (${pagePercentage}%)`;

    // 计算当前页进度百分比
    const itemPercentage = itemTotal > 0 ? Math.round((itemCurrent / itemTotal) * 100) : 0;
    itemProgressBar.style.width = `${itemPercentage}%`;
    itemLabel.textContent = `当前页进度: ${itemCurrent} / ${itemTotal} (${itemPercentage}%)`;

    statusText.textContent = message;
    title.textContent = pageCurrent >= pageTotal && itemCurrent >= itemTotal ? "采集完成!" : "正在批量获取商品基本信息...";
  };

  // 取消任务的函数
  const cancelTask = () => {
    isCancelled = true;
    cancelBtn.textContent = "已取消";
    cancelBtn.disabled = true;
    cancelBtn.style.backgroundColor = "#999";
    cancelBtn.style.cursor = "not-allowed";
    statusText.textContent = "正在取消...";
  };

  // 暴露取消按钮点击事件
  cancelBtn.onclick = () => {
    cancelTask();
  };

  return { overlay, updateProgress, cancelTask, isCancelled: () => isCancelled };
}

// #region 结果展示表格

/**
 * 显示采集结果表格
 * 固定header和footer，中间table可纵向滚动
 * @param results 采集结果数据数组
 */
export function showBasicInfoResultsTable(results: SellTryBasicInfoResult[]): void {
  // 创建模态框容器
  const modal = document.createElement("div");
  modal.id = "sell-try-basic-info-results-modal";
  Object.assign(modal.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: "10000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  });

  // 创建内容容器 - 使用flex布局实现固定header和footer
  const container = document.createElement("div");
  Object.assign(container.style, {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: "8px",
    maxWidth: "90%",
    maxHeight: "90vh",
    width: "800px",
    overflow: "hidden",
  });

  // ===== Header =====
  const header = document.createElement("div");
  Object.assign(header.style, {
    padding: "16px 20px",
    borderBottom: "1px solid #eee",
    flexShrink: "0",
    backgroundColor: "#fff",
  });

  const title = document.createElement("h2");
  title.textContent = `批量获取基本信息完成，共 ${results.length} 条数据`;
  Object.assign(title.style, {
    margin: "0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
  });
  header.appendChild(title);

  // ===== 中间内容区域（可滚动） =====
  const scrollContainer = document.createElement("div");
  Object.assign(scrollContainer.style, {
    flex: "1",
    overflowY: "auto",
    overflowX: "hidden",
  });

  // 创建表格
  const table = document.createElement("table");
  Object.assign(table.style, {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  });

  // 表头 - 3列：图片、商品ID、商品标题
  const thead = document.createElement("thead");
  thead.style.backgroundColor = "#f5f5f5";
  const headerRow = document.createElement("tr");
  ["商品图片", "商品ID", "商品标题"].forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    Object.assign(th.style, {
      border: "1px solid #ddd",
      padding: "12px 16px",
      textAlign: "left",
      backgroundColor: "#f5f5f5",
      fontWeight: "600",
      color: "#333",
      position: "sticky",
      top: "0",
      zIndex: "1",
    });
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // 表体
  const tbody = document.createElement("tbody");

  // 存储数据映射，用于事件委托中查找对应项
  const dataMap = new Map<number, SellTryBasicInfoResult>();

  results.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.dataset.index = String(index);
    dataMap.set(index, item);

    // 商品图片
    const tdImg = document.createElement("td");
    Object.assign(tdImg.style, {
      border: "1px solid #ddd",
      padding: "8px",
      textAlign: "center",
      verticalAlign: "middle",
    });
    tdImg.dataset.type = "image";
    if (item.imgUrl) {
      const img = document.createElement("img");
      img.src = item.imgUrl;
      Object.assign(img.style, {
        width: "50px",
        height: "50px",
        objectFit: "cover",
        borderRadius: "4px",
        cursor: "pointer",
        border: "2px solid transparent",
        transition: "border-color 0.2s",
      });
      img.title = "点击复制图片URL";
      tdImg.appendChild(img);
    }
    tr.appendChild(tdImg);

    // 商品ID
    const tdId = document.createElement("td");
    tdId.textContent = item.itemId;
    Object.assign(tdId.style, {
      border: "1px solid #ddd",
      padding: "8px",
      wordBreak: "break-all",
      cursor: "pointer",
      maxWidth: "150px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      transition: "background 0.2s",
    });
    tdId.title = "点击复制商品ID";
    tdId.dataset.type = "item-id";
    tr.appendChild(tdId);

    // 商品标题
    const tdName = document.createElement("td");
    tdName.textContent = item.itemName;
    Object.assign(tdName.style, {
      border: "1px solid #ddd",
      padding: "8px",
      maxWidth: "300px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      cursor: "pointer",
      transition: "background 0.2s",
    });
    tdName.title = "点击复制商品标题";
    tdName.dataset.type = "item-name";
    tr.appendChild(tdName);

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  scrollContainer.appendChild(table);

  // 使用事件委托处理表体点击事件
  tbody.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement;
    const td = target.closest("td") as HTMLElement;
    if (!td) return;

    const tr = td.closest("tr") as HTMLTableRowElement;
    if (!tr) return;

    const index = parseInt(tr.dataset.index || "-1", 10);
    const item = dataMap.get(index);
    if (!item) return;

    const type = td.dataset.type;

    try {
      if (type === "image") {
        // 图片点击：复制图片URL
        await copyToClipboard(item.imgUrl);
        showToast("图片URL已复制到剪贴板");
      } else if (type === "item-id") {
        // 商品ID点击：复制ID文本
        await copyToClipboard(item.itemId);
        showToast("商品ID已复制到剪贴板");
      } else if (type === "item-name") {
        // 商品标题点击：复制标题文本
        await copyToClipboard(item.itemName);
        showToast("商品标题已复制到剪贴板");
      }
    } catch (e) {
      console.error("复制失败:", e);
      showToast("复制失败，请重试");
    }
  });

  // 添加鼠标悬停效果样式
  const style = document.createElement("style");
  style.textContent = `
    #sell-try-basic-info-results-modal table tbody tr:hover {
      background: #f9f9f9;
    }
    #sell-try-basic-info-results-modal table td[data-type="image"] img:hover {
      border-color: #1890ff;
    }
    #sell-try-basic-info-results-modal table td[data-type="item-id"]:hover,
    #sell-try-basic-info-results-modal table td[data-type="item-name"]:hover {
      background: #e6f7ff;
    }
  `;
  document.head.appendChild(style);

  // ===== Footer =====
  const footer = document.createElement("div");
  Object.assign(footer.style, {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "12px 20px",
    borderTop: "1px solid #eee",
    flexShrink: "0",
    backgroundColor: "#fff",
    gap: "10px",
  });

  // 按钮样式
  const buttonStyle = {
    padding: "8px 16px",
    cursor: "pointer",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    transition: "background 0.2s",
  };

  // 关闭按钮
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "关闭";
  Object.assign(closeBtn.style, {
    ...buttonStyle,
    backgroundColor: "#666",
  });
  closeBtn.onmouseenter = () => { closeBtn.style.backgroundColor = "#787878"; };
  closeBtn.onmouseleave = () => { closeBtn.style.backgroundColor = "#666"; };
  closeBtn.onclick = () => modal.remove();
  footer.appendChild(closeBtn);

  // 复制全部信息按钮
  const copyAllBtn = document.createElement("button");
  copyAllBtn.textContent = "复制全部信息";
  Object.assign(copyAllBtn.style, {
    ...buttonStyle,
    backgroundColor: "#1890ff",
  });
  copyAllBtn.onmouseenter = () => { copyAllBtn.style.backgroundColor = "#40a9ff"; };
  copyAllBtn.onmouseleave = () => { copyAllBtn.style.backgroundColor = "#1890ff"; };
  copyAllBtn.onclick = async () => {
    // 构建表格行
    const rows = results
      .map((item) => {
        return `  <tr>
    <td><img src='${item.imgUrl}' width='50' height='50'></td>
    <td>${item.itemId}</td>
    <td>${item.itemName}</td>
  </tr>`;
      })
      .join("\n");

    // 构建完整表格HTML
    const tableHtml = `<table>
${rows}
</table>`;

    await copyToClipboard(tableHtml);
    showToast("全部信息已复制到剪贴板");
  };
  footer.appendChild(copyAllBtn);

  // 复制所有商品ID按钮
  const copyAllIdsBtn = document.createElement("button");
  copyAllIdsBtn.textContent = "复制所有商品ID";
  Object.assign(copyAllIdsBtn.style, {
    ...buttonStyle,
    backgroundColor: "#52c41a",
  });
  copyAllIdsBtn.onmouseenter = () => { copyAllIdsBtn.style.backgroundColor = "#73d13d"; };
  copyAllIdsBtn.onmouseleave = () => { copyAllIdsBtn.style.backgroundColor = "#52c41a"; };
  copyAllIdsBtn.onclick = async () => {
    const allItemIds = results.map(r => r.itemId).join("\n");
    await copyToClipboard(allItemIds);
    showToast("所有商品ID已复制到剪贴板");
  };
  footer.appendChild(copyAllIdsBtn);

  // 复制所有商品标题按钮
  const copyAllNamesBtn = document.createElement("button");
  copyAllNamesBtn.textContent = "复制所有商品标题";
  Object.assign(copyAllNamesBtn.style, {
    ...buttonStyle,
    backgroundColor: "#722ed1",
  });
  copyAllNamesBtn.onmouseenter = () => { copyAllNamesBtn.style.backgroundColor = "#9254de"; };
  copyAllNamesBtn.onmouseleave = () => { copyAllNamesBtn.style.backgroundColor = "#722ed1"; };
  copyAllNamesBtn.onclick = async () => {
    const allItemNames = results.map(r => r.itemName).join("\n");
    await copyToClipboard(allItemNames);
    showToast("所有商品标题已复制到剪贴板");
  };
  footer.appendChild(copyAllNamesBtn);

  // 组装容器
  container.appendChild(header);
  container.appendChild(scrollContainer);
  container.appendChild(footer);

  modal.appendChild(container);

  // 点击遮罩关闭
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  document.body.appendChild(modal);
}
