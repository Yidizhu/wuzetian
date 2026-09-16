/**
 * 什么时候响什么（D-053 第 1 层）。纯函数，不碰 Web Audio——所以测得了。
 *
 * 声音在这个游戏里是留白的一部分，不是配乐。所以规则很少，而且每一条都要有来由：
 *
 * - **街鼓**：长安城靠鼓声开坊、闭坊，一天的起止是听出来的。
 *   换幕的时候敲一通——幕是这个故事里时间走了一大截的地方。
 *   旁白里写到「鼓」也敲，剧本说有鼓，玩家就该听见。
 * - **雨**：只跟着场景布置 `yeyu` 走（第三章 10 场夜谈三，女冠观夜雨）。
 *   不跟着台词里的「雨」字——「雨停了」「雨后」里也有这个字，一听就错。
 */

export interface SceneCue {
  id: string;
  act: number;
  dressing?: string;
}

export interface CueState {
  lastAct: number | null;
  lastDrumAt: number;
}

export type Cue =
  | { kind: "drum"; beats: number }
  | { kind: "rain"; on: boolean };

/** 两通鼓之间至少隔这么久。旁白连着三句写鼓，不该敲成三通 */
export const DRUM_GAP_MS = 6000;

export function newCueState(): CueState {
  return { lastAct: null, lastDrumAt: -Infinity };
}

export function cuesForScene(s: SceneCue, st: CueState, now: number): Cue[] {
  const out: Cue[] = [{ kind: "rain", on: s.dressing === "yeyu" }];
  if (st.lastAct !== s.act) {
    // 开局第一场也敲：入宫那天听见的第一声就是坊门的鼓
    if (now - st.lastDrumAt >= DRUM_GAP_MS) {
      out.push({ kind: "drum", beats: 5 });
      st.lastDrumAt = now;
    }
    st.lastAct = s.act;
  }
  return out;
}

export function cuesForLine(who: string, kind: string, text: string, st: CueState, now: number): Cue[] {
  if (who !== "narr" || kind !== "aside") return [];
  if (!text.includes("鼓")) return [];
  if (now - st.lastDrumAt < DRUM_GAP_MS) return [];
  st.lastDrumAt = now;
  return [{ kind: "drum", beats: 3 }];
}

// ------------------------------------------------------------ 声音桥（D-198，B36）

/**
 * 声音桥：真音效文件（YIDI 下的素材，转成 `public/sfx/<名>.m4a`），不合成。**规则只四条**：
 * ① 换场时下一场的环境声（按 `dressing`）在淡出开始就起——scene 事件本来就在淡出开始那一刻发；
 * ② 空镜格起风，人物回来收；
 * ③ 事件图、信打开那一格，一声纸响；
 * ④ 章首题记收起、转第一场对白时，远处一通鼓，一章只一次。
 *
 * `horse_bell`、`cloth_rustle`、`steps_hall`、`bell_far` 先只登记文件名，落点等 CC3 分镜条。
 * 上面 D-053 那层合成的留着：**真文件在就用文件，不在才退回合成，合成也没有就静音**（`sourceFor`）。
 */
export const SFX_NAMES = [
  "rain_loop", "wind_loop", "paper_unfold", "drum_far",
  "bell_far", "horse_bell", "cloth_rustle", "steps_hall",
] as const;
export type SfxName = (typeof SFX_NAMES)[number];
export type LoopName = "rain_loop" | "wind_loop";

export type SoundCue =
  | { kind: "loop"; name: LoopName; on: boolean }
  | { kind: "hit"; name: SfxName };

/** 哪种布置底下铺哪条环境声。现在只有夜雨 */
export const DRESSING_AMBIENCE: Readonly<Record<string, LoopName>> = { yeyu: "rain_loop" };

/** 规则 ①：进一场。按布置起／收环境声；换场也把空镜的风收掉（空镜只在一场里面） */
export function ambienceForScene(dressing: string | undefined): SoundCue[] {
  const want = dressing ? DRESSING_AMBIENCE[dressing] : undefined;
  return [
    { kind: "loop", name: "rain_loop", on: want === "rain_loop" },
    { kind: "loop", name: "wind_loop", on: false },
  ];
}

/**
 * 规则 ②：空镜那一格起风，下一格有人说话就收。
 * 按格算，不按「人下台」事件算：序幕那格空镜时人还没上过台，引擎不发下台事件，可那一格照样是空镜、照样该有风
 */
export function cuesForShot(who: string): SoundCue[] {
  return [{ kind: "loop", name: "wind_loop", on: who === "empty" }];
}

/** 规则 ③：事件图铺开、信拆开 */
export function cuesForPaper(): SoundCue[] {
  return [{ kind: "hit", name: "paper_unfold" }];
}

export interface EpigraphCueState { drummedChapter: number | null }
export function newEpigraphCueState(): EpigraphCueState { return { drummedChapter: null } }

/** 规则 ④：章首题记收起、转第一场对白，一通鼓。同一章不重复（读档回到题记前再看一遍，不再敲） */
export function cuesAfterEpigraph(chapter: number, st: EpigraphCueState): SoundCue[] {
  if (st.drummedChapter === chapter) return [];
  st.drummedChapter = chapter;
  return [{ kind: "hit", name: "drum_far" }];
}

/** 合成那层能顶上的：没有真文件时退回它。其余没有就静音 */
const SYNTH_FALLBACK: ReadonlySet<SfxName> = new Set(["rain_loop", "wind_loop", "paper_unfold", "drum_far"]);

/** 这一声从哪来：真文件 → 合成 → 静音。文件没到不报错 */
export function sourceFor(name: SfxName, available: ReadonlySet<string>): "file" | "synth" | "silent" {
  if (available.has(name)) return "file";
  return SYNTH_FALLBACK.has(name) ? "synth" : "silent";
}
