/**
 * 剧情数据校验。检查清单见 docs/story-schema.md 第四部分。
 *
 *   node --experimental-strip-types tools/validate-story.ts
 *   node --experimental-strip-types tools/validate-story.ts tools/fixtures/broken
 *
 * 前四类是硬错误，不通过就不该进构建；后面是警告，要人看一眼。
 * 硬错误退出码 1，只有警告退出码 0。
 */
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { z } from "zod";
import { DATA, ROOT, loadDir, loadFile } from "./load.ts";
import { Scene, PoemDuel, Poem, Letter, Ending, CHARACTER_KEYS, NAME_FLAGS, FLAG_CONFLICTS, FLAG_REQUIRES } from "../src/engine/schema.ts";
import type { SceneT, PoemT, PoemDuelT, LetterT, EndingT } from "../src/engine/schema.ts";
import { ENTRANCES } from "../src/engine/entrances.ts";
import { AFFINITY_BANDS } from "../src/engine/types.ts";
import { IDENTITY_RANKS } from "../src/engine/identity.ts";
import { PORTRAITS } from "../src/char/portraits.ts";
import { BACKDROPS, backdropKey } from "../src/scene/backdrops.ts";
import { CGS } from "../src/scene/cgs.ts";
import { readdirSync } from "node:fs";

/**
 * 开场。M1 那四场骨架（ch00_*）是我写的占位文字，不是剧本，已退到
 * tools/fixtures/skeleton/。正式开场就是第一章第一场：她站在昭阳殿外。
 */
const START = "ch01_s00_zhaoyang";

type Level = "错误" | "警告";
interface Finding { level: Level; file: string; where: string; msg: string }
const found: Finding[] = [];
const err = (file: string, where: string, msg: string) =>
  found.push({ level: "错误", file, where, msg });
const warn = (file: string, where: string, msg: string) =>
  found.push({ level: "警告", file, where, msg });

/** zod 的 issue 路径转成人能读的位置，比如 lines[2].text */
function at(issue: z.ZodIssue): string {
  if (!issue.path.length) return "整份文件";
  return issue.path.reduce<string>((s, seg) =>
    typeof seg === "number" ? `${s}[${seg}]` : (s ? `${s}.${seg}` : String(seg)), "");
}

function checkShape<T>(schema: z.ZodType<T>, file: string, raw: unknown): T | null {
  const r = schema.safeParse(raw);
  if (r.success) return r.data;
  for (const issue of r.error.issues) err(file, at(issue), issue.message);
  return null;
}

// ---------------------------------------------------------------- 读

const dir = process.argv[2] ? join(ROOT, process.argv[2]) : join(DATA, "chapters");
const sceneFiles = loadDir(dir);
const scenes = new Map<string, { file: string; s: SceneT }>();
const mainRun = !process.argv[2];

/**
 * 先把所有 id 收齐，再逐个校验形状。
 * 顺序反过来的话，一份文件形状不合法就会被踢出集合，指向它的场景全都报
 * 「去向不存在」——一个真错误炸出一串假错误，人就不看报告了。
 */
const declaredIds = new Set<string>();
/** 从原始 JSON 里抠出去向，不管这份文件形状合不合法 */
const rawExits: { file: string; id: string; to: string; soft?: boolean }[] = [];
/** 对诗出口（D-026）：场景 -> 对局，胜负的 goto 稍后补进 rawExits */
const rawDuelRefs: { file: string; id: string; duel: string }[] = [];

for (const { file, raw } of sceneFiles) {
  const o = raw as Record<string, unknown>;
  const id = o?.id;
  if (typeof id !== "string" || !id) { err(file, "id", "缺少 id，或者 id 不是字符串"); continue; }
  if (declaredIds.has(id)) err(file, "id", `场景 id 撞车：${id} 在别处已经用过`);
  declaredIds.add(id);
  // 章末场的 goto 指向下一章第一场，那一章可能还没写（D-034）。
  // 引擎对这种情况有正经的收尾（结算页 + 下章待续），所以它是警告不是硬错误。
  if (typeof o.goto === "string") rawExits.push({ file, id, to: o.goto, soft: o.chapterEnd === true });
  if (typeof o.duel === "string") rawDuelRefs.push({ file, id, duel: o.duel });
  if (Array.isArray(o.choices)) {
    for (const c of o.choices as Record<string, unknown>[]) {
      if (typeof c?.goto === "string" && c.goto) rawExits.push({ file, id, to: c.goto });
      // 选项去向写「章末」而这一场没标章末（D-043）：转换器会把去向留空，
      // 于是这个选项既没有去处、也走不到结算页，玩家点下去什么都不会发生。
      else if (o.chapterEnd !== true) {
        err(file, `${String(c?.id ?? "?")}.goto`, "选项没有去向。只有标了「章末 | 是」的场景，选项才可以空着去向（走章末结算页）");
      }
    }
  }
}

for (const { file, raw } of sceneFiles) {
  const s = checkShape(Scene, file, raw);
  if (!s) continue;
  if (!scenes.has(s.id)) scenes.set(s.id, { file, s });
}

// 诗词与对诗只在跑主数据时检查，跑 fixture 目录时跳过
const poems = new Map<string, PoemT>();
const duels: PoemDuelT[] = [];
const letters: LetterT[] = [];
const endings: EndingT[] = [];

if (mainRun) {
  const pf = loadFile(join(DATA, "poems.json"));
  for (const [i, raw] of (pf.raw as unknown[]).entries()) {
    const p = checkShape(Poem, `${pf.file}[${i}]`, raw);
    if (p) {
      if (poems.has(p.id)) err(pf.file, `[${i}].id`, `诗 id 撞车：${p.id}`);
      poems.set(p.id, p);
    }
  }
  const ef = loadFile(join(DATA, "endings.json"));
  for (const [i, raw] of (ef.raw as unknown[]).entries()) {
    const e = checkShape(Ending, `${ef.file}[${i}]`, raw);
    if (e) endings.push(e);
  }
  const df = loadFile(join(DATA, "duels.json"));
  for (const [i, raw] of (df.raw as unknown[]).entries()) {
    const d = checkShape(PoemDuel, `${df.file}[${i}]`, raw);
    if (d) duels.push(d);
  }
  try {
    for (const { file, raw } of loadDir(join(DATA, "letters"))) {
      const l = checkShape(Letter, file, raw);
      if (l) letters.push(l);
    }
  } catch { /* letters/ 还不存在，M4 才有 */ }
}

// ------------------------------------------------- 硬错误 2、3：死路与孤儿

const exits = (s: SceneT): string[] => [
  ...(s.choices ?? []).map((c) => c.goto),
  ...(s.goto ? [s.goto] : []),
];

// 对诗出口：胜负各自的 goto 也是去向。只有对诗这一个出口时，两条都得有
if (mainRun) {
  for (const { file, id, duel } of rawDuelRefs) {
    const d = duels.find((x) => x.id === duel);
    if (!d) continue;   // 对局不存在另有报错
    const raw = sceneFiles.find((f) => (f.raw as { id?: string })?.id === id)?.raw as Record<string, unknown> | undefined;
    const otherExit = !!(raw && ((raw.choices as unknown[])?.length || raw.goto || raw.ending || raw.judgeEnding || raw.chapterEnd));
    for (const [k, o] of [["onWin", d.onWin], ["onLose", d.onLose]] as const) {
      if (o?.goto) rawExits.push({ file, id, to: o.goto });
      else if (!otherExit) err(file, "duel", `对诗 ${duel} 是这一场唯一的出口，但 ${k} 没有 goto。赢或输之后玩家会卡住`);
    }
  }
}

// 用 rawExits 查死链，这样一份文件的形状错误不会顺带藏起它的断链
for (const { file, to, soft } of rawExits) {
  if (declaredIds.has(to)) continue;
  if (soft) warn(file, "goto", `下一章 ${to} 还没有数据。玩家会停在章末结算页看到「下章待续」——这一版发出去就是这样`);
  else err(file, "goto", `去向 ${to} 不存在。玩家走到这里会掉出世界`);
}

// 跑 fixture 目录时没有正式开场，用排序最前的 id 顶上，并说明一声
let start = START;
if (!declaredIds.has(START)) {
  if (mainRun) {
    err("(整体)", "start", `开场场景 ${START} 不存在`);
    start = "";
  } else {
    start = [...declaredIds].sort()[0] ?? "";
    if (start) console.log(`  （这份目录里没有正式开场，可达性以 ${start} 为起点）`);
  }
}

if (start) {
  const seen = new Set<string>([start]);
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const { id, to } of rawExits) {
      if (id === cur && declaredIds.has(to) && !seen.has(to)) { seen.add(to); queue.push(to); }
    }
  }
  for (const id of declaredIds) {
    if (seen.has(id)) continue;
    const file = sceneFiles.find((f) => (f.raw as { id?: string })?.id === id)?.file ?? "(未知文件)";
    err(file, "id", `孤儿场景：从 ${start} 出发走不到 ${id}`);
  }
}

// --------------------------------------------------------------- 警告

const byAct = new Map<number, SceneT[]>();
for (const { s } of scenes.values()) {
  if (!byAct.has(s.act)) byAct.set(s.act, []);
  byAct.get(s.act)!.push(s);
}
for (const [act, list] of [...byAct].sort((a, b) => a[0] - b[0])) {
  if (!list.some((s) => s.weightless)) {
    warn("(整体)", `第 ${act} 幕`, "没有一个 weightless 场景。tone-bible 六问第 3 问要求每一幕至少有一场不加数值、不推剧情、只是两个女人在一起");
  }
}

// 每一章的开头要有题记（D-048、D-063）：序幕三句、第二三章开头的短序都走题记那张纸。
// 说话人写成了旁白，句子照样出现在对话框里，引擎挑不出毛病——只有这里看得出来
{
  const byChapter = new Map<number, SceneT[]>();
  for (const { s } of scenes.values()) byChapter.set(s.chapter, [...(byChapter.get(s.chapter) ?? []), s]);
  for (const [ch, list] of [...byChapter].sort((a, b) => a[0] - b[0])) {
    const head = [...list].sort((a, b) => a.id.localeCompare(b.id))[0]!;
    if (!head.lines.some((l) => l.who === "tiji")) {
      warn(scenes.get(head.id)!.file, "lines", `第 ${ch} 章开头这一场没有题记。开头那几句要是写成了「旁白」，会进对话框，不会走题记那张纸`);
    }
  }
}

// 好感门槛只许是档位下限（D-065）。门槛写在剧本 markdown 里，改了数据不改原文，
// 下一次转换就悄悄变回 10 和 16——这一条让它变回去的那一刻就响
// 从引擎的档位表取，不再抄一份：D-078 改识档时，这里写死的 5 就是这样慢了一拍的
const BAND_FLOORS = new Set<number>(AFFINITY_BANDS.map((b) => b.min));
const KNOWN_FLOOR = AFFINITY_BANDS.find((b) => b.label === "识")!.min;

// 终局判定（B14）。结局表里有结局、全库却没有一场 judgeEnding，玩家走到底只看得到「下章待续」，
// 八张结局卡一张都出不来——而每一场单看都合法。原文里 ch04-18 写的是「章末」，
// 正式数据是 CC1 手改的；原文不改，下一次转换就会变回去，所以这里是错误，拦住发布
{
  const endingsFile = join(DATA, "endings.json");
  const hasEndings = existsSync(endingsFile) && (JSON.parse(readFileSync(endingsFile, "utf8")) as unknown[]).length > 0;
  const finales = [...scenes.values()].filter(({ s }) => s.judgeEnding);
  if (hasEndings && [...scenes.values()].some(({ s }) => s.chapter === 4) && !finales.length) {
    err("src/data/chapters", "judgeEnding", "结局表里有结局，第四章也在，却没有一场做终局判定。全书最后一场（ch04-18）要写「终局判定 | 是」，不是「章末 | 是」");
  }
  if (finales.length > 1) {
    err(finales[1]!.file, "judgeEnding", `终局判定全游戏只能有一处（story-schema 1.2），现在有 ${finales.length} 处：${finales.map((f) => f.s.id).join("、")}`);
  }
}

// 主角身份（D-091）：身份表里的 flag 必须有选项写它为真。拼错一个字，她在那条线上永远升不上去，
// 而每一场单看都合法、烟测也全绿——所以是错误不是警告（R-019）
{
  const writtenTrue = new Set<string>();
  for (const { s } of scenes.values()) {
    for (const c of s.choices ?? []) {
      for (const [k, v] of Object.entries(c.effects ?? {})) if (k.startsWith("flag.") && v === true) writtenTrue.add(k.slice(5));
    }
  }
  for (const r of IDENTITY_RANKS) {
    for (const f of r.flags) {
      if (!writtenTrue.has(f)) err("src/engine/identity.ts", r.rank, `身份「${r.rank}」要的 flag.${f} 没有任何选项写它为真。主角永远穿不上这一套`);
    }
  }
}

// 人上台的那一句（D-076，engine/entrances.ts）。剧本改了句序、id 对不上，引擎会悄悄退回「一开场人就在」，
// 序幕那一次变化就没了而画面毫无异样——所以这里是错误不是警告
for (const [sid, lid] of Object.entries(ENTRANCES)) {
  const s = scenes.get(sid)?.s;
  if (!s) { err("src/engine/entrances.ts", sid, "人上台表里写的这一场不存在"); continue; }
  const at = s.lines.findIndex((l) => l.id === lid);
  if (at < 0) { err("src/engine/entrances.ts", sid, `人上台的那一句 ${lid} 在这一场里找不到了。剧本改过句序的话，照 D-076 重新挑一句（有人叫她名字的那一句）`); continue; }
  if (s.lines[at]!.who === "tiji") err("src/engine/entrances.ts", sid, `人上台的那一句 ${lid} 是题记。题记那张纸上不该有人`);
}
const checkGates = (file: string, where: string, req: Record<string, unknown> | undefined) => {
  for (const [k, v] of Object.entries(req ?? {})) {
    const gte = k.startsWith("affinity.") ? (v as { gte?: number }).gte : undefined;
    if (gte !== undefined && !BAND_FLOORS.has(gte)) {
      warn(file, where, `好感门槛写的是 ${gte}，不是档位下限（识 4／契 8／盟 14）。D-065、D-078 之后三档的门是 4、8、14——要是转换把 5、10、16 转回来了，原文里还没改`);
    }
  }
};
for (const { file, s } of scenes.values()) {
  checkGates(file, "require", s.require);
  for (const c of s.choices ?? []) checkGates(file, `${c.id}.require`, c.require);
  // 一处题记三句以内（剧本结构指南七点五节，D-063）。版式也只给三列留了位，多的会挤到左半边
  let run = 0;
  for (const l of [...s.lines, { who: "" }]) {
    if (l.who === "tiji") { run += 1; continue; }
    if (run > 3) warn(file, "lines", `一处题记连着 ${run} 句。三句写不完说明还没想清楚，版式也只留了三列`);
    run = 0;
  }
  for (const c of s.choices ?? []) {
    for (const [k, v] of Object.entries(c.effects ?? {})) {
      if (typeof v === "number" && Math.abs(v) > 4) {
        warn(file, `${c.id}.effects.${k}`, `一次改动 ${v} 点，超过 4。数值跳太大玩家会去猜阈值，而不是去想她是谁`);
      }
    }
    if (c.require && !c.lockHint) {
      warn(file, c.id, "有条件但没写 lockHint。引擎会自动生成一句原因，但剧本自己写的更准");
    }
  }
  if (s.palette === "gold") {
    const reds = (s.choices ?? []).filter((c) => c.irreversible);
    if (!reds.length && (s.choices?.length ?? 0) > 0) {
      warn(file, "palette", "金碧场景里没有任何 irreversible 选项，整屏不会出现朱砂。这不算错，但朝廷戏里那一点红是她自己拿主意的唯一标记");
    }
  }
  for (const who of s.leavesLetter) {
    if (mainRun && !letters.some((l) => l.trigger.kind === "scene" && l.trigger.sceneId === s.id && l.from === who)) {
      err(file, "leavesLetter", `留了 ${who} 的信，但 src/data/letters/ 里没有一封 from=${who} 且触发于本场的信`);
    }
  }
}

// ------------------------------------------------------------- 登场卡（D-048）

if (mainRun) {
  const introFile = join(DATA, "intros.json");
  if (existsSync(introFile)) {
    const intro = JSON.parse(readFileSync(introFile, "utf8")) as { cards?: Record<string, { role?: string; line?: string }> };
    const cards = intro.cards ?? {};
    for (const [key, c] of Object.entries(cards)) {
      if (!(CHARACTER_KEYS as readonly string[]).includes(key)) {
        err("src/data/intros.json", key, `不是冻结的角色 key。登场卡永远不会出现`);
      }
      // D-094：信条不许上 UI。转换或手抄把那一列捡回来，这里当场拦
      if ("line" in c) err("src/data/intros.json", `${key}.line`, "登场卡不许有 line（D-094）。那句话是人物的信条，该由玩家看她做了什么自己得出，只留 name 和 role");
      if (!c.role) err("src/data/intros.json", `${key}.role`, "登场卡没有职务。卡会出一个只有名字的空壳");
      else if ([...c.role].length > 12) warn("src/data/intros.json", `${key}.role`, `职务 ${[...c.role].length} 字。竖屏上名字那一行放不下，会折行压到立绘的脚`);
    }
    // 卡本身不删（D-094 第 4 条）：剧本里开口的每一个角色都要有卡
    const speakers = new Set<string>();
    for (const { s } of scenes.values()) for (const l of s.lines) if ((CHARACTER_KEYS as readonly string[]).includes(l.who)) speakers.add(l.who);
    for (const who of speakers) {
      if (!cards[who]) err("src/data/intros.json", who, "这个人在剧本里开口了，却没有登场卡");
    }
  }
}

// ------------------------------------------------------------- 结局表

if (mainRun && endings.length) {
  const last = endings[endings.length - 1]!;
  if (last.require && Object.keys(last.require).length) {
    err("src/data/endings.json", `${last.key}.require`, "最后一个结局的判定必须留空，作为兜底。否则数值走到某些组合时玩家会看不到任何结局");
  }
  for (const [i, e] of endings.entries()) {
    if (i < endings.length - 1 && (!e.require || !Object.keys(e.require).length)) {
      err("src/data/endings.json", `${e.key}.require`, "判定为空的结局会吃掉它后面所有的结局。兜底只能有一个，且必须排在最后");
    }
    // D-020 的强制：改名三选不许当门槛。schema 已拦一层，这里再报得具体些
    for (const f of NAME_FLAGS) {
      if (e.require && f in e.require) {
        err("src/data/endings.json", `${e.key}.require.${f}`, "D-020：改名三选无优劣，不得作为结局门槛。要区分就写 body 的三段变体");
      }
    }
    const enthroned = e.require?.["flag.enthroned"] === true;
    if (typeof e.body !== "string" && !enthroned) {
      err("src/data/endings.json", `${e.key}.body`, "写了三段变体，但这个结局不要求 flag.enthroned。改名只发生在登基线上，非登基结局拿不到 name_* ，读不到变体");
    }
    if (typeof e.body === "string" && enthroned) {
      warn("src/data/endings.json", `${e.key}.body`, "登基结局只有一段正文。登基后的名字是玩家亲手选的，结局卡最好对此有反应（R-003 第 2 条）");
    }
  }
  const judge = [...scenes.values()].filter((x) => x.s.judgeEnding);
  if (judge.length > 1) {
    warn("(整体)", "judgeEnding", `有 ${judge.length} 个场景在判结局：${judge.map((x) => x.s.id).join("、")}。C-B 约定终局快照只取一次`);
  }
}

// --------------------------------------------------- flag 互斥与前置

if (mainRun) {
  const setsTrue = new Map<string, string[]>();   // flag -> 哪些选项把它置真
  for (const { s } of scenes.values()) {
    for (const c of s.choices ?? []) {
      for (const [k, v] of Object.entries(c.effects ?? {})) {
        if (v !== true || !k.startsWith("flag.")) continue;
        const name = k.slice(5);
        if (!setsTrue.has(name)) setsTrue.set(name, []);
        setsTrue.get(name)!.push(`${s.id}/${c.id}`);
      }
    }
  }
  for (const [a, b] of FLAG_CONFLICTS) {
    const pa = setsTrue.get(a), pb = setsTrue.get(b);
    if (!pa || !pb) continue;
    const both = pa.filter((x) => pb.includes(x));
    if (both.length) {
      err("(整体)", "flag", `同一个选项 ${both.join("、")} 同时置真 flag.${a} 和 flag.${b}，这两个互斥（C-B 第四节）`);
    }
  }
  for (const [name, need] of Object.entries(FLAG_REQUIRES)) {
    if (setsTrue.has(name) && !setsTrue.has(need)) {
      warn("(整体)", `flag.${name}`, `有地方把它置真，但全剧本没有任何地方置真 flag.${need}。按 C-B，前者以后者为前提`);
    }
  }
}

if (mainRun) {
  for (const { file, s } of scenes.values()) {
    if (s.duel && !duels.some((d) => d.id === s.duel)) {
      err(file, "duel", `对局 ${s.duel} 不在 duels.json 里`);
    }
  }
  for (const d of duels) {
    if (!poems.has(d.poemRef)) err("src/data/duels.json", `${d.id}.poemRef`, `出句来源 ${d.poemRef} 不在诗词库里`);
    const src = poems.get(d.poemRef);
    const bare = (x: string) => x.replace(/[，。！？、；：]/g, "");
    if (src && !src.lines.map(bare).includes(bare(d.prompt))) {
      warn("src/data/duels.json", `${d.id}.prompt`, `出句「${d.prompt}」不在 ${d.poemRef} 的原文里，确认一下有没有改字`);
    }
    for (const o of d.options) {
      if (!o.correct && /意境不对|感觉不对|就是不对|说不清/.test(o.why)) {
        warn("src/data/duels.json", `${d.id}.${o.key}`, "错项理由用了「意境」这类笼统判词。题面写明了什么限制，就对着那个限制判错");
      }
    }
  }
  for (const l of letters) {
    // 「她可能不回」的意思是「还没到识档」（D-083）。识档的数一变，这个条件就得跟着变，
    // 否则已经算结识的人收不到回信，画面上没有任何东西解释为什么
    for (const [k, v] of Object.entries((l as { sheMayNotReply?: Record<string, { lt?: number }> }).sheMayNotReply ?? {})) {
      if (k.startsWith("affinity.") && v.lt !== undefined && v.lt !== KNOWN_FLOOR) {
        warn(`letters/${l.id}`, "sheMayNotReply", `「她可能不回」写的是好感 < ${v.lt}，识档下限是 ${KNOWN_FLOOR}。这个条件的意思是「还没到识档」，要跟着档位表写 < ${KNOWN_FLOOR}`);
      }
    }
    if (l.body.blank.length < 15) {
      warn(`letters/${l.id}`, "body.blank", "「她没写的」那一层少于 15 字。三层结构里这一层最容易被敷衍成一句话，而它才是这套机制的核心");
    }
    if (l.interceptAt && !scenes.has(l.interceptAt)) {
      err(`letters/${l.id}`, "interceptAt", `截获场景 ${l.interceptAt} 不存在。信永远不会被截，那一幕公议念的是一封没截到的信`);
    }
    // 「不宣读」的那一段不许出现在截获那一场的台词里（D-044）。
    // 它是整封信的戏眼：公议上被叫停，她还有一句没来得及给你。剧本要是把它念出来了，
    // 这封信就只剩一次剧情事故——而且没有任何别的检查会发现。
    if (l.interceptAt && scenes.has(l.interceptAt)) {
      const sc = scenes.get(l.interceptAt)!.s;
      const spoken = sc.lines.map((x) => x.text).join("|");
      for (const pg of l.body.pages ?? []) {
        if (pg.readAloud !== false) continue;
        const probe = pg.text.replace(/[\s「」“”，。！？、；：…—]/g, "").slice(0, 12);
        if (probe.length >= 6 && spoken.replace(/[\s「」“”，。！？、；：…—]/g, "").includes(probe)) {
          err(`letters/${l.id}`, `body.pages.${pg.key}`, `这一段标了「不宣读」，却在截获场景 ${l.interceptAt} 的台词里被念出来了`);
        }
      }
    }
    if (l.interceptable && l.onIntercept && !scenes.has(l.onIntercept.goto)) {
      err(`letters/${l.id}`, "onIntercept.goto", `被截去向 ${l.onIntercept.goto} 不存在`);
    }
  }
  const act2 = letters.filter((l) => {
    if (l.trigger.kind !== "scene") return false;
    return scenes.get(l.trigger.sceneId)?.s.act === 2;
  });
  if (act2.length && !act2.some((l) => l.interceptable)) {
    warn("(整体)", "第 2 幕", "没有一封会被截的信。tone-bible 要求关系有政治后果，被截并在朝堂上念出来是它最直接的实现");
  }
}

// ---------------------------------------------------- 光栅图的两道闸（D-095，B17）

/**
 * 新旧并存（engine-cc1-b16-png.md 第三节）。清单都从唯一的出处读，不抄（D-098）：
 * 立绘有哪些套 → src/char/portraits.ts；剧本用到哪些背景 → 场景数据；背景表 → src/scene/backdrops.ts；
 * 有哪些图 → public/ 下的文件本身。
 */
const coverage: string[] = [];
if (mainRun) {
  const pub = join(ROOT, "public");
  const webps = (dir: string): Set<string> =>
    new Set(existsSync(join(pub, dir)) ? readdirSync(join(pub, dir)).filter((f) => f.endsWith(".webp")).map((f) => f.slice(0, -5)) : []);
  const full = webps("char/full"), knee = webps("char/knee"), sceneImgs = webps("scene");
  const portraitFiles = new Set(PORTRAITS.map((p) => p.file));

  // 闸一：放进来的图必须叫得上名字、成对。叫不上名字的图引擎永远不会选到，而放图的人以为已经上线了
  for (const f of full) {
    if (!portraitFiles.has(f)) err(`public/char/full/${f}.webp`, "file", "这张立绘不在 src/char/portraits.ts 的清单里，引擎永远选不到它");
    if (!knee.has(f)) warn(`public/char/full/${f}.webp`, "knee", "只有全身、没有膝上。念台词时会用全身摆，人不会放大");
  }
  for (const f of knee) if (!full.has(f)) err(`public/char/knee/${f}.webp`, "full", "只有膝上、没有全身。引擎按全身图判断这个人有没有光栅图，这张永远用不上");
  for (const k of sceneImgs) if (!BACKDROPS[k]) err(`public/scene/${k}.webp`, "file", "这张背景不在 src/scene/backdrops.ts 的表里，引擎永远选不到它");

  // 事件图（B23）：剧本里写的 key 表里要有；public/cg 里的文件要叫得上名字
  for (const k of webps("cg")) if (!CGS[k]) err(`public/cg/${k}.webp`, "file", "这张事件图不在 src/scene/cgs.ts 的表里，剧本里写不到它");
  for (const { file, s } of scenes.values()) {
    for (const l of s.lines) {
      if (l.who !== "cg") continue;
      if (!CGS[l.text]) err(file, l.id, `事件图「${l.text}」不在 src/scene/cgs.ts 的表里。文本一栏写的是图的 key，不是描述`);
    }
  }

  // 剧本用到的每种「地点·色板·布置」，背景表都要有。没有的话那一场有图也不会被认出来，而且覆盖表会少算
  const usedBackdrops = new Set<string>();
  for (const { file, s } of scenes.values()) {
    const k = backdropKey({ key: s.scene, palette: s.palette, dressing: s.dressing });
    usedBackdrops.add(k);
    if (!BACKDROPS[k]) err(file, "scene", `背景组合 ${k} 不在 src/scene/backdrops.ts 的表里。加一行，CC3 才知道要出这张图`);
  }

  // 闸二：旧 SVG 不许在光栅图顶上之前被删——「新的没铺完、旧的已删」那道空窗（D-095）
  const charDir = join(ROOT, "src", "char");
  for (const who of CHARACTER_KEYS as readonly string[]) {
    if (full.has(`${who}_default`)) continue;         // 已经有光栅图，SVG 删不删都不影响画面
    for (const expr of ["default", "guarded", "open"]) {
      if (!existsSync(join(charDir, `${who}_${expr}.svg`))) {
        err(`src/char/${who}_${expr}.svg`, "fallback", `这张 SVG 没了，而 ${who} 还没有光栅图 public/char/full/${who}_default.webp。玩家会看到一个空位`);
      }
    }
  }

  // 覆盖表：进度一眼看得出，不靠问
  const havePortraits = PORTRAITS.filter((p) => full.has(p.file));
  // 借图的那几条也算有图（backdrops.ts 的 from，B21）。逐条的缺口清单在 npm run check:art
  const haveBackdrops = [...usedBackdrops].filter((k) => sceneImgs.has(k) || (BACKDROPS[k]?.from && sceneImgs.has(BACKDROPS[k]!.from!)));
  coverage.push(`光栅立绘 ${havePortraits.length}/${PORTRAITS.length} 套` + (havePortraits.length ? `：${havePortraits.map((p) => p.file).join("、")}` : "（其余走 SVG）"));
  coverage.push(`整图背景 ${haveBackdrops.length}/${usedBackdrops.size} 种` + (haveBackdrops.length ? `：${haveBackdrops.join("、")}` : "（其余走渐变）"));
}

// --------------------------------------------------------------- 报告

const errors = found.filter((f) => f.level === "错误");
const warns = found.filter((f) => f.level === "警告");

console.log(`\n校验 ${sceneFiles.length} 个场景文件` +
  (mainRun ? `、${poems.size} 首诗、${duels.length} 局对诗、${letters.length} 封信` : "") + "\n");

for (const f of [...errors, ...warns]) {
  const tag = f.level === "错误" ? "错误" : "警告";
  console.log(`  ${tag}  ${f.file}  ${f.where}\n        ${f.msg}`);
}

for (const c of coverage) console.log(`  ${c}`);
if (coverage.length) console.log();
if (!found.length) {
  console.log("  全部通过。");
} else {
  console.log(`\n合计 ${errors.length} 个错误，${warns.length} 个警告。`);
}
console.log();

// 角色 key 冻结提醒，方便对照 D-016
if (mainRun && !errors.length) {
  console.log(`角色 key（D-016 冻结）：${CHARACTER_KEYS.join("、")}\n`);
}

process.exit(errors.length ? 1 : 0);
