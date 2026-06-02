/**
 * LLM Interface Enhance - 辅助函数
 *
 * 提供各种工具函数，用于数据处理、DOM操作、格式化等
 */

// #region 日期格式化
/**
 * 格式化日期为本地字符串
 * @param date 日期对象或时间戳
 * @param options 格式化选项
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number | string, options: Intl.DateTimeFormatOptions = {}): string {
  const dateObj = new Date(date);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    ...options,
  };

  return dateObj.toLocaleString("zh-CN", defaultOptions);
}

/**
 * 格式化日期为简短格式
 * @param date 日期对象或时间戳
 * @returns 简短格式的日期字符串
 */
export function formatDateShort(date: Date | number | string): string {
  return formatDate(date, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 获取相对时间描述
 * @param date 日期对象或时间戳
 * @returns 相对时间描述
 */
export function getRelativeTime(date: Date | number | string): string {
  const now = new Date();
  const dateObj = new Date(date);
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "刚刚";
  } else if (diffMin < 60) {
    return `${diffMin}分钟前`;
  } else if (diffHour < 24) {
    return `${diffHour}小时前`;
  } else if (diffDay < 7) {
    return `${diffDay}天前`;
  } else {
    return formatDateShort(date);
  }
}
// #endregion

// #region 数字格式化
/**
 * 格式化数字为千分位格式
 * @param num 数字
 * @param decimals 小数位数
 * @returns 格式化后的数字字符串
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 格式化货币
 * @param amount 金额
 * @param currency 货币代码
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * 格式化Token数量
 * @param tokens Token数量
 * @returns 格式化后的Token字符串
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  } else {
    return tokens.toString();
  }
}

/**
 * 格式化百分比
 * @param value 数值
 * @param total 总数
 * @param decimals 小数位数
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return "0%";
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
}
// #endregion

// #region DOM操作
/**
 * 创建DOM元素
 * @param tag 标签名
 * @param attributes 属性
 * @param children 子元素或文本
 * @returns 创建的DOM元素
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, string> = {},
  children: (HTMLElement | string)[] = [],
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  // 设置属性
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "className") {
      element.className = value;
    } else if (key === "textContent") {
      element.textContent = value;
    } else if (key === "innerHTML") {
      element.innerHTML = value;
    } else {
      element.setAttribute(key, value);
    }
  });

  // 添加子元素
  children.forEach((child) => {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });

  return element;
}

/**
 * 安全地查询单个DOM元素
 * @param selector CSS选择器
 * @param parent 父元素
 * @returns 找到的元素或null
 */
export function querySelector<K extends keyof HTMLElementTagNameMap>(
  selector: string,
  parent: Document | HTMLElement = document,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(selector);
}

/**
 * 安全地查询多个DOM元素
 * @param selector CSS选择器
 * @param parent 父元素
 * @returns 找到的元素数组
 */
export function querySelectorAll<K extends keyof HTMLElementTagNameMap>(
  selector: string,
  parent: Document | HTMLElement = document,
): HTMLElementTagNameMap[K][] {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * 等待元素出现
 * @param selector CSS选择器
 * @param timeout 超时时间（毫秒）
 * @returns Promise，解析为找到的元素
 */
export function waitForElement<K extends keyof HTMLElementTagNameMap>(selector: string, timeout: number = 10000): Promise<HTMLElementTagNameMap[K]> {
  return new Promise((resolve, reject) => {
    // 先检查元素是否已存在
    const element = querySelector<K>(selector);
    if (element) {
      resolve(element);
      return;
    }

    // 设置超时
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`等待元素 ${selector} 超时`));
    }, timeout);

    // 创建MutationObserver监听DOM变化
    const observer = new MutationObserver((mutations) => {
      const element = querySelector<K>(selector);
      if (element) {
        clearTimeout(timeoutId);
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
// #endregion

// #region 数据操作
/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as T;
  }

  if (typeof obj === "object") {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 限制时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
// #endregion

// #region 字符串操作
/**
 * 截断字符串
 * @param str 原字符串
 * @param maxLength 最大长度
 * @param suffix 后缀
 * @returns 截断后的字符串
 */
export function truncate(str: string, maxLength: number, suffix: string = "..."): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 生成随机ID
 * @param length ID长度
 * @returns 随机ID字符串
 */
export function generateId(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * 转义HTML特殊字符
 * @param str 要转义的字符串
 * @returns 转义后的字符串
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&",
    "<": "<",
    ">": ">",
    '"': '"',
    "'": "&#039;",
  };

  return str.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
}
// #endregion

// #region 平台特定辅助函数
/**
 * 检测页面是否使用React
 * @returns 是否使用React
 */
export function isReactPage(): boolean {
  return !!document.querySelector('[data-reactroot], [data-reactroot=""]') || Object.keys(document.body).some((k) => k.startsWith("__react"));
}

/**
 * 检测页面是否使用Vue
 * @returns Vue版本或null
 */
export function getVueVersion(): string | null {
  if ((window as any).__VUE__) return "vue3";
  if ((window as any).Vue) return "vue2";
  return null;
}

/**
 * 获取URL参数
 * @param name 参数名
 * @returns 参数值
 */
export function getUrlParam(name: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * 检查URL是否匹配模式
 * @param pattern URL模式（支持*通配符）
 * @returns 是否匹配
 */
export function urlMatchesPattern(pattern: string): boolean {
  const currentUrl = window.location.href;
  const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
  return regex.test(currentUrl);
}
// #endregion

// #region 本地存储辅助函数
/**
 * 从GM存储读取数据
 * @param key 键名
 * @param defaultValue 默认值
 * @returns 存储的值
 */
export function getStorageValue<T>(key: string, defaultValue: T): T {
  try {
    const value = GM_getValue(key);
    return value !== undefined ? (value as T) : defaultValue;
  } catch (error) {
    console.warn(`读取存储失败: ${key}`, error);
    return defaultValue;
  }
}

/**
 * 保存数据到GM存储
 * @param key 键名
 * @param value 值
 */
export function setStorageValue<T>(key: string, value: T): void {
  try {
    GM_setValue(key, value);
  } catch (error) {
    console.warn(`保存存储失败: ${key}`, error);
  }
}

/**
 * 显示GM通知
 * @param title 标题
 * @param text 内容
 * @param timeout 超时时间（毫秒）
 */
export function showNotification(title: string, text: string, timeout: number = 3000): void {
  try {
    GM_notification({
      title: title,
      text: text,
      timeout: timeout,
    });
  } catch (error) {
    console.warn("显示通知失败", error);
    // 降级为console.log
    console.log(`${title}: ${text}`);
  }
}
// #endregion
