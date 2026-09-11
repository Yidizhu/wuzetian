/**
 * 出 18+ 版（D-029）：ADULT=1 构建到 dist-adult。
 *
 *   npm run build:adult
 *
 * 用脚本设环境变量而不是在 package.json 里写 `ADULT=1 vite build`，
 * 那种写法在 Windows 的 cmd 里不生效。
 */
import { spawnSync } from "node:child_process";
import { ROOT } from "./load.ts";

const r = spawnSync("npx", ["vite", "build"], {
  cwd: ROOT, stdio: "inherit", shell: true,
  env: { ...process.env, ADULT: "1" },
});
if (r.status !== 0) process.exit(r.status ?? 1);
console.log("\n18+ 版在 dist-adult/。默认的 dist/ 里没有这些内容。\n");
