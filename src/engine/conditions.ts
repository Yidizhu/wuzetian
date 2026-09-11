import type { Cmp, Condition, StatKey } from "./types.ts";
import { STAT_KEYS, STAT_LABEL } from "./types.ts";
import type { GameState } from "./state.ts";

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

export function meets(cond: Condition | undefined, s: GameState): boolean {
  if (!cond) return true;
  for (const [key, want] of Object.entries(cond)) {
    const v = read(key, s);
    if (typeof want === "boolean") {
      if ((v > 0) !== want) return false;
    } else if (!cmpOk(v, want)) return false;
  }
  return true;
}

/**
 * 条件不满足时给玩家看的原因。
 * 不给理由的灰选项是在惩罚玩家，不是在设计——见 story-schema 1.4。
 * 剧本可以用 lockHint 覆盖这里自动生成的文案。
 */
export function missingReason(cond: Condition | undefined, s: GameState): string | null {
  if (!cond) return null;
  for (const [key, want] of Object.entries(cond)) {
    const v = read(key, s);
    const ok = typeof want === "boolean" ? (v > 0) === want : cmpOk(v, want);
    if (ok) continue;
    if (key.startsWith("flag.")) return "时机未到";
    if (key.startsWith("affinity.")) return "交情未到";
    if ((STAT_KEYS as string[]).includes(key)) {
      return `${STAT_LABEL[key as StatKey]} 不足`;
    }
    return "尚不能够";
  }
  return null;
}
