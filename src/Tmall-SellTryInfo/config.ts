/**
 * 全局配置模块
 * 集中管理脚本的所有配置项，便于维护和修改
 */

// #region 调试配置
/** 是否开启调试模式（开启后仅采集前两条数据） */
export const DEBUG_MODE = false;

/** 调试模式下采集的数据条数 */
export const DEBUG_ITEM_COUNT = 2;
// #endregion

// #region 时间配置
/** 按钮点击后的等待时间（毫秒） */
export const BUTTON_CLICK_DELAY = 800;

/** 抽屉弹窗打开后的等待时间（毫秒） */
export const DRAWER_OPEN_DELAY = 1000;
// #endregion

// #region 选择器配置
/** 页面元素选择器集合 */
export const SELECTORS = {
  // 表格相关
  tableBody: "table > tbody",
  tableRow: "tr[data-row-key]",
  tableRowKey: "data-row-key",

  // 商品信息
  itemImage: "td img",
  itemLink: "a",
  itemId: "data-row-key",

  // 操作按钮
  actionButton: "td:last-child button",

  // Tab 切换
  shareTab: "div.tbd-tabs-nav-wrap div[data-node-key='item']",

  // 抽屉弹窗
  drawerContent: "div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body > div",
  drawerButtons: "div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body > div > button",

  // 表单相关
  formInput: "form > div input",
  formDiv: "form > div",
} as const;

// #region CSS 类名配置
/** 动态生成的 CSS 类名前缀 */
export const CSS_PREFIX = "sell-try-info";

// #region 消息配置
export const MESSAGES = {
  // 遮罩层
  scraping: "正在采集商品信息...",
  completed: "采集完成!",
  preparing: "准备中...",

  // 进度
  requestingPermission: "正在请求剪切板权限...",
  gettingTableData: "正在获取表格数据...",
  processingItem: (index: number) => `正在处理第 ${index} 个商品...`,
  processedItem: (id: string) => `已处理: ${id}`,

  // 错误
  noPermission: "请授予剪切板访问权限以继续执行脚本",
  noTableData: "未找到表格数据 (table > tbody)",
  noValidRows: "未找到有效的商品行数据",
  noInputFields: "未找到预期的两个输入框",
  noForm: "未找到 form 标签",
  noEnoughDivs: "form 下的 div 数量不足 2 个",

  // 完成
  noData: "未采集到任何数据，请查看控制台日志。",
  completedWithCount: (success: number, total: number) => `采集完成，成功 ${success}/${total} 条`,
  error: "执行过程中发生错误，详情请查看控制台。",

  // 初始化
  initializing: "天猫千牛店铺新品试销信息自动获取脚本初始化中...",
  initialized: "脚本初始化完成，按钮已添加",
  started: "天猫千牛店铺新品试销信息自动获取脚本已启动",
} as const;
// #endregion