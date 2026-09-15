import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Letter as LetterSchema } from "../src/engine/schema.ts";
import { SOLAR_TERM_CHAPTER, SOLAR_TERM_LABEL, INBOX_UNREAD_MAX } from "../src/engine/types.ts";

/**
 * 节令信（D-184，B33）：按剧情时间投递，一章一封，这一章第一个闲场之后送到；
 * 不占未读上限三封、不会被截。真实日历那套不做。
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
const { Letters } = await import("../src/engine/letters.ts");

// 拿一封真信当底子，只换要紧的几项（D-098：别在测试里抄一份信的格式）
const base = JSON.parse(readFileSync(new URL("../src/data/letters/lt_ch02_shenheng_01.json", import.meta.url), "utf8"));
const solar = (id: string, term: string, extra: Record<string, unknown> = {}) => LetterSchema.parse({
  ...base, id, from: "wenqiao", delayMinutes: 5,
  trigger: { kind: "solarTerm", term, minAffinity: 4 },
  interceptable: false, interceptAt: undefined, onIntercept: undefined, ...extra,
});
const story = (id: string, extra: Record<string, unknown> = {}) => LetterSchema.parse({
  ...base, id, trigger: { kind: "scene", sceneId: "a", afterScenes: 1 }, delayMinutes: 5,
  interceptable: true, interceptAt: undefined, onIntercept: { goto: "s11" }, ...extra,
});
const scene = (chapter: number, weightless: boolean, id = "x") => ({ id, chapter, weightless });
const later = <T>(fn: () => T): T => {
  const real = Date.now;
  Date.now = () => real() + 3600_000;
  try { return fn(); } finally { Date.now = real; }
};

test("一章一封：上元→一章、寒食→二章、八月望夜→三章、重阳→四章", () => {
  assert.deepEqual(SOLAR_TERM_CHAPTER, { shangyuan: 1, hanshi: 2, zhongqiu: 3, chongyang: 4 });
  assert.equal(SOLAR_TERM_LABEL.zhongqiu, "八月望夜", "键不动，玩家看见的名字改了");
  assert.equal(SOLAR_TERM_LABEL.chongyang, "重阳");
});

test("这一章第一个闲场之后才送；别的章、正事那种场都不送", () => {
  const store = new Store();
  store.apply({ "affinity.wenqiao": 5 });
  const box = new Letters([solar("sh", "shangyuan"), solar("hs", "hanshi")], store);
  box.onSceneEnd(scene(1, false));
  assert.equal(store.state.letters.length, 0, "正事的场不送");
  box.onSceneEnd(scene(1, true));
  assert.deepEqual(store.state.letters.map((x) => x.id), ["sh"], "第一章的闲场只送上元那一封");
  assert.equal(store.state.letters[0]?.state, "pending");
  later(() => box.deliver());
  assert.equal(store.state.letters[0]?.state, "arrived");
  box.onSceneEnd(scene(1, true, "y"));
  assert.equal(store.state.letters.length, 1, "一章只送一封");
});

test("交情不到：等这一章下一个闲场；整章过完还不到，记作错过，不再送", () => {
  const store = new Store();
  const box = new Letters([solar("sh", "shangyuan")], store);
  box.onSceneEnd(scene(1, true));
  assert.equal(store.state.letters.length, 0, "好感不到就先不送");
  store.apply({ "affinity.wenqiao": 4 });
  box.onSceneEnd(scene(1, true, "y"));
  assert.equal(store.state.letters[0]?.state, "pending", "同一章下一个闲场补送");

  const cold = new Store();
  const box2 = new Letters([solar("sh", "shangyuan")], cold);
  box2.onSceneEnd(scene(1, true));
  box2.onSceneEnd(scene(2, true));
  assert.equal(cold.state.letters[0]?.state, "lost", "整章过完都不够，记作错过");
  cold.apply({ "affinity.wenqiao": 9 });
  box2.onSceneEnd(scene(2, true, "z"));
  assert.equal(cold.state.letters.length, 1, "错过就不再补");
});

test("不占未读上限、不会被截：案上攒着三封剧情信，节令信到了也不截谁", () => {
  const store = new Store();
  store.apply({ "affinity.wenqiao": 5 });
  const box = new Letters([story("l1"), story("l2"), story("l3"), solar("sh", "shangyuan")], store);
  box.onSceneEnd(scene(1, true, "a"));  // 三封剧情信触发（场次门 1），节令信也触发
  box.onSceneEnd(scene(1, true, "y"));  // 场次门过
  later(() => box.deliver());
  const states = Object.fromEntries(store.state.letters.map((x) => [x.id, x.state]));
  assert.equal(states.sh, "arrived");
  assert.equal(Object.values(states).filter((s) => s === "intercepted").length, 0, "三封剧情信＋一封节令信，不该截谁");
  assert.equal(store.state.letters.filter((x) => x.state === "arrived").length, INBOX_UNREAD_MAX + 1);
});

test("校验：节令信不许写成会被截的", () => {
  assert.ok(!LetterSchema.safeParse({ ...base, id: "x", trigger: { kind: "solarTerm", term: "shangyuan", minAffinity: 4 }, interceptable: true, interceptAt: "s11", onIntercept: { goto: "s11" } }).success);
  assert.ok(!LetterSchema.safeParse({ ...base, id: "x", trigger: { kind: "solarTerm", term: "qixi", minAffinity: 4 }, interceptable: false, interceptAt: undefined, onIntercept: undefined }).success, "七夕不用了");
});
