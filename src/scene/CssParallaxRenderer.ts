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

  /** 正在取的图：进场和预取可能同时要同一张，只取一次（D-211） */
  private loading = new Map<string, Promise<void>>();

  async load(d: SceneDescriptor): Promise<void> {
    // 引擎先 await load 再 show：图在这里解码完，交叉的那一下它已经在内存里。
    // 引擎还会拿下一场的描述符提前调一次（story.ts 的 prefetch），那一次的结果就存在 ready 里
    const key = backdropKey(d);
    const src = this.raster.resolveBackdrop(key, BACKDROPS[key]?.from);
    if (!src || this.ready.has(key)) return;
    let job = this.loading.get(key);
    if (!job) {
      job = this.fetchImage(key, src).finally(() => this.loading.delete(key));
      this.loading.set(key, job);
    }
    return job;
  }

  /**
   * D-211：慢网上一次读不出来不等于没有这张图。再试一次才算坏——
   * 记成坏图这一局就一直是渐变底，渐变底只该给「确实没有图」的场
   */
  private async fetchImage(key: string, src: string): Promise<void> {
    const url = this.raster.backdropUrl(src);
    for (let attempt = 0; attempt < 2; attempt++) {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      try {
        await img.decode();
        this.ready.set(key, url);
        return;
      } catch { /* 再试一次 */ }
    }
    console.warn(`[stage] 背景图读不出来，这一场退回渐变：${url}`);
    this.raster.markBroken(`scene/${src}`);
  }

  /**
   * 换景（D-211，B41 重写）。**旧景一直在，新景解码好了才交叉**：
   * 原来是整层先淡到纸色（stage--wiping）、换图、再淡回来，手机上看就是「先空一下再出新景」；
   * 而且 CSS 背景图在 WebKit 里解码完也可能晚一帧才画，空的那一下更长。
   *
   * 现在：新景铺在旧景上面一层，透明度 0；等浏览器画过两帧，新景淡入 420ms（CROSS_MS）；盖满之后拿掉旧景。
   * 旧景在交叉期间把自己的滤镜和推近位置冻住——根上的 data-tone／data-night 换成新景的，旧景不能跟着变色。
   * 两场都没有图（纯渐变）照旧走墨晕开那一下。
   */
  async show(d: SceneDescriptor): Promise<void> {
    const look = LOOKS[d.key];
    const [sky, mid, ground] = this.layers as [HTMLElement, HTMLElement, HTMLElement];
    const key = backdropKey(d);
    await this.load(d);                      // 进场时已经 await 过；读档直接 show 的路也不许先空
    const url = this.ready.get(key);
    const old = this.image;
    const hadImage = !!this.root.dataset.image;

    if (!url && !hadImage) {
      // 渐变 → 渐变：原来的墨晕开
      this.root.classList.add("stage--wiping");
      await wait(180);
      this.paintGradient(look, sky, mid, ground);
      this.root.classList.remove("stage--wiping");
      await wait(320);
      return;
    }

    // 旧景冻住：自己的滤镜、推到哪儿了，都写成行内的，不再跟根上的属性走
    if (old) {
      const cs = getComputedStyle(old);
      old.style.filter = cs.filter;
      old.style.transform = cs.transform;
      old.style.animation = "none";
      old.style.opacity = hadImage ? "1" : "0";
    }

    this.paintGradient(look, sky, mid, ground);   // 在图底下，有图时 CSS 把它收掉

    if (url) {
      const b = BACKDROPS[key] ?? { where: "" };
      const next = document.createElement("div");
      next.className = "stage__layer stage__image";
      next.style.backgroundImage = `url("${url}")`;
      next.style.opacity = "0";
      next.style.transition = `opacity ${CROSS_MS}ms ease`;
      if (old) old.after(next);
      else this.root.insertBefore(next, this.root.querySelector(".stage__paper"));
      this.image = next;
      this.root.dataset.image = "1";
      this.root.dataset.push = b.push ?? "center";
      this.root.dataset.night = b.night ? "1" : "";
      // 借来的图套一层色调滤镜（B21）；图本身就是夜景的，背景不再压夜（D-121 的例外）
      if (b.tone) this.root.dataset.tone = b.tone; else delete this.root.dataset.tone;
      if (b.paintedNight) this.root.dataset.painted = "night"; else delete this.root.dataset.painted;
      if (b.floor !== undefined) document.documentElement.style.setProperty("--stage-floor", `${b.floor}%`);
      if (b.person !== undefined) document.documentElement.style.setProperty("--stage-person", String(b.person));
      next.classList.add("stage__image--push");     // 新的一层，推近从头起
      await frames(2);                              // 让浏览器先把这张背景画上，再开始淡入
      next.style.opacity = "";                      // 回到 CSS 的 1，走上面那条 transition
      await wait(CROSS_MS + 40);
    } else if (old) {
      // 有图 → 没图（确实没有这张图）：旧景淡出，露出底下的渐变
      old.style.transition = `opacity ${CROSS_MS}ms ease`;
      await frames(1);
      old.style.opacity = "0";
      await wait(CROSS_MS + 40);
      const empty = document.createElement("div");
      empty.className = "stage__layer stage__image";
      old.after(empty);
      this.image = empty;
      delete this.root.dataset.image;
      delete this.root.dataset.push;
      delete this.root.dataset.tone;
      delete this.root.dataset.painted;
      this.root.dataset.night = look.night ? "1" : "";
    }
    if (old && old !== this.image) old.remove();
  }

  private paintGradient(look: SceneLook, sky: HTMLElement, mid: HTMLElement, ground: HTMLElement): void {
    sky.style.background = `radial-gradient(ellipse ${look.sky})`;
    mid.style.background = `radial-gradient(ellipse ${look.mid})`;
    ground.style.background = `radial-gradient(ellipse ${look.ground})`;
    if (!this.root.dataset.image) this.root.dataset.night = look.night ? "1" : "";
    // CSS 版没有真的地平线，给立绘层一个固定值。变量的说明见 ThreeStageRenderer.markFloor
    document.documentElement.style.setProperty("--stage-floor", "22%");
    // 3D 舞台会把人收小（--stage-person），退回 CSS 版时要还原，不然人就一直是小的
    document.documentElement.style.setProperty("--stage-person", "1");
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
    delete this.root.dataset.tone;
    delete this.root.dataset.painted;
    this.layers = [];
    this.image = null;
    this.ready.clear();
  }
}

/** 新旧两张景交叉多久（D-211） */
const CROSS_MS = 420;

function frames(n: number): Promise<void> {
  return new Promise((r) => {
    const step = (left: number): void => { if (left <= 0) r(); else requestAnimationFrame(() => step(left - 1)); };
    step(n);
  });
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => window.setTimeout(r, ms));
}
