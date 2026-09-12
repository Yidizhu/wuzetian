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
