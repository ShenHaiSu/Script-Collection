import {ScrapedResult} from "@/Tmall-SellTryInfo/type";

/**
 * 构建表格HTML结构并复制到剪贴板
 * @param data 采集到的数据
 */
export async function copyTableStructure(data: ScrapedResult[]): Promise<void> {
  // 构建表格行
  const rows = data.map((item) => {
    return `  <tr>
    <td><img src='${item.imgUrl}'></td>
    <td><span>${item.text}</span></td>
  </tr>`;
  }).join("\n");

  // 构建完整表格HTML
  const tableHtml = `<table>
${rows}
</table>`;

  // 复制到剪贴板
  try {
    await navigator.clipboard.writeText(tableHtml);
    // 提示用户（通过显示toast的方式，需要在调用处处理）
  } catch (error) {
    console.error("复制失败:", error);
    throw error;
  }
}