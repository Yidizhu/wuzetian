import { RasterCatalog } from "../scene/raster.ts";
import { CGS, placeOnImage } from "../scene/cgs.ts";
import "../styles/picture.css";

/**
 * 事件图层（D-142，B23）。**复用背景整图那一套**：一张整图盖住画面、一拍墨晕过渡、点一下退回。不新建渲染器。
 *
 * 盖在背景和立绘之上、对话框之下。事件图里已经有人了，立绘不另外收——整图不透明，本来就被盖住；
 * 退回的时候台上的人还在原处，不用重新摆。
 *
 * 第一次解锁停一拍才认点击（照结局卡第一拍，D-084）；之后每次经过都播，点一下就退。
 * 图没有、读不出来：`show` 立刻返回 false，引擎当这一格不存在。
 */

/** 第一次解锁时，停多久才认点击（毫秒）。和结局卡第一拍同一个数 */
export const CG_FIRST_HOLD_MS = 1500;
/** 进、出的墨晕过渡（毫秒），和 cg.css 里的过渡对上 */
const FADE_MS = 520;

export class CgLayer {
  private root: HTMLElement;
  private raster: RasterCatalog;
  private el: HTMLElement | null = null;
  private releaseFn: (() => void) | null = null;

  constructor(root: HTMLElement, raster: RasterCatalog) {
    this.root = root;
    this.raster = raster;
  }

  /** 正在看图时点一下：交给这里。不在看图时返回 false，点击照常走 */
  release(): boolean {
    if (!this.releaseFn) return false;
    this.releaseFn();
    return true;
  }

  /** `onRelease`：点下去、图开始淡出之前调一次——图还盖着舞台，台上换衣这时候换看不见（D-205） */
  async show(key: string, first: boolean, onRelease?: () => void): Promise<boolean> {
    const m = await this.mount(key, null);
    if (!m) return false;
    const { el, unfit } = m;

    const at = performance.now();
    await new Promise<void>((resolve) => {
      this.releaseFn = () => {
        if (first && performance.now() - at < CG_FIRST_HOLD_MS) return;   // 第一次：手还在连点，这一下不算
        this.releaseFn = null;
        resolve();
      };
    });

    onRelease?.();
    el.dataset.state = "out";
    unfit();
    await new Promise((r) => window.setTimeout(r, FADE_MS));
    el.remove();
    if (this.el === el) this.el = null;
    return true;
  }

  /**
   * 结局图（D-160，B27）：结局卡第一拍铺上就返回，**不自己等点击**——那一拍停多久、点哪一下算数，main 的结局第一拍在管。
   * 第二拍 `#app[data-ending="text"]` 时 cg.css 默认把它收掉；读档、换场 `clear()` 拿走。
   * `seal` 给了就在图上盖印（D-067，只有无字之碑），印文由调用方给（endings.ts sealGlyph）
   */
  async holdEnding(key: string, seal: string | null): Promise<boolean> {
    const m = await this.mount(key, seal);
    if (!m) return false;
    m.el.dataset.role = "ending";
    return true;
  }

  // ------------------------------------------------------------ 同一拍的画面（D-223，B45）

  /** 台词格上铺着的那张画面，和上面的事件图（this.el）是两个元素，互不干扰 */
  private picture: { key: string; el: HTMLElement; unfit: () => void } | null = null;
  /** 解码是异步的：格翻得快时只让最后一次落地 */
  private pictureToken = 0;

  /**
   * 这一格要铺 `key`（D-223）。**同一个 key 已经铺着就不动**——连着几格同一张图不闪。
   * 换了 key：新图解码好了铺在旧图上面，淡入后拿掉旧的（和换景同一个办法，不先空一下）。
   * 返回这张图是不是真的铺上了（图没有、读不出来、被下一格抢先：false）
   */
  async hold(key: string): Promise<boolean> {
    if (this.picture?.key === key) return true;
    const token = ++this.pictureToken;
    const m = await this.mount(key, null, false);
    if (!m) return false;
    if (token !== this.pictureToken) { m.unfit(); m.el.remove(); return false; }
    m.el.dataset.role = "line";
    const old = this.picture;
    this.picture = { key, el: m.el, unfit: m.unfit };
    if (old) this.fadeOut(old);
    return true;
  }

  /** 这一格没有画面：收掉，退回舞台 */
  drop(): void {
    this.pictureToken += 1;
    const old = this.picture;
    this.picture = null;
    if (old) this.fadeOut(old);
  }

  /** 现在铺着的画面 key，没有是 null */
  get holding(): string | null { return this.picture?.key ?? null; }

  private fadeOut(p: { el: HTMLElement; unfit: () => void }): void {
    p.unfit();
    p.el.dataset.state = "out";
    window.setTimeout(() => p.el.remove(), FADE_MS);
  }

  private async mount(key: string, sealText: string | null, own = true): Promise<{ el: HTMLElement; unfit: () => void } | null> {
    if (!this.raster.hasCg(key)) return null;
    const url = this.raster.cgUrl(key);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try {
      await img.decode();                  // 解码完再铺：墨晕散开的那一下图已经在
    } catch {
      console.warn(`[cg] 事件图读不出来，这一格跳过：${url}`);
      this.raster.markBroken(`cg/${key}`);
      return null;
    }

    const el = document.createElement("div");
    el.className = "cg";
    el.dataset.state = "in";
    el.style.backgroundImage = `url("${url}")`;
    // 怎么铺（D-150）：看图本身的宽高和屏幕的宽高，不看表。
    //   图比屏幕「瘦」得多（竖图上宽屏）：整张放进来，两侧用同一张图虚化填满——留白可解，裁掉人不可解；
    //   其余（横图上手机、竖图上手机、横图上宽屏）：铺满，按焦点对齐，横图在手机上裁的是焦点两边
    const row = CGS[key];
    const focus = row?.focus ?? { x: 50, y: 50 };
    el.style.setProperty("--cg-x", `${focus.x}%`);
    el.style.setProperty("--cg-y", `${focus.y}%`);
    // 印（D-067）：跟着图走，不跟着屏幕走。表里没写位置就不盖——盖错地方比不盖更糟，check:art 会拦下没写的
    let seal: HTMLElement | null = null;
    if (sealText && row?.seal) {
      seal = document.createElement("div");
      seal.className = "cg__seal";
      seal.setAttribute("aria-hidden", "true");
      seal.textContent = sealText;
      el.appendChild(seal);
    } else if (sealText) {
      console.warn(`[cg] ${key} 要盖印，但 cgs.ts 里没写 seal 位置，这一次不盖`);
    }
    const fit = (): void => {
      const box = this.root.getBoundingClientRect();
      const imgAspect = img.naturalWidth / Math.max(1, img.naturalHeight);
      const boxAspect = box.width / Math.max(1, box.height);
      const mode = imgAspect < boxAspect * 0.8 ? "contain" : "cover";
      el.dataset.fit = mode;
      if (seal && row?.seal) {
        const p = placeOnImage({ w: img.naturalWidth, h: img.naturalHeight }, { w: box.width, h: box.height }, mode, focus, row.seal);
        seal.style.left = `${p.x}px`;
        seal.style.top = `${p.y}px`;
      }
    };
    fit();
    window.addEventListener("resize", fit);
    this.root.appendChild(el);
    if (own) this.el = el;
    void el.offsetWidth;
    el.dataset.state = "shown";
    return { el, unfit: () => window.removeEventListener("resize", fit) };
  }

  /** 读档、换场时收掉（看图时读了档，那一格不会再结束） */
  clear(): void {
    this.releaseFn = null;
    this.el?.remove();
    this.el = null;
    this.pictureToken += 1;
    if (this.picture) { this.picture.unfit(); this.picture.el.remove(); this.picture = null; }
  }
}
