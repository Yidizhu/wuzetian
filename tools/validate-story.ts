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
import { z } from "zod";
import { DATA, ROOT, loadDir, loadFile } from "./load.ts";
import { Scene, PoemDuel, Poem, Letter, Ending, CHARACTER_KEYS, NAME_FLAGS, FLAG_CONFLICTS, FLAG_REQUIRES } from "../src/engine/schema.ts";
import type { SceneT, PoemT, PoemDuelT, LetterT, EndingT } from "../src/engine/schema.ts";

/**
 * 开场。M1 那四场骨架（ch00_*）是我写的占位文字，不是剧本，已退到
 * tools/fixtures/skeleton/。正式开场就是第一章第一场：她站在昭阳殿外。
 */
const START = "ch01_s01_zhaoyang";

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
      if (typeof c?.goto === "string") rawExits.push({ file, id, to: c.goto });
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

for (const { file, s } of scenes.values()) {
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
    if (l.body.blank.length < 15) {
      warn(`letters/${l.id}`, "body.blank", "「她没写的」那一层少于 15 字。三层结构里这一层最容易被敷衍成一句话，而它才是这套机制的核心");
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

// --------------------------------------------------------------- 报告

const errors = found.filter((f) => f.level === "错误");
const warns = found.filter((f) => f.level === "警告");

console.log(`\n校验 ${sceneFiles.length} 个场景文件` +
  (mainRun ? `、${poems.size} 首诗、${duels.length} 局对诗、${letters.length} 封信` : "") + "\n");

for (const f of [...errors, ...warns]) {
  const tag = f.level === "错误" ? "错误" : "警告";
  console.log(`  ${tag}  ${f.file}  ${f.where}\n        ${f.msg}`);
}

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
