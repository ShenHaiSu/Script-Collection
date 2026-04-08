/**
 * 扩展示例模块
 * 展示如何扩展新的按钮和动作
 * 
 * 使用方法：
 * 1. 在 index.ts 中导入并注册这些动作
 * 2. 或者创建新的动作文件并遵循相同的模式
 */

import { IAction, IActionContext, ButtonConfig } from "../types";
import { createButtonConfig, registerCustomAction, buttonManager } from "./index";
import { showToast, showConfirm } from "../ui/components";
import { writeToClipboard } from "../dom";
import { dataStore } from "../utils";

// #region 示例：复制所有商品ID
/**
 * 复制所有商品ID动作
 * 这是一个扩展动作的示例，展示如何添加新功能
 */
export class CopyAllItemIdsAction implements IAction {
  readonly id = "copy-all-item-ids";
  readonly name = "复制所有商品ID";
  readonly description = "将所有已采集的商品ID复制到剪贴板";
  readonly icon = "📋";

  async execute(context: IActionContext): Promise<boolean> {
    const allResults = context.dataStore.getAll();
    
    if (allResults.length === 0) {
      showToast("没有可复制的商品ID");
      return false;
    }

    const itemIds = allResults.map(r => r.itemId).join("\n");
    const success = await writeToClipboard(itemIds);
    
    if (success) {
      showToast(`已复制 ${allResults.length} 个商品ID`);
    } else {
      showToast("复制失败，请重试");
    }
    
    return success;
  }
}

// #region 示例：复制所有图片URL
/**
 * 复制所有图片URL动作
 */
export class CopyAllImageUrlsAction implements IAction {
  readonly id = "copy-all-image-urls";
  readonly name = "复制所有图片URL";
  readonly description = "将所有已采集的商品图片URL复制到剪贴板";
  readonly icon = "🖼️";

  async execute(context: IActionContext): Promise<boolean> {
    const allResults = context.dataStore.getAll();
    
    if (allResults.length === 0) {
      showToast("没有可复制的图片URL");
      return false;
    }

    const imgUrls = allResults.map(r => r.imgUrl).join("\n");
    const success = await writeToClipboard(imgUrls);
    
    if (success) {
      showToast(`已复制 ${allResults.length} 个图片URL`);
    } else {
      showToast("复制失败，请重试");
    }
    
    return success;
  }
}

// #region 示例：导出为 JSON
/**
 * 导出为 JSON 动作
 */
export class ExportJsonAction implements IAction {
  readonly id = "export-json";
  readonly name = "导出JSON";
  readonly description = "将采集结果导出为JSON格式";
  readonly icon = "📦";

  async execute(context: IActionContext): Promise<boolean> {
    const allResults = context.dataStore.getAll();
    
    if (allResults.length === 0) {
      showToast("没有可导出的数据");
      return false;
    }

    const json = JSON.stringify(allResults, null, 2);
    const success = await writeToClipboard(json);
    
    if (success) {
      showToast("JSON已复制到剪贴板");
    } else {
      showToast("导出失败，请重试");
    }
    
    return success;
  }
}

// #region 示例：清空数据
/**
 * 清空数据动作
 */
export class ClearDataAction implements IAction {
  readonly id = "clear-data";
  readonly name = "清空数据";
  readonly description = "清空当前采集的所有数据";
  readonly icon = "🗑️";

  async execute(context: IActionContext): Promise<boolean> {
    const confirmed = await showConfirm({
      title: "确认清空",
      content: "确定要清空所有已采集的数据吗？",
      confirmText: "清空",
      cancelText: "取消",
    });

    if (confirmed) {
      context.dataStore.clear();
      showToast("数据已清空");
      return true;
    }

    return false;
  }
}

// #region 示例：显示统计信息
/**
 * 显示统计信息动作
 */
export class ShowStatisticsAction implements IAction {
  readonly id = "show-statistics";
  readonly name = "显示统计";
  readonly description = "显示采集数据的统计信息";
  readonly icon = "📊";

  async execute(context: IActionContext): Promise<boolean> {
    const allResults = context.dataStore.getAll();
    
    if (allResults.length === 0) {
      showToast("没有可统计的数据");
      return false;
    }

    // 计算统计信息
    const total = allResults.length;
    const uniqueItems = new Set(allResults.map(r => r.itemId)).size;
    const emptyTexts = allResults.filter(r => !r.text).length;
    const avgTextLength = allResults.reduce((sum, r) => sum + r.text.length, 0) / total;

    const stats = `
采集统计：
- 总条数: ${total}
- 唯一商品数: ${uniqueItems}
- 空分享链接: ${emptyTexts}
- 平均链接长度: ${Math.round(avgTextLength)}
    `.trim();

    alert(stats);
    return true;
  }
}

// #region 便捷函数：注册所有示例动作
/**
 * 注册所有示例动作
 * 在主入口中调用此函数即可添加示例按钮
 */
export function registerExampleActions(): void {
  registerCustomAction(new CopyAllItemIdsAction());
  registerCustomAction(new CopyAllImageUrlsAction());
  registerCustomAction(new ExportJsonAction());
  registerCustomAction(new ClearDataAction());
  registerCustomAction(new ShowStatisticsAction());
  console.log("示例动作已注册");
}

// #region 便捷函数：创建示例按钮配置
/**
 * 创建示例按钮配置
 * 返回可在页面上显示的额外按钮配置
 * @returns 按钮配置数组
 */
export function getExampleButtonConfigs(): ButtonConfig[] {
  return [
    createButtonConfig(
      "btn-copy-all-ids",
      "复制所有ID",
      async () => {
        const action = new CopyAllItemIdsAction();
        await action.execute({
          row: null as unknown as HTMLTableRowElement,
          rowIndex: -1,
          results: dataStore.getAll(),
          dataStore,
          updateProgress: () => {},
          cancelled: false,
        });
      },
      20  // 在主按钮后面
    ),
    createButtonConfig(
      "btn-export-json",
      "导出JSON",
      async () => {
        const action = new ExportJsonAction();
        await action.execute({
          row: null as unknown as HTMLTableRowElement,
          rowIndex: -1,
          results: dataStore.getAll(),
          dataStore,
          updateProgress: () => {},
          cancelled: false,
        });
      },
      30
    ),
    createButtonConfig(
      "btn-show-stats",
      "显示统计",
      async () => {
        const action = new ShowStatisticsAction();
        await action.execute({
          row: null as unknown as HTMLTableRowElement,
          rowIndex: -1,
          results: dataStore.getAll(),
          dataStore,
          updateProgress: () => {},
          cancelled: false,
        });
      },
      40
    ),
  ];
}

// #region 完整扩展示例模板
/**
 * 创建自定义动作的模板
 * 复制此函数并修改以创建新的动作
 * 
 * @example
 * // 创建新动作
 * const myCustomAction = createCustomAction({
 *   id: "my-custom-action",
 *   name: "我的自定义动作",
 *   description: "这是一个自定义动作的描述",
 *   icon: "🎯",
 *   priority: 50,
 * }, async (context) => {
 *   // 在这里编写动作逻辑
 *   console.log("执行自定义动作");
 *   return true;
 * });
 * 
 * // 注册动作
 * registerCustomAction(myCustomAction);
 */
export function createCustomAction(
  config: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    priority?: number;
  },
  executeFn: (context: IActionContext) => Promise<boolean>
): IAction {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    icon: config.icon,
    async execute(context: IActionContext) {
      return await executeFn(context);
    },
  };
}