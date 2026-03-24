import {ScrapedResult} from "@/Tmall-SellTryInfo/type";
import {copyImageUrlToClipboard} from "@/dev-tool/imgCopy";

/**
 * 创建表格样式
 */
function createStyles(): void {
  const styleId = "sell-try-info-table-styles";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .sell-try-info-overlay {
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

    .sell-try-info-table-container {
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

    .sell-try-info-table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
    }

    .sell-try-info-table-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .sell-try-info-table-close {
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

    .sell-try-info-table-close:hover {
      background: #f5f5f5;
      color: #333;
    }

    .sell-try-info-table-wrapper {
      overflow: auto;
      flex: 1;
    }

    .sell-try-info-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .sell-try-info-table th {
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

    .sell-try-info-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      vertical-align: middle;
    }

    .sell-try-info-table tbody tr:hover {
      background: #f9f9f9;
    }

    .sell-try-info-table .img-cell {
      width: 80px;
      text-align: center;
    }

    .sell-try-info-table .img-cell img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s;
    }

    .sell-try-info-table .img-cell img:hover {
      border-color: #1890ff;
    }

    .sell-try-info-table .text-cell {
      cursor: pointer;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: background 0.2s;
    }

    .sell-try-info-table .text-cell:hover {
      background: #e6f7ff;
    }

    .sell-try-info-table .item-name {
      font-weight: 500;
      color: #333;
    }

    .sell-try-info-table .item-id {
      color: #666;
      font-family: monospace;
    }

    .sell-try-info-table .share-text {
      color: #1890ff;
      word-break: break-all;
    }

    .sell-try-info-toast {
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
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

/**
 * 显示提示消息
 * @param message 提示内容
 */
function showToast(message: string): void {
  const toast = document.createElement("div");
  toast.className = "sell-try-info-toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 */
async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    showToast("已复制到剪贴板");
  } catch (error) {
    console.error("复制失败:", error);
    showToast("复制失败，请手动复制");
  }
}

/**
 * 创建表格容器
 * @param data 采集到的数据
 * @returns 表格容器元素
 */
function createTableContainer(data: ScrapedResult[]): HTMLElement {
  const container = document.createElement("div");
  container.className = "sell-try-info-table-container";

  // 创建表头
  const header = document.createElement("div");
  header.className = "sell-try-info-table-header";
  header.innerHTML = `
    <h3>采集结果 (${data.length} 条)</h3>
    <button class="sell-try-info-table-close" title="关闭">&times;</button>
  `;

  // 关闭按钮事件
  header.querySelector(".sell-try-info-table-close")?.addEventListener("click", () => {
    container.remove();
    // 同时移除遮罩层
    const overlay = document.querySelector(".sell-try-info-overlay");
    if (overlay) {
      overlay.remove();
    }
  });

  // 创建表格
  const wrapper = document.createElement("div");
  wrapper.className = "sell-try-info-table-wrapper";

  const table = document.createElement("table");
  table.className = "sell-try-info-table";

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

  // 表格内容
  const tbody = document.createElement("tbody");

  // 使用事件委托处理点击事件
  tbody.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;

    // 处理图片点击
    if (target.tagName === "IMG") {
      const imgUrl = target.dataset.url;
      if (imgUrl) {
        try {
          await copyImageUrlToClipboard(imgUrl, {
            canvasWidth: 800,
            canvasHeight: 800,
            onSuccess: () => showToast("图片已复制到剪贴板 (800x800)"),
            onError: (error) => {
              console.error("复制图片失败:", error);
              showToast("复制图片失败，请重试");
            },
          });
        } catch (error) {
          console.error("复制图片失败:", error);
          showToast("复制图片失败，请重试");
        }
      }
      return;
    }

    // 处理文本单元格点击
    const cell = target.closest(".text-cell") as HTMLElement | null;
    if (cell) {
      const text = cell.dataset.copy;
      if (text) {
        await copyToClipboard(text);
      }
    }
  });

  // 填充数据行
  data.forEach((item) => {
    const tr = document.createElement("tr");

    // 图片单元格
    const imgCell = document.createElement("td");
    imgCell.className = "img-cell";
    const img = document.createElement("img");
    img.src = item.imgUrl;
    img.alt = item.itemName;
    img.dataset.url = item.imgUrl;
    img.title = "点击复制图片链接";
    imgCell.appendChild(img);

    // 商品ID单元格
    const idCell = document.createElement("td");
    idCell.className = "text-cell item-id";
    idCell.dataset.copy = item.itemId;
    idCell.title = "点击复制";
    idCell.textContent = item.itemId;

    // 商品标题单元格
    const nameCell = document.createElement("td");
    nameCell.className = "text-cell item-name";
    nameCell.dataset.copy = item.itemName;
    nameCell.title = "点击复制";
    nameCell.textContent = item.itemName;

    // 分享链接单元格
    const textCell = document.createElement("td");
    textCell.className = "text-cell share-text";
    textCell.dataset.copy = item.text;
    textCell.title = "点击复制";
    textCell.textContent = item.text;

    tr.appendChild(imgCell);
    tr.appendChild(idCell);
    tr.appendChild(nameCell);
    tr.appendChild(textCell);

    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  wrapper.appendChild(table);

  container.appendChild(header);
  container.appendChild(wrapper);

  return container;
}

/**
 * 显示采集结果表格
 * @param data 采集到的数据
 */
/**
 * 显示采集结果表格
 * @param data 采集到的数据
 */
export function showResultsTable(data: ScrapedResult[]): void {
  // 确保样式已创建
  createStyles();

  // 移除已存在的表格和遮罩层
  const existingContainer = document.querySelector(".sell-try-info-table-container");
  if (existingContainer) existingContainer.remove();
  const existingOverlay = document.querySelector(".sell-try-info-overlay");
  if (existingOverlay) existingOverlay.remove();

  // 创建半透明模糊遮罩层
  const overlay = document.createElement("div");
  overlay.className = "sell-try-info-overlay";
  document.body.appendChild(overlay);

  // 创建并显示表格
  const container = createTableContainer(data);
  document.body.appendChild(container);
}
