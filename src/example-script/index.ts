import { sayWelcome } from "./helper";

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

greet("Tampermonkey User");
sayWelcome("Developer");
