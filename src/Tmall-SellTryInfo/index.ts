import { sleep, dataStore } from "./helper";

// #region 全局配置
/** 是否开启调试模式（开启后仅采集前两条数据） */
const DEBUG_MODE = true;
// #endregion

// #region 核心业务逻辑
/**
 * 处理“获取本页信息”按钮点击事件
 */
async function handleGetInfo(): Promise<void> {
  // 1. 构建一个半透明黑色底的视窗遮罩
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "9999";
  overlay.style.cursor = "not-allowed";
  overlay.id = "script-overlay";
  document.body.appendChild(overlay);

  try {
    // 2. 尝试获取一次剪切板内的内容，如果没有权限就拉起权限请求
    try {
      await navigator.clipboard.readText();
    } catch (err) {
      console.log("正在请求剪切板权限...", err);
      // 触发权限请求，通常 readText() 会拉起浏览器的权限弹窗
      await navigator.clipboard.readText().catch(() => {
        alert("请授予剪切板访问权限以继续执行脚本");
        throw new Error("Clipboard permission denied");
      });
    }

    // 3. 在 Document 获取 table > tbody
    const tbody = document.querySelector("table > tbody");
    if (!tbody) {
      alert("未找到表格数据 (table > tbody)");
      return;
    }

    // 4. 检查 tbody 下是不是一个或者多个 tr 标签，排除没有 [data-row-key] 属性的 tr
    let trs = Array.from(tbody.querySelectorAll("tr[data-row-key]"));
    if (trs.length === 0) {
      alert("未找到有效的商品行数据");
      return;
    }

    // DEBUG 模式下仅处理前两条数据
    if (DEBUG_MODE) {
      console.warn("当前处于 DEBUG 模式，仅处理前 2 条数据");
      trs = trs.slice(0, 2);
    }

    dataStore.clear();

    // 5. 针对每个 tr 标签，逐个进行操作
    for (const tr of trs) {
      // 进入 tr 标签下的第一个 td 中，query 一下 img 标签，从中得到图片的 url
      const firstTd = tr.querySelector("td");
      const img = firstTd?.querySelector("img");
      const imgUrl = img?.src || "";

      // 在 tr 标签下的最后一个 td 中，query 一个 button 标签来，对其触发 click 行为
      const tds = tr.querySelectorAll("td");
      const lastTd = tds[tds.length - 1];
      const actionButton = lastTd?.querySelector("button");
      if (!actionButton) continue;

      (actionButton as HTMLElement).click();
      await sleep(1000); // 等待抽屉/弹窗弹出，至少 500ms

      // 寻找并执行 document.querySelectorAll("div.tbd-tabs-nav-wrap div[data-node-key='item']")[0].click()
      const tabs = document.querySelectorAll<HTMLElement>("div.tbd-tabs-nav-wrap div[data-node-key='item']");
      if (tabs.length > 0) {
        tabs[0].click();
        await sleep(800);
      }

      // 再寻找 document.querySelectorAll("div.tbd-drawer-content-wrapper>div.tbd-drawer-section>div.tbd-drawer-body>div") 这个列表中的最后一个 div
      // 在这个 div 中找到第一个 button，对其触发 click 函数
      const drawerDivs = document.querySelectorAll<HTMLElement>(
        "div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body > div",
      );
      if (drawerDivs.length > 0) {
        const lastDiv = drawerDivs[drawerDivs.length - 1];
        const firstButtonInLastDiv = lastDiv.querySelector("button");
        if (firstButtonInLastDiv) {
          (firstButtonInLastDiv as HTMLElement).click();
          await sleep(800);
        }
      }

      // 然后寻找并得到 document.querySelector("div.tbd-modal-confirm-paragraph>div.tbd-modal-confirm-content").innerText
      const confirmContent = document.querySelector<HTMLElement>("div.tbd-modal-confirm-paragraph > div.tbd-modal-confirm-content");
      const text = confirmContent?.innerText || "";

      // 将这个结果记录到内存变量存储容器中
      dataStore.add({ imgUrl, text });

      // 然后寻找 div.tbd-modal-confirm-btns>button 并执行 click 行为
      const confirmBtns = document.querySelector<HTMLElement>("div.tbd-modal-confirm-btns > button");
      if (confirmBtns) {
        confirmBtns.click();
        await sleep(800);
      }

      // 然后在整个 drawer body 范围内查找所有 button，并触发第二个
      const drawerBody = document.querySelector("div.tbd-drawer-content-wrapper > div.tbd-drawer-section > div.tbd-drawer-body");
      if (drawerBody) {
        const buttons = drawerBody.querySelectorAll("button");
        if (buttons.length >= 2) {
          (buttons[1] as HTMLElement).click();
          await sleep(800);
        }
      }
    }

    // 全部结束之后进行一次 log
    console.log("获取到的所有信息：", dataStore.getAll());
    alert("信息获取完成，请查看控制台输出。");
  } catch (error) {
    console.error("执行过程中发生错误:", error);
    alert("执行过程中发生错误，详情请查看控制台。");
  } finally {
    // 移除遮罩
    overlay.remove();
  }
}

/**
 * 初始化脚本逻辑
 * 负责在页面加载后插入按钮，并绑定点击事件
 */
async function initScript(): Promise<void> {
  console.log("天猫千牛店铺新品试销信息自动获取脚本初始化中...");

  // 等待页面加载完毕
  if (document.readyState !== "complete") {
    await new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
  }

  // 等待目标输入框出现
  const inputs = await new Promise<NodeListOf<HTMLInputElement>>((resolve) => {
    const check = () => {
      const el = document.querySelectorAll<HTMLInputElement>("form > div input");
      if (el.length === 2) {
        resolve(el);
      } else {
        setTimeout(check, 500);
      }
    };
    check();
  });

  if (inputs.length !== 2) {
    console.error("未找到预期的两个输入框");
    return;
  }

  // 针对第一个 Input 获取其 closest form
  const form = inputs[0].closest("form");
  if (!form) {
    console.error("未找到 form 标签");
    return;
  }

  // form 下会有两个 div，在第二个 div 的内容中，最前面插入一个 button
  const divs = form.querySelectorAll(":scope > div");
  if (divs.length < 2) {
    console.error("form 下的 div 数量不足 2 个");
    return;
  }

  const targetDiv = divs[1];
  const button = document.createElement("button");
  button.className = "tbd-btn css-fd478t css-var-rb tbd-btn-primary tbd-btn-color-primary tbd-btn-variant-solid tbd-btn-lg";
  button.innerText = "获取本页信息";
  button.style.marginRight = "10px";

  // 在最前面插入按钮
  targetDiv.insertBefore(button, targetDiv.firstChild);

  // 绑定点击事件
  button.onclick = async () => {
    await handleGetInfo();
  };
}
// #endregion

// #region 脚本入口
/**
 * 脚本主入口函数
 */
function main() {
  console.log("天猫千牛店铺新品试销信息自动获取脚本已启动");
  initScript();
}
// #endregion

main();
