// #region 变量定义
/**
 * 是否已经开启类目大图模式
 */
let isCateLabelLargeChecked = false;
// #endregion

// #region 核心功能逻辑
/**
 * 树节点标签点击事件处理
 * 当点击树形节点的文字部分时，自动触发其前面的复选框点击
 * @param event 鼠标点击事件
 */
function handleTreeLabelClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  // console.log(target);

  // 1. 检查点击的目标是否是指定的 label
  if (!target.matches("div.next-tree-node-label.next-tree-node-label-selectable")) return;

  // 2. 获取最近的 wrapper 容器
  const wrapper = target.closest("div.next-tree-node-label-wrapper");
  if (!wrapper) return;

  // 3. 获取上一个兄弟元素（通常是复选框容器）
  const checkboxWrapper = wrapper.previousElementSibling;
  if (!(checkboxWrapper instanceof HTMLElement)) return;

  // 4. 检查是否是指定的复选框容器，并触发点击
  if (checkboxWrapper.matches("label.next-checkbox-wrapper")) {
    checkboxWrapper.click();
  }
}

/**
 * 初始化类目大图增强逻辑
 */
export function initCateLabelLarge() {
  if (isCateLabelLargeChecked) return;
  isCateLabelLargeChecked = true;

  console.log("[Tmall-FastGoodsInput] 类目文本标签点击自动勾选增强");

  // 使用捕获阶段以确保逻辑优先执行
  document.addEventListener("click", handleTreeLabelClick, true);
}
// #endregion
