/**
 * 请求拦截引擎
 *
 * 负责拦截 XHR 和 Fetch 请求，与平台无关
 * 拦截到请求后调用当前平台的 shouldIntercept 和 parseResponse
 */

import { state } from "../state";
import { meta } from "../meta";
import type { PlatformAdapter } from "../platforms/types";
import type { InterceptedResponse } from "../types";
import { updateInterceptedCount } from "../ui/renderer";

/**
 * 设置请求拦截器
 *
 * @param platform 当前平台适配器
 */
export function setupInterceptors(platform: PlatformAdapter): void {
  interceptXHR(platform);
  interceptFetch(platform);
  console.log(`${meta.name}: 请求拦截器已启用`);
}

/**
 * 拦截 XMLHttpRequest 请求
 *
 * @param platform 当前平台适配器
 */
function interceptXHR(platform: PlatformAdapter): void {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    async?: boolean,
    username?: string | null,
    password?: string | null
  ) {
    // 存储请求信息到实例上
    (this as any).__llmEnhance = {
      method,
      url: url.toString(),
      timestamp: Date.now(),
    };

    return originalOpen.apply(this, arguments as any);
  };

  XMLHttpRequest.prototype.send = function (body?: Document | BodyInit | null) {
    const xhr = this;
    const requestInfo = (xhr as any).__llmEnhance;

    if (requestInfo && platform.shouldIntercept(requestInfo.url, requestInfo.method)) {
      // 监听响应
      xhr.addEventListener("load", function () {
        try {
          const responseData: InterceptedResponse = {
            url: requestInfo.url,
            method: requestInfo.method,
            timestamp: requestInfo.timestamp,
            response: xhr.responseText,
            status: xhr.status,
          };

          // 存储拦截的请求
          state.interceptedRequests.push(responseData);

          // 更新界面
          updateInterceptedCount();

          // 委托给平台适配器解析
          const parsed = platform.parseResponse(responseData);
          if (parsed && parsed.length > 0) {
            state.usageData.push(...parsed);
          }

          console.log(`${meta.name}: [${platform.name}] 拦截到 XHR 请求`, requestInfo.url);
        } catch (error) {
          console.error(`${meta.name}: 处理拦截请求失败`, error);
        }
      });
    }

    return originalSend.apply(this, arguments as any);
  };

  console.log(`${meta.name}: XHR 拦截已启用`);
}

/**
 * 拦截 Fetch 请求
 *
 * @param platform 当前平台适配器
 */
function interceptFetch(platform: PlatformAdapter): void {
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const startTime = Date.now();
    const url = input.toString();
    const method = init?.method || "GET";

    // 先判断是否需要拦截，避免不必要的 clone
    if (!platform.shouldIntercept(url, method)) {
      return originalFetch.apply(this, arguments as any);
    }

    try {
      const response = await originalFetch.apply(this, arguments as any);

      // 克隆响应以读取内容（不消耗原始响应）
      const clonedResponse = response.clone();

      // 异步处理响应内容
      clonedResponse.text().then((text) => {
        const responseData: InterceptedResponse = {
          url,
          method,
          timestamp: startTime,
          response: text,
          status: response.status,
        };

        // 存储拦截的请求
        state.interceptedRequests.push(responseData);

        // 更新界面
        updateInterceptedCount();

        // 委托给平台适配器解析
        const parsed = platform.parseResponse(responseData);
        if (parsed && parsed.length > 0) {
          state.usageData.push(...parsed);
        }

        console.log(`${meta.name}: [${platform.name}] 拦截到 Fetch 请求`, url);
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  console.log(`${meta.name}: Fetch 拦截已启用`);
}
