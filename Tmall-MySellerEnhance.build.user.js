// ==UserScript==
// @name         天猫后台订单信息增强
// @version      2026.04.20.23.41.15
// @description  增强千牛天猫后台的已卖出宝贝的订单信息，展示更多实用性的信息内容。
// @author       DaoLuoLTS
// @match        https://myseller.taobao.com/*
// @match        https://qn.taobao.com/*
// @match        https://qn.taobao.com/home.htm/trade-try-buy/merchList*
// @match        https://myseller.taobao.com/home.htm/trade-try-buy/merchList*
// @namespace    https://github.com/ShenHaiSu/Script-Collection
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tmall.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_fetch
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @noframes     
// @supportURL   https://github.com/ShenHaiSu/Script-Collection/issues
// ==/UserScript==

"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // Tmall-MySellerEnhance/ui/styles.ts
  var STYLES = {
    /**
     * 浮动触发按钮样式
     */
    FLOATING_BTN: `
    position: fixed;
    right: 20px;
    bottom: 80px;
    width: 56px;
    height: 56px;
    background: #ff5000;
    color: white;
    border-radius: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(255, 80, 0, 0.4);
    z-index: 99998;
    font-size: 24px;
    transition: transform 0.2s, background 0.2s;
  `,
    /**
     * Drawer 遮罩层样式
     */
    DRAWER_MASK: `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99999;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s;
  `,
    /**
     * Drawer 遮罩层显示状态
     */
    DRAWER_MASK_VISIBLE: `
    opacity: 1;
    visibility: visible;
  `,
    /**
     * Drawer 容器样式
     */
    DRAWER_CONTAINER: `
    position: fixed;
    top: 0;
    right: 0;
    width: 320px;
    height: 100%;
    background: #fff;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    z-index: 100000;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  `,
    /**
     * Drawer 容器显示状态
     */
    DRAWER_CONTAINER_VISIBLE: `
    transform: translateX(0);
  `,
    /**
     * Drawer 头部样式
     */
    DRAWER_HEADER: `
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
  `,
    /**
     * Drawer 标题样式
     */
    DRAWER_TITLE: `
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0;
  `,
    /**
     * Drawer 关闭按钮样式
     */
    DRAWER_CLOSE_BTN: `
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 20px;
    color: #999;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    transition: background 0.2s;
  `,
    /**
     * Drawer 内容区域样式
     */
    DRAWER_CONTENT: `
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  `,
    /**
     * 交互按钮组容器样式
     */
    ACTION_BUTTONS_CONTAINER: `
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
    /**
     * 交互按钮样式
     */
    ACTION_BUTTON: `
    width: 100%;
    padding: 12px 16px;
    background: #fff7f2;
    border: 1px solid #ffdec7;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    text-align: left;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
  `,
    /**
     * 交互按钮 hover 状态样式
     */
    ACTION_BUTTON_HOVER: `
    background: #ff5000;
    border-color: #ff5000;
    color: #fff;
  `,
    /**
     * 交互按钮图标样式
     */
    ACTION_BUTTON_ICON: `
    font-size: 18px;
    width: 24px;
    text-align: center;
  `,
    /**
     * 交互按钮文字样式
     */
    ACTION_BUTTON_TEXT: `
    flex: 1;
  `,
    /**
     * Drawer 快捷输入框容器样式
     */
    DRAWER_INPUT_CONTAINER: `
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
    background: #f8f8f8;
  `,
    /**
     * Drawer 快捷输入框样式
     */
    DRAWER_INPUT: `
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s;
  `,
    /**
     * Drawer 快捷输入框聚焦样式
     */
    DRAWER_INPUT_FOCUS: `
    border-color: #ff5000;
    box-shadow: 0 0 0 2px rgba(255, 80, 0, 0.1);
  `,
    /**
     * Drawer 快捷输入提示文字样式
     */
    DRAWER_HINT: `
    margin-top: 8px;
    font-size: 12px;
    color: #999;
    line-height: 1.4;
  `,
    /**
     * Drawer 按钮编号样式 (隐藏显示)
     */
    ACTION_BUTTON_NUMBER: `
    display: none;
  `
  };

  // Tmall-MySellerEnhance/ui/floatingButton.ts
  function createFloatingTrigger(onToggle) {
    const btn = document.createElement("div");
    btn.id = "tmall-order-enhance-floating-btn";
    btn.innerHTML = "📋";
    btn.title = "千牛后台增强工具";
    btn.style.cssText = STYLES.FLOATING_BTN;
    btn.onmouseenter = () => {
      btn.style.transform = "scale(1.1)";
      btn.style.background = "#ff6a00";
    };
    btn.onmouseleave = () => {
      btn.style.transform = "scale(1)";
      btn.style.background = "#ff5000";
    };
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onToggle();
    };
    document.body.appendChild(btn);
    console.log("浮动触发按钮已挂载");
    return btn;
  }

  // Tmall-MySellerEnhance/ui/drawerInput.ts
  var DrawerInputManager = class {
    constructor() {
      __publicField(this, "inputElement", null);
      __publicField(this, "hintElement", null);
      __publicField(this, "buttonNumberMap", /* @__PURE__ */ new Map());
      __publicField(this, "onTriggerCallback", null);
    }
    /**
     * 构建输入框 HTML
     * @param availableButtons 当前可用的按钮配置列表
     * @returns 输入框区域的 HTML 字符串
     */
    buildInputHtml(availableButtons) {
      this.buttonNumberMap.clear();
      const hintParts = [];
      availableButtons.forEach((btn, index) => {
        const number = String(index + 1).padStart(2, "0");
        this.buttonNumberMap.set(number, btn);
        hintParts.push(`${number}:${btn.label}`);
      });
      const hintText = hintParts.length > 0 ? hintParts.join(" | ") : "当前页面无可用功能";
      return `
      <div style="${STYLES.DRAWER_INPUT_CONTAINER}">
        <input
          type="text"
          id="tmall-order-enhance-quick-input"
          style="${STYLES.DRAWER_INPUT}"
          placeholder="输入编号快速执行..."
          autocomplete="off"
        />
        <div id="tmall-order-enhance-quick-hint" style="${STYLES.DRAWER_HINT}">
          可用: ${hintText}
        </div>
      </div>
    `;
    }
    /**
     * 绑定输入框事件
     * @param onTrigger 按钮触发回调
     */
    bindEvents(onTrigger) {
      this.onTriggerCallback = onTrigger;
      this.inputElement = document.getElementById(
        "tmall-order-enhance-quick-input"
      );
      this.hintElement = document.getElementById(
        "tmall-order-enhance-quick-hint"
      );
      if (!this.inputElement) {
        console.error("DrawerInput: 输入框元素未找到");
        return;
      }
      this.inputElement.addEventListener("keydown", this.handleKeyDown.bind(this));
      this.inputElement.addEventListener("focus", this.handleFocus.bind(this));
      this.inputElement.addEventListener("blur", this.handleBlur.bind(this));
    }
    /**
     * 处理键盘按下事件
     */
    handleKeyDown(e) {
      if (e.key !== "Enter") {
        return;
      }
      e.preventDefault();
      const value = this.inputElement?.value.trim() || "";
      if (value === "") {
        const firstButton = this.buttonNumberMap.get("01");
        if (firstButton && this.onTriggerCallback) {
          this.onTriggerCallback(firstButton);
          console.log("DrawerInput: 触发第一个按钮", firstButton.label);
        } else {
          console.warn("DrawerInput: 没有可用的按钮");
        }
      } else if (this.buttonNumberMap.has(value)) {
        const button = this.buttonNumberMap.get(value);
        if (button && this.onTriggerCallback) {
          this.onTriggerCallback(button);
          console.log(`DrawerInput: 触发按钮 [${value}]`, button.label);
        }
      } else {
        console.warn(`DrawerInput: 无效的按钮编号 "${value}"`);
        this.flashError();
      }
      if (this.inputElement) {
        this.inputElement.value = "";
      }
    }
    /**
     * 处理输入框聚焦
     */
    handleFocus() {
      if (this.inputElement) {
        this.inputElement.style.cssText = STYLES.DRAWER_INPUT + STYLES.DRAWER_INPUT_FOCUS;
      }
    }
    /**
     * 处理输入框失焦
     */
    handleBlur() {
      if (this.inputElement) {
        this.inputElement.style.cssText = STYLES.DRAWER_INPUT;
      }
    }
    /**
     * 闪烁错误提示
     */
    flashError() {
      if (!this.inputElement) return;
      const originalBorder = this.inputElement.style.borderColor;
      this.inputElement.style.borderColor = "#ff4d4f";
      setTimeout(() => {
        if (this.inputElement) {
          this.inputElement.style.borderColor = originalBorder;
        }
      }, 300);
    }
    /**
     * 自动聚焦到输入框
     * @param delay 延迟毫秒数
     */
    focus(delay = 100) {
      setTimeout(() => {
        if (this.inputElement) {
          this.inputElement.focus();
          console.log("DrawerInput: 已聚焦到输入框");
        }
      }, delay);
    }
    /**
     * 获取当前按钮编号映射
     */
    getButtonNumberMap() {
      return this.buttonNumberMap;
    }
    /**
     * 销毁输入框事件绑定
     */
    destroy() {
      if (this.inputElement) {
        this.inputElement.removeEventListener("keydown", this.handleKeyDown.bind(this));
        this.inputElement.removeEventListener("focus", this.handleFocus.bind(this));
        this.inputElement.removeEventListener("blur", this.handleBlur.bind(this));
        this.inputElement = null;
      }
      this.hintElement = null;
      this.buttonNumberMap.clear();
      this.onTriggerCallback = null;
    }
  };
  var drawerInputManager = new DrawerInputManager();

  // Tmall-MySellerEnhance/ui/drawer.ts
  var DrawerManager = class {
    constructor() {
      __publicField(this, "state", {
        isOpen: false,
        maskElement: null,
        containerElement: null,
        actionButtons: []
      });
    }
    /**
     * 初始化 Drawer 组件
     * @param actionButtons 交互按钮配置列表
     */
    init(actionButtons) {
      this.state.actionButtons = actionButtons;
      this.createElements();
      console.log("Drawer 组件已初始化");
    }
    /**
     * 创建 Drawer 相关的 DOM 元素
     */
    createElements() {
      this.state.maskElement = document.createElement("div");
      this.state.maskElement.id = "tmall-order-enhance-drawer-mask";
      this.state.maskElement.style.cssText = STYLES.DRAWER_MASK;
      this.state.maskElement.onclick = () => this.close();
      this.state.containerElement = document.createElement("div");
      this.state.containerElement.id = "tmall-order-enhance-drawer";
      this.state.containerElement.style.cssText = STYLES.DRAWER_CONTAINER;
      this.state.containerElement.innerHTML = this.buildDrawerContent([]);
      document.body.appendChild(this.state.maskElement);
      document.body.appendChild(this.state.containerElement);
      this.bindButtonEvents();
    }
    /**
     * 构建 Drawer 的 HTML 内容
     * @param availableButtons 当前页面可用的按钮列表（用于生成输入框提示）
     */
    buildDrawerContent(availableButtons = []) {
      const buttonsHtml = this.state.actionButtons.map(
        (btn) => `
        <button
          class="tmall-order-enhance-action-btn"
          data-action-id="${btn.id}"
          style="${STYLES.ACTION_BUTTON}"
        >
          <span class="tmall-order-enhance-action-btn-icon" style="${STYLES.ACTION_BUTTON_ICON}">${btn.icon}</span>
          <span class="tmall-order-enhance-action-btn-text" style="${STYLES.ACTION_BUTTON_TEXT}">${btn.label}</span>
        </button>
      `
      ).join("");
      const inputHtml = drawerInputManager.buildInputHtml(availableButtons);
      return `
      <div style="${STYLES.DRAWER_HEADER}">
        <h3 style="${STYLES.DRAWER_TITLE}">千牛后台增强工具</h3>
        <button id="tmall-order-enhance-drawer-close" style="${STYLES.DRAWER_CLOSE_BTN}">✕</button>
      </div>
      ${inputHtml}
      <div style="${STYLES.DRAWER_CONTENT}">
        <div style="${STYLES.ACTION_BUTTONS_CONTAINER}">
          ${buttonsHtml}
        </div>
      </div>
    `;
    }
    /**
     * 绑定按钮事件
     */
    bindButtonEvents() {
      const closeBtn = document.getElementById("tmall-order-enhance-drawer-close");
      if (closeBtn) closeBtn.onclick = () => this.close();
      const actionButtons = document.querySelectorAll(".tmall-order-enhance-action-btn");
      actionButtons.forEach((btn) => {
        btn.onmouseenter = () => {
          btn.style.cssText = STYLES.ACTION_BUTTON + STYLES.ACTION_BUTTON_HOVER;
        };
        btn.onmouseleave = () => {
          btn.style.cssText = STYLES.ACTION_BUTTON;
        };
        btn.onclick = () => {
          const actionId = btn.getAttribute("data-action-id");
          const actionConfig = this.state.actionButtons.find((b) => b.id === actionId);
          if (actionConfig) {
            if (actionConfig.clickDrawerHide) {
              this.close();
            }
            actionConfig.onClick();
          }
        };
      });
      drawerInputManager.bindEvents((buttonConfig) => {
        if (buttonConfig.clickDrawerHide) {
          this.close();
        }
        buttonConfig.onClick();
      });
    }
    /**
     * 打开 Drawer
     */
    open() {
      if (!this.state.maskElement || !this.state.containerElement) {
        console.error("Drawer 组件未初始化");
        return;
      }
      this.state.isOpen = true;
      this.state.maskElement.style.cssText = STYLES.DRAWER_MASK + STYLES.DRAWER_MASK_VISIBLE;
      this.state.containerElement.style.cssText = STYLES.DRAWER_CONTAINER + STYLES.DRAWER_CONTAINER_VISIBLE;
      drawerInputManager.focus(150);
      console.log("Drawer 已打开");
    }
    /**
     * 关闭 Drawer
     */
    close() {
      if (!this.state.maskElement || !this.state.containerElement) {
        console.error("Drawer 组件未初始化");
        return;
      }
      this.state.isOpen = false;
      this.state.maskElement.style.cssText = STYLES.DRAWER_MASK;
      this.state.containerElement.style.cssText = STYLES.DRAWER_CONTAINER;
      console.log("Drawer 已关闭");
    }
    /**
     * 切换 Drawer 状态
     * 在打开 drawer 之前，根据每个 action 的 match 函数动态过滤按钮
     */
    toggle() {
      if (this.state.isOpen) {
        this.close();
      } else {
        this.filterButtonsByMatch();
        this.open();
      }
    }
    /**
     * 刷新按钮显示状态
     * 公开方法，供外部调用（如路由变化时）
     * 重新根据 match 函数过滤并更新按钮显示
     */
    refreshButtons() {
      this.filterButtonsByMatch();
    }
    /**
     * 根据每个 action 的 match 函数动态过滤按钮
     * 匹配成功的按钮显示，未匹配的按钮隐藏
     * @returns 当前页面可用的按钮配置数组
     */
    filterButtonsByMatch() {
      const availableButtons = this.state.actionButtons.filter((btn) => {
        if (!btn.match) {
          return true;
        }
        return btn.match();
      });
      if (this.state.containerElement) {
        this.state.containerElement.innerHTML = this.buildDrawerContent(availableButtons);
        this.bindButtonEvents();
      }
      this.updateButtonsDisplay(availableButtons);
      console.log(
        "当前页面可用 actions:",
        availableButtons.map((b) => b.label).join(", ")
      );
      return availableButtons;
    }
    /**
     * 更新按钮的显示状态
     * @param availableButtons 当前页面可用的按钮配置
     */
    updateButtonsDisplay(availableButtons) {
      const availableIds = new Set(availableButtons.map((b) => b.id));
      const buttonElements = document.querySelectorAll(".tmall-order-enhance-action-btn");
      buttonElements.forEach((btn) => {
        const actionId = btn.getAttribute("data-action-id");
        if (actionId && availableIds.has(actionId)) {
          btn.style.display = "";
        } else {
          btn.style.display = "none";
        }
      });
      const visibleButtons = document.querySelectorAll(
        '.tmall-order-enhance-action-btn[style*="display: none"]'
      );
      const totalButtons = buttonElements.length;
      const hiddenCount = visibleButtons.length;
      if (totalButtons > 0 && hiddenCount === totalButtons) {
        console.log("当前页面没有可用的功能按钮");
      }
    }
    /**
     * 获取当前状态
     */
    isOpened() {
      return this.state.isOpen;
    }
    /**
     * 销毁 Drawer 组件
     */
    destroy() {
      drawerInputManager.destroy();
      if (this.state.maskElement) {
        this.state.maskElement.remove();
        this.state.maskElement = null;
      }
      if (this.state.containerElement) {
        this.state.containerElement.remove();
        this.state.containerElement = null;
      }
      this.state.isOpen = false;
      console.log("Drawer 组件已销毁");
    }
  };
  var drawerManager = new DrawerManager();

  // Tmall-MySellerEnhance/helper.ts
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand("copy");
      document.body.removeChild(textArea);
      return result;
    } catch (error) {
      console.error("复制到剪贴板失败:", error);
      return false;
    }
  }

  // Tmall-MySellerEnhance/ui/component/getItemId.ui.ts
  var ITEM_CODE_STYLES = {
    CONTAINER: `
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    padding: 6px 8px;
    background: #f5f5f5;
    border-radius: 4px;
    font-size: 12px;
  `,
    // 当没有商家编码时使用的inline-block样式
    CONTAINER_INLINE: `
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-left: 8px;
    padding: 2px 6px;
    background: #f5f5f5;
    border-radius: 3px;
    font-size: 12px;
    vertical-align: middle;
  `,
    LABEL: `
    color: #666;
    white-space: nowrap;
  `,
    VALUE: `
    color: #333;
    font-weight: 500;
    font-family: monospace;
  `,
    COPY_BTN: `
    padding: 2px 8px;
    background: #ff5000;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
    transition: background 0.2s;
  `,
    COPY_BTN_HOVER: `
    background: #ff6a00;
  `,
    COPY_SUCCESS: `
    background: #52c41a;
  `,
    // 商品列表按钮样式
    LINK_BTN: `
    padding: 2px 8px;
    background: #ff5000;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
    transition: background 0.2s;
    text-decoration: none;
    display: inline-block;
  `,
    LINK_BTN_HOVER: `
    background: #ff6a00;
  `,
    // 商品详情按钮样式
    DETAIL_BTN: `
    padding: 2px 8px;
    background: #ff5000;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
    transition: background 0.2s;
    text-decoration: none;
    display: inline-block;
  `,
    DETAIL_BTN_HOVER: `
    background: #ff6a00;
  `
  };
  function createItemCodeDisplay(itemCodeInfo) {
    const { itemId, trElement } = itemCodeInfo;
    const container = document.createElement("div");
    container.className = "tmall-order-enhance-item-code";
    const label = document.createElement("span");
    label.className = "tmall-order-enhance-item-code-label";
    label.style.cssText = ITEM_CODE_STYLES.LABEL;
    label.textContent = "商品编码:";
    const value = document.createElement("span");
    value.className = "tmall-order-enhance-item-code-value";
    value.style.cssText = ITEM_CODE_STYLES.VALUE;
    value.textContent = String(itemId);
    const copyBtn = document.createElement("button");
    copyBtn.className = "tmall-order-enhance-item-code-copy-btn";
    copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN;
    copyBtn.textContent = "复制";
    copyBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const textToCopy = String(itemId);
      const success = await copyToClipboard(textToCopy);
      if (success) {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "已复制";
        copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN + ITEM_CODE_STYLES.COPY_SUCCESS;
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN;
        }, 2e3);
      } else {
        copyBtn.textContent = "复制失败";
        setTimeout(() => {
          copyBtn.textContent = "复制";
        }, 2e3);
      }
    };
    copyBtn.onmouseenter = () => {
      if (copyBtn.textContent === "复制") {
        copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN + ITEM_CODE_STYLES.COPY_BTN_HOVER;
      }
    };
    copyBtn.onmouseleave = () => {
      if (copyBtn.textContent === "复制") {
        copyBtn.style.cssText = ITEM_CODE_STYLES.COPY_BTN;
      }
    };
    const listBtn = document.createElement("a");
    listBtn.className = "tmall-order-enhance-item-code-list-btn";
    listBtn.style.cssText = ITEM_CODE_STYLES.LINK_BTN;
    listBtn.textContent = "商品列表";
    listBtn.href = `https://myseller.taobao.com/home.htm/SellManage/on_sale?queryItemId=${itemId}`;
    listBtn.target = "_blank";
    listBtn.rel = "noopener noreferrer";
    listBtn.title = "在卖家中心查看商品列表";
    listBtn.addEventListener("mouseenter", () => {
      listBtn.style.cssText = ITEM_CODE_STYLES.LINK_BTN + ITEM_CODE_STYLES.LINK_BTN_HOVER;
    });
    listBtn.addEventListener("mouseleave", () => {
      listBtn.style.cssText = ITEM_CODE_STYLES.LINK_BTN;
    });
    const detailBtn = document.createElement("a");
    detailBtn.className = "tmall-order-enhance-item-code-detail-btn";
    detailBtn.style.cssText = ITEM_CODE_STYLES.DETAIL_BTN;
    detailBtn.textContent = "商品详情";
    detailBtn.href = `https://detail.tmall.com/item.htm?id=${itemId}`;
    detailBtn.target = "_blank";
    detailBtn.rel = "noopener noreferrer";
    detailBtn.title = "在淘宝查看商品详情";
    detailBtn.addEventListener("mouseenter", () => {
      detailBtn.style.cssText = ITEM_CODE_STYLES.DETAIL_BTN + ITEM_CODE_STYLES.DETAIL_BTN_HOVER;
    });
    detailBtn.addEventListener("mouseleave", () => {
      detailBtn.style.cssText = ITEM_CODE_STYLES.DETAIL_BTN;
    });
    container.appendChild(label);
    container.appendChild(value);
    container.appendChild(copyBtn);
    container.appendChild(listBtn);
    container.appendChild(detailBtn);
    const firstTd = trElement.querySelector("td");
    if (firstTd) {
      const wrapper = firstTd.querySelector(":scope > div");
      if (wrapper) {
        const productContainer = wrapper.querySelector(":scope > div");
        if (productContainer) {
          const sellerCodeElement = Array.from(productContainer.querySelectorAll("div")).find(
            (div) => div.textContent && div.textContent.includes("商家编码：")
          );
          if (sellerCodeElement) {
            container.style.cssText = ITEM_CODE_STYLES.CONTAINER;
            sellerCodeElement.appendChild(container);
          } else {
            container.style.cssText = ITEM_CODE_STYLES.CONTAINER_INLINE;
            const lastDiv = productContainer.querySelector(":scope > div:last-child");
            if (lastDiv) {
              lastDiv.parentNode?.insertBefore(container, lastDiv.nextSibling);
            } else {
              productContainer.lastChild?.appendChild(container);
            }
          }
        } else {
          container.style.cssText = ITEM_CODE_STYLES.CONTAINER_INLINE;
          wrapper.appendChild(container);
        }
      } else {
        container.style.cssText = ITEM_CODE_STYLES.CONTAINER_INLINE;
        firstTd.appendChild(container);
      }
    } else {
      container.style.cssText = ITEM_CODE_STYLES.CONTAINER_INLINE;
      trElement.appendChild(container);
    }
    console.log(`商品编码展示已添加到子订单 (商品编码: ${itemId})`);
    return container;
  }
  function removeAllItemCodeDisplays() {
    const displays = document.querySelectorAll(".tmall-order-enhance-item-code");
    displays.forEach((display) => {
      display.remove();
    });
    console.log("已移除所有商品编码展示");
  }

  // dev-tool/gmFetch.ts
  function gmFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      if (typeof GM_xmlhttpRequest === "undefined") {
        reject(new Error("GM_xmlhttpRequest is not defined. Are you running in a Userscript environment?"));
        return;
      }
      GM_xmlhttpRequest({
        method: options.method || "GET",
        url,
        headers: options.headers,
        data: options.body,
        ...options,
        onload: (response) => {
          const gmResponse = {
            ok: response.status >= 200 && response.status < 300,
            status: response.status,
            statusText: response.statusText,
            data: response.response,
            responseText: response.responseText,
            responseHeaders: response.responseHeaders,
            finalUrl: response.finalUrl,
            json: () => {
              try {
                return JSON.parse(response.responseText);
              } catch (e) {
                throw new Error("Failed to parse response as JSON");
              }
            }
          };
          resolve(gmResponse);
        },
        onerror: (error) => {
          reject(error);
        },
        onabort: () => {
          reject(new Error("Request aborted"));
        },
        ontimeout: () => {
          reject(new Error("Request timeout"));
        }
      });
    });
  }

  // Tmall-MySellerEnhance/action/getItemId/getItemId.action.ts
  function parseItemSnapshotHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const scripts = doc.querySelectorAll("body script");
    for (const script of scripts) {
      const scriptContent = script.textContent;
      if (scriptContent) {
        const jsonParseMatch = scriptContent.match(/JSON\.parse\s*\(\s*(['"`])([\s\S]*?)\1\s*\)/);
        if (jsonParseMatch && jsonParseMatch[2]) {
          try {
            const jsonStr = jsonParseMatch[2].replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, "\\");
            return JSON.parse(jsonStr);
          } catch (e) {
            console.error("解析JSON失败:", e);
            try {
              return JSON.parse(scriptContent);
            } catch (e2) {
              console.error("直接解析script内容也失败:", e2);
            }
          }
        }
      }
    }
    const jsonObjectMatch = html.match(/\{[\s\S]*"itemId"[\s\S]*\}/);
    if (jsonObjectMatch) {
      try {
        return JSON.parse(jsonObjectMatch[0]);
      } catch (e) {
        console.error("从HTML中提取JSON对象失败:", e);
      }
    }
    return null;
  }
  function getItemUrlFromTr(tr) {
    const img = tr.querySelector("td > div > div > a > img");
    if (!img) return null;
    const anchor = img.parentElement;
    if (!anchor || anchor.tagName !== "A") return null;
    const href = anchor.getAttribute("href");
    return href;
  }
  function collectOrderItems() {
    const tables = document.querySelectorAll("div.next-table.next-table-medium div.next-table-body > table");
    const orderItems = [];
    tables.forEach((table, parentIndex) => {
      const tbody = table.querySelector("tbody");
      if (!tbody) {
        console.warn(`父订单 ${parentIndex + 1} 没有tbody`);
        return;
      }
      const rows = tbody.querySelectorAll("tr");
      for (let i = 1; i < rows.length; i++) {
        const tr = rows[i];
        const itemUrl = getItemUrlFromTr(tr);
        if (itemUrl) {
          orderItems.push({
            itemUrl,
            parentOrderIndex: parentIndex,
            itemIndex: i - 1,
            // 子订单索引从0开始
            trElement: tr
          });
        }
      }
    });
    return orderItems;
  }
  async function fetchItemSnapshot(itemUrl) {
    try {
      const response = await gmFetch(itemUrl, {
        method: "GET",
        headers: {
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "User-Agent": navigator.userAgent
        }
      });
      if (!response.ok) {
        console.error(`请求失败: ${response.status} ${response.statusText}`);
        return null;
      }
      const jsonData = parseItemSnapshotHtml(response.responseText);
      return jsonData;
    } catch (error) {
      console.error("获取商品快照失败:", error);
      return null;
    }
  }
  function extractItemId(snapshotData) {
    if (!snapshotData) return null;
    try {
      const itemId = snapshotData?.baseSnapDO?.itemSnapDO?.itemId;
      if (itemId !== void 0 && itemId !== null) {
        return itemId;
      }
    } catch (e) {
      console.error("提取商品编码失败:", e);
    }
    return null;
  }
  async function handleGetItemId() {
    console.log("执行获取商品 ID 逻辑...");
    const tableBody = document.querySelector("div.next-table.next-table-medium div.next-table-body");
    if (!tableBody) {
      console.warn("未找到订单表格容器 div.next-table.next-table-medium div.next-table-body");
      alert("未找到订单表格容器，请确保在订单列表页面");
      return;
    }
    const childNodesLength = tableBody.childNodes.length;
    console.log("表格内容子节点数量:", childNodesLength);
    if (childNodesLength === 1) {
      const firstChild = tableBody.childNodes[0];
      const innerText = firstChild.textContent?.trim() ?? "";
      const emptyMessage = "没有符合条件的宝贝，请尝试其他搜索条件。";
      if (innerText === emptyMessage) {
        console.log("当前展示订单的位置下没有任何订单展示，无需进行后续操作");
        alert("当前页面没有订单数据");
        return;
      }
    }
    console.log("订单信息列表中有结果，准备执行获取商品 ID 逻辑");
    const orderItems = collectOrderItems();
    console.log(`共找到 ${orderItems.length} 个子订单商品`);
    if (orderItems.length === 0) {
      console.warn("未找到任何子订单商品信息");
      alert("未找到子订单商品信息");
      return;
    }
    removeAllItemCodeDisplays();
    console.log("开始获取商品快照数据...");
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      console.log(`
--- 处理第 ${i + 1} 个商品 (父订单${item.parentOrderIndex + 1}, 子订单${item.itemIndex + 1}) ---`);
      console.log("商品URL:", item.itemUrl);
      const snapshotData = await fetchItemSnapshot(item.itemUrl);
      if (snapshotData) {
        console.log("商品快照数据:", snapshotData);
        const itemId = extractItemId(snapshotData);
        if (itemId !== null) {
          console.log("商品编码 (itemId):", itemId);
          createItemCodeDisplay({
            itemId,
            parentOrderIndex: item.parentOrderIndex,
            itemIndex: item.itemIndex,
            trElement: item.trElement
          });
        } else {
          console.warn("未能从快照数据中提取到商品编码");
        }
      } else {
        console.warn("未能获取到商品快照数据");
      }
    }
    console.log("\n获取商品 ID 逻辑执行完成");
  }

  // Tmall-MySellerEnhance/action/copyAllItemIds/copyAllItemIds.action.ts
  function checkItemIdDisplayExists() {
    const displays = document.querySelectorAll(".tmall-order-enhance-item-code");
    return displays.length > 0;
  }
  function getAllItemIdsFromDOM() {
    const itemIds = [];
    const displays = document.querySelectorAll(".tmall-order-enhance-item-code-value");
    displays.forEach((display) => {
      const text = display.textContent?.trim();
      if (text) {
        itemIds.push(text);
      }
    });
    return itemIds;
  }
  async function handleCopyAllItemIds() {
    console.log("执行复制所有商品ID逻辑...");
    const itemIdExists = checkItemIdDisplayExists();
    if (!itemIdExists) {
      console.log("商品ID展示不存在，先触发getItemId获取商品ID...");
      await handleGetItemId();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    const itemIds = getAllItemIdsFromDOM();
    if (itemIds.length === 0) {
      console.warn("未获取到任何商品ID");
      alert("未获取到商品ID，请确保页面有订单数据");
      return;
    }
    console.log(`共获取到 ${itemIds.length} 个商品ID`);
    const textToCopy = itemIds.join("\n");
    const success = await copyToClipboard(textToCopy);
    if (success) {
      console.log("商品ID已复制到剪贴板");
      alert(`已复制 ${itemIds.length} 个商品ID到剪贴板`);
    } else {
      console.error("复制到剪贴板失败");
      alert("复制失败，请手动复制");
    }
  }

  // Tmall-MySellerEnhance/action/copyUniqueItemIds/copyUniqueItemIds.action.ts
  function checkItemIdDisplayExists2() {
    const displays = document.querySelectorAll(".tmall-order-enhance-item-code");
    return displays.length > 0;
  }
  function getAllItemIdsFromDOM2() {
    const itemIds = [];
    const displays = document.querySelectorAll(".tmall-order-enhance-item-code-value");
    displays.forEach((display) => {
      const text = display.textContent?.trim();
      if (text) {
        itemIds.push(text);
      }
    });
    return itemIds;
  }
  function deduplicateItemIds(itemIds) {
    return [...new Set(itemIds)];
  }
  async function handleCopyUniqueItemIds() {
    console.log("执行复制去重商品ID逻辑...");
    const itemIdExists = checkItemIdDisplayExists2();
    if (!itemIdExists) {
      console.log("商品ID展示不存在，先触发getItemId获取商品ID...");
      await handleGetItemId();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    const itemIds = getAllItemIdsFromDOM2();
    if (itemIds.length === 0) {
      console.warn("未获取到任何商品ID");
      alert("未获取到商品ID，请确保页面有订单数据");
      return;
    }
    console.log(`获取到 ${itemIds.length} 个商品ID`);
    const uniqueItemIds = deduplicateItemIds(itemIds);
    console.log(`去重后剩余 ${uniqueItemIds.length} 个商品ID`);
    const textToCopy = uniqueItemIds.join("\n");
    const success = await copyToClipboard(textToCopy);
    if (success) {
      console.log("去重后的商品ID已复制到剪贴板");
      alert(`已复制 ${uniqueItemIds.length} 个去重后的商品ID到剪贴板`);
    } else {
      console.error("复制到剪贴板失败");
      alert("复制失败，请手动复制");
    }
  }

  // Tmall-MySellerEnhance/action/goodsListInfo/goodsListInfo.action.ts
  function extractGoodsDataFromTr(tr) {
    try {
      const tds = tr.querySelectorAll("td");
      if (tds.length < 9) {
        console.warn("td 数量不足，跳过该行");
        return null;
      }
      const titleTd = tds[1];
      const priceTd = tds[2];
      const stockTd = tds[3];
      const totalSalesTd = tds[4];
      const thirtyDaySalesTd = tds[5];
      const createTimeTd = tds[7];
      const img = titleTd.querySelector("img.product-desc-extend-image");
      const imageUrl = img?.src || "";
      const idSpan = Array.from(titleTd.querySelectorAll("span")).find(
        (span) => span.textContent && span.textContent.includes("ID:")
      );
      let itemId = "";
      if (idSpan) {
        const match = idSpan.textContent?.match(/ID:(\d+)/);
        itemId = match ? match[1] : "";
      }
      const codeSpan = Array.from(titleTd.querySelectorAll("span")).find(
        (span) => span.textContent && span.textContent.includes("编码:")
      );
      let itemCode = "";
      if (codeSpan) {
        const match = codeSpan.textContent?.match(/编码:(\d+)/);
        itemCode = match ? match[1] : "";
      }
      const titleLink = titleTd.querySelector("a.title-link");
      const title = titleLink?.textContent?.trim() || "";
      const priceSpan = priceTd.querySelector(".price-value span");
      const price = priceSpan?.textContent?.trim() || "";
      const stockSpan = stockTd.querySelector(".quantity-item-label span.quantity");
      const stock = stockSpan?.textContent?.trim() || "";
      const totalSalesSpan = totalSalesTd.querySelector("span");
      const totalSales = totalSalesSpan?.textContent?.trim() || "";
      const thirtyDaySalesDiv = thirtyDaySalesTd.querySelector(".text-async-label");
      const thirtyDaySales = thirtyDaySalesDiv?.textContent?.trim() || "";
      const createTimeDiv = createTimeTd.querySelector(".product-desc-span");
      const createTime = createTimeDiv?.textContent?.trim() || "";
      return {
        imageUrl,
        itemId,
        itemCode,
        title,
        price,
        stock,
        totalSales,
        thirtyDaySales,
        createTime
      };
    } catch (error) {
      console.error("提取商品数据失败:", error);
      return null;
    }
  }
  function collectGoodsListData() {
    const table = document.querySelector('table[role="table"]');
    if (!table) {
      console.warn('未找到 table[role="table"]');
      return [];
    }
    const tbody = table.querySelector("tbody");
    if (!tbody) {
      console.warn("未找到 tbody");
      return [];
    }
    const rows = tbody.querySelectorAll("tr");
    console.log(`找到 ${rows.length} 个 tr`);
    const goodsList = [];
    rows.forEach((tr, index) => {
      if (tr.classList.contains("next-table-header")) {
        console.log(`跳过表头行 ${index}`);
        return;
      }
      const goodsData = extractGoodsDataFromTr(tr);
      if (goodsData) {
        goodsList.push(goodsData);
        console.log(`采集到商品 ${index}:`, goodsData.title);
      }
    });
    return goodsList;
  }
  function buildTextTable(goodsList) {
    const header = ["商品图片", "商品ID", "商家编码", "商品标题", "价格", "库存", "累计销量", "30日销量", "创建时间"];
    let tableText = header.join("	") + "\n";
    goodsList.forEach((item) => {
      const row = [
        "",
        item.itemId,
        item.itemCode,
        item.title,
        item.price,
        item.stock,
        item.totalSales,
        item.thirtyDaySales,
        item.createTime
      ];
      tableText += row.join("	") + "\n";
    });
    return tableText;
  }
  async function handleGoodsListInfo() {
    console.log("执行商品列表信息增强逻辑...");
    const table = document.querySelector('table[role="table"]');
    if (!table) {
      console.warn('未找到 table[role="table"]');
      alert("未找到商品列表表格，请确保在商品列表页面");
      return;
    }
    const tbody = table.querySelector("tbody");
    if (!tbody) {
      console.warn("未找到 tbody");
      alert("未找到商品列表数据，请确保在商品列表页面");
      return;
    }
    const rows = tbody.querySelectorAll("tr");
    const dataRows = Array.from(rows).filter(
      (tr) => !tr.classList.contains("next-table-header") && tr.querySelectorAll("td").length >= 8
    );
    if (dataRows.length === 0) {
      console.log("当前页面没有商品数据");
      alert("当前页面没有商品数据");
      return;
    }
    console.log(`共有 ${dataRows.length} 条商品数据`);
    const goodsList = collectGoodsListData();
    console.log(`采集到 ${goodsList.length} 条商品数据`);
    if (goodsList.length === 0) {
      console.warn("未能采集到任何商品数据");
      alert("未能采集到商品数据");
      return;
    }
    const tableText = buildTextTable(goodsList);
    console.log("生成的表格文本:", tableText);
    const success = await copyToClipboard(tableText);
    if (success) {
      console.log("已成功复制到剪贴板");
      alert(`已成功复制 ${goodsList.length} 条商品数据到剪贴板`);
    } else {
      console.error("复制到剪贴板失败");
      alert("复制到剪贴板失败，请手动复制");
    }
  }

  // Tmall-MySellerEnhance/ui/component/sellTryShareCatch.ui.ts
  var toastTimer = null;
  function showToast(message, duration = 2e3) {
    if (toastTimer) {
      clearTimeout(toastTimer);
      const existingToast = document.getElementById("sell-try-info-toast");
      if (existingToast) {
        existingToast.remove();
      }
    }
    const toast = document.createElement("div");
    toast.id = "sell-try-info-toast";
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(0, 0, 0, 0.75)",
      color: "#fff",
      padding: "10px 20px",
      borderRadius: "4px",
      fontSize: "14px",
      zIndex: "10001",
      animation: "sellTryInfoFadeIn 0.3s"
    });
    toast.textContent = message;
    const style = document.createElement("style");
    style.textContent = `
    @keyframes sellTryInfoFadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
    if (!document.getElementById("sell-try-info-toast-style")) {
      style.id = "sell-try-info-toast-style";
      document.head.appendChild(style);
    }
    document.body.appendChild(toast);
    toastTimer = setTimeout(() => {
      toast.remove();
      toastTimer = null;
    }, duration);
  }
  async function copyImageToClipboard(imageUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 800;
          canvas.height = 800;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            console.error("无法获取canvas上下文");
            resolve(false);
            return;
          }
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 800, 800);
          canvas.toBlob(async (blob) => {
            if (!blob) {
              console.error("无法创建图片blob");
              resolve(false);
              return;
            }
            try {
              await navigator.clipboard.write([
                new ClipboardItem({
                  [blob.type]: blob
                })
              ]);
              resolve(true);
            } catch (e) {
              console.error("复制图片到剪贴板失败:", e);
              resolve(false);
            }
          }, "image/png");
        } catch (e) {
          console.error("处理图片失败:", e);
          resolve(false);
        }
      };
      img.onerror = () => {
        console.error("图片加载失败");
        resolve(false);
      };
      img.src = imageUrl;
    });
  }
  async function copyTableStructure(results) {
    const rows = results.map((item) => {
      return `  <tr>
    <td><img src='${item.imgUrl}' width='200' height='200'></td>
    <td>${item.itemId}</td>
    <td>${item.itemName}</td>
    <td>${item.text}</td>
  </tr>`;
    }).join("\n");
    const tableHtml = `<table>
${rows}
</table>`;
    await copyToClipboard(tableHtml);
  }
  async function copyTableStructureWithSeparator(results) {
    const rows = [];
    results.forEach((item, index) => {
      rows.push(`  <tr>
    <td><img src='${item.imgUrl}' width='200' height='200'></td>
    <td>${item.itemId}</td>
    <td>${item.itemName}</td>
    <td>${item.text}</td>
  </tr>`);
      if ((index + 1) % 3 === 0 && index < results.length - 1) {
        rows.push(`  <tr>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>`);
      }
    });
    const tableHtml = `<table>
${rows.join("\n")}
</table>`;
    await copyToClipboard(tableHtml);
  }
  function createProgressOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "sell-try-info-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      zIndex: "9999",
      cursor: "not-allowed",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    });
    const content = document.createElement("div");
    Object.assign(content.style, {
      textAlign: "center",
      color: "#fff",
      padding: "30px 40px",
      background: "rgba(0, 0, 0, 0.5)",
      borderRadius: "12px",
      backdropFilter: "blur(10px)",
      maxWidth: "400px"
    });
    const title = document.createElement("div");
    Object.assign(title.style, {
      fontSize: "20px",
      fontWeight: "600",
      marginBottom: "20px"
    });
    title.textContent = "正在采集商品信息...";
    const progressContainer = document.createElement("div");
    Object.assign(progressContainer.style, {
      width: "300px",
      height: "8px",
      background: "rgba(255, 255, 255, 0.2)",
      borderRadius: "4px",
      overflow: "hidden",
      marginBottom: "16px"
    });
    const progressBar = document.createElement("div");
    Object.assign(progressBar.style, {
      height: "100%",
      width: "0%",
      background: "linear-gradient(90deg, #1890ff, #52c41a)",
      borderRadius: "4px",
      transition: "width 0.3s ease"
    });
    progressContainer.appendChild(progressBar);
    const progressText = document.createElement("div");
    Object.assign(progressText.style, {
      fontSize: "14px",
      color: "rgba(255, 255, 255, 0.8)",
      marginBottom: "8px"
    });
    progressText.textContent = "准备中...";
    const statusText = document.createElement("div");
    Object.assign(statusText.style, {
      fontSize: "12px",
      color: "rgba(255, 255, 255, 0.6)"
    });
    const buttonContainer = document.createElement("div");
    Object.assign(buttonContainer.style, {
      display: "flex",
      justifyContent: "center",
      gap: "12px",
      marginTop: "20px"
    });
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "取消采集";
    Object.assign(cancelBtn.style, {
      padding: "8px 20px",
      cursor: "pointer",
      backgroundColor: "#ff4d4f",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)"
    });
    cancelBtn.onmouseenter = () => {
      cancelBtn.style.backgroundColor = "#ff7875";
      cancelBtn.style.transform = "translateY(-1px)";
    };
    cancelBtn.onmouseleave = () => {
      cancelBtn.style.backgroundColor = "#ff4d4f";
      cancelBtn.style.transform = "translateY(0)";
    };
    buttonContainer.appendChild(cancelBtn);
    content.appendChild(title);
    content.appendChild(progressContainer);
    content.appendChild(progressText);
    content.appendChild(statusText);
    content.appendChild(buttonContainer);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    let isCancelled = false;
    const updateProgress = (current, total, message) => {
      const percentage = total > 0 ? Math.round(current / total * 100) : 0;
      progressBar.style.width = `${percentage}%`;
      progressText.textContent = `${current} / ${total} (${percentage}%)`;
      statusText.textContent = message;
      title.textContent = current >= total ? "采集完成!" : "正在采集商品信息...";
    };
    const cancelTask = () => {
      isCancelled = true;
      cancelBtn.textContent = "已取消";
      cancelBtn.disabled = true;
      cancelBtn.style.backgroundColor = "#999";
      cancelBtn.style.cursor = "not-allowed";
      statusText.textContent = "正在取消...";
    };
    cancelBtn.onclick = () => {
      cancelTask();
    };
    return { overlay, updateProgress, cancelTask, isCancelled: () => isCancelled };
  }
  function createDualProgressOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "sell-try-info-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      zIndex: "9999",
      cursor: "not-allowed",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    });
    const content = document.createElement("div");
    Object.assign(content.style, {
      textAlign: "center",
      color: "#fff",
      padding: "30px 40px",
      background: "rgba(0, 0, 0, 0.5)",
      borderRadius: "12px",
      backdropFilter: "blur(10px)",
      maxWidth: "450px"
    });
    const title = document.createElement("div");
    Object.assign(title.style, {
      fontSize: "20px",
      fontWeight: "600",
      marginBottom: "20px"
    });
    title.textContent = "正在采集商品信息...";
    const pageLabel = document.createElement("div");
    Object.assign(pageLabel.style, {
      fontSize: "14px",
      color: "rgba(255, 255, 255, 0.9)",
      marginBottom: "6px",
      textAlign: "left",
      width: "300px"
    });
    pageLabel.textContent = "页面进度";
    const pageProgressContainer = document.createElement("div");
    Object.assign(pageProgressContainer.style, {
      width: "300px",
      height: "10px",
      background: "rgba(255, 255, 255, 0.2)",
      borderRadius: "5px",
      overflow: "hidden",
      marginBottom: "16px"
    });
    const pageProgressBar = document.createElement("div");
    Object.assign(pageProgressBar.style, {
      height: "100%",
      width: "0%",
      background: "linear-gradient(90deg, #722ed1, #9254de)",
      borderRadius: "5px",
      transition: "width 0.3s ease"
    });
    pageProgressContainer.appendChild(pageProgressBar);
    const itemLabel = document.createElement("div");
    Object.assign(itemLabel.style, {
      fontSize: "14px",
      color: "rgba(255, 255, 255, 0.9)",
      marginBottom: "6px",
      textAlign: "left",
      width: "300px"
    });
    itemLabel.textContent = "当前页进度";
    const itemProgressContainer = document.createElement("div");
    Object.assign(itemProgressContainer.style, {
      width: "300px",
      height: "10px",
      background: "rgba(255, 255, 255, 0.2)",
      borderRadius: "5px",
      overflow: "hidden",
      marginBottom: "16px"
    });
    const itemProgressBar = document.createElement("div");
    Object.assign(itemProgressBar.style, {
      height: "100%",
      width: "0%",
      background: "linear-gradient(90deg, #1890ff, #52c41a)",
      borderRadius: "5px",
      transition: "width 0.3s ease"
    });
    itemProgressContainer.appendChild(itemProgressBar);
    const statusText = document.createElement("div");
    Object.assign(statusText.style, {
      fontSize: "12px",
      color: "rgba(255, 255, 255, 0.6)",
      marginTop: "8px"
    });
    const buttonContainer = document.createElement("div");
    Object.assign(buttonContainer.style, {
      display: "flex",
      justifyContent: "center",
      gap: "12px",
      marginTop: "20px"
    });
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "取消采集";
    Object.assign(cancelBtn.style, {
      padding: "8px 20px",
      cursor: "pointer",
      backgroundColor: "#ff4d4f",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)"
    });
    cancelBtn.onmouseenter = () => {
      cancelBtn.style.backgroundColor = "#ff7875";
      cancelBtn.style.transform = "translateY(-1px)";
    };
    cancelBtn.onmouseleave = () => {
      cancelBtn.style.backgroundColor = "#ff4d4f";
      cancelBtn.style.transform = "translateY(0)";
    };
    buttonContainer.appendChild(cancelBtn);
    content.appendChild(title);
    content.appendChild(pageLabel);
    content.appendChild(pageProgressContainer);
    content.appendChild(itemLabel);
    content.appendChild(itemProgressContainer);
    content.appendChild(statusText);
    content.appendChild(buttonContainer);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    let isCancelled = false;
    const updateProgress = (pageCurrent, pageTotal, itemCurrent, itemTotal, message) => {
      const pagePercentage = pageTotal > 0 ? Math.round(pageCurrent / pageTotal * 100) : 0;
      pageProgressBar.style.width = `${pagePercentage}%`;
      pageLabel.textContent = `页面进度: ${pageCurrent} / ${pageTotal} (${pagePercentage}%)`;
      const itemPercentage = itemTotal > 0 ? Math.round(itemCurrent / itemTotal * 100) : 0;
      itemProgressBar.style.width = `${itemPercentage}%`;
      itemLabel.textContent = `当前页进度: ${itemCurrent} / ${itemTotal} (${itemPercentage}%)`;
      statusText.textContent = message;
      title.textContent = pageCurrent >= pageTotal && itemCurrent >= itemTotal ? "采集完成!" : "正在采集商品信息...";
    };
    const cancelTask = () => {
      isCancelled = true;
      cancelBtn.textContent = "已取消";
      cancelBtn.disabled = true;
      cancelBtn.style.backgroundColor = "#999";
      cancelBtn.style.cursor = "not-allowed";
      statusText.textContent = "正在取消...";
    };
    cancelBtn.onclick = () => {
      cancelTask();
    };
    return { overlay, updateProgress, cancelTask, isCancelled: () => isCancelled };
  }
  function showResultsTable(results) {
    const modal = document.createElement("div");
    modal.id = "sell-try-info-results-modal";
    Object.assign(modal.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: "10000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    });
    const content = document.createElement("div");
    Object.assign(content.style, {
      backgroundColor: "#fff",
      borderRadius: "8px",
      width: "90%",
      maxWidth: "1200px",
      height: "80vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    });
    const header = document.createElement("div");
    Object.assign(header.style, {
      padding: "16px 20px",
      borderBottom: "1px solid #eee",
      flexShrink: "0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    });
    const title = document.createElement("h2");
    title.textContent = `采集完成，共 ${results.length} 条数据`;
    Object.assign(title.style, {
      margin: "0",
      fontSize: "18px",
      fontWeight: "600",
      color: "#333"
    });
    header.appendChild(title);
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    Object.assign(closeBtn.style, {
      width: "32px",
      height: "32px",
      cursor: "pointer",
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "4px",
      fontSize: "20px",
      color: "#999",
      transition: "background 0.2s"
    });
    closeBtn.onmouseenter = () => {
      closeBtn.style.backgroundColor = "#f0f0f0";
    };
    closeBtn.onmouseleave = () => {
      closeBtn.style.backgroundColor = "transparent";
    };
    closeBtn.onclick = () => modal.remove();
    header.appendChild(closeBtn);
    content.appendChild(header);
    const tableContainer = document.createElement("div");
    Object.assign(tableContainer.style, {
      flex: "1",
      overflow: "auto",
      padding: "0"
    });
    const table = document.createElement("table");
    Object.assign(table.style, {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "14px"
    });
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["商品图片", "商品ID", "商品标题", "分享链接"].forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      Object.assign(th.style, {
        border: "1px solid #ddd",
        padding: "12px 16px",
        textAlign: "left",
        backgroundColor: "#f5f5f5",
        fontWeight: "600",
        color: "#333",
        position: "sticky",
        top: "0",
        zIndex: "1"
      });
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    const dataMap = /* @__PURE__ */ new Map();
    results.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.dataset.index = String(index);
      dataMap.set(index, item);
      const tdImg = document.createElement("td");
      Object.assign(tdImg.style, {
        border: "1px solid #ddd",
        padding: "8px",
        textAlign: "center"
      });
      tdImg.dataset.type = "image";
      if (item.imgUrl) {
        const img = document.createElement("img");
        img.src = item.imgUrl;
        Object.assign(img.style, {
          width: "60px",
          height: "60px",
          objectFit: "cover",
          borderRadius: "4px",
          cursor: "pointer",
          border: "2px solid transparent",
          transition: "border-color 0.2s"
        });
        img.title = "点击复制图片到剪贴板";
        tdImg.appendChild(img);
      }
      tr.appendChild(tdImg);
      const tdId = document.createElement("td");
      tdId.textContent = item.itemId;
      Object.assign(tdId.style, {
        border: "1px solid #ddd",
        padding: "8px",
        wordBreak: "break-all",
        cursor: "pointer",
        maxWidth: "150px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        transition: "background 0.2s"
      });
      tdId.title = "点击复制商品ID";
      tdId.dataset.type = "item-id";
      tr.appendChild(tdId);
      const tdName = document.createElement("td");
      tdName.textContent = item.itemName;
      Object.assign(tdName.style, {
        border: "1px solid #ddd",
        padding: "8px",
        maxWidth: "200px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        cursor: "pointer",
        transition: "background 0.2s"
      });
      tdName.title = "点击复制商品标题";
      tdName.dataset.type = "item-name";
      tr.appendChild(tdName);
      const tdText = document.createElement("td");
      tdText.textContent = item.text || "(空)";
      Object.assign(tdText.style, {
        border: "1px solid #ddd",
        padding: "8px",
        maxWidth: "300px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        cursor: "pointer",
        color: "#1890ff",
        transition: "background 0.2s"
      });
      tdText.title = "点击复制分享链接";
      tdText.dataset.type = "share-text";
      tr.appendChild(tdText);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    tbody.addEventListener("click", async (event) => {
      const target = event.target;
      const td = target.closest("td");
      if (!td) return;
      const tr = td.closest("tr");
      if (!tr) return;
      const index = parseInt(tr.dataset.index || "-1", 10);
      const item = dataMap.get(index);
      if (!item) return;
      const type = td.dataset.type;
      try {
        if (type === "image") {
          const success = await copyImageToClipboard(item.imgUrl);
          if (success) {
            showToast("图片已复制到剪贴板");
          } else {
            showToast("图片复制失败，请重试");
          }
        } else if (type === "item-id") {
          await copyToClipboard(item.itemId);
          showToast("商品ID已复制到剪贴板");
        } else if (type === "item-name") {
          await copyToClipboard(item.itemName);
          showToast("商品标题已复制到剪贴板");
        } else if (type === "share-text") {
          if (item.text) {
            await copyToClipboard(item.text);
            showToast("分享链接已复制到剪贴板");
          } else {
            showToast("分享链接为空，无法复制");
          }
        }
      } catch (e) {
        console.error("复制失败:", e);
        showToast("复制失败，请重试");
      }
    });
    const style = document.createElement("style");
    style.textContent = `
    #sell-try-info-results-modal table tbody tr:hover {
      background: #f9f9f9;
    }
    #sell-try-info-results-modal table td[data-type="image"] img:hover {
      border-color: #1890ff;
    }
    #sell-try-info-results-modal table td[data-type="item-id"]:hover,
    #sell-try-info-results-modal table td[data-type="item-name"]:hover,
    #sell-try-info-results-modal table td[data-type="share-text"]:hover {
      background: #e6f7ff;
    }
  `;
    document.head.appendChild(style);
    content.appendChild(tableContainer);
    const footer = document.createElement("div");
    Object.assign(footer.style, {
      padding: "12px 20px",
      borderTop: "1px solid #eee",
      flexShrink: "0",
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: "10px",
      backgroundColor: "#fafafa"
    });
    const buttonStyle = {
      padding: "8px 16px",
      cursor: "pointer",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      fontSize: "14px",
      transition: "background 0.2s"
    };
    const copyJsonBtn = document.createElement("button");
    copyJsonBtn.textContent = "复制JSON信息";
    Object.assign(copyJsonBtn.style, {
      ...buttonStyle,
      backgroundColor: "#722ed1"
    });
    copyJsonBtn.onmouseenter = () => {
      copyJsonBtn.style.backgroundColor = "#9254de";
    };
    copyJsonBtn.onmouseleave = () => {
      copyJsonBtn.style.backgroundColor = "#722ed1";
    };
    copyJsonBtn.onclick = async () => {
      const json = JSON.stringify(results, null, 2);
      await copyToClipboard(json);
      showToast("JSON信息已复制到剪贴板");
    };
    footer.appendChild(copyJsonBtn);
    const copyTableBtn = document.createElement("button");
    copyTableBtn.textContent = "复制table结构";
    Object.assign(copyTableBtn.style, {
      ...buttonStyle,
      backgroundColor: "#1890ff"
    });
    copyTableBtn.onmouseenter = () => {
      copyTableBtn.style.backgroundColor = "#40a9ff";
    };
    copyTableBtn.onmouseleave = () => {
      copyTableBtn.style.backgroundColor = "#1890ff";
    };
    copyTableBtn.onclick = async () => {
      await copyTableStructure(results);
      showToast("table结构已复制到剪贴板");
    };
    footer.appendChild(copyTableBtn);
    const copyTableWithSeparatorBtn = document.createElement("button");
    copyTableWithSeparatorBtn.textContent = "复制带间隔的table结构";
    Object.assign(copyTableWithSeparatorBtn.style, {
      ...buttonStyle,
      backgroundColor: "#13c2c2"
    });
    copyTableWithSeparatorBtn.onmouseenter = () => {
      copyTableWithSeparatorBtn.style.backgroundColor = "#36cfc9";
    };
    copyTableWithSeparatorBtn.onmouseleave = () => {
      copyTableWithSeparatorBtn.style.backgroundColor = "#13c2c2";
    };
    copyTableWithSeparatorBtn.onclick = async () => {
      await copyTableStructureWithSeparator(results);
      showToast("带间隔的table结构已复制到剪贴板");
    };
    footer.appendChild(copyTableWithSeparatorBtn);
    const copyItemIdsBtn = document.createElement("button");
    copyItemIdsBtn.textContent = "复制商品ID";
    Object.assign(copyItemIdsBtn.style, {
      ...buttonStyle,
      backgroundColor: "#52c41a"
    });
    copyItemIdsBtn.onmouseenter = () => {
      copyItemIdsBtn.style.backgroundColor = "#73d13d";
    };
    copyItemIdsBtn.onmouseleave = () => {
      copyItemIdsBtn.style.backgroundColor = "#52c41a";
    };
    copyItemIdsBtn.onclick = async () => {
      const allItemIds = results.map((r) => r.itemId).join("\n");
      await copyToClipboard(allItemIds);
      showToast("所有商品ID已复制到剪贴板");
    };
    footer.appendChild(copyItemIdsBtn);
    content.appendChild(footer);
    modal.appendChild(content);
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
    document.body.appendChild(modal);
  }

  // Tmall-MySellerEnhance/action/sellTryHelper.ts
  var COMMON_SELECTORS = {
    // 表格相关
    tableBody: "table > tbody",
    tableRow: "tr[data-row-key]",
    tableRowKey: "data-row-key",
    // 商品信息
    itemImage: "td img",
    itemLink: "a",
    itemId: "data-row-key",
    // 操作按钮
    actionButton: "td:last-child button",
    // 分页器
    pagination: "ul.tbd-pagination",
    paginationNext: "li.tbd-pagination-next",
    paginationNextDisabled: "li.tbd-pagination-next.tbd-pagination-disabled",
    paginationItem: "li.tbd-pagination-item",
    paginationItemActive: "li.tbd-pagination-item-active"
  };
  var DELAY_CONFIG = {
    BUTTON_CLICK: 800,
    DRAWER_OPEN: 1e3,
    PAGE_LOAD: 1500
  };
  var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  function trim(str) {
    return str?.trim() ?? "";
  }
  async function safeClickButton(button, delay = DELAY_CONFIG.BUTTON_CLICK) {
    if (!button) {
      console.warn("按钮元素不存在，跳过点击操作");
      return false;
    }
    try {
      button.click();
      await sleep(delay);
      return true;
    } catch (error) {
      console.error("点击按钮失败:", error);
      return false;
    }
  }
  function getPaginationInfo() {
    const pagination = document.querySelector(COMMON_SELECTORS.pagination);
    if (!pagination) {
      console.warn("未找到分页器");
      return { currentPage: 1, totalPages: 1, hasNextPage: false };
    }
    const activeItem = pagination.querySelector(COMMON_SELECTORS.paginationItemActive);
    const currentPage = activeItem ? parseInt(activeItem.textContent?.trim() || "1", 10) : 1;
    const pageItems = Array.from(pagination.querySelectorAll(COMMON_SELECTORS.paginationItem));
    const pageNumbers = pageItems.map((item) => {
      const text = item.textContent?.trim();
      const num = parseInt(text || "0", 10);
      return num > 0 ? num : 0;
    }).filter((num) => num > 0);
    const totalPages = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;
    const nextButton = pagination.querySelector(COMMON_SELECTORS.paginationNextDisabled);
    const hasNextPage = !nextButton;
    console.log(`分页信息: 当前第${currentPage}页, 共${totalPages}页, 是否有下一页: ${hasNextPage}`);
    return { currentPage, totalPages, hasNextPage };
  }
  async function clickNextPage() {
    const pagination = document.querySelector(COMMON_SELECTORS.pagination);
    if (!pagination) {
      console.warn("未找到分页器");
      return false;
    }
    const nextButton = pagination.querySelector(
      `${COMMON_SELECTORS.paginationNext}:not(.tbd-pagination-disabled) button`
    );
    if (!nextButton) {
      console.warn("未找到可点击的下一页按钮");
      return false;
    }
    try {
      nextButton.click();
      await sleep(DELAY_CONFIG.PAGE_LOAD);
      return true;
    } catch (error) {
      console.error("点击下一页失败:", error);
      return false;
    }
  }
  async function waitForPageLoad() {
    await sleep(DELAY_CONFIG.PAGE_LOAD);
    try {
      getTableRows();
      return true;
    } catch {
      console.warn("页面数据未加载完成，重试中...");
      await sleep(DELAY_CONFIG.PAGE_LOAD);
      try {
        getTableRows();
        return true;
      } catch {
        return false;
      }
    }
  }
  function getTableRows() {
    const tbody = document.querySelector(COMMON_SELECTORS.tableBody);
    if (!tbody) {
      throw new Error("未找到表格数据 (table > tbody)");
    }
    const trs = Array.from(tbody.querySelectorAll(COMMON_SELECTORS.tableRow));
    if (trs.length === 0) {
      throw new Error("未找到有效的商品行数据");
    }
    return trs;
  }
  function extractItemInfoFromRow(tr) {
    try {
      const img = tr.querySelector(COMMON_SELECTORS.itemImage);
      const imgUrl = img?.src ?? "";
      const itemId = tr.getAttribute(COMMON_SELECTORS.tableRowKey) ?? "";
      const itemLink = tr.querySelector(COMMON_SELECTORS.itemLink);
      const itemName = trim(itemLink?.innerText);
      if (!itemId) {
        console.warn("商品行缺少 data-row-key 属性", tr);
        return null;
      }
      return { imgUrl, itemId, itemName };
    } catch (error) {
      console.error("提取商品信息失败:", error);
      return null;
    }
  }
  function getActionButtonFromRow(tr) {
    const tds = tr.querySelectorAll("td");
    if (tds.length === 0) return null;
    const lastTd = tds[tds.length - 1];
    return lastTd?.querySelector("button") ?? null;
  }

  // Tmall-MySellerEnhance/action/sellTryShareCatch/sellTryShareCatch.action.ts
  var DataStore = class {
    constructor() {
      __publicField(this, "results", []);
    }
    clear() {
      this.results.length = 0;
    }
    add(item) {
      this.results.push(item);
    }
    getAll() {
      return [...this.results];
    }
    findIndex(text) {
      if (!text || this.results.length === 0) return -1;
      for (let i = this.results.length - 1; i >= 0; i--) {
        if (this.results[i].text === text) return i;
      }
      return -1;
    }
  };
  var dataStore = new DataStore();
  var SELECTORS = {
    // Tab 切换
    shareTab: "div.tbd-tabs-nav-wrap div[data-node-key='item']",
    // 抽屉弹窗
    drawerContent: "div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body > div",
    drawerButtons: "div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body > div > button"
  };
  async function readFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      console.log("剪切板内容:", text);
      return text || "";
    } catch (error) {
      console.error("读取剪切板失败:", error);
      return "";
    }
  }
  async function ensureClipboardPermission() {
    try {
      await navigator.clipboard.readText();
      return true;
    } catch (err) {
      console.log("正在请求剪切板权限...", err);
      try {
        await navigator.clipboard.readText();
        return true;
      } catch {
        console.error("剪切板权限被拒绝");
        alert("请授予剪切板访问权限以继续执行脚本");
        return false;
      }
    }
  }
  function extractItemInfoFromRowLocal(tr) {
    const baseInfo = extractItemInfoFromRow(tr);
    if (!baseInfo) return null;
    return { ...baseInfo, text: "" };
  }
  async function switchToShareTab() {
    const tabs = document.querySelectorAll(SELECTORS.shareTab);
    if (tabs.length === 0) {
      console.warn("未找到分享 tab 元素");
      return false;
    }
    try {
      tabs[0].click();
      await sleep(DELAY_CONFIG.BUTTON_CLICK);
      return true;
    } catch (error) {
      console.error("切换分享 tab 失败:", error);
      return false;
    }
  }
  async function clickGenerateTokenButton() {
    const drawerDivs = document.querySelectorAll(SELECTORS.drawerContent);
    if (drawerDivs.length === 0) {
      console.warn("未找到抽屉弹窗内容");
      return false;
    }
    const lastDiv = drawerDivs[drawerDivs.length - 1];
    const generateButton = lastDiv.querySelector("button");
    return await safeClickButton(generateButton, DELAY_CONFIG.BUTTON_CLICK);
  }
  async function closeDrawer() {
    const buttonList = document.querySelectorAll(SELECTORS.drawerButtons);
    if (buttonList.length < 2) {
      console.warn("未找到足够的关闭按钮");
      return false;
    }
    return await safeClickButton(buttonList[1], DELAY_CONFIG.BUTTON_CLICK);
  }
  async function waitForDrawerOpen() {
    await sleep(DELAY_CONFIG.DRAWER_OPEN);
  }
  async function handleSellTryInfo() {
    const paginationInfo = getPaginationInfo();
    const { currentPage, totalPages, hasNextPage } = paginationInfo;
    let pagesToFetch = 0;
    if (hasNextPage || totalPages > 1) {
      const remainingPages = totalPages - currentPage;
      const input = prompt(
        `当前第 ${currentPage} 页，共 ${totalPages} 页。
后续还有 ${remainingPages} 页需要获取。

请输入要向后获取的页数（不输入或输入0则仅获取当前页，输入1为获取两页）:`
      );
      pagesToFetch = parseInt(input || "0", 10);
      if (isNaN(pagesToFetch) || pagesToFetch < 0) pagesToFetch = 0;
      if (pagesToFetch > remainingPages) pagesToFetch = remainingPages;
    }
    const totalPagesToFetch = pagesToFetch + 1;
    const useDualProgress = pagesToFetch > 0;
    const { overlay, updateProgress, isCancelled } = useDualProgress ? createDualProgressOverlay() : createProgressOverlay();
    try {
      if (useDualProgress) {
        updateProgress(
          0,
          totalPagesToFetch,
          0,
          1,
          "正在请求剪切板权限..."
        );
      } else {
        updateProgress(0, 0, "正在请求剪切板权限...");
      }
      if (!await ensureClipboardPermission()) {
        overlay.remove();
        return;
      }
      if (isCancelled()) {
        overlay.remove();
        return;
      }
      dataStore.clear();
      let successCount = 0;
      let currentPageNum = currentPage;
      for (let pageIndex = 0; pageIndex < totalPagesToFetch; pageIndex++) {
        if (isCancelled()) {
          console.log("用户取消了采集任务");
          try {
            await closeDrawer();
          } catch {
          }
          overlay.remove();
          return;
        }
        let tableRows;
        try {
          if (useDualProgress) {
            updateProgress(
              pageIndex + 1,
              totalPagesToFetch,
              0,
              1,
              "正在获取表格数据..."
            );
          } else {
            updateProgress(0, 1, "正在获取表格数据...");
          }
          tableRows = getTableRows();
        } catch (error) {
          console.error("获取表格数据失败:", error);
          alert(error instanceof Error ? error.message : "获取表格数据失败");
          overlay.remove();
          return;
        }
        const totalItems = tableRows.length;
        for (let i = 0; i < tableRows.length; i++) {
          if (isCancelled()) {
            console.log("用户取消了采集任务");
            try {
              await closeDrawer();
            } catch {
            }
            overlay.remove();
            return;
          }
          const tr = tableRows[i];
          if (useDualProgress) {
            updateProgress(
              pageIndex + 1,
              totalPagesToFetch,
              i + 1,
              totalItems,
              `正在处理第 ${pageIndex + 1} 页第 ${i + 1} 个商品...`
            );
          } else {
            updateProgress(i, totalItems, `正在处理第 ${i + 1} 个商品...`);
          }
          try {
            const itemInfo = extractItemInfoFromRowLocal(tr);
            if (!itemInfo) {
              console.warn("跳过无效商品行");
              continue;
            }
            const actionButton = getActionButtonFromRow(tr);
            if (!await safeClickButton(actionButton, 1e3)) {
              console.warn("无法打开商品详情抽屉，跳过此项");
              continue;
            }
            await waitForDrawerOpen();
            if (!await switchToShareTab()) {
              console.warn("切换分享 tab 失败，尝试继续处理");
            }
            if (!await clickGenerateTokenButton()) {
              console.warn("生成口令失败，尝试继续处理");
            }
            itemInfo.text = await readFromClipboard();
            if (!itemInfo.text) console.warn("采集到的分享链接为空，但仍记录数据");
            const duplicateIndex = dataStore.findIndex(itemInfo.text);
            if (duplicateIndex !== -1) {
              const errorMsg = `检测到重复分享链接！当前第 ${pageIndex + 1} 页第 ${i + 1} 个TR的分享链接与第 ${duplicateIndex + 1} 个TR的分享链接重复。`;
              console.error(errorMsg);
              await closeDrawer();
              const failData = {
                失败位置: `第 ${pageIndex + 1} 页第 ${i + 1} 个TR`,
                重试次数: 1,
                商品ID: itemInfo.itemId,
                商品名称: itemInfo.itemName,
                分享链接: itemInfo.text,
                重复链接位置: `第 ${duplicateIndex + 1} 个TR`
              };
              console.error("解析失效数据:", failData);
              alert(`解析失效：在第 ${pageIndex + 1} 页第 ${i + 1} 个TR发生解析失效问题，已重试 1 次仍存在重复。

详细数据：
${JSON.stringify(failData, null, 2)}`);
              throw new Error(`解析失效：在第 ${pageIndex + 1} 页第 ${i + 1} 个TR发生解析失效问题`);
            }
            dataStore.add(itemInfo);
            console.log(`已采集商品：${itemInfo.itemId} - ${itemInfo.itemName}`);
            successCount++;
            if (useDualProgress) {
              updateProgress(
                pageIndex + 1,
                totalPagesToFetch,
                i + 1,
                totalItems,
                `已处理: ${tr.getAttribute("data-row-key") || "未知商品"}`
              );
            } else {
              updateProgress(
                i + 1,
                totalItems,
                `已处理: ${tr.getAttribute("data-row-key") || "未知商品"}`
              );
            }
            if (!await closeDrawer()) console.warn("关闭抽屉失败，可能影响后续操作");
          } catch (error) {
            console.error(`处理商品行时发生错误:`, error, tr);
            overlay.remove();
            return;
          }
        }
        if (pageIndex < totalPagesToFetch - 1) {
          console.log(`正在跳转到第 ${pageIndex + 2} 页...`);
          if (!await clickNextPage()) {
            console.warn("翻页失败，停止采集");
            break;
          }
          if (!await waitForPageLoad()) {
            console.warn("页面加载失败，停止采集");
            break;
          }
          currentPageNum++;
        }
      }
      const allResults = dataStore.getAll();
      console.log(`采集完成，成功 ${successCount} 条`);
      console.log("获取到的所有信息：", allResults);
      if (allResults.length === 0) {
        alert("未采集到任何数据，请查看控制台日志。");
      } else {
        showResultsTable(allResults);
      }
    } catch (error) {
      console.error("执行过程中发生未捕获错误:", error);
      alert("执行过程中发生错误，详情请查看控制台。");
    } finally {
      overlay.remove();
    }
  }

  // Tmall-MySellerEnhance/ui/component/sellTryBasicInfo.ui.ts
  var toastTimer2 = null;
  function showToast2(message, duration = 2e3) {
    if (toastTimer2) {
      clearTimeout(toastTimer2);
      const existingToast = document.getElementById("sell-try-basic-info-toast");
      if (existingToast) {
        existingToast.remove();
      }
    }
    const toast = document.createElement("div");
    toast.id = "sell-try-basic-info-toast";
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(0, 0, 0, 0.75)",
      color: "#fff",
      padding: "10px 20px",
      borderRadius: "4px",
      fontSize: "14px",
      zIndex: "10001",
      animation: "sellTryBasicInfoFadeIn 0.3s"
    });
    toast.textContent = message;
    const style = document.createElement("style");
    style.textContent = `
    @keyframes sellTryBasicInfoFadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
    if (!document.getElementById("sell-try-basic-info-toast-style")) {
      style.id = "sell-try-basic-info-toast-style";
      document.head.appendChild(style);
    }
    document.body.appendChild(toast);
    toastTimer2 = setTimeout(() => {
      toast.remove();
      toastTimer2 = null;
    }, duration);
  }
  function createBasicInfoProgressOverlay(totalPages) {
    const overlay = document.createElement("div");
    overlay.id = "sell-try-basic-info-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      zIndex: "9999",
      cursor: "not-allowed",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    });
    const content = document.createElement("div");
    Object.assign(content.style, {
      textAlign: "center",
      color: "#fff",
      padding: "30px 40px",
      background: "rgba(0, 0, 0, 0.5)",
      borderRadius: "12px",
      backdropFilter: "blur(10px)",
      maxWidth: "450px"
    });
    const title = document.createElement("div");
    Object.assign(title.style, {
      fontSize: "20px",
      fontWeight: "600",
      marginBottom: "20px"
    });
    title.textContent = "正在批量获取商品基本信息...";
    const pageLabel = document.createElement("div");
    Object.assign(pageLabel.style, {
      fontSize: "14px",
      color: "rgba(255, 255, 255, 0.9)",
      marginBottom: "6px",
      textAlign: "left",
      width: "300px"
    });
    pageLabel.textContent = "页面进度";
    const pageProgressContainer = document.createElement("div");
    Object.assign(pageProgressContainer.style, {
      width: "300px",
      height: "10px",
      background: "rgba(255, 255, 255, 0.2)",
      borderRadius: "5px",
      overflow: "hidden",
      marginBottom: "16px"
    });
    const pageProgressBar = document.createElement("div");
    Object.assign(pageProgressBar.style, {
      height: "100%",
      width: "0%",
      background: "linear-gradient(90deg, #722ed1, #9254de)",
      borderRadius: "5px",
      transition: "width 0.3s ease"
    });
    pageProgressContainer.appendChild(pageProgressBar);
    const itemLabel = document.createElement("div");
    Object.assign(itemLabel.style, {
      fontSize: "14px",
      color: "rgba(255, 255, 255, 0.9)",
      marginBottom: "6px",
      textAlign: "left",
      width: "300px"
    });
    itemLabel.textContent = "当前页进度";
    const itemProgressContainer = document.createElement("div");
    Object.assign(itemProgressContainer.style, {
      width: "300px",
      height: "10px",
      background: "rgba(255, 255, 255, 0.2)",
      borderRadius: "5px",
      overflow: "hidden",
      marginBottom: "16px"
    });
    const itemProgressBar = document.createElement("div");
    Object.assign(itemProgressBar.style, {
      height: "100%",
      width: "0%",
      background: "linear-gradient(90deg, #1890ff, #52c41a)",
      borderRadius: "5px",
      transition: "width 0.3s ease"
    });
    itemProgressContainer.appendChild(itemProgressBar);
    const statusText = document.createElement("div");
    Object.assign(statusText.style, {
      fontSize: "12px",
      color: "rgba(255, 255, 255, 0.6)",
      marginTop: "8px"
    });
    const buttonContainer = document.createElement("div");
    Object.assign(buttonContainer.style, {
      display: "flex",
      justifyContent: "center",
      gap: "12px",
      marginTop: "20px"
    });
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "取消采集";
    Object.assign(cancelBtn.style, {
      padding: "8px 20px",
      cursor: "pointer",
      backgroundColor: "#ff4d4f",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)"
    });
    cancelBtn.onmouseenter = () => {
      cancelBtn.style.backgroundColor = "#ff7875";
      cancelBtn.style.transform = "translateY(-1px)";
    };
    cancelBtn.onmouseleave = () => {
      cancelBtn.style.backgroundColor = "#ff4d4f";
      cancelBtn.style.transform = "translateY(0)";
    };
    buttonContainer.appendChild(cancelBtn);
    content.appendChild(title);
    content.appendChild(pageLabel);
    content.appendChild(pageProgressContainer);
    content.appendChild(itemLabel);
    content.appendChild(itemProgressContainer);
    content.appendChild(statusText);
    content.appendChild(buttonContainer);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    let isCancelled = false;
    const updateProgress = (pageCurrent, pageTotal, itemCurrent, itemTotal, message) => {
      const pagePercentage = pageTotal > 0 ? Math.round(pageCurrent / pageTotal * 100) : 0;
      pageProgressBar.style.width = `${pagePercentage}%`;
      pageLabel.textContent = `页面进度: ${pageCurrent} / ${pageTotal} (${pagePercentage}%)`;
      const itemPercentage = itemTotal > 0 ? Math.round(itemCurrent / itemTotal * 100) : 0;
      itemProgressBar.style.width = `${itemPercentage}%`;
      itemLabel.textContent = `当前页进度: ${itemCurrent} / ${itemTotal} (${itemPercentage}%)`;
      statusText.textContent = message;
      title.textContent = pageCurrent >= pageTotal && itemCurrent >= itemTotal ? "采集完成!" : "正在批量获取商品基本信息...";
    };
    const cancelTask = () => {
      isCancelled = true;
      cancelBtn.textContent = "已取消";
      cancelBtn.disabled = true;
      cancelBtn.style.backgroundColor = "#999";
      cancelBtn.style.cursor = "not-allowed";
      statusText.textContent = "正在取消...";
    };
    cancelBtn.onclick = () => {
      cancelTask();
    };
    return { overlay, updateProgress, cancelTask, isCancelled: () => isCancelled };
  }
  function showBasicInfoResultsTable(results) {
    const modal = document.createElement("div");
    modal.id = "sell-try-basic-info-results-modal";
    Object.assign(modal.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: "10000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    });
    const container = document.createElement("div");
    Object.assign(container.style, {
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#fff",
      borderRadius: "8px",
      maxWidth: "90%",
      maxHeight: "90vh",
      width: "800px",
      overflow: "hidden"
    });
    const header = document.createElement("div");
    Object.assign(header.style, {
      padding: "16px 20px",
      borderBottom: "1px solid #eee",
      flexShrink: "0",
      backgroundColor: "#fff"
    });
    const title = document.createElement("h2");
    title.textContent = `批量获取基本信息完成，共 ${results.length} 条数据`;
    Object.assign(title.style, {
      margin: "0",
      fontSize: "18px",
      fontWeight: "600",
      color: "#333"
    });
    header.appendChild(title);
    const scrollContainer = document.createElement("div");
    Object.assign(scrollContainer.style, {
      flex: "1",
      overflowY: "auto",
      overflowX: "hidden"
    });
    const table = document.createElement("table");
    Object.assign(table.style, {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "14px"
    });
    const thead = document.createElement("thead");
    thead.style.backgroundColor = "#f5f5f5";
    const headerRow = document.createElement("tr");
    ["商品图片", "商品ID", "商品标题"].forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      Object.assign(th.style, {
        border: "1px solid #ddd",
        padding: "12px 16px",
        textAlign: "left",
        backgroundColor: "#f5f5f5",
        fontWeight: "600",
        color: "#333",
        position: "sticky",
        top: "0",
        zIndex: "1"
      });
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    const dataMap = /* @__PURE__ */ new Map();
    results.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.dataset.index = String(index);
      dataMap.set(index, item);
      const tdImg = document.createElement("td");
      Object.assign(tdImg.style, {
        border: "1px solid #ddd",
        padding: "8px",
        textAlign: "center",
        verticalAlign: "middle"
      });
      tdImg.dataset.type = "image";
      if (item.imgUrl) {
        const img = document.createElement("img");
        img.src = item.imgUrl;
        Object.assign(img.style, {
          width: "50px",
          height: "50px",
          objectFit: "cover",
          borderRadius: "4px",
          cursor: "pointer",
          border: "2px solid transparent",
          transition: "border-color 0.2s"
        });
        img.title = "点击复制图片URL";
        tdImg.appendChild(img);
      }
      tr.appendChild(tdImg);
      const tdId = document.createElement("td");
      tdId.textContent = item.itemId;
      Object.assign(tdId.style, {
        border: "1px solid #ddd",
        padding: "8px",
        wordBreak: "break-all",
        cursor: "pointer",
        maxWidth: "150px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        transition: "background 0.2s"
      });
      tdId.title = "点击复制商品ID";
      tdId.dataset.type = "item-id";
      tr.appendChild(tdId);
      const tdName = document.createElement("td");
      tdName.textContent = item.itemName;
      Object.assign(tdName.style, {
        border: "1px solid #ddd",
        padding: "8px",
        maxWidth: "300px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        cursor: "pointer",
        transition: "background 0.2s"
      });
      tdName.title = "点击复制商品标题";
      tdName.dataset.type = "item-name";
      tr.appendChild(tdName);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scrollContainer.appendChild(table);
    tbody.addEventListener("click", async (event) => {
      const target = event.target;
      const td = target.closest("td");
      if (!td) return;
      const tr = td.closest("tr");
      if (!tr) return;
      const index = parseInt(tr.dataset.index || "-1", 10);
      const item = dataMap.get(index);
      if (!item) return;
      const type = td.dataset.type;
      try {
        if (type === "image") {
          await copyToClipboard(item.imgUrl);
          showToast2("图片URL已复制到剪贴板");
        } else if (type === "item-id") {
          await copyToClipboard(item.itemId);
          showToast2("商品ID已复制到剪贴板");
        } else if (type === "item-name") {
          await copyToClipboard(item.itemName);
          showToast2("商品标题已复制到剪贴板");
        }
      } catch (e) {
        console.error("复制失败:", e);
        showToast2("复制失败，请重试");
      }
    });
    const style = document.createElement("style");
    style.textContent = `
    #sell-try-basic-info-results-modal table tbody tr:hover {
      background: #f9f9f9;
    }
    #sell-try-basic-info-results-modal table td[data-type="image"] img:hover {
      border-color: #1890ff;
    }
    #sell-try-basic-info-results-modal table td[data-type="item-id"]:hover,
    #sell-try-basic-info-results-modal table td[data-type="item-name"]:hover {
      background: #e6f7ff;
    }
  `;
    document.head.appendChild(style);
    const footer = document.createElement("div");
    Object.assign(footer.style, {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: "12px 20px",
      borderTop: "1px solid #eee",
      flexShrink: "0",
      backgroundColor: "#fff",
      gap: "10px"
    });
    const buttonStyle = {
      padding: "8px 16px",
      cursor: "pointer",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      fontSize: "14px",
      transition: "background 0.2s"
    };
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "关闭";
    Object.assign(closeBtn.style, {
      ...buttonStyle,
      backgroundColor: "#666"
    });
    closeBtn.onmouseenter = () => {
      closeBtn.style.backgroundColor = "#787878";
    };
    closeBtn.onmouseleave = () => {
      closeBtn.style.backgroundColor = "#666";
    };
    closeBtn.onclick = () => modal.remove();
    footer.appendChild(closeBtn);
    const copyAllBtn = document.createElement("button");
    copyAllBtn.textContent = "复制全部信息";
    Object.assign(copyAllBtn.style, {
      ...buttonStyle,
      backgroundColor: "#1890ff"
    });
    copyAllBtn.onmouseenter = () => {
      copyAllBtn.style.backgroundColor = "#40a9ff";
    };
    copyAllBtn.onmouseleave = () => {
      copyAllBtn.style.backgroundColor = "#1890ff";
    };
    copyAllBtn.onclick = async () => {
      const rows = results.map((item) => {
        return `  <tr>
    <td><img src='${item.imgUrl}' width='50' height='50'></td>
    <td>${item.itemId}</td>
    <td>${item.itemName}</td>
  </tr>`;
      }).join("\n");
      const tableHtml = `<table>
${rows}
</table>`;
      await copyToClipboard(tableHtml);
      showToast2("全部信息已复制到剪贴板");
    };
    footer.appendChild(copyAllBtn);
    const copyAllIdsBtn = document.createElement("button");
    copyAllIdsBtn.textContent = "复制所有商品ID";
    Object.assign(copyAllIdsBtn.style, {
      ...buttonStyle,
      backgroundColor: "#52c41a"
    });
    copyAllIdsBtn.onmouseenter = () => {
      copyAllIdsBtn.style.backgroundColor = "#73d13d";
    };
    copyAllIdsBtn.onmouseleave = () => {
      copyAllIdsBtn.style.backgroundColor = "#52c41a";
    };
    copyAllIdsBtn.onclick = async () => {
      const allItemIds = results.map((r) => r.itemId).join("\n");
      await copyToClipboard(allItemIds);
      showToast2("所有商品ID已复制到剪贴板");
    };
    footer.appendChild(copyAllIdsBtn);
    const copyAllNamesBtn = document.createElement("button");
    copyAllNamesBtn.textContent = "复制所有商品标题";
    Object.assign(copyAllNamesBtn.style, {
      ...buttonStyle,
      backgroundColor: "#722ed1"
    });
    copyAllNamesBtn.onmouseenter = () => {
      copyAllNamesBtn.style.backgroundColor = "#9254de";
    };
    copyAllNamesBtn.onmouseleave = () => {
      copyAllNamesBtn.style.backgroundColor = "#722ed1";
    };
    copyAllNamesBtn.onclick = async () => {
      const allItemNames = results.map((r) => r.itemName).join("\n");
      await copyToClipboard(allItemNames);
      showToast2("所有商品标题已复制到剪贴板");
    };
    footer.appendChild(copyAllNamesBtn);
    container.appendChild(header);
    container.appendChild(scrollContainer);
    container.appendChild(footer);
    modal.appendChild(container);
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
    document.body.appendChild(modal);
  }

  // Tmall-MySellerEnhance/action/sellTryBasicInfo/sellTryBasicInfo.action.ts
  var BasicInfoDataStore = class {
    constructor() {
      __publicField(this, "results", []);
    }
    clear() {
      this.results.length = 0;
    }
    add(item) {
      this.results.push(item);
    }
    getAll() {
      return [...this.results];
    }
  };
  var basicInfoDataStore = new BasicInfoDataStore();
  async function handleSellTryBasicInfo() {
    const paginationInfo = getPaginationInfo();
    const { currentPage, totalPages, hasNextPage } = paginationInfo;
    let pagesToFetch = 0;
    if (hasNextPage || totalPages > 1) {
      const remainingPages = totalPages - currentPage;
      const input = prompt(
        `当前第 ${currentPage} 页，共 ${totalPages} 页。
后续还有 ${remainingPages} 页需要获取。

请输入要向后获取的页数（不输入或输入0则仅获取当前页，输入1为获取两页）:`
      );
      pagesToFetch = parseInt(input || "0", 10);
      if (isNaN(pagesToFetch) || pagesToFetch < 0) pagesToFetch = 0;
      if (pagesToFetch > remainingPages) pagesToFetch = remainingPages;
    }
    const totalPagesToFetch = pagesToFetch + 1;
    const { overlay, updateProgress, isCancelled } = createBasicInfoProgressOverlay(totalPagesToFetch);
    try {
      basicInfoDataStore.clear();
      let successCount = 0;
      for (let pageIndex = 0; pageIndex < totalPagesToFetch; pageIndex++) {
        if (isCancelled()) {
          console.log("用户取消了采集任务");
          overlay.remove();
          return;
        }
        let tableRows;
        try {
          updateProgress(pageIndex + 1, totalPagesToFetch, 0, 1, "正在获取表格数据...");
          tableRows = getTableRows();
        } catch (error) {
          console.error("获取表格数据失败:", error);
          alert(error instanceof Error ? error.message : "获取表格数据失败");
          overlay.remove();
          return;
        }
        const totalItems = tableRows.length;
        for (let i = 0; i < tableRows.length; i++) {
          if (isCancelled()) {
            console.log("用户取消了采集任务");
            overlay.remove();
            return;
          }
          const tr = tableRows[i];
          updateProgress(pageIndex + 1, totalPagesToFetch, i + 1, totalItems, `正在获取第 ${pageIndex + 1} 页第 ${i + 1} 个商品信息...`);
          try {
            const itemInfo = extractItemInfoFromRow(tr);
            if (!itemInfo) {
              console.warn("跳过无效商品行");
              continue;
            }
            basicInfoDataStore.add(itemInfo);
            console.log(`已获取商品：${itemInfo.itemId} - ${itemInfo.itemName}`);
            successCount++;
            updateProgress(pageIndex + 1, totalPagesToFetch, i + 1, totalItems, `已获取: ${itemInfo.itemId}`);
            await sleep(50);
          } catch (error) {
            console.error(`处理商品行时发生错误:`, error, tr);
          }
        }
        if (pageIndex < totalPagesToFetch - 1) {
          console.log(`正在跳转到第 ${pageIndex + 2} 页...`);
          updateProgress(pageIndex + 1, totalPagesToFetch, totalItems, totalItems, `正在翻页到第 ${pageIndex + 2} 页...`);
          if (!await clickNextPage()) {
            console.warn("翻页失败，停止采集");
            break;
          }
          if (!await waitForPageLoad()) {
            console.warn("页面加载失败，停止采集");
            break;
          }
        }
      }
      const allResults = basicInfoDataStore.getAll();
      console.log(`采集完成，成功 ${successCount} 条`);
      console.log("获取到的所有信息：", allResults);
      if (allResults.length === 0) {
        alert("未采集到任何数据，请查看控制台日志。");
      } else {
        showBasicInfoResultsTable(allResults);
      }
    } catch (error) {
      console.error("执行过程中发生未捕获错误:", error);
      alert("执行过程中发生错误，详情请查看控制台。");
    } finally {
      overlay.remove();
    }
  }

  // Tmall-MySellerEnhance/match/getItemId.match.ts
  function getItemIdMatch() {
    const href = window.location.href;
    return href.includes("trade-platform/tp/sold") || href.includes("trade-platform/tp/order");
  }

  // Tmall-MySellerEnhance/match/copyAllItemIds.match.ts
  function copyAllItemIdsMatch() {
    const href = window.location.href;
    return href.includes("trade-platform/tp/sold") || href.includes("trade-platform/tp/order");
  }

  // Tmall-MySellerEnhance/match/copyUniqueItemIds.match.ts
  function copyUniqueItemIdsMatch() {
    const href = window.location.href;
    return href.includes("trade-platform/tp/sold") || href.includes("trade-platform/tp/order");
  }

  // Tmall-MySellerEnhance/match/goodsListInfo.match.ts
  function goodsListInfoMatch() {
    const href = window.location.href;
    const matchPattern = /home\.htm\/SellManage\/[^?]*\?/;
    return matchPattern.test(href);
  }

  // Tmall-MySellerEnhance/match/sellTryInfo.match.ts
  function sellTryInfoMatch() {
    const href = window.location.href;
    const matchPattern = /home\.htm\/trade-try-buy\/merchList/;
    return matchPattern.test(href);
  }

  // Tmall-MySellerEnhance/match/sellTryBasicInfo.match.ts
  function sellTryBasicInfoMatch() {
    const url = window.location.href;
    const isSellTryMerchList = url.includes("trade-try-buy/merchList") || url.includes("trade-try-buy%2FmerchList");
    const hasPagination = document.querySelector("ul.tbd-pagination") !== null;
    const hasTableBody = document.querySelector("table > tbody") !== null;
    const hasTableRows = document.querySelector("tr[data-row-key]") !== null;
    return isSellTryMerchList && hasPagination && hasTableBody && hasTableRows;
  }

  // Tmall-MySellerEnhance/actions.ts
  var ACTION_BUTTONS = [
    {
      id: "get-item-id",
      label: "获取本页订单商品ID",
      icon: "🔗",
      onClick: handleGetItemId,
      // match 函数：从 match 目录导入
      match: getItemIdMatch
    },
    {
      id: "copy-all-item-ids",
      label: "复制所有商品ID",
      icon: "📋",
      onClick: handleCopyAllItemIds,
      // match 函数：从 match 目录导入
      match: copyAllItemIdsMatch
    },
    {
      id: "copy-unique-item-ids",
      label: "复制去重商品ID",
      icon: "📝",
      onClick: handleCopyUniqueItemIds,
      // match 函数：从 match 目录导入
      match: copyUniqueItemIdsMatch
    },
    {
      id: "goods-list-info",
      label: "复制商品列表信息",
      icon: "📋",
      onClick: handleGoodsListInfo,
      // match 函数：从 match 目录导入
      match: goodsListInfoMatch
    },
    {
      id: "sell-try-info",
      label: "获取新品试销分享信息",
      icon: "🛒",
      onClick: handleSellTryInfo,
      // match 函数：从 match 目录导入
      match: sellTryInfoMatch,
      // 点击click之后关闭侧边抽屉
      clickDrawerHide: true
    },
    {
      id: "sell-try-basic-info",
      label: "批量获取基本信息",
      icon: "📋",
      onClick: handleSellTryBasicInfo,
      // match 函数：从 match 目录导入
      match: sellTryBasicInfoMatch,
      // 点击click之后关闭侧边抽屉
      clickDrawerHide: true
    }
    // 后续可以在这里添加更多按钮配置
    // {
    //   id: "get-order-id",
    //   label: "获取订单ID",
    //   icon: "📋",
    //   onClick: handleGetOrderId,
    //   match: 由各自的match.ts来实现并暴露match函数,
    // },
  ];

  // Tmall-MySellerEnhance/index.ts
  function main() {
    console.log("天猫后台订单信息增强脚本已启动");
    initScript();
  }
  function initScript() {
    console.log("天猫后台订单信息增强脚本初始化中...");
    const checkInterval = setInterval(() => {
      const isPageReady = document.body !== null;
      if (isPageReady) {
        clearInterval(checkInterval);
        console.log("页面已加载完成，开始初始化 UI");
        initUI();
        initRouteListener();
      }
    }, 500);
  }
  function initUI() {
    const existingFloatingBtn = document.getElementById("tmall-order-enhance-floating-btn");
    if (existingFloatingBtn) {
      console.log("UI 元素已存在，不再重复挂载");
      return;
    }
    drawerManager.init(ACTION_BUTTONS);
    createFloatingTrigger(() => {
      drawerManager.toggle();
    });
    console.log("UI 组件初始化完成");
  }
  function initRouteListener() {
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(() => {
        console.log("路由变化，重新检查按钮显示状态");
        drawerManager.refreshButtons();
      }, 100);
    };
    window.addEventListener("popstate", () => {
      setTimeout(() => {
        console.log("浏览器前进/后退，重新检查按钮显示状态");
        drawerManager.refreshButtons();
      }, 100);
    });
    let lastUrl = window.location.href;
    setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log("URL 轮询检测到变化，重新检查按钮显示状态");
        drawerManager.refreshButtons();
      }
    }, 1e3);
    console.log("路由监听器已初始化");
  }
  main();
})();
