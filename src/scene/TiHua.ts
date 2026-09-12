import type { Palette } from "../engine/types.ts";

/**
 * 题画（D-014）。把当前这一幕合成一张 3:4 的水墨图：画心在左下，题诗与印在右上，
 * 一张可以存进相册、发给人的立轴。
 *
 * 为什么是立轴而不是截图：截图带着对话框、状态条和按钮，那是「游戏的界面」；
 * 题画要的是「她这一刻的样子」。composition.md 的主体偏左下、题跋区在右上，
 * 正好就是立轴的布局，所以这张图的版式不是新设计的，是把既有规矩落到一张纸上。
 *
 * 只做背景层与合成，不知道剧情、不知道数值。CC1 只要给它场景画布、一首诗和一个落款。
 */

/** 立绘：和 CharacterLayer 走同一条路，构建期把 SVG 文本打进包，不在运行时 fetch */
const SPRITE_FILES = import.meta.glob<string>("../char/*.svg", {
  query: "?raw", import: "default", eager: true,
});
const SPRITES: Record<string, string> = {};
for (const [path, svg] of Object.entries(SPRITE_FILES)) {
  SPRITES[path.slice(path.lastIndexOf("/") + 1, -4)] = svg;
}

export interface TiHuaInput {
  /** 画心的来源：3D 舞台的画布。没有就只留一张空纸——空纸也是一张题画 */
  source?: HTMLCanvasElement | null;
  palette: Palette;
  night?: boolean;
  /** 题诗，一到四句。竖排，从右往左 */
  poem: string[];
  /** 落款，一行小字。默认「吾则添 题」 */
  sign?: string;
  /** 入画的人：`wuze_open` 这样的键，最多两个。左边那个先画 */
  cast?: string[];
  /** 印文，一到二字 */
  seal?: string;
}

const W = 900, H = 1200;                 // 3:4
/** 画心：偏左下。右上那一条留给题跋，正是状态条平时占的位置 */
const ART = { x: 58, y: 96, w: 596, h: 840 };
/** 题跋区：最右一列的中心线在 812，往左一列列排开。右边留 88 的空边，题跋才不贴着纸边 */
const COL = { right: 812, gap: 52, top: 150 };

/**
 * 把 SVG 里的 `var(--c-x, 回退)` 换成当前色板的实际值。
 * 画进 canvas 的 SVG 是一个独立文档，拿不到页面的 CSS 变量，不换的话整张立绘是黑的。
 * 从最里面一层 var() 开始换，因为立绘里写的是 `var(--c-accent, var(--c-ink-4, #A8232A))` 这样的嵌套。
 */
function resolveVars(svg: string, css: CSSStyleDeclaration): string {
  let out = svg;
  for (let guard = 0; guard < 40; guard++) {
    const open = out.lastIndexOf("var(");
    if (open < 0) break;
    const close = out.indexOf(")", open);
    if (close < 0) break;
    const inner = out.slice(open + 4, close);
    const comma = inner.indexOf(",");
    const name = (comma < 0 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma < 0 ? "" : inner.slice(comma + 1).trim();
    const value = css.getPropertyValue(name).trim() || fallback || "#33302B";
    out = out.slice(0, open) + value + out.slice(close + 1);
  }
  return out;
}

function loadSvg(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

/** 宣纸／绢的纹。和舞台上那一层同一个来路，只是这里要画进 canvas，所以自己生成 */
function paperTexture(ctx: CanvasRenderingContext2D, palette: Palette): void {
  const n = document.createElement("canvas");
  n.width = n.height = 120;
  const nc = n.getContext("2d")!;
  const img = nc.createImageData(120, 120);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 150 + Math.floor(Math.random() * 105);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  nc.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = palette === "gold" ? 0.09 : 0.12;
  const pat = ctx.createPattern(n, "repeat")!;
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, W, H);
  // 绢再加一层经纬：更细、更规整，和宣纸的手感分得开
  if (palette === "gold") {
    ctx.globalAlpha = 0.07;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < W; x += 3) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
    for (let y = 0; y < H; y += 3) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
    ctx.stroke();
  }
  ctx.restore();
}

/** 竖排一列字。返回这一列占的高度 */
function column(ctx: CanvasRenderingContext2D, text: string, x: number, top: number,
  size: number, color: string, gap: number): number {
  ctx.fillStyle = color;
  ctx.font = `${size}px "Source Han Serif SC", "Songti SC", "SimSun", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  let y = top;
  for (const ch of text) {
    ctx.fillText(ch, x, y);
    y += size + gap;
  }
  return y - top;
}

/** 朱砂印。阳文：红底白字。它是全图唯一的红，面积不到千分之四 */
function seal(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, accent: string): void {
  const s = 58;
  ctx.save();
  ctx.fillStyle = accent;
  ctx.beginPath();
  // 手刻的印不是正方，四角略有出入
  ctx.moveTo(x + 2, y);
  ctx.lineTo(x + s, y + 1.5);
  ctx.lineTo(x + s - 1.5, y + s);
  ctx.lineTo(x, y + s - 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#EDE7DA";
  const n = Math.min(2, text.length);
  const fs = n === 1 ? 34 : 24;
  ctx.font = `${fs}px "Source Han Serif SC", "Songti SC", "SimSun", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (n === 1) ctx.fillText(text[0]!, x + s / 2, y + s / 2 + 1);
  else {
    ctx.fillText(text[0]!, x + s / 2, y + s * 0.3);
    ctx.fillText(text[1]!, x + s / 2, y + s * 0.72);
  }
  ctx.restore();
}

/**
 * 合成一张题画。返回一张 900 × 1200 的画布。
 *
 * 顺序：纸 → 画心（场景）→ 立绘 → 画心的边线 → 题诗 → 落款 → 印 → 纸纹。
 * 纸纹放最后，压在所有东西上面，整张图才像画在一张纸上，而不是几层图叠出来的。
 */
export async function compose(input: TiHuaInput): Promise<HTMLCanvasElement> {
  const css = getComputedStyle(document.documentElement);
  const v = (n: string, d: string) => css.getPropertyValue(n).trim() || d;
  const ground = input.night ? v("--c-ground-night", "#D8D2C4") : v("--c-ground", "#EDE7DA");
  const text = v("--c-text", "#33302B");
  const soft = v("--c-text-soft", "#8C8880");
  // 金碧板的 --c-accent 是 initial，读出来是空串，落到泥金——和立绘、场景同一条规则
  const accent = v("--c-accent", v("--c-ink-4", "#B8964F"));

  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, W, H);

  // 画心：把舞台按 cover 裁进去。宁可裁掉两边，也不要留黑边或者拉变形
  if (input.source && input.source.width > 0) {
    const sw = input.source.width, sh = input.source.height;
    const k = Math.max(ART.w / sw, ART.h / sh);
    const dw = sw * k, dh = sh * k;
    ctx.save();
    ctx.beginPath();
    ctx.rect(ART.x, ART.y, ART.w, ART.h);
    ctx.clip();
    ctx.drawImage(input.source, ART.x + (ART.w - dw) / 2, ART.y + (ART.h - dh) / 2, dw, dh);
    ctx.restore();
  }

  // 立绘：底对齐画心下沿，两个人一前一后、不等高，绝不左右对称摆（composition.md）
  const keys = (input.cast ?? []).slice(0, 2);
  for (let i = 0; i < keys.length; i++) {
    const raw = SPRITES[keys[i]!];
    if (!raw) continue;
    const img = await loadSvg(resolveVars(raw, css));
    const h = ART.h * (i === 0 ? 0.82 : 0.72);
    const w = (h / 1536) * 1024;
    const x = i === 0 ? ART.x + ART.w * 0.06 : ART.x + ART.w - w + ART.w * 0.1;
    ctx.save();
    ctx.beginPath();
    ctx.rect(ART.x, ART.y, ART.w, ART.h);
    ctx.clip();
    ctx.drawImage(img, x, ART.y + ART.h - h, w, h);
    ctx.restore();
  }

  // 画心的边：只有一条淡线，不做裱框。框会把画变成商品
  ctx.strokeStyle = soft;
  ctx.lineWidth = 1;
  ctx.strokeRect(ART.x + 0.5, ART.y + 0.5, ART.w - 1, ART.h - 1);

  // 题诗：竖排，从右往左。第一句在最右
  const poem = input.poem.filter(Boolean).slice(0, 4);
  let x = COL.right;
  let bottom = COL.top;
  for (const s of poem) {
    const used = column(ctx, s, x, COL.top, 30, text, 12);
    bottom = Math.max(bottom, COL.top + used);
    x -= COL.gap;
  }
  // 落款：接着诗往下写，同一列，小一号、淡一档。印在款的末尾，压住整幅的右下
  const sign = input.sign ?? "吾则添 题";
  const signX = COL.right - Math.max(0, poem.length - 1) * COL.gap;
  const signY = Math.min(bottom + 44, H - 300);
  column(ctx, sign, signX, signY, 20, soft, 8);
  const sealY = Math.min(signY + sign.length * 28 + 14, H - 96);
  seal(ctx, signX - 29, sealY, input.seal ?? "则天", accent);

  paperTexture(ctx, input.palette);
  return canvas;
}

/** 三种姿态，就是立绘的三张差分。`character.md`：表情靠肩颈与袖手，不靠嘴型 */
const POSES: { key: "default" | "guarded" | "open"; label: string }[] = [
  { key: "default", label: "常" },
  { key: "guarded", label: "敛" },
  { key: "open", label: "松" },
];
const VIEWS: { v: 0 | 1 | 2; label: string }[] = [
  { v: 0, label: "全" },
  { v: 1, label: "近" },
  { v: 2, label: "远" },
];

export interface TiHuaOptions {
  /** 3D 舞台。给了就能换机位；没有（CSS 版）就只用 `source` 那一张，机位一栏自动收起 */
  shooter?: { shoot(view: 0 | 1 | 2): HTMLCanvasElement | null } | null;
  source?: HTMLCanvasElement | null;
  palette: Palette;
  night?: boolean;
  /** 可挑的题跋。每项一到四句，从诗库里拿，不在这里新写诗 */
  poems: string[][];
  /** 落款与每句诗的出处，与 poems 一一对应 */
  signs?: string[];
  /** 在场的人，只要 key 不带表情，最多两个 */
  cast?: string[];
  /** 主角当前的名字。印文取末二字：吾则添 → 则添，改名之后 → 则天 */
  name?: string;
}

/** iOS Safari 上 `<a download>` 是摆设，点了只会在新标签页打开图。那里只能长按存 */
function canDownload(): boolean {
  const ua = navigator.userAgent;
  const ios = /iP(hone|ad|od)/.test(ua)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return "download" in document.createElement("a") && !ios;
}

/**
 * 打开题画：一张预览，三行可挑的东西（机位 / 姿态 / 题跋），一个存图。
 *
 * 每挑一次重合成一张。合成一张 4 到 22 毫秒，不值得做增量。
 */
export async function openTiHua(root: HTMLElement, opts: TiHuaOptions): Promise<void> {
  let view: 0 | 1 | 2 = 0;
  let pose: "default" | "guarded" | "open" = "default";
  let poem = 0;
  const seal = (opts.name ?? "吾则添").slice(-2);

  const box = document.createElement("div");
  box.className = "tihua";
  const img = document.createElement("img");
  img.className = "tihua__img";
  img.alt = "题画";
  const rows = document.createElement("div");
  rows.className = "tihua__rows";
  const bar = document.createElement("div");
  bar.className = "tihua__bar";
  const save = document.createElement("a");
  save.className = "tihua__btn";
  save.textContent = "存图";
  const close = document.createElement("button");
  close.className = "tihua__btn";
  close.textContent = "收起";
  const hint = document.createElement("span");
  hint.className = "tihua__hint";
  const downloadable = canDownload();
  hint.textContent = downloadable ? "长按图片也可存进相册" : "长按图片保存到相册";
  if (!downloadable) save.hidden = true;
  bar.append(save, close, hint);
  box.append(img, rows, bar);
  root.appendChild(box);

  const redraw = async (): Promise<void> => {
    const source = opts.shooter?.shoot(view) ?? opts.source ?? null;
    const canvas = await compose({
      source,
      palette: opts.palette,
      night: opts.night,
      poem: opts.poems[poem] ?? [],
      sign: opts.signs?.[poem],
      cast: (opts.cast ?? []).slice(0, 2).map((k) => `${k}_${pose}`),
      seal,
    });
    img.src = canvas.toDataURL("image/png");
    save.href = img.src;
    save.download = `吾则天-题画-${Date.now()}.png`;
  };

  /** 一行可挑的东西。选中的那个左边亮一条浓墨短线，和选项的做法一致（ui.md） */
  const row = <T,>(label: string, items: { label: string; value: T }[],
    get: () => T, set: (v: T) => void): void => {
    if (items.length < 2) return;
    const el = document.createElement("div");
    el.className = "tihua__row";
    const name = document.createElement("span");
    name.className = "tihua__rowname";
    name.textContent = label;
    el.appendChild(name);
    const btns: HTMLButtonElement[] = [];
    const sync = () => btns.forEach((b, i) => {
      b.dataset.on = items[i]!.value === get() ? "1" : "";
    });
    for (const it of items) {
      const b = document.createElement("button");
      b.className = "tihua__chip";
      b.textContent = it.label;
      b.addEventListener("click", () => { set(it.value); sync(); void redraw(); });
      btns.push(b);
      el.appendChild(b);
    }
    sync();
    rows.appendChild(el);
  };

  if (opts.shooter) row("机位", VIEWS.map((v) => ({ label: v.label, value: v.v })), () => view, (v) => { view = v; });
  if (opts.cast?.length) row("姿态", POSES.map((p) => ({ label: p.label, value: p.key })), () => pose, (v) => { pose = v; });
  row("题跋", opts.poems.map((p, i) => ({ label: p[0]?.slice(0, 5) ?? "无字", value: i })), () => poem, (v) => { poem = v; });

  const dismiss = () => box.remove();
  close.addEventListener("click", dismiss);
  box.addEventListener("click", (e) => { if (e.target === box) dismiss(); });
  await redraw();
}
