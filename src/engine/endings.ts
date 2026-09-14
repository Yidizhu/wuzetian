import { meets } from "./conditions.ts";
import type { GameState } from "./state.ts";
import { NAME_FLAGS, type Ending } from "./types.ts";

/**
 * 结局判定。抽成纯函数，因为它是整个游戏最不能出错的一段逻辑：
 * 玩家走了三章，最后看到的那一页必须和她的经历对得上。
 * 纯函数才测得动，也才能被校验器复用。
 */

/**
 * 按结局表从上往下取第一个满足的。顺序本身是设计的一部分（C-B 第一节）：
 * 前三条先处理所有登基状态，之后才轮到落选者、办学者、拒位者、行路者，
 * 最后是其他人生。最后一条判定留空，永远兜得住。
 */
export function pickEnding(endings: Ending[], s: GameState): Ending | null {
  for (const e of endings) {
    if (meets(e.require, s)) return e;
  }
  return null;
}

/**
 * 玩家选的那个字决定读到哪一段正文（R-003 第 2 条）。
 * 三个字之间没有优劣，只有不同的自我命名方式，所以这里是切文本，不是判分。
 */
export function resolveBody(e: Ending, s: GameState): string {
  if (typeof e.body === "string") return e.body;
  for (const n of NAME_FLAGS) {
    if (!s.flags[n]) continue;
    return e.body[n === "name_tian" ? "tian" : n === "name_zhao" ? "zhao" : "kept"];
  }
  console.warn(`[endings] ${e.key} 写了三段变体，但没有任何 name_* 为真。这一条应该只出现在登基线上`);
  return e.body.kept;
}

/**
 * 无字之碑那枚印的印文（D-067，B27）：就是她选的那一个字。
 * 和正文同一条规则取——正文写着「印文是“天”」，图上的印就必须是「天」，两处各算一遍迟早对不上
 */
export function sealGlyph(s: GameState): string {
  if (s.flags.name_tian) return "天";
  if (s.flags.name_zhao) return "曌";
  return "添";
}
