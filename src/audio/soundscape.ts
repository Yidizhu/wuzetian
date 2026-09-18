import type { LoopName } from "./cues.ts";

/**
 * 场次音景（D-226，B45）。**声和布置分开**：布置管画面（书阁还是书阁），这张表管这一场听见什么。
 *
 * 原来只有布置 `yeyu`（女冠观夜雨）会起雨，ch03-17 书阁听夜雨一滴都没有——总不能为了雨声把书阁布置成女冠观。
 * 也**不按台词里有没有「雨」字自动响**：「雨后」「檐水」「雨声薄下去」都有雨字，响的却不是同一种声。
 * 所以一场一场写死：从第几格起、多大声、配乐让多少。没写的场照旧只看布置（夜雨）。
 *
 * - `loop`：铺哪条循环；`null` 是「这一场该有声但没有素材」，**不拿别的声冒充**，`gap` 写缺什么。
 * - `fromLine`：从第几格起（格号，和 `<场>.l<n>` 的 n 一致）。不写是进场就起（和布置夜雨一样，淡出开始那一刻）。
 * - `level`：这条循环的音量倍数（1 是原档）。细雨小一点。
 * - `bgmDuck`：配乐乘多少。听雨的场让配乐退后，雨听得清；台词是字，不受影响。
 */
export interface Soundscape {
  loop: LoopName | null;
  fromLine?: number;
  level?: number;
  bgmDuck?: number;
  gap?: string;
  why: string;
}

export const SCENE_SOUNDSCAPES: Readonly<Record<string, Soundscape>> = {
  ch01_s11_shishe:   { loop: "rain_loop", fromLine: 2, level: 1, bgmDuck: 0.7,
    why: "诗社抢湿纸。第 2 格「雨忽然砸在檐口」起；第 73 格雨声薄下去，仍在下，不收" },
  ch01_s12_shuge:    { loop: null, gap: "檐滴（雨停后一滴一滴）", why: "第 16 格「檐水一滴一滴敲着石阶」是雨后，不是在下雨：不能铺整场雨" },
  ch01_s17_yeting:   { loop: "rain_loop", fromLine: 2, level: 0.55, bgmDuck: 0.8,
    why: "掖庭关窗避雨。第 2 格「天又落起细雨」起；细雨、半扇窗关着，比诗社那场小" },
  ch01_s18_zhaoyang: { loop: null, gap: "檐滴（雨停后一滴一滴）", why: "第 27 格「檐口还在滴雨」是雨后余滴，不是在下雨" },
  ch03_s17_shuge:    { loop: "rain_loop", level: 1, bgmDuck: 0.5,
    why: "书阁陪沈衡听夜雨，整场都在雨里。听雨是这一场的事，配乐退到一半" },
};

/** 布置带出来的音景（原来的规则 ①）。`yeyu` 是女冠观夜雨（三章 10），留作回归对照 */
export const DRESSING_SOUNDSCAPES: Readonly<Record<string, Soundscape>> = {
  yeyu: { loop: "rain_loop", level: 1, why: "女冠观夜雨（三章 10）" },
};

/** 这一场这一格该听见什么。`line` 是格号，进场那一刻（还没到第一格）给 0 */
export interface AmbienceState { rain: boolean; level: number; bgmDuck: number }

export function ambienceAt(sceneId: string | undefined, dressing: string | undefined, line: number): AmbienceState {
  const s = (sceneId ? SCENE_SOUNDSCAPES[sceneId] : undefined) ?? (dressing ? DRESSING_SOUNDSCAPES[dressing] : undefined);
  if (!s || s.loop !== "rain_loop" || line < (s.fromLine ?? 0)) return { rain: false, level: 1, bgmDuck: 1 };
  return { rain: true, level: s.level ?? 1, bgmDuck: s.bgmDuck ?? 1 };
}

/** 格 id（`ch01_s11_shishe.l2`）里的格号；认不出是 0 */
export function lineNo(id: string | undefined): number {
  const m = id ? /\.l(\d+)$/.exec(id) : null;
  return m ? Number(m[1]) : 0;
}
