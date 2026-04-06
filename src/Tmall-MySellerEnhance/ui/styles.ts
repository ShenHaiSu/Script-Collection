/**
 * 订单增强 UI 样式 (styles.ts)
 */
export const STYLES = {
  /**
   * 浮动触发按钮样式
   */
  FLOATING_BTN: `
    position: fixed;
    right: 20px;
    bottom: 80px;
    width: 56px;
    height: 56px;
    background: #ff5000;
    color: white;
    border-radius: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(255, 80, 0, 0.4);
    z-index: 99998;
    font-size: 24px;
    transition: transform 0.2s, background 0.2s;
  `,

  /**
   * Drawer 遮罩层样式
   */
  DRAWER_MASK: `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99999;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s;
  `,

  /**
   * Drawer 遮罩层显示状态
   */
  DRAWER_MASK_VISIBLE: `
    opacity: 1;
    visibility: visible;
  `,

  /**
   * Drawer 容器样式
   */
  DRAWER_CONTAINER: `
    position: fixed;
    top: 0;
    right: 0;
    width: 320px;
    height: 100%;
    background: #fff;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    z-index: 100000;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  `,

  /**
   * Drawer 容器显示状态
   */
  DRAWER_CONTAINER_VISIBLE: `
    transform: translateX(0);
  `,

  /**
   * Drawer 头部样式
   */
  DRAWER_HEADER: `
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
  `,

  /**
   * Drawer 标题样式
   */
  DRAWER_TITLE: `
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0;
  `,

  /**
   * Drawer 关闭按钮样式
   */
  DRAWER_CLOSE_BTN: `
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 20px;
    color: #999;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    transition: background 0.2s;
  `,

  /**
   * Drawer 内容区域样式
   */
  DRAWER_CONTENT: `
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  `,

  /**
   * 交互按钮组容器样式
   */
  ACTION_BUTTONS_CONTAINER: `
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,

  /**
   * 交互按钮样式
   */
  ACTION_BUTTON: `
    width: 100%;
    padding: 12px 16px;
    background: #fff7f2;
    border: 1px solid #ffdec7;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    text-align: left;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
  `,

  /**
   * 交互按钮 hover 状态样式
   */
  ACTION_BUTTON_HOVER: `
    background: #ff5000;
    border-color: #ff5000;
    color: #fff;
  `,

  /**
   * 交互按钮图标样式
   */
  ACTION_BUTTON_ICON: `
    font-size: 18px;
    width: 24px;
    text-align: center;
  `,

  /**
   * 交互按钮文字样式
   */
  ACTION_BUTTON_TEXT: `
    flex: 1;
  `,

  /**
   * Drawer 快捷输入框容器样式
   */
  DRAWER_INPUT_CONTAINER: `
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
    background: #f8f8f8;
  `,

  /**
   * Drawer 快捷输入框样式
   */
  DRAWER_INPUT: `
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s;
  `,

  /**
   * Drawer 快捷输入框聚焦样式
   */
  DRAWER_INPUT_FOCUS: `
    border-color: #ff5000;
    box-shadow: 0 0 0 2px rgba(255, 80, 0, 0.1);
  `,

  /**
   * Drawer 快捷输入提示文字样式
   */
  DRAWER_HINT: `
    margin-top: 8px;
    font-size: 12px;
    color: #999;
    line-height: 1.4;
  `,

  /**
   * Drawer 按钮编号样式 (隐藏显示)
   */
  ACTION_BUTTON_NUMBER: `
    display: none;
  `,
};