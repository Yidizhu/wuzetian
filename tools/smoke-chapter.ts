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
  : "ch01_s01_zhaoyang";

/** 让出几轮微任务，够 enter() 里那几个 await 走完 */
async function drain(): Promise<void> {
  for (let i = 0; i < 8; i++) await Promise.resolve();
}

// --------------------------------------------------------------- 走一条路径

interface Stuck { scene: string; line: number; why: string }

/** 沿着一条选择序列走到底。返回走过的场次，或者卡住的地方 */
let winDuels = false;

async function walk(picks: number[]): Promise<{ path: string[]; stuck: Stuck | null; forks: number[] }> {
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
  const forks: number[] = [];

  const story = new Story(
    scenes, endings, duels, letters, store, noop,
    {
      // 对诗输赢两种都要跑：赢了才攒得起好感，专属闲处场是好感门槛后面的
      async duel() { return winDuels; },
      async chapterEnd() {},
    },
    START,
  );
  story.on((e) => {
    if (e.kind === "scene") { if (path.at(-1) !== e.scene.id) path.push(e.scene.id); }
    else if (e.kind === "choices") pending = e as unknown as { items: { enabled: boolean }[] };
    // 章末停在「下章待续」也是走完了，不是卡住（D-034）
    else if (e.kind === "ending" || e.kind === "end" || e.kind === "toBeContinued") ended = true;
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
      const choice = usable[(picks[pick++] ?? 0) % usable.length]!;
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
  return { path, stuck, forks };
}

// --------------------------------------------------------------- 穷举所有分支

const seen = new Set<string>();
const stucks: Stuck[] = [];
let runs = 0;
let longest: string[] = [];

async function explore(picks: number[], depth: number): Promise<void> {
  if (depth > 16 || runs > 120) return;
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
if (stucks.length) {
  console.log(`\n  卡住的地方：`);
  for (const s of stucks) console.log(`    ${s.scene} 第 ${s.line} 句 —— ${s.why}`);
} else {
  console.log(`  没有卡住的地方。`);
}
console.log();
process.exit(stucks.length ? 1 : 0);
