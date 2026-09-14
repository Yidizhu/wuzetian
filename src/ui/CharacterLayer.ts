import type { Expr } from "../engine/types.ts";
import { spriteCandidates, rasterCandidates, type SpriteContext } from "../engine/identity.ts";
import { RasterCatalog } from "../scene/raster.ts";

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
 *
 * **光栅立绘（D-095，B17）**：一个人有了验收过的 webp，就换成 `<img>`，否则照旧内联 SVG。
 * 选哪张见 `engine/identity.ts` 的 `rasterCandidates`；图读不出来记一笔、退回 SVG，不白屏。
 * 光栅图才有全身／膝上两种框法（D-108 第 2 条），SVG 永远是全身。
 */
export class CharacterLayer {
  private el: HTMLElement;
  private slots = new Map<string, HTMLElement>();   // 角色 key -> 容器

  /**
   * sprites：`wuze_default` -> SVG 文本。
   * hasFlag：给换图规则用（D-046 第 1 条）。规则表归 CC3，flag 归引擎，这里只是把两边接上。
   */
  private sprites: Record<string, string>;
  private hasFlag: (flag: string) => boolean;
  private raster: RasterCatalog;
  /** 这一场的布置。李令仪的礼衣看它（D-108 第 3 条） */
  private dressing = "";
  /** 这一格用全身还是膝上（D-108 第 2 条），只对光栅图有意义 */
  private framing: "full" | "knee" = "knee";

  constructor(root: HTMLElement, sprites: Record<string, string>, hasFlag: (flag: string) => boolean = () => false,
    raster: RasterCatalog = RasterCatalog.empty()) {
    this.sprites = sprites;
    this.hasFlag = hasFlag;
    this.raster = raster;
    this.el = document.createElement("div");
    this.el.className = "cast";
    root.appendChild(this.el);
  }

  private get ctx(): SpriteContext {
    return { has: this.hasFlag, dressing: this.dressing };
  }

  /** 换场时给这一场的布置，在 setCast 之前调 */
  setDressing(dressing: string): void {
    this.dressing = dressing;
  }

  /**
   * 全身还是膝上。有选项的那一格给 full，其余给 knee（`scene/raster.ts` 的 `framingFor`）。
   * 台上是 SVG 的人不受影响；光栅图就地换成对应那一张。
   */
  setFraming(framing: "full" | "knee"): void {
    if (this.framing === framing) return;
    this.framing = framing;
    this.el.dataset.framing = framing;
    void this.refresh();
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
    // SVG 上是朱砂点亮回朱砂；光栅图上没有能单独变色的点，改成整个人一次很淡的暖光、脚下墨影加深（D-108 第 1 条）。
    // 两种样式都挂在同一个 data-flare 上，见 app.css 与 raster.css
    node.dataset.flare = "1";
  }

  clear(): void {
    this.el.innerHTML = "";
    this.slots.clear();
  }

  private async show(who: string, expr: Expr): Promise<void> {
    const node = this.slots.get(who);
    if (!node) return;
    // 缓存按「最终用哪张图」记，不按表情记：同一个表情在归还戏之后要换成 _bare、
    // 主角受位之后要换袍色（D-091），按表情记的话，flag 变了图也不会变。
    node.dataset.expr = expr;

    // 光栅图优先。一个人一旦有了，三种表情都用它，不回到 SVG（identity.ts 的 rasterCandidates）
    const pic = this.raster.pickPortrait(rasterCandidates(who, this.ctx));
    if (pic) {
      const { url, framing } = this.raster.portraitUrl(pic, this.framing);
      const key = `img:${url}`;
      if (node.dataset.sprite === key) return;
      const img = new Image();
      img.alt = "";
      img.decoding = "async";
      img.src = url;
      try {
        await img.decode();          // 解码完再换上：换的那一下不闪白
      } catch {
        // 读不出来（网络、单文件版里根本没有这个文件）：记一笔，这个人退回 SVG
        console.warn(`[cast] 光栅立绘读不出来，退回 SVG：${url}`);
        this.raster.markBroken(`char/${pic}`);
        return this.show(who, expr);
      }
      if (this.slots.get(who) !== node) return;   // 解码的这一会儿人被换下去了
      node.replaceChildren(img);
      node.dataset.sprite = key;
      node.dataset.raster = framing;
      return;
    }

    // 候选按顺序试，第一张在的就用；都不在就是原图，不白屏
    const name = spriteCandidates(who, expr, this.ctx).find((n) => this.sprites[n]) ?? `${who}_${expr}`;
    if (node.dataset.sprite === name) return;
    const svg = await this.load(name);
    if (!svg) return;
    node.innerHTML = svg;
    node.dataset.sprite = name;
    delete node.dataset.raster;
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
