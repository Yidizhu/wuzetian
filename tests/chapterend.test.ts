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
