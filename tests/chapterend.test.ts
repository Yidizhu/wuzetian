import { test } from "node:test";
import assert from "node:assert/strict";
import { Scene as SceneSchema, Letter as LetterSchema } from "../src/engine/schema.ts";
import type { Scene } from "../src/engine/types.ts";

/**
 * 章末出口（D-034）与两条放宽的信件下限（R-006）。
 *
 * 这里用的是真的 Story，不是模拟：章末最容易出的问题是结算页出两遍、
 * 或者下一章不在的时候玩家停在一个点了没反应的画面上，
 * 这两件事只有把引擎跑起来才看得见。
 */

// 引擎只碰 document.documentElement.dataset.palette 和 localStorage，各给一个替身
const g = globalThis as unknown as Record<string, unknown>;
g.document ??= { documentElement: { dataset: {} } };
const mem = new Map<string, string>();
g.localStorage ??= {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
};

const { Store } = await import("../src/engine/state.ts");
const { Story } = await import("../src/engine/story.ts");

const scene = (id: string, chapter: number, extra: Partial<Scene>): Scene => ({
  id, chapter, act: 1, scene: "yeting", palette: "ink", cast: [],
  purpose: "测试用",
  lines: [{ id: `${id}.l1`, who: "narr", kind: "aside", text: "一句。" }],
  ...extra,
} as Scene);

const noopRenderer = { mount() {}, async load() {}, async show() {}, beat() {}, resize() {}, dispose() {} };

async function drain(): Promise<void> {
  for (let i = 0; i < 8; i++) await Promise.resolve();
}

/** 把一份场景表跑到底，返回结算页开了几次、收到了哪些事件 */
async function run(scenes: Scene[], start: string) {
  mem.clear();
  const store = new Store();
  const summaries: number[] = [];
  const kinds: string[] = [];
  const story = new Story(
    scenes, [], [], [], store, noopRenderer,
    { async duel() { return true; }, async chapterEnd(ch) { summaries.push(ch); } },
    start,
  );
  story.on((e) => kinds.push(e.kind));
  await story.start();
  for (let i = 0; i < 40; i++) {
    if (kinds.includes("toBeContinued") || kinds.includes("end") || kinds.includes("ending")) break;
    story.advance();
    await drain();
  }
  return { summaries, kinds };
}

test("下一章不存在：出一次结算页，然后明说下章待续", async () => {
  const scenes = [scene("a", 1, { chapterEnd: true, goto: "ch02_s01" })];
  const { summaries, kinds } = await run(scenes, "a");
  assert.deepEqual(summaries, [1], "结算页应当正好开一次");
  assert.ok(kinds.includes("toBeContinued"), `没有走到下章待续，事件是 ${kinds.join("、")}`);
  assert.ok(!kinds.includes("end"), "不该退到那句给程序员看的兜底话");
});

test("章末不写 goto 也收得住", async () => {
  const { summaries, kinds } = await run([scene("a", 1, { chapterEnd: true })], "a");
  assert.deepEqual(summaries, [1]);
  assert.ok(kinds.includes("toBeContinued"));
});

test("下一章存在：结算一次就接着走，不会连出两页", async () => {
  const scenes = [
    scene("a", 1, { chapterEnd: true, goto: "b" }),
    scene("b", 2, { goto: "b" }),      // 停在自己身上，跑够 40 步就结束
  ];
  const { summaries } = await run(scenes, "a");
  assert.deepEqual(summaries, [1], "章号变了会自动结算一次，章末标记又要结算一次——这里必须只有一次");
});

test("章末页翻过之后再点，不会把结算页再叫出来", async () => {
  mem.clear();
  const store = new Store();
  let opened = 0;
  const story = new Story(
    [scene("a", 1, { chapterEnd: true })], [], [], [], store, noopRenderer,
    { async duel() { return true; }, async chapterEnd() { opened += 1; } },
    "a",
  );
  await story.start();
  for (let i = 0; i < 10; i++) { story.advance(); await drain(); }
  assert.equal(opened, 1);
});

test("章末场不许既翻页又落幕", () => {
  const bad = { ...scene("a", 1, { chapterEnd: true }), judgeEnding: true };
  const r = SceneSchema.safeParse(bad);
  assert.ok(!r.success);
  assert.match(JSON.stringify(r.error?.issues), /翻页/);
});

test("章末是合法出口，光有它也不算死路", () => {
  assert.ok(SceneSchema.safeParse(scene("a", 1, { chapterEnd: true })).success);
  assert.ok(!SceneSchema.safeParse(scene("a", 1, {})).success, "什么出口都没有仍然要报错");
});

const letter = (over: Record<string, unknown>) => ({
  id: "lt_t", from: "shenheng",
  trigger: { kind: "scene", sceneId: "a", afterScenes: 2 },
  delayMinutes: 20, paper: "junzhong",
  body: { surface: "一行字。", blank: "没写的那句。" },
  replies: {
    plain: [1, 2, 3].map((i) => ({ id: `p${i}`, text: `回法${i}`, reaction: "她看了一眼。" })),
    poem: {
      resonantTags: ["边塞"],
      onResonant: { reaction: "她笑了。" },
      onMismatch: { reaction: "她没笑。" },
    },
    silence: { reaction: "她没等到。" },
  },
  ...over,
});

test("军中素笺可以隔一场就到，延迟可以短到五分钟（R-006）", () => {
  assert.ok(LetterSchema.safeParse(letter({ trigger: { kind: "scene", sceneId: "a", afterScenes: 1 }, delayMinutes: 5 })).success);
});

test("下限之下仍然拦：零场、四分钟都不行", () => {
  assert.ok(!LetterSchema.safeParse(letter({ trigger: { kind: "scene", sceneId: "a", afterScenes: 0 } })).success);
  assert.ok(!LetterSchema.safeParse(letter({ delayMinutes: 4 })).success);
});

/**
 * 未读上限：超了要截一封，但只截剧本安排好会被截的那种。
 * 没有 onIntercept 去向的信被截等于凭空消失——案上没有、剧情里也没有。
 */
const { Letters } = await import("../src/engine/letters.ts");

const mkLetter = (id: string, interceptable = false) => ({
  ...letter({}), id,
  interceptable,
  ...(interceptable ? { onIntercept: { goto: "hanyuan" } } : {}),
});

function deliverAll(defs: ReturnType<typeof mkLetter>[]) {
  mem.clear();
  const store = new Store();
  const box = new Letters(defs as never, store);
  const past = Date.now() - 60_000;
  for (const [i, d] of defs.entries()) {
    store.state.letters.push({ id: d.id, state: "pending", dueAt: past - (defs.length - i) * 1000, repliedWith: null, scenesLeft: 0 });
  }
  box.deliver();
  return store.state.letters.map((x) => `${x.id}:${x.state}`);
}

test("五封信一起到、没有一封写着会被截：一封都不丢，全留在案上", () => {
  const got = deliverAll(["a", "b", "c", "d", "e"].map((x) => mkLetter(x)));
  assert.equal(got.filter((x) => x.endsWith("arrived")).length, 5, `不该有信凭空消失，实际 ${got.join("、")}`);
});

test("有一封写着会被截：超上限时截的正是它", () => {
  const got = deliverAll([mkLetter("a"), mkLetter("b", true), mkLetter("c"), mkLetter("d")]);
  assert.ok(got.includes("b:intercepted"), `该截 b，实际 ${got.join("、")}`);
  assert.equal(got.filter((x) => x.endsWith("arrived")).length, 3);
});

/**
 * 旧档配新剧本（D-037 第 3 条）。
 * 存档存的是「哪一场、第几句」，剧本一改行数那个句号就指到别的话上去了。
 */
const saveApi = await import("../src/engine/save.ts");
const { DATA_VERSION } = await import("../src/engine/schema.ts");

/** 三场一章：a -> b -> c，a 是章首（没有同章场景指向它） */
const chapterScenes = (): Scene[] => [
  scene("ch01_b", 1, { goto: "ch01_c" }),
  scene("ch01_c", 1, { chapterEnd: true }),
  scene("ch01_a", 1, { goto: "ch01_b" }),
];

async function resumeFrom(dataVersion: number | undefined, sceneId: string, lineIndex: number) {
  mem.clear();
  const store = new Store();
  const s = saveApi.serialize(store.state, sceneId, lineIndex);
  if (dataVersion === undefined) delete (s as { dataVersion?: number }).dataVersion;
  else (s as { dataVersion?: number }).dataVersion = dataVersion;
  saveApi.write(saveApi.AUTO_SLOT, s);

  const kinds: string[] = [];
  const story = new Story(
    chapterScenes(), [], [], [], store, noopRenderer,
    { async duel() { return true; }, async chapterEnd() {} },
    "ch01_a",
  );
  story.on((e) => kinds.push(e.kind));
  await story.start();
  await drain();
  return { at: `${story.sceneId}#${story.lineIndex}`, kinds };
}

test("版本对得上：从存档那一句接着走", async () => {
  const r = await resumeFrom(DATA_VERSION, "ch01_b", 0);
  assert.equal(r.at, "ch01_b#0");
  assert.ok(!r.kinds.includes("rewound"));
});

test("版本对不上：退回本章开头，并且告诉她一声", async () => {
  const r = await resumeFrom(DATA_VERSION + 1, "ch01_b", 0);
  assert.equal(r.at, "ch01_a#0", "该退到章首 ch01_a");
  assert.ok(r.kinds.includes("rewound"), `没有告诉玩家，事件是 ${r.kinds.join("、")}`);
});

test("B8 之前的老档没有这个字段，一样按对不上处理", async () => {
  const r = await resumeFrom(undefined, "ch01_c", 0);
  assert.equal(r.at, "ch01_a#0");
});

test("章首认的是「没有同章场景指向它」，不是 id 最小", async () => {
  // ch01_a 排在数组最后、id 也不是最小的那个规则能认出来
  const r = await resumeFrom(0, "ch01_c", 0);
  assert.equal(r.at, "ch01_a#0");
});

test("退回去的只是位置：数值、好感、flag、诗一件不少", async () => {
  mem.clear();
  const store = new Store();
  store.state.stats.cai = 11;
  store.state.affinity.shenheng = 9;
  store.state.flags.trial_recopy = true;
  store.state.poemsCollected.add("wangwei_shanjuqiuming");
  const s = saveApi.serialize(store.state, "ch01_b", 3);
  (s as { dataVersion?: number }).dataVersion = DATA_VERSION + 1;
  saveApi.write(saveApi.AUTO_SLOT, s);

  const fresh = new Store();
  const story = new Story(
    chapterScenes(), [], [], [], fresh, noopRenderer,
    { async duel() { return true; }, async chapterEnd() {} },
    "ch01_a",
  );
  await story.start();
  await drain();
  assert.equal(story.sceneId, "ch01_a");
  assert.equal(fresh.state.stats.cai, 11);
  assert.equal(fresh.state.affinity.shenheng, 9);
  assert.equal(fresh.state.flags.trial_recopy, true);
  assert.ok(fresh.state.poemsCollected.has("wangwei_shanjuqiuming"));
});

/**
 * 墨层的覆盖面积 = 她的权力进度（D-010 第 3 条、CC3 待协调第 1 条）。
 */
const { inkLevel } = await import("../src/engine/ink.ts");

const withShi = (shi: number, flags: Record<string, boolean> = {}) => {
  const st = new Store().state;
  st.stats.shi = shi;
  Object.assign(st.flags, flags);
  return st;
};

test("幕数是地板：势再高也够不到下一幕的起点", () => {
  assert.ok(inkLevel(withShi(20), 1) < inkLevel(withShi(0), 2), "一幕满势不该比二幕零势还墨");
  assert.ok(inkLevel(withShi(20), 2) < inkLevel(withShi(0), 3), "二幕满势不该比三幕零势还墨");
});

test("第一幕朝廷全金碧：零势那一刻一点墨都没有", () => {
  assert.equal(inkLevel(withShi(0), 1), 0);
});

test("同一幕里，势越高墨越多", () => {
  assert.ok(inkLevel(withShi(12), 2) > inkLevel(withShi(2), 2));
});

test("登基那一场整片盖掉，不管势是多少", () => {
  assert.equal(inkLevel(withShi(0, { enthroned: true }), 1), 1);
});

test("永远落在 0 到 1 之间", () => {
  for (const act of [1, 2, 3, 4]) {
    for (const shi of [-5, 0, 7, 20, 99]) {
      const v = inkLevel(withShi(shi), act);
      assert.ok(v >= 0 && v <= 1, `幕${act} 势${shi} 算出 ${v}`);
    }
  }
});

/**
 * 固定截获点（D-039 第 2 条）。走进那一场，信当场被截，不看真实延迟也不看未读数。
 */
function interceptRun(letterOver: Record<string, unknown>, path: string[], preset?: (box: InstanceType<typeof Letters>, store: InstanceType<typeof Store>) => void) {
  mem.clear();
  const store = new Store();
  const defs = [letter({ id: "lt_x", interceptable: true, interceptAt: "ch02_s11", onIntercept: { goto: "ch02_s11" }, ...letterOver })];
  const scenes = path.map((id, i) => scene(id, 2, i + 1 < path.length ? { goto: path[i + 1]! } : { chapterEnd: true }));
  const story = new Story(
    scenes, [], [], defs as never, store, noopRenderer,
    { async duel() { return true; }, async chapterEnd() {} },
    path[0]!,
  );
  preset?.(story.letters, store);
  return { story, store };
}

test("信还在路上，走到截获点也照样被截", async () => {
  const { story, store } = interceptRun({}, ["ch02_s10", "ch02_s11"]);
  await story.start();
  for (let i = 0; i < 20; i++) { story.advance(); await drain(); }
  const slot = store.state.letters.find((x) => x.id === "lt_x");
  assert.equal(slot?.state, "intercepted", `实际 ${JSON.stringify(store.state.letters)}`);
  assert.equal(story.sceneId, "ch02_s11", "被截去向就是这一场本身，不该绕出去");
});

test("已经回过的信不再被截：话说完了那一幕就不该发生", async () => {
  const { story, store } = interceptRun({}, ["ch02_s10", "ch02_s11"], (_box, st) => {
    st.state.letters.push({ id: "lt_x", state: "replied", dueAt: 1, repliedWith: "plainA", scenesLeft: 0 });
  });
  await story.start();
  for (let i = 0; i < 20; i++) { story.advance(); await drain(); }
  assert.equal(store.state.letters.find((x) => x.id === "lt_x")?.state, "replied");
});

test("没走到那一场就不截", async () => {
  const { story, store } = interceptRun({}, ["ch02_s10"]);
  await story.start();
  for (let i = 0; i < 20; i++) { story.advance(); await drain(); }
  assert.notEqual(store.state.letters.find((x) => x.id === "lt_x")?.state, "intercepted");
});

test("被截去向指向别处时，玩家被带过去", async () => {
  const { story } = interceptRun(
    { onIntercept: { goto: "ch02_s12" } },
    ["ch02_s10", "ch02_s11", "ch02_s12"],
  );
  await story.start();
  for (let i = 0; i < 6; i++) { story.advance(); await drain(); }
  assert.equal(story.sceneId, "ch02_s12");
});

test("写了截获场景却没写被截去向，schema 拦下来", () => {
  const bad = letter({ interceptable: true, interceptAt: "ch02_s11" });
  assert.ok(!LetterSchema.safeParse(bad).success);
});

test("写了截获场景但「会被截」填否，schema 也拦：两处不能打架", () => {
  const bad = letter({ interceptable: false, interceptAt: "ch02_s11", onIntercept: { goto: "ch02_s11" } });
  assert.ok(!LetterSchema.safeParse(bad).success);
});

test("章末与去向并存（D-039 第 1 条）：先结算，再进下一章", async () => {
  const scenes = [
    scene("ch01_last", 1, { chapterEnd: true, goto: "ch02_first" }),
    scene("ch02_first", 2, { goto: "ch02_first" }),
  ];
  mem.clear();
  const store = new Store();
  const seen: number[] = [];
  const story = new Story(
    scenes, [], [], [], store, noopRenderer,
    { async duel() { return true; }, async chapterEnd(ch) { seen.push(ch); } },
    "ch01_last",
  );
  await story.start();
  for (let i = 0; i < 10; i++) { story.advance(); await drain(); }
  assert.deepEqual(seen, [1], "结算页只该开一次");
  assert.equal(story.sceneId, "ch02_first", "翻过结算页要真的进第二章");
});

/**
 * D-043 / D-044 / D-045 / D-046 的四处 schema 变动。
 */
test("D-045 柳承欢进了冻结角色表，其余十个一个没少", async () => {
  const { CHARACTER_KEYS } = await import("../src/engine/schema.ts");
  assert.ok(CHARACTER_KEYS.includes("liuchenghuan" as never));
  for (const k of ["wuze", "shenheng", "peizhaoye", "wenqiao", "liqinghe",
                   "songhuizhen", "hetaihou", "xujinghe", "tangjian", "adi"]) {
    assert.ok(CHARACTER_KEYS.includes(k as never), `${k} 不该消失——冻结的意思是不改，不是不加`);
  }
});

test("D-043 章末场可以带选项，选项去向可以空", () => {
  const s = {
    ...scene("ch02_s24", 2, { chapterEnd: true, goto: "ch03_s01" }),
    choices: [{ id: "a", text: "留她一会儿", effects: { xin: 1 } },
              { id: "b", text: "让她走", goto: "ch03_s01" }],
  };
  const r = SceneSchema.safeParse(s);
  assert.ok(r.success, JSON.stringify(r.success ? "" : r.error.issues));
});

test("不是章末的场，选项去向仍然不许空——那是死路", () => {
  const s = { ...scene("x", 2, {}), choices: [{ id: "a", text: "走" }] };
  const r = SceneSchema.safeParse(s);
  assert.ok(!r.success);
  assert.match(JSON.stringify(r.error?.issues), /章末/);
});

test("章末场里选空去向的选项：效果照算，然后进结算页", async () => {
  mkChapterEndChoice: {
    mem.clear();
    const store = new Store();
    const seen: number[] = [];
    const s = {
      ...scene("ch02_s24", 2, { chapterEnd: true }),
      choices: [{ id: "stay", text: "留她一会儿", effects: { xin: 2 } }],
    } as unknown as Scene;
    const story = new Story(
      [s], [], [], [], store, noopRenderer,
      { async duel() { return true; }, async chapterEnd(ch) { seen.push(ch); } },
      "ch02_s24",
    );
    const kinds: string[] = [];
    story.on((e) => kinds.push(e.kind));
    await story.start();
    for (let i = 0; i < 6; i++) { story.advance(); await drain(); }
    await story.choose("stay");
    await drain();
    assert.equal(store.state.stats.xin, 5, "选项的效果要照算（开局 3 加 2）");
    assert.deepEqual(seen, [2], "然后才出结算页");
    assert.ok(kinds.includes("toBeContinued"));
    break mkChapterEndChoice;
  }
});

test("D-046 场景布置是自由字符串，传给美术层", async () => {
  const s = scene("x", 2, { goto: "x", dressing: "gongyi" });
  assert.ok(SceneSchema.safeParse(s).success);
  mem.clear();
  const got: (string | undefined)[] = [];
  const store = new Store();
  const story = new Story(
    [s], [], [], [], store,
    { ...noopRenderer, async show(d: { dressing?: string }) { got.push(d.dressing); } },
    { async duel() { return true; }, async chapterEnd() {} },
    "x",
  );
  await story.start();
  await drain();
  assert.deepEqual(got, ["gongyi"]);
});

test("D-044 附页按 flag 各取一段，宣读那一列默认是「会」", async () => {
  const { pagesFor, readAloudPages } = await import("../src/engine/letters.ts");
  const parsed = LetterSchema.parse(letter({
    body: {
      surface: "一行字。",
      blank: "没写的那句。",
      pages: [
        { key: "p1", text: "公共的一段。" },
        { key: "p2", when: { "flag.took_seal": true }, text: "只有拿了印的人看得到。" },
        { key: "p3", text: "尚未宣读的末句。", readAloud: false },
      ],
    },
  }));
  const st = new Store().state;
  assert.deepEqual(pagesFor(parsed, st).map((p) => p.key), ["p1", "p3"]);
  st.flags.took_seal = true;
  assert.deepEqual(pagesFor(parsed, st).map((p) => p.key), ["p1", "p2", "p3"]);
  // 被截宣读时，填「否」的那一段留了下来——这是整封信的戏眼
  assert.deepEqual(readAloudPages(parsed, st), ["公共的一段。", "只有拿了印的人看得到。"]);
});

test("D-044 没有附页的信照常能用：老信一封都不用改", () => {
  assert.ok(LetterSchema.safeParse(letter({})).success);
});

/**
 * 题记（D-063）。连着的几句收成一张纸，不进对话框；看纸的时候按回车不叠出第二张。
 */
test("连着的题记收成一张纸，纸看完才接着往下读旁白", async () => {
  mem.clear();
  const store = new Store();
  const sheets: string[][] = [];
  const lines: string[] = [];
  let release: (() => void) | null = null;
  const s = scene("ch01_s00", 1, { goto: "ch01_s00" });
  s.lines = [
    { id: "t1", who: "tiji", kind: "aside", text: "女皇临朝十四年。" },
    { id: "t2", who: "tiji", kind: "aside", text: "长安，秋末。" },
    { id: "n1", who: "narr", kind: "aside", text: "门还没开。" },
  ] as Scene["lines"];
  const story = new Story(
    [s], [], [], [], store, noopRenderer,
    {
      async duel() { return true; },
      async chapterEnd() {},
      epigraph: (ls) => new Promise<void>((r) => { sheets.push(ls); release = r; }),
    },
    "ch01_s00",
  );
  story.on((e) => { if (e.kind === "line") lines.push(e.text); });
  await story.start();
  await drain();
  assert.deepEqual(sheets, [["女皇临朝十四年。", "长安，秋末。"]], "两句题记该是一张纸");
  assert.deepEqual(lines, [], "纸还在屏幕上，对话框里不该有字");

  // 看纸的时候按回车（advance），不该叠出第二张，也不该偷偷往下走
  story.advance(); story.advance();
  await drain();
  assert.equal(sheets.length, 1);

  release!();
  await drain();
  assert.deepEqual(lines, ["门还没开。"], "纸收起来之后才读到旁白");
});

test("无头工具不画纸：没有 epigraph 钩子时题记直接跳过", async () => {
  mem.clear();
  const store = new Store();
  const lines: string[] = [];
  const s = scene("x", 1, { goto: "x" });
  s.lines = [
    { id: "t1", who: "tiji", kind: "aside", text: "一行题记。" },
    { id: "n1", who: "narr", kind: "aside", text: "旁白。" },
  ] as Scene["lines"];
  const story = new Story([s], [], [], [], store, noopRenderer,
    { async duel() { return true; }, async chapterEnd() {} }, "x");
  story.on((e) => { if (e.kind === "line") lines.push(e.text); });
  await story.start();
  await drain();
  assert.deepEqual(lines, ["旁白。"]);
});

/**
 * D-076：序幕三段。题记只有纸 → 纸收起、墨晕开、景出来，人还没来 → 有人叫她，她进画面。
 */
test("D-076 从题记开始的场：纸收起之前景不显，人等到那一句才上台", async () => {
  mem.clear();
  const { ENTRANCES } = await import("../src/engine/entrances.ts");
  const store = new Store();
  const log: string[] = [];
  let release: (() => void) | null = null;
  const s = scene("ch01_s00_zhaoyang", 1, { goto: "ch01_s00_zhaoyang", cast: ["wuze"] as Scene["cast"] });
  s.lines = [
    { id: "ch01_s00_zhaoyang.l1", who: "tiji", kind: "aside", text: "题记。" },
    { id: "ch01_s00_zhaoyang.l2", who: "narr", kind: "aside", text: "空景。" },
    { id: "ch01_s00_zhaoyang.l3", who: "narr", kind: "aside", text: "叫名字。" },
  ] as Scene["lines"];
  const saved = ENTRANCES.ch01_s00_zhaoyang;
  (ENTRANCES as Record<string, string>).ch01_s00_zhaoyang = "ch01_s00_zhaoyang.l3";
  try {
    const renderer = { ...noopRenderer, async show() { log.push("show"); } };
    const story = new Story([s], [], [], [], store, renderer,
      {
        async duel() { return true; }, async chapterEnd() {},
        epigraph: () => new Promise<void>((r) => { log.push("纸"); release = r; }),
      }, "ch01_s00_zhaoyang");
    story.on((e) => {
      if (e.kind === "scene") log.push(e.castHeld ? "台空" : "台上有人");
      if (e.kind === "castEnter") log.push(`上台:${e.cast.join()}`);
      if (e.kind === "line") log.push(e.text);
    });
    await story.start();
    await drain();
    assert.deepEqual(log, ["台空", "纸"], "纸在屏幕上的时候景不该先显出来");
    release!();
    await drain();
    assert.deepEqual(log, ["台空", "纸", "show", "空景。"], "纸收起来先墨晕开，景出来，人还没来");
    story.advance();
    await drain();
    assert.deepEqual(log.slice(4), ["上台:wuze", "叫名字。"], "人在那一句之前上台");
  } finally {
    (ENTRANCES as Record<string, string>).ch01_s00_zhaoyang = saved;
  }
});

test("D-076 默认不变：不从题记开始的场一进来就显景，读档读在上台那句之后人就在", async () => {
  mem.clear();
  const store = new Store();
  const log: string[] = [];
  const s = scene("ch01_s00_zhaoyang", 1, { goto: "ch01_s00_zhaoyang", cast: ["wuze"] as Scene["cast"] });
  s.lines = Array.from({ length: 9 }, (_, i) => ({ id: `ch01_s00_zhaoyang.l${i + 1}`, who: "narr", kind: "aside", text: `第${i + 1}句` })) as Scene["lines"];
  const renderer = { ...noopRenderer, async show() { log.push("show"); } };
  const story = new Story([s], [], [], [], store, renderer,
    { async duel() { return true; }, async chapterEnd() {} }, "ch01_s00_zhaoyang");
  story.on((e) => { if (e.kind === "scene") log.push(e.castHeld ? "台空" : "台上有人"); });
  // 真的序幕表：l7 上台。从第 8 句（下标 7）接着读，人该已经在
  await (story as unknown as { enter(id: string, i: number): Promise<void> }).enter("ch01_s00_zhaoyang", 7);
  await drain();
  assert.deepEqual(log, ["show", "台上有人"]);
});

test("D-067 无字碑的印只在「无字之碑」结局卡那一刻由引擎盖上，别的结局不盖", async () => {
  for (const [key, want] of [["wuzibei", ["", "yin"]], ["weijing", [""]]] as const) {
    mem.clear();
    const store = new Store();
    const dress: string[] = [];
    const renderer = { ...noopRenderer, setDressing(d: string) { dress.push(d); } };
    const s = scene("ch04_s18_wuzibei", 4, { scene: "wuzibei" as Scene["scene"], judgeEnding: true });
    const endings = [{ key, title: "t", require: {}, palette: "ink", theme: "t", body: "b" }];
    const story = new Story([s], endings as never, [], [], store, renderer,
      { async duel() { return true; }, async chapterEnd() {} }, "ch04_s18_wuzibei");
    let ended = "";
    story.on((e) => { if (e.kind === "ending") ended = e.ending.key; });
    await story.start();
    story.advance();
    await drain();
    assert.equal(ended, key);
    assert.deepEqual(dress, want, `${key}：进场时不盖，结局卡出来才${want.length > 1 ? "盖" : "也不盖"}`);
  }
});

test("D-084 结局两拍：先画面，点一下才出正文；落幕之后再点不会再出一遍", async () => {
  mem.clear();
  const store = new Store();
  const log: string[] = [];
  let release: (() => void) | null = null;
  const renderer = { ...noopRenderer, setDressing(d: string) { if (d) log.push(`布置:${d}`); } };
  const s = scene("ch04_s18_wuzibei", 4, { scene: "wuzibei" as Scene["scene"], judgeEnding: true });
  const endings = [{ key: "wuzibei", title: "无字之碑", require: {}, palette: "ink", theme: "t", body: "正文" }];
  const story = new Story([s], endings as never, [], [], store, renderer,
    {
      async duel() { return true; }, async chapterEnd() {},
      endingPicture: () => new Promise<void>((r) => { log.push("画面"); release = r; }),
    }, "ch04_s18_wuzibei");
  story.on((e) => { if (e.kind === "ending") log.push(`正文:${e.body}`); });
  await story.start();
  story.advance();                       // 读完最后一句
  await drain();
  assert.deepEqual(log, ["布置:yin", "画面"], "第一拍：印已经盖上，正文还没出");
  story.advance(); story.advance();      // 看画面时连点，不算
  await drain();
  assert.deepEqual(log, ["布置:yin", "画面"]);
  release!();
  await drain();
  assert.deepEqual(log, ["布置:yin", "画面", "正文:正文"]);
  story.advance(); story.advance();      // 原来每点一下结局就再出一遍
  await drain();
  assert.equal(log.filter((x) => x.startsWith("正文")).length, 1, "落幕之后再点，结局不该再出");
});

test("D-084 无头工具没有第一拍：直接出正文，也只出一次", async () => {
  mem.clear();
  const store = new Store();
  let n = 0;
  const s = scene("end", 4, { judgeEnding: true });
  const endings = [{ key: "k", title: "t", require: {}, palette: "ink", theme: "t", body: "b" }];
  const story = new Story([s], endings as never, [], [], store, noopRenderer,
    { async duel() { return true; }, async chapterEnd() {} }, "end");
  story.on((e) => { if (e.kind === "ending") n++; });
  await story.start();
  for (let i = 0; i < 4; i++) { story.advance(); await drain(); }
  assert.equal(n, 1);
});

test("D-091、D-105 袍色跟身份 flag 走，只有青与绯；图没到位就退回原图", async () => {
  const { protagonistRank, spriteCandidates, IDENTITY_RANKS } = await import("../src/engine/identity.ts");
  const ctx = (has: (f: string) => boolean, dressing = "") => ({ has, dressing });
  const none = () => false;
  const enthroned = (f: string) => f === "enthroned";
  assert.equal(protagonistRank(none), "qing", "什么都没有是青");
  assert.equal(protagonistRank((f) => f === "liqinghe_won" || f === "declined_crown"), "qing", "落选、辞受都还是青");
  assert.equal(protagonistRank(enthroned), "fei");
  assert.ok(IDENTITY_RANKS.every((r) => r.rank === "fei"), "D-105：没有绿");
  assert.equal(protagonistRank((f) => f === "ch03_accept_offer"), "qing", "D-205：答了受位、图还没铺开，仍是青");
  assert.equal(protagonistRank((f) => f === "ch03_accept_offer", (k) => k === "wuze_shouwei"), "fei", "D-205：受位那张图铺开过，换绯");
  assert.equal(protagonistRank(none, (k) => k === "wuze_shouwei"), "qing", "光看过图、没受位不算");
  assert.deepEqual(spriteCandidates("wuze", "open", ctx(enthroned)), ["wuze_open_fei", "wuze_open"]);
  assert.deepEqual(spriteCandidates("shenheng", "open", ctx(enthroned)), ["shenheng_open"], "别人不跟主角的身份换图");
  assert.deepEqual(spriteCandidates("liuchenghuan", "default", ctx((f) => f === "chenghuan_returned")),
    ["liuchenghuan_default_bare", "liuchenghuan_default"]);
});

test("D-205 ch03-12 受位支：绯以图为铰链——第 12 格青，wuze_shouwei 那一格之后绯；拒位支全程青", async () => {
  const { rasterCandidates } = await import("../src/engine/identity.ts");
  const { readFileSync } = await import("node:fs");
  const s = JSON.parse(readFileSync(new URL("../src/data/chapters/ch03/ch03_s12_hanyuan.json", import.meta.url), "utf8"));
  type L = { id: string; who: string; text: string; when?: Record<string, unknown>; image?: string };
  const lines: L[] = s.lines;
  // 受位那张图：旧稿是一格独立事件图，C52 起是某一格的「画面」（D-223）。两种都认
  const hasHinge = (l: L) => (l.who === "cg" && l.text === "wuze_shouwei") || l.image === "wuze_shouwei";
  const at = lines.findIndex(hasHinge);
  assert.ok(at > 0, "受位那张图在这一场");
  assert.deepEqual(lines[at]!.when, { "flag.ch03_accept_offer": true }, "图格只在受位支出现");
  assert.equal(lines.find((l) => l.id === "ch03_s12_hanyuan.l12")?.text.includes("赭黄"), true, "第 12 格是女史捧来赭黄那一格");
  const accept = (f: string) => f === "ch03_accept_offer";
  // 受位支逐格走：图格之前（含第 12 格）青，图铺开过之后绯
  const seen = new Set<string>();
  const dressing = s.dressing ?? "";
  lines.forEach((l, i) => {
    if (l.when && !accept(Object.keys(l.when)[0]!.replace("flag.", ""))) return;
    const pick = rasterCandidates("wuze", { has: accept, dressing, seen: (k) => seen.has(k) })[0];
    assert.equal(pick, i <= at ? "wuze_default" : "wuze_default_fei", `受位支第 ${i + 1} 格`);
    if (hasHinge(l)) seen.add("wuze_shouwei");
  });
  assert.equal(seen.has("wuze_shouwei"), true);
  // 拒位支：没有 ch03_accept_offer，那张图也走不到，全程青
  for (const l of lines) {
    if (l.when?.["flag.ch03_accept_offer"]) continue;
    assert.equal(rasterCandidates("wuze", { has: (f) => f === "ch03_decline_offer", dressing, seen: () => false })[0], "wuze_default", `拒位支 ${l.id}`);
  }
});

test("D-095、D-108 光栅立绘：一套一个中性表情；李令仪公议受位穿紫；有选项全身、其余膝上", async () => {
  const { rasterCandidates } = await import("../src/engine/identity.ts");
  const { RasterCatalog, framingFor } = await import("../src/scene/raster.ts");
  const none = () => false;
  assert.deepEqual(rasterCandidates("liqinghe", { has: none, dressing: "gongyi" }), ["liqinghe_default_zi", "liqinghe_default"]);
  assert.deepEqual(rasterCandidates("liqinghe", { has: none, dressing: "kaike" }), ["liqinghe_default"], "日常布置是郁金");
  assert.deepEqual(rasterCandidates("wuze", { has: (f) => f === "enthroned", dressing: "" }), ["wuze_default_fei", "wuze_default"]);

  // 清单为空：谁都不用光栅图——B17 交付时游戏和 B16 一模一样
  assert.equal(RasterCatalog.empty().pickPortrait(["wuze_default"]), null);
  // 绯那张还没到：用青那张，不回 SVG
  const cat = new RasterCatalog({ full: ["wuze_default", "shenheng_default"], knee: ["wuze_default"], scenes: ["yeting_ink"] }, "/");
  assert.equal(cat.pickPortrait(["wuze_default_fei", "wuze_default"]), "wuze_default");
  assert.equal(cat.pickPortrait(["peizhaoye_default"]), null, "没图的人继续是 SVG");
  assert.deepEqual(cat.portraitUrl("wuze_default", "knee"), { url: "/char/knee/wuze_default.webp", framing: "knee" });
  assert.deepEqual(cat.portraitUrl("shenheng_default", "knee"), { url: "/char/full/shenheng_default.webp", framing: "full" }, "膝上没出就用全身");
  // 读坏过的图不再选
  cat.markBroken("char/wuze_default");
  assert.equal(cat.pickPortrait(["wuze_default"]), null);
  assert.equal(framingFor("choices"), "full");
  assert.equal(framingFor("line"), "knee");
});

test("B17 背景表：键是「地点_色板_布置」，剧本里用到的每种组合表里都有", async () => {
  const { backdropKey, BACKDROPS } = await import("../src/scene/backdrops.ts");
  assert.equal(backdropKey({ key: "hanyuan", palette: "gold", dressing: "gongyi" }), "hanyuan_gold_gongyi");
  assert.equal(backdropKey({ key: "yuanye", palette: "ink" }), "yuanye_ink");
  assert.ok(BACKDROPS.yuanye_ink?.night, "原野是夜场，套滤镜（D-107）");
});

test("D-124 未读攒满截走了有固定截获点的信：不跳场，走到截获场才当众展开", async () => {
  const { Letters } = await import("../src/engine/letters.ts");
  const store = new Store();
  const { readFileSync } = await import("node:fs");
  // 拿一封真信当底子，只换 id、触发与截获的几项：别在测试里抄一份信的格式（D-098）
  const base = JSON.parse(readFileSync(new URL("../src/data/letters/lt_ch02_shenheng_01.json", import.meta.url), "utf8"));
  const mk = (id: string, extra: Record<string, unknown> = {}) => LetterSchema.parse({
    ...base, id, trigger: { kind: "scene", sceneId: "a", afterScenes: 1 }, delayMinutes: 5,
    interceptable: false, interceptAt: undefined, onIntercept: undefined, ...extra,
  });
  const fixed = mk("fixed", { interceptable: true, interceptAt: "s11", onIntercept: { goto: "s11" } });
  const inbox = new Letters([mk("l1"), mk("l2"), mk("l3"), fixed], store);
  inbox.onSceneEnd("a");                                  // 四封一起触发
  inbox.onSceneEnd("b");                                  // 再过完一场，时间门开始走（B46：「之后第 1 场」）
  const realNow = Date.now;
  Date.now = () => realNow() + 3600_000;                  // 一小时后回来：四封一起到，超过上限 3
  try { inbox.deliver(); } finally { Date.now = realNow; }
  assert.equal(store.state.letters.find((x) => x.id === "fixed")?.state, "intercepted", "被截的是剧本允许截的那封");
  assert.equal(inbox.pendingIntercept(), null, "有固定截获点的信，不当场跳过去");
  assert.equal(inbox.forceInterceptAt("s11")?.id, "fixed", "走到截获场才接住它");
});

test("B28 换场时送到案上的信，onSceneEnd 要报出来（原来写死空数组，烟测因此一封信都没拆过）", async () => {
  const { Letters } = await import("../src/engine/letters.ts");
  const store = new Store();
  const { readFileSync } = await import("node:fs");
  const base = JSON.parse(readFileSync(new URL("../src/data/letters/lt_ch02_shenheng_01.json", import.meta.url), "utf8"));
  const inbox = new Letters([LetterSchema.parse({
    ...base, id: "l1", trigger: { kind: "scene", sceneId: "a", afterScenes: 1 }, delayMinutes: 5,
    interceptable: false, interceptAt: undefined, onIntercept: undefined,
  })], store);
  assert.deepEqual(inbox.onSceneEnd("a"), [], "刚触发");
  assert.deepEqual(inbox.onSceneEnd("b"), [], "之后第 1 场过完：时间门才开始走（B46）");
  const realNow = Date.now;
  Date.now = () => realNow() + 3600_000;
  try { assert.deepEqual(inbox.onSceneEnd("c"), ["l1"], "一小时后换场，这一下送到的信要报出来"); } finally { Date.now = realNow; }
});

test("B23 事件图：铺图时推进不算；第一次才算解锁；没有图就当这一格不存在", async () => {
  const mk = () => {
    const s = scene("x", 1, { goto: "x" });
    s.lines = [
      { id: "a", who: "narr", kind: "aside", text: "她看见马。" },
      { id: "c", who: "cg", kind: "aside", text: "peizhaoye_xunma" },
      { id: "b", who: "narr", kind: "aside", text: "没说出口的那一句。" },
    ] as Scene["lines"];
    return s;
  };
  // 有图
  mem.clear();
  let store = new Store();
  const calls: [string, boolean][] = [];
  let release: ((v: boolean) => void) | null = null;
  const lines: string[] = [];
  let story = new Story([mk()], [], [], [], store, noopRenderer, {
    async duel() { return true; }, async chapterEnd() {},
    cg: (key, first) => new Promise<boolean>((r) => { calls.push([key, first]); release = r; }),
  }, "x");
  story.on((e) => { if (e.kind === "line") lines.push(e.text); });
  await story.start(); await drain();
  story.advance(); await drain();                  // 读完第一句 → 事件图那一格
  assert.deepEqual(calls, [["peizhaoye_xunma", true]], "第一次看，first 为真");
  assert.deepEqual(lines, ["她看见马。"], "事件图那一句不进对话框");
  story.advance(); story.advance(); await drain(); // 看图时连点不算
  assert.deepEqual(lines, ["她看见马。"]);
  release!(true); await drain();
  assert.deepEqual(lines, ["她看见马。", "没说出口的那一句。"]);
  assert.ok(store.state.cgsSeen.has("peizhaoye_xunma"), "解锁记进状态");

  // 没有图：钩子返回 false，直接读下一句，也不记解锁
  mem.clear();
  store = new Store();
  const lines2: string[] = [];
  story = new Story([mk()], [], [], [], store, noopRenderer, {
    async duel() { return true; }, async chapterEnd() {}, cg: async () => false,
  }, "x");
  story.on((e) => { if (e.kind === "line") lines2.push(e.text); });
  await story.start(); await drain();
  story.advance(); await drain();
  assert.deepEqual(lines2, ["她看见马。", "没说出口的那一句。"]);
  assert.equal(store.state.cgsSeen.size, 0);
});

test("题记是合法的说话人，地点多了驿路（D-062、D-063）", () => {
  const s = scene("x", 4, { goto: "x", scene: "yilu" as Scene["scene"] });
  s.lines = [{ id: "t", who: "tiji", kind: "aside", text: "一行。" }] as Scene["lines"];
  const r = SceneSchema.safeParse(s);
  assert.ok(r.success, JSON.stringify(r.success ? "" : r.error.issues));
});

/**
 * D-065 契盟门槛降到 8、14；D-066 第四幕。
 */
test("D-065 档位下限和门槛是同一个数：进了契档专属场，结算页不能还写「识」", async () => {
  const { affinityBand } = await import("../src/engine/types.ts");
  assert.equal(affinityBand(3), "疏");
  assert.equal(affinityBand(4), "识");     // D-078
  assert.equal(affinityBand(7), "识");
  assert.equal(affinityBand(8), "契");
  assert.equal(affinityBand(13), "契");
  assert.equal(affinityBand(14), "盟");
});

test("D-066 第四幕合法，墨层整片是墨，势多少都一样", () => {
  assert.ok(SceneSchema.safeParse(scene("x", 4, { goto: "x", act: 4 })).success);
  assert.ok(!SceneSchema.safeParse(scene("x", 4, { goto: "x", act: 5 })).success);
  for (const shi of [0, 10, 20]) assert.equal(inkLevel(withShi(shi), 4), 1);
});


test("B42 柳承欢归还朱绳后换 _bare 能落到光栅图上：图到了就用，没到用底那一套，不回 SVG", async () => {
  const { rasterCandidates } = await import("../src/engine/identity.ts");
  const { RasterCatalog } = await import("../src/scene/raster.ts");
  const { readFileSync } = await import("node:fs");
  // 剧本里写真这个 flag 的是 ch03-15 出口那个选项，下一场进场时对一遍台上的人（main.ts 的 refresh）
  const s = JSON.parse(readFileSync(new URL("../src/data/chapters/ch03/ch03_s15_yeting.json", import.meta.url), "utf8"));
  assert.equal(s.choices.some((c: { effects?: Record<string, unknown> }) => c.effects?.["flag.chenghuan_returned"] === true), true);
  const returned = { has: (f: string) => f === "chenghuan_returned", dressing: "" };
  const before = { has: () => false, dressing: "" };
  assert.deepEqual(rasterCandidates("liuchenghuan", returned), ["liuchenghuan_default_bare", "liuchenghuan_default"]);
  const withBare = new RasterCatalog({ full: ["liuchenghuan_default", "liuchenghuan_default_bare"], knee: ["liuchenghuan_default", "liuchenghuan_default_bare"], scenes: [] }, "/");
  const withoutBare = new RasterCatalog({ full: ["liuchenghuan_default"], knee: ["liuchenghuan_default"], scenes: [] }, "/");
  assert.equal(withBare.pickPortrait(rasterCandidates("liuchenghuan", returned)), "liuchenghuan_default_bare", "C42 的图上线后：直接用");
  assert.equal(withBare.pickPortrait(rasterCandidates("liuchenghuan", before)), "liuchenghuan_default", "归还之前：原图");
  assert.equal(withoutBare.pickPortrait(rasterCandidates("liuchenghuan", returned)), "liuchenghuan_default", "现在（图没到）：底那一套");
  assert.equal(withBare.portraitUrl("liuchenghuan_default_bare", "knee").url, "/char/knee/liuchenghuan_default_bare.webp");
});

test("D-225 承欢告白信的接口：常笺、ch02-26 后第 1 场＋5 分钟、不可截；六种回法都不动数值和 flag，晚读不盖掉归还", async () => {
  const { Letters } = await import("../src/engine/letters.ts");
  const { readFileSync } = await import("node:fs");
  const base = JSON.parse(readFileSync(new URL("../src/data/letters/lt_ch02_shenheng_01.json", import.meta.url), "utf8"));
  const noEffects = (o: { reaction: string }) => ({ reaction: o.reaction });
  // 照 C52 要写的样子造一封：from、纸、触发、延迟、不可截，回信只留反应
  const letter = LetterSchema.parse({
    ...base, id: "lt_ch02_liuchenghuan_01", from: "liuchenghuan", paper: "chang",
    trigger: { kind: "scene", sceneId: "ch02_s26_shuge", afterScenes: 1 }, delayMinutes: 5,
    interceptable: false, interceptAt: undefined, onIntercept: undefined, sheMayNotReply: undefined,
    replies: {
      plain: base.replies.plain.map((p: { id: string; text: string; reaction: string }) => ({ id: p.id, text: p.text, reaction: p.reaction })),
      poem: { resonantTags: base.replies.poem.resonantTags, onResonant: noEffects(base.replies.poem.onResonant), onMismatch: noEffects(base.replies.poem.onMismatch) },
      silence: noEffects(base.replies.silence),
    },
  });
  assert.equal(letter.interceptable, false);
  for (const kind of ["plainA", "plainB", "plainC", "poemResonant", "poemMismatch", "silence"] as const) {
    const store = new Store();
    store.state.flags.chenghuan_returned = true;       // 晚读：归还已经发生过了
    store.state.affinity.liuchenghuan = 4;
    const before = JSON.stringify({ a: store.state.affinity, f: store.state.flags, r: store.state.relation });
    const inbox = new Letters([letter], store);
    assert.deepEqual(inbox.onSceneEnd("ch02_s26_shuge"), [], "近坐那一场结束：触发，还没到");
    const realNow = Date.now;
    // CC2 D32 的复现：不再过一场、光等五分钟，**不该**到
    Date.now = () => realNow() + 5 * 60_000 + 1000;
    try { assert.deepEqual(inbox.deliver(), [], "只过了五分钟、还没过完之后那一场：不到"); } finally { Date.now = realNow; }
    assert.deepEqual(inbox.onSceneEnd("ch03_s01_shuge"), [], "之后第 1 场过完：五分钟从这时起算");
    Date.now = () => realNow() + 4 * 60_000;
    try { assert.deepEqual(inbox.deliver(), [], "那一场之后才四分钟：还不到"); } finally { Date.now = realNow; }
    Date.now = () => realNow() + 5 * 60_000 + 1000;
    try { assert.deepEqual(inbox.deliver(), ["lt_ch02_liuchenghuan_01"], "之后第 1 场＋五分钟：到"); } finally { Date.now = realNow; }
    const r = inbox.reply("lt_ch02_liuchenghuan_01", kind, kind === "poemResonant" ? letter.replies.poem.resonantTags : []);
    assert.ok(r?.reaction, `${kind}：有她的反应`);
    assert.equal(r?.goto, undefined, `${kind}：不跳场`);
    assert.equal(JSON.stringify({ a: store.state.affinity, f: store.state.flags, r: store.state.relation }), before, `${kind}：数值、flag、关系一样没动`);
  }
});

test("D-238 主线收诗：读到那一格就收，不用赢对诗；重复读不再收也不再提示；条件没满足的格不收", async () => {
  mem.clear();
  const s = scene("p1", 2, { goto: "p2" });
  s.lines = [
    { id: "p1.l1", who: "narr", kind: "aside", text: "她把诗念了一遍。", poem: "xuetao_chan" },
    { id: "p1.l2", who: "narr", kind: "aside", text: "没念出来的那一首。", when: { "flag.never": true }, poem: "xuetao_chishangshuangniao" },
    { id: "p1.l3", who: "narr", kind: "aside", text: "她收了纸。" },
  ] as Scene["lines"];
  const s2 = scene("p2", 2, { goto: "p1" });
  s2.lines = [{ id: "p2.l1", who: "narr", kind: "aside", text: "回来又读了一遍。", poem: "xuetao_chan" }] as Scene["lines"];
  const store = new Store();
  const got: string[] = [];
  const story = new Story([s, s2], [], [], [], store, noopRenderer, { async duel() { return true; }, async chapterEnd() {} }, "p1");
  story.on((e) => { if (e.kind === "poem") got.push(e.id); });
  await story.start(); await drain();
  assert.deepEqual(got, ["xuetao_chan"], "读到就收，提示一次");
  assert.equal(store.state.poemChapter.xuetao_chan, 2, "记下是第二章收的");
  for (let i = 0; i < 4; i++) { story.advance(); await drain(); }   // 走完这一场、进下一场再读一遍
  assert.deepEqual(got, ["xuetao_chan"], "再读到同一首：不再提示");
  assert.equal(store.state.poemsCollected.has("xuetao_chishangshuangniao"), false, "条件没满足的那一格不收");
  assert.deepEqual([...store.state.poemsCollected], ["xuetao_chan"]);
});

test("D-238 章末「本章所得」从存档算，读档回来不丢；老档没有归属就不算，不编造", async () => {
  const { serialize, deserialize } = await import("../src/engine/save.ts");
  mem.clear();
  const store = new Store();
  store.state.poemsCollected = new Set(["xuetao_chan", "xuetao_chishangshuangniao"]);
  store.state.poemChapter = { xuetao_chan: 2 };
  const round = deserialize(serialize(store.state, "p1", 0));
  assert.deepEqual(round.state.poemChapter, { xuetao_chan: 2 }, "收诗归属进存档");
  assert.equal(round.state.poemsCollected.has("xuetao_chishangshuangniao"), true, "老档收过的诗还在收藏里");
  // 章末统计：只算记了归属的那一首
  const old = JSON.parse(JSON.stringify(serialize(store.state, "p1", 0))) as Record<string, unknown>;
  delete old.poemChapter;                                     // 老档：没有这一份
  assert.deepEqual(deserialize(old as never).state.poemChapter, {}, "老档按空算");
});

test("D-239 旧信队列提速：分钟数改短了在路上的信跟着提前；不重等、不延后；场次门没过和已到的不动", async () => {
  const { Letters } = await import("../src/engine/letters.ts");
  const { readFileSync } = await import("node:fs");
  const base = JSON.parse(readFileSync(new URL("../src/data/letters/lt_ch02_shenheng_01.json", import.meta.url), "utf8"));
  const mk = (id: string, minutes: number) => LetterSchema.parse({
    ...base, id, trigger: { kind: "scene", sceneId: "a", afterScenes: 1 }, delayMinutes: minutes,
    interceptable: false, interceptAt: undefined, onIntercept: undefined,
  });
  const now = Date.now();
  const store = new Store();
  store.state.letters = [
    { id: "old", state: "pending", dueAt: now + 26 * 60_000, repliedWith: null },                       // 老档：等 26 分钟，没记开始时刻
    { id: "soon", state: "pending", dueAt: now + 60_000, repliedWith: null },                           // 老档：只剩 1 分钟
    { id: "known", state: "pending", dueAt: now + 20 * 60_000, startedAt: now - 60_000, repliedWith: null }, // 记了开始时刻
    { id: "gate", state: "pending", dueAt: 0, scenesLeft: 2, repliedWith: null },                       // 场次门还没过
    { id: "here", state: "arrived", dueAt: now - 1000, repliedWith: null },
  ];
  // 新数据：都改成 5 分钟
  const inbox = new Letters([mk("old", 5), mk("soon", 5), mk("known", 5), mk("gate", 5), mk("here", 5)], store);
  inbox.deliver();
  const at = (id: string) => store.state.letters.find((x) => x.id === id)!;
  assert.ok(at("old").dueAt <= now + 5 * 60_000 + 1000 && at("old").dueAt > now, "老档长队列缩到最多再等新分钟数，不是从头重等");
  assert.equal(at("soon").dueAt, now + 60_000, "剩得比新分钟数还短：不动，不会被推后");
  assert.equal(at("known").dueAt, now - 60_000 + 5 * 60_000, "记了开始时刻：开始时刻＋新分钟数");
  assert.equal(at("gate").dueAt, 0, "场次门还没过：不动");
  assert.equal(at("here").state, "arrived", "已经到案上的不动");
  // 分钟数改长：在路上的那封不跟着延长
  const store2 = new Store();
  store2.state.letters = [{ id: "x", state: "pending", dueAt: now + 5 * 60_000, startedAt: now, repliedWith: null }];
  new Letters([mk("x", 30)], store2).deliver();
  assert.equal(store2.state.letters[0]!.dueAt, now + 5 * 60_000, "改长不延长剩余");
});
