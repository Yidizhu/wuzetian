import type { PoemDuelT } from "../engine/schema.ts";

/**
 * 对诗。全游戏唯一的教学环节，所以两件事必须做到：
 *
 * 1. **题面先给。** 本局限定了什么（几个字、哪个字位的平仄、末字平仄、不许引入什么）
 *    要写在选项之前。没有题面，四个候选里往往不止一个在文学上成立，玩家答错了不服。
 * 2. **答错也要读到理由。** 错在哪一条限制上，说清楚，然后往下走。
 *    输不是死路：C0-2 与精神指南 2.2 都要求失败通向另一段平等交流，不是惩罚。
 */
export class PoemDuel {
  private el: HTMLElement;

  constructor(root: HTMLElement) {
    this.el = document.createElement("div");
    this.el.className = "duel";
    this.el.hidden = true;
    root.appendChild(this.el);
  }

  hide(): void { this.el.hidden = true; this.el.innerHTML = ""; }

  /** resolve(true) 表示答对了。答完要玩家再点一下「往下」才继续。 */
  play(d: PoemDuelT): Promise<boolean> {
    return new Promise((resolve) => {
      this.el.innerHTML = "";
      this.el.hidden = false;

      const head = document.createElement("div");
      head.className = "duel__head";
      head.innerHTML = `<div class="duel__title">对句 · ${esc(d.title)}</div>`;
      const prompt = document.createElement("div");
      prompt.className = "duel__prompt";
      prompt.textContent = d.prompt;
      const brief = document.createElement("div");
      brief.className = "duel__brief";
      brief.textContent = d.brief;
      this.el.append(head, prompt, brief);

      const list = document.createElement("div");
      list.className = "duel__options";
      this.el.appendChild(list);

      const buttons: HTMLButtonElement[] = [];
      for (const o of d.options) {
        const b = document.createElement("button");
        b.className = "duel__option";
        b.type = "button";
        b.innerHTML = `<span class="duel__key">${esc(o.key)}</span><span class="duel__text"></span>`;
        b.querySelector(".duel__text")!.textContent = o.text;
        b.addEventListener("click", (ev) => {
          ev.stopPropagation();
          reveal(o.key);
        });
        list.appendChild(b);
        buttons.push(b);
      }

      const reveal = (pickedKey: string) => {
        const picked = d.options.find((o) => o.key === pickedKey)!;
        for (const [i, b] of buttons.entries()) {
          const o = d.options[i]!;
          b.disabled = true;
          if (o.correct) b.dataset.state = "right";
          else if (o.key === pickedKey) b.dataset.state = "wrong";
          // 每一项都把理由摊开。只讲被选中那一项的话，玩家学不到另外两条限制。
          const why = document.createElement("span");
          why.className = "duel__why";
          why.textContent = o.why;
          b.appendChild(why);
        }
        const foot = document.createElement("button");
        foot.type = "button";
        foot.className = "duel__next";
        foot.textContent = picked.correct ? "往下" : "往下（输了也走得通）";
        foot.addEventListener("click", (ev) => {
          ev.stopPropagation();
          this.hide();
          resolve(picked.correct);
        });
        this.el.appendChild(foot);
        foot.scrollIntoView({ block: "nearest", behavior: "smooth" });
      };
    });
  }
}

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}
