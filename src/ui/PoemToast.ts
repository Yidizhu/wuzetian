import "../styles/poemtoast.css";

/**
 * 得诗那一下的提示（D-238，B47）。
 *
 * 主线读到一首诗就收进收藏（不用赢对诗），**第一次收到才提示一次**；同一首再读到不再提示。
 * 玩家在读字，所以这一条：
 * - 只有一行：「得诗　王维《山居秋暝》」，不解释、不打断；
 * - **落在顶上**（HUD 那一带下面），不压底下的对白，也不压画面中间的人和手（CC3 E42 的要求）；
 * - 不收点击（`pointer-events: none`），点它就是点画面，剧情照旧走；
 * - 2.8 秒自己淡掉；连着收到两首就排队，一首一首出。
 */
const SHOW_MS = 2800;

export class PoemToast {
  private el: HTMLElement;
  private queue: string[] = [];
  private timer = 0;

  constructor(root: HTMLElement) {
    this.el = document.createElement("div");
    this.el.className = "poemtoast";
    this.el.setAttribute("aria-live", "polite");
    this.el.hidden = true;
    root.appendChild(this.el);
  }

  /** `text` 已经排好（「王维《山居秋暝》」）。诗库里没有这一首就只给 key，不编 */
  show(text: string): void {
    this.queue.push(text);
    if (!this.timer) this.next();
  }

  private next(): void {
    const t = this.queue.shift();
    if (t === undefined) { this.el.hidden = true; this.timer = 0; return; }
    this.el.innerHTML = `<span class="poemtoast__label">得诗</span><span class="poemtoast__name"></span>`;
    this.el.querySelector(".poemtoast__name")!.textContent = t;
    this.el.hidden = false;
    this.el.dataset.state = "in";
    this.timer = window.setTimeout(() => {
      this.el.dataset.state = "out";
      this.timer = window.setTimeout(() => this.next(), 320);
    }, SHOW_MS);
  }
}
