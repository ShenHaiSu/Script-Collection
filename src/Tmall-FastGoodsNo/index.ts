import { updateReactInputAsync } from "@/dev-tool/react-inputUpdate";

// #region 天猫快速货号输入增强功能
/**
 * 等待下一步按钮变为可用状态并点击
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
        console.warn("未找到下一步按钮");
        if (checkCount < maxChecks) setTimeout(check, interval);
        return;
      }

      if (button.disabled) {
        console.log(`按钮检查 (${checkCount}/${maxChecks}): 仍处于禁用状态`);
        if (checkCount < maxChecks) {
          setTimeout(check, interval);
        } else {
          console.error("按钮在多次检查后仍处于禁用状态，尝试强制点击");
          button.click();
        }
      } else {
        console.log(`按钮检查 (${checkCount}/${maxChecks}): 已启用，触发点击`);
        button.click();
      }
    };

    check();
  }, 500);
}

/**
 * 增强天猫商品发布页面的货号输入功能
 * 在用户输入货号后按回车键时，自动触发React状态更新并点击下一步按钮
 *
 * @remarks
 * 该功能解决以下问题：
 * 1. React受控组件在用户直接操作DOM时状态不同步
 * 2. 回车键默认行为不会触发React状态更新
 * 3. 按钮在状态未更新时保持禁用状态
 */
document.addEventListener("keydown", async (event: KeyboardEvent) => {
  // 检查是否按下回车键
  if (event.key !== "Enter") return;

  const target = event.target as HTMLElement;

  // 检查事件触发的html元素是不是input
  if (target.tagName !== "INPUT") return;

  const input = target as HTMLInputElement;

  // 检查input是否在货号输入区域
  const sellCatPropLayout = input.closest("div.sell-catProp-struct-vertical-layout");
  if (!sellCatPropLayout) return;

  // 检查是否为货号输入框
  const previousSibling = sellCatPropLayout.previousElementSibling as HTMLElement;
  if (!previousSibling || previousSibling.innerText !== "货号") return;

  // 记录调试信息
  console.log("检测到货号输入框回车事件，当前值:", input.value);

  // 阻止回车键的默认行为
  event.preventDefault();
  event.stopPropagation();

  // 获取当前输入值
  const currentValue = input.value;

  // 如果输入框为空，不需要触发更新
  if (!currentValue.trim()) {
    console.log("输入框为空，跳过更新");
    return;
  }

  // 使用封装好的异步更新函数，它内部处理了 blur/focus 循环、临时值触发和 React 状态同步
  await updateReactInputAsync(input, currentValue);

  // 等待下一步按钮启用并点击
  waitForNextButtonAndClick();
});
// #endregion
