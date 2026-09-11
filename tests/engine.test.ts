import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Store, newState } from "../src/engine/state.ts";
import { meets } from "../src/engine/conditions.ts";
import { pickEnding, resolveBody } from "../src/engine/endings.ts";
import type { Ending } from "../src/engine/types.ts";

const endings = JSON.parse(readFileSync(new URL("../src/data/endings.json", import.meta.url), "utf8")) as Ending[];

test("数值夹在 0 到 20 之间", () => {
  const st = new Store();
  st.apply({ cai: 99 });
  assert.equal(st.state.stats.cai, 20);
  st.apply({ cai: -99 });
  assert.equal(st.state.stats.cai, 0);
});

test("互斥的 flag：置真一个会清掉另一个", () => {
  const st = new Store();
  st.apply({ "flag.succession_open": true, "flag.enthroned": true });
  assert.equal(st.state.flags.enthroned, true);
  st.apply({ "flag.declined_crown": true });
  assert.equal(st.state.flags.declined_crown, true);
  assert.equal(st.state.flags.enthroned, false, "登基与拒位不能同时为真");
});

test("改名三个 flag 互斥", () => {
  const st = new Store();
  st.apply({ "flag.name_tian": true });
  st.apply({ "flag.name_zhao": true });
  assert.equal(st.state.flags.name_tian, false);
  assert.equal(st.state.flags.name_zhao, true);
});

test("落选给李令仪之后仍然可以去办学，这两个不互斥", () => {
  const st = new Store();
  st.apply({ "flag.liqinghe_won": true, "flag.founded_school": true });
  assert.equal(st.state.flags.liqinghe_won, true);
  assert.equal(st.state.flags.founded_school, true);
});

test("条件求值：数值、好感、flag", () => {
  const s = newState();
  s.stats.cai = 6;
  s.affinity.shenheng = 11;
  s.flags.took_seal = true;
  assert.equal(meets({ cai: { gte: 6 } }, s), true);
  assert.equal(meets({ cai: { gte: 7 } }, s), false);
  assert.equal(meets({ "affinity.shenheng": { gte: 10 } }, s), true);
  assert.equal(meets({ "flag.took_seal": true }, s), true);
  assert.equal(meets({ "flag.never_happened": false }, s), true);
});

test("结局表最后一条兜底，空状态也能拿到结局", () => {
  const e = pickEnding(endings, newState());
  assert.ok(e, "空状态必须有结局可给");
  assert.equal(e!.key, "zhishangyouming");
});

/**
 * D-028：登基之后，结局看她在第四章做了什么，不看四项数值堆到多少。
 * 下面三个用例的数值一模一样，落点完全不同——数值决定不了这一段，这正是要守住的。
 */
const enthronedWith = (...flags: string[]) => {
  const s = newState();
  s.stats.shi = 16; s.stats.ming = 14; s.stats.cai = 12; s.stats.xin = 14;
  s.flags.enthroned = true;
  for (const f of flags) s.flags[f] = true;
  return s;
};

test("满殿无声：删异议、毁底本、关名单，三件事齐了才是这一个", () => {
  const s = enthronedWith("ch04_dissent_removed", "ch04_originals_destroyed", "ch04_nomination_closed");
  assert.equal(pickEnding(endings, s)!.key, "mandianwusheng");
  // 少做一件就不算。这三条是并列的，不是「够冷就行」
  const two = enthronedWith("ch04_dissent_removed", "ch04_originals_destroyed");
  assert.notEqual(pickEnding(endings, two)!.key, "mandianwusheng");
});

test("未竟之诏兜住登基线：登基了，第四章什么都没做", () => {
  assert.equal(pickEnding(endings, enthronedWith())!.key, "weijingzhizhao");
});

test("同样的数值，第四章做的事不同就落到不同结局（D-028）", () => {
  const got = [
    pickEnding(endings, enthronedWith("ch04_dissent_removed", "ch04_originals_destroyed", "ch04_nomination_closed"))!.key,
    pickEnding(endings, enthronedWith("public_review", "ch04_nomination_open"))!.key,
    pickEnding(endings, enthronedWith())!.key,
  ];
  assert.equal(new Set(got).size, 3, `三条路应该落到三个结局，实际是 ${got.join("、")}`);
});

test("无字碑不看改名，三个字都到得了", () => {
  const base = () => enthronedWith("public_review", "ch04_nomination_open");
  for (const f of ["name_tian", "name_zhao", "name_kept"]) {
    const s = base();
    s.flags[f] = true;
    assert.equal(pickEnding(endings, s)!.key, "wuzibei", `选 ${f} 也该到得了无字碑`);
  }
  // 一个字都没选也不该被卡住
  assert.equal(pickEnding(endings, base())!.key, "wuzibei");
});

test("结局正文按选的那个字切三段变体，三段互不相同", () => {
  const wuzibei = endings.find((e) => e.key === "wuzibei")!;
  const bodies = new Set<string>();
  for (const f of ["name_tian", "name_zhao", "name_kept"]) {
    const s = newState();
    s.flags[f] = true;
    bodies.add(resolveBody(wuzibei, s));
  }
  assert.equal(bodies.size, 3, "三个字应该读到三段不同的正文");
});

test("没有任何结局拿改名当门槛（D-020）", () => {
  for (const e of endings) {
    for (const f of ["flag.name_tian", "flag.name_zhao", "flag.name_kept"]) {
      assert.ok(!(e.require && f in e.require), `${e.key} 不该用 ${f} 当门槛`);
    }
  }
});
