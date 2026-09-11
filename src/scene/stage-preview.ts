/**
 * 舞台抽查台。只在 dev 下打开，不进任何产物（vite 只把 index.html 当入口）。
 *
 *   npm run dev，然后开 /src/scene/stage-preview.html
 *   默认：八个场景 + 三个色板/幕数变体，排成一张联排，每格带自测数字
 *   单看一场（活的，带墨层与纸纹）：?key=yeting&palette=ink&act=1&ink=0&w=390&h=844
 *
 * 为什么要它：art-style 的留白 ≥ 40%、朱砂 ≤ 3%，和 art-director 第 6 条「数每个色占的面积」，
 * 都是可以量的指标。眼睛估出来的数会往自己想要的方向偏，所以这里直接读画布像素。
 * 联排里的每个数字都是这个页面算的，不是手写的。
 */
import "../styles/palette.css";
import "../styles/app.css";
import { ThreeStageRenderer } from "./ThreeStageRenderer.ts";
import type { Palette, SceneKey } from "../engine/types.ts";

interface Shot {
  key: SceneKey;
  palette: Palette;
  act: number;
  label: string;
  /** 覆盖 setInk 的默认值 */
  ink?: number;
}

const SHOTS: Shot[] = [
  { key: "yeting",   palette: "ink",  act: 1, label: "掖庭偏院 · 清晨薄雾" },
  { key: "zhaoyang", palette: "gold", act: 1, label: "昭阳殿 · 正午 · 一幕" },
  { key: "shuge",    palette: "gold", act: 1, label: "书阁 · 午后斜光 · 一幕" },
  { key: "shuge",    palette: "ink",  act: 1, label: "书阁 · 夜 · 一盏灯" },
  { key: "nvguan",   palette: "ink",  act: 1, label: "女冠观 · 阴天漫射" },
  { key: "shishe",   palette: "ink",  act: 1, label: "诗社水榭 · 黄昏" },
  { key: "yuanye",   palette: "ink",  act: 1, label: "御花园 · 夜 · 月光" },
  { key: "hanyuan",  palette: "gold", act: 1, label: "含元殿 · 逆光 · 一幕" },
  { key: "wuzibei",  palette: "ink",  act: 1, label: "无字碑 · 正面平光" },
  { key: "zhaoyang", palette: "gold", act: 2, label: "昭阳殿 · 二幕 · 墨屏进殿" },
  { key: "hanyuan",  palette: "gold", act: 3, label: "含元殿 · 三幕 · 墨盖过来" },
];

/** 两块色板的全部色值，按 palette.css。分类用，不参与绘制 */
const COLORS: Record<Palette, Record<string, string>> = {
  ink: {
    焦墨: "#1A1815", 浓墨: "#33302B", 重墨: "#55524A", 淡墨: "#8C8880",
    清墨: "#C9C4B8", 朱砂: "#A8232A", 纸: "#EDE7DA",
  },
  gold: {
    焦墨: "#1A1815", 石青: "#2F5C8F", 石绿: "#5B8C6A", 赭石: "#8B4A2F",
    泥金: "#B8964F", 绢: "#E6D9B9", 墨: "#33302B",
  },
};

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

interface Metrics {
  blank: number;
  /** 10×10 格里算留白的格子数，就是 composition.md 说的数格子 */
  blankCells: number;
  accent: number;
  areas: [string, number][];
}

/**
 * 从画布读数。
 *
 * 透明处露的是 .stage 的底色，所以透明即留白。
 * 有色的像素按「色板色乘一个 0.12–1.05 的亮度」最小二乘拟合归类——
 * MeshToonMaterial 出来的就是 色 × 光照档位，这个拟合正好对得上它的成像方式。
 * 不能直接拿最近邻比：那样一块暗下去的石青会被算成焦墨，色的面积就全错了。
 */
function measure(canvas: HTMLCanvasElement, palette: Palette, grounds: string[]): Metrics {
  const w = canvas.width, h = canvas.height;
  const c2 = document.createElement("canvas");
  c2.width = w; c2.height = h;
  const ctx = c2.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(canvas, 0, 0);
  const px = ctx.getImageData(0, 0, w, h).data;
  const names = Object.keys(COLORS[palette]);
  const cands = names.map((n) => rgb(COLORS[palette][n]!));
  const gs = grounds.map(rgb);
  const count = new Map<string, number>();
  let blank = 0, accent = 0, total = 0;
  const cells = new Array(100).fill(0);
  const cellBlank = new Array(100).fill(0);
  for (let y = 0; y < h; y++) {
    const cy = Math.min(9, Math.floor((y / h) * 10));
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const cell = cy * 10 + Math.min(9, Math.floor((x / w) * 10));
      cells[cell]++;
      total++;
      const a = px[i + 3]!, r = px[i]!, g = px[i + 1]!, b = px[i + 2]!;
      if (a < 16 || gs.some((c) => Math.abs(r - c[0]) < 7 && Math.abs(g - c[1]) < 7 && Math.abs(b - c[2]) < 7)) {
        blank++; cellBlank[cell]++; continue;
      }
      // 朱砂：不靠拟合，靠红得压过另两路。门槛按 #A8232A 的比例（R 是 G 的 4.8 倍、B 的 4.0 倍）
      // 留一半余量定在 2.8 与 2.4——再松就把赭石 #8B4A2F 也算成朱砂了，第一版就是这么误报到 27% 的
      if (r > 60 && r > g * 2.8 && r > b * 2.4) accent++;
      let best = "其他", bestErr = 1e9;
      for (let k = 0; k < cands.length; k++) {
        const c = cands[k]!;
        const dot = r * c[0] + g * c[1] + b * c[2];
        const len = c[0] * c[0] + c[1] * c[1] + c[2] * c[2];
        const s = Math.max(0.12, Math.min(1.05, dot / len));
        const err = Math.hypot(r - s * c[0], g - s * c[1], b - s * c[2]);
        if (err < bestErr) { bestErr = err; best = names[k]!; }
      }
      if (bestErr > 34) best = "其他";
      count.set(best, (count.get(best) ?? 0) + 1);
    }
  }
  const areas = [...count.entries()]
    .map(([n, v]) => [n, (v / total) * 100] as [string, number])
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v >= 0.08);
  let blankCells = 0;
  for (let i = 0; i < 100; i++) if (cellBlank[i] / Math.max(1, cells[i]) >= 0.8) blankCells++;
  return { blank: (blank / total) * 100, blankCells, accent: (accent / total) * 100, areas };
}

const qs = new URLSearchParams(location.search);
const single = qs.get("key") as SceneKey | null;
const W = Number(qs.get("w") ?? (single ? 390 : 232));
const H = Number(qs.get("h") ?? (single ? 844 : 502));

const app = document.createElement("div");
app.className = single ? "sp sp--single" : "sp";
document.body.appendChild(app);

/**
 * 单场模式把舞台摆在页面里（活的：纸纹、墨层、视差都在）；
 * 联排模式把它挪到画面外，只取画布像素，再用同样的两层叠回每一格。
 */
const stage = document.createElement("div");
// 底色要自己铺：画布是透明的，游戏里纸色来自页面，这一页也得给，否则留白会显成黑的
stage.style.cssText = single
  ? `position:relative;width:${W}px;height:${H}px;overflow:hidden;flex:0 0 auto;`
  : `position:fixed;left:-4000px;top:0;width:${W}px;height:${H}px;overflow:hidden;`;
(single ? app : document.body).appendChild(stage);

const renderer = new ThreeStageRenderer();
renderer.mount(stage);
renderer.resize(W, H);

/** 底色：白天与夜里的纸都算留白，画布透明处露的也是它 */
function groundsOf(): string[] {
  const cs = getComputedStyle(document.documentElement);
  return [cs.getPropertyValue("--c-ground").trim(), cs.getPropertyValue("--c-ground-night").trim()];
}

async function run(): Promise<void> {
  const shots: Shot[] = single
    ? [{
        key: single, palette: (qs.get("palette") as Palette) ?? "ink",
        act: Number(qs.get("act") ?? 1), label: single,
        ink: qs.get("ink") ? Number(qs.get("ink")) : undefined,
      }]
    : SHOTS;
  const rows: string[] = [];
  for (const s of shots) {
    document.documentElement.dataset.palette = s.palette;
    await renderer.show({ key: s.key, palette: s.palette, act: s.act });
    if (s.ink !== undefined) renderer.setInk(s.ink);
    renderer.settle();
    const ms = renderer.benchmark(40);
    renderer.settle();                                  // 读像素前最后画一帧
    const canvas = stage.querySelector("canvas")!;
    const m = measure(canvas, s.palette, groundsOf());
    const url = single ? "" : canvas.toDataURL("image/png");
    const tris = renderer.triangles();
    const inkNow = stage.dataset.ink || "0";

    const fig = document.createElement("figure");
    fig.className = "sp__fig";
    fig.dataset.palette = s.palette;
    if (!single) {
      // 把纸纹与墨层按真实层序叠回来，这一格看到的就是玩家看到的
      const shot = document.createElement("div");
      shot.className = "sp__shot";
      shot.dataset.night = stage.dataset.night || "";
      shot.style.cssText = `position:relative;width:${W}px;height:${H}px;overflow:hidden;`;
      const img = document.createElement("img");
      img.src = url; img.width = W; img.height = H; img.alt = s.label;
      shot.appendChild(img);
      if (Number(inkNow) > 0) {
        const ink = document.createElement("div");
        ink.className = "stage__ink";
        ink.style.setProperty("--ink-cover", inkNow);
        shot.appendChild(ink);
      }
      const paper = document.createElement("div");
      paper.className = "stage__paper";
      shot.appendChild(paper);
      fig.appendChild(shot);
    }
    const cap = document.createElement("figcaption");
    const minBlank = s.palette === "gold" ? 30 : 40;
    const ok = (v: boolean) => (v ? "✓" : "✗");
    cap.innerHTML = `<b>${s.label}</b>`
      + `<span>${s.key} · ${s.palette} · 第${s.act}幕 · 墨层 ${inkNow}</span>`
      + `<span>${tris} 面 ${ok(tris <= 1500)} · ${ms.toFixed(2)} ms/帧 ${ok(ms <= 3)}</span>`
      + `<span>留白 ${m.blank.toFixed(1)}%（格 ${m.blankCells}/100）${ok(m.blank >= minBlank)}`
      + ` · 朱砂 ${m.accent.toFixed(2)}% ${ok(m.accent <= 3)}</span>`
      + `<span>${m.areas.map(([n, v]) => `${n} ${v.toFixed(1)}`).join(" · ")}</span>`;
    fig.appendChild(cap);
    app.appendChild(fig);
    rows.push([s.key, s.palette, "act" + s.act, inkNow, tris, ms.toFixed(2), m.blank.toFixed(1),
      m.blankCells, m.accent.toFixed(2), m.areas.map(([n, v]) => `${n}:${v.toFixed(1)}`).join("/")].join("\t"));
  }
  const pre = document.createElement("pre");
  pre.className = "sp__tsv";
  pre.textContent = "key\tpalette\tact\t墨层\t面\tms\t留白%\t留白格\t朱砂%\t各色面积%\n" + rows.join("\n");
  app.appendChild(pre);
  document.title = "舞台抽查 · 完成";
}

const css = document.createElement("style");
css.textContent = `
  body { margin: 0; background: #2a2a28; color: #EDE7DA; font: 12px/1.5 system-ui, sans-serif; }
  .sp { display: flex; flex-wrap: wrap; gap: 10px; padding: 10px 10px 40px; align-items: flex-start; }
  .sp__fig { margin: 0; width: ${W}px; }
  .sp__shot { background: var(--c-ground); }
  .sp__fig[data-palette="gold"] .sp__shot { background: #E6D9B9; }
  .sp__shot[data-night="1"] { background: #D8D2C4; }
  .sp__fig[data-palette="gold"] .sp__shot[data-night="1"] { background: #D6C6A0; }
  .sp__shot img { display: block; }
  .sp__fig figcaption { display: flex; flex-direction: column; gap: 1px; padding: 4px 2px; font-size: 11px; }
  .sp__fig b { font-size: 12px; }
  .sp__fig span { color: #b9b4a8; }
  /* 底色跟 .stage 自己的规则走，不写行内样式——行内会盖掉 [data-night] 那条，夜景就白了 */
  .sp--single .stage { background: var(--c-ground); }
  .sp--single .stage[data-night="1"] { background: var(--c-ground-night); }
  .sp__tsv { width: 100%; white-space: pre; color: #9f9a8e; border-top: 1px solid #555; padding-top: 8px; }
`;
document.head.appendChild(css);

void run();
