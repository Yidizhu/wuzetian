import { test } from "node:test";
import assert from "node:assert/strict";
import type { Scene } from "../src/engine/types.ts";
import { audibleSpan, bgmForChapter } from "../src/audio/bgm.ts";
import { vistaFor } from "../src/scene/backdrops.ts";

/** B32：题记之后的点击竞态（CC2 D22 第四节）；配乐和章首风景的两个纯函数 */

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

test("题记收起、墨晕还没开完时再点：题记后第一格照播，下一格不发两次", async () => {
  mem.clear();
  const scene = {
    id: "s", chapter: 1, act: 1, scene: "yeting", palette: "ink", cast: [], purpose: "测试用", goto: "s",
    lines: [
      { id: "s.l1", who: "tiji", kind: "aside", text: "题记。" },
      { id: "s.l2", who: "empty", kind: "aside", text: "空镜。" },
      { id: "s.l3", who: "narr", kind: "aside", text: "下一格。" },
    ],
  } as Scene;
  let showing: (() => void) | null = null;
  // 墨晕开要一段时间：show 挂着，等测试放行
  const renderer = { mount() {}, async load() {}, show: () => new Promise<void>((r) => { showing = r; }), beat() {}, resize() {}, dispose() {} };
  const lines: string[] = [];
  let closeEpigraph: (() => void) | null = null;
  const story = new Story([scene], [], [], [], new Store(), renderer,
    { async duel() { return true; }, async chapterEnd() {}, epigraph: () => new Promise<void>((r) => { closeEpigraph = r; }) }, "s");
  story.on((e) => { if (e.kind === "line") lines.push(e.who); });
  void story.start();
  const drain = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
  await drain();
  assert.ok(closeEpigraph, "题记该挂上了");
  closeEpigraph!();                     // 纸收起
  await drain();
  story.advance(); story.advance();     // 快手在墨晕开的那一下连点
  await drain();
  assert.deepEqual(lines, [], "景还没显完，一格都不该出");
  showing!();                           // 墨晕开完
  await drain();
  assert.deepEqual(lines, ["empty"], "题记后第一格照播，而且只播一次");
  story.advance();
  await drain();
  assert.deepEqual(lines, ["empty", "narr"], "下一格只发一次");
});

test("配乐：序幕和第一章 ch1，二三四章各自一首，超出的夹住", () => {
  assert.equal(bgmForChapter(0), "bgm/ch1.m4a");
  assert.equal(bgmForChapter(1), "bgm/ch1.m4a");
  assert.equal(bgmForChapter(3), "bgm/ch3.m4a");
  assert.equal(bgmForChapter(9), "bgm/ch4.m4a");
});

test("配乐：跳过编码器补的前后静音，交叉淡化过的首尾不当静音", () => {
  const c = new Float32Array([0, 0, 0, 0.2, -0.3, 0.1, 0, 0]);
  assert.deepEqual(audibleSpan([c, new Float32Array(8)]), [3, 6]);
  assert.deepEqual(audibleSpan([new Float32Array(4)]), [0, 4], "全静音就整段，不返回空区间");
});

test("章首风景：序幕和第一章共用 ch1", () => {
  assert.equal(vistaFor(0), "vista_ch1");
  assert.equal(vistaFor(1), "vista_ch1");
  assert.equal(vistaFor(4), "vista_ch4");
  assert.equal(vistaFor(5), null);
});
