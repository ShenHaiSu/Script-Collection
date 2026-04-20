/**
 * UI 组件入口 (ui/index.ts)
 * 统一导出 UI 相关的组件和函数
 */
export { createFloatingTrigger, removeFloatingTrigger } from "@/Tmall-MySellerEnhance/ui/floatingButton";
export { drawerManager, type ActionButtonConfig } from "@/Tmall-MySellerEnhance/ui/drawer";
export { STYLES } from "@/Tmall-MySellerEnhance/ui/styles";
export {
  createItemCodeDisplay,
  createItemCodeDisplays,
  removeAllItemCodeDisplays,
  type ItemCodeInfo,
} from "@/Tmall-MySellerEnhance/ui/component/getItemId.ui";
export { copyToClipboard } from "@/Tmall-MySellerEnhance/helper";
