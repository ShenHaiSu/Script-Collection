import {ScrapedResult} from "./type";

// #region 工具函数
/**
 * 等待指定的时间（毫秒）
 * @param ms 毫秒数
 * @returns Promise
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
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
