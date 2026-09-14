import type { SceneDescriptor, SceneRenderer } from "./SceneRenderer.ts";
import type { SceneKey } from "../engine/types.ts";
import { RasterCatalog } from "./raster.ts";
import { BACKDROPS, backdropKey } from "./backdrops.ts";

/**
 * CSS 多层视差版背景。M1 的默认实现，也是 M5 性能不达标时的退路。
 *
 * 三段式（天 / 人 / 地）见 art-style 的 composition.md：
 * 天是纯留白或极淡墨晕，地是墨晕加噪声，中间留给主体。
 * 现在还没有美术资产，先用 CSS 渐变按每个场景的光线方向生成。
 *
 * **整图（D-095，B17）**：这一场的「地点·色板·布置」在 `public/scene/` 里有验收过的 webp，
 * 就在三层之上铺一层整图，停掉指针视差，改整图缓慢推近（CSS 动画，见 raster.css）；
 * 夜场同一张日景套冷暗滤镜（D-107）。没有图就和原来一模一样。图读不出来也退回渐变。
 * **默认是关的**：现在一张背景图都没有。
 */

interface SceneLook {
  /** 天：远处的墨晕位置与浓淡 */
  sky: string;
  /** 人：中景的一两笔 */
  mid: string;
  /** 地：墨晕，边缘软、内部不均 */
  ground: string;
  /** 夜场用更深的纸色 */
  night?: boolean;
}

// 写成 SceneKey | "yilu"：第九个地点（D-062）CC1 加进 SceneKey 之前，这张表先备好，加上之后也不报错
const LOOKS: Record<SceneKey | "yilu", SceneLook> = {
  // 清晨薄雾，侧逆光。墨都压在左下，右上大片留白
  yeting:   { sky: "at 74% 8%, var(--c-ink-4) 0%, transparent 26%",
              mid: "at 18% 70%, var(--c-ink-3) 0%, transparent 24%",
              ground: "at 30% 97%, var(--c-ink-2) 0%, transparent 30%" },
  // 正午硬光，影子短而硬
  zhaoyang: { sky: "at 50% 2%, var(--c-ink-3) 0%, transparent 18%",
              mid: "at 70% 62%, var(--c-ink-2) 0%, transparent 20%",
              ground: "at 50% 99%, var(--c-ink-1) 0%, transparent 22%" },
  // 午后斜光穿窗棂
  shuge:    { sky: "at 88% 12%, var(--c-ink-4) 0%, transparent 28%",
              mid: "at 22% 66%, var(--c-ink-2) 0%, transparent 22%",
              ground: "at 36% 98%, var(--c-ink-3) 0%, transparent 26%" },
  // 阴天漫射，几乎没有影子
  nvguan:   { sky: "at 50% 14%, var(--c-ink-4) 0%, transparent 34%",
              mid: "at 32% 74%, var(--c-ink-3) 0%, transparent 20%",
              ground: "at 50% 99%, var(--c-ink-4) 0%, transparent 26%" },
  // 黄昏，水面反光
  shishe:   { sky: "at 14% 10%, var(--c-ink-4) 0%, transparent 24%",
              mid: "at 74% 66%, var(--c-ink-2) 0%, transparent 20%",
              ground: "at 58% 95%, var(--c-ink-3) 0%, transparent 32%" },
  // 月光冷，只见轮廓
  yuanye:   { sky: "at 82% 6%, var(--c-ink-3) 0%, transparent 22%",
              mid: "at 28% 68%, var(--c-line) 0%, transparent 16%",
              ground: "at 40% 99%, var(--c-ink-1) 0%, transparent 24%", night: true },
  // 逆光剪影，人极小
  hanyuan:  { sky: "at 50% 4%, var(--c-ink-4) 0%, transparent 30%",
              mid: "at 50% 78%, var(--c-line) 0%, transparent 10%",
              ground: "at 50% 99%, var(--c-ink-2) 0%, transparent 18%" },
  // 正面平光，天占七成
  wuzibei:  { sky: "at 50% 24%, var(--c-ink-4) 0%, transparent 20%",
              mid: "at 46% 84%, var(--c-line) 0%, transparent 9%",
              ground: "at 46% 99%, var(--c-ink-3) 0%, transparent 20%" },
  // 驿路：路从左下进来往右上收，尽头是空的
  yilu:     { sky: "at 70% 30%, var(--c-ink-4) 0%, transparent 26%",
              mid: "at 24% 58%, var(--c-ink-3) 0%, transparent 18%",
              ground: "at 36% 99%, var(--c-ink-3) 0%, transparent 30%" },
};

export class CssParallaxRenderer implements SceneRenderer {
  readonly name = "css-parallax";
  private root!: HTMLElement;
  private layers: HTMLElement[] = [];
  private image: HTMLElement | null = null;
  private raster: RasterCatalog;
  /** load() 解码好的那张图，show() 换上 */
  private ready = new Map<string, string>();
  private onPointer = (e: PointerEvent) => { if (!this.root.dataset.image) this.parallax(e.clientX, e.clientY); };

  constructor(raster: RasterCatalog = RasterCatalog.empty()) {
    this.raster = raster;
  }

  mount(root: HTMLElement): void {
    this.root = root;
    root.classList.add("stage", "stage--css");
    for (const cls of ["stage__sky", "stage__mid", "stage__ground"]) {
      const el = document.createElement("div");
      el.className = `stage__layer ${cls}`;
      root.appendChild(el);
      this.layers.push(el);
    }
    // 整图那一层，压在三层渐变之上、纸纹之下。没有图的场景它是空的、藏着
    const image = document.createElement("div");
    image.className = "stage__layer stage__image";
    root.appendChild(image);
    this.image = image;
    const paper = document.createElement("div");
    paper.className = "stage__paper";     // 全屏纸纹，multiply
    root.appendChild(paper);
    window.addEventListener("pointermove", this.onPointer, { passive: true });
  }

  async load(d: SceneDescriptor): Promise<void> {
    // 引擎先 await load 再 show：图在这里解码完，墨晕开的那一下它已经在内存里，不会先白一下
    const key = backdropKey(d);
    if (!this.raster.hasBackdrop(key) || this.ready.has(key)) return;
    const url = this.raster.backdropUrl(key);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try {
      await img.decode();
      this.ready.set(key, url);
    } catch {
      console.warn(`[stage] 背景图读不出来，这一场退回渐变：${url}`);
      this.raster.markBroken(`scene/${key}`);
    }
  }

  async show(d: SceneDescriptor): Promise<void> {
    const look = LOOKS[d.key];
    const [sky, mid, ground] = this.layers as [HTMLElement, HTMLElement, HTMLElement];
    // 墨晕开：先把整层遮住，换完内容再散开。见 art-style 的 ui.md。
    this.root.classList.add("stage--wiping");
    await wait(180);
    sky.style.background = `radial-gradient(ellipse ${look.sky})`;
    mid.style.background = `radial-gradient(ellipse ${look.mid})`;
    ground.style.background = `radial-gradient(ellipse ${look.ground})`;
    this.root.dataset.night = look.night ? "1" : "";
    // CSS 版没有真的地平线，给立绘层一个固定值。变量的说明见 ThreeStageRenderer.markFloor
    document.documentElement.style.setProperty("--stage-floor", "22%");
    // 3D 舞台会把人收小（--stage-person），退回 CSS 版时要还原，不然人就一直是小的
    document.documentElement.style.setProperty("--stage-person", "1");

    // 整图：有就铺上，按背景表摆（脚线、人多大、往哪推、夜不夜）
    const key = backdropKey(d);
    const url = this.ready.get(key);
    if (url && this.image) {
      const b = BACKDROPS[key] ?? { where: "" };
      this.image.style.backgroundImage = `url("${url}")`;
      this.root.dataset.image = "1";
      this.root.dataset.push = b.push ?? "center";
      this.root.dataset.night = b.night ? "1" : "";
      if (b.floor !== undefined) document.documentElement.style.setProperty("--stage-floor", `${b.floor}%`);
      if (b.person !== undefined) document.documentElement.style.setProperty("--stage-person", String(b.person));
      // 换场从头推起：动画重置一次
      this.image.classList.remove("stage__image--push");
      void this.image.offsetWidth;
      this.image.classList.add("stage__image--push");
    } else if (this.image) {
      this.image.style.backgroundImage = "";
      delete this.root.dataset.image;
      delete this.root.dataset.push;
    }
    this.root.classList.remove("stage--wiping");
    await wait(320);
  }

  beat(name: string): void {
    // CSS 版的「缓慢推拉」就是一次很轻的整体缩放
    this.root.classList.add("stage--beat");
    window.setTimeout(() => this.root.classList.remove("stage--beat"), 900);
    if (name) this.root.dataset.beat = name;
  }

  resize(_w: number, _h: number): void {
    // 层是百分比定位的，浏览器自己会处理
  }

  private parallax(x: number, y: number): void {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    const dx = (x / w - 0.5) * 2;
    const dy = (y / h - 0.5) * 2;
    // 越远的层动得越少，这是纵深感的来源
    this.layers[0]?.style.setProperty("--px", `${dx * 4}px`);
    this.layers[0]?.style.setProperty("--py", `${dy * 3}px`);
    this.layers[1]?.style.setProperty("--px", `${dx * 10}px`);
    this.layers[1]?.style.setProperty("--py", `${dy * 7}px`);
    this.layers[2]?.style.setProperty("--px", `${dx * 16}px`);
    this.layers[2]?.style.setProperty("--py", `${dy * 10}px`);
  }

  dispose(): void {
    window.removeEventListener("pointermove", this.onPointer);
    this.root.innerHTML = "";
    this.root.classList.remove("stage", "stage--css");
    delete this.root.dataset.image;
    delete this.root.dataset.push;
    this.layers = [];
    this.image = null;
    this.ready.clear();
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => window.setTimeout(r, ms));
}
