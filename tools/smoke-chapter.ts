/**
 * 无头通关：拿真引擎把一章从头走到尾，看有没有走不动的地方。
 *
 *   node --experimental-strip-types tools/smoke-chapter.ts                 # 正式数据
 *   node --experimental-strip-types tools/smoke-chapter.ts converted       # CC2 转换产物
 *
 * 为什么要有：校验器查的是数据形状和图的连通性，查不出「玩家点到这里没反应」。
 * 这个脚本走的是 Story 本身——同一份 present/advance/choose 逻辑，
 * 所以它能抓到只有跑起来才暴露的问题：条件把一整段跳空、对诗没出口、
 * 章末结算卡住、选项全部被条件锁死。
 *
 * 遍历策略是深度优先穷举每个选项。分支多的章会走很多遍，但第一章这个量级是秒级。
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, DATA, loadDir } from "./load.ts";
import { Store } from "../src/engine/state.ts";
import { Story } from "../src/engine/story.ts";
import { meets } from "../src/engine/conditions.ts";
import type { Scene, Ending } from "../src/engine/types.ts";
import type { LetterT, PoemDuelT } from "../src/engine/schema.ts";
import { SPRITE_RULES } from "../src/char/sprite-rules.ts";
import { protagonistRank, RANK_ORDER, type Rank } from "../src/engine/identity.ts";

// ------------------------------------------------------- 浏览器那点东西的替身
// Story 只碰 document.documentElement.dataset.palette 和 localStorage，各给一个假的
const g = globalThis as unknown as Record<string, unknown>;
g.document ??= { documentElement: { dataset: {} } };
const mem = new Map<string, string>();
g.localStorage ??= {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
};

// ------------------------------------------------------------------ 读数据

const which = process.argv[2] === "converted" ? "converted" : "official";
const base = which === "converted" ? join(DATA, "converted") : DATA;
const readJson = <T>(p: string, fallback: T): T =>
  existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as T) : fallback;

const scenes = loadDir(join(base, "chapters")).map((x) => x.raw as Scene);
const duels = readJson<PoemDuelT[]>(join(base, "duels.json"), []);
const endings = readJson<Ending[]>(join(base, "endings.json"), []);
let letters: LetterT[] = [];
try { letters = loadDir(join(base, "letters")).map((x) => x.raw as LetterT); } catch { /* 还没有信 */ }

if (!scenes.length) {
  console.error(`${base} 下没有场景。`);
  process.exit(1);
}
const START = which === "converted"
  ? [...scenes].sort((a, b) => a.id.localeCompare(b.id))[0]!.id
  : "ch01_s00_zhaoyang";

/** 让出几轮微任务，够 enter() 里那几个 await 走完 */
async function drain(): Promise<void> {
  for (let i = 0; i < 8; i++) await Promise.resolve();
}

// --------------------------------------------------------------- 走一条路径

interface Stuck { scene: string; line: number; why: string }

/**
 * 不变式（B11 第 3 步）。卡死之外，还有三件事「走得通」证明不了：
 *
 * 1. 章末结算页真的出了——尤其是章末场带选项、选项去向空着的那种（D-043，ch02-24）。
 *    漏了它玩家照样能走进下一章，只是这一章做完了什么，谁也没告诉她。
 * 2. 固定截获点真的截了（D-039，ch02-11）。没截的话那封信还躺在案上，
 *    朝堂上却在念它——剧情和信箱各说各的。
 * 3. 换图规则的 flag 真的会被写真，而且换过去的那几张图真的存在（D-046，ch03-15）。
 *    表里写了、图也画了，可剧本出口忘了写 flag，柳承欢腕上那点红就永远不会褪。
 * 5. 主角的身份只升不降，落选线一路青到结局（D-091）。袍色跟 flag 走，
 *    一个 flag 写反、写漏，她就会在某条线上半路换回青、或者没受位先穿绯，而每一场单看都合法。
 * 4. 全书有终局判定的时候，每一条走完的路都落在一张结局卡上（B14，第四章接入）。
 *    停在「下章待续」在第一到三章是这一版的边界，到了最后一章就是结局一个都出不来——
 *    CC2 D10 的定向走法就是这样停住的，「走得通」照样全绿。
 */
interface Broken { scene: string; why: string }
const broken: Broken[] = [];
const flagsEverTrue = new Set<string>();

/** 沿着一条选择序列走到底。返回走过的场次，或者卡住的地方 */
let winDuels = false;
const hasFinale = scenes.some((s) => s.judgeEnding);
/** 走到过的结局 key -> 第一次是哪条路走到的（报告里给人复现用） */
const endingsHit = new Map<string, number>();
/** 结局 key -> 落幕时主角出现过的身份（报告里给 CC3 看哪个结局用哪套袍色） */
const ranksAtEnding = new Map<string, Set<Rank>>();

/** 随机走法用的挑选器：给定能点的几项，挑一项。不给就按 picks 固定挑 */
type Chooser = (usable: number[]) => number;

async function walk(picks: number[], chooser?: Chooser): Promise<{ path: string[]; stuck: Stuck | null; forks: number[] }> {
  // 每条路径都要从头开始。Story.start() 会读自动存档，
  // 不清掉的话第二条路径会从第一条的终点接着走——这个坑我踩过一次。
  mem.clear();
  const store = new Store();
  const noop = {
    mount() {}, async load() {}, async show() {}, beat() {}, resize() {}, dispose() {},
  };
  const path: string[] = [];
  let stuck: Stuck | null = null;
  let pending: { items: { enabled: boolean }[] } | null = null;
  let ended = false;
  let endKind = "";
  let endingKey = "";
  const forks: number[] = [];
  const summarized = new Set<string>();
  const ranks: Rank[] = [];

  const story = new Story(
    scenes, endings, duels, letters, store, noop,
    {
      // 对诗输赢两种都要跑：赢了才攒得起好感，专属闲处场是好感门槛后面的
      async duel() { return winDuels; },
      // 结算页出的那一刻，引擎的当前场景还是章末那一场
      async chapterEnd() { summarized.add(story.sceneId); },
    },
    START,
  );
  story.on((e) => {
    if (e.kind === "scene") {
      if (path.at(-1) !== e.scene.id) path.push(e.scene.id);
      ranks.push(protagonistRank((f) => store.state.flags[f] === true));
    }
    else if (e.kind === "choices") pending = e as unknown as { items: { enabled: boolean }[] };
    // 章末停在「下章待续」也是走完了，不是卡住（D-034）
    else if (e.kind === "ending" || e.kind === "end" || e.kind === "toBeContinued") {
      ended = true;
      endKind = e.kind;
      if (e.kind === "ending") endingKey = e.ending.key;
    }
  });

  await story.start();

  let pick = 0;
  for (let step = 0; step < 6000 && !ended; step++) {
    if (pending) {
      const items = pending.items;
      const usable = items.map((x, i) => (x.enabled ? i : -1)).filter((i) => i >= 0);
      if (!usable.length) {
        stuck = { scene: story.sceneId, line: story.lineIndex, why: "所有选项都被条件锁死，玩家点不动" };
        break;
      }
      forks.push(usable.length);
      // -1 = 这个岔口选最后一项（见下面的「固定挑法」）
      const want = picks[pick++] ?? 0;
      const choice = chooser ? chooser(usable) : (want < 0 ? usable[usable.length - 1] : usable[want % usable.length])!;
      const id = (pending as unknown as { items: { choice: { id: string } }[] }).items[choice]!.choice.id;
      pending = null;
      await story.choose(id);
      continue;
    }
    const before = `${story.sceneId}#${story.lineIndex}`;
    story.advance();
    // advance() 是同步的，但走到句尾换场时它内部 await enter()。
    // 不让出控制权就比较，换场还没发生，会把正常的过场误判成卡住。
    // 用微任务而不是 setTimeout(0)：后者每次一两毫秒，几千步乘几百条路径就要跑几分钟。
    await drain();
    if (!pending && !ended && `${story.sceneId}#${story.lineIndex}` === before) {
      stuck = { scene: story.sceneId, line: story.lineIndex, why: "点击没有任何反应，也没有出口" };
      break;
    }
  }
  if (!ended && !stuck) stuck = { scene: story.sceneId, line: story.lineIndex, why: "六千步还没走到结局，可能有环" };

  if (!stuck) {
    const note = (scene: string, why: string) => {
      if (!broken.some((b) => b.scene === scene && b.why === why)) broken.push({ scene, why });
    };
    // 不变式 1：走过的章末场都出过结算页。卡住的路径不查——那是没走完，不是漏了
    for (const id of path) {
      const sc = scenes.find((x) => x.id === id);
      if (sc?.chapterEnd && !summarized.has(id)) note(id, "走过这一场章末，结算页却没有出");
    }
    // 不变式 2：走进固定截获点，那封信要么被截了，要么玩家已经回过
    for (const l of letters) {
      if (!l.interceptAt || !path.includes(l.interceptAt)) continue;
      const slot = store.state.letters.find((x) => x.id === l.id);
      if (!slot || !(slot.state === "intercepted" || slot.state === "replied" || slot.repliedWith)) {
        note(l.interceptAt, `走进了截获点，${l.id} 却没有被截（状态：${slot?.state ?? "还没触发"}）`);
      }
    }
    for (const [f, v] of Object.entries(store.state.flags)) if (v) flagsEverTrue.add(f);
    // 不变式 5
    const finalRank = protagonistRank((f) => store.state.flags[f] === true);
    ranks.push(finalRank);
    for (let i = 1; i < ranks.length; i++) {
      if (RANK_ORDER[ranks[i]!] < RANK_ORDER[ranks[i - 1]!]) {
        note(path[Math.min(i, path.length - 1)] ?? "?", `主角的身份降了：${ranks[i - 1]} → ${ranks[i]}。袍色只升不降（D-091）`);
        break;
      }
    }
    if (store.state.flags.liqinghe_won === true && ranks.some((r) => r !== "qing")) {
      note(path.at(-1) ?? "?", `落选线（liqinghe_won）上主角穿过 ${[...new Set(ranks)].join("、")}，应当一路是青（D-091）`);
    }
    if (endingKey) {
      const set = ranksAtEnding.get(endingKey) ?? new Set<Rank>();
      set.add(finalRank);
      ranksAtEnding.set(endingKey, set);
    }
    // 不变式 4
    if (endingKey && !endingsHit.has(endingKey)) endingsHit.set(endingKey, runs);
    if (hasFinale && endKind !== "ending") {
      note(path.at(-1) ?? "?", endKind === "toBeContinued"
        ? "全书有终局判定，这条路却停在「下章待续」，结局卡没有出"
        : "全书有终局判定，这条路却落到了「没有结局数据」的兜底话");
    }
  }
  return { path, stuck, forks };
}

// --------------------------------------------------------------- 穷举所有分支

const MAX_RUNS = Number(process.env.SMOKE_RUNS ?? 400);
const MAX_DEPTH = Number(process.env.SMOKE_DEPTH ?? 48);
const seen = new Set<string>();
const stucks: Stuck[] = [];
let runs = 0;
let longest: string[] = [];

async function explore(picks: number[], depth: number): Promise<void> {
  // 三章的岔路比一章多得多。上限可以用环境变量调，默认够第一到第三章走遍
  if (depth > MAX_DEPTH || runs > MAX_RUNS) return;
  runs++;
  const { path, stuck, forks } = await walk(picks);
  for (const s of path) seen.add(s);
  if (path.length > longest.length) longest = path;
  if (stuck && !stucks.some((x) => x.scene === stuck.scene && x.why === stuck.why)) stucks.push(stuck);
  if (process.env.SMOKE_DEBUG) console.log(`  路径[${picks.join(",")}] 岔口${JSON.stringify(forks)}: ${path.join(" -> ")}`);
  // 在第 depth 个岔路口换一个选项，其余照旧
  const n = forks[depth];
  if (n === undefined) return;
  for (let k = 1; k < n; k++) await explore([...picks.slice(0, depth), k], depth + 1);
  await explore(picks, depth + 1);
}

for (const win of [false, true]) {
  winDuels = win;
  runs = 0;
  await explore([], 0);
}

/**
 * 随机走法（B14）：第四章的结局要好几个前后呼应的 flag 一起成立（留异议、毁原件、提名闭合……），
 * 深度优先只在前几个岔口换选项，固定挑法每个岔口一个样，两种都凑不齐这种组合。
 * 种子固定，每次跑的是同一批路，结果可以复现。条数用 SMOKE_RANDOM 调。
 */
const RANDOM_RUNS = Number(process.env.SMOKE_RANDOM ?? 600);
let seed = 20260914;
const rand = (): number => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
for (let i = 0; i < RANDOM_RUNS; i++) {
  winDuels = rand() < 0.5;
  const { path, stuck } = await walk([], (usable) => usable[Math.floor(rand() * usable.length)]!);
  for (const s of path) seen.add(s);
  if (path.length > longest.length) longest = path;
  if (stuck && !stucks.some((x) => x.scene === stuck.scene && x.why === stuck.why)) stucks.push(stuck);
  runs++;
}

/**
 * 固定挑法：每个岔口都挑第 k 项（-1 = 最后一项）。
 *
 * 深度优先只在前面几个岔口换选项，后面的一律挑第一项。三章的岔口有几十个，
 * 「每一步都挑最后一项」这种一个玩家随手就会走的路，穷举排不上号。
 * ch02-19、ch03-21 就是这样漏掉的：入口没有门槛，只是在每个分叉都靠后。
 */
for (const win of [false, true]) {
  winDuels = win;
  for (const k of [-1, 1, 2, 3]) {
    const { path, stuck } = await walk(new Array(400).fill(k));
    for (const s of path) seen.add(s);
    if (path.length > longest.length) longest = path;
    if (stuck && !stucks.some((x) => x.scene === stuck.scene && x.why === stuck.why)) stucks.push(stuck);
    runs++;
  }
}

// --------------------------------------------------------------- 报告

/**
 * 走不到分两种，处理方式完全不同：
 *   没人指向它 —— 数据错，得改剧本或去向；
 *   有人指向但条件没达到 —— 可能是正常的（好感门槛后面的专属场），也可能是门槛定得够不着。
 * 混成一句「走不到」会让人去查错的地方。
 */
const pointedAt = new Map<string, string[]>();
for (const s of scenes) {
  for (const to of [...(s.choices ?? []).map((c) => c.goto), s.goto].filter(Boolean) as string[]) {
    pointedAt.set(to, [...(pointedAt.get(to) ?? []), s.id]);
  }
  const d = s.duel ? duels.find((x) => x.id === s.duel) : undefined;
  for (const to of [d?.onWin?.goto, d?.onLose?.goto].filter(Boolean) as string[]) {
    pointedAt.set(to, [...(pointedAt.get(to) ?? []), s.id]);
  }
}
const unreached = scenes.filter((s) => !seen.has(s.id)).map((s) => s.id);
console.log(`\n无头通关：${which === "converted" ? "CC2 转换产物" : "正式数据"}，起点 ${START}`);
console.log(`  ${scenes.length} 场里走到了 ${seen.size} 场，跑了 ${runs} 条路径，最长一条 ${longest.length} 场`);
for (const id of unreached) {
  const from = pointedAt.get(id);
  const req = scenes.find((s) => s.id === id)?.require;
  if (!from?.length) console.log(`  走不到 ${id}：没有任何场景指向它`);
  else console.log(`  走不到 ${id}：${from.join("、")} 指向它，但进入条件没达到（${JSON.stringify(req) ?? "无"}）`);
}
// 不变式 3：换图规则（D-046）。flag 从来没被写真 = 那张图永远换不上
for (const r of SPRITE_RULES) {
  const who = scenes.some((x) => x.cast.includes(r.who));
  if (!who) continue;                                   // 这个人还没出场的数据，不查
  if (!flagsEverTrue.has(r.flag)) {
    broken.push({ scene: `(${r.who})`, why: `换图规则要的 flag.${r.flag} 在所有路径上都没被写真，${r.who}_*_${r.suffix} 永远换不上` });
    continue;
  }
  // 光栅图一套只有一个中性表情（D-095）：有了 <who>_default_<后缀>.webp，这个人三种表情都用它，SVG 不必齐
  if (existsSync(join(ROOT, "public", "char", "full", `${r.who}_default_${r.suffix}.webp`))) continue;
  for (const expr of ["default", "guarded", "open"]) {
    const f = join(ROOT, "src", "char", `${r.who}_${expr}_${r.suffix}.svg`);
    if (!existsSync(f)) broken.push({ scene: `(${r.who})`, why: `flag.${r.flag} 会写真，但图 ${r.who}_${expr}_${r.suffix}.svg 不存在，也没有光栅图 ${r.who}_default_${r.suffix}.webp` });
  }
}
if (endings.length && hasFinale) {
  const missing = endings.filter((e) => !endingsHit.has(e.key));
  console.log(`  结局 ${endings.length - missing.length}/${endings.length} 张走得到：${endings.filter((e) => endingsHit.has(e.key)).map((e) => e.title).join("、")}`);
  for (const e of missing) console.log(`  走不到结局「${e.title}」（${e.key}）：要 ${JSON.stringify(e.require ?? {})}`);
  const NAME: Record<Rank, string> = { qing: "青", fei: "绯" };
  console.log(`  落幕时主角的袍色：${endings.filter((e) => ranksAtEnding.has(e.key)).map((e) => `${e.title} ${[...ranksAtEnding.get(e.key)!].map((r) => NAME[r]).join("/")}`).join("、")}`);
}
if (broken.length) {
  console.log(`
  不变式没守住的地方：`);
  for (const b of broken) console.log(`    ${b.scene} —— ${b.why}`);
} else {
  console.log(`  ${hasFinale ? "五" : "四"}条不变式都守住了：章末都出了结算页、截获点都截了、换图的 flag 都会写真${hasFinale ? "、每条走完的路都落在结局卡上" : ""}、主角身份只升不降且落选线一路是青。`);
}
if (stucks.length) {
  console.log(`\n  卡住的地方：`);
  for (const s of stucks) console.log(`    ${s.scene} 第 ${s.line} 句 —— ${s.why}`);
} else {
  console.log(`  没有卡住的地方。`);
}
console.log();
process.exit(stucks.length || broken.length ? 1 : 0);
