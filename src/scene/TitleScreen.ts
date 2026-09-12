/**
 * 标题画面（E3 第 3 条）。
 *
 * 一张纸，竖排的三个字，一枚印，其余全空。进来的时候墨晕开一次。
 *
 * 为什么不做插画式的标题图：这个游戏的第一屏就该是它的论点。
 * 「留白就是她的权力」——玩家看见的第一眼如果是一张塞满的图，后面八个场景的空就都白留了。
 * 所以标题画面是全游戏留白最多的一屏，比无字碑还多。
 *
 * 三个字竖排在左三分之一，印在字脚下，右上和右下整片空着——
 * 右上那一块正是游戏里题跋区和状态条的位置，标题画面先把它空出来，是同一套版式的开场。
 */

export interface TitleOptions {
  /** 游戏名。竖排，一字一行 */
  name?: string;
  /** 印文，一到二字 */
  seal?: string;
  /** 副题：一行小字，淡墨。不给就不画 */
  sub?: string;
  /** 主入口文案。D-046：就两个字「入宫」，不写「轻触」——那是操作说明，不是这一屏该说的话 */
  enter?: string;
  /** 有存档时多给一个入口。没有存档就不传，这一屏只有一个入口 */
  resume?: { label?: string; onResume(): void };
  onStart(): void;
}

/**
 * 挂上标题画面。返回一个函数，调用它就收起（自带一次墨晕合上）。
 * 不知道存档、章节、数值——它只是一张纸。要不要显示「继续」由 CC1 在外面加。
 */
export function mountTitle(root: HTMLElement, opts: TitleOptions): () => void {
  const name = opts.name ?? "吾则天";
  const box = document.createElement("div");
  box.className = "title";
  box.dataset.state = "in";

  const paper = document.createElement("div");
  paper.className = "title__paper";

  const col = document.createElement("div");
  col.className = "title__col";
  // 一字一个元素：墨晕开的时候三个字要一个接一个显出来，像写下去的顺序
  [...name].forEach((ch, i) => {
    const el = document.createElement("span");
    el.className = "title__ch";
    el.style.setProperty("--i", String(i));
    el.textContent = ch;
    col.appendChild(el);
  });

  // 界栏：竖排右边一条淡墨细线。立轴上本来就有，它让这三个字是「写在纸上」而不是「摆在屏幕上」
  const rule = document.createElement("i");
  rule.className = "title__rule";

  const seal = document.createElement("div");
  seal.className = "title__seal";
  seal.setAttribute("aria-hidden", "true");
  seal.textContent = opts.seal ?? "则天";

  const wrap = document.createElement("div");
  wrap.className = "title__wrap";
  wrap.append(col, rule, seal);

  // 两个入口竖排在右下：「接着上次」在上，「入宫」在下。
  // 有存档的人多数是要接着玩，但「入宫」是这一屏的主句，位置不让
  const ways = document.createElement("div");
  ways.className = "title__ways";
  const enter = document.createElement("button");
  enter.className = "title__enter";
  enter.textContent = opts.enter ?? "入宫";
  let resume: HTMLButtonElement | null = null;
  if (opts.resume) {
    resume = document.createElement("button");
    resume.className = "title__resume";
    resume.textContent = opts.resume.label ?? "接着上次";
    ways.appendChild(resume);
  }
  ways.appendChild(enter);

  box.append(paper, wrap, ways);
  if (opts.sub) {
    const sub = document.createElement("p");
    sub.className = "title__sub";
    sub.textContent = opts.sub;
    box.appendChild(sub);
  }
  root.appendChild(box);

  const close = (): void => {
    box.dataset.state = "out";
    window.setTimeout(() => box.remove(), 480);
  };
  const go = (): void => { close(); opts.onStart(); };
  // 点空白处 = 入宫，只在没有存档时成立（CC1 改，B11，见 docs/engine-cc1-b11.md 待协调）。
  // 有存档的人回来，习惯性点一下屏幕，不该就此从头开一局——
  // 「接着上次」和「入宫」这时候是两件完全不同的事，要她点准了才算。
  if (!opts.resume) box.addEventListener("click", go);
  enter.addEventListener("click", (e) => { e.stopPropagation(); go(); });
  resume?.addEventListener("click", (e) => {
    e.stopPropagation();
    close();
    opts.resume!.onResume();
  });
  return close;
}
