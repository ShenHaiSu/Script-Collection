/**
 * 新品试销信息 UI 组件
 * 用于构建采集结果的展示界面
 */

import { copyToClipboard } from "@/Tmall-MySellerEnhance/helper";

/**
 * 采集结果数据类型
 */
export interface SellTryInfoResult {
  /** 商品图片 URL */
  imgUrl: string;
  /** 分享链接文本 */
  text: string;
  /** 商品 ID */
  itemId: string;
  /** 商品名称 */
  itemName: string;
}

/**
 * 进度更新回调函数类型
 */
export type ProgressUpdateCallback = (current: number, total: number, message: string) => void;

/**
 * 取消任务回调函数类型
 */
export type CancelTaskCallback = () => void;

/**
 * 检查是否已取消的回调函数类型
 */
export type IsCancelledCallback = () => boolean;

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
    const existingToast = document.getElementById("sell-try-info-toast");
    if (existingToast) {
      existingToast.remove();
    }
  }

  // 创建 toast 元素
  const toast = document.createElement("div");
  toast.id = "sell-try-info-toast";
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
    animation: "sellTryInfoFadeIn 0.3s",
  });
  toast.textContent = message;

  // 添加动画样式
  const style = document.createElement("style");
  style.textContent = `
    @keyframes sellTryInfoFadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  if (!document.getElementById("sell-try-info-toast-style")) {
    style.id = "sell-try-info-toast-style";
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // 设置自动关闭
  toastTimer = setTimeout(() => {
    toast.remove();
    toastTimer = null;
  }, duration);
}

// #region 图片复制到剪贴板
/**
 * 将图片复制到剪贴板（实际图片而非URL）
 * @param imageUrl 图片URL
 */
async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = async () => {
      try {
        // 创建800x800的canvas
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 800;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("无法获取canvas上下文");
          resolve(false);
          return;
        }
        
        // 绘制图片到canvas（居中裁剪为正方形）
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 800, 800);
        
        // 将canvas转换为blob并复制到剪贴板
        canvas.toBlob(async (blob) => {
          if (!blob) {
            console.error("无法创建图片blob");
            resolve(false);
            return;
          }
          
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob
              })
            ]);
            resolve(true);
          } catch (e) {
            console.error("复制图片到剪贴板失败:", e);
            resolve(false);
          }
        }, "image/png");
      } catch (e) {
        console.error("处理图片失败:", e);
        resolve(false);
      }
    };
    
    img.onerror = () => {
      console.error("图片加载失败");
      resolve(false);
    };
    
    img.src = imageUrl;
  });
}

// #region 表格结构复制功能
/**
 * 构建表格HTML结构并复制到剪贴板
 * @param results 采集结果数据
 */
async function copyTableStructure(results: SellTryInfoResult[]): Promise<void> {
  // 构建表格行
  const rows = results
    .map((item) => {
      return `  <tr>
    <td><img src='${item.imgUrl}' width='200' height='200'></td>
    <td>${item.itemId}</td>
    <td>${item.itemName}</td>
    <td>${item.text}</td>
  </tr>`;
    })
    .join("\n");

  // 构建完整表格HTML
  const tableHtml = `<table>
${rows}
</table>`;

  // 复制到剪贴板
  await copyToClipboard(tableHtml);
}

/**
 * 构建带分隔的表格HTML结构并复制到剪贴板（每3条数据插入一个空白行）
 * @param results 采集结果数据
 */
async function copyTableStructureWithSeparator(results: SellTryInfoResult[]): Promise<void> {
  // 构建表格行，每3条数据插入一个空白分隔行
  const rows: string[] = [];
  
  results.forEach((item, index) => {
    // 添加当前数据行
    rows.push(`  <tr>
    <td><img src='${item.imgUrl}' width='200' height='200'></td>
    <td>${item.itemId}</td>
    <td>${item.itemName}</td>
    <td>${item.text}</td>
  </tr>`);
    
    // 每3条数据后插入一个空白行（除了最后一条）
    if ((index + 1) % 3 === 0 && index < results.length - 1) {
      rows.push(`  <tr>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>`);
    }
  });

  // 构建完整表格HTML
  const tableHtml = `<table>
${rows.join("\n")}
</table>`;

  // 复制到剪贴板
  await copyToClipboard(tableHtml);
}

/**
 * 创建采集进度遮罩层
 * @returns 遮罩层元素、进度更新函数和取消函数
 */
export function createProgressOverlay(): {
  overlay: HTMLDivElement;
  updateProgress: ProgressUpdateCallback;
  cancelTask: CancelTaskCallback;
  isCancelled: IsCancelledCallback;
} {
  // 创建遮罩层
  const overlay = document.createElement("div");
  overlay.id = "sell-try-info-overlay";
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
    maxWidth: "400px",
  });

  // 创建标题
  const title = document.createElement("div");
  Object.assign(title.style, {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
  });
  title.textContent = "正在采集商品信息...";

  // 创建进度条容器
  const progressContainer = document.createElement("div");
  Object.assign(progressContainer.style, {
    width: "300px",
    height: "8px",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "16px",
  });

  // 创建进度条
  const progressBar = document.createElement("div");
  Object.assign(progressBar.style, {
    height: "100%",
    width: "0%",
    background: "linear-gradient(90deg, #1890ff, #52c41a)",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  });
  progressContainer.appendChild(progressBar);

  // 创建进度文本
  const progressText = document.createElement("div");
  Object.assign(progressText.style, {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: "8px",
  });
  progressText.textContent = "准备中...";

  // 创建状态文本
  const statusText = document.createElement("div");
  Object.assign(statusText.style, {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.6)",
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
  content.appendChild(progressContainer);
  content.appendChild(progressText);
  content.appendChild(statusText);
  content.appendChild(buttonContainer);
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // 标记是否已取消
  let isCancelled = false;

  // 更新进度的函数
  const updateProgress = (current: number, total: number, message: string) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${current} / ${total} (${percentage}%)`;
    statusText.textContent = message;
    title.textContent = current >= total ? "采集完成!" : "正在采集商品信息...";
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

/**
 * 显示采集结果表格
 * @param results 采集结果数据数组
 */
export function showResultsTable(results: SellTryInfoResult[]): void {
  // 创建模态框容器
  const modal = document.createElement("div");
  modal.id = "sell-try-info-results-modal";
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

  // 创建内容容器
  const content = document.createElement("div");
  Object.assign(content.style, {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "20px",
    maxWidth: "90%",
    maxHeight: "90vh",
    overflow: "auto",
  });

  // 创建标题
  const title = document.createElement("h2");
  title.textContent = `采集完成，共 ${results.length} 条数据`;
  Object.assign(title.style, {
    marginTop: "0",
    marginBottom: "16px",
  });

  // 创建表格
  const table = document.createElement("table");
  Object.assign(table.style, {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  });

  // 表头 - 4列：图片、商品ID、商品标题、分享链接
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["商品图片", "商品ID", "商品标题", "分享链接"].forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    Object.assign(th.style, {
      border: "1px solid #ddd",
      padding: "12px 16px",
      textAlign: "left",
      backgroundColor: "#f5f5f5",
      fontWeight: "600",
      color: "#333",
    });
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // 表体
  const tbody = document.createElement("tbody");
  
  // 存储数据映射，用于事件委托中查找对应项
  const dataMap = new Map<number, SellTryInfoResult>();
  
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
    });
    tdImg.dataset.type = "image";
    if (item.imgUrl) {
      const img = document.createElement("img");
      img.src = item.imgUrl;
      Object.assign(img.style, {
        width: "60px",
        height: "60px",
        objectFit: "cover",
        borderRadius: "4px",
        cursor: "pointer",
        border: "2px solid transparent",
        transition: "border-color 0.2s",
      });
      img.title = "点击复制图片到剪贴板";
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
      maxWidth: "200px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      cursor: "pointer",
      transition: "background 0.2s",
    });
    tdName.title = "点击复制商品标题";
    tdName.dataset.type = "item-name";
    tr.appendChild(tdName);

    // 分享链接
    const tdText = document.createElement("td");
    tdText.textContent = item.text || "(空)";
    Object.assign(tdText.style, {
      border: "1px solid #ddd",
      padding: "8px",
      maxWidth: "300px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      cursor: "pointer",
      color: "#1890ff",
      transition: "background 0.2s",
    });
    tdText.title = "点击复制分享链接";
    tdText.dataset.type = "share-text";
    tr.appendChild(tdText);

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

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
        // 图片点击：复制实际图片到剪贴板
        const success = await copyImageToClipboard(item.imgUrl);
        if (success) {
          showToast("图片已复制到剪贴板");
        } else {
          showToast("图片复制失败，请重试");
        }
      } else if (type === "item-id") {
        // 商品ID点击：复制ID文本
        await copyToClipboard(item.itemId);
        showToast("商品ID已复制到剪贴板");
      } else if (type === "item-name") {
        // 商品标题点击：复制标题文本
        await copyToClipboard(item.itemName);
        showToast("商品标题已复制到剪贴板");
      } else if (type === "share-text") {
        // 分享链接点击：复制链接文本
        if (item.text) {
          await copyToClipboard(item.text);
          showToast("分享链接已复制到剪贴板");
        } else {
          showToast("分享链接为空，无法复制");
        }
      }
    } catch (e) {
      console.error("复制失败:", e);
      showToast("复制失败，请重试");
    }
  });

  // 添加鼠标悬停效果样式
  const style = document.createElement("style");
  style.textContent = `
    #sell-try-info-results-modal table tbody tr:hover {
      background: #f9f9f9;
    }
    #sell-try-info-results-modal table td[data-type="image"] img:hover {
      border-color: #1890ff;
    }
    #sell-try-info-results-modal table td[data-type="item-id"]:hover,
    #sell-try-info-results-modal table td[data-type="item-name"]:hover,
    #sell-try-info-results-modal table td[data-type="share-text"]:hover {
      background: #e6f7ff;
    }
  `;
  document.head.appendChild(style);

  content.appendChild(title);
  content.appendChild(table);

  // 创建底部按钮容器
  const buttonContainer = document.createElement("div");
  Object.assign(buttonContainer.style, {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "12px 0 0 0",
    marginTop: "16px",
    borderTop: "1px solid #eee",
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
  buttonContainer.appendChild(closeBtn);

  // 复制JSON信息按钮
  const copyJsonBtn = document.createElement("button");
  copyJsonBtn.textContent = "复制JSON信息";
  Object.assign(copyJsonBtn.style, {
    ...buttonStyle,
    backgroundColor: "#722ed1",
  });
  copyJsonBtn.onmouseenter = () => { copyJsonBtn.style.backgroundColor = "#9254de"; };
  copyJsonBtn.onmouseleave = () => { copyJsonBtn.style.backgroundColor = "#722ed1"; };
  copyJsonBtn.onclick = async () => {
    const json = JSON.stringify(results, null, 2);
    await copyToClipboard(json);
    showToast("JSON信息已复制到剪贴板");
  };
  buttonContainer.appendChild(copyJsonBtn);

  // 复制table结构按钮
  const copyTableBtn = document.createElement("button");
  copyTableBtn.textContent = "复制table结构";
  Object.assign(copyTableBtn.style, {
    ...buttonStyle,
    backgroundColor: "#1890ff",
  });
  copyTableBtn.onmouseenter = () => { copyTableBtn.style.backgroundColor = "#40a9ff"; };
  copyTableBtn.onmouseleave = () => { copyTableBtn.style.backgroundColor = "#1890ff"; };
  copyTableBtn.onclick = async () => {
    await copyTableStructure(results);
    showToast("table结构已复制到剪贴板");
  };
  buttonContainer.appendChild(copyTableBtn);

  // 复制带间隔的table结构按钮
  const copyTableWithSeparatorBtn = document.createElement("button");
  copyTableWithSeparatorBtn.textContent = "复制带间隔的table结构";
  Object.assign(copyTableWithSeparatorBtn.style, {
    ...buttonStyle,
    backgroundColor: "#13c2c2",
  });
  copyTableWithSeparatorBtn.onmouseenter = () => { copyTableWithSeparatorBtn.style.backgroundColor = "#36cfc9"; };
  copyTableWithSeparatorBtn.onmouseleave = () => { copyTableWithSeparatorBtn.style.backgroundColor = "#13c2c2"; };
  copyTableWithSeparatorBtn.onclick = async () => {
    await copyTableStructureWithSeparator(results);
    showToast("带间隔的table结构已复制到剪贴板");
  };
  buttonContainer.appendChild(copyTableWithSeparatorBtn);

  // 复制商品ID按钮
  const copyItemIdsBtn = document.createElement("button");
  copyItemIdsBtn.textContent = "复制商品ID";
  Object.assign(copyItemIdsBtn.style, {
    ...buttonStyle,
    backgroundColor: "#52c41a",
  });
  copyItemIdsBtn.onmouseenter = () => { copyItemIdsBtn.style.backgroundColor = "#73d13d"; };
  copyItemIdsBtn.onmouseleave = () => { copyItemIdsBtn.style.backgroundColor = "#52c41a"; };
  copyItemIdsBtn.onclick = async () => {
    const allItemIds = results.map(r => r.itemId).join("\n");
    await copyToClipboard(allItemIds);
    showToast("所有商品ID已复制到剪贴板");
  };
  buttonContainer.appendChild(copyItemIdsBtn);

  content.appendChild(buttonContainer);

  modal.appendChild(content);

  // 点击遮罩关闭
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  document.body.appendChild(modal);
}
