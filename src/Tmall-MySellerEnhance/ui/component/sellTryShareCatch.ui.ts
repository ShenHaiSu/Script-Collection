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

  // 表头
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["序号", "商品图片", "商品ID", "商品名称", "分享链接", "操作"].forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    Object.assign(th.style, {
      border: "1px solid #ddd",
      padding: "8px",
      textAlign: "left",
      backgroundColor: "#f5f5f5",
    });
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // 表体
  const tbody = document.createElement("tbody");
  results.forEach((item, index) => {
    const tr = document.createElement("tr");

    // 序号
    const tdIndex = document.createElement("td");
    tdIndex.textContent = String(index + 1);
    Object.assign(tdIndex.style, { border: "1px solid #ddd", padding: "8px" });
    tr.appendChild(tdIndex);

    // 商品图片
    const tdImg = document.createElement("td");
    tdImg.style.border = "1px solid #ddd";
    if (item.imgUrl) {
      const img = document.createElement("img");
      img.src = item.imgUrl;
      Object.assign(img.style, {
        width: "50px",
        height: "50px",
        objectFit: "cover",
      });
      tdImg.appendChild(img);
    }
    tr.appendChild(tdImg);

    // 商品ID
    const tdId = document.createElement("td");
    tdId.textContent = item.itemId;
    Object.assign(tdId.style, { border: "1px solid #ddd", padding: "8px", wordBreak: "break-all" });
    tr.appendChild(tdId);

    // 商品名称
    const tdName = document.createElement("td");
    tdName.textContent = item.itemName;
    Object.assign(tdName.style, {
      border: "1px solid #ddd",
      padding: "8px",
      maxWidth: "200px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    });
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
    });
    tr.appendChild(tdText);

    // 操作按钮
    const tdAction = document.createElement("td");
    Object.assign(tdAction.style, { border: "1px solid #ddd", padding: "8px" });
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "复制链接";
    Object.assign(copyBtn.style, {
      padding: "4px 8px",
      cursor: "pointer",
      backgroundColor: "#1890ff",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
    });
    copyBtn.onclick = async () => {
      if (item.text) {
        await copyToClipboard(item.text);
        alert("复制成功！");
      }
    };
    tdAction.appendChild(copyBtn);
    tr.appendChild(tdAction);

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  content.appendChild(title);
  content.appendChild(table);

  // 关闭按钮
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "关闭";
  Object.assign(closeBtn.style, {
    marginTop: "16px",
    padding: "8px 16px",
    cursor: "pointer",
    backgroundColor: "#666",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
  });
  closeBtn.onclick = () => modal.remove();
  content.appendChild(closeBtn);

  // 复制全部按钮
  const copyAllBtn = document.createElement("button");
  copyAllBtn.textContent = "复制全部链接";
  Object.assign(copyAllBtn.style, {
    marginTop: "16px",
    marginLeft: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    backgroundColor: "#52c41a",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
  });
  copyAllBtn.onclick = async () => {
    const allTexts = results
      .map((r) => r.text)
      .filter((t) => t)
      .join("\n\n");
    if (allTexts) {
      await copyToClipboard(allTexts);
      alert("全部链接已复制到剪贴板！");
    }
  };
  content.appendChild(copyAllBtn);

  modal.appendChild(content);

  // 点击遮罩关闭
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  document.body.appendChild(modal);
}
