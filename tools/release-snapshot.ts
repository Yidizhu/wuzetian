/**
 * 从一个**提交**发布，不从工作区发布（D-232，B46续）。
 *
 *   node --experimental-strip-types tools/release-snapshot.ts            # 取 HEAD，检出、跑 build:web，不上传
 *   node --experimental-strip-types tools/release-snapshot.ts <提交>     # 取指定提交
 *   node --experimental-strip-types tools/release-snapshot.ts --deploy   # 检查过了再 vercel --prod
 *
 * 为什么不直接在项目目录里 `vercel --prod`：
 * - 这个目录好几个窗口同时在写，没提交的半成品（别人的稿、图、代码）会被一起传上去；
 * - 没进版本库的大目录（宣传视频、配乐原件、生图原件）CLI 上传前要扫一遍，宣传视频/工具/ 那套 Python 环境让它报 EPERM scandir。
 * 所以：`git worktree` 在英文路径（中文路径 CLI 会报 ByteString 错）检出这个提交——里面**只有版本库里的文件**；
 * 在那里跑一遍 build:web，过了才上传。上传的就是这个提交，报告里写得出提交号。
 *
 * **凭证（D-075）**：只从环境变量 `VERCEL_TOKEN` 读，交给 CLI 的环境，不进命令行参数、不打印。
 * 没有就停在上传前，说一句缺什么。
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync, rmSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./load.ts";

const args = process.argv.slice(2);
const deploy = args.includes("--deploy");
const ref = args.find((a) => !a.startsWith("--")) ?? "HEAD";
const DIR = process.env.RELEASE_DIR ?? "C:\\Users\\10656\\wz-release";

const git = (...a: string[]) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8" }).trim();
const commit = git("rev-parse", ref);
const subject = git("log", "-1", "--format=%s", commit);
console.log(`\n发布快照：${commit.slice(0, 7)}  ${subject}\n  目录 ${DIR}`);

// 旧快照拿掉再检出（worktree 登记一起清）
if (existsSync(DIR)) {
  try { git("worktree", "remove", "--force", DIR); } catch { rmSync(DIR, { recursive: true, force: true }); }
}
git("worktree", "prune");
git("worktree", "add", "--detach", DIR, commit);

// 构建要的两样不在版本库里：依赖（链过去，不重装）、vercel link 的项目信息
const nm = join(DIR, "node_modules");
// 用 Node 自己建目录联接：cmd /c mklink 传中文路径会把目标路径的编码弄坏，链接建出来了却指到不存在的地方
if (!existsSync(nm)) symlinkSync(join(ROOT, "node_modules"), nm, "junction");
const link = join(ROOT, ".vercel", "project.json");
if (existsSync(link)) { mkdirSync(join(DIR, ".vercel"), { recursive: true }); copyFileSync(link, join(DIR, ".vercel", "project.json")); }

// 发布前检查：和线上 buildCommand 同一条
const build = spawnSync("npm", ["run", "build:web"], { cwd: DIR, stdio: "inherit", shell: true });
if (build.status !== 0) { console.error("\n  build:web 没过，不上传。"); process.exit(1); }
console.log(`\n  快照 ${commit.slice(0, 7)} 的 build:web 过了。`);

if (!deploy) { console.log("  没带 --deploy，停在这里。"); process.exit(0); }
// 凭证两种都认：环境变量 VERCEL_TOKEN（token 不写进脚本、不打印，交给 cmd 执行时自己展开 %VERCEL_TOKEN%），
// 或者这台机器上 `npx vercel login` 存下的登录。两样都没有，CLI 自己会报 login_required
const tokenArgs = process.env.VERCEL_TOKEN ? ["--token", "%VERCEL_TOKEN%"] : [];
if (!tokenArgs.length) console.log("  没有 VERCEL_TOKEN，用 CLI 存的登录（没登录会报 login_required：setx VERCEL_TOKEN … 或 npx vercel login）");
const up = spawnSync("npx", ["vercel", "--prod", "--yes", ...tokenArgs], { cwd: DIR, stdio: "inherit", shell: true, env: process.env });
process.exit(up.status ?? 1);
