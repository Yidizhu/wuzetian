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

test("题记是合法的说话人，地点多了驿路（D-062、D-063）", () => {
  const s = scene("x", 4, { goto: "x", scene: "yilu" as Scene["scene"] });
  s.lines = [{ id: "t", who: "tiji", kind: "aside", text: "一行。" }] as Scene["lines"];
  const r = SceneSchema.safeParse(s);
  assert.ok(r.success, JSON.stringify(r.success ? "" : r.error.issues));
});

