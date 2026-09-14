import { test } from "node:test";
import assert from "node:assert/strict";
import { Scene as SceneSchema, Condition as ConditionSchema, Effects as EffectsSchema } from "../src/engine/schema.ts";
import type { Scene } from "../src/engine/types.ts";

/**
 * 当前关系状态（B27，engine/pact.ts）。按 C35《第四章选择时刻完整稿》交接清单里要逐条走的路写：
 * 单人、裴＋温知情、全停、未交代、已被叫停、晚拆的旧信。
 */

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
const { meets } = await import("../src/engine/conditions.ts");
const { readRelation } = await import("../src/engine/pact.ts");
const save = await import("../src/engine/save.ts");

const quiet = <T>(fn: () => T): T => {
  const w = console.warn, i = console.info;
  console.warn = () => {}; console.info = () => {};
  try { return fn(); } finally { console.warn = w; console.info = i; }
};

const r = (store: InstanceType<typeof Store>, key: string) => readRelation(key, store.state);

/** 四份私约都有效的开局 */
function fourPacts() {
  const store = new Store();
  store.apply({ "pact.shenheng": "active", "pact.peizhaoye": "active", "pact.wenqiao": "active", "pact.liqinghe": "active" });
  return store;
}

test("单人：其余三份说停之后她答 only，才算双方相爱", () => {
  const store = fourPacts();
  store.apply({ intent: "only", "asked.shenheng": true });
  assert.equal(r(store, "pacts.active"), 4);
  // 还没说停就先答了 only：不算（「都说清了」必须对应实际谈话）
  store.apply({ "answer.shenheng": "only" });
  assert.equal(r(store, "love.shenheng"), false);
  // 规则 2：说停别人会清掉她先前的答复，要重新问
  store.apply({ "pact.peizhaoye": "ended", "pact.wenqiao": "ended", "pact.liqinghe": "ended" });
  assert.equal(r(store, "answer.shenheng"), "none");
  store.apply({ "told.shenheng": true, "answer.shenheng": "only" });
  assert.equal(r(store, "love.shenheng"), true);
  assert.equal(r(store, "pacts.love"), 1);
  assert.equal(r(store, "pacts.active"), 1);
});

test("裴＋温知情：沈、李不愿意；李一拒，裴温要重新确认一次", () => {
  const store = fourPacts();
  store.apply({ intent: "open", "asked.shenheng": true, "asked.peizhaoye": true, "asked.wenqiao": true, "asked.liqinghe": true });
  // 沈：不愿意 → 规则 1 私约变她说停
  store.apply({ "told.shenheng": true, "answer.shenheng": "no" });
  assert.equal(r(store, "pact.shenheng"), "declined");
  store.apply({ "told.peizhaoye": true, "answer.peizhaoye": "open" });
  store.apply({ "told.wenqiao": true, "answer.wenqiao": "open" });
  assert.equal(r(store, "pacts.love"), 2);
  // 李：不愿意 → 李的私约变了，裴温听到的名单过时了（规则 2）
  store.apply({ "told.liqinghe": true, "answer.liqinghe": "no" });
  assert.equal(r(store, "told.peizhaoye"), false);
  assert.equal(r(store, "answer.wenqiao"), "none");
  assert.equal(r(store, "pacts.love"), 0);
  // 名单复核：回到裴、温面前说清最后的事实
  store.apply({ "told.peizhaoye": true, "answer.peizhaoye": "open", "told.wenqiao": true, "answer.wenqiao": "open" });
  assert.equal(r(store, "love.peizhaoye"), true);
  assert.equal(r(store, "love.wenqiao"), true);
  assert.equal(r(store, "love.liqinghe"), false);
  assert.equal(r(store, "pacts.active"), 2);
});

test("全停：独自过一阵，谁都不算相爱，公事不受影响", () => {
  const store = fourPacts();
  store.apply({ intent: "solo", "pact.shenheng": "ended", "pact.peizhaoye": "ended", "pact.wenqiao": "ended", "pact.liqinghe": "ended" });
  assert.equal(r(store, "pacts.active"), 0);
  assert.equal(r(store, "pacts.love"), 0);
  assert.deepEqual(store.state.flags, {}, "关系谈话不碰任何 flag");
});

test("还没说完：她答 wait，不算相爱", () => {
  const store = fourPacts();
  store.apply({ intent: "only", "asked.peizhaoye": true, "answer.peizhaoye": "wait" });
  assert.equal(r(store, "love.peizhaoye"), false);
  assert.ok(meets({ "answer.peizhaoye": "wait" }, store.state));
});

test("条件：其中之一、不是其中之一、计数", () => {
  const store = fourPacts();
  store.apply({ "pact.shenheng": "declined", "pact.liqinghe": "paused" });
  const s = store.state;
  assert.ok(meets({ "pact.liqinghe": { in: ["active", "paused"] } }, s));
  assert.ok(!meets({ "pact.shenheng": { not: ["declined", "none"] } }, s));
  assert.ok(meets({ "pacts.active": { gte: 2 } }, s));
  assert.ok(meets({ "told.wenqiao": false }, s), "没写过的布尔按假");
  assert.ok(meets({ intent: "none" }, s), "没写过的枚举按 none");
});

test("晚拆的旧信：不冲掉后来的暂停，不把她说停的重新打开，不能替人答复", () => {
  const store = new Store();
  const rev0 = store.state.relation.clock;               // 第二章的信在这时触发
  quiet(() => store.apply({ "pact.liqinghe": "active" })); // 第三章当面约了
  quiet(() => store.apply({ "pact.liqinghe": "paused" }));  // 当面说先别约
  quiet(() => store.apply({ "pact.liqinghe": "active" }, { letterRev: rev0 }));
  assert.equal(r(store, "pact.liqinghe"), "paused", "旧信触发在暂停之前，拆得晚也不能冲掉");
  const rev2 = store.state.relation.clock;
  quiet(() => store.apply({ "pact.liqinghe": "active" }, { letterRev: rev2 }));
  assert.equal(r(store, "pact.liqinghe"), "paused", "暂缓只能由新的当面谈话打开");
  quiet(() => store.apply({ "pact.wenqiao": "active" }, { letterRev: rev2 }));
  assert.equal(r(store, "pact.wenqiao"), "active", "从没有过私约，回信可以开");
  quiet(() => store.apply({ "answer.wenqiao": "open", "told.wenqiao": true }, { letterRev: rev2 }));
  assert.equal(r(store, "answer.wenqiao"), "none", "答复要当面说");
  quiet(() => store.apply({ "pact.wenqiao": "paused" }, { letterRev: store.state.relation.clock }));
  assert.equal(r(store, "pact.wenqiao"), "paused", "回信可以把有效的私约停下");
});

test("存档来回一趟，关系状态和时钟都在；老档没有这一栏按谁都没有私约", () => {
  const store = fourPacts();
  store.apply({ "answer.shenheng": "no", intent: "open" });
  const back = save.deserialize(JSON.parse(JSON.stringify(save.serialize(store.state, "x", 0)))).state;
  assert.equal(readRelation("pact.shenheng", back), "declined");
  assert.equal(readRelation("intent", back), "open");
  assert.equal(back.relation.clock, store.state.relation.clock);
  const old = save.serialize(store.state, "x", 0) as unknown as Record<string, unknown>;
  delete old.relation;
  const fromOld = save.deserialize(old as never).state;
  assert.equal(readRelation("pacts.active", fromOld), 0);
});

test("校验：值写错、人写错、派生键写进效果，都拦", () => {
  assert.ok(ConditionSchema.safeParse({ "pact.shenheng": "active", "pacts.active": { gte: 2 }, "love.wenqiao": true }).success);
  assert.ok(!ConditionSchema.safeParse({ "pact.shenheng": "alive" }).success, "没有这个值");
  assert.ok(!ConditionSchema.safeParse({ "pact.liuchenghuan": "active" }).success, "柳承欢不进这张表");
  assert.ok(!ConditionSchema.safeParse({ "flag.x": "active" }).success, "flag 不能按字符串比");
  assert.ok(!ConditionSchema.safeParse({ "told.shenheng": "yes" }).success);
  assert.ok(EffectsSchema.safeParse({ "pact.shenheng": "ended", "told.shenheng": true, intent: "solo" }).success);
  assert.ok(!EffectsSchema.safeParse({ "love.shenheng": true }).success, "相爱是算出来的，不能直接写");
  assert.ok(!EffectsSchema.safeParse({ "pact.shenheng": { in: ["ended"] } }).success);
});

// ------------------------------------------------------------ 接进 Story：自动去向、不显示的选项

const scene = (id: string, extra: Partial<Scene>): Scene => ({
  id, chapter: 4, act: 4, scene: "yeting", palette: "ink", cast: [], purpose: "测试用",
  lines: [{ id: `${id}.l1`, who: "narr", kind: "aside", text: "一句。" }],
  ...extra,
} as Scene);
const noopRenderer = { mount() {}, async load() {}, async show() {}, beat() {}, resize() {}, dispose() {} };
const drain = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

async function play(scenes: Scene[], store: InstanceType<typeof Store>) {
  mem.clear();
  const seen: string[] = [];
  let menu: string[] = [];
  const story = new Story(scenes, [], [], [], store, noopRenderer, { async duel() { return true; }, async chapterEnd() {} }, scenes[0]!.id);
  story.on((e) => {
    if (e.kind === "scene") seen.push(e.scene.id);
    if (e.kind === "choices") menu = e.items.map((x) => x.choice.id);
  });
  await story.start();
  for (let i = 0; i < 12; i++) { story.advance(); await drain(); }
  return { seen, menu };
}

test("菜单：没有私约的人、已经说停的人，不显示（不是灰）", async () => {
  const store = new Store();
  store.apply({ "pact.shenheng": "active", "pact.peizhaoye": "declined" });
  const open = { not: ["none", "declined"] };
  const { menu } = await play([
    scene("menu", { choices: [
      { id: "menu.cA", text: "去见沈衡", require: { "pact.shenheng": open }, goto: "x", irreversible: false },
      { id: "menu.cB", text: "去见裴照夜", require: { "pact.peizhaoye": open }, goto: "x", irreversible: false },
      { id: "menu.cC", text: "去见温荞", require: { "pact.wenqiao": open }, goto: "x", irreversible: false },
      { id: "menu.cF", text: "先停私约", goto: "x", irreversible: false },
    ] }),
    scene("x", { goto: "x" }),
  ], store);
  assert.deepEqual(menu, ["menu.cA", "menu.cF"]);
});

test("自动去向：谈完按更早的选择回到原来那条路；都不满足走 goto", async () => {
  const exits = (flag: boolean) => {
    const store = new Store();
    if (flag) store.apply({ "flag.founded_school": true });
    return play([
      scene("talk", { branches: [{ require: { "flag.founded_school": true }, goto: "school" }], goto: "road" }),
      scene("school", { goto: "school" }),
      scene("road", { goto: "road" }),
    ], store);
  };
  assert.deepEqual((await exits(true)).seen.slice(0, 2), ["talk", "school"]);
  assert.deepEqual((await exits(false)).seen.slice(0, 2), ["talk", "road"]);
});

test("自动去向写死路、和选项并存，校验拦", () => {
  const dead = scene("a", { branches: [{ require: { "flag.x": true }, goto: "b" }] });
  assert.ok(!SceneSchema.safeParse(dead).success);
  const both = scene("a", { branches: [{ goto: "b" }], choices: [{ id: "a.cA", text: "走", goto: "b", irreversible: false }] });
  assert.ok(!SceneSchema.safeParse(both).success);
  assert.ok(SceneSchema.safeParse(scene("a", { branches: [{ require: { "love.shenheng": true }, goto: "b" }, { goto: "c" }] })).success);
});
