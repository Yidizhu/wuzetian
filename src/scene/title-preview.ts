/**
 * 标题抽查台。只在 dev 下打开。
 *   /src/scene/title-preview.html          竖屏
 *   /src/scene/title-preview.html?w=900&h=520   横屏
 * 点一下会收起（墨晕合上），再点页面任意处重新挂上。
 */
import "../styles/palette.css";
import "../styles/app.css";
import { mountTitle } from "./TitleScreen.ts";

const qs = new URLSearchParams(location.search);
const W = Number(qs.get("w") ?? 390);
const H = Number(qs.get("h") ?? 844);

const frame = document.createElement("div");
frame.className = "tf";
frame.style.cssText = `position:relative;width:${W}px;height:${H}px;overflow:hidden;`
  + "background:var(--c-ground);margin:16px;flex:0 0 auto;";
document.body.appendChild(frame);

const hint = document.createElement("p");
hint.style.cssText = "color:#b9b4a8;font:12px system-ui;margin:16px";
hint.textContent = "点画面收起（墨晕合上），点这行重新挂上。加 ?resume=1 看有存档时的两个入口";
document.body.appendChild(hint);

function open(): void {
  mountTitle(frame, {
    name: qs.get("name") ?? "吾则天",
    seal: qs.get("seal") ?? "则天",
    sub: qs.get("sub") ?? undefined,
    resume: qs.get("resume") ? { onResume: () => console.info("[title] resume") } : undefined,
    onStart: () => console.info("[title] start"),
  });
  // 标题是 fixed 的，抽查台要把它关在这个框里看
  const el = frame.querySelector<HTMLElement>(".title");
  if (el) el.style.position = "absolute";
}
hint.addEventListener("click", open);
open();

const css = document.createElement("style");
css.textContent = `body { margin:0; background:#2a2a28; display:flex; align-items:flex-start; }`;
document.head.appendChild(css);
