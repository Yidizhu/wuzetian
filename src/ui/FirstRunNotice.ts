/**
 * 首屏那一行提示（D-034）。
 *
 * 为什么非要有：存档在浏览器的 localStorage 里，同一个人从微信内置浏览器换到 Safari
 * 就是两份互不相通的进度。这件事玩家没有任何办法从画面上看出来，
 * 等她发现的时候进度已经没了。提示必须出现在她开始玩之前，不是出现在她丢档之后。
 *
 * 只出现一次，点掉就记住。八秒不点也自己退——它是一句话，不是一道门。
 *
 * 样式写在这里而不是 src/styles/：那个目录归 CC3（D-036）。
 * 用的全是既有的 CSS 变量，CC3 什么时候要把它收进样式表，改类名即可。
 */

import { storageWorks } from "../engine/save.ts";

const SEEN = "wuzetian.notice.storage";

export function showFirstRunNotice(root: HTMLElement, onExport?: () => void): void {
  // 存不住档是另一回事，也严重得多：那句提示每次都要出，而且不许自己消失
  const broken = !storageWorks();
  if (!broken) {
    try {
      if (localStorage.getItem(SEEN)) return;
    } catch {
      return;
    }
  }

  const bar = document.createElement("div");
  bar.className = "notice";
  bar.setAttribute("role", "status");
  bar.style.cssText = [
    "position:fixed", "left:50%", "transform:translateX(-50%)",
    // 贴顶，不贴底：底下是对话框，提示压在台词上是最讨嫌的一种提示。
    "top:calc(env(safe-area-inset-top, 0px) + 8px)",
    "z-index:60",
    // 必须是 width 不是 max-width：里面那个 flex:1 的文字块 flex-basis 是 0，
    // 只给 max-width 的话这个定宽盒子会按 min-content 收缩，中文就一行一个字竖着排下去。
    "width:min(92vw, 30rem)", "box-sizing:border-box",
    "display:flex", "align-items:center", "gap:.75rem",
    "padding:.6rem .85rem",
    // 焦墨底、纸色字。场景底色本来就是 --c-ground，提示再用它就等于没有提示；
    // 反过来当一枚墨印，一眼看得出这句话不是戏里的人在说。
    "background:var(--c-text, #1A1815)",
    "color:var(--c-ground, #EDE7DA)",
    "border-radius:2px",
    "box-shadow:0 2px 12px rgba(0,0,0,.28)",
    "font-size:.82rem", "line-height:1.5",
    "opacity:0", "transition:opacity .5s ease",
  ].join(";");

  const text = document.createElement("span");
  text.style.flex = "1";
  text.textContent = broken
    ? "这个打开方式存不住档，关掉页面进度就没了。玩之前先想好：要留进度，请用浏览器打开，或随时导出存档码。"
    : "存档在本浏览器里。换设备、换浏览器之前，先导出存档码。";
  if (broken) bar.style.boxShadow = "0 0 0 2px var(--c-accent, #A8232A), 0 2px 12px rgba(0,0,0,.28)";
  bar.appendChild(text);

  const dismiss = (): void => {
    try { if (!broken) localStorage.setItem(SEEN, "1"); } catch { /* 记不住就下次再说一遍 */ }
    bar.style.opacity = "0";
    window.setTimeout(() => bar.remove(), 500);
  };

  // 只说不做的提示等于没说：给一个当场就能去导的按钮
  if (onExport) {
    const go = document.createElement("button");
    go.type = "button";
    go.textContent = "去导出";
    go.style.cssText = "flex:none;white-space:nowrap;font:inherit;padding:.2rem .5rem;cursor:pointer;background:none;border:1px solid currentColor;border-radius:2px;color:inherit;opacity:.85";
    go.addEventListener("click", (e) => { e.stopPropagation(); dismiss(); onExport(); });
    bar.appendChild(go);
  }

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "知道了";
  close.style.cssText = "flex:none;white-space:nowrap;font:inherit;padding:.2rem .5rem;cursor:pointer;background:none;border:none;color:var(--c-text-soft, #56504A)";
  close.addEventListener("click", (e) => { e.stopPropagation(); dismiss(); });
  bar.appendChild(close);

  root.appendChild(bar);
  requestAnimationFrame(() => { bar.style.opacity = "1"; });
  // 存不住档那一条要她亲手点掉。八秒之后自己溜走的警告，等于没警告过。
  if (!broken) window.setTimeout(dismiss, 8000);
}
