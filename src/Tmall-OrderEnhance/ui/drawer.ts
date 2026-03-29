/**
 * Drawer 侧边栏组件 (drawer.ts)
 */
import { STYLES } from "./styles";

/**
 * 交互按钮配置项
 */
export interface ActionButtonConfig {
  /** 按钮唯一标识 */
  id: string;
  /** 按钮显示文字 */
  label: string;
  /** 按钮图标 (emoji) */
  icon: string;
  /** 按钮点击回调 */
  onClick: () => void | Promise<void>;
}

/**
 * Drawer 组件状态
 */
interface DrawerState {
  isOpen: boolean;
  maskElement: HTMLDivElement | null;
  containerElement: HTMLDivElement | null;
  actionButtons: ActionButtonConfig[];
}

/**
 * Drawer 管理器
 */
class DrawerManager {
  private state: DrawerState = {
    isOpen: false,
    maskElement: null,
    containerElement: null,
    actionButtons: [],
  };

  /**
   * 初始化 Drawer 组件
   * @param actionButtons 交互按钮配置列表
   */
  public init(actionButtons: ActionButtonConfig[]): void {
    this.state.actionButtons = actionButtons;
    this.createElements();
    console.log("Drawer 组件已初始化");
  }

  /**
   * 创建 Drawer 相关的 DOM 元素
   */
  private createElements(): void {
    // 创建遮罩层
    this.state.maskElement = document.createElement("div");
    this.state.maskElement.id = "tmall-order-enhance-drawer-mask";
    this.state.maskElement.style.cssText = STYLES.DRAWER_MASK;
    this.state.maskElement.onclick = () => this.close();

    // 创建 Drawer 容器
    this.state.containerElement = document.createElement("div");
    this.state.containerElement.id = "tmall-order-enhance-drawer";
    this.state.containerElement.style.cssText = STYLES.DRAWER_CONTAINER;

    // 构建 Drawer 内容
    this.state.containerElement.innerHTML = this.buildDrawerContent();

    // 添加到页面
    document.body.appendChild(this.state.maskElement);
    document.body.appendChild(this.state.containerElement);

    // 绑定按钮事件
    this.bindButtonEvents();
  }

  /**
   * 构建 Drawer 的 HTML 内容
   */
  private buildDrawerContent(): string {
    const buttonsHtml = this.state.actionButtons
      .map(
        (btn) => `
        <button
          class="tmall-order-enhance-action-btn"
          data-action-id="${btn.id}"
          style="${STYLES.ACTION_BUTTON}"
        >
          <span class="tmall-order-enhance-action-btn-icon" style="${STYLES.ACTION_BUTTON_ICON}">${btn.icon}</span>
          <span class="tmall-order-enhance-action-btn-text" style="${STYLES.ACTION_BUTTON_TEXT}">${btn.label}</span>
        </button>
      `
      )
      .join("");

    return `
      <div style="${STYLES.DRAWER_HEADER}">
        <h3 style="${STYLES.DRAWER_TITLE}">订单增强工具</h3>
        <button id="tmall-order-enhance-drawer-close" style="${STYLES.DRAWER_CLOSE_BTN}">✕</button>
      </div>
      <div style="${STYLES.DRAWER_CONTENT}">
        <div style="${STYLES.ACTION_BUTTONS_CONTAINER}">
          ${buttonsHtml}
        </div>
      </div>
    `;
  }

  /**
   * 绑定按钮事件
   */
  private bindButtonEvents(): void {
    // 绑定关闭按钮事件
    const closeBtn = document.getElementById("tmall-order-enhance-drawer-close");
    if (closeBtn) {
      closeBtn.onclick = () => this.close();
    }

    // 绑定交互按钮事件
    const actionButtons = document.querySelectorAll<HTMLButtonElement>(".tmall-order-enhance-action-btn");
    actionButtons.forEach((btn) => {
      btn.onmouseenter = () => {
        btn.style.cssText = STYLES.ACTION_BUTTON + STYLES.ACTION_BUTTON_HOVER;
      };
      btn.onmouseleave = () => {
        btn.style.cssText = STYLES.ACTION_BUTTON;
      };
      btn.onclick = () => {
        const actionId = btn.getAttribute("data-action-id");
        const actionConfig = this.state.actionButtons.find((b) => b.id === actionId);
        if (actionConfig) {
          actionConfig.onClick();
        }
      };
    });
  }

  /**
   * 打开 Drawer
   */
  public open(): void {
    if (!this.state.maskElement || !this.state.containerElement) {
      console.error("Drawer 组件未初始化");
      return;
    }

    this.state.isOpen = true;
    this.state.maskElement.style.cssText = STYLES.DRAWER_MASK + STYLES.DRAWER_MASK_VISIBLE;
    this.state.containerElement.style.cssText = STYLES.DRAWER_CONTAINER + STYLES.DRAWER_CONTAINER_VISIBLE;

    console.log("Drawer 已打开");
  }

  /**
   * 关闭 Drawer
   */
  public close(): void {
    if (!this.state.maskElement || !this.state.containerElement) {
      console.error("Drawer 组件未初始化");
      return;
    }

    this.state.isOpen = false;
    this.state.maskElement.style.cssText = STYLES.DRAWER_MASK;
    this.state.containerElement.style.cssText = STYLES.DRAWER_CONTAINER;

    console.log("Drawer 已关闭");
  }

  /**
   * 切换 Drawer 状态
   */
  public toggle(): void {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * 获取当前状态
   */
  public isOpened(): boolean {
    return this.state.isOpen;
  }

  /**
   * 销毁 Drawer 组件
   */
  public destroy(): void {
    if (this.state.maskElement) {
      this.state.maskElement.remove();
      this.state.maskElement = null;
    }
    if (this.state.containerElement) {
      this.state.containerElement.remove();
      this.state.containerElement = null;
    }
    this.state.isOpen = false;
    console.log("Drawer 组件已销毁");
  }
}

// 导出单例
export const drawerManager = new DrawerManager();