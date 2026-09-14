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
import { FrameJudge } from "./ui/frameJudge.ts";
import { SaveSlots } from "./ui/SaveSlots.ts";
import * as saveApi from "./engine/save.ts";
import { NAMES } from "./ui/names.ts";
import { CharacterLayer } from "./ui/CharacterLayer.ts";
import { Inbox } from "./ui/Inbox.ts";
import { mountTitle } from "./scene/TitleScreen.ts";
import { attachDebut } from "./scene/Debut.ts";
import { mountEpigraph } from "./scene/Epigraph.ts";
import { debutsOn, setDebutsOn, soundOn, setSoundOn } from "./ui/prefs.ts";
import { Ambient } from "./audio/ambient.ts";
import { cuesForScene, cuesForLine, newCueState, type Cue } from "./audio/cues.ts";
import endingData from "./data/endings.json";
import adultScenes from "virtual:adult-scenes";
import converted from "virtual:converted-data";
import rasterList from "virtual:raster-assets";
import { RasterCatalog, framingFor } from "./scene/raster.ts";
import poemData from "./data/poems.json";
import duelData from "./data/duels.json";
import introData from "./data/intros.json";
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
// 开场是序幕 ch01-00（C10、D-048）：题记三句、她的身体与位置三句，然后才是「纸上已经写好」
const START = "ch01_s00_zhaoyang";
/**
 * 光栅图（D-095，B17）。**默认是关的——不是开关关着，是一张图都还没有**：`public/char`、`public/scene` 是空的，
 * 清单为空，立绘和背景全走 SVG／渐变。CC3 的 `art:post` 出了验收过的 webp，下一次构建就用上。
 * `?art=svg` 强制不用光栅图，拿来和新图对比。
 */
const raster = new URLSearchParams(location.search).get("art") === "svg"
  ? RasterCatalog.empty()
  : new RasterCatalog(rasterList, import.meta.env.BASE_URL);
/** 结局第一拍（只有画面）至少停多久才认点击，毫秒（D-084） */
const ENDING_PICTURE_HOLD_MS = 1500;
/** 结局第一拍还在时，点一下要调的函数；不在第一拍时是 null */
let releaseEndingPicture: (() => void) | null = null;
if (useConverted) console.info(`[data] 预览 CC2 转换产物：${baseScenes.length} 场，起点 ${START}`);

/**
 * 换渲染器就是换这一行。M1 的验收动作：?renderer=null 打开，
 * 注册一个什么都不画的渲染器，游戏必须照常从头跑到尾。
 * 跑得通才说明 D-003 那条退路是真的。
 */
/**
 * 背景层走哪个。分叉写清楚，因为上一次这个分叉只活在一行注释里，六轮没人看见（D-069）。
 *
 * **默认现在还是 CSS。** D-069 定了改 3D，R-017 又把它按住：3D 那一屏还有八条问题，
 * 现在切，等于把一屏更糟的画面变成所有人的第一印象。切换本身写好了，就是下面「auto」那一套；
 * Cowork 说切的那天，把 `DEFAULT_RENDERER` 改成 "auto"，别的一行都不用动。
 *
 * | 条件 | 走哪个 |
 * |---|---|
 * | 什么都不加（玩家） | **`DEFAULT_RENDERER`，现在是 CSS** |
 * | `?renderer=auto`（= 切了之后玩家拿到的那一套，先给 YIDI 真机试） | 3D，扛不住退 CSS，规则见下面四行 |
 * | 　auto 下：这台设备七天内因为太卡退过 | CSS（记在 localStorage；过七天再试一次 3D） |
 * | 　auto 下：3D 那个包加载失败，或者没有 WebGL | CSS，并记下来 |
 * | 　auto 下：3D 跑起来之后连续卡（见 ui/frameJudge.ts） | 当场换成 CSS，不打断当前场景，并记下来 |
 * | `?renderer=three` | 3D，**不自动退**，并清掉「退过」的记录（看进度、验真机帧数） |
 * | `?renderer=css` | CSS |
 * | `?renderer=null` | 空渲染器（M1 验收：不画背景，游戏照常跑完） |
 *
 * 3D 包加载失败时 three 也退 CSS——那不是「卡」，是根本起不来，不退就是白屏。
 * 单文件版里没有 3D 那个分包，auto 和 three 走的都是「加载失败」那一行。
 */
// D-086：自动回退还没在真机上证过。YIDI 用 ?renderer=auto 在手机上报结果之前，这一行不许改成 auto
const DEFAULT_RENDERER: "css" | "auto" = "css";
const RENDERER_MODE = new URLSearchParams(location.search).get("renderer") ?? DEFAULT_RENDERER;
const FALLBACK_KEY = "wuzetian.renderer.fallback";

function rememberFallback(why: string): void {
  try { localStorage.setItem(FALLBACK_KEY, JSON.stringify({ why, at: Date.now() })); } catch { /* 记不住就下次再试一次 3D */ }
}

async function pickRenderer(root: HTMLElement): Promise<SceneRenderer> {
  const want = RENDERER_MODE;
  const mountCss = (): SceneRenderer => { const r = new CssParallaxRenderer(raster); r.mount(root); return r; };
  if (want === "null") { const r = new NullRenderer(); r.mount(root); return r; }
  // 不认识的值当 CSS：拼错一个参数不该把玩家送进一条没验过的路
  if (want !== "auto" && want !== "three") return mountCss();
  if (want === "three") {
    try { localStorage.removeItem(FALLBACK_KEY); } catch { /* 无痕模式 */ }
  } else {
    let prior: string | null = null;
    try { prior = localStorage.getItem(FALLBACK_KEY); } catch { /* 读不了就当没退过 */ }
    // 七天后再给 3D 一次机会：一次发烫降频、一次后台下载占满带宽，不该让这台手机永远看不到场景
    const stale = (() => { try { return Date.now() - (JSON.parse(prior ?? "{}").at ?? 0) > 7 * 86400_000; } catch { return true; } })();
    if (prior && stale) { try { localStorage.removeItem(FALLBACK_KEY); } catch { /* */ } prior = null; }
    if (prior) {
      console.info("[renderer] 这台设备上次退回过 CSS 版，这次直接用它。加 ?renderer=three 重试 3D", prior);
      return mountCss();
    }
  }
  try {
    const r = new (await import("./scene/ThreeStageRenderer.ts")).ThreeStageRenderer();
    r.mount(root);          // 没有 WebGL 时是这一行抛
    return r;
  } catch (e) {
    console.warn("[renderer] 3D 舞台起不来，退回 CSS 版", e);
    root.innerHTML = "";
    root.className = "";
    if (want === "auto") rememberFallback(`加载失败：${e instanceof Error ? e.message : String(e)}`);
    return mountCss();
  }
}

async function main(): Promise<void> {
const app = document.querySelector<HTMLElement>("#app")!;
const stageRoot = document.createElement("div");
app.appendChild(stageRoot);

let renderer = await pickRenderer(stageRoot);

const store = new Store();
const cast = new CharacterLayer(app, sprites, (f) => store.state.flags[f] === true, raster);
const status = new StatusBar(app);
const dlg = new DialogueBox(app);

const duelUi = new PoemDuel(app);
const summary = new ChapterSummary(app, NAMES, poems);

const story = new Story(
  scenes, endings, duels, letters, store, renderer,
  {
    duel: (d) => { dlg.setVisible(false); return duelUi.play(d).finally(() => dlg.setVisible(true)); },
    chapterEnd: (ch, ps) => { dlg.setVisible(false); return summary.show(store.state, { chapter: ch, poemsThisChapter: ps }).finally(() => dlg.setVisible(true)); },
    // 题记（D-063）：CC3 的那张纸，和标题同一套版式。看它的时候对话框和选项都收起来
    epigraph: (lines) => new Promise<void>((resolve) => {
      dlg.setVisible(false);
      choices.hide();
      mountEpigraph(document.body, { lines, onDone: () => { dlg.setVisible(true); resolve(); } });
    }),
    // 结局第一拍（D-084）：只有画面。对话框、选项收起，点一下才出正文。
    // 排版归 CC3：这一拍 #app 上是 data-ending="picture"，第二拍是 "text"，按这两个值写样式
    endingPicture: () => new Promise<void>((resolve) => {
      choices.hide();
      dlg.setVisible(false);
      app.dataset.ending = "picture";
      const at = performance.now();
      releaseEndingPicture = () => {
        // 画面至少停这么久才认点击：读最后一句的人手还在连点，第一拍会被直接点掉
        if (performance.now() - at < ENDING_PICTURE_HOLD_MS) return;
        releaseEndingPicture = null;
        resolve();
      };
    }),
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
slots.addToggle("登场卡", debutsOn, setDebutsOn);
// 信箱要挂在 HUD 上，HUD 在后面才建；先声明，建好 HUD 再接
let inbox: Inbox | null = null;

store.subscribe((s) => status.update(s));

// 环境声（D-053）。默认静音；真正出声要等玩家在手势里打开（iOS 的规矩）
const ambient = new Ambient();
const cueState = newCueState();
const play = (cues: Cue[]): void => {
  for (const c of cues) {
    if (c.kind === "drum") ambient.drum(c.beats);
    else ambient.rain(c.on);
  }
};

story.on((e) => {
  switch (e.kind) {
    case "scene":
      // 从结局那一屏读档回来：两拍留下的东西收干净
      releaseEndingPicture = null;
      delete app.dataset.ending;
      app.querySelectorAll(".ending-title").forEach((n) => n.remove());
      play(cuesForScene(e.scene, cueState, performance.now()));
      // 阵容必须同步定下来：紧跟着的 line 事件会马上问「说话的人在不在台上」。
      // B11 写成了先 await refresh() 再 setCast，结果每一场第一个开口的人如果不在前两位，
      // 查到的是一张空名单，不换上台——阿荻在第一章 03 场说话，台上站的却是主角和宋蕙贞。
      // 换图（上一场出口写的 flag，比如归还戏）放到阵容定下之后再对一遍，照样第一眼生效。
      // D-076：序幕这种场，台上先空着，人等那一句再进来（engine/entrances.ts）
      cast.setDressing(e.scene.dressing ?? "");      // 李令仪的礼衣看布置（D-108 第 3 条），要在摆人之前
      void cast.setCast(e.castHeld ? [] : e.scene.cast).then(() => cast.refresh());
      break;
    case "castEnter":
      void cast.setCast(e.cast).then(() => cast.refresh());
      break;
    case "flare":
      cast.flare(e.who);
      break;
    case "letters":
      inbox?.setUnread(e.unread, story.letters.onDesk().length + e.unread);
      break;
    case "line":
      play(cuesForLine(e.who, e.lineKind, e.text, cueState, performance.now()));
      choices.hide();
      dlg.setVisible(true);
      cast.setFraming(framingFor("line"));             // 念台词：膝上（D-108 第 2 条）
      void cast.speak(e.who, e.expr as "default" | "guarded" | "open");
      // 读过的句子直接显示完整，没读过的逐字来。skip 只跳读过的文本。
      dlg.show(e.who, e.text, e.lineKind, store.state, !e.first);
      // 登场卡（D-048）：这个人第一次开口时，名字旁一行职务加一句话，只介绍一次。
      // 皮肤和「只活一句台词」的节奏是 CC3 定的（src/scene/Debut.ts）；
      // 谁出过了、要不要出，归这里。玩家在存档面板里关掉，就再也不出。
      {
        const card = (introData.cards as Record<string, { role: string }>)[e.who];
        const fresh = !!card && !store.state.introsSeen.has(e.who);
        if (fresh) store.state.introsSeen.add(e.who);
        attachDebut(dlg.element, fresh && debutsOn() ? card! : null);
      }
      break;
    case "choices":
      cast.setFraming(framingFor("choices"));          // 要做决定：镜头退开，全身（D-108 第 2 条）
      dlg.setVisible(false);
      choices.show(e.items);
      break;
    case "ending": {
      app.dataset.ending = "text";
      choices.hide();
      dlg.setVisible(true);
      dlg.show("narr", e.body, "aside", store.state, true);
      app.querySelectorAll(".ending-title").forEach((n) => n.remove());
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
  if (releaseEndingPicture) { releaseEndingPicture(); return; }
  if (dlg.complete()) return;
  story.advance();
});
window.addEventListener("keydown", (e) => {
  if (e.key !== " " && e.key !== "Enter" && e.key !== "ArrowRight") return;
  e.preventDefault();
  if (releaseEndingPicture) { releaseEndingPicture(); return; }
  if (dlg.complete()) return;
  story.advance();
});
window.addEventListener("resize", () => renderer.resize(window.innerWidth, window.innerHeight));

/**
 * 3D 跑起来之后看帧数，扛不住就当场换 CSS 版（D-069）。一次性的：退了不回来，看够了就不看。
 * 只在 auto 下看。`?renderer=three` 是「我就要 3D」，不自动退——验收真机帧数时要看的正是它慢的样子。
 */
if ((renderer as { name?: string }).name === "three-stage" && RENDERER_MODE === "auto") {
  const judge = new FrameJudge();
  let last = performance.now();
  let raf = 0;
  const tick = (now: number): void => {
    const v = judge.push(now - last);
    last = now;
    if (v === "ok") { console.info("[renderer] 3D 帧数稳定，不再监看"); return; }
    if (v === "slow") { fallBackToCss("帧数过低"); return; }
    raf = requestAnimationFrame(tick);
  };
  const fallBackToCss = (why: string): Promise<void> => {
    console.warn(`[renderer] 3D 退回 CSS 版：${why}`);
    cancelAnimationFrame(raf);
    rememberFallback(why);
    const next = new CssParallaxRenderer(raster);
    // 新的一层先铺上、再拆旧的：换的那一下画面不空
    const holder = document.createElement("div");
    stageRoot.after(holder);
    next.mount(holder);
    return story.replaceRenderer(next).then(() => { stageRoot.replaceWith(holder); renderer = next; });
  };
  // ?dev=1 留一个把手：手机帧数模拟不出来的时候，直接验「换的那一下不打断当前场景」
  if (new URLSearchParams(location.search).has("dev")) {
    (window as unknown as { __fallBackToCss?: () => Promise<void> }).__fallBackToCss = () => fallBackToCss("手动触发（dev）");
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(raf); return; }
    judge.reset();
    last = performance.now();
    if (!judge.verdict) raf = requestAnimationFrame(tick);
  });
  raf = requestAnimationFrame(tick);
}

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
// 声音开关。点它本身就是一次手势，所以 ?notitle 跳过标题的场合也能在这里解锁
const soundBtn = document.createElement("button");
soundBtn.type = "button";
const paintSound = (): void => {
  soundBtn.textContent = ambient.enabled ? "声：开" : "声：关";
  soundBtn.setAttribute("aria-pressed", String(ambient.enabled));
};
soundBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  ambient.unlock();
  const on = !ambient.enabled;
  ambient.setEnabled(on);
  setSoundOn(on);
  // 刚打开的时候，如果这一场该有雨，现在补上
  if (on) play(cuesForScene({ id: story.sceneId, act: story.currentScene?.act ?? 1, dressing: story.currentScene?.dressing }, { lastAct: story.currentScene?.act ?? null, lastDrumAt: 0 }, 0));
  paintSound();
});
paintSound();
hud.append(soundBtn);
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
  // 「入宫」这一下是手机上唯一合法的解锁音频的时机（D-053）。解锁不等于出声：
  // 上次开着声音的人这里才真的开，第一次来的人仍是静的
  ambient.unlock();
  if (soundOn()) { ambient.setEnabled(true); paintSound(); }
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
