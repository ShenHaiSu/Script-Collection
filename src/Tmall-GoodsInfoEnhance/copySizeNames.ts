/**
 * 复制尺码名称功能 (copySizeNames.ts)
 */
import { copySkuByLabel } from "./helper";

/**
 * 复制所有尺码名称
 */
export function copyAllSizeNamesAction() {
  copySkuByLabel("尺码");
}
