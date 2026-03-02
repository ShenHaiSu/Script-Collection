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

  // React 受控组件需要触发 input 和 change 事件来更新状态
  // 使用 _valueTracker 来标记值已改变（React 内部机制）
  const valueTracker = (input as any)._valueTracker;
  if (valueTracker) {
    valueTracker.setValue(input.value);
  }

  // 触发 React 兼容的 input 事件（使用 CompositionEvent 可能更有效）
  const inputEvent = new Event("input", {
    bubbles: true,
    cancelable: true,
  });
  input.dispatchEvent(inputEvent);

  // 触发 change 事件
  const changeEvent = new Event("change", {
    bubbles: true,
    cancelable: true,
  });
  input.dispatchEvent(changeEvent);

  // 触发 blur 事件让 React 更新状态
  const blurEvent = new FocusEvent("blur", {
    bubbles: true,
    cancelable: true,
  });
  input.dispatchEvent(blurEvent);

  // 500ms 之后寻找 button.next-btn.next-medium.next-btn-primary 按钮并触发 click 行为
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
  }, 500);
});
