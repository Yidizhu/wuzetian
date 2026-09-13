import { test } from "node:test";
import assert from "node:assert/strict";

/**
 * 点击推进（D-047）。
 *
 * 这一条在手机上坏过一次：画面一切正常，点屏幕毫无反应。所以它值得有测试——
 * 但要测的不是「点了会不会推进」（那是引擎的事），而是 tap.ts 那三条判断：
 * 一次触摸只算一下、点在按钮和面板上不算翻页、在捕获阶段听所以谁都挡不住。
 */

// ------------------------------------------------- 一个够用的假 DOM
interface FakeEl {
  tagName: string; className: string; parent: FakeEl | null;
  closest(sel: string): FakeEl | null;
}
const el = (tag: string, cls = "", parent: FakeEl | null = null): FakeEl => {
  const self: FakeEl = {
    tagName: tag.toUpperCase(), className: cls, parent,
    closest(sel: string) {
      const want = sel.split(",").map((s) => s.trim());
      for (let n: FakeEl | null = self; n; n = n.parent) {
        const tag = n.tagName.toLowerCase();
        const classes = n.className ? n.className.split(/\s+/).map((c) => `.${c}`) : [];
        if (want.includes(tag) || classes.some((c) => want.includes(c))) return n;
      }
      return null;
    },
  };
  return self;
};

type Listener = (e: { type: string; target: unknown; timeStamp: number }) => void;
const listeners = new Map<string, Listener[]>();
const g = globalThis as unknown as Record<string, unknown>;
g.window = {
  PointerEvent: function () {},
  addEventListener: (t: string, fn: Listener) => { listeners.set(t, [...(listeners.get(t) ?? []), fn]); },
  removeEventListener: (t: string, fn: Listener) => { listeners.set(t, (listeners.get(t) ?? []).filter((x) => x !== fn)); },
  setInterval: () => 0,
};
g.Element = function () {} as unknown;
// tap.ts 用 `e.target instanceof Element` 挑出元素，假 DOM 要认得出自己
Object.defineProperty(g.Element, Symbol.hasInstance, { value: (x: unknown) => !!x && typeof x === "object" && "closest" in (x as object) });

const { onTap } = await import("../src/ui/tap.ts");

let fired = 0;
onTap(() => { fired += 1; });
const send = (type: string, target: FakeEl, timeStamp: number) => {
  for (const fn of listeners.get(type) ?? []) fn({ type, target, timeStamp });
};

test("在捕获阶段听 window，不靠冒泡——这是这个模块存在的理由", () => {
  assert.ok(listeners.get("pointerdown")?.length, "没有监听 pointerdown");
  assert.ok(listeners.get("click")?.length, "PointerEvent 在场时也要留一道 click 兜底");
});

test("一次触摸只算一下：pointerdown 之后紧跟的 click 不再翻一页", () => {
  fired = 0;
  const blank = el("div", "stage__layer");
  send("pointerdown", blank, 1000);
  send("click", blank, 1060);        // 同一次触摸合成出来的
  assert.equal(fired, 1);
});

test("快点两下算两下：读对白的人一秒点两三次，不能被节流吃掉", () => {
  fired = 0;
  const blank = el("div", "stage__layer");
  send("pointerdown", blank, 2000);
  send("pointerdown", blank, 2250);
  send("pointerdown", blank, 2500);
  assert.equal(fired, 3);
});

test("点在按钮上不翻页：那一下是给按钮的", () => {
  fired = 0;
  send("pointerdown", el("button", "choice"), 5000);
  assert.equal(fired, 0);
});

test("点在满屏面板的空白处也不翻页", () => {
  for (const cls of ["duel", "summary", "slots", "inbox", "notice", "title", "choices", "tiji"]) {
    fired = 0;
    const panel = el("div", cls);
    send("pointerdown", el("div", "inner", panel), 6000 + Math.random() * 1000);
    assert.equal(fired, 0, `点在 .${cls} 里不该翻页`);
  }
});

test("点在背景层上要翻页——挡住它的正是上一回那个 bug", () => {
  fired = 0;
  send("pointerdown", el("div", "stage__layer"), 9000);
  assert.equal(fired, 1);
});
