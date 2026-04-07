/**
 * Drawer 快捷输入组件 (drawerInput.ts)
 *
 * 功能：
 * 1. 为 Drawer 提供快捷输入框
 * 2. 支持输入编号快速触发按钮
 * 3. 空输入回车触发第一个按钮
 */
import { STYLES } from "@/Tmall-MySellerEnhance/ui/styles";
import type { ActionButtonConfig } from "@/Tmall-MySellerEnhance/ui/drawer";

/**
 * 输入框事件回调类型
 */
export type InputEventCallback = (buttonConfig: ActionButtonConfig) => void;

/**
 * DrawerInput 管理器
 */
export class DrawerInputManager {
  private inputElement: HTMLInputElement | null = null;
  private hintElement: HTMLDivElement | null = null;
  private buttonNumberMap: Map<string, ActionButtonConfig> = new Map();
  private onTriggerCallback: InputEventCallback | null = null;

  /**
   * 构建输入框 HTML
   * @param availableButtons 当前可用的按钮配置列表
   * @returns 输入框区域的 HTML 字符串
   */
  public buildInputHtml(availableButtons: ActionButtonConfig[]): string {
    // 构建编号映射
    this.buttonNumberMap.clear();
    const hintParts: string[] = [];

    availableButtons.forEach((btn, index) => {
      const number = String(index + 1).padStart(2, "0");
      this.buttonNumberMap.set(number, btn);
      hintParts.push(`${number}:${btn.label}`);
    });

    const hintText = hintParts.length > 0 ? hintParts.join(" | ") : "当前页面无可用功能";

    return `
      <div style="${STYLES.DRAWER_INPUT_CONTAINER}">
        <input
          type="text"
          id="tmall-order-enhance-quick-input"
          style="${STYLES.DRAWER_INPUT}"
          placeholder="输入编号快速执行..."
          autocomplete="off"
        />
        <div id="tmall-order-enhance-quick-hint" style="${STYLES.DRAWER_HINT}">
          可用: ${hintText}
        </div>
      </div>
    `;
  }

  /**
   * 绑定输入框事件
   * @param onTrigger 按钮触发回调
   */
  public bindEvents(onTrigger: InputEventCallback): void {
    this.onTriggerCallback = onTrigger;
    this.inputElement = document.getElementById(
      "tmall-order-enhance-quick-input"
    ) as HTMLInputElement;
    this.hintElement = document.getElementById(
      "tmall-order-enhance-quick-hint"
    ) as HTMLDivElement;

    if (!this.inputElement) {
      console.error("DrawerInput: 输入框元素未找到");
      return;
    }

    // 绑定键盘事件
    this.inputElement.addEventListener("keydown", this.handleKeyDown.bind(this));

    // 绑定聚焦/失焦事件
    this.inputElement.addEventListener("focus", this.handleFocus.bind(this));
    this.inputElement.addEventListener("blur", this.handleBlur.bind(this));
  }

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key !== "Enter") {
      return;
    }

    e.preventDefault();

    const value = this.inputElement?.value.trim() || "";

    if (value === "") {
      // 空输入：触发第一个按钮
      const firstButton = this.buttonNumberMap.get("01");
      if (firstButton && this.onTriggerCallback) {
        this.onTriggerCallback(firstButton);
        console.log("DrawerInput: 触发第一个按钮", firstButton.label);
      } else {
        console.warn("DrawerInput: 没有可用的按钮");
      }
    } else if (this.buttonNumberMap.has(value)) {
      // 有效编号：触发对应按钮
      const button = this.buttonNumberMap.get(value);
      if (button && this.onTriggerCallback) {
        this.onTriggerCallback(button);
        console.log(`DrawerInput: 触发按钮 [${value}]`, button.label);
      }
    } else {
      // 无效编号：提示错误
      console.warn(`DrawerInput: 无效的按钮编号 "${value}"`);
      this.flashError();
    }

    // 执行后清空输入
    if (this.inputElement) {
      this.inputElement.value = "";
    }
  }

  /**
   * 处理输入框聚焦
   */
  private handleFocus(): void {
    if (this.inputElement) {
      this.inputElement.style.cssText = STYLES.DRAWER_INPUT + STYLES.DRAWER_INPUT_FOCUS;
    }
  }

  /**
   * 处理输入框失焦
   */
  private handleBlur(): void {
    if (this.inputElement) {
      this.inputElement.style.cssText = STYLES.DRAWER_INPUT;
    }
  }

  /**
   * 闪烁错误提示
   */
  private flashError(): void {
    if (!this.inputElement) return;

    const originalBorder = this.inputElement.style.borderColor;
    this.inputElement.style.borderColor = "#ff4d4f";

    setTimeout(() => {
      if (this.inputElement) {
        this.inputElement.style.borderColor = originalBorder;
      }
    }, 300);
  }

  /**
   * 自动聚焦到输入框
   * @param delay 延迟毫秒数
   */
  public focus(delay: number = 100): void {
    setTimeout(() => {
      if (this.inputElement) {
        this.inputElement.focus();
        console.log("DrawerInput: 已聚焦到输入框");
      }
    }, delay);
  }

  /**
   * 获取当前按钮编号映射
   */
  public getButtonNumberMap(): Map<string, ActionButtonConfig> {
    return this.buttonNumberMap;
  }

  /**
   * 销毁输入框事件绑定
   */
  public destroy(): void {
    if (this.inputElement) {
      this.inputElement.removeEventListener("keydown", this.handleKeyDown.bind(this));
      this.inputElement.removeEventListener("focus", this.handleFocus.bind(this));
      this.inputElement.removeEventListener("blur", this.handleBlur.bind(this));
      this.inputElement = null;
    }
    this.hintElement = null;
    this.buttonNumberMap.clear();
    this.onTriggerCallback = null;
  }
}

// 导出单例
export const drawerInputManager = new DrawerInputManager();