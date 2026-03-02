/**
 * 在 React 受控组件环境下更新 input 或其他可填写元素的值并触发内存更新
 * 
 * @param element - 目标 DOM 元素（HTMLInputElement、HTMLTextAreaElement、HTMLSelectElement 等）
 * @param oldValue - 旧值（可选），不传入则自动从元素的 value 属性获取
 * @param newValue - 新值（可选），不传入则使用 oldValue 的值
 * 
 * @remarks
 * React 受控组件通过内部机制追踪值变化，需要：
 * 1. 更新 _valueTracker（如果存在）
 * 2. 触发 input 事件
 * 3. 触发 change 事件
 * 4. 触发 blur 事件
 * 这样才能确保 React 状态正确更新
 */
export function updateReactInput(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  oldValue?: string,
  newValue?: string
): void {
  if (!element) {
    console.error("updateReactInput: element 不能为空");
    return;
  }

  // 获取旧值：如果未传入，则从元素获取
  const actualOldValue = oldValue !== undefined ? oldValue : element.value;

  // 获取新值：如果未传入，则使用旧值
  const actualNewValue = newValue !== undefined ? newValue : actualOldValue;

  // 设置新值到元素
  element.value = actualNewValue;

  // 尝试使用 _valueTracker 通知 React 值已变化（React 16+ 内部机制）
  const valueTracker = (element as any)._valueTracker;
  if (valueTracker) {
    valueTracker.setValue(actualOldValue);
  }

  // 触发 input 事件（冒泡、可取消）
  const inputEvent = new Event("input", {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(inputEvent);

  // 触发 change 事件（冒泡、可取消）
  const changeEvent = new Event("change", {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(changeEvent);

  // 触发 blur 事件让 React 完成状态更新（冒泡、可取消）
  const blurEvent = new FocusEvent("blur", {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(blurEvent);
}

/**
 * 批量更新多个 React 受控元素的值
 * 
 * @param updates - 更新配置数组，每个配置包含 element、oldValue、newValue
 */
export function updateReactInputs(
  updates: Array<{
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    oldValue?: string;
    newValue?: string;
  }>
): void {
  updates.forEach(({ element, oldValue, newValue }) => {
    updateReactInput(element, oldValue, newValue);
  });
}