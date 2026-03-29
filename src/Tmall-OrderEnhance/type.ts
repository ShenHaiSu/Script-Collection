// #region 类型定义
/**
 * 订单增强信息接口
 */
export interface OrderEnhanceInfo {
  /** 订单ID */
  orderId: string;
  /** 商品ID */
  itemId: string;
  /** 商品名称 */
  itemName: string;
  /** 商品图片URL */
  imgUrl: string;
  /** 买家昵称 */
  buyerNick: string;
  /** 买家实付金额 */
  buyerPayAmount: string;
  /** 订单状态 */
  orderStatus: string;
  /** 下单时间 */
  orderTime: string;
  /** 收货人姓名 */
  receiverName: string;
  /** 收货人手机号 */
  receiverPhone: string;
  /** 收货地址 */
  receiverAddress: string;
  /** 宝贝属性（如颜色、尺码） */
  skuInfo: string;
  /** 数量 */
  quantity: number;
  /** 运费 */
  shippingFee: string;
  /** 优惠信息 */
  discountInfo: string;
  /** 店铺名称 */
  shopName: string;
  /** 卖家备注 */
  sellerMemo: string;
}

/**
 * 订单列表行数据接口
 */
export interface OrderRowData {
  /** 行元素 */
  row: HTMLTableRowElement;
  /** 订单ID */
  orderId: string;
  /** 商品ID */
  itemId: string;
}
// #endregion