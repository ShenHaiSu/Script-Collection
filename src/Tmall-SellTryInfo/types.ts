/**
 * 类型定义模块
 * 集中管理所有类型定义，支持类型扩展
 */

// #region 基础类型
/**
 * 存储采集到的结果数据接口
 */
export interface ScrapedResult {
  /** 图片 URL */
  imgUrl: string;
  /** 采集到的文本内容 */
  text: string;
  /** 商品id */
  itemId: string;
  /** 商品名称 */
  itemName: string;
}

/**
 * 采集结果存储容器接口
 */
export interface IDataStore {
  results: ScrapedResult[];
  clear(): void;
  add(item: ScrapedResult): void;
  getAll(): ScrapedResult[];
  getByIndex(index: number): ScrapedResult | undefined;
  removeByIndex(index: number): boolean;
  findIndex(text: string): number;
}
// #endregion

// #region DOM 相关类型
/**
 * 遮罩层接口
 */
export interface Overlay {
  element: HTMLElement;
  updateProgress: (current: number, total: number, message: string) => void;
}

/**
 * 表格行数据接口
 */
export interface TableRowData {
  element: HTMLTableRowElement;
  itemId: string;
  itemName: string;
  imgUrl: string;
}

/**
 * 进度信息接口
 */
export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  message: string;
}
// #endregion

// #region 动作系统类型
/**
 * 动作基类接口
 * 所有动作必须实现此接口
 */
export interface IAction {
  /** 动作唯一标识 */
  readonly id: string;
  /** 动作显示名称 */
  readonly name: string;
  /** 动作描述 */
  readonly description?: string;
  /** 动作图标（可选） */
  readonly icon?: string;

  /**
   * 执行动作
   * @param context 动作执行上下文
   * @returns 是否执行成功
   */
  execute(context: IActionContext): Promise<boolean>;

  /**
   * 验证动作是否可用
   * @param context 动作执行上下文
   * @returns 是否可用
   */
  canExecute?(context: IActionContext): boolean;
}

/**
 * 动作执行上下文
 * 包含动作执行所需的所有信息
 */
export interface IActionContext {
  /** 当前处理的表格行元素 */
  row: HTMLTableRowElement;
  /** 行索引 */
  rowIndex: number;
  /** 已采集的所有结果 */
  results: ScrapedResult[];
  /** 共享的数据存储 */
  dataStore: IDataStore;
  /** 进度更新回调 */
  updateProgress: (current: number, total: number, message: string) => void;
  /** 取消标志 */
  cancelled: boolean;
}

/**
 * 动作注册表
 * 用于注册和管理所有动作
 */
export interface IActionRegistry {
  /** 注册动作 */
  register(action: IAction): void;
  /** 注销动作 */
  unregister(id: string): boolean;
  /** 获取动作 */
  get(id: string): IAction | undefined;
  /** 获取所有动作 */
  getAll(): IAction[];
  /** 按优先级获取动作 */
  getByPriority(): IAction[];
}

/**
 * 动作配置接口
 */
export interface IActionConfig {
  /** 动作ID */
  id: string;
  /** 动作名称 */
  name: string;
  /** 动作描述 */
  description?: string;
  /** 动作图标 */
  icon?: string;
  /** 优先级（数字越小越靠前） */
  priority?: number;
  /** 是否启用 */
  enabled?: boolean;
}

/**
 * 按钮配置接口
 */
export interface ButtonConfig {
  /** 按钮ID */
  id: string;
  /** 按钮显示文本 */
  text: string;
  /** 按钮样式类名 */
  className?: string;
  /** 按钮样式 */
  style?: Partial<CSSStyleDeclaration>;
  /** 按钮点击事件 */
  onClick: (e: MouseEvent) => void | Promise<void>;
  /** 按钮是否可见 */
  visible?: boolean;
  /** 按钮顺序（用于排序） */
  order?: number;
}
// #endregion

// #region UI 相关类型
/**
 * 表格配置接口
 */
export interface TableConfig {
  /** 表格ID */
  id?: string;
  /** 表格类名 */
  className?: string;
  /** 列配置 */
  columns: TableColumn[];
  /** 数据源 */
  data: ScrapedResult[];
  /** 是否显示分页 */
  pagination?: boolean;
  /** 每页数据条数 */
  pageSize?: number;
}

/**
 * 表格列配置
 */
export interface TableColumn {
  /** 列标题 */
  title: string;
  /** 数据字段 */
  dataIndex: keyof ScrapedResult;
  /** 列宽 */
  width?: string | number;
  /** 对齐方式 */
  align?: "left" | "center" | "right";
  /** 自定义渲染 */
  render?: (value: any, record: ScrapedResult, index: number) => string | HTMLElement;
}

/**
 * 弹窗配置接口
 */
export interface ModalConfig {
  /** 标题 */
  title: string;
  /** 内容 */
  content: string | HTMLElement;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认回调 */
  onConfirm?: () => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 是否点击遮罩关闭 */
  closeOnClickMask?: boolean;
}

/**
 * Toast 配置接口
 */
export interface ToastConfig {
  /** 消息内容 */
  message: string;
  /** 显示时长（毫秒） */
  duration?: number;
  /** 类型 */
  type?: "info" | "success" | "warning" | "error";
  /** 位置 */
  position?: "top" | "center" | "bottom";
}
// #endregion

// #region 错误类型
/**
 * 脚本错误基类
 */
export class ScriptError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "ScriptError";
  }
}

/**
 * 解析错误
 */
export class ParseError extends ScriptError {
  constructor(message: string, public readonly rowIndex?: number) {
    super(message, "PARSE_ERROR");
    this.name = "ParseError";
  }
}

/**
 * DOM 查找错误
 */
export class DomNotFoundError extends ScriptError {
  constructor(message: string, public readonly selector?: string) {
    super(message, "DOM_NOT_FOUND");
    this.name = "DomNotFoundError";
  }
}

/**
 * 权限错误
 */
export class PermissionError extends ScriptError {
  constructor(message: string) {
    super(message, "PERMISSION_DENIED");
    this.name = "PermissionError";
  }
}
// #endregion