import * as fs from "fs";
import * as path from "path";
import { pathToFileURL } from "url";
import * as esbuild from "esbuild";

// #region 辅助函数
/**
 * 生成油猴脚本头部注释
 * @param meta 脚本元数据对象
 * @returns 格式化后的油猴头部注释字符串
 */
function generateBanner(meta: any): string {
  const lines: string[] = ["// ==UserScript=="];

  // 核心字段处理
  const coreKeys = ["name", "version", "description", "author", "match"];

  if (meta.name) lines.push(`// @name         ${meta.name}`);

  // 处理版本号 (支持函数或字符串)
  const version = typeof meta.version === "function" ? meta.version() : meta.version;
  if (version) lines.push(`// @version      ${version}`);

  if (meta.description) lines.push(`// @description  ${meta.description}`);
  if (meta.author) lines.push(`// @author       ${meta.author}`);

  // 处理匹配 URL (数组形式)
  if (Array.isArray(meta.match)) {
    meta.match.forEach((m: string) => lines.push(`// @match        ${m}`));
  } else if (meta.match) {
    lines.push(`// @match        ${meta.match}`);
  }

  // 处理其他所有字段 (如 grant, icon, require, connect 等)
  Object.keys(meta).forEach((key) => {
    if (coreKeys.includes(key)) return;

    const value = meta[key];
    const prefix = `// @${key.padEnd(12)}`;

    if (Array.isArray(value)) {
      value.forEach((val: string) => lines.push(`${prefix} ${val}`));
    } else if (value !== undefined && value !== null) {
      lines.push(`${prefix} ${value}`);
    }
  });

  lines.push("// ==/UserScript==\n");
  return lines.join("\n");
}

/**
 * 扫描 src 目录下的子文件夹并进行打包
 */
async function buildScripts() {
  const srcDir = __dirname;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    // 仅处理文件夹且排除特殊文件夹
    if (entry.isDirectory() && entry.name !== "node_modules" && !entry.name.startsWith(".")) {
      const folderPath = path.join(srcDir, entry.name);
      const indexPath = path.join(folderPath, "index.ts");
      const metaPath = path.join(folderPath, "meta.ts");

      // 检查 index.ts 和 meta.ts 是否存在
      if (fs.existsSync(indexPath) && fs.existsSync(metaPath)) {
        console.log(`正在处理脚本: ${entry.name}...`);

        try {
          // 动态导入元数据 (使用绝对路径)
          // tsx 环境下可以直接 import ts 文件
          const { meta } = await import(pathToFileURL(metaPath).href);

          if (!meta) {
            console.error(`错误: ${entry.name}/meta.ts 未导出 meta 对象`);
            continue;
          }

          const banner = generateBanner(meta);
          // 输出到与 src 同级别的目录
          const rootDir = path.join(srcDir, "..");
          const outputPath = path.join(rootDir, `${entry.name}.build.user.js`);

          // 使用 esbuild 进行打包
          await esbuild.build({
            entryPoints: [indexPath],
            bundle: true,
            outfile: outputPath,
            format: "iife", // 油猴脚本通常使用 IIFE 格式
            target: "esnext",
            charset: "utf8",
            banner: {
              js: banner,
            },
            legalComments: "none",
            logLevel: "info",
          });

          console.log(`成功打包: ${outputPath}`);
        } catch (error) {
          console.error(`处理 ${entry.name} 时发生错误:`, error);
        }
      }
    }
  }
}

// 执行打包
buildScripts().catch((err) => {
  console.error("打包流程失败:", err);
  process.exit(1);
});
// #endregion
