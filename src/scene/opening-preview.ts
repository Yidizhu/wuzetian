/**
 * 开场抽查台（E5）。只在 dev 下打开。标题 → 题记 → 第一场带登场卡的对话框，按手机上的顺序走一遍。
 *   /src/scene/opening-preview.html                    竖屏 390×844，从标题开始
 *   ?step=tiji | scene                                 直接跳到某一屏
 *   ?key=zhaoyang&palette=gold&who=peizhaoye           换场景、换色板、换登场的人
 *   ?w=900&h=520                                       横屏
 * 点画面往下走，和游戏里一样。
 */
import "../styles/palette.css";
import "../styles/app.css";
import { mountTitle } from "./TitleScreen.ts";
import { mountEpigraph } from "./Epigraph.ts";
import { attachDebut, type Debut } from "./Debut.ts";
import { ThreeStageRenderer } from "./ThreeStageRenderer.ts";
import type { Palette, SceneKey } from "../engine/types.ts";

const qs = new URLSearchParams(location.search);
const W = Number(qs.get("w") ?? 390);
const H = Number(qs.get("h") ?? 844);
const KEY = (qs.get("key") ?? "yeting") as SceneKey;
const PALETTE = (qs.get("palette") ?? "ink") as Palette;
const WHO = qs.get("who") ?? "peizhaoye";

const files = import.meta.glob<string>("../char/*.svg", { query: "?raw", import: "default", eager: true });
const sprite = (name: string): string => files[`../char/${name}.svg`] ?? "";

/** 占位文案。职务取自角色圣经第一行的意思，一句话是美术写来量版位的，措辞归 ChatGPT */
const DEBUTS: Record<string, { name: string; d: Debut; text: string }> = {
  peizhaoye: { name: "裴照夜", d: { role: "奉召入京的女将", line: "士卒要活着回来，军令要有人担责" },
               text: "马是我挑的。鞍子你别碰，我来。" },
  shenheng: { name: "沈衡", d: { role: "秘书省校书郎", line: "字写错一个，她就一整夜不睡" },
              text: "这份名册，谁誊的？" },
  liuchenghuan: { name: "柳承欢", d: { role: "掖庭典记", line: "稿子替你核过两遍了" },
                  text: "你先喝口水。纸我拿着。" },
};

const EPIGRAPH = [
  "女皇临朝的第十四年，长安。",
  "这一朝的诏书里写过一句话：受位者，不限宗室。",
  "写下之后，还没有人用过它。",
];

document.documentElement.dataset.palette = PALETTE;
const css = document.createElement("style");
css.textContent = `body{margin:0;background:#2a2a28;display:flex;align-items:flex-start;gap:16px}
  .of{position:relative;overflow:hidden;background:var(--c-ground);margin:16px;flex:0 0 auto;cursor:pointer}
  .of .title,.of .tiji{position:absolute}
  .of-hint{color:#b9b4a8;font:12px system-ui;margin:16px;max-width:260px;line-height:1.6}`;
document.head.appendChild(css);

const frame = document.createElement("div");
frame.className = "of";
frame.style.width = `${W}px`;
frame.style.height = `${H}px`;
document.body.appendChild(frame);
const hint = document.createElement("p");
hint.className = "of-hint";
document.body.appendChild(hint);
(window as unknown as { __opening: unknown }).__opening = { frame };

function title(): void {
  hint.textContent = "标题：点「入宫」";
  mountTitle(frame, { onStart: tiji });
  frame.querySelector<HTMLElement>(".title")!.style.position = "absolute";
}

function tiji(): void {
  hint.textContent = "题记：第一下补完，第二下合上";
  window.setTimeout(() => {
    mountEpigraph(frame, { lines: EPIGRAPH, onDone: scene });
  }, 380);
}

async function scene(): Promise<void> {
  hint.textContent = "第一场：登场卡只挂在这个人的第一句上。点一下看第二句";
  const stage = document.createElement("div");
  stage.className = "stage stage--three";
  frame.appendChild(stage);
  const renderer = new ThreeStageRenderer();
  renderer.mount(stage);
  await renderer.show({ key: KEY, palette: PALETTE, act: 1 });
  // 抽查台常在后台标签里跑，requestAnimationFrame 被停，推镜走不完——直接落到终点再量
  renderer.settle();

  const cast = document.createElement("div");
  cast.className = "cast";
  const who = DEBUTS[WHO] ?? DEBUTS.peizhaoye!;
  for (const [k, side, active] of [["wuze", "left", ""], [WHO, "right", "1"]] as const) {
    const slot = document.createElement("div");
    slot.className = "cast__slot";
    slot.dataset.side = side;
    slot.dataset.active = active;
    slot.innerHTML = sprite(`${k}_default`);
    cast.appendChild(slot);
  }
  frame.appendChild(cast);

  const dlg = document.createElement("div");
  dlg.className = "dlg";
  dlg.dataset.kind = "say";
  dlg.innerHTML = `<div class="dlg__name"></div><div class="dlg__text"></div>`;
  frame.appendChild(dlg);
  const name = dlg.querySelector<HTMLElement>(".dlg__name")!;
  const text = dlg.querySelector<HTMLElement>(".dlg__text")!;
  name.textContent = who.name;
  text.textContent = who.text;
  attachDebut(dlg, who.d);

  let n = 0;
  frame.addEventListener("click", () => {
    n += 1;
    if (n === 1) { text.textContent = "上一回点名，你站在第三排。"; attachDebut(dlg, null); }
    else { attachDebut(dlg, who.d); text.textContent = who.text; n = 0; }
  });
}

const step = qs.get("step");
if (step === "tiji") tiji();
else if (step === "scene") void scene();
else title();
