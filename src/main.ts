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
import { onTap, mountTapDebug } from "./ui/tap.ts";
import { SaveSlots } from "./ui/SaveSlots.ts";
import * as saveApi from "./engine/save.ts";
import { NAMES } from "./ui/names.ts";
import { CharacterLayer } from "./ui/CharacterLayer.ts";
import { Inbox } from "./ui/Inbox.ts";
import { mountTitle } from "./scene/TitleScreen.ts";
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
const cast = new CharacterLayer(app, sprites, (f) => store.state.flags[f] === true);
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
  () => void story.restart(),
);
// 信箱要挂在 HUD 上，HUD 在后面才建；先声明，建好 HUD 再接
let inbox: Inbox | null = null;

store.subscribe((s) => status.update(s));

story.on((e) => {
  switch (e.kind) {
    case "scene":
      // 先对一遍台上的人再换阵容：上一场出口写的 flag（比如归还戏的 chenghuan_returned）
      // 要在这一场第一眼就生效，不能等到她下一次开口
      void cast.refresh().then(() => cast.setCast(e.scene.cast));
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
//
// 走 ui/tap.ts 而不是 app 上的 click（D-047）：那个写法靠事件冒泡，
// 中间任何一层挡一下，游戏就点不动而画面毫无异样。现在在 window 的捕获阶段听，
// 谁都挡不住；「点在选项／对诗／面板上不该翻页」由 tap.ts 按元素判断。
//
// 面板是否打开仍旧要看：对诗和结算页是满屏的，它们开着时点空白处不该往下走。
const openPanel = (sel: string): boolean => {
  const el = document.querySelector<HTMLElement>(sel);
  return !!el && !el.hidden;
};
onTap(() => {
  if (slots.visible || inbox?.visible) return;
  if (openPanel(".duel") || openPanel(".summary")) return;
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

/**
 * 左上角那一条。玩家默认只看得见「存档」和「案上」两个字（B10 第 2 条）。
 *
 * 渲染器名、切渲染器、帧数这些是验收工具，`?dev=1` 才出现。
 * 「清档重来」收进了存档面板并且要点两下——它挨着「存档」放在一起时太危险了，
 * 两个字的按钮，一寸远，一下点错就是整局没了。
 */
const dev = new URLSearchParams(location.search).has("dev");
const hud = document.createElement("div");
hud.className = "hud";
if (dev) hud.innerHTML = `<span>渲染器：${(renderer as { name?: string }).name ?? "?"}</span>`;
const slotsBtn = document.createElement("button");
slotsBtn.type = "button";
slotsBtn.textContent = "存档";
slotsBtn.addEventListener("click", (e) => { e.stopPropagation(); slots.toggle(); });
hud.append(slotsBtn);
if (dev) {
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
  hud.append(swap);
}
inbox = new Inbox(app, hud, {
  poems,
  onRead: (id) => story.markLetterRead(id),
  onReply: (id, kind, tags) => story.replyLetter(id, kind, tags),
}, () => story.letters.onDesk(), () => store.state);
inbox.setUnread(story.letters.unreadCount(), story.letters.onDesk().length);
if (dev && (renderer as { name?: string }).name === "three-stage") {
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

// `?tapdebug=1`：把最近几次触摸打在屏幕上。微信里开不了控制台，出事只能靠截图（D-047）
if (new URLSearchParams(location.search).has("tapdebug")) {
  mountTapDebug(app, () => `${story.sceneId} 第 ${story.lineIndex} 句`);
}

/**
 * 首屏是标题画面（D-048 第 1 条）。
 *
 * 在这之前玩家打开网址，第一眼就是「纸上已经写好：自愿试骑。」——没有书名、没有人、
 * 没有地方，YIDI 以为那是个范例。标题 CC3 在 E3 就做好了，只是一直没挂上来。
 *
 * 游戏在她点了之后才开始，不在页面加载时开始。两个理由：
 * 一，「入宫」那一下是手机上唯一合法的解锁音频的时机（D-053）；
 * 二，首屏提示要等她进了游戏再说，压在标题上它就成了第四样东西。
 *
 * `?notitle=1` 跳过，给无头验收和抽查用。
 */
const begin = (fresh: boolean): void => {
  showFirstRunNotice(app, () => slots.show());
  void story.start({ fresh });
};
if (new URLSearchParams(location.search).has("notitle")) {
  begin(false);
} else {
  mountTitle(document.body, {
    resume: saveApi.hasResumable() ? { onResume: () => begin(false) } : undefined,
    onStart: () => begin(true),
  });
}
}

void main();
