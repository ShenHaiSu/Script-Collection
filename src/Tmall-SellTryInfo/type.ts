// #region 类型定义
/**
 * 存储采集到的结果数据接口
 */
export interface ScrapedResult {
  /** 图片 URL */
  imgUrl: string;
  /** 采集到的文本内容 */
  text: string;
  /** 商品id */
  itemId: string;
  /** 商品名称 */
  itemName: string;
}
// #endregion
