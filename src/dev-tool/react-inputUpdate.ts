/**
 * 在 React 受控组件环境下更新 input 或其他可填写元素的值并触发内存更新
 *
 * @param element - 目标 DOM 元素（HTMLInputElement、HTMLTextAreaElement、HTMLSelectElement 等）
 * @param oldValue - 旧值（可选），不传入则自动从元素的 value 属性获取
 * @param newValue - 新值（可选），不传入则使用 oldValue 的值
 *
 * @remarks
 * React 受控组件通过内部机制追踪值变化，该函数尝试通过以下方式触发 React 状态更新：
 * 1. 更新 _valueTracker（React 16+ 内部机制）
 * 2. 触发一系列模拟用户输入的事件（input, change, blur, focus 等）
 * 3. 处理中文输入法的 composition 事件
 */
export function updateReactInput(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, oldValue?: string, newValue?: string): void {
  if (!element) {
    console.error("updateReactInput: element 不能为空");
    return;
  }

  // 获取旧值和新值
  const actualOldValue = oldValue !== undefined ? oldValue : element.value;
  const actualNewValue = newValue !== undefined ? newValue : actualOldValue;

  // 1. 处理 React 16+ 的 _valueTracker 机制
  // 必须在修改 element.value 之前或之后以特定顺序触发
  const valueTracker = (element as any)._valueTracker;
  if (valueTracker) {
    // 方案：先将 tracker 设置为旧值，然后修改元素值，再触发 input 事件
    // 这会让 React 检测到值发生了从 actualOldValue 到 actualNewValue 的变化
    valueTracker.setValue(actualOldValue);
  }

  // 2. 如果新旧值相同，React 可能不会触发更新。
  // 通过设置一个微小的差异（零宽度空格）来强制触发
  if (actualOldValue === actualNewValue) {
    element.value = actualNewValue + "\u200B";
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // 3. 设置最终的目标值
  element.value = actualNewValue;

  // 4. 触发 composition 事件（模拟中文输入法）
  const dispatchComposition = (type: string, data: string) => {
    try {
      element.dispatchEvent(new CompositionEvent(type, { bubbles: true, data }));
    } catch (e) {
      /* 忽略不支持的环境 */
    }
  };

  dispatchComposition("compositionstart", actualOldValue);

  // 5. 触发核心 input 事件
  let inputEvent: Event;
  try {
    inputEvent = new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      inputType: "insertText",
      data: actualNewValue,
    });
  } catch (e) {
    inputEvent = new Event("input", { bubbles: true, cancelable: true });
  }
  element.dispatchEvent(inputEvent);

  dispatchComposition("compositionend", actualNewValue);

  // 6. 触发后续通知事件
  element.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

  // 7. 触发焦点变化事件，完成受控组件的生命周期循环
  element.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
  element.dispatchEvent(new FocusEvent("focus", { bubbles: true }));

  console.log(`updateReactInput: 已触发更新 [${actualOldValue}] -> [${actualNewValue}]`);
}

/**
 * 异步更新 React 输入框，包含完整的 blur/focus 循环和延迟，
 * 适用于某些对同步更新不敏感或需要等待状态同步的复杂 React 应用。
 *
 * @param element - 目标 DOM 元素
 * @param newValue - 新值
 * @param delay - 延迟时间（毫秒），默认为 50ms
 */
export function updateReactInputAsync(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  newValue: string,
  delay: number = 50,
): Promise<void> {
  return new Promise((resolve) => {
    // 1. 先触发一次真实的 blur 让 React 知道当前交互可能结束
    element.blur();

    setTimeout(() => {
      // 2. 重新聚焦
      element.focus();

      // 3. 执行核心更新逻辑
      updateReactInput(element, undefined, newValue);

      resolve();
    }, delay);
  });
}

/**
 * 批量更新多个 React 受控元素的值
 */
export function updateReactInputs(
  updates: Array<{
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    oldValue?: string;
    newValue?: string;
  }>,
): void {
  updates.forEach(({ element, oldValue, newValue }) => {
    updateReactInput(element, oldValue, newValue);
  });
}
