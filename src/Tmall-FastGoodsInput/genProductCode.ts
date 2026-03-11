import { updateReactInput } from "../dev-tool/react-inputUpdate";

// #region 类型定义
/**
 * 货号生成配置项
 */
export interface ProductCodeOptions {
  /** 货号前缀 */
  prefix: string;
}
// #endregion

// #region 变量定义
let currentOptions: ProductCodeOptions = { prefix: "JGJ" };
let isInitialized = false;
// #endregion

// #region 核心逻辑
/**
 * 生成唯一的货号字符串
 * 格式：前缀 + MMddHHmm (月日时分)
 */
function generateProductCode(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${currentOptions.prefix}${month}${day}${hours}${minutes}`;
}

/**
 * 键盘按下事件处理函数
 * 监听 Alt + 1 组合键
 */
function handleKeyDown(event: KeyboardEvent) {
  // 1. 检查是否按下 Alt + 1
  if (!event.altKey || event.key !== "1") return;

  const activeElement = document.activeElement;

  // 2. 检查当前焦点是否为 input 且 id 为 productCode
  if (!(activeElement instanceof HTMLInputElement) || activeElement.id !== "productCode") return;

  event.preventDefault();
  event.stopPropagation();

  const newCode = generateProductCode();
  console.log(`[Tmall-FastGoodsInput] 生成货号: ${newCode}`);

  // 3. 使用 react-inputUpdate 写入值并触发更新
  updateReactInput(activeElement, undefined, newCode);
}

/**
 * 初始化货号生成特性
 * @param options 配置项
 */
export function initGenProductCode(options?: ProductCodeOptions) {
  if (isInitialized) return;
  isInitialized = true;

  if (options?.prefix) {
    currentOptions.prefix = options.prefix;
  }

  console.log(`[Tmall-FastGoodsInput] 货号快速生成特性已加载 (前缀: ${currentOptions.prefix})`);

  // 监听键盘事件
  document.addEventListener("keydown", handleKeyDown, true);
}
// #endregion
