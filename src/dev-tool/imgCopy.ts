/**
 * 图片复制工具模块
 * 提供将图片复制到剪贴板的功能，支持多种入参方式
 */

// 类型定义
export interface ImageCopyOptions {
  /** 图片 HTML 元素 */
  imgElement?: HTMLImageElement;
  /** 图片 URL 地址 */
  imgUrl?: string;
  /** 是否添加时间戳绕过缓存 (默认: true) */
  bypassCache?: boolean;
  /** 画布宽度 (可选) */
  canvasWidth?: number;
  /** 画布高度 (可选) */
  canvasHeight?: number;
  /** 成功回调 */
  onSuccess?: () => void;
  /** 失败回调 */
  onError?: (error: Error) => void;
}

// 内部工具函数：获取图片源地址
function getImageSource(options: ImageCopyOptions): string | null {
  if (options.imgElement) {
    return options.imgElement.src;
  }
  if (options.imgUrl) {
    return options.imgUrl;
  }
  return null;
}

// 内部工具函数：添加时间戳绕过缓存
function addTimestamp(url: string): string {
  const connector = url.includes('?') ? '&' : '?';
  return `${url}${connector}timestamp=${Date.now()}`;
}

/**
 * 将图片复制到剪贴板
 * @param options 配置选项
 * @returns Promise<void>
 */
export async function copyImageToClipboard(options: ImageCopyOptions): Promise<void> {
  const { bypassCache = true, canvasWidth, canvasHeight, onSuccess, onError } = options;
  
  // 获取图片源地址
  const source = getImageSource(options);
  if (!source) {
    const error = new Error('必须提供 imgElement 或 imgUrl 参数');
    onError?.(error);
    throw error;
  }

  // 创建离屏 Canvas 和临时 Image 对象
  const canvas = document.createElement('canvas');
  const tempImg = new Image();
  
  // 声明跨域权限
  tempImg.crossOrigin = 'anonymous';

  return new Promise((resolve, reject) => {
    tempImg.onload = () => {
      try {
        // 设置 Canvas 尺寸
        // 如果指定了宽高，则使用指定的尺寸，否则使用图片原始尺寸
        const targetWidth = canvasWidth || tempImg.naturalWidth;
        const targetHeight = canvasHeight || tempImg.naturalHeight;
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('无法获取 Canvas 2D 上下文');
        }
        
        // 绘制图片到 Canvas，占满整个画布
        // 使用 drawImage 的缩放形式：drawImage(image, dx, dy, dWidth, dHeight)
        ctx.drawImage(tempImg, 0, 0, targetWidth, targetHeight);

        // 转换为 PNG 并写入剪贴板
        canvas.toBlob(async (blob) => {
          if (!blob) {
            const error = new Error('无法创建图片 Blob');
            onError?.(error);
            reject(error);
            return;
          }

          try {
            const data = [new ClipboardItem({ 'image/png': blob })];
            await navigator.clipboard.write(data);
            
            console.log('%c [Canvas] 复制成功！', 'color: #4caf50; font-weight: bold;');
            onSuccess?.();
            resolve();
          } catch (err) {
            const error = err instanceof Error ? err : new Error('写入剪贴板失败');
            console.error('写入剪贴板失败:', error);
            onError?.(error);
            reject(error);
          }
        }, 'image/png');
      } catch (err) {
        const error = err instanceof Error ? err : new Error('处理图片时发生错误');
        console.error('处理图片时发生错误:', error);
        onError?.(error);
        reject(error);
      }
    };

    tempImg.onerror = () => {
      const error = new Error('图片加载失败，请检查 CORS 策略');
      console.error(error.message);
      onError?.(error);
      reject(error);
    };

    // 设置图片源（可选绕过缓存）
    tempImg.src = bypassCache ? addTimestamp(source) : source;
  });
}

/**
 * 从 HTMLImageElement 复制图片到剪贴板
 * @param imgElement 图片 HTML 元素
 * @param options 其他配置选项
 * @returns Promise<void>
 */
export async function copyImageElementToClipboard(
  imgElement: HTMLImageElement,
  options?: Omit<ImageCopyOptions, 'imgElement'>
): Promise<void> {
  return copyImageToClipboard({ ...options, imgElement });
}

/**
 * 从图片 URL 复制图片到剪贴板
 * @param imgUrl 图片 URL 地址
 * @param options 其他配置选项
 * @returns Promise<void>
 */
export async function copyImageUrlToClipboard(
  imgUrl: string,
  options?: Omit<ImageCopyOptions, 'imgUrl'>
): Promise<void> {
  return copyImageToClipboard({ ...options, imgUrl });
}

// 默认导出主要函数
export default copyImageToClipboard;