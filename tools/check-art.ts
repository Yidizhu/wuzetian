/**
 * 美术覆盖体检（D-133、D-130，B21）。跑在发布前检查里：
 *
 *   node --experimental-strip-types tools/check-art.ts
 *
 * 查三件，前两件只念不拦，第三件报错：
 *
 * 1. **还有哪一条背景没有图、哪一套立绘还是 SVG。** 「没有图」是合法状态，所以它永远不会自己报错，
 *    只能靠每次发布前数一遍念出来——不念，二十九张铺到一半就没人知道还差几张。
 * 2. **借图的那几条**（backdrops.ts 的 `from`）单独列：它们不用自己的图，别被当成缺口。
 * 3. **已入表的图必须在版本库里（D-130）。** `public/scene/` 被整个删过一次，而那时：
 *    目录不在版本库，`git status` 看不出；校验器看到「没有图」，那是合法状态。
 *    所以这里把两头都查死：磁盘上有、git 里没有（漏提交）报错；git 里有、磁盘上没了（被删）也报错。
 *    **「少了一张图」必须是一个能被看见的事件。**
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./load.ts";
import { PORTRAITS } from "../src/char/portraits.ts";
import { BACKDROPS } from "../src/scene/backdrops.ts";

const pub = join(ROOT, "public");
const list = (dir: string): string[] =>
  existsSync(join(pub, dir)) ? readdirSync(join(pub, dir)).filter((f) => f.endsWith(".webp")).map((f) => f.slice(0, -5)).sort() : [];

const full = new Set(list("char/full"));
const scenes = new Set(list("scene"));

let bad = 0;
const fail = (msg: string): void => { bad += 1; console.error(`  ✗ ${msg}`); };

console.log("\n美术覆盖：");

// ---------------------------------------------------------------- 立绘
const havePortraits = PORTRAITS.filter((p) => full.has(p.file));
const missPortraits = PORTRAITS.filter((p) => !full.has(p.file));
console.log(`  立绘 ${havePortraits.length}/${PORTRAITS.length} 套是光栅图${havePortraits.length ? "：" + havePortraits.map((p) => p.file).join("、") : ""}`);
if (missPortraits.length) console.log(`    还是 SVG：${missPortraits.map((p) => p.file).join("、")}`);

// ---------------------------------------------------------------- 背景
const keys = Object.keys(BACKDROPS);
const own = keys.filter((k) => scenes.has(k));
const borrowed = keys.filter((k) => !scenes.has(k) && BACKDROPS[k]!.from && scenes.has(BACKDROPS[k]!.from!));
const missing = keys.filter((k) => !scenes.has(k) && !(BACKDROPS[k]!.from && scenes.has(BACKDROPS[k]!.from!)));
console.log(`  背景 ${own.length + borrowed.length}/${keys.length} 条有图（自己的 ${own.length} 条，借图的 ${borrowed.length} 条）`);
if (borrowed.length) console.log(`    借图：${borrowed.map((k) => `${k} ← ${BACKDROPS[k]!.from}`).join("、")}`);
if (missing.length) console.log(`    还没有图，走渐变：${missing.join("、")}`);

// 借了一张不存在的图：这一条永远轮不到，而它看起来已经安排好了
for (const k of keys) {
  const from = BACKDROPS[k]!.from;
  if (from && !BACKDROPS[from]) fail(`${k} 借的 ${from} 不在背景表里`);
  if (from && k === from) fail(`${k} 借自己`);
}

// ---------------------------------------------------------------- 表与样式对得上（B22）
// E17 CC3 写了 `data-tone="to-ink"` 的选择器，B21 我挂的属性值是 `"ink"`：那段样式从没命中过，
// 没有任何东西报错，玩家看到的一直是占位数（E18 才发现）。**交出去的属性值和对方的选择器，两头必须对得上。**
// 这里不管滤镜长什么样，只管「表里用到的每个值，样式里有没有接住它的选择器」——接不住就是一条死字段
{
  const css = readFileSync(join(ROOT, "src", "styles", "raster.css"), "utf8");
  const tones = new Set(keys.map((k) => BACKDROPS[k]!.tone).filter(Boolean) as string[]);
  for (const t of tones) {
    if (!css.includes(`[data-tone="${t}"]`)) fail(`背景表用了 tone: "${t}"，raster.css 里没有 [data-tone="${t}"] 的选择器，这个滤镜永远不会生效`);
  }
  if (keys.some((k) => BACKDROPS[k]!.paintedNight) && !css.includes(`[data-painted="night"]`)) {
    fail(`背景表用了 paintedNight，raster.css 里没有 [data-painted="night"] 的选择器，真夜景会被再压一层夜`);
  }
}

// ---------------------------------------------------------------- 图与版本库
const tracked = new Set(
  execFileSync("git", ["ls-files", "public"], { cwd: ROOT, encoding: "utf8" })
    .split("\n").map((s) => s.trim()).filter((s) => s.endsWith(".webp")),
);
const onDisk = new Set<string>();
for (const dir of ["char/full", "char/knee", "scene"]) {
  for (const f of list(dir)) onDisk.add(`public/${dir}/${f}.webp`);
}
for (const f of onDisk) if (!tracked.has(f)) fail(`${f} 已入表但没进版本库（D-130）。验收过的 webp 要提交，否则换台机器、或者误删一次就没了`);
for (const f of tracked) if (!onDisk.has(f)) fail(`${f} 在版本库里，磁盘上没了。是不是连目录一起删了（public/scene 出过一次）`);

console.log(bad ? `\n  ${bad} 项不合格。\n` : `  已入表的 ${onDisk.size} 张图都在版本库里。\n`);
process.exit(bad ? 1 : 0);
