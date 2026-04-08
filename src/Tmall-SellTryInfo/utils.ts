/**
 * 工具函数模块
 * 提供通用的工具函数
 */

import { ScrapedResult, IDataStore } from "./types";

// #region 基础工具函数
/**
 * 等待指定的时间（毫秒）
 * @param ms 毫秒数
 * @returns Promise
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let lastTime = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn(...args);
    }
  }) as T;
}

/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID
 */
export function generateId(prefix: string = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 安全地执行函数，捕获错误
 * @param fn 要执行的函数
 * @param defaultValue 默认返回值
 * @returns 执行结果或默认值
 */
export function safeExecute<T>(fn: () => T, defaultValue: T): T {
  try {
    return fn();
  } catch (error) {
    console.error("执行失败:", error);
    return defaultValue;
  }
}

/**
 * 异步安全地执行函数
 * @param fn 要执行的异步函数
 * @param defaultValue 默认返回值
 * @returns 执行结果或默认值
 */
export async function safeExecuteAsync<T>(fn: () => Promise<T>, defaultValue: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("异步执行失败:", error);
    return defaultValue;
  }
}
// #endregion

// #region 数据存储
/**
 * 创建数据存储容器
 * @returns 数据存储实例
 */
export function createDataStore(): IDataStore {
  const results: ScrapedResult[] = [];

  return {
    get results() {
      return results;
    },
    clear() {
      results.length = 0;
    },
    add(item: ScrapedResult) {
      results.push(item);
    },
    getAll() {
      return [...results];
    },
    getByIndex(index: number) {
      return results[index];
    },
    removeByIndex(index: number) {
      if (index >= 0 && index < results.length) {
        results.splice(index, 1);
        return true;
      }
      return false;
    },
    findIndex(text: string) {
      if (!text || results.length === 0) return -1;
      // 从末尾向前比较
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i].text === text) return i;
      }
      return -1;
    },
  };
}

/**
 * 默认数据存储实例
 */
export const dataStore = createDataStore();
// #endregion

// #region 字符串工具
/**
 * 截断字符串
 * @param str 原始字符串
 * @param maxLength 最大长度
 * @param ellipsis 省略号
 * @returns 截断后的字符串
 */
export function truncate(str: string, maxLength: number, ellipsis: string = "..."): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * 清理字符串（去除首尾空白）
 * @param str 原始字符串
 * @returns 清理后的字符串
 */
export function trim(str: string | null | undefined): string {
  return str?.trim() ?? "";
}

/**
 * 格式化字符串模板
 * @param template 模板字符串
 * @param data 数据对象
 * @returns 格式化后的字符串
 */
export function format(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ""));
}
// #endregion

// #region 数组工具
/**
 * 分组数组
 * @param array 原始数组
 * @param keyFn 分组键函数
 * @returns 分组后的对象
 */
export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * 去重数组
 * @param array 原始数组
 * @param keyFn 去重键函数
 * @returns 去重后的数组
 */
export function unique<T>(array: T[], keyFn?: (item: T) => any): T[] {
  if (!keyFn) return [...new Set(array)];
  const seen = new Set();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * 批量处理数组
 * @param array 原始数组
 * @param processor 处理函数
 * @param concurrency 并发数
 * @returns 处理结果
 */
export async function batchProcess<T, R>(
  array: T[],
  processor: (item: T, index: number) => Promise<R>,
  concurrency: number = 1
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < array.length; i += concurrency) {
    const batch = array.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((item, j) => processor(item, i + j)));
    results.push(...batchResults);
  }
  return results;
}
// #endregion

// #region 对象工具
/**
 * 深度克隆对象
 * @param obj 原始对象
 * @returns 克隆后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as any;
  if (obj instanceof Object) {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

/**
 * 合并对象
 * @param target 目标对象
 * @param sources 源对象
 * @returns 合并后的对象
 */
export function merge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  for (const source of sources) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key] as T[Extract<keyof T, string>];
      }
    }
  }
  return target;
}

/**
 * 选取对象的部分属性
 * @param obj 原始对象
 * @param keys 要选取的属性
 * @returns 选取后的对象
 */
export function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * 排除对象的部分属性
 * @param obj 原始对象
 * @param keys 要排除的属性
 * @returns 排除后的对象
 */
export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete (result as Record<string, unknown>)[key as string];
  }
  return result as Omit<T, K>;
}
// #endregion

// #region DOM 工具
/**
 * 判断元素是否在视口内
 * @param element 元素
 * @returns 是否在视口内
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 滚动元素到视图中心
 * @param element 元素
 * @param smooth 是否平滑滚动
 */
export function scrollToElement(element: HTMLElement, smooth: boolean = true): void {
  element.scrollIntoView({
    behavior: smooth ? "smooth" : "auto",
    block: "center",
    inline: "center",
  });
}

/**
 * 等待元素出现
 * @param selector 选择器
 * @param timeout 超时时间（毫秒）
 * @returns 元素或 null
 */
export async function waitForElement(selector: string, timeout: number = 5000): Promise<Element | null> {
  const element = document.querySelector(selector);
  if (element) return element;

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(document.querySelector(selector));
    }, timeout);
  });
}

/**
 * 等待多个元素出现
 * @param selector 选择器
 * @param count 期望的元素数量
 * @param timeout 超时时间（毫秒）
 * @returns 元素列表
 */
export async function waitForElements(selector: string, count: number, timeout: number = 5000): Promise<Element[]> {
  const elements = Array.from(document.querySelectorAll(selector));
  if (elements.length >= count) return elements;

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const elements = Array.from(document.querySelectorAll(selector));
      if (elements.length >= count) {
        observer.disconnect();
        resolve(elements);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(Array.from(document.querySelectorAll(selector)));
    }, timeout);
  });
}
// #endregion

// #region 验证工具
/**
 * 验证 URL
 * @param url  URL 字符串
 * @returns 是否为有效 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证商品 ID
 * @param itemId 商品 ID
 * @returns 是否为有效商品 ID
 */
export function isValidItemId(itemId: string): boolean {
  return !!itemId && itemId.length > 0;
}

/**
 * 验证采集结果
 * @param result 采集结果
 * @returns 是否有效
 */
export function isValidResult(result: ScrapedResult): boolean {
  return !!(result && result.itemId && result.itemName);
}
// #endregion