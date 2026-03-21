/**
 * @fileoverview 时间工具模块
 * @description 提供时间相关的工具函数，用于生成货号所需的时间戳格式
 */

/**
 * 获取当前时间的 mmdd 格式字符串
 * 
 * @returns {string} 格式化为 mmdd 的字符串（例如上午9点30分返回 "0930"）
 * 
 * @example
 * // 假设当前时间为 09:30:15
 * getCurrentTimeMmss(); // 返回 "0930"
 * 
 * @example
 * // 假设当前时间为 14:05:00
 * getCurrentTimeMmss(); // 返回 "1405"
 */
export function getCurrentTimeMmss(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // 格式化时间为 mmdd 格式（不足两位前面补0）
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  
  return formattedHours + formattedMinutes;
}

/**
 * 获取当前时间的详细格式化字符串
 * 
 * @param separator - 时间分隔符，默认为空字符串
 * @returns {string} 格式化的时间字符串
 * 
 * @example
 * getCurrentTimeFormatted(); // "0930"
 * getCurrentTimeFormatted(':'); // "09:30"
 * getCurrentTimeFormatted('-'); // "09-30"
 */
export function getCurrentTimeFormatted(separator: string = ""): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  
  return `${formattedHours}${separator}${formattedMinutes}`;
}

/**
 * 获取当前日期时间戳（用于调试）
 * 
 * @returns {string} 完整的 ISO 时间字符串
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}