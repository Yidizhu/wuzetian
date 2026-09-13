/**
 * 好感门槛烟测（D-064）。
 *
 *   node --experimental-strip-types tools/smoke-affinity.ts
 *
 * 普通烟测证明不了一件事：**好感门槛后面的那几场，玩家够不够得着。**
 * 它按选项顺序穷举，不会刻意去讨好谁，攒不起 10 或 16 的好感，所以那几场永远显示「走不到」——
 * 可「走不到」到底是烟测不够聪明，还是数值真的给不够，它分不出来。
 *
 * 这里分两问回答，两问缺一不可：
 *
 * **一问：从零开始，一心向着她走，走得到吗？**（这是 M6 的闸门）
 *   对四个人各走一遍「偏心」的路：每个岔口挑对她好感加得最多的选项，
 *   专属门槛要的 flag 优先写真，对诗都赢，她和别人的信都回、挑加好感最多的回法。
 *   然后看每一档门槛前她的好感到了多少、专属场进没进得去。
 *   这是玩家真正会做的事，所以它走得到才叫「走得到」。
 *
 * **二问：好感种子从几开始才走得到？**（D-064 原话要的那张区间表）
 *   四人各取 0 / 8 / 12 / 18，256 种组合，每种再对四个人各偏心走一遍。
 *   报告每一场专属场在她自己的种子取哪几个值时进得去。
 *   这一问说明的是「门槛之外还有没有别的东西挡着」：种子给到 18 还进不去，
 *   那挡路的就不是数值，是 flag 或者去向。
 *
 * 偏心的走法是贪心的，不是最优的。贪心走得到就一定走得到；
 * 贪心走不到，也可能存在更聪明的走法——报告里会把差几点写出来，由人判断。
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { DATA, loadDir } from "./load.ts";
import { Store } from "../src/engine/state.ts";
import { Story, type ChoiceView } from "../src/engine/story.ts";
import type { Scene, Ending, Choice } from "../src/engine/types.ts";
import type { LetterT, PoemDuelT, PoemT } from "../src/engine/schema.ts";
import type { ReplyKind } from "../src/engine/letters.ts";

const g = globalThis as unknown as Record<string, unknown>;
g.document ??= { documentElement: { dataset: {} } };
const mem = new Map<string, string>();
g.localStorage ??= {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
};

const readJson = <T>(p: string, fallback: T): T => (existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as T) : fallback);
const scenes = loadDir(join(DATA, "chapters")).map((x) => x.raw as Scene);
const duels = readJson<PoemDuelT[]>(join(DATA, "duels.json"), []);
const endings = readJson<Ending[]>(join(DATA, "endings.json"), []);
const poems = readJson<PoemT[]>(join(DATA, "poems.json"), []);
let letters: LetterT[] = [];
try { letters = loadDir(join(DATA, "letters")).map((x) => x.raw as LetterT); } catch { /* 没有信 */ }
const START = "ch01_s00_zhaoyang";
const byId = new Map(scenes.map((s) => [s.id, s]));

const ROMANCE = ["shenheng", "peizhaoye", "wenqiao", "liqinghe"] as const;
type Who = (typeof ROMANCE)[number];
const SEEDS = [0, 8, 12, 18];

async function drain(): Promise<void> {
  for (let i = 0; i < 8; i++) await Promise.resolve();
}

// ---------------------------------------------------------------- 门槛从数据里读，不写死

interface Gate {
  who: Who;
  need: number;
  flags: string[];
  /** 门槛挂在哪一场：进场条件，或者某一场的某个选项 */
  at: string;
  /** 进门之后那一场专属场 */
  exclusive: string;
}

const affinityNeed = (req: Record<string, unknown> | undefined, who: string): number | null => {
  const c = req?.[`affinity.${who}`] as { gte?: number } | undefined;
  return c?.gte ?? null;
};
const flagsOf = (req: Record<string, unknown> | undefined): string[] =>
  Object.entries(req ?? {}).filter(([k, v]) => k.startsWith("flag.") && v === true).map(([k]) => k.slice(5));

const gates: Gate[] = [];
for (const s of scenes) {
  for (const who of ROMANCE) {
    const need = affinityNeed(s.require, who);
    if (need !== null) gates.push({ who, need, flags: flagsOf(s.require), at: s.id, exclusive: s.id });
  }
}
/** 专属场的门槛写在进场条件上；选项上那一道是同一道门，它的 flag 也要算进偏心 */
const wantedFlags = new Map<Who, Set<string>>(ROMANCE.map((w) => [w, new Set(gates.filter((x) => x.who === w).flatMap((x) => x.flags))]));

// ---------------------------------------------------------------- 偏心地走一遍

interface Visit { scene: string; affinity: number }

async function walkFor(target: Who, seed: Record<string, number>): Promise<{ visits: Visit[]; stuck: boolean }> {
  mem.clear();
  const store = new Store();
  for (const [k, v] of Object.entries(seed)) store.state.affinity[k] = v;
  const noop = { mount() {}, async load() {}, async show() {}, beat() {}, resize() {}, dispose() {} };
  const visits: Visit[] = [];
  let pending: ChoiceView[] | null = null;
  let ended = false;

  const story = new Story(scenes, endings, duels, letters, store, noop,
    { async duel() { return true; }, async chapterEnd() {} }, START);

  const wanted = wantedFlags.get(target)!;
  const score = (c: Choice): number => {
    let n = 0;
    const eff = c.effects ?? {};
    n += 10 * Number(eff[`affinity.${target}`] ?? 0);
    for (const [k, v] of Object.entries(eff)) if (k.startsWith("flag.") && v === true && wanted.has(k.slice(5))) n += 100;
    const to = c.goto ? byId.get(c.goto) : undefined;
    if (to && affinityNeed(to.require, target) !== null) n += 1000;     // 门开着就进她的专属场
    return n;
  };

  /** 信：一到就回，挑对目标好感加得最多的回法；一样多就挑总好感多的 */
  const answerLetters = (): void => {
    // SMOKE_NO_LETTERS=1：一封信都不回。信要等真实时间，读得快的人走到门前时信可能还在路上——
    // 这一档看的是「光靠当面的选择够不够」，也就是最坏情况下的余量
    if (process.env.SMOKE_NO_LETTERS) return;
    for (const slot of store.state.letters) {
      if (slot.state === "pending" && slot.dueAt) slot.state = "arrived";    // 真实时间门在无头里等不起，直接送到
      if (slot.state !== "arrived" && slot.state !== "read") continue;
      const l = letters.find((x) => x.id === slot.id);
      if (!l) continue;
      const tags = [...store.state.poemsCollected].flatMap((id) => poems.find((p) => p.id === id)?.tags ?? []);
      const options: [ReplyKind, Record<string, number | boolean> | undefined, string | undefined][] = [
        ["plainA", l.replies.plain[0]?.effects, l.replies.plain[0]?.goto],
        ["plainB", l.replies.plain[1]?.effects, l.replies.plain[1]?.goto],
        ["plainC", l.replies.plain[2]?.effects, l.replies.plain[2]?.goto],
      ];
      if (tags.some((t) => l.replies.poem.resonantTags.includes(t))) options.push(["poemResonant", l.replies.poem.onResonant.effects, l.replies.poem.onResonant.goto]);
      // 带去向的回法会把人拽进别的场，无头里不走它：宁可少加一点，不让路线失真
      const ok = options.filter(([, , to]) => !to);
      const val = (e?: Record<string, number | boolean>) => 100 * Number(e?.[`affinity.${target}`] ?? 0)
        + ROMANCE.reduce((a, w) => a + Number(e?.[`affinity.${w}`] ?? 0), 0);
      const best = ok.sort((a, b) => val(b[1]) - val(a[1]))[0];
      if (best) story.letters.reply(l.id, best[0], tags);
    }
  };

  story.on((e) => {
    if (e.kind === "scene") {
      answerLetters();
      visits.push({ scene: e.scene.id, affinity: store.state.affinity[target] ?? 0 });
    } else if (e.kind === "choices") pending = e.items;
    else if (e.kind === "ending" || e.kind === "end" || e.kind === "toBeContinued") ended = true;
  });

  await story.start();
  for (let step = 0; step < 8000 && !ended; step++) {
    if (pending) {
      const usable = (pending as ChoiceView[]).filter((x) => x.enabled);
      pending = null;
      if (!usable.length) return { visits, stuck: true };
      const pick = usable.reduce((a, b) => (score(b.choice) >= score(a.choice) ? b : a));
      // 门槛之前那一刻的好感：记在「做选择的这一场」上
      visits.push({ scene: `${story.sceneId}@choose`, affinity: store.state.affinity[target] ?? 0 });
      await story.choose(pick.choice.id);
      continue;
    }
    const before = `${story.sceneId}#${story.lineIndex}`;
    story.advance();
    await drain();
    if (!pending && !ended && `${story.sceneId}#${story.lineIndex}` === before) return { visits, stuck: true };
  }
  return { visits, stuck: !ended };
}

// ---------------------------------------------------------------- 一问：从零开始

const NAMES: Record<Who, string> = { shenheng: "沈衡", peizhaoye: "裴照夜", wenqiao: "温荞", liqinghe: "李令仪" };
let failed = 0;

console.log(`\n好感门槛烟测（D-064）：${scenes.length} 场，${gates.length} 道好感门\n`);
console.log(`一问：从零开始，一心向着她走，走得到吗？（M6 闸门）\n`);

const zero = Object.fromEntries(ROMANCE.map((w) => [w, 0]));
for (const who of ROMANCE) {
  const { visits, stuck } = await walkFor(who, zero);
  const seen = new Set(visits.map((v) => v.scene));
  console.log(`  ${NAMES[who]}${stuck ? "（这条偏心路卡住了）" : ""}`);
  for (const gt of gates.filter((x) => x.who === who).sort((a, b) => a.need - b.need)) {
    // 门前那一刻：进专属场之前、指向它的那一场做选择时的好感
    const from = scenes.find((s) => (s.choices ?? []).some((c) => c.goto === gt.exclusive));
    const atChoose = visits.find((v) => v.scene === `${from?.id}@choose`)?.affinity;
    const inside = seen.has(gt.exclusive);
    if (!inside) failed += 1;
    const gap = atChoose === undefined ? "门前那一场没走到" : `门前好感 ${atChoose}`;
    console.log(`    ${inside ? "✓" : "✗"} ${gt.exclusive}  门槛 ${gt.need}，${gap}${inside ? "" : atChoose !== undefined && atChoose < gt.need ? `，差 ${gt.need - atChoose}` : ""}`);
  }
}

// ---------------------------------------------------------------- 二问：种子区间

console.log(`\n二问：她自己的好感种子取几时，专属场进得去？（四人各 ${SEEDS.join(" / ")}，${SEEDS.length ** ROMANCE.length} 种组合）\n`);

const reachBySeed = new Map<string, Map<number, boolean>>();   // 专属场 -> 她的种子 -> 在任一组合下进得去
const combos: Record<string, number>[] = [];
for (const a of SEEDS) for (const b of SEEDS) for (const c of SEEDS) for (const d of SEEDS) {
  combos.push({ shenheng: a, peizhaoye: b, wenqiao: c, liqinghe: d });
}
for (const combo of combos) {
  for (const who of ROMANCE) {
    const { visits } = await walkFor(who, combo);
    const seen = new Set(visits.map((v) => v.scene));
    for (const gt of gates.filter((x) => x.who === who)) {
      const m = reachBySeed.get(gt.exclusive) ?? new Map<number, boolean>();
      const s = combo[who]!;
      m.set(s, (m.get(s) ?? false) || seen.has(gt.exclusive));
      reachBySeed.set(gt.exclusive, m);
    }
  }
}
for (const gt of [...gates].sort((a, b) => a.need - b.need || a.exclusive.localeCompare(b.exclusive))) {
  const m = reachBySeed.get(gt.exclusive)!;
  const row = SEEDS.map((s) => `${s}:${m.get(s) ? "进" : "不"}`).join("  ");
  const blockedBeyondNumbers = !m.get(18);
  console.log(`    ${gt.exclusive.padEnd(18)} ${NAMES[gt.who]} ≥${String(gt.need).padEnd(2)}  ${row}${blockedBeyondNumbers ? "   ← 种子给到 18 还进不去：挡路的不是数值" : ""}`);
  if (blockedBeyondNumbers) failed += 1;
}

console.log(failed ? `\n  ${failed} 处没过。\n` : `\n  全部走得到：每一道好感门，从零开始偏心地走都进得去，而且门槛之外没有别的东西挡着。\n`);
process.exit(failed ? 1 : 0);
