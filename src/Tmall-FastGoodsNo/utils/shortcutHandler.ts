/**
 * @fileoverview 快捷键处理模块
 * @description 处理 Alt+1 快捷键，填充当前时间到货号输入框
 */

import { updateReactInputAsync } from "@/dev-tool/react-inputUpdate";
import { getCurrentTimeMmss } from "./timeUtils";
import { isGoodsNoInput, getInputDebugInfo } from "./inputDetector";

/**
 * 等待下一步按钮变为可用状态并点击
 * 
 * @private
 * @remarks
 * 此函数复制自主模块，保持功能完整性
 */
function waitForNextButtonAndClick(): void {
  // 初始延迟 500ms，等待 React 状态同步
  setTimeout(() => {
    let checkCount = 0;
    const maxChecks = 10;
    const interval = 200;
    const selector = "button.next-btn.next-medium.next-btn-primary";

    const check = () => {
      checkCount++;
      const button = document.querySelector(selector) as HTMLButtonElement;

      if (!button) {
        console.warn("[Alt+1快捷键] 未找到下一步按钮");
        if (checkCount < maxChecks) setTimeout(check, interval);
        return;
      }

      if (button.disabled) {
        console.log(`[Alt+1快捷键] 按钮检查 (${checkCount}/${maxChecks}): 仍处于禁用状态`);
        if (checkCount < maxChecks) {
          setTimeout(check, interval);
        } else {
          console.error("[Alt+1快捷键] 按钮在多次检查后仍处于禁用状态，尝试强制点击");
          button.click();
        }
      } else {
        console.log(`[Alt+1快捷键] 按钮检查 (${checkCount}/${maxChecks}): 已启用，触发点击`);
        button.click();
      }
    };

    check();
  }, 500);
}

/**
 * 填充时间到货号输入框并触发自动跳转
 * 
 * @param input - 货号输入框元素
 * @returns {Promise<void>} 操作完成的 Promise
 * 
 * @remarks
 * 执行流程：
 * 1. 获取当前时间（mmdd 格式）
 * 2. 使用 React 状态更新机制填充值到输入框
 * 3. 触发回车键的检查和自动跳转行为
 */
async function fillTimeAndProceed(input: HTMLInputElement): Promise<void> {
  // 1. 获取当前时间
  const timeValue = getCurrentTimeMmss();
  console.log(`[Alt+1快捷键] 获取当前时间: ${timeValue}`);

  // 2. 填充时间到输入框并触发 React 状态更新
  await updateReactInputAsync(input, timeValue);

  // 3. 触发回车键事件以执行原有的自动跳转逻辑
  // 创建一个键盘事件模拟回车键
  const enterEvent = new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true,
  });
  
  // 延迟一小段时间确保状态已更新，然后触发回车事件
  setTimeout(() => {
    input.dispatchEvent(enterEvent);
    console.log(`[Alt+1快捷键] 已触发回车事件，准备自动跳转`);
  }, 100);
}

/**
 * 处理 Alt+1 快捷键事件
 * 
 * @param event - 键盘事件对象
 * @returns {boolean} 是否成功处理了快捷键
 * 
 * @remarks
 * 检测逻辑：
 * 1. 检查是否按下 Alt+1 组合键
 * 2. 检查当前是否聚焦在 input 标签上
 * 3. 检查是否为货号输入框 (input[role='combobox'][itemlabel="货号"])
 * 4. 如果验证通过，填充时间并触发自动跳转
 */
export function handleAlt1Shortcut(event: KeyboardEvent): boolean {
  // 检查 Alt 键是否按下
  if (!event.altKey) {
    return false;
  }

  // 检查是否按下数字键 1
  if (event.key !== "1" && event.key !== "!" ) {
    return false;
  }

  console.log("[Alt+1快捷键] 检测到 Alt+1 快捷键");

  // 获取当前聚焦的元素
  const activeElement = document.activeElement as HTMLElement;

  // 检查是否为货号输入框
  if (!isGoodsNoInput(activeElement)) {
    // 输出调试信息
    const debugInfo = activeElement?.tagName === "INPUT" 
      ? getInputDebugInfo(activeElement as HTMLInputElement)
      : { tagName: activeElement?.tagName, role: null, itemlabel: null, value: "", isInGoodsNoArea: false };
    
    console.log("[Alt+1快捷键] 当前聚焦元素不是货号输入框，跳过", debugInfo);
    return false;
  }

  const input = activeElement as HTMLInputElement;
  
  // 阻止默认行为（防止输入 "1" 字符）
  event.preventDefault();
  event.stopPropagation();

  console.log("[Alt+1快捷键] 验证通过，准备填充时间");

  // 填充时间并触发后续流程
  fillTimeAndProceed(input).catch((error) => {
    console.error("[Alt+1快捷键] 执行失败:", error);
  });

  return true;
}

/**
 * 注册 Alt+1 快捷键监听器
 * 
 * @returns {() => void} 取消监听器的函数
 * 
 * @example
 * // 注册快捷键
 * const unregister = registerAlt1Shortcut();
 * 
 * // 取消注册
 * unregister();
 */
export function registerAlt1Shortcut(): () => void {
  const handler = (event: KeyboardEvent) => {
    handleAlt1Shortcut(event);
  };

  document.addEventListener("keydown", handler);
  console.log("[Alt+1快捷键] 已注册 Alt+1 快捷键监听器");

  // 返回取消注册的函数
  return () => {
    document.removeEventListener("keydown", handler);
    console.log("[Alt+1快捷键] 已注销 Alt+1 快捷键监听器");
  };
}