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
import { BACKDROPS, VISTAS } from "../src/scene/backdrops.ts";
import { CGS } from "../src/scene/cgs.ts";
import { DATA, loadDir } from "./load.ts";
import { ENDING_DRESSINGS } from "../src/engine/story.ts";

const pub = join(ROOT, "public");
const list = (dir: string): string[] =>
  existsSync(join(pub, dir)) ? readdirSync(join(pub, dir)).filter((f) => f.endsWith(".webp")).map((f) => f.slice(0, -5)).sort() : [];

/** 读 webp 的宽高，只看文件头，不引依赖。认不出就是 null */
function webpSize(file: string): { w: number; h: number } | null {
  const b = readFileSync(file);
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (chunk === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

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
{
  const vk = Object.keys(VISTAS);
  const haveV = vk.filter((k) => scenes.has(k));
  console.log(`  章首风景 ${haveV.length}/${vk.length} 张有图${haveV.length < vk.length ? `（没有图的章，题记照旧纸色底：${vk.filter((k) => !scenes.has(k)).join("、")}）` : ""}`);
}

// ---------------------------------------------------------------- 事件图（B23、D-152）
// 和背景那次同一个理由：剧本里写了图名而图不在，是合法状态（那一格跳过），永远不会自己报错。
// 而 CG 比背景更容易漏——它不是每场都有，少一张没人会立刻发现。所以每次发布前把「剧本写到了、图还没有」的逐条念出来
{
  const cgFiles = new Set(list("cg"));
  const cgKeys = Object.keys(CGS);
  const haveCg = cgKeys.filter((k) => cgFiles.has(k));
  console.log(`  事件图 ${haveCg.length}/${cgKeys.length} 张有图${haveCg.length ? "：" + haveCg.join("、") : ""}`);

  // 剧本里真的写到的事件图
  const used = new Map<string, string[]>();
  for (const { raw } of loadDir(join(DATA, "chapters"))) {
    const s = raw as { id: string; lines: { who: string; text: string }[] };
    for (const l of s.lines) if (l.who === "cg") used.set(l.text, [...(used.get(l.text) ?? []), s.id]);
  }
  const usedMissing = [...used].filter(([k]) => !cgFiles.has(k));
  if (used.size) console.log(`    剧本写到 ${used.size} 张`);
  for (const [k, where] of usedMissing) console.log(`    剧本写到了、图还没有（那一格会跳过）：${k}（${where.join("、")}）`);
  const notInScript = haveCg.filter((k) => !used.has(k) && !CGS[k]!.ending);
  if (notInScript.length) console.log(`    有图、剧本还没写到：${notInScript.join("、")}`);

  // 结局图（D-160，B27）：表要装得下每一个结局；印只在无字之碑，而且有图就得写位置
  const endings = (JSON.parse(readFileSync(join(DATA, "endings.json"), "utf8")) as { key: string; title: string }[]);
  const endingRows = cgKeys.filter((k) => CGS[k]!.ending);
  const haveEnding = endingRows.filter((k) => cgFiles.has(k));
  console.log(`    结局图 ${haveEnding.length}/${endings.length} 张有图${haveEnding.length < endings.length ? "（没有图的结局，第一拍照旧只有色板）" : ""}`);
  for (const e of endings) {
    const rows = endingRows.filter((k) => CGS[k]!.ending === e.key);
    if (!rows.length) fail(`结局「${e.title}」（${e.key}）在 src/scene/cgs.ts 里没有结局图那一行。出了图也铺不上（D-160）`);
    if (rows.length > 1) fail(`结局「${e.title}」在 cgs.ts 里有 ${rows.length} 行：${rows.join("、")}。第一拍只铺一张`);
  }
  for (const k of endingRows) {
    const e = CGS[k]!.ending!;
    if (!endings.some((x) => x.key === e)) fail(`cgs.ts 的 ${k} 写的结局 ${e} 不在 endings.json 里`);
    const sealed = ENDING_DRESSINGS[e] === "yin";
    if (CGS[k]!.seal && !sealed) fail(`${k} 写了 seal，但印只在「无字之碑」（D-067）`);
    if (sealed && cgFiles.has(k) && !CGS[k]!.seal) fail(`${k} 有图了，cgs.ts 里没写 seal（印的中心，占宽高百分比）。没写就不盖印，无字之碑会少那一枚印（D-067）`);
  }
  for (const k of cgKeys) {
    if (!CGS[k]!.ending && CGS[k]!.seal) fail(`${k} 不是结局图，写了 seal。印只在无字之碑那张结局图上`);
  }

  // 横图必须有焦点（D-150）：横构图在手机上要裁，不写焦点就是居中裁，双人图可能裁掉一个人
  for (const k of haveCg) {
    const size = webpSize(join(pub, "cg", `${k}.webp`));
    if (size && size.w > size.h && !CGS[k]?.focus) {
      fail(`事件图 ${k} 是横构图（${size.w}×${size.h}），src/scene/cgs.ts 里没写 focus。手机上会居中裁，要紧的动作可能被裁掉（D-150）`);
    }
  }
}

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
// 配乐、音效（B37，D-202）和图同一条规矩：上线的文件要进版本库，版本库里有的磁盘上不许没了
const AUDIO_DIRS = ["bgm", "sfx"];
// D-204：线上构建目录（Vercel 的 /vercel/path0）没有 .git，git 也可能不在。那里的文件本来就是从这台机器传上去的，
// 这条检查在那儿是空话——跳过、说一句，其余照跑。build:web 链上调外部命令的地方都照这个办法退化，不许失败
let tracked: Set<string> | null = null;
try {
  tracked = new Set(
    execFileSync("git", ["ls-files", "public"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .split("\n").map((s) => s.trim())
      .filter((s) => s.endsWith(".webp") || AUDIO_DIRS.some((d) => s.startsWith(`public/${d}/`) && s.endsWith(".m4a"))),
  );
} catch {
  console.log("  不是版本库，跳过 D-130 版本库检查");
}
const onDisk = new Set<string>();
for (const dir of ["char/full", "char/knee", "scene", "cg"]) {
  for (const f of list(dir)) onDisk.add(`public/${dir}/${f}.webp`);
}
for (const dir of AUDIO_DIRS) {
  if (!existsSync(join(pub, dir))) continue;
  for (const f of readdirSync(join(pub, dir)).filter((x) => x.endsWith(".m4a"))) onDisk.add(`public/${dir}/${f}`);
}

// 音效账本（D-198、D-202）：许可一栏还写着「待补」的念出来，不拦——许可是人确认的事，工具只提醒
{
  const ledger = join(ROOT, "docs", "sfx-ledger.md");
  if (existsSync(ledger)) {
    const rows = readFileSync(ledger, "utf8").split("\n").filter((l) => /^\| `[a-z_]+` \|/.test(l));
    const nameOf = (l: string) => /`([a-z_]+)`/.exec(l)![1]!;
    const owed = rows.filter((l) => (l.split("|")[4] ?? "").includes("待")).map(nameOf);
    const sfxOnDisk = existsSync(join(pub, "sfx")) ? readdirSync(join(pub, "sfx")).filter((x) => x.endsWith(".m4a")).map((x) => x.slice(0, -4)) : [];
    const listed = new Set(rows.map(nameOf));
    console.log(`  音效 ${sfxOnDisk.length} 条上线${owed.length ? `；账本许可待补：${owed.join("、")}` : "，账本里许可都填了"}`);
    for (const n of sfxOnDisk) if (!listed.has(n)) console.log(`    public/sfx/${n}.m4a 不在 docs/sfx-ledger.md 里：来源、许可没记`);
  }
}
if (tracked) {
  for (const f of onDisk) if (!tracked.has(f)) fail(`${f} 已入表但没进版本库（D-130）。验收过的图、上线的配乐和音效都要提交，否则换台机器、或者误删一次就没了`);
  for (const f of tracked) if (!onDisk.has(f)) fail(`${f} 在版本库里，磁盘上没了。是不是连目录一起删了（public/scene 出过一次）`);
}

console.log(bad ? `\n  ${bad} 项不合格。\n`
  : tracked ? `  已入表的 ${onDisk.size} 个文件（图、配乐、音效）都在版本库里。\n`
  : `  已入表的 ${onDisk.size} 个文件（图、配乐、音效）在磁盘上；版本库那一条跳过了。\n`);
process.exit(bad ? 1 : 0);
