import type { Expr } from "../engine/types.ts";
import { spriteKey } from "../char/sprite-rules.ts";

/**
 * 立绘层。叠在背景层之上、对话框之下。
 *
 * SVG 内联进 DOM 而不是当 <img> 用，因为立绘的墨色和朱砂点要跟着色板走：
 * 文件里写的是 var(--c-ink-1)、var(--c-accent, var(--c-ink-4))，
 * 只有内联才吃得到页面的 CSS 变量。金碧场景里朱砂点自动落到泥金，零逻辑。
 *
 * 三十张 SVG 在构建期打进包里（见 main 的 import.meta.glob），不在运行时 fetch：
 * 单文件 Artifact 没有目录可取，fetch 会 404，人就不见了。
 *
 * 最多同屏两人。说话的人在前，不说话的退半步转淡——这是舞台调度，不是特效。
 * 主体偏左下、留白留在她要走的方向，见 art-style 的 composition.md。
 */
export class CharacterLayer {
  private el: HTMLElement;
  private slots = new Map<string, HTMLElement>();   // 角色 key -> 容器

  /**
   * sprites：`wuze_default` -> SVG 文本。
   * hasFlag：给换图规则用（D-046 第 1 条）。规则表归 CC3，flag 归引擎，这里只是把两边接上。
   */
  constructor(root: HTMLElement, private sprites: Record<string, string>, private hasFlag: (flag: string) => boolean = () => false) {
    this.el = document.createElement("div");
    this.el.className = "cast";
    root.appendChild(this.el);
  }

  private roster: string[] = [];

  /** 场景开始时把在场的人摆好。主角总在左，另一位在右。 */
  async setCast(cast: string[]): Promise<void> {
    this.roster = cast;
    const keep = new Set(cast);
    for (const [k, node] of this.slots) {
      if (!keep.has(k)) { node.remove(); this.slots.delete(k); }
    }
    // 只摆得下两个（art-style）。先摆主角和第一个配角，其余的等她开口再换上来
    const visible = cast.slice(0, 2);
    await Promise.all(visible.map(async (k, i) => {
      let node = this.slots.get(k);
      if (!node) {
        node = document.createElement("div");
        node.className = "cast__slot";
        node.dataset.char = k;
        this.el.appendChild(node);
        this.slots.set(k, node);
        await this.show(k, "default");
      }
      node.dataset.side = i === 0 ? "left" : "right";
    }));
  }

  /**
   * 谁在说话，用什么表情。
   *
   * 一场超过两个人时（第一章的昭阳殿就有三个），说话的那个如果不在台上，
   * 把台上没说话的那个换下去。舞台调度的常识：正在说话的人必须在场，
   * 否则玩家听见名字却看不见人。主角是定海神针，永远不被换下。
   */
  async speak(who: string, expr: Expr = "default"): Promise<void> {
    if (!this.slots.has(who) && this.roster.includes(who)) await this.swapIn(who);
    for (const [k, node] of this.slots) {
      node.dataset.active = k === who ? "1" : "";
    }
    if (this.slots.has(who)) await this.show(who, expr);
  }

  private async swapIn(who: string): Promise<void> {
    const out = [...this.slots.keys()].find((k) => k !== "wuze") ?? [...this.slots.keys()][0];
    if (!out) return;
    const side = this.slots.get(out)!.dataset.side ?? "right";
    this.slots.get(out)!.remove();
    this.slots.delete(out);
    const node = document.createElement("div");
    node.className = "cast__slot";
    node.dataset.char = who;
    node.dataset.side = side;
    this.el.appendChild(node);
    this.slots.set(who, node);
    await this.show(who, "default");
  }

  /** 主角做出不可逆决定的那一刻，她的朱砂点亮回朱砂，哪怕在金碧场景里 */
  flare(who: string): void {
    const node = this.slots.get(who);
    if (!node) return;
    node.dataset.flare = "1";
  }

  clear(): void {
    this.el.innerHTML = "";
    this.slots.clear();
  }

  private async show(who: string, expr: Expr): Promise<void> {
    const node = this.slots.get(who);
    if (!node) return;
    // 缓存按「最终用哪张图」记，不按表情记：同一个表情在归还戏之后要换成 _bare，
    // 按表情记的话，flag 变了图也不会变。
    const want = spriteKey(who, expr, this.hasFlag);
    const name = this.sprites[want] ? want : `${who}_${expr}`;   // 表里写了但图不在：退回原图，不白屏
    if (node.dataset.sprite === name) return;
    const svg = await this.load(name);
    if (!svg) return;
    node.innerHTML = svg;
    node.dataset.expr = expr;
    node.dataset.sprite = name;
  }

  /** flag 变了之后重新对一遍台上的人（归还戏的出口会用到） */
  async refresh(): Promise<void> {
    for (const [who, node] of this.slots) {
      await this.show(who, (node.dataset.expr as Expr) || "default");
    }
  }

  private async load(name: string): Promise<string | null> {
    const svg = this.sprites[name];
    if (!svg) { console.warn(`[cast] 找不到立绘 ${name}`); return null; }
    return svg;
  }
}
