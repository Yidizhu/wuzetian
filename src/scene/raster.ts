/**
 * 光栅图（D-095）的清单与地址。纯函数，不碰 DOM，Node 里能测。
 *
 * **默认是关的**：`public/char/`、`public/scene/` 现在是空的，清单为空，立绘和背景全走 SVG／渐变。
 * 谁来开：CC3 的 `art:post` 往那两个目录出验收过的 webp，下一次构建就用上，一行代码都不用改。
 * `?art=svg` 强制关掉，拿来对比新旧。
 *
 * 新旧并存（engine-cc1-b16-png.md 第三节）：每一处取图都是「一串候选、第一张在的就用」，
 * 光栅图排在最前面，SVG／渐变永远在最后。**图读不出来（网络、单文件版里根本没有这些文件）也退回旧的**，
 * 不白屏——`markBroken` 记下来，下一次选图就跳过它。
 */
export interface RasterList {
  full: string[];
  knee: string[];
  scenes: string[];
  /** 事件图（B23）。老清单没有这一项，按空算 */
  cgs?: string[];
  /** 声音桥的音效（B36，public/sfx/*.m4a，不带扩展名）。图不用它，放在这张清单里只是同一次扫盘 */
  sfx?: string[];
}

export class RasterCatalog {
  private full: Set<string>;
  private knee: Set<string>;
  private scenes: Set<string>;
  private cgs: Set<string>;
  private broken = new Set<string>();
  private base: string;

  constructor(list: RasterList, base = "./") {
    this.full = new Set(list.full);
    this.knee = new Set(list.knee);
    this.scenes = new Set(list.scenes);
    this.cgs = new Set(list.cgs ?? []);
    this.base = base.endsWith("/") ? base : base + "/";
  }

  static empty(): RasterCatalog {
    return new RasterCatalog({ full: [], knee: [], scenes: [], cgs: [] });
  }

  /** 候选里第一张有全身图、也没读坏过的立绘名。没有就是 null：这个人继续用 SVG */
  pickPortrait(candidates: string[]): string | null {
    return candidates.find((k) => this.full.has(k) && !this.broken.has(`char/${k}`)) ?? null;
  }

  /** 这张立绘的地址。膝上图没出就用全身（CSS 按全身摆，不会糊成一张放大的半身） */
  portraitUrl(name: string, framing: "full" | "knee"): { url: string; framing: "full" | "knee" } {
    const f = framing === "knee" && this.knee.has(name) ? "knee" : "full";
    return { url: `${this.base}char/${f}/${name}.webp`, framing: f };
  }

  hasBackdrop(key: string): boolean {
    return this.scenes.has(key) && !this.broken.has(`scene/${key}`);
  }

  /** 这一条实际用哪张图：自己有就用自己的，没有就看它借谁的（backdrops.ts 的 from）。都没有是 null */
  resolveBackdrop(key: string, from?: string): string | null {
    if (this.hasBackdrop(key)) return key;
    if (from && this.hasBackdrop(from)) return from;
    return null;
  }

  backdropUrl(key: string): string {
    return `${this.base}scene/${key}.webp`;
  }

  hasCg(key: string): boolean {
    return this.cgs.has(key) && !this.broken.has(`cg/${key}`);
  }

  cgUrl(key: string): string {
    return `${this.base}cg/${key}.webp`;
  }

  /** 读不出来的图记一笔，之后不再选它。`path` 是 `char/<name>`、`scene/<key>` 或 `cg/<key>` */
  markBroken(path: string): void {
    this.broken.add(path);
  }
}

/**
 * 这一格用全身还是膝上（D-108 第 2 条）：**这一格有选项就用全身，其余用膝上。**
 * 要做决定的时候镜头退开，看得见她整个人。零新字段，引擎本来就知道哪一格有选项。
 */
export function framingFor(beat: "line" | "choices"): "full" | "knee" {
  return beat === "choices" ? "full" : "knee";
}
