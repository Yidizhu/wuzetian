import type { Cmp, Condition, OneOf, StatKey } from "./types.ts";
import { STAT_KEYS, STAT_LABEL } from "./types.ts";
import type { GameState } from "./state.ts";
import { looksLikeRelationKey, readRelation, relationKey } from "./pact.ts";

/** 读一个条件键当前的数值。flag 键返回 0/1。 */
function read(key: string, s: GameState): number {
  if (key.startsWith("flag.")) return s.flags[key.slice(5)] ? 1 : 0;
  if (key.startsWith("affinity.")) return s.affinity[key.slice(9)] ?? 0;
  if ((STAT_KEYS as string[]).includes(key)) return s.stats[key as StatKey];
  console.warn(`[conditions] 认不出的条件键：${key}`);
  return 0;
}

function cmpOk(v: number, c: Cmp): boolean {
  if (c.gte !== undefined && !(v >= c.gte)) return false;
  if (c.lte !== undefined && !(v <= c.lte)) return false;
  if (c.gt  !== undefined && !(v >  c.gt))  return false;
  if (c.lt  !== undefined && !(v <  c.lt))  return false;
  if (c.eq  !== undefined && !(v === c.eq)) return false;
  return true;
}

const isOneOf = (w: Condition[string]): w is OneOf => typeof w === "object" && w !== null && ("in" in w || "not" in w);

/** 一个键满不满足。关系键（pact.ts）的值是字符串、布尔或数，分开比 */
function test(key: string, want: Condition[string], s: GameState): boolean {
  if (relationKey(key)) {
    const v = readRelation(key, s);
    if (typeof want === "boolean") return (v === true) === want;
    if (typeof want === "string") return v === want;
    if (isOneOf(want)) return (!want.in || want.in.includes(String(v))) && (!want.not || !want.not.includes(String(v)));
    return typeof v === "number" && cmpOk(v, want);
  }
  if (looksLikeRelationKey(key)) console.warn(`[conditions] 关系键写错了：${key}`);
  if (typeof want === "string" || isOneOf(want)) {
    console.warn(`[conditions] ${key} 不是关系键，不能按字符串比`);
    return false;
  }
  const v = read(key, s);
  return typeof want === "boolean" ? (v > 0) === want : cmpOk(v, want);
}

export function meets(cond: Condition | undefined, s: GameState): boolean {
  if (!cond) return true;
  for (const [key, want] of Object.entries(cond)) if (!test(key, want, s)) return false;
  return true;
}

/** 条件里有没有关系键。有关系键而不满足的选项不显示（story.ts viewChoices） */
export function hasRelationKey(cond: Condition | undefined): boolean {
  return !!cond && Object.keys(cond).some((k) => relationKey(k));
}

/**
 * 条件不满足时给玩家看的原因。
 * 不给理由的灰选项是在惩罚玩家，不是在设计——见 story-schema 1.4。
 * 剧本可以用 lockHint 覆盖这里自动生成的文案。
 */
export function missingReason(cond: Condition | undefined, s: GameState): string | null {
  if (!cond) return null;
  for (const [key, want] of Object.entries(cond)) {
    if (test(key, want, s)) continue;
    if (relationKey(key)) return "尚不能够";
    if (key.startsWith("flag.")) return "时机未到";
    if (key.startsWith("affinity.")) return "交情未到";
    if ((STAT_KEYS as string[]).includes(key)) {
      return `${STAT_LABEL[key as StatKey]} 不足`;
    }
    return "尚不能够";
  }
  return null;
}
