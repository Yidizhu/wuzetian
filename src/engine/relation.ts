import type { Scene } from "./types.ts";
import type { GameState } from "./state.ts";

/**
 * 关系到哪儿了（D-154，B26）：让玩家看得见自己在跟谁变熟、走了多远，**但不给数字**。
 *
 * **为什么不按好感数显示**：原来章末结算页写的是 `affinityBand(好感)`——识／契／盟，
 * 而这三档的下限正好就是专属闲场的门槛 4／8／14（D-065、D-078）。玩家看见「识」变成「契」，
 * 就知道自己刚跨过一道门，门后面有一场戏在等——那就是在倒推门槛，玩家会开始刷分。
 *
 * **改成按发生过的事显示**：这个人的专属闲场，你真的走进去过哪一档，关系词就是哪一档。
 * 词只在那场戏演过之后才变，而那场戏本身玩家已经看见了——显示的是「关系到哪儿了」，不是「还差多少」。
 *
 * 专属闲场不写死场次：凡是场景的进入条件里有 `affinity.<人> ≥ x` 的，就是这个人的一档。
 * 剧本加一场、换一场，这里跟着变（D-098）。
 */

/** 四个词，从浅到深。**措辞归剧本**，改这一处就行；别用「好感度」这类数值词 */
export const RELATION_WORDS = ["有来往", "常来常往", "相知", "心照"] as const;

export interface RelationTiers {
  /** 角色 key → 这个人的专属闲场，按门槛从低到高：[[门槛, [场景 id…]]…] */
  byWho: Map<string, [number, string[]][]>;
  /** 场景 id → 这一场任意一句台词的 id（看过没有，查它） */
  firstLine: Map<string, string>;
}

export function relationTiers(scenes: Scene[]): RelationTiers {
  const acc = new Map<string, Map<number, string[]>>();
  const firstLine = new Map<string, string>();
  for (const s of scenes) {
    for (const [k, v] of Object.entries(s.require ?? {})) {
      if (!k.startsWith("affinity.")) continue;
      const gte = (v as { gte?: number }).gte;
      if (gte === undefined) continue;
      const who = k.slice("affinity.".length);
      const m = acc.get(who) ?? new Map<number, string[]>();
      m.set(gte, [...(m.get(gte) ?? []), s.id]);
      acc.set(who, m);
      if (s.lines[0]) firstLine.set(s.id, s.lines[0].id);
    }
  }
  const byWho = new Map<string, [number, string[]][]>();
  for (const [who, m] of acc) byWho.set(who, [...m].sort((a, b) => a[0] - b[0]));
  return { byWho, firstLine };
}

/**
 * 这个人和主角的关系词，没来往过是 null。
 * - 好感还是 0、也没进过她的专属闲场：null（不显示，名单里不出现没来往的人）
 * - 有过来往：「有来往」
 * - 走进过她第 n 档专属闲场：第 n+1 个词
 * 只看「有没有来往」这一件事用了好感数（大于 0），它不对应任何门槛
 */
export function relationWord(who: string, state: GameState, tiers: RelationTiers): string | null {
  let stage = (state.affinity[who] ?? 0) > 0 ? 0 : -1;
  const levels = tiers.byWho.get(who) ?? [];
  levels.forEach(([, ids], i) => {
    const entered = ids.some((id) => {
      const line = tiers.firstLine.get(id);
      return !!line && state.seenLineIds.has(line);
    });
    if (entered) stage = Math.max(stage, i + 1);
  });
  if (stage < 0) return null;
  return RELATION_WORDS[Math.min(stage, RELATION_WORDS.length - 1)]!;
}

/**
 * 这一章和谁走得最近：这一章好感涨得最多的那个人。只比这一章的涨幅，不露总数。
 * 没人涨、或者并列第一：null——并列时说谁都是替玩家做选择
 */
export function closestThisChapter(before: Record<string, number>, after: Record<string, number>): string | null {
  const gains = Object.entries(after).map(([who, v]) => [who, v - (before[who] ?? 0)] as const).filter(([, d]) => d > 0);
  if (!gains.length) return null;
  gains.sort((a, b) => b[1] - a[1]);
  if (gains[1] && gains[1][1] === gains[0]![1]) return null;
  return gains[0]![0];
}
