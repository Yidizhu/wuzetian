/**
 * 出 3D 内联版：STATIC_THREE=1 构建到 dist-3d，再打成单文件。
 *
 *   npm run build:3d
 *
 * 用脚本设环境变量而不是在 package.json 里写 `STATIC_THREE=1 vite build`，
 * 因为那种写法在 Windows 的 cmd 里不生效。
 */
import { spawnSync } from "node:child_process";
import { ROOT } from "./load.ts";

const run = (cmd: string, args: string[]) => {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", shell: true, env: { ...process.env, STATIC_THREE: "1" } });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
run("npx", ["vite", "build"]);
run("node", ["--experimental-strip-types", "tools/build-artifact.ts", "--3d"]);
