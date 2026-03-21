/**
 * @fileoverview Input 检测工具模块
 * @description 提供针对天猫货号输入框的检测和验证功能
 */

/**
 * 检测目标元素是否为天猫货号输入框
 * 
 * @param target - 待检测的 DOM 元素
 * @returns {boolean} 是否为货号输入框
 * 
 * @remarks
 * 检测条件：
 * 1. 元素必须是 input 标签
 * 2. 必须具有 role='combobox' 属性
 * 3. 必须具有 itemlabel="货号" 属性
 * 4. 必须在货号输入区域容器内
 */
export function isGoodsNoInput(target: HTMLElement | null): target is HTMLInputElement {
  // 条件1: 检查是否为 input 元素
  if (!target || target.tagName !== "INPUT") {
    return false;
  }

  const input = target as HTMLInputElement;

  // 条件2: 检查 role 属性
  const role = input.getAttribute("role");
  if (role !== "combobox") {
    return false;
  }

  // 条件3: 检查 itemlabel 属性
  const itemLabel = input.getAttribute("itemlabel");
  if (itemLabel !== "货号") {
    return false;
  }

  // 条件4: 检查是否在货号输入区域内
  const sellCatPropLayout = input.closest("div.sell-catProp-struct-vertical-layout");
  if (!sellCatPropLayout) {
    return false;
  }

  // 额外验证：检查前一个兄弟元素是否为"货号"标签
  const previousSibling = sellCatPropLayout.previousElementSibling as HTMLElement;
  if (!previousSibling || previousSibling.innerText !== "货号") {
    return false;
  }

  return true;
}

/**
 * 检测当前聚焦的元素是否为 input 标签
 * 
 * @returns {HTMLInputElement | null} 当前聚焦的 input 元素，如果不是 input 则返回 null
 */
export function getFocusedInput(): HTMLInputElement | null {
  const activeElement = document.activeElement;
  
  if (!activeElement || activeElement.tagName !== "INPUT") {
    return null;
  }

  return activeElement as HTMLInputElement;
}

/**
 * 检测元素是否在货号输入区域内
 * 
 * @param element - 待检测的 DOM 元素
 * @returns {boolean} 是否在货号输入区域内
 */
export function isInGoodsNoArea(element: HTMLElement | null): boolean {
  if (!element) {
    return false;
  }

  const sellCatPropLayout = element.closest("div.sell-catProp-struct-vertical-layout");
  if (!sellCatPropLayout) {
    return false;
  }

  const previousSibling = sellCatPropLayout.previousElementSibling as HTMLElement;
  return !!previousSibling && previousSibling.innerText === "货号";
}

/**
 * 获取输入框的详细信息（用于调试）
 * 
 * @param input - 输入框元素
 * @returns {Object} 包含输入框详细信息的对象
 */
export function getInputDebugInfo(input: HTMLInputElement): {
  tagName: string;
  role: string | null;
  itemlabel: string | null;
  value: string;
  isInGoodsNoArea: boolean;
} {
  return {
    tagName: input.tagName,
    role: input.getAttribute("role"),
    itemlabel: input.getAttribute("itemlabel"),
    value: input.value,
    isInGoodsNoArea: isInGoodsNoArea(input),
  };
}