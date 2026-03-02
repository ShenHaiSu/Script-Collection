/// <reference types="tampermonkey" />

/**
 * 封装油猴脚本的 GM_xmlhttpRequest，提供类似 fetch 的调用体验
 * @param url 请求地址
 * @param options 请求配置项
 * @returns 返回响应对象的 Promise
 */
// #region gmFetch 封装
export interface GmFetchOptions extends Omit<
  Tampermonkey.Request,
  | "url"
  | "onload"
  | "onerror"
  | "onabort"
  | "ontimeout"
  | "onprogress"
  | "onreadystatechange"
  | "method"
  | "headers"
  | "data"
> {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD";
  headers?: Record<string, string>;
  body?: string | FormData | Blob | ArrayBuffer;
}

export interface GmFetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  data: any;
  responseText: string;
  responseHeaders: string;
  finalUrl: string;
  json: <T = any>() => T;
}

/**
 * 封装 GM_xmlhttpRequest 为 Promise 形式
 */
export function gmFetch(url: string, options: GmFetchOptions = {}): Promise<GmFetchResponse> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    if (typeof GM_xmlhttpRequest === "undefined") {
      reject(new Error("GM_xmlhttpRequest is not defined. Are you running in a Userscript environment?"));
      return;
    }

    // @ts-ignore
    GM_xmlhttpRequest({
      method: options.method || "GET",
      url: url,
      headers: options.headers,
      data: options.body,
      ...options,
      onload: (response: any) => {
        const gmResponse: GmFetchResponse = {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          statusText: response.statusText,
          data: response.response,
          responseText: response.responseText,
          responseHeaders: response.responseHeaders,
          finalUrl: response.finalUrl,
          json: <T = any>() => {
            try {
              return JSON.parse(response.responseText) as T;
            } catch (e) {
              throw new Error("Failed to parse response as JSON");
            }
          },
        };
        resolve(gmResponse);
      },
      onerror: (error: any) => {
        reject(error);
      },
      onabort: () => {
        reject(new Error("Request aborted"));
      },
      ontimeout: () => {
        reject(new Error("Request timeout"));
      },
    });
  });
}
// #endregion
