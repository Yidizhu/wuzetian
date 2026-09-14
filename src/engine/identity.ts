import { spriteKey, SPRITE_RULES } from "../char/sprite-rules.ts";

/**
 * 主角的身份与袍色（D-091、D-105）：**跟 flag（实际身份）走，不跟章节、不跟数值。**
 *
 * 只有两档：青（才人）与绯（受位之后）。D-105 取消了绿——剧本里她的身份只变一次，
 * 为了美术多一档而硬造一次升迁，是让美术反过来改故事。**她要么还是才人，要么已经是天子。**
 *
 * 表从高到低排，第一条成立的就是她现在的身份。一条都不成立是青——默认值是不泄露的那一个。
 */
export type Rank = "qing" | "fei";

export interface RankRule {
  rank: Rank;
  /** 这些 flag 全部为真时是这个身份 */
  flags: string[];
  why: string;
}

export const IDENTITY_RANKS: readonly RankRule[] = [
  { rank: "fei", flags: ["enthroned"], why: "三章 12 场受位礼成：制授承位，她答了受（D-105 确认）" },
];

export function protagonistRank(has: (flag: string) => boolean): Rank {
  for (const r of IDENTITY_RANKS) {
    if (r.flags.length && r.flags.every(has)) return r.rank;
  }
  return "qing";
}

/** 身份的高低，给「只升不降」那条烟测断言用 */
export const RANK_ORDER: Record<Rank, number> = { qing: 0, fei: 1 };

/**
 * 正式场合的布置（D-108 第 3 条）：李令仪在这些场次穿紫礼衣（D-092），其余郁金。
 * 不加场次表，用剧本本来就有的布置判定。「公议」「受位」是殿上的正式议事；别的布置都是日常。
 */
export const FORMAL_DRESSINGS: ReadonlySet<string> = new Set(["gongyi", "shouwei"]);

/** 选图要知道的两件事：flag（身份、归还之类），和这一场的布置（礼衣） */
export interface SpriteContext {
  has(flag: string): boolean;
  dressing: string;
}

/**
 * 这个人此刻穿哪一套的后缀，没有就是底那一套。顺序即优先级，第一条成立的就是。
 * 文件名规矩 `<who>_<expr>_<后缀>` 与 `src/char/portraits.ts` 一致。
 */
function outfitSuffixes(who: string, ctx: SpriteContext): string[] {
  const out: string[] = [];
  for (const r of SPRITE_RULES) if (r.who === who && ctx.has(r.flag)) out.push(r.suffix);  // 柳承欢 _bare（D-046）
  if (who === "wuze" && protagonistRank(ctx.has) === "fei") out.push("fei");               // D-091、D-105
  if (who === "liqinghe" && FORMAL_DRESSINGS.has(ctx.dressing)) out.push("zi");            // D-092、D-108
  return out;
}

/**
 * SVG 这一格按顺序该试哪几张图，第一张存在的就用：换图规则 → 身份与礼衣变体 → 原图。
 * 图没到位就往下退，不白屏。
 */
export function spriteCandidates(who: string, expr: string, ctx: SpriteContext): string[] {
  const out: string[] = [];
  const ruled = spriteKey(who, expr, ctx.has);
  if (ruled !== `${who}_${expr}`) out.push(ruled);
  for (const s of outfitSuffixes(who, ctx)) {
    const k = `${who}_${expr}_${s}`;
    if (!out.includes(k)) out.push(k);
  }
  out.push(`${who}_${expr}`);
  return out;
}

/**
 * 光栅立绘的候选（D-095）。**每套只有一个中性表情**，所以不带表情：`<who>_default[_<后缀>]`。
 *
 * 最后一个候选永远是这个人的底那一套 `<who>_default`。一个人只要有了光栅图，
 * 三种表情都用它，变体没到位也用底那一套——**不回到 SVG**：同一场里厚涂和剪影来回跳，比表情不变更糟。
 */
export function rasterCandidates(who: string, ctx: SpriteContext): string[] {
  const out = outfitSuffixes(who, ctx).map((s) => `${who}_default_${s}`);
  out.push(`${who}_default`);
  return out;
}
