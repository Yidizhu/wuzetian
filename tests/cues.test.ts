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

test("D-229 图铺开：默认不响；只有写了 sfx 的双人图响；写景、物件、单人、群像都不响纸", () => {
  assert.deepEqual(cuesForCg(CGS.wuze_shouwei), [{ kind: "hit", name: "cloth_rustle" }], "双人、写了衣料");
  assert.deepEqual(cuesForCg(CGS.peizhaoye_1_xunma), [], "单人（马也没戴铃）：不响");
  assert.deepEqual(cuesForCg(CGS.liqinghe_2_diye), [], "没写 sfx：原来是纸响，现在不响");
  assert.deepEqual(cuesForCg(CGS.wu_chaipai), [], "风物");
  assert.deepEqual(cuesForCg(CGS.wu_shangsi_liuquan), [], "E39 新写景");
  assert.deepEqual(cuesForCg({ beat: "关系", who: ["a", "b", "c"], sfx: "cloth_rustle" }), [], "群像：写了也不响");
  assert.deepEqual(cuesForCg({ beat: "关系", who: ["a"], sfx: "cloth_rustle" }), [], "单人：写了也不响");
  assert.deepEqual(cuesForCg(undefined), []);
  // 会响的一张不多一张不少：D-202 那五张衣料（都是双人）；E39 新登记的一行都没写 sfx，等 CC3 E40 列名单
  const sounding = Object.keys(CGS).filter((k) => !CGS[k]!.ending && cuesForCg(CGS[k]).length).sort();   // 结局图走结局卡自己那条（cuesForEndingCg）
  assert.deepEqual(sounding, ["peizhaoye_2_dangfeng", "peizhaoye_3_woshou", "shenheng_4_bingzuo", "wuze_juwei", "wuze_shouwei"]);
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

test("D-231 约会配乐：十三场整场约会＋承欢近坐一段；锚点在正式数据里找得到；说停、拒绝、公务不放", async () => {
  const { DATE_SEGMENTS, dateTrackAt, dateTrackUrl, letterTrack, DATE_TRACKS } = await import("../src/audio/datemusic.ts");
  const { readFileSync, readdirSync, existsSync } = await import("node:fs");
  const load = (id: string) => {
    const dir = new URL(`../src/data/chapters/${id.slice(0, 4)}/`, import.meta.url);
    return JSON.parse(readFileSync(new URL(`${id}.json`, dir), "utf8")) as { id: string; cast: string[]; lines: { id: string; text: string }[] };
  };
  for (const seg of DATE_SEGMENTS) {
    const s = load(seg.scene);
    assert.ok(s.cast.includes(seg.track), `${seg.scene} 的阵容里有 ${seg.track}`);
    if (seg.from) assert.ok(s.lines.some((l) => l.text.includes(seg.from!)), `${seg.scene} 找得到起句「${seg.from}」`);
    if (seg.until) assert.ok(s.lines.some((l) => l.text.includes(seg.until!)), `${seg.scene} 找得到止句「${seg.until}」`);
  }
  // 五首都有成品
  for (const t of DATE_TRACKS) assert.ok(existsSync(new URL(`../public/${dateTrackUrl(t)}`, import.meta.url)), `public/${dateTrackUrl(t)}`);
  // 整场约会：进场那一刻就起，到场末
  const s17 = load("ch03_s17_shuge");
  assert.equal(dateTrackAt("ch03_s17_shuge", s17.lines, -1), "shenheng");
  assert.equal(dateTrackAt("ch03_s17_shuge", s17.lines, s17.lines.length - 1), "shenheng");
  // 承欢：她坐过来之前是章曲，从那一句起是她的
  const s26 = load("ch02_s26_shuge");
  const sit = s26.lines.findIndex((l) => l.text.includes("她坐过来"));
  assert.equal(dateTrackAt("ch02_s26_shuge", s26.lines, sit - 1), null);
  assert.equal(dateTrackAt("ch02_s26_shuge", s26.lines, sit), "liuchenghuan");
  // 说停私约四场、听答复、分开、公务：不放约会曲（E39 第 5 节）
  for (const id of ["ch04_s05ca_shuge", "ch04_s05cb_yuanye", "ch04_s05cc_shishe", "ch04_s05cd_yuanye", "ch03_s09a_yuanye", "ch03_s09c_yuanye", "ch01_s08_shuge", "ch03_s12_hanyuan"]) {
    const s = load(id);
    assert.equal(s.lines.every((_, i) => dateTrackAt(id, s.lines, i) === null), true, `${id} 不放约会曲`);
  }
  assert.equal(dateTrackAt(undefined, [], 0), null);
  // 锚点落空（稿改了）：这一段当不存在，不猜
  assert.equal(dateTrackAt("ch02_s26_shuge", [{ text: "改过的稿" }], 0), null);
  // 多人场里的私人段（B46 后半）：带 love.<人>=true 的句子放那个人的曲；love=false、公务句不放
  const z = load("ch04_s05z_yeting") as unknown as { lines: { id: string; text: string; when?: Record<string, unknown> }[] };
  const per: Record<string, number> = {};
  z.lines.forEach((l, i) => { const t = dateTrackAt("ch04_s05z_yeting", z.lines, i); if (t) per[t] = (per[t] ?? 0) + 1; });
  assert.deepEqual(Object.keys(per).sort(), ["liqinghe", "peizhaoye", "shenheng", "wenqiao"], "05z 四人各一段");
  const pub = z.lines.findIndex((l) => !l.when);
  assert.equal(dateTrackAt("ch04_s05z_yeting", z.lines, pub), null, "没条件的公务句：章曲");
  const s09 = load("ch04_s09_yuanye") as unknown as { lines: { text: string; when?: Record<string, unknown> }[] };
  const notLove = s09.lines.findIndex((l) => l.when?.["love.liqinghe"] === false);
  assert.ok(notLove >= 0);
  assert.equal(dateTrackAt("ch04_s09_yuanye", s09.lines, notLove), null, "不爱那一支：不放");
  // 听答复不放（等她开口）
  const qa = load("ch04_s05qa_shuge");
  assert.equal(qa.lines.every((_, i) => dateTrackAt("ch04_s05qa_shuge", qa.lines, i) === null), true, "05qa 听答复：章曲");
  // 信：只有承欢那封换曲
  assert.equal(letterTrack("liuchenghuan"), "liuchenghuan");
  assert.equal(letterTrack("shenheng"), null);
  void readdirSync;
});
