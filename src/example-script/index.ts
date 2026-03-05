import { sayWelcome } from "./helper";
import { gmFetch } from "../dev-tool/gmFetch";

console.log("Hello from Example Script!");

// #region 问候功能
/**
 * 向特定用户打招呼
 * @param name 用户名
 */
function greet(name: string) {
  console.log(`Greetings, ${name}!`);
}
// #endregion

// #region 获取 GitHub 信息示例
/**
 * 演示使用封装后的 gmFetch
 */
async function fetchGithubRepo() {
  try {
    const response = await gmFetch("https://api.github.com/repos/ShenHaiSu/Script-Collection");
    if (response.ok) {
      const data = response.json();
      console.log("GitHub 仓库信息:", data);
    } else {
      console.error("请求失败:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("请求异常:", error);
  }
}
// #endregion

greet("Tampermonkey User");
sayWelcome("Developer");
fetchGithubRepo();
