import { RasterCatalog } from "../scene/raster.ts";

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

  async show(key: string, first: boolean): Promise<boolean> {
    if (!this.raster.hasCg(key)) return false;
    const url = this.raster.cgUrl(key);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try {
      await img.decode();                  // 解码完再铺：墨晕散开的那一下图已经在
    } catch {
      console.warn(`[cg] 事件图读不出来，这一格跳过：${url}`);
      this.raster.markBroken(`cg/${key}`);
      return false;
    }

    const el = document.createElement("div");
    el.className = "cg";
    el.dataset.state = "in";
    el.style.backgroundImage = `url("${url}")`;
    this.root.appendChild(el);
    this.el = el;
    void el.offsetWidth;
    el.dataset.state = "shown";

    const at = performance.now();
    await new Promise<void>((resolve) => {
      this.releaseFn = () => {
        if (first && performance.now() - at < CG_FIRST_HOLD_MS) return;   // 第一次：手还在连点，这一下不算
        this.releaseFn = null;
        resolve();
      };
    });

    el.dataset.state = "out";
    await new Promise((r) => window.setTimeout(r, FADE_MS));
    el.remove();
    if (this.el === el) this.el = null;
    return true;
  }

  /** 读档、换场时收掉（看图时读了档，那一格不会再结束） */
  clear(): void {
    this.releaseFn = null;
    this.el?.remove();
    this.el = null;
  }
}
