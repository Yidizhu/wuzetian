import type { ChoiceView } from "../engine/story.ts";

/**
 * 选项。竖排，每项左侧一条短墨线，像题跋的起首。
 * 条件不满足的不隐藏，转清墨并写明缺什么——不给理由的灰选项是在惩罚玩家。
 * 选中的一瞬间短线位置亮一个朱砂点；金碧场景里那是整屏唯一的红。
 */
export class ChoiceList {
  private el: HTMLElement;

  constructor(root: HTMLElement, private onPick: (id: string) => void) {
    this.el = document.createElement("div");
    this.el.className = "choices";
    this.el.hidden = true;
    root.appendChild(this.el);
  }

  hide(): void { this.el.hidden = true; this.el.innerHTML = ""; }

  show(items: ChoiceView[]): void {
    this.el.innerHTML = "";
    for (const it of items) {
      const b = document.createElement("button");
      b.className = "choice";
      b.type = "button";
      b.disabled = !it.enabled;
      if (it.choice.irreversible) b.dataset.irreversible = "1";

      const mark = document.createElement("span");
      mark.className = "choice__mark";
      const text = document.createElement("span");
      text.className = "choice__text";
      text.textContent = it.choice.text;
      b.append(mark, text);

      if (!it.enabled && it.lockHint) {
        const hint = document.createElement("span");
        hint.className = "choice__hint";
        hint.textContent = it.lockHint;
        b.appendChild(hint);
      }

      b.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!it.enabled) return;
        b.dataset.picked = "1";           // 亮朱砂
        window.setTimeout(() => this.onPick(it.choice.id), 400);
      });
      this.el.appendChild(b);
    }
    this.el.hidden = false;
  }
}
