/**
 * 「点一下往下走」这一件事的唯一入口（D-047）。
 *
 * 起因是一个阻断级故障：正式网址在 iPhone 微信里打开，画面停在第一句，点屏幕毫无反应。
 * 桌面上一直是好的，所以问题不在剧情逻辑，在触摸事件或者移动端的层叠。
 *
 * 原来的写法是 `app.addEventListener("click", ...)`——一次把三种风险叠在了一起：
 *
 * 1. **靠冒泡。** 手指按在哪个元素上，事件就从那里往上冒。中间任何一层
 *    （舞台、立绘、纸纹、墨层、状态条、某个忘了 display:none 的满屏面板）
 *    只要吃掉事件或者停止冒泡，整个游戏就点不动，而且**画面一切正常**，
 *    玩家完全看不出发生了什么。这是最糟的一类失败。
 * 2. **只绑 click。** iOS 对「不像能点的元素」不一定合成 click。
 *    div 上要不要发 click，取决于 cursor、有没有监听器、在 WKWebView 里还要看宿主。
 *    微信的内置浏览器是 WKWebView，不是 Safari，这条更不能赌。
 * 3. **300ms 与长按选中。** 没有 touch-action 就可能等双击判定，长按还会选中文字。
 *
 * 现在换成：**在 window 上捕获阶段听 `pointerdown`**。捕获阶段在任何一层看到事件之前，
 * 所以中间有多少层、谁 pointer-events 是什么、谁 stopPropagation，都与它无关。
 * 没有 PointerEvent 的老浏览器退回 `touchend` + `click`，三者之间去重。
 *
 * 代价是它什么都听得见，所以要自己判断「这一下不是要往下走」——见 BLOCKING。
 */

/**
 * 这些元素自己有按钮、有它们自己的意思，点在上面不是「翻页」。
 * 宁可漏掉一次推进（玩家再点一下空白处就好），也不要在对诗里点选项时顺手翻一页。
 */
const BLOCKING = [
  "button", "a", "input", "textarea", "select", "label",
  ".choices", ".duel", ".summary", ".slots", ".inbox", ".notice", ".title", ".letter",
  // 序幕题记（CC3 E5 待协调第 1 条）：它自己收点击，第一下补完、第二下合上。
  // 不挡的话，点一下题记，后面的剧情也跟着翻一页
  ".tiji",
  // 题画（D-046 第 4 条，B37 接进游戏）：看立轴、挑题跋时点空白处是收起，不是翻页
  ".tihua",
  // 事件图回廊（D-220，B43）：翻看、点开整张、合上，都不是翻页
  ".gallery", ".gate",
].join(",");

/**
 * 一次触摸可能连发 pointerdown、touchend、click。要去掉的是**后面那几个合成的**，
 * 不是玩家真的快点了两下——读对白的人一秒点两三次很正常，一刀切的节流会让游戏发黏。
 * 所以只在「类型和上一次不同」时才去重：同一种事件连来两次，那就是两下。
 */
const DEDUP_MS = 700;

export interface TapInfo {
  type: string;
  target: string;
  blocked: string | null;
}

let lastAt = 0;
let lastType = "";

/** 最近几次触摸的去向，`?tapdebug=1` 用它在屏幕上显示——手机上开不了控制台 */
const log: TapInfo[] = [];
export function tapLog(): readonly TapInfo[] { return log; }

function describe(el: Element | null): string {
  if (!el) return "(无)";
  const cls = typeof el.className === "string" && el.className ? `.${el.className.trim().split(/\s+/).join(".")}` : "";
  return `${el.tagName.toLowerCase()}${cls}`.slice(0, 60);
}

/**
 * 注册「点一下」。handler 只在真的该往下走时被调用。
 * 返回取消注册的函数（测试用；游戏本身一路开到关页面）。
 */
export function onTap(handler: () => void): () => void {
  const accept = (e: Event): void => {
    const now = e.timeStamp || Date.now();
    if (e.type !== lastType && now - lastAt < DEDUP_MS) return;

    const el = e.target instanceof Element ? e.target : null;
    const blocked = el?.closest(BLOCKING) ?? null;
    log.unshift({ type: e.type, target: describe(el), blocked: blocked ? describe(blocked) : null });
    log.length = Math.min(log.length, 8);
    if (blocked) return;

    lastAt = now;
    lastType = e.type;
    handler();
  };

  // 捕获阶段：在任何一层拿到事件之前。这是这个模块存在的全部理由。
  const opts = { capture: true, passive: true } as const;
  const hasPointer = typeof window.PointerEvent === "function";
  const types = hasPointer ? ["pointerdown"] : ["touchend", "click"];
  for (const t of types) window.addEventListener(t, accept, opts);

  // PointerEvent 在场也留一道 click：万一某个宿主把 pointerdown 吞了，
  // 玩家至少还点得动。去重保证不会一次触摸翻两页。
  if (hasPointer) window.addEventListener("click", accept, opts);

  return () => {
    for (const t of [...types, "click"]) window.removeEventListener(t, accept, opts);
  };
}

/**
 * `?tapdebug=1`：把最近几次触摸打在屏幕上。
 *
 * 为什么要有：微信内置浏览器打不开控制台，手机上出了事只能靠截图。
 * 有这一层，下次再出「点不动」，一张截图就说得清是没收到事件、
 * 还是被某一层挡住了、还是收到了但引擎没往下走。
 */
export function mountTapDebug(root: HTMLElement, state: () => string): void {
  const box = document.createElement("div");
  box.style.cssText = [
    "position:fixed", "left:8px", "right:8px", "bottom:8px", "z-index:99",
    "pointer-events:none", "font:11px/1.5 ui-monospace,monospace",
    "background:rgba(26,24,21,.88)", "color:#EDE7DA",
    "padding:6px 8px", "border-radius:3px", "white-space:pre-wrap",
  ].join(";");
  root.appendChild(box);
  const paint = (): void => {
    const rows = tapLog().map((t) => `${t.type} → ${t.target}${t.blocked ? `  ✗挡于 ${t.blocked}` : "  ✓"}`);
    box.textContent = `${state()}\n${rows.join("\n") || "还没有收到任何触摸"}`;
  };
  paint();
  window.setInterval(paint, 300);
}
