/**
 * 八条线的场次骨架（D-115 第一步，CC2 维护）。
 *
 *   node --experimental-strip-types tools/convert-routes.ts        # 写 docs/convert-routes.md
 *
 * 用真引擎把游戏从头走到结局卡，走很多遍，按落到哪个结局分组，归纳每条线实际经过哪些场。
 * 这份骨架交给 ChatGPT 写《八条线的故事线》，它只能顺着这里的场次写——所以这里的每一格
 * 都必须是走出来的，不是从大纲或结局树推出来的。
 *
 * 读的是 src/data/converted/（CC2 的转换产物，D13 起与正式数据逐字节相同），不读剧本原文：
 * 原文可能正在改（D-113），骨架只能建在已经转换过的版本上。
 *
 * 玩家行为怎么模拟：
 *  - 选项：一部分路完全随机挑；一部分朝某个结局定向挑（优先写那个结局要的 flag，避开会被更靠前的结局截走的 flag），
 *    定向时仍掺一定比例的随机，免得八条线都只走出一种路。
 *  - 信：时钟快进，信真的会送到案上；每封信随机回（直言三种、以诗代答、不回）或者一直不拆。
 *    信不改场次，但回信加好感，好感门槛后面的专属场要靠它。
 *  - 对诗：每一局随机赢输。
 *  随机数种子固定，同一份数据每次写出同一份骨架。
 *
 * 「必经」怎么认：走到这个结局的每一条路都经过它。光凭抽样会把「碰巧都经过」认成必经，所以再加两道：
 *  1. 图上绕不开（只看去向，不看条件）：这是证明，不是抽样。
 *  2. 图上绕得开的，专门朝这个结局、绕着这一场再走一批；绕开了就改判「选出来的」，绕不开才留「必经」，并注明试了几次。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { ROOT, DATA, loadDir } from "./load.ts";
import { Store } from "../src/engine/state.ts";
import { Story } from "../src/engine/story.ts";
import type { Scene, Ending } from "../src/engine/types.ts";
import type { LetterT, PoemDuelT } from "../src/engine/schema.ts";
import type { ReplyKind } from "../src/engine/letters.ts";

// ------------------------------------------------------- 浏览器那点东西的替身（同 smoke-chapter.ts）
const g = globalThis as unknown as Record<string, unknown>;
g.document ??= { documentElement: { dataset: {} } };
const mem = new Map<string, string>();
g.localStorage ??= { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
// 信的时间门看真实时钟。每读一次快进一小时：一封信触发后，下一次投递检查时就已经到了
let fakeNow = Date.UTC(2026, 0, 1);
Date.now = () => (fakeNow += 3_600_000);
// 引擎里的 console.info/warn 是给开发者看的（信被截、未读超限），走几千遍会刷屏
console.info = () => {}; console.warn = () => {};

// ------------------------------------------------------------------ 数据
const CONV = join(DATA, "converted");
const scenes = loadDir(join(CONV, "chapters")).map(x => x.raw as Scene);
const letters = loadDir(join(CONV, "letters")).map(x => x.raw as LetterT);
const duels = JSON.parse(readFileSync(join(CONV, "duels.json"), "utf8")) as PoemDuelT[];
const endings = JSON.parse(readFileSync(join(CONV, "endings.json"), "utf8")) as Ending[];
const byId = new Map(scenes.map(s => [s.id, s]));
const duelById = new Map(duels.map(d => [d.id, d]));
const START = [...scenes].sort((a, b) => a.id.localeCompare(b.id))[0]!.id;
const endingTitle = new Map(endings.map(e => [e.key, e.title]));

/** 场次标题从分支图里取：那是上一次转换写的，不去读可能正在改的原文 */
const titles = new Map<string, string>();
for (const m of readFileSync(join(ROOT, "docs", "story-graph.md"), "utf8").matchAll(/^\s+(ch\d+_s\w+?)\["[^ ]+ ([^<"]+)<br\/>/gm)) titles.set(m[1]!, m[2]!.trim());

// ------------------------------------------------------------------ 图（只看去向）
const succ = (s: Scene): string[] => {
  const d = s.duel ? duelById.get(s.duel) : undefined;
  // B27 自动去向也是边：不让玩家选，按关系状态走
  return [...new Set([s.goto, ...(s.choices ?? []).map(c => c.goto), ...(s.branches ?? []).map(b => b.goto), d?.onWin?.goto, d?.onLose?.goto].filter((x): x is string => !!x && byId.has(x)))];
};
const terminals = new Set(scenes.filter(s => s.judgeEnding || s.ending).map(s => s.id));
/** 从 from 出发、不经过 avoid，能不能走到终局 */
const canFinishAvoiding = (from: string, avoid: string): boolean => {
  if (from === avoid) return false;
  const seen = new Set<string>(); const q = [from];
  while (q.length) {
    const id = q.pop()!; if (seen.has(id) || id === avoid) continue; seen.add(id);
    if (terminals.has(id)) return true;
    for (const t of succ(byId.get(id)!)) q.push(t);
  }
  return false;
};
const reachCache = new Map<string, Set<string>>();
const reach = (from: string): Set<string> => {
  let r = reachCache.get(from); if (r) return r;
  r = new Set([from]); const q = [from];
  while (q.length) for (const t of succ(byId.get(q.pop()!)!)) if (!r.has(t)) { r.add(t); q.push(t); }
  reachCache.set(from, r); return r;
};
const writersOf = (flag: string) => scenes.filter(s => (s.choices ?? []).some(c => c.effects?.[`flag.${flag}`] === true)).map(s => s.id);

// ------------------------------------------------------------------ 走一条路
interface Entry { from: string; via: string }
interface Walk { path: string[]; entries: Map<string, Entry[]>; ending: string; writes: { flag: string; value: boolean; site: string }[] }
interface Policy { target?: string; eps: number; avoid?: string; seed: number; ignoreLetters?: boolean }

let seed = 1;
const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
const pickOne = <T>(xs: T[]): T => xs[Math.floor(rand() * xs.length)]!;
// 等引擎真的停下来再点下一下（D23）。原来只等 8 个微任务：题记收起之后引擎还在等墨晕开，
// 那一拍点下去会跳过题记后的第一格（B33 提醒的那条，骨架只记场次所以没走样，但别留着）
async function drain() { await new Promise<void>(r => setImmediate(r)); }

function plan(key: string) {
  const idx = endings.findIndex(e => e.key === key); const e = endings[idx]!;
  const req = Object.entries(e.require ?? {});
  const want = req.filter(([k, v]) => k.startsWith("flag.") && v === true).map(([k]) => k.slice(5));
  const mustFalse = req.filter(([k, v]) => k.startsWith("flag.") && v === false).map(([k]) => k.slice(5));
  const earlier = endings.slice(0, idx).flatMap(x => Object.entries(x.require ?? {}).filter(([k, v]) => k.startsWith("flag.") && v === true).map(([k]) => k.slice(5)));
  return { want, avoid: [...new Set([...mustFalse, ...earlier.filter(f => !want.includes(f))])] };
}

const REPLIES: ReplyKind[] = ["plainA", "plainB", "plainC", "poemResonant", "poemMismatch", "silence"];

async function walk(p: Policy): Promise<Walk | null> {
  seed = p.seed;
  mem.clear();
  const store = new Store();
  const noop = { mount() {}, async load() {}, async show() {}, beat() {}, resize() {}, dispose() {} };
  const path: string[] = []; const entries = new Map<string, Entry[]>(); const writes: Walk["writes"] = [];
  let pending: { items: { enabled: boolean; choice: { id: string; goto?: string; effects?: Record<string, unknown> } }[] } | null = null;
  let ending = ""; let over = false;
  let via = "";                                  // 下一次换场是怎么发生的
  const handled = new Set<string>();
  const goals = p.target ? plan(p.target) : null;

  const story = new Story(scenes, endings, duels, letters, store, noop, {
    async duel() { const win = rand() < 0.5; via = win ? "对诗赢" : "对诗输"; return win; },
    async chapterEnd() {},
  }, START);
  story.on(e => {
    if (e.kind === "scene") {
      const prev = path.at(-1);
      if (prev !== e.scene.id) {
        path.push(e.scene.id);
        const how = !prev ? "起点" : via || (byId.get(prev)?.goto === e.scene.id ? "上一场走完直接进" : "换场");
        const list = entries.get(e.scene.id) ?? []; list.push({ from: prev ?? "", via: how }); entries.set(e.scene.id, list);
      }
      via = "";
    } else if (e.kind === "choices") pending = e as never;
    else if (e.kind === "ending") { ending = e.ending.key; over = true; }
    else if (e.kind === "end" || e.kind === "toBeContinued") over = true;
  });
  await story.start();

  for (let step = 0; step < 8000 && !over; step++) {
    // 信：案上一有新到的就拆。九成挑一种回法回，一成读了不回。
    // 看的是存档里的信件状态，不是 letters 事件：换场时投递的信，事件里的 arrived 是空的。
    // 一直不拆的玩家以前会踩到跳场（未读超限把沈衡那封截走、跳过第二章 06—10）。CC1 在 B19 修了（D-124），烟测有断言。
    // 骨架仍按「每封都拆」走：拆不拆不改场次，回信加的好感才会打开专属场
    if (!p.ignoreLetters) for (const slot of store.state.letters) {
      if (slot.state !== "arrived" || handled.has(slot.id)) continue;
      handled.add(slot.id);
      if (rand() < 0.1) { story.markLetterRead(slot.id); continue; }
      const kind = pickOne(REPLIES);
      const l = letters.find(x => x.id === slot.id)!;
      const tags = kind === "poemResonant" ? l.replies.poem.resonantTags.slice(0, 1) : [];
      const before = { ...store.state.flags } as Record<string, unknown>;
      await story.replyLetter(slot.id, kind, tags);
      for (const [f, v] of Object.entries(store.state.flags)) if (before[f] !== v) writes.push({ flag: f, value: v as boolean, site: `${slot.id} 回信` });
    }
    if (pending) {
      const items = pending.items; pending = null;
      const usable = items.filter(x => x.enabled);
      if (!usable.length) return null;
      const cur = byId.get(story.sceneId)!;
      const target = (c: { goto?: string }) => c.goto ?? cur.goto;
      let pick = pickOne(usable);
      if (goals || p.avoid) {
        const flags = store.state.flags;
        const missing = goals ? goals.want.filter(f => !flags[f]) : [];
        const score = (x: typeof usable[number]) => {
          let sc = 0; const c = x.choice;
          for (const [k, v] of Object.entries(c.effects ?? {})) {
            const f = k.replace(/^flag\./, "");
            if (v === true && missing.includes(f)) sc += 10;
            if (v === true && goals?.avoid.includes(f)) sc -= 20;
          }
          const to = target(c);
          if (to) for (const f of missing) if (writersOf(f).some(w => reach(to).has(w))) sc += 2;
          if (p.avoid && to && !canFinishAvoiding(to, p.avoid)) sc -= 100;
          return sc;
        };
        if (rand() >= p.eps) { const best = Math.max(...usable.map(score)); pick = pickOne(usable.filter(x => score(x) === best)); }
        else if (p.avoid) { const ok = usable.filter(x => { const to = target(x.choice); return !to || canFinishAvoiding(to, p.avoid!); }); if (ok.length) pick = pickOne(ok); }
      }
      const c = pick.choice;
      for (const [k, v] of Object.entries(c.effects ?? {})) if (k.startsWith("flag.")) writes.push({ flag: k.slice(5), value: v as boolean, site: c.id });
      const key = c.id.split(".c")[1];
      via = `选 ${key}`;
      await story.choose(c.id);
      continue;
    }
    story.advance(); await drain();
  }
  return ending ? { path, entries, ending, writes } : null;
}

// ------------------------------------------------------------------ 走很多遍
const RANDOM = Number(process.env.ROUTES_RANDOM ?? 1500);
const GUIDED = Number(process.env.ROUTES_GUIDED ?? 120);
const AVOID_TRIES = Number(process.env.ROUTES_AVOID ?? 60);
const walks: Walk[] = [];
let s0 = 20260914;
const nextSeed = () => (s0 = (s0 * 1103515245 + 12345) >>> 0);
for (let i = 0; i < RANDOM; i++) { const w = await walk({ eps: 1, seed: nextSeed() }); if (w) walks.push(w); }
for (const e of endings) for (const eps of [0, 0.25, 0.5]) for (let i = 0; i < GUIDED; i++) {
  const w = await walk({ target: e.key, eps, seed: nextSeed() }); if (w) walks.push(w);
}

const byEnding = (key: string) => walks.filter(w => w.ending === key);
/** 必经复核：图上绕得开、抽样却都经过的场，专门绕着走 */
const avoidLog = new Map<string, { tries: number; avoided: boolean; reached: number }>();
for (const e of endings) {
  for (let round = 0; round < 50; round++) {
    const ws = byEnding(e.key); if (!ws.length) break;
    const always = [...new Set(ws.flatMap(w => w.path))].filter(id => ws.every(w => w.path.includes(id)));
    const suspect = always.find(id => canFinishAvoiding(START, id) && !avoidLog.has(`${e.key}|${id}`));
    if (!suspect) break;
    let avoided = false; let tries = 0; let reached = 0;
    for (; tries < AVOID_TRIES && !avoided; tries++) {
      const w = await walk({ target: e.key, eps: tries % 3 === 0 ? 0 : 0.3, avoid: suspect, seed: nextSeed() });
      if (w) { walks.push(w); if (w.ending === e.key) { reached++; if (!w.path.includes(suspect)) avoided = true; } }
    }
    avoidLog.set(`${e.key}|${suspect}`, { tries, avoided, reached });
  }
}

// ------------------------------------------------------------------ 写骨架
const natural = (a: string, b: string) => a.localeCompare(b, "en", { numeric: true });
const esc = (t: string) => t.replace(/\|/g, "\\|");
const choiceText = (scene: string, key: string) => (byId.get(scene)?.choices ?? []).find(c => c.id === `${scene}.c${key}`)?.text ?? "";
const condText = (c: Record<string, unknown> | undefined) => Object.entries(c ?? {}).map(([k, v]) =>
  typeof v === "boolean" ? `${v ? "" : "非 "}${k}` : Object.entries(v as Record<string, number>).map(([op, n]) => `${k} ${({ gte: ">=", lte: "<=", gt: ">", lt: "<", eq: "=" } as Record<string, string>)[op] ?? op} ${n}`).join(" 且 ")).join(" 且 ");
const reqText = (e: Ending) => Object.keys(e.require ?? {}).length ? condText(e.require as Record<string, unknown>) : "无条件（兜底：前面七个都不成立时落到这里）";
const pct = (n: number, d: number) => `${Math.round((n / d) * 100)}%`;

const manifest = JSON.parse(readFileSync(join(CONV, "manifest.json"), "utf8"));
const dataHash = createHash("sha256").update(JSON.stringify([scenes, letters, duels, endings])).digest("hex").slice(0, 12);
const out: string[] = [
  "# 八条线的场次骨架",
  "",
  "> 由 `tools/convert-routes.ts` 生成（CC2，D-115 第一步），交 ChatGPT 写《八条线的故事线》。不要手改；数据变了重跑这个脚本。",
  `> 读的是 \`src/data/converted/\`（数据指纹 \`${dataHash}\`，对应 manifest 里 ${manifest.inputs.length} 份原文的那一次转换），不读剧本原文。`,
  "",
  "## 这份表是怎么来的",
  "",
  `用真引擎（\`src/engine/story.ts\`，和玩家手里是同一份代码）从 \`${START}\` 一路走到结局卡，一共走了 ${walks.length} 遍：${RANDOM} 遍每个岔口随机挑；其余朝某个结局定向挑、掺一部分随机；另有一批是为复核「必经」专门绕着某一场走的。信会真的送到，每封都拆，九成随机挑一种回法回、一成读了不回；对诗随机赢输。随机数种子固定，数据不变就写出同一份表。`,
  "",
  "每条线就是「落到这个结局的那些路」。表里只有走出来的东西：",
  "",
  "- **必经**：落到这个结局的每一条路都经过这一场。后面括号说凭什么：**图上绕不开**是按去向算的证明；**条件绕不开**是图上还有别的去向，但朝这个结局专门绕着它走也没绕开，下面写出另一条去向要什么条件。",
  "- **选出来的**：有的路经过、有的不经过，百分比是经过它的路占这条线的比例。",
  "- **信拆不拆**：模拟玩家每封信都拆。以前信一直不拆会让第二章 06—10 整段跳过，CC1 在 B19 修了（D-124），烟测断言拆 0 封、拆 1 封都不跳场，所以拆不拆不再改场次；「图上绕不开」只按场景去向算。",
  "- **从哪里进来**：上一场是哪一场、怎么进来的（选了哪个选项、上一场走完直接进、对诗赢输）。同一场有几种进法就列几种，括号里是次数。",
  "- **只在本线**：别的结局的路一次都没经过这一场。",
  "- **判定用到的 flag 是在哪里写下的**：这条线的路上，结局判定要的那几个 flag，最后一次是哪一场哪个选项写成现在这个值的；那个选项要是被更早的选项放行的，接着写出那一格。",
  "- **场次的顺序**是走出来的先后，不是 id 的大小。",
  "",
  "**写故事线时只能顺着这里的场写，不许添这里没有的场。** 选出来的场可以写成「如果……」，但要按这里的进法写。",
  "",
  "## 总览",
  "",
  "| 结局 | 判定 | 走到的路 | 不同的场次序列 | 场数（最短—最长） | 必经 | 选出来的 | 只在本线 |",
  "|---|---|---|---|---|---|---|---|",
];

const sections: string[] = [];
endings.forEach((e, idx) => {
  const ws = byEnding(e.key);
  if (!ws.length) { out.push(`| ${e.title} | ${esc(reqText(e))} | **0，没走到** | — | — | — | — | — |`); return; }
  const others = walks.filter(w => w.ending !== e.key);
  const seenElsewhere = new Set(others.flatMap(w => w.path));
  // 按走出来的先后排，不按 id：第二章实际是 21→25→22→23→26→24。
  // 用这条线上所有路的「前一场→后一场」做拓扑排序；同时可排的几场按平均位置、再按 id
  const idSet = [...new Set(ws.flatMap(w => w.path))];
  const meanPos = new Map(idSet.map(id => { const ps = ws.flatMap(w => { const i = w.path.indexOf(id); return i < 0 ? [] : [i]; }); return [id, ps.reduce((a, b) => a + b, 0) / ps.length]; }));
  const after = new Map(idSet.map(id => [id, new Set<string>()])); const indeg = new Map(idSet.map(id => [id, 0]));
  for (const w of ws) for (let i = 1; i < w.path.length; i++) {
    const [a, b] = [w.path[i - 1]!, w.path[i]!];
    if (a !== b && !after.get(a)!.has(b) && !after.get(b)!.has(a)) { after.get(a)!.add(b); indeg.set(b, indeg.get(b)! + 1); }
  }
  const ids: string[] = []; const ready = idSet.filter(id => indeg.get(id) === 0);
  const byPos = (a: string, b: string) => meanPos.get(a)! - meanPos.get(b)! || natural(a, b);
  while (ready.length) {
    ready.sort(byPos); const id = ready.shift()!; ids.push(id);
    for (const t of after.get(id)!) { indeg.set(t, indeg.get(t)! - 1); if (indeg.get(t) === 0) ready.push(t); }
  }
  // 有环（不该有）就把剩下的按平均位置补在后面，别丢场
  for (const id of idSet.filter(x => !ids.includes(x)).sort(byPos)) ids.push(id);
  const count = (id: string) => ws.filter(w => w.path.includes(id)).length;
  const must = ids.filter(id => count(id) === ws.length);
  const lens = ws.map(w => w.path.length);
  const distinct = new Set(ws.map(w => w.path.join(">"))).size;
  const only = ids.filter(id => !seenElsewhere.has(id));
  out.push(`| ${e.title} | ${esc(reqText(e))} | ${ws.length} | ${distinct} | ${Math.min(...lens)}—${Math.max(...lens)} | ${must.length} | ${ids.length - must.length} | ${only.length} |`);

  const rows = ids.map((id, i) => {
    const n = count(id);
    let kind: string;
    if (n === ws.length) {
      const log = avoidLog.get(`${e.key}|${id}`);
      kind = !canFinishAvoiding(START, id) ? "必经（图上绕不开）" : log ? `必经（条件绕不开：绕着它走 ${log.tries} 次，${log.reached ? `走到本结局的 ${log.reached} 次都经过它` : "一次也没走到本结局"}）` : "必经";
    } else kind = `选出来的（${pct(n, ws.length)}）`;
    const ent = new Map<string, number>();
    for (const w of ws) for (const x of w.entries.get(id) ?? []) {
      const k = x.from ? `\`${x.from}\` ${x.via.startsWith("选 ") ? `${x.via}「${esc(choiceText(x.from, x.via.slice(2)))}」` : x.via}` : x.via;
      ent.set(k, (ent.get(k) ?? 0) + 1);
    }
    const entText = [...ent.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}（${v}）`).join("；");
    const req = byId.get(id)?.require;
    const reqNote = req && Object.keys(req).length ? `<br/>进入条件：${esc(condText(req as Record<string, unknown>))}` : "";
    // 图上绕得开却是必经：把上一场的其他去向和它们的进入条件列出来，让人看得见是哪道条件挡住的
    let detour = "";
    if (n === ws.length && canFinishAvoiding(START, id)) {
      const froms = new Set(ws.flatMap(w => (w.entries.get(id) ?? []).map(x => x.from)).filter(Boolean));
      const alts = [...new Set([...froms].flatMap(f => succ(byId.get(f)!).filter(t => t !== id && canFinishAvoiding(t, id))))].sort(natural);
      if (alts.length) detour = `<br/>上一场的另一条去向：${alts.map(t => `\`${t}\`${byId.get(t)?.require && Object.keys(byId.get(t)!.require!).length ? `（要 ${esc(condText(byId.get(t)!.require as Record<string, unknown>))}）` : "（无进入条件，但本线的选项没有走向它）"}`).join("、")}`;
    }
    return `| ${i + 1} | \`${id}\` | ${esc(titles.get(id) ?? "")} | ${kind} | ${entText}${reqNote}${detour} | ${only.includes(id) ? "✓" : ""} |`;
  });

  // 判定 flag 的最后写入点，再顺着放行条件往回追：第四章的决定是两步写的（先选意向，后一场按意向放行的选项才落定），
  // 只报最后那一格会把决定错指到后一场
  const siteText = (site: string, value: boolean) => site.includes(".c")
    ? `\`${site.split(".c")[0]}\` 选 ${site.split(".c")[1]}「${esc(choiceText(site.split(".c")[0]!, site.split(".c")[1]!))}」 写成${value ? "真" : "假"}`
    : `${site} 写成${value ? "真" : "假"}`;
  const choiceById = new Map(scenes.flatMap(sc => (sc.choices ?? []).map(c => [c.id, c] as const)));
  // 只追两步；结局判定自己要的 flag（比如 enthroned）单独有一条，不在别的 flag 的链上重复追
  const judged = new Set(Object.keys(e.require ?? {}).filter(k => k.startsWith("flag.")).map(k => k.slice(5)));
  const chain = (w: Walk, at: number, depth = 0): string => {
    const wr = w.writes[at]!;
    const c = choiceById.get(wr.site);
    if (!c || depth >= 2) return "";
    const gates = Object.entries(c.require ?? {}).filter(([k, v]) => k.startsWith("flag.") && typeof v === "boolean" && !judged.has(k.slice(5)));
    // 一个选项可能要好几个 flag 放行：并列写，每一个自己往回追的部分放在它后面的括号里，免得读成一条链
    const hops = gates.flatMap(([k, v]) => {
      const i = w.writes.slice(0, at).map((x, j) => [x, j] as const).reverse().find(([x]) => x.flag === k.slice(5) && x.value === v)?.[1];
      if (i === undefined) return [];
      const deeper = chain(w, i, depth + 1);
      return [`\`${k.slice(5)}\` 来自 ${siteText(w.writes[i]!.site, v as boolean)}${deeper ? `（${deeper.replace(/^ ← 这一项要 /, "它又要 ")}）` : ""}`];
    });
    return hops.length ? ` ← 这一项要 ${hops.join("；还要 ")}` : "";
  };
  const flagRows = Object.entries(e.require ?? {}).filter(([k]) => k.startsWith("flag.")).map(([k, v]) => {
    const f = k.slice(5); const sites = new Map<string, number>(); let never = 0;
    for (const w of ws) {
      let at = -1;
      for (let j = w.writes.length - 1; j >= 0; j--) if (w.writes[j]!.flag === f) { at = j; break; }
      if (at < 0) { never++; continue; }
      const key = siteText(w.writes[at]!.site, w.writes[at]!.value) + chain(w, at);
      sites.set(key, (sites.get(key) ?? 0) + 1);
    }
    const parts = [...sites.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => `  - ${s}（${n} 条）`);
    if (never) parts.push(`  - 从没被写过，保持初始的假（${never} 条）`);
    return [`- \`${f}\` 要${v ? "真" : "假"}：`, ...parts].join("\n");
  });
  // 为什么没落到更靠前的结局：兜底和只要一个 flag 的结局，落点在「前面几个没成立」
  const earlier = endings.slice(0, idx);
  const missNotes = earlier.length ? earlier.map(x => {
    const fl = Object.entries(x.require ?? {}).filter(([k]) => k.startsWith("flag."));
    const why = new Map<string, number>();
    for (const w of ws) {
      const final: Record<string, boolean> = {};
      for (const wr of w.writes) final[wr.flag] = wr.value;
      const miss = fl.filter(([k, v]) => (final[k.slice(5)] ?? false) !== v).map(([k, v]) => `${v ? "" : "非 "}${k.slice(5)}`);
      const key = miss.join("、") || "（flag 都成立，没成立的是数值条件）";
      why.set(key, (why.get(key) ?? 0) + 1);
    }
    return `| ${x.title} | ${[...why.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `缺 ${esc(k)}（${n}）`).join("；")} |`;
  }) : [];

  sections.push(
    `## ${idx + 1}. ${e.title}（\`${e.key}\`）`,
    "",
    `判定：${esc(reqText(e))}。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 ${idx} 个结局都不成立。`,
    "",
    `走到这里的路 ${ws.length} 条，不同的场次序列 ${distinct} 种，每条 ${Math.min(...lens)}—${Math.max(...lens)} 场。`,
    "",
    "### 判定用到的 flag 是在哪里写下的",
    "",
    ...(flagRows.length ? ["每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。", "", ...flagRows] : ["无：兜底结局不看 flag。"]),
    "",
    ...(missNotes.length ? ["### 为什么没落到更靠前的结局", "", "| 更靠前的结局 | 这条线上的路缺了什么（路数） |", "|---|---|", ...missNotes, ""] : []),
    "### 场次",
    "",
    "| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |",
    "|---|---|---|---|---|---|",
    ...rows,
    "",
  );
});

out.push("", ...sections);
const suspicious = [...avoidLog.entries()].filter(([, v]) => !v.avoided);
out.push(
  "## 附：必经的复核记录",
  "",
  `抽样里「每条都经过」、但图上绕得开的场，都朝那个结局专门绕着走过（每场最多 ${AVOID_TRIES} 次，绕开一次就停）。绕开了的，那条路已经算进这条线，这一场随之变成「选出来的」。`,
  "",
  `- 复核 ${avoidLog.size} 处，绕开 ${avoidLog.size - suspicious.length} 处，留作必经 ${suspicious.length} 处。`,
  "",
  "| 结局 | 场次 | 结果 |", "|---|---|---|",
  ...[...avoidLog.entries()].sort((a, b) => natural(a[0], b[0])).map(([k, v]) => { const [ek, id] = k.split("|"); return `| ${endingTitle.get(ek!)} | \`${id}\` | ${v.avoided ? `绕开了（第 ${v.tries} 次）` : `没绕开：试 ${v.tries} 次，${v.reached} 次走到本结局` } |`; }),
  "",
);
writeFileSync(join(ROOT, "docs", "convert-routes.md"), out.join("\n") + "\n", "utf8");
console.log(`走了 ${walks.length} 遍；${endings.map(e => `${e.title} ${byEnding(e.key).length}`).join("、")}；必经复核 ${avoidLog.size} 处，绕开 ${avoidLog.size - suspicious.length} 处`);
