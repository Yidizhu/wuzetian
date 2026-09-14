import { test } from "node:test";
import assert from "node:assert/strict";
import { CGS, endingCg, placeOnImage } from "../src/scene/cgs.ts";
import { ENDING_DRESSINGS } from "../src/engine/story.ts";
import endings from "../src/data/endings.json" with { type: "json" };

test("D-160：每个结局在事件图表里正好一行，印只在无字之碑", () => {
  for (const e of endings) assert.ok(endingCg(e.key), `${e.title} 没有结局图那一行`);
  const rows = Object.values(CGS).filter((c) => c.ending);
  assert.equal(rows.length, endings.length);
  for (const c of rows) if (c.seal) assert.equal(ENDING_DRESSINGS[c.ending!], "yin");
  assert.equal(endingCg("nope"), null);
});

test("印跟着图走：cover 按焦点裁、contain 居中放进来", () => {
  // 竖图 1000×1500 铺满 390×844 的手机：按高放大，左右裁，焦点居中时图中心落在屏中心
  const c = placeOnImage({ w: 1000, h: 1500 }, { w: 390, h: 844 }, "cover", { x: 50, y: 50 }, { x: 50, y: 50 });
  assert.ok(Math.abs(c.x - 195) < 0.01 && Math.abs(c.y - 422) < 0.01);
  // 焦点在左边（x 0）：图的左边贴屏幕左边，图上 0% 就是屏幕 0
  const l = placeOnImage({ w: 1000, h: 1500 }, { w: 390, h: 844 }, "cover", { x: 0, y: 50 }, { x: 0, y: 0 });
  assert.ok(Math.abs(l.x) < 0.01);
  // 竖图上宽屏 contain：高 900 放满，宽 600，左边留 420
  const w = placeOnImage({ w: 1000, h: 1500 }, { w: 1440, h: 900 }, "contain", { x: 10, y: 10 }, { x: 0, y: 100 });
  assert.ok(Math.abs(w.x - 420) < 0.01 && Math.abs(w.y - 900) < 0.01, JSON.stringify(w));
});
