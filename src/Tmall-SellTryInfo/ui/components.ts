/**
 * UI 组件模块
 * 提供通用的 UI 组件，支持显示结果、Toast 提示等
 */

import { ScrapedResult, ToastConfig, ModalConfig } from "../types";
import { CSS_PREFIX } from "../config";

// #region 样式管理
/**
 * 创建并注入全局样式
 */
function createStyles(): void {
  const styleId = `${CSS_PREFIX}-table-styles`;
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .${CSS_PREFIX}-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 9999;
    }

    .${CSS_PREFIX}-table-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      max-width: 90vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .${CSS_PREFIX}-table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
    }

    .${CSS_PREFIX}-table-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .${CSS_PREFIX}-table-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }

    .${CSS_PREFIX}-table-close:hover {
      background: #f5f5f5;
      color: #333;
    }

    .${CSS_PREFIX}-table-wrapper {
      overflow: auto;
      flex: 1;
    }

    .${CSS_PREFIX}-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .${CSS_PREFIX}-table th {
      background: #f8f8f8;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #e0e0e0;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .${CSS_PREFIX}-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      vertical-align: middle;
    }

    .${CSS_PREFIX}-table tbody tr:hover {
      background: #f9f9f9;
    }

    .${CSS_PREFIX}-table .img-cell {
      width: 80px;
      text-align: center;
    }

    .${CSS_PREFIX}-table .img-cell img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s;
    }

    .${CSS_PREFIX}-table .img-cell img:hover {
      border-color: #1890ff;
    }

    .${CSS_PREFIX}-table .text-cell {
      cursor: pointer;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: background 0.2s;
    }

    .${CSS_PREFIX}-table .text-cell:hover {
      background: #e6f7ff;
    }

    .${CSS_PREFIX}-table .item-name {
      font-weight: 500;
      color: #333;
    }

    .${CSS_PREFIX}-table .item-id {
      color: #666;
      font-family: monospace;
    }

    .${CSS_PREFIX}-table .share-text {
      color: #1890ff;
      word-break: break-all;
    }

    .${CSS_PREFIX}-toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.75);
      color: #fff;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 10001;
      animation: ${CSS_PREFIX}-fadeIn 0.3s;
    }

    @keyframes ${CSS_PREFIX}-fadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    .${CSS_PREFIX}-table-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 12px 20px;
      border-top: 1px solid #eee;
      background: #fafafa;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    .${CSS_PREFIX}-table-footer-btn {
      background: #1890ff;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .${CSS_PREFIX}-table-footer-btn:hover {
      background: #40a9ff;
    }

    .${CSS_PREFIX}-table-footer-btn + .${CSS_PREFIX}-table-footer-btn {
      margin-left: 10px;
    }
  `;

  document.head.appendChild(style);
}

// #region 图片复制到剪贴板
/**
 * 将图片复制到剪贴板（实际图片而非URL）
 * @param imageUrl 图片URL
 */
async function copyImageToClipboard(imageUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
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
          reject(new Error("无法获取canvas上下文"));
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
            reject(new Error("无法创建图片blob"));
            return;
          }
          
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob
              })
            ]);
            showToast("图片已复制到剪贴板");
            resolve();
          } catch (e) {
            reject(e);
          }
        }, "image/png");
      } catch (e) {
        reject(e);
      }
    };
    
    img.onerror = () => {
      reject(new Error("图片加载失败"));
    };
    
    img.src = imageUrl;
  });
}

// #region 结果表格
/**
 * 显示采集结果表格
 * @param data 采集到的数据
 */
export function showResultsTable(data: ScrapedResult[]): void {
  // 确保样式已创建
  createStyles();

  // 创建遮罩层
  const overlay = document.createElement("div");
  overlay.className = `${CSS_PREFIX}-overlay`;
  overlay.id = `${CSS_PREFIX}-results-overlay`;

  // 创建表格容器
  const container = document.createElement("div");
  container.className = `${CSS_PREFIX}-table-container`;
  container.id = `${CSS_PREFIX}-results-container`;

  // 创建表头
  const header = document.createElement("div");
  header.className = `${CSS_PREFIX}-table-header`;

  const title = document.createElement("h3");
  title.textContent = `采集结果 (${data.length} 条)`;

  const closeBtn = document.createElement("button");
  closeBtn.className = `${CSS_PREFIX}-table-close`;
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = () => {
    overlay.remove();
    container.remove();
  };

  header.appendChild(title);
  header.appendChild(closeBtn);

  // 创建表格内容
  const wrapper = document.createElement("div");
  wrapper.className = `${CSS_PREFIX}-table-wrapper`;

  const table = document.createElement("table");
  table.className = `${CSS_PREFIX}-table`;

  // 表头
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th class="img-cell">图片</th>
      <th>商品ID</th>
      <th>商品标题</th>
      <th>分享链接</th>
    </tr>
  `;
  table.appendChild(thead);

  // 表体 - 使用事件委托
  const tbody = document.createElement("tbody");
  tbody.dataset.cssPrefix = CSS_PREFIX;
  
  // 存储数据映射，用于事件委托中查找对应项
  const dataMap = new Map<number, ScrapedResult>();
  data.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.dataset.index = String(index);
    dataMap.set(index, item);

    // 图片列
    const imgTd = document.createElement("td");
    imgTd.className = "img-cell";
    imgTd.dataset.type = "image";
    const img = document.createElement("img");
    img.src = item.imgUrl;
    img.alt = item.itemName;
    img.title = "点击复制图片到剪贴板";
    imgTd.appendChild(img);
    tr.appendChild(imgTd);

    // 商品ID列
    const idTd = document.createElement("td");
    idTd.className = "text-cell item-id";
    idTd.textContent = item.itemId;
    idTd.title = "点击复制商品ID";
    idTd.dataset.type = "item-id";
    tr.appendChild(idTd);

    // 商品标题列
    const titleTd = document.createElement("td");
    titleTd.className = "text-cell item-name";
    titleTd.textContent = item.itemName;
    titleTd.title = "点击复制商品标题";
    titleTd.dataset.type = "item-name";
    tr.appendChild(titleTd);

    // 分享链接列
    const textTd = document.createElement("td");
    textTd.className = "text-cell share-text";
    textTd.textContent = item.text;
    textTd.title = "点击复制分享链接";
    textTd.dataset.type = "share-text";
    tr.appendChild(textTd);

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
        await copyImageToClipboard(item.imgUrl);
      } else if (type === "item-id") {
        // 商品ID点击：复制ID文本
        await navigator.clipboard.writeText(item.itemId);
        showToast("商品ID已复制到剪贴板");
      } else if (type === "item-name") {
        // 商品标题点击：复制标题文本
        await navigator.clipboard.writeText(item.itemName);
        showToast("商品标题已复制到剪贴板");
      } else if (type === "share-text") {
        // 分享链接点击：复制链接文本
        await navigator.clipboard.writeText(item.text);
        showToast("分享链接已复制到剪贴板");
      }
    } catch (e) {
      console.error("复制失败:", e);
      showToast("复制失败，请重试");
    }
  });
  wrapper.appendChild(table);

  // 创建底部
  const footer = document.createElement("div");
  footer.className = `${CSS_PREFIX}-table-footer`;

  // 创建带分隔的复制按钮（每3条数据插入一个空白行）
  const copyWithSeparatorBtn = document.createElement("button");
  copyWithSeparatorBtn.className = `${CSS_PREFIX}-table-footer-btn`;
  copyWithSeparatorBtn.textContent = "复制表格HTML(带分隔)";
  copyWithSeparatorBtn.onclick = async () => {
    try {
      await copyTableStructureWithSeparator(data);
      showToast("带分隔的表格HTML已复制到剪贴板");
    } catch (e) {
      console.error("复制失败:", e);
      showToast("复制失败，请重试");
    }
  };

  const copyBtn = document.createElement("button");
  copyBtn.className = `${CSS_PREFIX}-table-footer-btn`;
  copyBtn.textContent = "复制表格HTML";
  copyBtn.onclick = async () => {
    try {
      await copyTableStructure(data);
      showToast("表格HTML已复制到剪贴板");
    } catch (e) {
      console.error("复制失败:", e);
      showToast("复制失败，请重试");
    }
  };

  const exportBtn = document.createElement("button");
  exportBtn.className = `${CSS_PREFIX}-table-footer-btn`;
  exportBtn.textContent = "导出JSON";
  exportBtn.onclick = () => {
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      showToast("JSON已复制到剪贴板");
    });
  };

  footer.appendChild(copyWithSeparatorBtn);
  footer.appendChild(copyBtn);
  footer.appendChild(exportBtn);

  // 组装容器
  container.appendChild(header);
  container.appendChild(wrapper);
  container.appendChild(footer);

  // 添加到页面
  document.body.appendChild(overlay);
  document.body.appendChild(container);

  // 点击遮罩层关闭
  overlay.onclick = () => {
    overlay.remove();
    container.remove();
  };
}

/**
 * 构建表格HTML结构并复制到剪贴板
 * @param data 采集到的数据
 */
export async function copyTableStructure(data: ScrapedResult[]): Promise<void> {
  // 构建表格行
  const rows = data
    .map((item) => {
      return `  <tr>
    <td><img src='${item.imgUrl}' width='200' height='200'></td>
    <td><span>${item.text}</span></td>
  </tr>`;
    })
    .join("\n");

  // 构建完整表格HTML
  const tableHtml = `<table>
${rows}
</table>`;

  // 复制到剪贴板
  try {
    await navigator.clipboard.writeText(tableHtml);
  } catch (error) {
    console.error("复制失败:", error);
    throw error;
  }
}

/**
 * 构建带分隔的表格HTML结构并复制到剪贴板（每3条数据插入一个空白行）
 * @param data 采集到的数据
 */
export async function copyTableStructureWithSeparator(data: ScrapedResult[]): Promise<void> {
  // 构建表格行，每3条数据插入一个空白分隔行
  const rows: string[] = [];
  
  data.forEach((item, index) => {
    // 添加当前数据行
    rows.push(`  <tr>
    <td><img src='${item.imgUrl}' width='200' height='200'></td>
    <td><span>${item.text}</span></td>
  </tr>`);
    
    // 每3条数据后插入一个空白行（除了最后一条）
    if ((index + 1) % 3 === 0 && index < data.length - 1) {
      rows.push(`  <tr>
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
  try {
    await navigator.clipboard.writeText(tableHtml);
  } catch (error) {
    console.error("复制失败:", error);
    throw error;
  }
}

// #region Toast 提示
let toastTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 显示 Toast 提示
 * @param config Toast 配置
 */
export function showToast(config: string | ToastConfig): void {
  // 清除之前的 toast
  if (toastTimer) {
    clearTimeout(toastTimer);
    const existingToast = document.querySelector(`.${CSS_PREFIX}-toast`);
    if (existingToast) {
      existingToast.remove();
    }
  }

  // 解析配置
  const message = typeof config === "string" ? config : config.message;
  const duration = (typeof config === "string" ? 3000 : config.duration) ?? 3000;
  const position = (typeof config === "string" ? "bottom" : config.position) ?? "bottom";

  // 创建 toast 元素
  const toast = document.createElement("div");
  toast.className = `${CSS_PREFIX}-toast`;
  toast.textContent = message;

  // 根据位置调整样式
  if (position === "top") {
    toast.style.top = "20px";
    toast.style.bottom = "auto";
    toast.style.transform = "translateX(-50%)";
  } else if (position === "center") {
    toast.style.top = "50%";
    toast.style.bottom = "auto";
    toast.style.transform = "translate(-50%, -50%)";
  }

  document.body.appendChild(toast);

  // 设置自动关闭
  toastTimer = setTimeout(() => {
    toast.remove();
    toastTimer = null;
  }, duration);
}

// #region 确认对话框
/**
 * 显示确认对话框
 * @param config 对话框配置
 * @returns 用户确认结果
 */
export function showConfirm(config: ModalConfig): Promise<boolean> {
  return new Promise((resolve) => {
    // 创建遮罩层
    const overlay = document.createElement("div");
    overlay.className = `${CSS_PREFIX}-overlay`;

    // 创建对话框容器
    const modal = document.createElement("div");
    modal.className = `${CSS_PREFIX}-table-container`;
    modal.style.minWidth = "300px";
    modal.style.maxWidth = "400px";

    // 创建内容
    const content = document.createElement("div");
    content.style.padding = "20px";
    content.style.textAlign = "center";

    if (typeof config.content === "string") {
      content.textContent = config.content;
    } else {
      content.appendChild(config.content);
    }

    // 创建按钮组
    const footer = document.createElement("div");
    footer.className = `${CSS_PREFIX}-table-footer`;
    footer.style.justifyContent = "center";

    // 取消按钮
    if (config.showCancel !== false) {
      const cancelBtn = document.createElement("button");
      cancelBtn.className = `${CSS_PREFIX}-table-footer-btn`;
      cancelBtn.style.background = "#fff";
      cancelBtn.style.color = "#333";
      cancelBtn.style.border = "1px solid #d9d9d9";
      cancelBtn.textContent = config.cancelText || "取消";
      cancelBtn.onclick = () => {
        overlay.remove();
        modal.remove();
        config.onCancel?.();
        resolve(false);
      };
      footer.appendChild(cancelBtn);
    }

    // 确认按钮
    const confirmBtn = document.createElement("button");
    confirmBtn.className = `${CSS_PREFIX}-table-footer-btn`;
    confirmBtn.textContent = config.confirmText || "确定";
    confirmBtn.onclick = () => {
      overlay.remove();
      modal.remove();
      config.onConfirm?.();
      resolve(true);
    };
    footer.appendChild(confirmBtn);

    // 组装
    modal.appendChild(content);
    modal.appendChild(footer);

    // 添加到页面
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // 点击遮罩层关闭
    if (config.closeOnClickMask !== false) {
      overlay.onclick = () => {
        overlay.remove();
        modal.remove();
        config.onCancel?.();
        resolve(false);
      };
    }
  });
}

// #region 加载状态
/**
 * 显示加载状态
 * @param message 加载提示消息
 * @returns 隐藏加载状态的函数
 */
export function showLoading(message: string = "加载中..."): () => void {
  const overlay = document.createElement("div");
  overlay.className = `${CSS_PREFIX}-overlay`;
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";

  const spinner = document.createElement("div");
  spinner.style.textAlign = "center";
  spinner.style.color = "#fff";
  spinner.style.fontSize = "16px";
  spinner.textContent = message;

  overlay.appendChild(spinner);
  document.body.appendChild(overlay);

  return () => overlay.remove();
}

// #region 导出
export { createStyles };
