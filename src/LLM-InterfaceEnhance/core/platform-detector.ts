/**
 * UI 框架检测器
 *
 * 检测当前页面使用的前端框架，用于后续可能的框架特定适配
 */

// 扩展 Window 接口以支持框架检测
declare global {
  interface Window {
    __VUE__?: boolean;
    Vue?: any;
    ng?: any;
    jQuery?: any;
  }
}

/**
 * 检测页面使用的 UI 框架
 *
 * @returns 框架名称字符串
 */
export function detectUIFramework(): string {
  // React 检测
  const isReact =
    !!document.querySelector('[data-reactroot], [data-reactroot=""]') ||
    Object.keys(document.body).some((k) => k.startsWith("__react"));

  if (isReact) return "react";

  // Vue 检测
  if (window.__VUE__) return "vue3";
  if (window.Vue) return "vue2";

  // Angular 检测
  if (window.ng) return "angular";

  // jQuery 检测
  if (window.jQuery) return "jquery";

  return "unknown";
}

/**
 * 检测页面是否使用 React
 * @returns 是否使用 React
 */
export function isReactPage(): boolean {
  return detectUIFramework() === "react";
}

/**
 * 检测页面是否使用 Vue
 * @returns Vue 版本或 null
 */
export function getVueVersion(): string | null {
  const framework = detectUIFramework();
  return framework.startsWith("vue") ? framework : null;
}
