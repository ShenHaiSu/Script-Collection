/**
 * 页面 UI 增强样式 (styles.ts)
 */
export const STYLES = {
  OVERLAY: `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 99999;
    display: none;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(5px);
    transition: opacity 0.3s;
  `,
  CARD: `
    background: #fff;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    width: 80%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  `,
  CLOSE_BTN: `
    position: absolute;
    top: 12px;
    right: 12px;
    cursor: pointer;
    font-size: 24px;
    color: #999;
    border: none;
    background: transparent;
    line-height: 1;
  `,
  TITLE: `
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: bold;
    color: #333;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
  `,
  SECTION: `
    margin-bottom: 24px;
    padding: 16px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #eee;
  `,
  SECTION_TITLE: `
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #444;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  INFO_CONTENT: `
    font-size: 14px;
    color: #666;
    word-break: break-all;
    white-space: pre-wrap;
    max-height: 150px;
    overflow-y: auto;
    background: #fff;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  `,
  ITEM_CHIP_CONTAINER: `
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px;
  `,
  ITEM_CHIP: `
    padding: 6px 12px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
  `,
  ITEM_CHIP_ACTIVE: `
    background: #fff7f2;
    border-color: #ff5000;
    color: #ff5000;
  `,
  COPY_BTN: `
    background: #ff5000;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
  `,
  UNSELECT_BTN: `
    background: #999;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
    margin-right: 8px;
  `,
  EDIT_BTN: `
    background: #4b5563;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
    margin-right: 8px;
  `,
  EDIT_TEXTAREA: `
    width: 100%;
    min-height: 100px;
    padding: 8px;
    border: 1px solid #ff5000;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.5;
    font-family: inherit;
    box-sizing: border-box;
    margin-top: 8px;
    resize: vertical;
    white-space: pre;
  `,
  DISABLED_BTN: `
    background: #ccc !important;
    cursor: not-allowed !important;
    opacity: 0.7;
  `,
  INPUT_GROUP: `
    margin-bottom: 24px;
    padding: 16px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #eee;
  `,
  INPUT_LABEL: `
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #444;
  `,
  INPUT_CONTROL: `
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
    outline: none;
  `,
  ACTION_ROW: `
    display: flex;
    gap: 12px;
    margin-top: 16px;
    margin-bottom: 12px;
  `,
  GENERATE_BTN: `
    flex: 1;
    background: #ff5000;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 15px;
    font-weight: bold;
    transition: background 0.2s;
  `,
  CLEAR_BTN: `
    width: 80px;
    background: #666;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 15px;
    transition: background 0.2s;
  `,
  RESULT_TEXTAREA: `
    width: 100%;
    height: 150px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
    font-family: monospace;
    resize: vertical;
    box-sizing: border-box;
    white-space: pre;
    overflow-x: auto;
  `,
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
};
