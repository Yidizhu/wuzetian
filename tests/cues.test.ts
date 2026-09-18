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

test("声音桥 ①：进夜雨那一场起雨，进别的场收雨；换场也把空镜的风收掉", async () => {
  const { ambienceAt } = await import("../src/audio/soundscape.ts");
  assert.deepEqual(ambienceForScene(ambienceAt("ch03_s10_nvguan", "yeyu", 0)), [
    { kind: "loop", name: "rain_loop", on: true, level: 1 },
    { kind: "loop", name: "wind_loop", on: false },
  ], "三章 10 女冠观夜雨：回归对照，照旧进场就起");
  assert.deepEqual(ambienceForScene(ambienceAt("x", "gongyi", 0))[0], { kind: "loop", name: "rain_loop", on: false });
  assert.deepEqual(ambienceForScene(ambienceAt(undefined, undefined, 0))[0], { kind: "loop", name: "rain_loop", on: false });
});

test("D-226 场次音景：书阁听夜雨、抢湿纸、关窗细雨有雨；檐滴两场不铺雨；起止格号对得上剧本", async () => {
  const { ambienceAt, SCENE_SOUNDSCAPES, lineNo } = await import("../src/audio/soundscape.ts");
  const { readFileSync, readdirSync } = await import("node:fs");
  const find = (id: string) => {
    const ch = id.slice(0, 4);
    const f = readdirSync(new URL(`../src/data/chapters/${ch}/`, import.meta.url)).find((x) => x === `${id}.json`)!;
    return JSON.parse(readFileSync(new URL(`../src/data/chapters/${ch}/${f}`, import.meta.url), "utf8")) as { dressing?: string; lines: { id: string; text: string }[] };
  };
  // 书阁听夜雨（ch03-17）：布置不是夜雨，照样整场有雨；配乐退一半
  const s17 = find("ch03_s17_shuge");
  assert.notEqual(s17.dressing, "yeyu", "不是把书阁改成女冠观");
  assert.deepEqual(ambienceAt("ch03_s17_shuge", s17.dressing, 0), { rain: true, level: 1, bgmDuck: 0.5 });
  // 抢湿纸（ch01-11）：第 1 格还没下，第 2 格「雨忽然砸在檐口」起
  const s11 = find("ch01_s11_shishe");
  assert.ok(s11.lines.find((l) => lineNo(l.id) === 2)!.text.includes("雨忽然"));
  assert.equal(ambienceAt("ch01_s11_shishe", s11.dressing, 1).rain, false);
  assert.equal(ambienceAt("ch01_s11_shishe", s11.dressing, 2).rain, true);
  assert.equal(ambienceAt("ch01_s11_shishe", s11.dressing, 73).rain, true, "雨声薄下去，还在下");
  // 关窗细雨（ch01-17）：第 2 格起，比诗社小
  const s17a = find("ch01_s17_yeting");
  assert.ok(s17a.lines.find((l) => lineNo(l.id) === 2)!.text.includes("细雨"));
  const fine = ambienceAt("ch01_s17_yeting", s17a.dressing, 2);
  assert.ok(fine.rain && fine.level < 1);
  // 雨后檐滴：没有素材，不拿整场雨冒充
  for (const id of ["ch01_s12_shuge", "ch01_s18_zhaoyang"]) {
    assert.equal(ambienceAt(id, find(id).dressing, 99).rain, false, `${id} 是雨后檐滴，不铺雨`);
    assert.equal(SCENE_SOUNDSCAPES[id]!.loop, null);
    assert.ok(SCENE_SOUNDSCAPES[id]!.gap, "缺什么写明");
  }
  // 表里每一场都真的存在
  for (const id of Object.keys(SCENE_SOUNDSCAPES)) assert.ok(find(id), id);
  assert.equal(lineNo("ch01_s11_shishe.l12"), 12);
  assert.equal(lineNo(undefined), 0);
});

test("声音桥 ②：空镜那一格起风，下一格有人说话就收（序幕人还没上台的空镜也起）", () => {
  assert.deepEqual(cuesForShot("empty"), [{ kind: "loop", name: "wind_loop", on: true }]);
  assert.deepEqual(cuesForShot("narr"), [{ kind: "loop", name: "wind_loop", on: false }]);
  assert.deepEqual(cuesForShot("shenheng"), [{ kind: "loop", name: "wind_loop", on: false }]);
});

test("声音桥 ③：事件图、拆信一声纸响", () => {
  assert.deepEqual(cuesForPaper(), [{ kind: "hit", name: "paper_unfold" }]);
});

test("声音桥 ④：章首题记收起响一声，同一章不重复，下一章再响；D-209 默认远钟，开关给鼓就是鼓", () => {
  const st = newEpigraphCueState();
  assert.deepEqual(cuesAfterEpigraph(1, st), [{ kind: "hit", name: "bell_far" }]);
  assert.deepEqual(cuesAfterEpigraph(1, st), [], "读档回到题记前再看一遍，不再响");
  assert.deepEqual(cuesAfterEpigraph(2, st, "drum_far"), [{ kind: "hit", name: "drum_far" }]);
});

test("D-209 进声开关：网址优先并记下；没参数读记下的；坏的、没有的回默认（淡入＋远钟）", async () => {
  const { resolveTuning, TUNING_DEFAULTS } = await import("../src/audio/tuning.ts");
  assert.deepEqual(TUNING_DEFAULTS, { intro: "soft", epihit: "bell" });
  assert.deepEqual(resolveTuning("", null), { tuning: { intro: "soft", epihit: "bell" }, save: false });
  assert.deepEqual(resolveTuning("?epihit=drum", null), { tuning: { intro: "soft", epihit: "drum" }, save: true });
  assert.deepEqual(resolveTuning("", '{"intro":"plain","epihit":"drum"}').tuning, { intro: "plain", epihit: "drum" }, "记下的照用");
  assert.deepEqual(resolveTuning("?intro=soft", '{"intro":"plain","epihit":"drum"}').tuning, { intro: "soft", epihit: "drum" }, "网址只改它写的那一个");
  assert.deepEqual(resolveTuning("?intro=loud", "{坏的").tuning, TUNING_DEFAULTS, "认不得的值、坏的记录都回默认");
});

test("D-209 最静的一小节：找得到安静的那一段；比一窗还短的曲子从头起", async () => {
  const { quietestBar } = await import("../src/audio/bgm.ts");
  const sr = 1000;
  const c = new Float32Array(20 * sr).map((_, i) => Math.sin(i / 3) * (i >= 12 * sr && i < 15 * sr ? 0.01 : 0.5));
  const at = quietestBar([c], sr, [0, c.length]);
  assert.ok(at >= 12 && at <= 12.5, `静的那段在 12—15 秒，找到 ${at}`);
  assert.equal(quietestBar([c], sr, [0, 2 * sr]), 0);
  assert.equal(quietestBar([c], sr, [5 * sr, c.length]) + 5 >= 12, true, "span 起点之后算相对秒数");
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
