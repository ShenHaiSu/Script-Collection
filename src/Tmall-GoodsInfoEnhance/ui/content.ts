/**
 * 覆盖层内容渲染逻辑 (content.ts)
 */
import { store, getSkuItems, parseProductId, copyToClipboard } from "@/Tmall-GoodsInfoEnhance/helper";
import { STYLES } from "@/Tmall-GoodsInfoEnhance/ui/styles";
import { generateSkuTableData } from "@/Tmall-GoodsInfoEnhance/ui/dataGenerator";

/**
 * 刷新覆盖层中的数据内容
 * @param container 放置内容的容器
 */
export function refreshOverlayContent(container: HTMLElement) {
  container.innerHTML = "";

  // 1. 同步 SKU 数据
  const { currentColors, currentSizes } = syncSkuData();

  // 2. 渲染基础信息区块 (ID, 颜色, 尺码)
  renderInfoSections(container, currentColors, currentSizes);

  // 3. 渲染批量生成区域
  renderGenerateSection(container);
}

/**
 * 同步并初始化 SKU 数据状态
 */
function syncSkuData() {
  const currentColors = store.customColors || getSkuItems("颜色");
  const currentSizes = store.customSizes || getSkuItems("尺码");

  if (!store.isSelectionInitialized) {
    if (currentColors.length > 0) store.selectedColors = [...currentColors];
    if (currentSizes.length > 0) store.selectedSizes = [...currentSizes];
    if (currentColors.length > 0 || currentSizes.length > 0) {
      store.isSelectionInitialized = true;
    }
  } else {
    store.selectedColors = store.selectedColors.filter((c) => currentColors.includes(c));
    store.selectedSizes = store.selectedSizes.filter((s) => currentSizes.includes(s));
  }

  return { currentColors, currentSizes };
}

/**
 * 渲染信息展示区块
 */
function renderInfoSections(container: HTMLElement, currentColors: string[], currentSizes: string[]) {
  const dataItems = [
    { label: "商品 ID", getData: () => parseProductId() || "未找到", key: "id" },
    { label: "颜色分类", getData: () => currentColors, key: "colors" },
    { label: "尺码/规格", getData: () => currentSizes, key: "sizes" },
  ];

  dataItems.forEach((item) => {
    const section = createSectionElement(item, container);
    container.appendChild(section);
  });
}

/**
 * 创建单个信息区块元素
 */
function createSectionElement(item: any, container: HTMLElement): HTMLElement {
  const section = document.createElement("div");
  section.style.cssText = STYLES.SECTION;

  const titleRow = document.createElement("div");
  titleRow.style.cssText = STYLES.SECTION_TITLE;

  const labelSpan = document.createElement("span");
  labelSpan.innerText = item.label;
  titleRow.appendChild(labelSpan);

  const rawData = item.getData();
  const isArray = Array.isArray(rawData);
  const isEditing = (item.key === "colors" && store.isEditingColors) || (item.key === "sizes" && store.isEditingSizes);

  // 渲染按钮组
  const btnGroup = createSectionButtonGroup(item, isArray, isEditing, rawData, container, section);
  titleRow.appendChild(btnGroup);
  section.appendChild(titleRow);

  // 渲染主体内容 (Textarea, Chips, 或 Text)
  renderSectionBody(section, item, isArray, isEditing, rawData, container);

  return section;
}

/**
 * 创建区块标题栏的按钮组
 */
function createSectionButtonGroup(
  item: any,
  isArray: boolean,
  isEditing: boolean,
  rawData: any,
  container: HTMLElement,
  section: HTMLElement,
): HTMLElement {
  const btnGroup = document.createElement("div");

  if (isArray) {
    // 编辑/保存按钮
    const editBtn = document.createElement("button");
    editBtn.innerText = isEditing ? "保存" : "编辑";
    editBtn.style.cssText = STYLES.EDIT_BTN;
    editBtn.onclick = () => handleEditToggle(item, isEditing, container, section);
    btnGroup.appendChild(editBtn);

    // 全不选按钮
    const unselectBtn = document.createElement("button");
    unselectBtn.innerText = "全不选";
    unselectBtn.style.cssText = STYLES.UNSELECT_BTN + (isEditing ? STYLES.DISABLED_BTN : "");
    unselectBtn.disabled = isEditing;
    unselectBtn.onclick = () => {
      if (item.key === "colors") store.selectedColors = [];
      if (item.key === "sizes") store.selectedSizes = [];
      refreshOverlayContent(container);
    };
    btnGroup.appendChild(unselectBtn);
  }

  // 复制按钮
  const copyBtn = document.createElement("button");
  copyBtn.innerText = isArray ? "全部复制" : "复制";
  copyBtn.style.cssText = STYLES.COPY_BTN + (isEditing ? STYLES.DISABLED_BTN : "");
  copyBtn.disabled = isEditing;
  copyBtn.onclick = () => {
    const text = isArray ? (rawData as string[]).join("\n") : (rawData as string);
    copyToClipboard(text);
  };
  btnGroup.appendChild(copyBtn);

  return btnGroup;
}

/**
 * 处理编辑状态切换
 */
function handleEditToggle(item: any, isEditing: boolean, container: HTMLElement, section: HTMLElement) {
  if (isEditing) {
    const textarea = section.querySelector("textarea") as HTMLTextAreaElement;
    if (textarea) {
      const newItems = textarea.value
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (item.key === "colors") {
        store.customColors = newItems;
        store.selectedColors = [...newItems];
        store.isEditingColors = false;
      } else {
        store.customSizes = newItems;
        store.selectedSizes = [...newItems];
        store.isEditingSizes = false;
      }
    }
  } else {
    if (item.key === "colors") {
      store.selectedColors = [];
      store.isEditingColors = true;
    } else {
      store.selectedSizes = [];
      store.isEditingSizes = true;
    }
  }
  refreshOverlayContent(container);
}

/**
 * 渲染区块主体
 */
function renderSectionBody(section: HTMLElement, item: any, isArray: boolean, isEditing: boolean, rawData: any, container: HTMLElement) {
  if (isArray) {
    if (isEditing) {
      const textarea = document.createElement("textarea");
      textarea.style.cssText = STYLES.EDIT_TEXTAREA;
      textarea.value = (rawData as string[]).join("\n");
      textarea.placeholder = "每行输入一个选项...";
      section.appendChild(textarea);
    } else if ((rawData as string[]).length > 0) {
      const chipContainer = document.createElement("div");
      chipContainer.style.cssText = STYLES.ITEM_CHIP_CONTAINER;
      (rawData as string[]).forEach((text) => {
        const chip = createChip(text, item.key, container);
        chipContainer.appendChild(chip);
      });
      section.appendChild(chipContainer);
    } else {
      section.appendChild(createInfoBox("未找到"));
    }
  } else {
    section.appendChild(createInfoBox(rawData || "未找到"));
  }
}

/**
 * 创建 SKU 选择标签 (Chip)
 */
function createChip(text: string, key: string, container: HTMLElement): HTMLElement {
  const chip = document.createElement("div");
  chip.innerText = text;
  const isSelected = key === "colors" ? store.selectedColors.includes(text) : store.selectedSizes.includes(text);

  chip.style.cssText = STYLES.ITEM_CHIP + (isSelected ? STYLES.ITEM_CHIP_ACTIVE : "");
  chip.title = isSelected ? "点击取消选中" : "点击选中";

  chip.onclick = () => {
    if (key === "colors") {
      store.selectedColors = isSelected ? store.selectedColors.filter((c) => c !== text) : [...store.selectedColors, text];
    } else {
      store.selectedSizes = isSelected ? store.selectedSizes.filter((s) => s !== text) : [...store.selectedSizes, text];
    }
    refreshOverlayContent(container);
  };
  return chip;
}

/**
 * 创建普通信息展示盒
 */
function createInfoBox(text: string): HTMLElement {
  const infoBox = document.createElement("div");
  infoBox.style.cssText = STYLES.INFO_CONTENT;
  infoBox.innerText = text;
  return infoBox;
}

/**
 * 渲染批量生成表格区域
 */
function renderGenerateSection(container: HTMLElement) {
  const section = document.createElement("div");
  section.style.cssText = STYLES.INPUT_GROUP;

  const label = document.createElement("div");
  label.innerText = "💰 售价设置";
  label.style.cssText = STYLES.INPUT_LABEL;
  section.appendChild(label);

  const priceInput = document.createElement("input");
  priceInput.type = "number";
  priceInput.placeholder = "输入售价 (元), 默认 0";
  priceInput.style.cssText = STYLES.INPUT_CONTROL;
  section.appendChild(priceInput);

  const actionRow = document.createElement("div");
  actionRow.style.cssText = STYLES.ACTION_ROW;

  const clearBtn = document.createElement("button");
  clearBtn.innerText = "清空";
  clearBtn.style.cssText = STYLES.CLEAR_BTN;

  const generateBtn = document.createElement("button");
  generateBtn.innerText = "✨ 批量生成表格数据";
  generateBtn.style.cssText = STYLES.GENERATE_BTN;

  actionRow.appendChild(clearBtn);
  actionRow.appendChild(generateBtn);
  section.appendChild(actionRow);

  const resultTextarea = document.createElement("textarea");
  resultTextarea.style.cssText = STYLES.RESULT_TEXTAREA;
  resultTextarea.placeholder = "点击“批量生成”查看结果...";
  section.appendChild(resultTextarea);

  clearBtn.onclick = () => (resultTextarea.value = "");
  generateBtn.onclick = () => {
    const result = generateSkuTableData(priceInput.value || "0");
    resultTextarea.value = result;
    resultTextarea.select();
    console.log("[Tmall-GoodsInfoEnhance] 批量数据已生成");
  };

  container.appendChild(section);
}
