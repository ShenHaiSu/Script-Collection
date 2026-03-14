import { ScrapedResult } from "./type";

// #region 工具函数
/**
 * 等待指定的时间（毫秒）
 * @param ms 毫秒数
 * @returns Promise
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 等待元素出现
 * @param selector CSS 选择器
 * @param timeout 超时时间（毫秒），默认为 5000ms
 * @returns Promise<Element | null>
 */
export const waitForElement = async (selector: string, timeout = 5000): Promise<Element | null> => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = document.querySelector(selector);
    if (el) return el;
    await sleep(200);
  }
  return null;
};
// #endregion

// #region 内存变量存储
/**
 * 内存变量存储容器，用于管理采集到的结果
 */
export const dataStore = {
  results: [] as ScrapedResult[],
  clear() {
    this.results = [];
  },
  add(item: ScrapedResult) {
    this.results.push(item);
  },
  getAll() {
    return this.results;
  },
};
// #endregion
