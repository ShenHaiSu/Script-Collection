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
 * 扫描 src 目录下的子文件夹并根据规则进行打包
 */
async function buildScripts() {
  const srcDir = __dirname;
  const args = process.argv.slice(2);
  let targetFolders: string[] = [];

  // 获取所有有效的打包项目文件夹
  const allEntries = fs.readdirSync(srcDir, { withFileTypes: true });
  const validProjectFolders = allEntries
    .filter((entry) => {
      if (!entry.isDirectory()) return false;
      if (["node_modules", "dev-tool"].includes(entry.name) || entry.name.startsWith(".")) return false;

      const folderPath = path.join(srcDir, entry.name);
      return fs.existsSync(path.join(folderPath, "index.ts")) && fs.existsSync(path.join(folderPath, "meta.ts"));
    })
    .map((entry) => entry.name);

  if (args.length > 0) {
    // 1. 如果传入了参数，则仅打包指定的文件夹
    const specifiedFolder = args[0];
    if (validProjectFolders.includes(specifiedFolder)) {
      targetFolders = [specifiedFolder];
      console.log(`指定打包项目: ${specifiedFolder}`);
    } else {
      console.error(`错误: 找不到指定的项目文件夹 "${specifiedFolder}" 或该文件夹不包含 index.ts/meta.ts`);
      process.exit(1);
    }
  } else {
    // 2. 如果没有传入参数，获取修改日期最新的五个文件所属的项目
    console.log("未指定打包项目，将自动识别最近修改的项目...");

    const allFiles: { folder: string; mtime: number; path: string }[] = [];

    validProjectFolders.forEach((folderName) => {
      const folderPath = path.join(srcDir, folderName);

      // 递归获取文件夹内所有文件
      const getFiles = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            getFiles(fullPath);
          } else {
            const stats = fs.statSync(fullPath);
            allFiles.push({
              folder: folderName,
              mtime: stats.mtimeMs,
              path: fullPath,
            });
          }
        }
      };

      getFiles(folderPath);
    });

    // 按修改时间降序排列，取前 5 个
    allFiles.sort((a, b) => b.mtime - a.mtime);
    const topFiles = allFiles.slice(0, 5);

    // 打印最新修改的 5 个文件及其修改日期
    if (topFiles.length > 0) {
      console.log("\n最近修改的文件 (前 5 个):");
      console.log("--------------------------------------------------------------------------------");
      topFiles.forEach((file) => {
        const relativePath = path.relative(path.join(srcDir, ".."), file.path);
        const mtimeStr = new Date(file.mtime).toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        console.log(`- ${relativePath.padEnd(60)} [${mtimeStr}]`);
      });
      console.log("--------------------------------------------------------------------------------");
    }

    // 归一化整理所属项目文件夹 (去重)
    targetFolders = Array.from(new Set(topFiles.map((file) => file.folder)));

    if (targetFolders.length === 0) {
      console.log("未发现可打包的项目。");
      return;
    }

    console.log(`识别到最近修改的项目: ${targetFolders.join(", ")}`);
  }

  // 开始打包
  for (const folderName of targetFolders) {
    const folderPath = path.join(srcDir, folderName);
    const indexPath = path.join(folderPath, "index.ts");
    const metaPath = path.join(folderPath, "meta.ts");

    console.log(`\n正在处理脚本: ${folderName}...`);

    try {
      // 动态导入元数据 (使用绝对路径)
      // tsx 环境下可以直接 import ts 文件
      const { meta } = await import(pathToFileURL(metaPath).href);

      if (!meta) {
        console.error(`错误: ${folderName}/meta.ts 未导出 meta 对象`);
        continue;
      }

      const banner = generateBanner(meta);
      // 输出到与 src 同级别的目录
      const rootDir = path.join(srcDir, "..");
      const outputPath = path.join(rootDir, `${folderName}.build.user.js`);

      // 使用 esbuild 进行打包
      await esbuild.build({
        entryPoints: [indexPath],
        bundle: true,
        outfile: outputPath,
        format: "iife", // 油猴脚本通常使用 IIFE 格式
        target: "es2020", // 显式指定现代 ES 版本以保留 const/let 并提高执行效率
        charset: "utf8",
        treeShaking: true, // 开启摇树优化，移除未使用的代码
        minify: false, // 保持代码可读性，方便油猴脚本审核
        supported: {
          "const-and-let": true, // 强制保留 const/let 定义
        },
        banner: {
          js: banner,
        },
        legalComments: "none",
        logLevel: "info",
      });

      console.log(`成功打包: ${outputPath}`);
    } catch (error) {
      console.error(`处理 ${folderName} 时发生错误:`, error);
    }
  }
}

// 执行打包
buildScripts().catch((err) => {
  console.error("打包流程失败:", err);
  process.exit(1);
});
// #endregion
