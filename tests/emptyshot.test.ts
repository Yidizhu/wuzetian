import { test } from "node:test";
import assert from "node:assert/strict";
import { Scene as SceneSchema } from "../src/engine/schema.ts";
import type { Scene } from "../src/engine/types.ts";

/** 空镜（D-145／D-176，B31）：这一格人全部下台，下一格有人说话再上来 */

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

type L = Scene["lines"][number];
const say = (id: string, who = "shenheng"): L => ({ id, who, kind: "say", text: "一句。" } as L);
const empty = (id: string): L => ({ id, who: "empty", kind: "aside", text: "檐下的灯笼晃了一下。" } as L);
const scene = (id: string, lines: L[], extra: Partial<Scene> = {}): Scene => ({
  id, chapter: 1, act: 1, scene: "yeting", palette: "ink", cast: ["shenheng", "wuze"], purpose: "测试用", lines, ...extra,
} as Scene);
const noopRenderer = { mount() {}, async load() {}, async show() {}, beat() {}, resize() {}, dispose() {} };
const drain = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

async function events(scenes: Scene[], steps = 8): Promise<string[]> {
  mem.clear();
  const out: string[] = [];
  const story = new Story(scenes, [], [], [], new Store(), noopRenderer, { async duel() { return true; }, async chapterEnd() {} }, scenes[0]!.id);
  story.on((e) => {
    if (e.kind === "line") out.push(`line:${e.who}`);
    else if (e.kind === "castExit" || e.kind === "castEnter" || e.kind === "choices") out.push(e.kind);
  });
  await story.start();
  for (let i = 0; i < steps; i++) { story.advance(); await drain(); }
  return out;
}

test("空镜那一格人下台，下一格有人说话再上来", async () => {
  const ev = await events([scene("a", [say("a.l1"), empty("a.l2"), say("a.l3"), say("a.l4")], { goto: "a" })], 3);
  assert.deepEqual(ev.slice(0, 5), ["line:shenheng", "castExit", "line:empty", "castEnter", "line:shenheng"]);
});

test("空镜之后没人再开口就出选项：出选项前把人请回来", async () => {
  const s = scene("a", [say("a.l1"), empty("a.l2"), say("a.l3")], {
    choices: [{ id: "a.cA", text: "走", goto: "b", irreversible: false }],
  });
  // 这一场本身合法（空镜不是最后一格）；引擎在选项前兜底，这里把最后一句去掉只测引擎
  const bare = { ...s, lines: s.lines.slice(0, 2) } as Scene;
  const ev = await events([bare, scene("b", [say("b.l1")], { goto: "b" })], 2);
  assert.deepEqual(ev.slice(0, 5), ["line:shenheng", "castExit", "line:empty", "castEnter", "choices"]);
});

test("校验：空镜要写旁白、不带表情、不连着两格、不做选项前最后一格", () => {
  const ok = scene("a", [say("a.l1"), empty("a.l2"), say("a.l3")], { goto: "b" });
  assert.ok(SceneSchema.safeParse(ok).success);
  const bad = (lines: L[], extra: Partial<Scene> = { goto: "b" }) => !SceneSchema.safeParse(scene("a", lines, extra)).success;
  assert.ok(bad([say("a.l1"), { ...empty("a.l2"), kind: "say" } as L]), "类型不是旁白");
  assert.ok(bad([say("a.l1"), { ...empty("a.l2"), expr: "open" } as L]), "带表情");
  assert.ok(bad([empty("a.l1"), empty("a.l2"), say("a.l3")]), "两格连着");
  assert.ok(bad([say("a.l1"), empty("a.l2")], { choices: [{ id: "a.cA", text: "走", goto: "b", irreversible: false }] }), "选项前最后一格");
  assert.ok(!bad([say("a.l1"), empty("a.l2")]), "场末接 goto 可以");
});

test("D-223 同一拍的画面：格事件带 id 和 image；条件跳过的格不带出它的画面；旧稿没这一栏照常", async () => {
  const lines: L[] = [
    { ...say("p.l1"), image: "wu_lengzao" } as L,
    { ...empty("p.l2"), image: "wu_lengzao" } as L,
    { ...say("p.l3"), when: { "flag.never": true }, image: "wu_yuejiu" } as L,
    say("p.l4"),
  ];
  // schema 认这一栏；旧稿（没有 image）也照样过
  assert.equal(SceneSchema.safeParse(scene("p", lines, { goto: "p" })).success, true);
  assert.equal(SceneSchema.safeParse(scene("q", [say("q.l1")], { goto: "q" })).success, true);
  mem.clear();
  const got: { id: string; image?: string }[] = [];
  const story = new Story([scene("p", lines, { goto: "p" })], [], [], [], new Store(), noopRenderer, { async duel() { return true; }, async chapterEnd() {} }, "p");
  story.on((e) => { if (e.kind === "line") got.push({ id: e.id, image: e.image }); });
  await story.start();
  for (let i = 0; i < 3; i++) { story.advance(); await drain(); }
  assert.deepEqual(got.slice(0, 3), [
    { id: "p.l1", image: "wu_lengzao" },
    { id: "p.l2", image: "wu_lengzao" },   // 连着同一个 key：UI 那头不重铺
    { id: "p.l4", image: undefined },      // l3 条件不满足跳过，它的画面也不出；l4 没写就退回舞台
  ]);
});
