/**
 * 复制颜色名称功能 (copyColorNames.ts)
 */
import { copySkuByLabel } from "./helper";

/**
 * 复制所有颜色名称
 */
export function copyAllColorNamesAction() {
  copySkuByLabel("颜色");
}
