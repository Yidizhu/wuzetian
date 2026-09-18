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
  /** `level`：这条循环的音量倍数（D-226 音景表，细雨小一点）。不写是 1 */
  | { kind: "loop"; name: LoopName; on: boolean; level?: number }
  | { kind: "hit"; name: SfxName };

/**
 * 规则 ①：进一场。按这一场的音景起／收雨（`soundscape.ts`：场次表优先，其次布置夜雨）；换场也把空镜的风收掉（空镜只在一场里面）。
 * D-226（B45）起雨不再只认布置：书阁听夜雨、诗社抢湿纸这些场，布置不是夜雨，照样有雨
 */
export function ambienceForScene(a: { rain: boolean; level: number }): SoundCue[] {
  return [
    rainCue(a),
    { kind: "loop", name: "wind_loop", on: false },
  ];
}

/** 这一格的雨（场次表可以从第几格起）。每一格都算一遍，读档读到哪一格都对 */
export function rainCue(a: { rain: boolean; level: number }): SoundCue {
  return a.rain ? { kind: "loop", name: "rain_loop", on: true, level: a.level } : { kind: "loop", name: "rain_loop", on: false };
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

/**
 * 规则 ④：章首题记收起、转第一场对白，远处一声。同一章不重复（读档回到题记前再看一遍，不再响）。
 * D-209（B40）：鼓听着「跳」，默认换成一声远钟；`hit` 给 `drum_far` 就是 B36 原样。切换在 `tuning.ts`
 */
export function cuesAfterEpigraph(chapter: number, st: EpigraphCueState, hit: "drum_far" | "bell_far" = "bell_far"): SoundCue[] {
  if (st.drummedChapter === chapter) return [];
  st.drummedChapter = chapter;
  return [{ kind: "hit", name: hit }];
}

// ------------------------------------------------------------ 四条之外的落点（D-202，B37）

/** 事件图那一行里声音要看的两样（`cgs.ts` 的 Cg 的子集；cues.ts 不引数据表，保持纯函数） */
export interface CgSound { beat: string; sfx?: SfxName }

/**
 * 规则 ③ 的细化：剧本里一格事件图铺开时响什么。
 * 表里写了 `sfx` 用它（衣料、马铃），没写是纸响；风物图不响——它们不是纸，也不是动作。表里没有这张图也不响（那一格会跳过）
 */
export function cuesForCg(cg: CgSound | undefined): SoundCue[] {
  if (!cg || cg.beat === "风物") return [];
  return [{ kind: "hit", name: cg.sfx ?? "paper_unfold" }];
}

/** 结局图（结局卡第一拍）：只响表里写明的（关山有信的马铃）；没写不响，结局卡不是「翻开一张纸」 */
export function cuesForEndingCg(cg: CgSound | undefined): SoundCue[] {
  return cg?.sfx ? [{ kind: "hit", name: cg.sfx }] : [];
}

export interface EnterCueState { lastScene: string | null }
export function newEnterCueState(): EnterCueState { return { lastScene: null } }

/** 进布置为「受位」的场：空殿里几步脚步，一次（同一场的场景事件再来一次不重复，比如读档读回这一场） */
export function cuesForEnter(scene: { id: string; dressing?: string }, st: EnterCueState): SoundCue[] {
  if (st.lastScene === scene.id) return [];
  st.lastScene = scene.id;
  return scene.dressing === "shouwei" ? [{ kind: "hit", name: "steps_hall" }] : [];
}

/** 规则 ⑤（D-202）：结局卡淡到无声之前，远寺一声钟 */
export function cuesForEnding(): SoundCue[] {
  return [{ kind: "hit", name: "bell_far" }];
}

/** 合成那层能顶上的：没有真文件时退回它。其余没有就静音 */
const SYNTH_FALLBACK: ReadonlySet<SfxName> = new Set(["rain_loop", "wind_loop", "paper_unfold", "drum_far"]);

/** 这一声从哪来：真文件 → 合成 → 静音。文件没到不报错 */
export function sourceFor(name: SfxName, available: ReadonlySet<string>): "file" | "synth" | "silent" {
  if (available.has(name)) return "file";
  return SYNTH_FALLBACK.has(name) ? "synth" : "silent";
}
