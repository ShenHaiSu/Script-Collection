/**
 * Drawer 侧边栏组件 (drawer.ts)
 *
 * 重构说明：
 * 1. 支持每个 action 的 match 函数判定
 * 2. 在打开 drawer 之前动态过滤按钮显示
 * 3. 实现单页面应用下的动态功能切换
 * 4. 支持快捷输入框快速触发按钮
 */
import { STYLES } from "@/Tmall-MySellerEnhance/ui/styles";
import { drawerInputManager } from "@/Tmall-MySellerEnhance/ui/component/drawerInput";

/**
 * 交互按钮配置项
 * 扩展支持 match 函数用于动态判定是否显示
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
  /**
   * 匹配函数 - 判定当前页面是否需要显示该功能按钮
   * @returns true 表示当前页面需要显示该按钮，false 表示隐藏
   */
  match?: () => boolean;
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

    // 构建 Drawer 内容（初始化时传入空数组）
    this.state.containerElement.innerHTML = this.buildDrawerContent([]);

    // 添加到页面
    document.body.appendChild(this.state.maskElement);
    document.body.appendChild(this.state.containerElement);

    // 绑定按钮事件
    this.bindButtonEvents();
  }

  /**
   * 构建 Drawer 的 HTML 内容
   * @param availableButtons 当前页面可用的按钮列表（用于生成输入框提示）
   */
  private buildDrawerContent(availableButtons: ActionButtonConfig[] = []): string {
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

    // 构建快捷输入框 HTML
    const inputHtml = drawerInputManager.buildInputHtml(availableButtons);

    return `
      <div style="${STYLES.DRAWER_HEADER}">
        <h3 style="${STYLES.DRAWER_TITLE}">千牛后台增强工具</h3>
        <button id="tmall-order-enhance-drawer-close" style="${STYLES.DRAWER_CLOSE_BTN}">✕</button>
      </div>
      ${inputHtml}
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
    if (closeBtn) closeBtn.onclick = () => this.close();

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

    // 绑定快捷输入框事件
    drawerInputManager.bindEvents((buttonConfig) => {
      buttonConfig.onClick();
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

    // 自动聚焦到快捷输入框
    drawerInputManager.focus(150);

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
   * 在打开 drawer 之前，根据每个 action 的 match 函数动态过滤按钮
   */
  public toggle(): void {
    if (this.state.isOpen) {
      this.close();
    } else {
      // 打开前先过滤按钮 - 根据 match 函数动态显示/隐藏
      this.filterButtonsByMatch();
      this.open();
    }
  }

  /**
   * 刷新按钮显示状态
   * 公开方法，供外部调用（如路由变化时）
   * 重新根据 match 函数过滤并更新按钮显示
   */
  public refreshButtons(): void {
    this.filterButtonsByMatch();
  }

  /**
   * 根据每个 action 的 match 函数动态过滤按钮
   * 匹配成功的按钮显示，未匹配的按钮隐藏
   * @returns 当前页面可用的按钮配置数组
   */
  private filterButtonsByMatch(): ActionButtonConfig[] {
    const availableButtons = this.state.actionButtons.filter((btn) => {
      // 如果没有 match 函数，默认显示
      if (!btn.match) {
        return true;
      }
      return btn.match();
    });

    // 重建 drawer 内容（包含输入框）
    if (this.state.containerElement) {
      this.state.containerElement.innerHTML = this.buildDrawerContent(availableButtons);
      this.bindButtonEvents();
    }

    // 更新 drawer 中的按钮显示状态
    this.updateButtonsDisplay(availableButtons);

    console.log(
      "当前页面可用 actions:",
      availableButtons.map((b) => b.label).join(", ")
    );

    return availableButtons;
  }

  /**
   * 更新按钮的显示状态
   * @param availableButtons 当前页面可用的按钮配置
   */
  private updateButtonsDisplay(availableButtons: ActionButtonConfig[]): void {
    const availableIds = new Set(availableButtons.map((b) => b.id));

    // 获取所有按钮元素
    const buttonElements = document.querySelectorAll<HTMLButtonElement>(".tmall-order-enhance-action-btn");

    buttonElements.forEach((btn) => {
      const actionId = btn.getAttribute("data-action-id");
      if (actionId && availableIds.has(actionId)) {
        // 显示匹配的按钮
        btn.style.display = "";
      } else {
        // 隐藏不匹配的按钮
        btn.style.display = "none";
      }
    });

    // 检查是否有可见的按钮，如果没有则显示提示信息
    const visibleButtons = document.querySelectorAll<HTMLButtonElement>(
      '.tmall-order-enhance-action-btn[style*="display: none"]'
    );
    const totalButtons = buttonElements.length;
    const hiddenCount = visibleButtons.length;

    // 可以在这里添加"无可用功能"的提示逻辑
    if (totalButtons > 0 && hiddenCount === totalButtons) {
      console.log("当前页面没有可用的功能按钮");
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
    // 销毁输入框管理器
    drawerInputManager.destroy();

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