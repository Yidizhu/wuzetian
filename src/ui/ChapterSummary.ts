import { STAT_KEYS, STAT_LABEL, STAT_MAX } from "../engine/types.ts";
import { relationWord, type RelationTiers } from "../engine/relation.ts";
import type { GameState } from "../engine/state.ts";
import type { PoemT } from "../engine/schema.ts";

export interface SummaryData {
  chapter: number;
  poemsThisChapter: string[];
  /** 这一章和谁走得最近（relation.ts 的 closestThisChapter）。没有就不写那一句 */
  closest?: string | null;
}

/**
 * 章末结算页。三块：四项数值、已结识的人、本章收到的诗。
 *
 * 数值这里也不给精确数字，仍旧是墨线的浓淡。理由和状态条一样：
 * 玩家能感到趋势就够了，读得出精确数值就会开始刷数值，注意力就从人身上挪开了。
 * 关系这一块反过来要具体，因为这个游戏的主线是关系，不是数值。
 */
export class ChapterSummary {
  private el: HTMLElement;

  constructor(root: HTMLElement, private names: Record<string, string>, private poems: Map<string, PoemT>,
    private tiers: RelationTiers) {
    this.el = document.createElement("div");
    this.el.className = "summary";
    this.el.hidden = true;
    root.appendChild(this.el);
  }

  hide(): void { this.el.hidden = true; this.el.innerHTML = ""; }

  show(s: GameState, d: SummaryData): Promise<void> {
    return new Promise((resolve) => {
      this.el.innerHTML = "";
      this.el.hidden = false;

      const title = document.createElement("div");
      title.className = "summary__title";
      title.textContent = d.chapter > 0 ? `第 ${cn(d.chapter)} 章 毕` : "序 毕";
      this.el.appendChild(title);

      // 四项数值
      const stats = document.createElement("div");
      stats.className = "summary__stats";
      for (const k of STAT_KEYS) {
        const t = Math.max(0, Math.min(1, s.stats[k] / STAT_MAX));
        const cell = document.createElement("div");
        cell.className = "summary__stat";
        cell.innerHTML =
          `<div class="summary__bar" data-tone="${Math.min(4, Math.floor(t * 5))}" style="--fill:${18 + t * 82}%"></div>` +
          `<div class="summary__statLabel">${STAT_LABEL[k]}</div>`;
        stats.appendChild(cell);
      }
      this.el.appendChild(stats);

      // 已结识的人（D-154，CC1 改）。原来旁边写的是按好感数算的识／契／盟，而那三档的下限正好是专属闲场的门槛——
      // 玩家看得出自己刚跨过一道门。改成按「这个人的专属闲场你走进去过哪一档」给关系词（engine/relation.ts），
      // 排序也不按好感数排：按词从深到浅，同一档里照名字表的顺序，不让名次泄露差了几分
      const met = Object.keys(s.affinity)
        .map((key) => [key, relationWord(key, s, this.tiers)] as const)
        .filter((x): x is readonly [string, string] => !!x[1]);
      const people = document.createElement("div");
      people.className = "summary__block";
      people.innerHTML = `<div class="summary__head">已识之人</div>`;
      if (d.closest && this.names[d.closest]) {
        const near = document.createElement("div");
        near.className = "summary__closest";
        near.textContent = `这一章，你和${this.names[d.closest]}走得最近。`;
        people.appendChild(near);
      }
      if (!met.length) {
        people.innerHTML += `<div class="summary__empty">还没有人。这一章她只在看。</div>`;
      } else {
        const ul = document.createElement("div");
        ul.className = "summary__people";
        const order = Object.keys(this.names);
        const depth = (w: string) => ["有来往", "常来常往", "相知", "心照"].indexOf(w);
        met.sort((a, b) => depth(b[1]) - depth(a[1]) || order.indexOf(a[0]) - order.indexOf(b[0]));
        for (const [key, word] of met) {
          const row = document.createElement("div");
          row.className = "summary__person";
          row.innerHTML = `<span class="summary__name"></span><span class="summary__band"></span>`;
          row.querySelector(".summary__band")!.textContent = word;
          row.querySelector(".summary__name")!.textContent = this.names[key] ?? key;
          ul.appendChild(row);
        }
        people.appendChild(ul);
      }
      this.el.appendChild(people);

      // 本章收到的诗
      const poems = document.createElement("div");
      poems.className = "summary__block";
      poems.innerHTML = `<div class="summary__head">本章所得</div>`;
      if (!d.poemsThisChapter.length) {
        poems.innerHTML += `<div class="summary__empty">这一章没有诗。</div>`;
      } else {
        for (const id of d.poemsThisChapter) {
          const p = this.poems.get(id);
          const row = document.createElement("div");
          row.className = "summary__poem";
          row.innerHTML = `<div class="summary__poemLine"></div><div class="summary__poemFrom"></div>`;
          row.querySelector(".summary__poemLine")!.textContent = p ? p.lines.join("　") : id;
          row.querySelector(".summary__poemFrom")!.textContent = p ? `${p.author}《${p.title}》` : "";
          poems.appendChild(row);
        }
      }
      this.el.appendChild(poems);

      const next = document.createElement("button");
      next.type = "button";
      next.className = "summary__next";
      next.textContent = "往下";
      next.addEventListener("click", (ev) => { ev.stopPropagation(); this.hide(); resolve(); });
      this.el.appendChild(next);
    });
  }
}

const CN = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
function cn(n: number): string { return CN[n] ?? String(n); }
