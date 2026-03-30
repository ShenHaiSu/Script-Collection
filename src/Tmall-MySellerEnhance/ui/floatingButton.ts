/**
 * 浮动触发按钮组件 (floatingButton.ts)
 */
import { STYLES } from "@/Tmall-MySellerEnhance/ui/styles";

/**
 * 创建浮动触发按钮
 * @param onToggle 点击触发的回调函数，用于切换 Drawer 的显示状态
 * @returns 创建的浮动按钮元素
 */
export function createFloatingTrigger(onToggle: () => void): HTMLDivElement {
  const btn = document.createElement("div");
  btn.id = "tmall-order-enhance-floating-btn";
  btn.innerHTML = "📋";
  btn.title = "订单增强工具";
  btn.style.cssText = STYLES.FLOATING_BTN;

  // 鼠标悬停效果
  btn.onmouseenter = () => {
    btn.style.transform = "scale(1.1)";
    btn.style.background = "#ff6a00";
  };
  btn.onmouseleave = () => {
    btn.style.transform = "scale(1)";
    btn.style.background = "#ff5000";
  };

  // 点击事件
  btn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  // 添加到页面
  document.body.appendChild(btn);

  console.log("浮动触发按钮已挂载");
  return btn;
}

/**
 * 移除浮动触发按钮
 */
export function removeFloatingTrigger(): void {
  const btn = document.getElementById("tmall-order-enhance-floating-btn");
  if (btn) {
    btn.remove();
    console.log("浮动触发按钮已移除");
  }
}