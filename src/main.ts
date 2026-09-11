import "./styles/app.css";

import { Store } from "./engine/state.ts";
import { Story } from "./engine/story.ts";
import type { Ending, Scene } from "./engine/types.ts";
import { CssParallaxRenderer } from "./scene/CssParallaxRenderer.ts";
import { NullRenderer } from "./scene/NullRenderer.ts";
import type { ThreeStageRenderer } from "./scene/ThreeStageRenderer.ts";
import type { SceneRenderer } from "./scene/SceneRenderer.ts";
import { DialogueBox } from "./ui/DialogueBox.ts";
import { ChoiceList } from "./ui/ChoiceList.ts";
import { StatusBar } from "./ui/StatusBar.ts";
import { PoemDuel } from "./ui/PoemDuel.ts";
import { ChapterSummary } from "./ui/ChapterSummary.ts";
import { showFirstRunNotice, showNotice } from "./ui/FirstRunNotice.ts";
import { SaveSlots } from "./ui/SaveSlots.ts";
import * as saveApi from "./engine/save.ts";
import { NAMES } from "./ui/names.ts";
import { CharacterLayer } from "./ui/CharacterLayer.ts";
import { Inbox } from "./ui/Inbox.ts";
import endingData from "./data/endings.json";
import adultScenes from "virtual:adult-scenes";
import converted from "virtual:converted-data";
import poemData from "./data/poems.json";
import duelData from "./data/duels.json";
import type { LetterT, PoemT, PoemDuelT } from "./engine/schema.ts";

// 剧本数据全部来自 JSON，引擎里没有一句硬编码剧情。
// 格式与校验规则见 docs/story-schema.md，构建前由 tools/validate-story.ts 把关。
const modules = import.meta.glob<{ default: Scene }>("./data/chapters/**/*.json", { eager: true });
const letterModules = import.meta.glob<{ default: LetterT }>("./data/letters/*.json", { eager: true });

/**
 * `?data=converted`：用 CC2 的转换产物替掉正式数据。
 * 它还没通过 validate，只用来拿真剧本压引擎；正式产物里那些文件不存在
 * （vite.config 的 virtual:converted-data 在生产构建里返回空数组）。
 */
const useConverted = new URLSearchParams(location.search).get("data") === "converted"
  && converted.scenes.length > 0;
const pick = <T,>(a: T[], b: T[]): T[] => (useConverted && a.length ? a : b);

const letters: LetterT[] = pick(
  converted.letters,
  Object.values(letterModules).map((m) => m.default as unknown as LetterT),
);
// 立绘：三十张 SVG 以文本形式打进包里，键是文件名去掉扩展名
const spriteFiles = import.meta.glob<string>("./char/*.svg", { query: "?raw", import: "default", eager: true });
const sprites: Record<string, string> = {};
for (const [path, svg] of Object.entries(spriteFiles)) {
  sprites[path.slice(path.lastIndexOf("/") + 1, -4)] = svg;
}
const baseScenes: Scene[] = pick(converted.scenes, Object.values(modules).map((m) => m.default));
// 18+ 数据包（D-029）。默认构建里 adultScenes 是空数组，那些文件根本没进产物。
// 同 id 后者胜：全年龄版在屏风前收尾的那一场，被这里的同名场景整场换掉。
const byId = new Map<string, Scene>(baseScenes.map((s) => [s.id, s]));
for (const s of adultScenes) byId.set(s.id, s);
const scenes: Scene[] = [...byId.values()];
if (adultScenes.length) console.info(`[data] 18+ 数据包已合入 ${adultScenes.length} 场`);
// JSON 导入的字面量类型比 schema 窄（缺席的可选键被推成 undefined），
// 数据本身已由构建前的 validate 把关，这里直接断言。
const endings: Ending[] = pick(converted.endings, endingData as unknown as Ending[]);
const duels: PoemDuelT[] = pick(converted.duels, duelData as unknown as PoemDuelT[]);
const poems = new Map<string, PoemT>(
  pick(converted.poems, poemData as unknown as PoemT[]).map((p) => [p.id, p]),
);
const START = useConverted ? (baseScenes[0]?.id ?? "ch01_s01_zhaoyang") : "ch01_s01_zhaoyang";
if (useConverted) console.info(`[data] 预览 CC2 转换产物：${baseScenes.length} 场，起点 ${START}`);

/**
 * 换渲染器就是换这一行。M1 的验收动作：?renderer=null 打开，
 * 注册一个什么都不画的渲染器，游戏必须照常从头跑到尾。
 * 跑得通才说明 D-003 那条退路是真的。
 */
async function pickRenderer(): Promise<SceneRenderer> {
  const want = new URLSearchParams(location.search).get("renderer");
  if (want === "null") return new NullRenderer();
  // three.js 动态加载：默认的 CSS 版不背这 120KB，D-003 的退路才是真的轻
  if (want === "three") {
    try {
      return new (await import("./scene/ThreeStageRenderer.ts")).ThreeStageRenderer();
    } catch (e) {
      // 单文件 Artifact 里没有那个 chunk，或者设备不支持 WebGL：退回 CSS 版，游戏照常
      console.warn("[renderer] 3D 舞台加载失败，退回 CSS 版", e);
    }
  }
  // 默认仍是 CSS 版。3D 版过了 D-003 的性能闸门再切成默认。
  return new CssParallaxRenderer();
}

async function main(): Promise<void> {
const app = document.querySelector<HTMLElement>("#app")!;
const stageRoot = document.createElement("div");
app.appendChild(stageRoot);

const renderer = await pickRenderer();
renderer.mount(stageRoot);

const store = new Store();
const cast = new CharacterLayer(app, sprites);
const status = new StatusBar(app);
const dlg = new DialogueBox(app);

const duelUi = new PoemDuel(app);
const summary = new ChapterSummary(app, NAMES, poems);

const story = new Story(
  scenes, endings, duels, letters, store, renderer,
  {
    duel: (d) => { dlg.setVisible(false); return duelUi.play(d).finally(() => dlg.setVisible(true)); },
    chapterEnd: (ch, ps) => { dlg.setVisible(false); return summary.show(store.state, { chapter: ch, poemsThisChapter: ps }).finally(() => dlg.setVisible(true)); },
  },
  START,
);
const choices = new ChoiceList(app, (id) => void story.choose(id));
const slots = new SaveSlots(
  app,
  (n) => story.saveTo(n),
  (n) => void story.loadFrom(n),
  (n, s) => { saveApi.write(n, s); slots.hide(); void story.loadFrom(n); },
);
// 信箱要挂在 HUD 上，HUD 在后面才建；先声明，建好 HUD 再接
let inbox: Inbox | null = null;

store.subscribe((s) => status.update(s));

story.on((e) => {
  switch (e.kind) {
    case "scene":
      void cast.setCast(e.scene.cast);
      break;
    case "flare":
      cast.flare(e.who);
      break;
    case "letters":
      inbox?.setUnread(e.unread, story.letters.onDesk().length + e.unread);
      break;
    case "line":
      choices.hide();
      dlg.setVisible(true);
      void cast.speak(e.who, e.expr as "default" | "guarded" | "open");
      // 读过的句子直接显示完整，没读过的逐字来。skip 只跳读过的文本。
      dlg.show(e.who, e.text, e.lineKind, store.state, !e.first);
      break;
    case "choices":
      dlg.setVisible(false);
      choices.show(e.items);
      break;
    case "ending": {
      choices.hide();
      dlg.setVisible(true);
      dlg.show("narr", e.body, "aside", store.state, true);
      const title = document.createElement("div");
      title.className = "ending-title";
      title.textContent = e.ending.title;
      app.appendChild(title);
      break;
    }
    // 剧本改过结构，旧档的句号对不上了，位置退回章首（D-037 第 3 条）。
    // 说清楚保住了什么：她会想知道自己这一路做的决定还在不在。
    case "rewound":
      showNotice(app, `剧本更新过，这一章重新开始。你的数值、好感和收到的诗都还在。`, { sticky: true });
      break;
    // 章走完了，下一章还没有。这句话是说给玩家听的，不是报错（D-034）
    case "toBeContinued":
      choices.hide();
      dlg.setVisible(true);
      dlg.show("narr", "下章待续。换设备之前，记得到「存档」里导出一串存档码。", "aside", store.state, true);
      break;
    case "end":
      dlg.setVisible(true);
      dlg.show("narr", "（走到这里没有结局数据，检查 endings.json。）", "aside", store.state, true);
      break;
  }
});

// 点一下：正在逐字就补完，已经完整就推进。第二下才算翻页。
// 对诗、结算页、存档面板打开时不吃这一下，它们各自有自己的按钮。
app.addEventListener("click", () => {
  if (slots.visible || inbox?.visible) return;
  if (!document.querySelector<HTMLElement>(".duel")?.hidden) return;
  if (!document.querySelector<HTMLElement>(".summary")?.hidden) return;
  if (dlg.complete()) return;
  story.advance();
});
window.addEventListener("keydown", (e) => {
  if (e.key !== " " && e.key !== "Enter" && e.key !== "ArrowRight") return;
  e.preventDefault();
  if (dlg.complete()) return;
  story.advance();
});
window.addEventListener("resize", () => renderer.resize(window.innerWidth, window.innerHeight));

// M1 验收用的小工具条，正式版会去掉
const hud = document.createElement("div");
hud.className = "hud";
hud.innerHTML = `<span>渲染器：${(renderer as { name?: string }).name ?? "?"}</span>`;
const reset = document.createElement("button");
reset.type = "button";
reset.textContent = "清档重来";
reset.addEventListener("click", (e) => { e.stopPropagation(); void story.restart(); });
const slotsBtn = document.createElement("button");
slotsBtn.type = "button";
slotsBtn.textContent = "存档";
slotsBtn.addEventListener("click", (e) => { e.stopPropagation(); slots.toggle(); });
const swap = document.createElement("button");
swap.type = "button";
swap.textContent = (renderer as { name?: string }).name === "null" ? "切回 CSS 版" : "切空渲染器";
swap.addEventListener("click", (e) => {
  e.stopPropagation();
  const u = new URL(location.href);
  if ((renderer as { name?: string }).name === "null") u.searchParams.delete("renderer");
  else u.searchParams.set("renderer", "null");
  location.href = u.toString();
});
hud.append(slotsBtn, swap, reset);
inbox = new Inbox(app, hud, {
  poems,
  onRead: (id) => story.markLetterRead(id),
  onReply: (id, kind, tags) => story.replyLetter(id, kind, tags),
}, () => story.letters.onDesk(), () => store.state);
inbox.setUnread(story.letters.unreadCount(), story.letters.onDesk().length);
if ((renderer as { name?: string }).name === "three-stage") {
  const three = renderer as ThreeStageRenderer;
  const perf = document.createElement("span");
  perf.className = "hud__perf";
  hud.appendChild(perf);
  // 推镜结束后测一次；之后每 3 秒刷一次，手机上拿着看
  const tick = () => {
    const ms = three.benchmark(30);
    perf.textContent = ms ? `${ms.toFixed(1)}ms/帧 · ${three.triangles()}面` : "";
  };
  window.setTimeout(tick, 3200);
  window.setInterval(tick, 3000);
}
app.appendChild(hud);

// 首屏提示（D-034）：存档只在这一个浏览器里。放在 start() 之前，她还没往下点
showFirstRunNotice(app, () => slots.show());

void story.start();
}

void main();
