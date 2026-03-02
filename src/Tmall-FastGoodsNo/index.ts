import { updateReactInput } from "../dev-tool/react-inputUpdate";

// 给 Document 添加按键监听
document.addEventListener("keydown", (event: KeyboardEvent) => {
  // 检查是否按下回车键
  if (event.key !== "Enter") {
    return;
  }

  const target = event.target as HTMLElement;

  // 检查事件触发的 html 元素是不是 input
  if (target.tagName !== "INPUT") {
    return;
  }

  const input = target as HTMLInputElement;

  // 检查 input 的 closest 有没有存在 div.sell-catProp-struct-vertical-layout
  const sellCatPropLayout = input.closest("div.sell-catProp-struct-vertical-layout");
  if (!sellCatPropLayout) {
    return;
  }

  // 检查 div.sell-catProp-struct-vertical-layout 的 previousElementSibling.innerText 是不是等于 "货号"
  const previousSibling = sellCatPropLayout.previousElementSibling as HTMLElement;
  if (!previousSibling || previousSibling.innerText !== "货号") {
    return;
  }

  // 以上条件均符合，阻止回车键的默认行为
  event.preventDefault();
  event.stopPropagation();

  // 使用工具函数触发 React 内存更新（不改变 value 值）
  updateReactInput(input);

  // 1000ms 之后寻找 button.next-btn.next-medium.next-btn-primary 按钮并触发 click 行为
  // 增加等待时间确保 React 有足够时间更新状态
  setTimeout(() => {
    const buttons = document.querySelectorAll("button.next-btn.next-medium.next-btn-primary");
    if (buttons.length > 0) {
      const button = buttons[0] as HTMLButtonElement;
      // 检查按钮是否被禁用
      if (button.disabled) {
        console.error("按钮仍处于禁用状态，无法点击");
      } else {
        button.click();
      }
    } else {
      console.error("未找到按钮：button.next-btn.next-medium.next-btn-primary");
    }
  }, 1000);
});
