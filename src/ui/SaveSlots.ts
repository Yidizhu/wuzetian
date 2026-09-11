import * as save from "../engine/save.ts";
import { encodeSave, decodeSave, prettyCode } from "../engine/savecode.ts";

/**
 * 存档槽。三个手动槽，外加一个玩家看不见的自动存档。
 *
 * 视觉小说的玩家期望随处可存、读档回到同一句话，所以这里存的是
 * 场景加句序，不是章节检查点（见 story-schema 2.3）。
 * 覆盖前把旧值抄进 .bak，读档解析失败时回退，隐私模式下写不进去只是没有存档，不崩。
 */
export class SaveSlots {
  private el: HTMLElement;
  private out: HTMLElement | null = null;

  constructor(
    root: HTMLElement,
    private onSave: (slot: number) => void,
    private onLoad: (slot: number) => void,
    /** 导入一份外来存档：写进指定槽，然后读它 */
    private onImport?: (slot: number, s: save.SaveV1) => void,
  ) {
    this.el = document.createElement("div");
    this.el.className = "slots";
    this.el.hidden = true;
    root.appendChild(this.el);
    this.el.addEventListener("click", (e) => {
      if (e.target === this.el) this.hide();   // 点空白处关掉
      e.stopPropagation();
    });
  }

  get visible(): boolean { return !this.el.hidden; }
  hide(): void { this.el.hidden = true; }
  toggle(): void { if (this.el.hidden) this.show(); else this.hide(); }

  show(): void {
    this.el.innerHTML = "";
    const panel = document.createElement("div");
    panel.className = "slots__panel";
    panel.innerHTML = `<div class="slots__title">存档</div>`;

    for (const { slot, save: s } of save.listSlots()) {
      const row = document.createElement("div");
      row.className = "slots__row";

      const info = document.createElement("div");
      info.className = "slots__info";
      if (s) {
        const t = new Date(s.savedAt);
        const when = `${t.getMonth() + 1}月${t.getDate()}日 ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
        info.innerHTML = `<div class="slots__where"></div><div class="slots__when">${when}　${s.protagonistName}</div>`;
        info.querySelector(".slots__where")!.textContent = s.sceneId;
      } else {
        info.innerHTML = `<div class="slots__where slots__where--empty">空</div>`;
      }

      const act = document.createElement("div");
      act.className = "slots__act";
      const bSave = document.createElement("button");
      bSave.type = "button"; bSave.textContent = "存";
      bSave.addEventListener("click", (e) => { e.stopPropagation(); this.onSave(slot); this.show(); });
      const bLoad = document.createElement("button");
      bLoad.type = "button"; bLoad.textContent = "读"; bLoad.disabled = !s;
      bLoad.addEventListener("click", (e) => { e.stopPropagation(); this.hide(); this.onLoad(slot); });
      act.append(bSave, bLoad);

      row.append(document.createElement("span"), info, act);
      row.firstElementChild!.className = "slots__no";
      row.firstElementChild!.textContent = String(slot);
      panel.appendChild(row);
    }

    // 导出／导入码（D-031）：localStorage 只活在这一个浏览器里，
    // 换设备、清数据、发给朋友都靠这一串字
    const codeBar = document.createElement("div");
    codeBar.className = "slots__codebar";
    const bExport = document.createElement("button");
    bExport.type = "button"; bExport.textContent = "导出存档码";
    bExport.addEventListener("click", (e) => { e.stopPropagation(); void this.exportCode(); });
    const bImport = document.createElement("button");
    bImport.type = "button"; bImport.textContent = "用码继续";
    bImport.addEventListener("click", (e) => { e.stopPropagation(); this.importPane(); });
    codeBar.append(bExport, bImport);
    panel.appendChild(codeBar);
    const out = document.createElement("div");
    out.className = "slots__codeout";
    out.hidden = true;
    panel.appendChild(out);
    this.out = out;

    const close = document.createElement("button");
    close.type = "button"; close.className = "slots__close"; close.textContent = "合上";
    close.addEventListener("click", (e) => { e.stopPropagation(); this.hide(); });
    panel.appendChild(close);

    this.el.appendChild(panel);
    this.el.hidden = false;
  }

  /** 导出：优先取自动存档（进度最新的那一份） */
  private async exportCode(): Promise<void> {
    const s = save.read(save.AUTO_SLOT) ?? save.listSlots().map((x) => x.save).find(Boolean);
    if (!this.out) return;
    if (!s) { this.show2("还没有存档可以导出。"); return; }
    const code = await encodeSave(s);
    this.out.hidden = false;
    this.out.innerHTML = "";
    const hint = document.createElement("div");
    hint.className = "slots__codehint";
    hint.textContent = "全选复制这一串。换设备、清了浏览器数据、发给朋友都用它。";
    const box = document.createElement("textarea");
    box.className = "slots__codebox";
    box.readOnly = true;
    box.value = prettyCode(code);
    box.addEventListener("click", (e) => { e.stopPropagation(); box.select(); });
    const copy = document.createElement("button");
    copy.type = "button"; copy.className = "slots__close"; copy.textContent = "复制";
    copy.addEventListener("click", async (e) => {
      e.stopPropagation();
      try { await navigator.clipboard.writeText(code); copy.textContent = "已复制"; }
      catch { box.select(); copy.textContent = "请手动复制"; }
    });
    this.out.append(hint, box, copy);
    box.select();
  }

  /** 导入：贴一串码，写进 1 号槽再读它。不覆盖自动存档，免得贴错就回不去 */
  private importPane(): void {
    if (!this.out) return;
    this.out.hidden = false;
    this.out.innerHTML = "";
    const hint = document.createElement("div");
    hint.className = "slots__codehint";
    hint.textContent = "把存档码贴进来。会存到 1 号槽，当前进度不动。";
    const box = document.createElement("textarea");
    box.className = "slots__codebox";
    box.placeholder = "WZT1……";
    box.addEventListener("click", (e) => e.stopPropagation());
    const go = document.createElement("button");
    go.type = "button"; go.className = "slots__close"; go.textContent = "继续";
    const msg = document.createElement("div");
    msg.className = "slots__codemsg";
    go.addEventListener("click", async (e) => {
      e.stopPropagation();
      const r = await decodeSave(box.value);
      if (!r.ok) { msg.textContent = r.reason; msg.dataset.bad = "1"; return; }
      msg.dataset.bad = "";
      msg.textContent = "读到了。正在接上。";
      this.onImport?.(1, r.save);
    });
    this.out.append(hint, box, go, msg);
    box.focus();
  }

  private show2(text: string): void {
    if (!this.out) return;
    this.out.hidden = false;
    this.out.innerHTML = "";
    const m = document.createElement("div");
    m.className = "slots__codemsg";
    m.textContent = text;
    this.out.appendChild(m);
  }
}
