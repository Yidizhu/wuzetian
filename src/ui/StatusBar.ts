import { STAT_KEYS, STAT_LABEL, STAT_MAX, type StatKey } from "../engine/types.ts";
import type { GameState } from "../engine/state.ts";

/**
 * 状态条。不用进度条：势名才心各是一根竖直的墨线，用墨色浓淡表示高低。
 *
 * 这样做有两个好处。墨色本身就是数值，符合美学而不是硬贴上去的；
 * 同时它天然模糊，玩家能感到趋势但读不出精确数字，这正好压掉刷数值的冲动，
 * 让注意力回到关系上。见 art-style 的 ui.md。
 */
export class StatusBar {
  private el: HTMLElement;
  private bars = new Map<StatKey, HTMLElement>();
  private last = new Map<StatKey, number>();

  constructor(root: HTMLElement) {
    this.el = document.createElement("div");
    this.el.className = "status";     // 落在右上题跋区
    for (const k of STAT_KEYS) {
      const cell = document.createElement("div");
      cell.className = "status__cell";
      const line = document.createElement("div");
      line.className = "status__line";
      const label = document.createElement("div");
      label.className = "status__label";
      label.textContent = STAT_LABEL[k];
      cell.append(line, label);
      this.el.appendChild(cell);
      this.bars.set(k, line);
    }
    root.appendChild(this.el);
  }

  update(s: GameState): void {
    for (const k of STAT_KEYS) {
      const line = this.bars.get(k)!;
      const v = s.stats[k];
      const t = Math.max(0, Math.min(1, v / STAT_MAX));
      // 从清墨到焦墨的五级色阶，不做连续渐变——水墨是分级的，不是渐变的
      line.dataset.tone = String(Math.min(4, Math.floor(t * 5)));
      line.style.setProperty("--fill", `${18 + t * 82}%`);
      const prev = this.last.get(k);
      if (prev !== undefined && prev !== v) {
        // 变化时那根线做一次墨晕扩散，不弹数字
        line.classList.remove("status__line--bloom");
        void line.offsetWidth;
        line.classList.add("status__line--bloom");
      }
      this.last.set(k, v);
    }
  }
}
