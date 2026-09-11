import type { GameState } from "./state.ts";
import { STAT_MAX } from "./types.ts";

/**
 * 水墨侵入朝廷的覆盖面积（D-010 第 3 条）。
 *
 * 「水墨侵入朝廷的进度 = 她的权力进度」。CC3 把这一层做成了金碧场景上可调的墨层
 * （`SceneRenderer.setInk`），默认值按幕数推。这里把真的进度喂进去。
 *
 * 幕数是地板，势是幕内的涨幅：
 *
 * | 幕 | 势 0 | 势 20 | D-010 的原话 |
 * |---|---|---|---|
 * | 一 | 0.00 | 0.12 | 朝廷场景全金碧 |
 * | 二 | 0.22 | 0.45 | 出现一个水墨元素 |
 * | 三 | 0.78 | 0.95 | 以水墨为主，金碧只剩残余 |
 * | 登基 | 1.00 | 1.00 | 金碧被墨晕整片盖掉 |
 *
 * 为什么要地板而不是纯按势算：这一层是叙事进度，不是数值条。
 * 一个势很低的玩家走到第三幕，朝廷也已经不是原来那个朝廷了——
 * 她坐在那里本身就是变化。势决定的是这一幕之内墨走得多远，
 * 上限永远够不到下一幕的地板，所以看画面就知道走到第几幕了。
 *
 * 水墨场景上这一层不显形（墨侵入墨没有意义），那个判断在 renderer 里。
 */

const BANDS: Record<number, [number, number]> = {
  1: [0, 0.12],
  2: [0.22, 0.45],
  3: [0.78, 0.95],
};

export function inkLevel(state: GameState, act: number): number {
  if (state.flags.enthroned) return 1;
  const [lo, hi] = BANDS[act] ?? BANDS[3]!;
  const t = Math.max(0, Math.min(1, (state.stats.shi ?? 0) / STAT_MAX));
  return lo + (hi - lo) * t;
}
