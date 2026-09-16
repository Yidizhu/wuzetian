/**
 * 序幕题记（E5 第 3 条，D-048 开场三段的第一段）。
 *
 * 和标题画面是同一张纸：同一层纸纹、同一种墨晕、同样竖排。
 * 标题把三个字放在左下、**右上整片空着**，E3 就写明「那正是题跋区的位置」——
 * 题记就写在那一块。玩家点「入宫」，墨晕合上又开，字落在刚才空着的地方，
 * 两屏连起来是一幅立轴先落款、后题跋。
 *
 * 竖排，从右往左，一句一列。三列以内（七点五节：三行写不完说明还没想清楚）。
 * 不给多于三列留版位，多出来的照样画，但会挤到左半边去——那是写的人该改，不是版式该让。
 *
 * 没有印。印在标题上盖过一次了，第二枚红会把「全屏唯一的红」变成装饰。
 *
 * 点击：字还在一列一列写出来时，点一下补完；都写完了，再点一下墨晕合上、交回剧情。
 * 和对话框「第一下补完、第二下推进」是同一个手感。
 */

export interface EpigraphOptions {
  /** 一句一列，按阅读顺序给（第一句在最右） */
  lines: string[];
  /** 落款：接在最后一列左边，小一号、淡一档。不给就不画 */
  sign?: string;
  /**
   * 章首风景（D-181，B32，CC1 加，待协调）：给了就铺在纸底下，题记写在景的天上。
   * 地址由调用方给，要先解码好再挂——墨晕开的那一下景已经在。不给还是纸色底
   */
  vista?: string;
  /** 哪一张风景（`vista_chN`）。挂在 `data-vista-key` 上，样式按章微调用得着（B35：第三章天只占五成） */
  vistaKey?: string;
  onDone(): void;
}

/** 每列写完的时长与列间停顿。重的慢（art-director 第 10 条）：题记比台词慢得多 */
const COL_MS = 900;
const GAP_MS = 520;

export function mountEpigraph(root: HTMLElement, opts: EpigraphOptions): () => void {
  const box = document.createElement("div");
  box.className = "tiji";
  box.dataset.state = "in";

  const paper = document.createElement("div");
  paper.className = "tiji__paper";

  const cols = document.createElement("div");
  cols.className = "tiji__cols";
  const parts = [...opts.lines];
  const els: HTMLElement[] = parts.map((text, i) => {
    const el = document.createElement("p");
    el.className = "tiji__col";
    el.style.setProperty("--d", `${420 + i * (COL_MS + GAP_MS)}ms`);
    el.style.setProperty("--t", `${COL_MS}ms`);
    el.textContent = text;
    return el;
  });
  if (opts.sign) {
    const s = document.createElement("p");
    s.className = "tiji__col tiji__sign";
    s.style.setProperty("--d", `${420 + parts.length * (COL_MS + GAP_MS)}ms`);
    s.style.setProperty("--t", `${COL_MS * 0.6}ms`);
    s.textContent = opts.sign;
    els.push(s);
  }
  cols.append(...els);
  if (opts.vista) {
    const v = document.createElement("div");
    v.className = "tiji__vista";
    v.style.backgroundImage = `url("${opts.vista}")`;
    box.dataset.vista = "1";
    if (opts.vistaKey) box.dataset.vistaKey = opts.vistaKey;
    box.append(v);
  }
  box.append(paper, cols);
  root.appendChild(box);

  let closed = false;

  const close = (): void => {
    if (closed) return;
    closed = true;
    box.dataset.state = "out";
    window.setTimeout(() => box.remove(), 480);
  };

  // 捕获层（src/ui/tap.ts）在 window 上听 pointerdown，这一层要列进它的 BLOCKING，
  // 否则点一下题记，剧情也跟着翻一页。这里自己用 pointerup 收，click 兜底，两者去重。
  let lastUp = 0;
  const step = (): void => {
    if (closed) return;
    // 按动画本身判断写没写完，不按钟表：切到后台时动画是停的，钟表不停，
    // 按钟表算，回来点一下就会把一页没写出来的题记直接合上
    const writing = els.some((e) => e.getAnimations().some((a) => a.playState !== "finished"));
    if (box.dataset.done !== "1" && writing) {
      box.dataset.done = "1";          // 补完：所有列立刻显出来
      return;
    }
    close();
    opts.onDone();
  };
  box.addEventListener("pointerup", () => { lastUp = performance.now(); step(); });
  box.addEventListener("click", () => { if (performance.now() - lastUp > 700) step(); });
  return close;
}
