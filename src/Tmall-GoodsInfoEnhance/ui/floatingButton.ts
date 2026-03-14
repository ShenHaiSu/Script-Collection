/**
 * 浮动触发按钮组件 (floatingButton.ts)
 */
import { SELECTORS } from "../helper";
import { STYLES } from "./styles";

/**
 * 创建浮动触发按钮
 * @param onToggle 点击触发的回调函数
 */
export function createFloatingTrigger(onToggle: () => void): HTMLDivElement {
  const btn = document.createElement("div");
  btn.className = SELECTORS.FLOATING_TRIGGER_CLASS;
  btn.innerHTML = "📋";
  btn.title = "打开商品信息面板";
  btn.style.cssText = STYLES.FLOATING_BTN;

  btn.onmouseenter = () => (btn.style.transform = "scale(1.1)");
  btn.onmouseleave = () => (btn.style.transform = "scale(1)");
  btn.onclick = onToggle;

  document.body.appendChild(btn);
  return btn;
}
