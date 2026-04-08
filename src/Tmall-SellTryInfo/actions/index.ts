/**
 * 动作系统模块
 * 提供动作注册表和基础动作类，支持横向扩展新功能
 */

import { IAction, IActionContext, IActionRegistry, IActionConfig, ButtonConfig } from "../types";
import { dataStore } from "../utils";
import { DEBUG_MODE, DEBUG_ITEM_COUNT } from "../config";

// #region 动作注册表
/**
 * 动作注册表实现
 * 用于注册和管理所有动作
 */
class ActionRegistryImpl implements IActionRegistry {
  private actions: Map<string, IAction> = new Map();
  private priorities: Map<string, number> = new Map();

  register(action: IAction): void {
    if (this.actions.has(action.id)) {
      console.warn(`动作 ${action.id} 已存在，将被覆盖`);
    }
    this.actions.set(action.id, action);
    console.log(`动作已注册: ${action.id} - ${action.name}`);
  }

  unregister(id: string): boolean {
    return this.actions.delete(id);
  }

  get(id: string): IAction | undefined {
    return this.actions.get(id);
  }

  getAll(): IAction[] {
    return Array.from(this.actions.values());
  }

  getByPriority(): IAction[] {
    return this.getAll().sort((a, b) => {
      const priorityA = this.priorities.get(a.id) ?? 100;
      const priorityB = this.priorities.get(b.id) ?? 100;
      return priorityA - priorityB;
    });
  }

  /**
   * 设置动作优先级
   * @param id 动作ID
   * @param priority 优先级（数字越小越靠前）
   */
  setPriority(id: string, priority: number): void {
    this.priorities.set(id, priority);
  }
}

/**
 * 全局动作注册表实例
 */
export const actionRegistry = new ActionRegistryImpl();

// #region 动作基类
/**
 * 基础动作抽象类
 * 提供动作的通用实现
 */
export abstract class BaseAction implements IAction {
  abstract readonly id: string;
  abstract readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  protected priority: number = 100;

  constructor(config?: IActionConfig) {
    if (config) {
      this.description = config.description;
      this.icon = config.icon;
      if (config.priority !== undefined) {
        this.priority = config.priority;
        // 延迟设置优先级，确保 id 已被初始化
        setTimeout(() => {
          actionRegistry.setPriority(this.id, config.priority!);
        }, 0);
      }
    }
  }

  abstract execute(context: IActionContext): Promise<boolean>;

  canExecute?(context: IActionContext): boolean {
    return true;
  }

  /**
   * 获取动作配置
   */
  getConfig(): IActionConfig {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      priority: this.priority,
    };
  }
}

// #region 预定义动作
/**
 * 采集分享链接动作
 * 这是默认的主要动作
 */
export class ScrapeShareTextAction extends BaseAction {
  readonly id = "scrape-share-text";
  readonly name = "获取本页信息";
  readonly description = "采集商品图片和分享链接文本";
  readonly icon = "📋";

  constructor() {
    super({ id: "scrape-share-text", name: "获取本页信息", priority: 10 });
  }

  async execute(context: IActionContext): Promise<boolean> {
    const { row, rowIndex, results, dataStore, updateProgress } = context;

    // 1. 提取商品基础信息
    const { extractItemInfoFromRow, getActionButtonFromRow, safeClickButton, switchToShareTab, clickGenerateTokenButton, readFromClipboard, closeDrawer, waitForDrawerOpen } = await import("../dom");
    
    const itemInfo = extractItemInfoFromRow(row);
    if (!itemInfo) {
      console.warn("跳过无效商品行");
      return false;
    }

    // 2. 获取并点击操作按钮，打开详情抽屉
    const actionButton = getActionButtonFromRow(row);
    if (!(await safeClickButton(actionButton, 1000))) {
      console.warn("无法打开商品详情抽屉，跳过此项");
      return false;
    }

    // 3. 切换到分享 tab
    if (!(await switchToShareTab())) {
      console.warn("切换分享 tab 失败，尝试继续处理");
    }

    // 4. 点击生成口令按钮
    if (!(await clickGenerateTokenButton())) {
      console.warn("生成口令失败，尝试继续处理");
    }

    // 5. 读取剪切板中的分享链接
    itemInfo.text = await readFromClipboard();

    // 6. 验证数据完整性
    if (!itemInfo.text) console.warn("采集到的分享链接为空，但仍记录数据");

    // 7. 检查重复
    const duplicateIndex = dataStore.findIndex(itemInfo.text);
    if (duplicateIndex !== -1) {
      const errorMsg = `检测到重复分享链接！当前第 ${rowIndex + 1} 个TR的分享链接与第 ${duplicateIndex + 1} 个TR的分享链接重复。`;
      console.error(errorMsg);

      // 关闭当前抽屉
      await closeDrawer();

      // 抛出解析错误
      throw new Error(`解析失效：在第 ${rowIndex + 1} 个TR发生解析失效问题`);
    }

    // 8. 存储采集结果
    dataStore.add(itemInfo);
    console.log(`已采集商品：${itemInfo.itemId} - ${itemInfo.itemName}`);

    // 9. 关闭抽屉，准备处理下一项
    if (!(await closeDrawer())) console.warn("关闭抽屉失败，可能影响后续操作");

    return true;
  }
}

// #region 动作执行器
/**
 * 动作执行器
 * 负责协调多个动作的执行
 */
export class ActionExecutor {
  private context: IActionContext;

  constructor(updateProgress: (current: number, total: number, message: string) => void) {
    this.context = {
      row: null as unknown as HTMLTableRowElement,
      rowIndex: 0,
      results: [],
      dataStore: dataStore,
      updateProgress,
      cancelled: false,
    };
  }

  /**
   * 执行所有已注册的动作
   * @param rows 表格行列表
   * @returns 执行结果
   */
  async executeAll(rows: HTMLTableRowElement[]): Promise<{ success: number; failed: number; results: any[] }> {
    // DEBUG 模式下仅处理前几条数据
    const processedRows = DEBUG_MODE ? rows.slice(0, DEBUG_ITEM_COUNT) : rows;
    
    let success = 0;
    let failed = 0;

    const actions = actionRegistry.getByPriority();
    const total = processedRows.length;

    for (let i = 0; i < processedRows.length; i++) {
      const row = processedRows[i];
      
      // 更新上下文
      this.context.row = row;
      this.context.rowIndex = i;
      this.context.results = dataStore.getAll();

      try {
        // 依次执行每个动作
        for (const action of actions) {
          if (this.context.cancelled) break;
          
          // 检查动作是否可执行
          if (action.canExecute && !action.canExecute(this.context)) {
            continue;
          }

          const result = await action.execute(this.context);
          if (result) {
            success++;
          } else {
            failed++;
          }
        }
      } catch (error) {
        console.error(`处理第 ${i + 1} 行时发生错误:`, error);
        failed++;
        
        // 如果是解析失效错误，终止整个流程
        if (error instanceof Error && error.message.includes("解析失效")) {
          throw error;
        }
      }
    }

    return {
      success,
      failed,
      results: dataStore.getAll(),
    };
  }

  /**
   * 取消执行
   */
  cancel(): void {
    this.context.cancelled = true;
  }
}

// #region 按钮管理器
/**
 * 按钮管理器
 * 负责创建和管理页面上的按钮
 */
export class ButtonManager {
  private buttons: Map<string, HTMLButtonElement> = new Map();
  private container: HTMLElement | null = null;

  /**
   * 初始化按钮管理器
   * @param container 按钮容器元素
   */
  init(container: HTMLElement): void {
    this.container = container;
  }

  /**
   * 注册按钮
   * @param config 按钮配置
   */
  registerButton(config: ButtonConfig): HTMLButtonElement {
    // 如果按钮已存在，先移除
    if (this.buttons.has(config.id)) {
      this.removeButton(config.id);
    }

    const button = document.createElement("button");
    button.id = config.id;
    button.innerText = config.text;
    button.type = "button";
    
    if (config.className) {
      button.className = config.className;
    }
    
    if (config.style) {
      Object.assign(button.style, config.style);
    }

    // 添加点击事件
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      await config.onClick(e);
    });

    // 存储按钮
    this.buttons.set(config.id, button);

    // 如果容器已初始化，立即添加到容器
    if (this.container) {
      this.addToContainer(button, config.order);
    }

    return button;
  }

  /**
   * 移除按钮
   * @param id 按钮ID
   */
  removeButton(id: string): boolean {
    const button = this.buttons.get(id);
    if (button) {
      button.remove();
      this.buttons.delete(id);
      return true;
    }
    return false;
  }

  /**
   * 获取按钮
   * @param id 按钮ID
   */
  getButton(id: string): HTMLButtonElement | undefined {
    return this.buttons.get(id);
  }

  /**
   * 显示按钮
   * @param id 按钮ID
   */
  showButton(id: string): void {
    const button = this.buttons.get(id);
    if (button) {
      button.style.display = "";
    }
  }

  /**
   * 隐藏按钮
   * @param id 按钮ID
   */
  hideButton(id: string): void {
    const button = this.buttons.get(id);
    if (button) {
      button.style.display = "none";
    }
  }

  /**
   * 将按钮添加到容器
   * @param button 按钮元素
   * @param order 排序顺序
   */
  private addToContainer(button: HTMLButtonElement, order?: number): void {
    if (!this.container) return;

    const existingButtons = Array.from(this.container.children) as HTMLButtonElement[];
    
    if (order === undefined || existingButtons.length === 0) {
      this.container.appendChild(button);
      return;
    }

    // 按顺序插入
    let inserted = false;
    for (let i = 0; i < existingButtons.length; i++) {
      const existingButton = existingButtons[i];
      const existingOrder = this.getButtonOrder(existingButton);
      if (order < existingOrder) {
        this.container.insertBefore(button, existingButton);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      this.container.appendChild(button);
    }
  }

  /**
   * 获取按钮的排序顺序
   */
  private getButtonOrder(button: HTMLButtonElement): number {
    const id = button.id;
    const config = this.buttons.get(id);
    const order = config?.style?.order;
    // CSS order 属性可能是字符串或数字
    return order !== undefined ? (typeof order === "number" ? order : parseInt(order, 10) || 100) : 100;
  }
}

/**
 * 全局按钮管理器实例
 */
export const buttonManager = new ButtonManager();

// #region 动作初始化
/**
 * 初始化动作系统
 * 注册所有内置动作
 */
export function initActions(): void {
  // 注册默认动作
  actionRegistry.register(new ScrapeShareTextAction());
  console.log("动作系统初始化完成");
}

// #region 便捷函数
/**
 * 创建标准按钮配置
 * @param id 按钮ID
 * @param text 按钮文本
 * @param onClick 点击事件处理函数
 * @param order 排序顺序
 * @returns 按钮配置
 */
export function createButtonConfig(
  id: string,
  text: string,
  onClick: (e: MouseEvent) => void | Promise<void>,
  order: number = 100
): ButtonConfig {
  return {
    id,
    text,
    className: "tbd-btn css-fd478t css-var-rb tbd-btn-primary tbd-btn-color-primary tbd-btn-variant-solid tbd-btn-lg",
    style: {
      marginRight: "10px",
    },
    onClick,
    order,
  };
}

/**
 * 注册自定义动作
 * @param action 动作实例
 */
export function registerCustomAction(action: IAction): void {
  actionRegistry.register(action);
}

/**
 * 创建自定义动作的便捷函数
 * @param config 动作配置
 * @param executeFn 执行函数
 * @returns 动作实例
 */
export function createAction(
  config: IActionConfig,
  executeFn: (context: IActionContext) => Promise<boolean>
): IAction {
  return {
    ...config,
    execute: executeFn,
  };
}