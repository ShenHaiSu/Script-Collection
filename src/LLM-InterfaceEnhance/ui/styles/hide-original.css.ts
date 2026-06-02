/**
 * 隐藏原始界面的 CSS 样式
 *
 * 用于隐藏页面原始内容，仅保留脚本创建的新界面
 */

export const HIDE_ORIGINAL_STYLES = `
  /* 隐藏原始界面，但保留我们的新界面 */
  body > *:not(#llm-enhance-container):not(#llm-enhance-styles):not(#llm-enhance-hide-original) {
    display: none !important;
  }
  
  /* 确保新界面可见 */
  #llm-enhance-container {
    display: block !important;
    visibility: visible !important;
  }
`;
