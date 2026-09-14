import { test } from "node:test";
import assert from "node:assert/strict";
import type { Scene } from "../src/engine/types.ts";
import type { GameState } from "../src/engine/state.ts";
import { relationTiers, relationWord, closestThisChapter, RELATION_WORDS } from "../src/engine/relation.ts";

/**
 * 关系可见（D-154）：词只跟「专属闲场走进去过哪一档」走，不跟好感数走。
 * 最要守住的一条：好感跨过门槛、那场戏还没演，词不能变——变了玩家就能倒推门槛。
 */

const scene = (id: string, require: Scene["require"]): Scene => ({
  id, chapter: 1, act: 1, scene: "yeting", palette: "ink", cast: [], purpose: "测试用", require,
  lines: [{ id: `${id}.l1`, who: "narr", kind: "aside", text: "一句。" }],
} as Scene);

const scenes = [
  scene("a4", { "affinity.shen": { gte: 4 } }),
  scene("a8", { "affinity.shen": { gte: 8 } }),
  scene("a14", { "affinity.shen": { gte: 14 }, "flag.x": true }),
  scene("plain", { "stat.zhi": { gte: 3 } }),
];
const tiers = relationTiers(scenes);
const st = (affinity: Record<string, number>, seen: string[]): GameState =>
  ({ affinity, seenLineIds: new Set(seen) } as unknown as GameState);

test("专属闲场按门槛排成档，别的条件不算", () => {
  assert.deepEqual(tiers.byWho.get("shen"), [[4, ["a4"]], [8, ["a8"]], [14, ["a14"]]]);
  assert.equal(tiers.byWho.size, 1);
});

test("没来往：不显示；有来往：第一个词", () => {
  assert.equal(relationWord("shen", st({ shen: 0 }, []), tiers), null);
  assert.equal(relationWord("nobody", st({}, []), tiers), null);
  assert.equal(relationWord("shen", st({ shen: 1 }, []), tiers), RELATION_WORDS[0]);
});

test("好感跨过门槛、那场还没演：词不变（不能倒推门槛）", () => {
  assert.equal(relationWord("shen", st({ shen: 13 }, []), tiers), RELATION_WORDS[0]);
  assert.equal(relationWord("shen", st({ shen: 20 }, ["a4.l1"]), tiers), RELATION_WORDS[1]);
});

test("走进过哪一档就是哪一档；好感后来掉了也不退", () => {
  assert.equal(relationWord("shen", st({ shen: 9 }, ["a4.l1", "a8.l1"]), tiers), RELATION_WORDS[2]);
  assert.equal(relationWord("shen", st({ shen: 2 }, ["a4.l1", "a8.l1", "a14.l1"]), tiers), RELATION_WORDS[3]);
});

test("这一章和谁走得最近：涨得最多的那个；没人涨或并列不说", () => {
  assert.equal(closestThisChapter({ a: 3, b: 1 }, { a: 4, b: 5 }), "b");
  assert.equal(closestThisChapter({}, { a: 2 }), "a");
  assert.equal(closestThisChapter({ a: 3 }, { a: 3 }), null);
  assert.equal(closestThisChapter({ a: 0, b: 0 }, { a: 2, b: 2 }), null);
  assert.equal(closestThisChapter({ a: 5 }, { a: 2 }), null);
});
