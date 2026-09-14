import { spriteKey } from "../char/sprite-rules.ts";

/**
 * 主角的身份与袍色（D-091）：**跟 flag（实际官身）走，不跟章节、不跟数值。**
 *
 * 青（才人）→ 绿 → 绯。只有剧本里真的升上去了才换；落选线她一直是青，一直到结局。
 * 随章节升等于提前告诉玩家「你一定会升上去」，而八个结局里五个不是登基。
 *
 * 表从高到低排，第一条成立的就是她现在的身份。一条都不成立是青——默认值是不泄露的那一个。
 *
 * **现在的映射是 CC1 按剧本事实填的，等 Cowork 确认**（docs/engine-cc1-b16.md 第三节）：
 * 剧本里主角的身份只变一次——第三章 12 场受位礼成（flag.enthroned）。第一到四章没有一处升到绿，
 * 所以「绿」这一行现在空着：CC3 不必先出绿袍那一套，出了引擎也不会选到。
 */
export type Rank = "qing" | "lv" | "fei";

export interface RankRule {
  rank: Rank;
  /** 这些 flag 全部为真时是这个身份。空数组 = 剧本里还没有这一步 */
  flags: string[];
  why: string;
}

export const IDENTITY_RANKS: readonly RankRule[] = [
  { rank: "fei", flags: ["enthroned"], why: "三章 12 场受位礼成：制授承位，她答了受。待 Cowork 确认受位对应绯" },
  { rank: "lv", flags: [], why: "剧本里还没有升到绿的那一步。有了之后在这里写 flag" },
];

export function protagonistRank(has: (flag: string) => boolean): Rank {
  for (const r of IDENTITY_RANKS) {
    if (r.flags.length && r.flags.every(has)) return r.rank;
  }
  return "qing";
}

/** 身份的高低，给「只升不降」那条烟测断言用 */
export const RANK_ORDER: Record<Rank, number> = { qing: 0, lv: 1, fei: 2 };

/**
 * 这一格按顺序该试哪几张图，第一张存在的就用。
 *
 * 1. 换图规则（柳承欢归还之后的 `_bare`，D-046）
 * 2. 主角的身份变体 `wuze_<expr>_<rank>`（D-091）
 * 3. 原图 `<who>_<expr>`
 *
 * 图没到位就往下退，不白屏：CC3 的三套袍色一套一套交，交到哪套换哪套，没交的继续用原图。
 * 这也是 PNG 换进来时「新的到一张换一张」的那条路（docs/engine-cc1-b16.md 第六节）。
 */
export function spriteCandidates(who: string, expr: string, has: (flag: string) => boolean): string[] {
  const out: string[] = [];
  const ruled = spriteKey(who, expr, has);
  if (ruled !== `${who}_${expr}`) out.push(ruled);
  if (who === "wuze") out.push(`wuze_${expr}_${protagonistRank(has)}`);
  out.push(`${who}_${expr}`);
  return out;
}
