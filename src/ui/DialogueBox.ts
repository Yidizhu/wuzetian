import type { GameState } from "../engine/state.ts";
import { NAMES } from "./names.ts";

/**
 * 对话框。宣纸卷轴的一段：上下两条淡墨线，左右不封口。
 * 打字机逐字显示，第一下点击补完整句，第二下才推进——见已装的 visual-novel 技能。
 */
export class DialogueBox {
  private el: HTMLElement;
  private nameEl: HTMLElement;
  private textEl: HTMLElement;
  private full = "";
  private timer = 0;
  private revealing = false;

  constructor(root: HTMLElement) {
    this.el = document.createElement("div");
    this.el.className = "dlg";
    this.el.innerHTML = `<div class="dlg__name"></div><div class="dlg__text"></div>`;
    root.appendChild(this.el);
    this.nameEl = this.el.querySelector(".dlg__name")!;
    this.textEl = this.el.querySelector(".dlg__text")!;
  }

  /** 正在逐字显示则补完并返回 true，调用方据此决定这一下点击算不算推进 */
  complete(): boolean {
    if (!this.revealing) return false;
    window.clearInterval(this.timer);
    this.revealing = false;
    this.textEl.textContent = this.full;
    return true;
  }

  show(who: string, text: string, kind: string, state: GameState, instant: boolean): void {
    window.clearInterval(this.timer);
    this.full = text;
    this.el.dataset.kind = kind;

    const label = NAMES[who] ?? who;
    this.nameEl.textContent = label.replace(/\{名\}/g, state.protagonistName);
    this.nameEl.hidden = !this.nameEl.textContent;

    if (instant) { this.textEl.textContent = text; this.revealing = false; return; }

    // 读过的句子直接显示。skip 只跳读过的文本，不然玩家会跳过没看过的内容。
    let n = 0;
    this.textEl.textContent = "";
    this.revealing = true;
    this.timer = window.setInterval(() => {
      n += 1;
      this.textEl.textContent = text.slice(0, n);
      if (n >= text.length) { window.clearInterval(this.timer); this.revealing = false; }
    }, 34);
  }

  setVisible(v: boolean): void { this.el.hidden = !v; }
}
