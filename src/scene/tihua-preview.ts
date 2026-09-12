/**
 * 题画抽查台。只在 dev 下打开，不进任何产物。
 *
 *   /src/scene/tihua-preview.html              四张定版，覆盖两块色板、有人无人
 *   /src/scene/tihua-preview.html?live=yuanye  活的合成器：机位 / 姿态 / 题跋三行可挑
 *
 * 诗全部出自 docs/C0-2-诗词库与对诗.md 的唐及唐以前作品。这一页不新写诗。
 */
import "../styles/palette.css";
import "../styles/app.css";
import { ThreeStageRenderer } from "./ThreeStageRenderer.ts";
import { compose, openTiHua } from "./TiHua.ts";
import type { Palette, SceneKey } from "../engine/types.ts";

interface Shot {
  key: SceneKey; palette: Palette; act: number;
  poem: string[]; sign?: string; seal?: string; cast?: string[]; label: string;
}

const SHOTS: Shot[] = [
  {
    key: "yuanye", palette: "ink", act: 1, label: "御花园夜 · 两个人",
    poem: ["自恨罗衣掩诗句", "举头空羡榜中名"], sign: "鱼玄机句 吾则添 录",
    cast: ["wuze_open", "xujinghe_default"],
  },
  {
    key: "shishe", palette: "ink", act: 1, label: "诗社水榭 · 一个人",
    poem: ["明月松间照", "清泉石上流"], sign: "王维句 吾则添 录", cast: ["wenqiao_open"],
  },
  {
    key: "zhaoyang", palette: "gold", act: 1, label: "昭阳殿 · 金碧（印应转泥金）",
    poem: ["尺素如残雪", "结为双鲤鱼"], sign: "李冶句 吾则添 录", cast: ["shenheng_guarded"],
  },
  {
    key: "wuzibei", palette: "ink", act: 1, label: "无字碑 · 无人无诗",
    poem: [], sign: "吾则天 立", seal: "则天",
  },
];

const POEMS = [
  ["自恨罗衣掩诗句", "举头空羡榜中名"],
  ["明月松间照", "清泉石上流"],
  ["尺素如残雪", "结为双鲤鱼"],
  [],
];
const SIGNS = ["鱼玄机句 吾则添 录", "王维句 吾则添 录", "李冶句 吾则添 录", "吾则添 题"];

const qs = new URLSearchParams(location.search);
const app = document.createElement("div");
app.className = "tp";
document.body.appendChild(app);

const live = qs.get("live") as SceneKey | null;
const stage = document.createElement("div");
stage.style.cssText = live
  ? "position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0;"
  : "position:fixed;left:-4000px;top:0;width:430px;height:930px;overflow:hidden;";
document.body.appendChild(stage);
const renderer = new ThreeStageRenderer();
renderer.mount(stage);
renderer.resize(430, 930);
if (live) { stage.style.width = "430px"; stage.style.height = "930px"; stage.style.left = "-4000px"; stage.style.opacity = "1"; }

async function run(): Promise<void> {
  if (live) {
    const palette = (qs.get("palette") as Palette) ?? "ink";
    document.documentElement.dataset.palette = palette;
    await renderer.show({ key: live, palette, act: Number(qs.get("act") ?? 1) });
    renderer.settle();
    await openTiHua(document.body, {
      shooter: renderer,
      palette,
      night: stage.dataset.night === "1",
      poems: POEMS,
      signs: SIGNS,
      cast: (qs.get("cast") ?? "wuze,xujinghe").split(",").filter(Boolean),
      name: qs.get("name") ?? "吾则添",
    });
    document.title = "题画合成器";
    return;
  }
  for (const s of SHOTS) {
    document.documentElement.dataset.palette = s.palette;
    await renderer.show({ key: s.key, palette: s.palette, act: s.act });
    renderer.settle();
    const t0 = performance.now();
    const canvas = await compose({
      source: stage.querySelector("canvas"),
      palette: s.palette,
      night: stage.dataset.night === "1",
      poem: s.poem, sign: s.sign, seal: s.seal, cast: s.cast,
    });
    const ms = performance.now() - t0;
    const fig = document.createElement("figure");
    fig.className = "tp__fig";
    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.width = 300; img.height = 400;
    const cap = document.createElement("figcaption");
    cap.textContent = `${s.label} · 合成 ${ms.toFixed(0)} ms · ${(img.src.length / 1024).toFixed(0)} KB`;
    fig.append(img, cap);
    app.appendChild(fig);
  }
  document.title = "题画抽查 · 完成";
}

const css = document.createElement("style");
css.textContent = `
  body { margin: 0; background: #2a2a28; color: #EDE7DA; font: 12px/1.5 system-ui, sans-serif; }
  .tp { display: flex; flex-wrap: wrap; gap: 12px; padding: 12px; align-items: flex-start; }
  .tp__fig { margin: 0; width: 300px; }
  .tp__fig img { display: block; width: 300px; height: 400px; }
  .tp__fig figcaption { padding: 4px 2px; color: #b9b4a8; }
`;
document.head.appendChild(css);
void run();
