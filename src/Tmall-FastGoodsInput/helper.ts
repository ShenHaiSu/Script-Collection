// #region 辅助函数
/**
 * 辅助函数模块：存放当前目录下多个特性通用的工具代码
 */

/**
 * 检查元素是否为输入框
 * @param element 要检查的元素
 * @returns 是否为 HTMLInputElement
 */
export function isInput(element: EventTarget | null): element is HTMLInputElement {
  return element instanceof HTMLInputElement;
}

/**
 * 等待指定时间
 * @param ms 毫秒数
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// #endregion
