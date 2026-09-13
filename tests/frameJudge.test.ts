import { test } from "node:test";
import assert from "node:assert/strict";
import { FrameJudge } from "../src/ui/frameJudge.ts";

/**
 * 3D 太卡时一次性退回 CSS 版的判据（D-069）。
 * 两件事要守住：不冤枉（热身、切后台不算），不来回抖（判了就不改）。
 */

const feed = (j: FrameJudge, ms: number, n: number) => {
  let v = null;
  for (let i = 0; i < n; i++) v = j.push(ms) ?? v;
  return v;
};

test("一直流畅：看够 20 秒判「扛得住」，不会退", () => {
  const j = new FrameJudge();
  assert.equal(feed(j, 16.7, 60 * 30), "ok");
});

test("一直卡在 15 帧：判慢", () => {
  const j = new FrameJudge();
  assert.equal(feed(j, 66, 400), "slow");
});

test("热身那 4 秒再卡也不算：换场推镜和编译着色器本来就慢", () => {
  const j = new FrameJudge();
  assert.equal(feed(j, 90, 40), null, "前 3.6 秒全是 90ms 一帧，不该判");
  assert.equal(feed(j, 16.7, 60 * 22), "ok", "热身之后流畅，照样判扛得住");
});

test("偶尔掉几帧不算：七成以上都慢才算", () => {
  const j = new FrameJudge();
  feed(j, 16.7, 300);                        // 过了热身
  let v = null;
  for (let i = 0; i < 1300 && !v; i++) v = j.push(i % 3 === 0 ? 60 : 16.7);   // 三帧里一帧慢
  assert.notEqual(v, "slow");
});

test("切到后台回来那一下的几十秒间隔不计", () => {
  const j = new FrameJudge();
  feed(j, 16.7, 300);
  assert.equal(j.push(45_000), null);
  assert.equal(j.verdict, null);
});

test("判了就不改：判慢之后再流畅也还是慢，不来回抖", () => {
  const j = new FrameJudge();
  feed(j, 66, 400);
  assert.equal(feed(j, 16.7, 2000), "slow");
});
