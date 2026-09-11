import type { LetterT, PoemT } from "../engine/schema.ts";
import type { GameState } from "../engine/state.ts";
import type { ReplyKind, ReplyResult } from "../engine/letters.ts";
import { NAMES } from "./names.ts";

/**
 * 信箱。案上出现一封，拿起，展开，三层正文，六种回法。
 *
 * 三层（story-schema 1.8）：明面上写的、引的那句诗、她没写的。
 * 「她没写的」那一层不直接显示——玩家点信纸的空白处才看到主角怎么猜。
 * 这是这套机制的核心：空白比字重要，所以要玩家伸手去碰。
 *
 * 六种回法互斥，各结算一次：直言 A/B/C、以诗代答（合意象/不合由引擎判）、不回。
 * 以诗代答只能从已收的诗里挑（图鉴），没收过诗这一项就灰着并说明。
 */
export interface InboxDeps {
  poems: Map<string, PoemT>;
  onRead: (id: string) => void;
  onReply: (id: string, kind: ReplyKind, poemTags: string[]) => Promise<ReplyResult | null>;
}

const PAPER_NAME: Record<string, string> = {
  huangma: "黄麻纸", junzhong: "军中素笺", nijin: "泥金笺", huajian: "花笺", chang: "常笺",
};

export class Inbox {
  private el: HTMLElement;
  private badge: HTMLButtonElement;

  constructor(root: HTMLElement, hud: HTMLElement, private deps: InboxDeps, private listDesk: () => LetterT[], private state: () => GameState) {
    this.el = document.createElement("div");
    this.el.className = "inbox";
    this.el.hidden = true;
    root.appendChild(this.el);
    this.el.addEventListener("click", (e) => { if (e.target === this.el) this.hide(); e.stopPropagation(); });

    this.badge = document.createElement("button");
    this.badge.type = "button";
    this.badge.className = "inbox__badge";
    this.badge.hidden = true;
    this.badge.addEventListener("click", (e) => { e.stopPropagation(); this.showDesk(); });
    hud.appendChild(this.badge);
  }

  get visible(): boolean { return !this.el.hidden; }
  hide(): void { this.el.hidden = true; this.el.innerHTML = ""; }

  /** 案上有几封。为零就把角标收起来 */
  setUnread(n: number, total: number): void {
    this.badge.hidden = total === 0;
    this.badge.textContent = n > 0 ? `案上有信 ${n}` : "案上";
    this.badge.dataset.unread = n > 0 ? "1" : "";
  }

  showDesk(): void {
    const letters = this.listDesk();
    this.el.innerHTML = "";
    const panel = document.createElement("div");
    panel.className = "inbox__panel";
    panel.innerHTML = `<div class="inbox__title">案上</div>`;
    if (!letters.length) {
      panel.innerHTML += `<div class="inbox__empty">案上没有信。</div>`;
    }
    const s = this.state();
    for (const l of letters) {
      const slot = s.letters.find((x) => x.id === l.id);
      const row = document.createElement("button");
      row.type = "button";
      row.className = "inbox__row";
      row.dataset.paper = l.paper;
      row.dataset.state = slot?.state ?? "";
      row.innerHTML = `<span class="inbox__from"></span><span class="inbox__paper">${PAPER_NAME[l.paper] ?? l.paper}</span><span class="inbox__mark"></span>`;
      row.querySelector(".inbox__from")!.textContent = NAMES[l.from] ?? l.from;
      row.querySelector(".inbox__mark")!.textContent = slot?.state === "arrived" ? "未拆" : slot?.state === "replied" ? "已回" : "";
      row.addEventListener("click", (e) => { e.stopPropagation(); this.open(l); });
      panel.appendChild(row);
    }
    const close = document.createElement("button");
    close.type = "button"; close.className = "inbox__close"; close.textContent = "合上";
    close.addEventListener("click", (e) => { e.stopPropagation(); this.hide(); });
    panel.appendChild(close);
    this.el.appendChild(panel);
    this.el.hidden = false;
  }

  /** 拿起一封信：展开三层，然后回 */
  open(l: LetterT): void {
    this.deps.onRead(l.id);
    const s = this.state();
    const slot = s.letters.find((x) => x.id === l.id);
    this.el.innerHTML = "";
    const sheet = document.createElement("div");
    sheet.className = "letter";
    sheet.dataset.paper = l.paper;

    const head = document.createElement("div");
    head.className = "letter__head";
    head.innerHTML = `<span class="letter__from"></span><span class="letter__paperName">${PAPER_NAME[l.paper] ?? ""}</span>`;
    head.querySelector(".letter__from")!.textContent = `${NAMES[l.from] ?? l.from} 笺`;
    sheet.appendChild(head);

    // 一层：明面
    const surface = document.createElement("div");
    surface.className = "letter__surface";
    surface.textContent = l.body.surface;
    sheet.appendChild(surface);

    // 二层：引诗。点一下看她借这句说了什么
    if (l.body.poem) {
      const poem = document.createElement("button");
      poem.type = "button";
      poem.className = "letter__poem";
      const src = this.deps.poems.get(l.body.poem.ref);
      poem.innerHTML = `<span class="letter__poemLine"></span><span class="letter__poemFrom"></span><span class="letter__poemMeans" hidden></span>`;
      poem.querySelector(".letter__poemLine")!.textContent = l.body.poem.line;
      poem.querySelector(".letter__poemFrom")!.textContent = src ? `${src.author}《${src.title}》` : "";
      const means = poem.querySelector<HTMLElement>(".letter__poemMeans")!;
      means.textContent = l.body.poemMeans ?? "";
      poem.addEventListener("click", (e) => { e.stopPropagation(); means.hidden = !means.hidden; });
      sheet.appendChild(poem);
    }

    // 三层：她没写的。空白处要玩家去碰
    const blank = document.createElement("button");
    blank.type = "button";
    blank.className = "letter__blank";
    blank.setAttribute("aria-label", "信纸的空白处");
    const inner = document.createElement("span");
    inner.className = "letter__inner";
    inner.hidden = true;
    inner.textContent = l.body.blank;
    blank.appendChild(inner);
    blank.addEventListener("click", (e) => { e.stopPropagation(); inner.hidden = false; blank.dataset.opened = "1"; });
    sheet.appendChild(blank);

    // 回法
    const replies = document.createElement("div");
    replies.className = "letter__replies";
    if (slot?.state === "replied") {
      replies.innerHTML = `<div class="letter__done">已回过。</div>`;
    } else {
      const head2 = document.createElement("div");
      head2.className = "letter__repliesHead";
      head2.textContent = "回";
      replies.appendChild(head2);
      const kinds: [ReplyKind, string][] = [
        ["plainA", l.replies.plain[0]!.text],
        ["plainB", l.replies.plain[1]!.text],
        ["plainC", l.replies.plain[2]!.text],
      ];
      for (const [k, text] of kinds) {
        replies.appendChild(this.replyButton(text, () => this.send(l, k, [])));
      }
      // 以诗代答：从已收的诗里挑
      const collected = [...s.poemsCollected].map((id) => this.deps.poems.get(id)).filter((p): p is PoemT => !!p);
      const poemBtn = this.replyButton("以诗代答", () => {
        const picker = document.createElement("div");
        picker.className = "letter__picker";
        for (const p of collected) {
          const b = document.createElement("button");
          b.type = "button"; b.className = "letter__pick";
          b.innerHTML = `<span></span><small></small>`;
          b.querySelector("span")!.textContent = p.lines[0] ?? p.title;
          b.querySelector("small")!.textContent = `${p.author}《${p.title}》`;
          b.addEventListener("click", (e) => { e.stopPropagation(); void this.send(l, "poemResonant", p.tags); });
          picker.appendChild(b);
        }
        poemBtn.replaceWith(picker);
      });
      if (!collected.length) {
        poemBtn.disabled = true;
        poemBtn.innerHTML += `<span class="letter__hint">图鉴里还没有诗</span>`;
      }
      replies.appendChild(poemBtn);
      replies.appendChild(this.replyButton("不回", () => this.send(l, "silence", [])));
    }
    sheet.appendChild(replies);

    const back = document.createElement("button");
    back.type = "button"; back.className = "inbox__close"; back.textContent = "放回案上";
    back.addEventListener("click", (e) => { e.stopPropagation(); this.showDesk(); });
    sheet.appendChild(back);

    this.el.appendChild(sheet);
    this.el.hidden = false;
    requestAnimationFrame(() => sheet.classList.add("letter--open"));
  }

  private replyButton(text: string, onClick: () => void): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "letter__reply";
    b.innerHTML = `<span class="letter__mark"></span><span class="letter__text"></span>`;
    b.querySelector(".letter__text")!.textContent = text;
    b.addEventListener("click", (e) => { e.stopPropagation(); onClick(); });
    return b;
  }

  private async send(l: LetterT, kind: ReplyKind, poemTags: string[]): Promise<void> {
    const r = await this.deps.onReply(l.id, kind, poemTags);
    const sheet = this.el.querySelector(".letter");
    if (!sheet) return;
    const replies = sheet.querySelector(".letter__replies")!;
    replies.innerHTML = "";
    const out = document.createElement("div");
    out.className = "letter__reaction";
    if (!r) out.textContent = "这封信已经回过了。";
    else if (r.silent) out.textContent = "信送出去了，没有回音。有些话要等真的见面。";
    else if (r.reaction) out.textContent = r.reaction;
    else out.textContent = "她收下了。";
    replies.appendChild(out);
  }
}
