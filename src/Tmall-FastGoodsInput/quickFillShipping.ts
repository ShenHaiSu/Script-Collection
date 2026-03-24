import { updateReactInput } from "../dev-tool/react-inputUpdate";

// #region 变量定义
let isInitialized = false;
// #endregion

// #region 核心逻辑
/**
 * 键盘按下事件处理函数
 * 监听 Alt + 1 组合键
 * 条件：当前焦点在 input 中，且该 input closest 于 div#struct-tmSubTitle
 * 动作：将 input 内容修改为 "顺丰包邮 包运费险"
 */
function handleKeyDown(event: KeyboardEvent) {
  // 1. 检查是否按下 Alt + 1
  if (!event.altKey || event.key !== "1") return;

  const activeElement = document.activeElement;

  // 2. 检查当前焦点是否为 input 标签
  if (!(activeElement instanceof HTMLInputElement)) return;

  // 3. 检查是否 closest 于 div#struct-tmSubTitle
  const subTitleElement = activeElement.closest("div#struct-tmSubTitle");
  if (!subTitleElement) return;

  // 通过所有检查，进入特性逻辑
  event.preventDefault();
  event.stopPropagation();

  console.log("[Tmall-FastGoodsInput] 检测到在副标题区域，按下 Alt+1，填写快递信息");

  // 4. 使用 react-inputUpdate 写入值并触发更新
  updateReactInput(activeElement, undefined, "顺丰包邮 包运费险");
}

/**
 * 初始化快递信息快速填写特性
 */
export function initQuickFillShipping() {
  if (isInitialized) return;
  isInitialized = true;

  console.log("[Tmall-FastGoodsInput] 快递信息快速填写特性已加载");

  // 监听键盘事件
  document.addEventListener("keydown", handleKeyDown, true);
}
// #endregion