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

// ------------------------------------------------------------ 声音桥（D-198，B36）：只四条

import {
  SFX_NAMES, ambienceForScene, cuesForShot, cuesForPaper, cuesAfterEpigraph, newEpigraphCueState, sourceFor,
} from "../src/audio/cues.ts";

test("声音桥 ①：进夜雨那一场起雨，进别的场收雨；换场也把空镜的风收掉", () => {
  assert.deepEqual(ambienceForScene("yeyu"), [
    { kind: "loop", name: "rain_loop", on: true },
    { kind: "loop", name: "wind_loop", on: false },
  ]);
  assert.deepEqual(ambienceForScene("gongyi")[0], { kind: "loop", name: "rain_loop", on: false });
  assert.deepEqual(ambienceForScene(undefined)[0], { kind: "loop", name: "rain_loop", on: false });
});

test("声音桥 ②：空镜那一格起风，下一格有人说话就收（序幕人还没上台的空镜也起）", () => {
  assert.deepEqual(cuesForShot("empty"), [{ kind: "loop", name: "wind_loop", on: true }]);
  assert.deepEqual(cuesForShot("narr"), [{ kind: "loop", name: "wind_loop", on: false }]);
  assert.deepEqual(cuesForShot("shenheng"), [{ kind: "loop", name: "wind_loop", on: false }]);
});

test("声音桥 ③：事件图、拆信一声纸响", () => {
  assert.deepEqual(cuesForPaper(), [{ kind: "hit", name: "paper_unfold" }]);
});

test("声音桥 ④：章首题记转对白敲一通鼓，同一章不重复，下一章再敲", () => {
  const st = newEpigraphCueState();
  assert.deepEqual(cuesAfterEpigraph(1, st), [{ kind: "hit", name: "drum_far" }]);
  assert.deepEqual(cuesAfterEpigraph(1, st), [], "读档回到题记前再看一遍，不再敲");
  assert.deepEqual(cuesAfterEpigraph(2, st), [{ kind: "hit", name: "drum_far" }]);
});

test("文件没到不报错：真文件 → 合成 → 静音", () => {
  const none = new Set<string>();
  assert.equal(sourceFor("rain_loop", new Set(["rain_loop"])), "file");
  assert.equal(sourceFor("rain_loop", none), "synth", "雨、风、纸、鼓合成那层顶得上");
  assert.equal(sourceFor("drum_far", none), "synth");
  assert.equal(sourceFor("steps_hall", none), "silent", "合成没有的就静音");
  assert.equal(SFX_NAMES.length, 8, "文件名照 D-198 那张表，八条");
});

// ------------------------------------------------------------ D-202（B37）：四条之外的落点

import { cuesForCg, cuesForEndingCg, cuesForEnter, newEnterCueState, cuesForEnding } from "../src/audio/cues.ts";
import { CGS } from "../src/scene/cgs.ts";

test("D-202 事件图铺开：表里写了衣料／马铃用它，没写纸响，风物图不响，表里没有不响", () => {
  assert.deepEqual(cuesForCg(CGS.wuze_shouwei), [{ kind: "hit", name: "cloth_rustle" }]);
  assert.deepEqual(cuesForCg(CGS.peizhaoye_1_xunma), [{ kind: "hit", name: "horse_bell" }]);
  assert.deepEqual(cuesForCg(CGS.liqinghe_2_diye), [{ kind: "hit", name: "paper_unfold" }]);
  assert.deepEqual(cuesForCg(CGS.wu_chaipai), [], "风物不是纸，也不是动作");
  assert.deepEqual(cuesForCg(undefined), []);
  // 落点照 D-202 一张不多一张不少
  const rustle = Object.keys(CGS).filter((k) => CGS[k]!.sfx === "cloth_rustle").sort();
  assert.deepEqual(rustle, ["peizhaoye_2_dangfeng", "peizhaoye_3_woshou", "shenheng_4_bingzuo", "wuze_juwei", "wuze_shouwei"]);
  const bell = Object.keys(CGS).filter((k) => CGS[k]!.sfx === "horse_bell").sort();
  assert.deepEqual(bell, ["ending_guanshanyouxin", "peizhaoye_1_xunma"]);
});

test("D-202 结局图：只有表里写明的响（关山有信马铃），别的结局图不响纸", () => {
  assert.deepEqual(cuesForEndingCg(CGS.ending_guanshanyouxin), [{ kind: "hit", name: "horse_bell" }]);
  assert.deepEqual(cuesForEndingCg(CGS.ending_wuzibei), []);
});

test("D-202 进受位那一场：空殿脚步一次；同一场再来一次不重复；别的布置不响", () => {
  const st = newEnterCueState();
  assert.deepEqual(cuesForEnter({ id: "ch03_s12_hanyuan", dressing: "shouwei" }, st), [{ kind: "hit", name: "steps_hall" }]);
  assert.deepEqual(cuesForEnter({ id: "ch03_s12_hanyuan", dressing: "shouwei" }, st), []);
  assert.deepEqual(cuesForEnter({ id: "ch03_s11_hanyuan", dressing: "gongyi" }, st), []);
});

test("D-202 规则 ⑤：结局卡淡到无声之前一声钟", () => {
  assert.deepEqual(cuesForEnding(), [{ kind: "hit", name: "bell_far" }]);
});
