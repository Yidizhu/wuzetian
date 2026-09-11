/**
 * 首屏那一行提示（D-034）。
 *
 * 为什么非要有：存档在浏览器的 localStorage 里，同一个人从微信内置浏览器换到 Safari
 * 就是两份互不相通的进度。这件事玩家没有任何办法从画面上看出来，
 * 等她发现的时候进度已经没了。提示必须出现在她开始玩之前，不是出现在她丢档之后。
 *
 * 只出现一次，看过就记住。八秒不点也自己退——它是一句话，不是一道门。
 * 同一条通道后来也用在「旧档退回章首」上（D-037），所以样式抽成了 showNotice。
 *
 * 样式写在这里而不是 src/styles/：那个目录归 CC3（D-036）。
 * 用的全是既有的 CSS 变量，CC3 什么时候要把它收进样式表，改类名即可。
 */

import { storageWorks } from "../engine/save.ts";

const SEEN = "wuzetian.notice.storage";

export interface NoticeOptions {
  /** true = 要她亲手点掉。八秒之后自己溜走的警告，等于没警告过 */
  sticky?: boolean;
  /** 描一圈朱砂（水墨板）／泥金（金碧板）。留给真的出了事的那一条 */
  urgent?: boolean;
  /** 一个当场就能做点什么的按钮。只说不做的提示等于没说 */
  action?: { label: string; run: () => void };
}

/**
 * 顶上那条提示。首屏提示、旧档退回章首都用它。
 *
 * 一次只留一条：第二条来了就把上一条换掉。两条叠在一起谁都读不完。
 */
export function showNotice(root: HTMLElement, message: string, opts: NoticeOptions = {}): void {
  const { sticky = false, urgent = false, action } = opts;
  root.querySelector(".notice")?.remove();

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
  text.textContent = message;
  // 朱砂只属于水墨板（D-010 第 1 条）。金碧场景里 --c-accent 是 initial，
  // 这里必须退到泥金，不能写死 #A8232A——写死就等于在朝廷的画面上点了一笔红。
  if (urgent) bar.style.boxShadow = "0 0 0 2px var(--c-accent, var(--c-ink-4, #B8964F)), 0 2px 12px rgba(0,0,0,.28)";
  bar.appendChild(text);

  const dismiss = (): void => {
    bar.style.opacity = "0";
    window.setTimeout(() => bar.remove(), 500);
  };

  if (action) {
    const go = document.createElement("button");
    go.type = "button";
    go.textContent = action.label;
    go.style.cssText = "flex:none;white-space:nowrap;font:inherit;padding:.2rem .5rem;cursor:pointer;background:none;border:1px solid currentColor;border-radius:2px;color:inherit;opacity:.85";
    go.addEventListener("click", (e) => { e.stopPropagation(); dismiss(); action.run(); });
    bar.appendChild(go);
  }

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "知道了";
  // 不能用 --c-text-soft：它在金碧板里是赭石，落在这条焦墨的条子上又暗又发红，
  // 看着像一个警告色。这里要的只是「比正文轻一点」，用同一个纸色压透明度就够。
  close.style.cssText = "flex:none;white-space:nowrap;font:inherit;padding:.2rem .5rem;cursor:pointer;background:none;border:none;color:inherit;opacity:.72";
  close.addEventListener("click", (e) => { e.stopPropagation(); dismiss(); });
  bar.appendChild(close);

  root.appendChild(bar);
  requestAnimationFrame(() => { bar.style.opacity = "1"; });
  if (!sticky) window.setTimeout(dismiss, 8000);
}

/**
 * 首屏那一行（D-034）。存不住档时换成另一句，并且不许自己消失。
 */
export function showFirstRunNotice(root: HTMLElement, onExport?: () => void): void {
  const broken = !storageWorks();
  if (!broken) {
    try {
      if (localStorage.getItem(SEEN)) return;
      localStorage.setItem(SEEN, "1");
    } catch {
      return;   // 读不了 localStorage，那存档本来也存不住，broken 那条会接手
    }
  }
  showNotice(
    root,
    broken
      ? "这个打开方式存不住档，关掉页面进度就没了。玩之前先想好：要留进度，请用浏览器打开，或随时导出存档码。"
      : "存档在本浏览器里。换设备、换浏览器之前，先导出存档码。",
    { sticky: broken, urgent: broken, action: onExport ? { label: "去导出", run: onExport } : undefined },
  );
}
