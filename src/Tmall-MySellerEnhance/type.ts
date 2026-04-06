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

/**
 * Action 配置接口
 * 每个 action 需要实现此接口
 */
export interface ActionConfig {
  /** 按钮唯一标识 */
  id: string;
  /** 按钮显示文字 */
  label: string;
  /** 按钮图标 (emoji) */
  icon: string;
  /** 按钮点击回调 */
  onClick: () => void | Promise<void>;
  /**
   * 匹配函数 - 判定当前页面是否需要显示该功能按钮
   * @returns true 表示当前页面需要显示该按钮，false 表示隐藏
   */
  match: () => boolean;
}
// #endregion