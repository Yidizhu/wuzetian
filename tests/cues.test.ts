import { test } from "node:test";
import assert from "node:assert/strict";
import { cuesForScene, cuesForLine, newCueState, DRUM_GAP_MS } from "../src/audio/cues.ts";

/**
 * 环境声什么时候响（D-053）。规则很少，每一条都要守住——
 * 敲错一通鼓比没有鼓更出戏。
 */

const drums = (cs: { kind: string }[]) => cs.filter((c) => c.kind === "drum").length;

test("开局第一场敲一通街鼓：入宫那天听见的第一声是坊门的鼓", () => {
  const st = newCueState();
  assert.equal(drums(cuesForScene({ id: "a", act: 1 }, st, 0)), 1);
});

test("同一幕里换场不敲，换幕才敲", () => {
  const st = newCueState();
  cuesForScene({ id: "a", act: 1 }, st, 0);
  assert.equal(drums(cuesForScene({ id: "b", act: 1 }, st, 60_000)), 0, "同一幕不该再敲");
  assert.equal(drums(cuesForScene({ id: "c", act: 2 }, st, 120_000)), 1, "换幕要敲");
});

test("旁白写到鼓就敲；台词和内心里的「鼓」不算", () => {
  const st = newCueState();
  assert.equal(drums(cuesForLine("narr", "aside", "街鼓第三通。", st, 0)), 1);
  assert.equal(drums(cuesForLine("shenheng", "say", "你听见鼓了么？", st, 60_000)), 0);
  assert.equal(drums(cuesForLine("self", "inner", "（鼓声还没停。）", st, 120_000)), 0);
});

test("旁白连着几句写鼓，只敲一通", () => {
  const st = newCueState();
  cuesForLine("narr", "aside", "鼓响了。", st, 0);
  assert.equal(drums(cuesForLine("narr", "aside", "鼓又响了。", st, DRUM_GAP_MS - 1)), 0);
  assert.equal(drums(cuesForLine("narr", "aside", "鼓停了。", st, DRUM_GAP_MS + 1)), 1);
});

test("雨只跟着夜雨布置走，不跟着「雨」字走——「雨停了」里也有雨", () => {
  const st = newCueState();
  const rain = (d?: string) => cuesForScene({ id: "x", act: 3, dressing: d }, st, 0).find((c) => c.kind === "rain") as { on: boolean };
  assert.equal(rain("yeyu").on, true);
  assert.equal(rain("gongyi").on, false);
  assert.equal(rain(undefined).on, false, "离开夜雨那一场，雨要停");
});
