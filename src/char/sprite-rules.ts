/**
 * 立绘换图规则（D-046 第 1 条）。**表驱动，不写死任何一个角色。**
 *
 * 有些角色在剧情里会失去身上那处记号，之后就该换一套没有记号的图。
 * 目前只有一条：柳承欢归还那根朱绳之后（第三章 15 场）换 `_bare`。
 * 以后谁再有这种事，往表里加一行，`CharacterLayer` 一个字都不用改。
 *
 * 为什么规则放在这里而不是引擎里：哪张图存在、叫什么名字，是美术的事；
 * flag 什么时候为真，是剧本和引擎的事。这张表只做「记号没了就换图」这一件事的对照。
 */

export interface SpriteRule {
  /** 角色 key */
  who: string;
  /** 这个 flag 为真时换图 */
  flag: string;
  /** 换成哪一套。文件名是 `<who>_<expr>_<suffix>.svg` */
  suffix: string;
  /** 记一句为什么，别人读表时不用去翻日志 */
  why: string;
}

export const SPRITE_RULES: SpriteRule[] = [
  {
    who: "liuchenghuan",
    flag: "chenghuan_returned",
    suffix: "bare",
    why: "腕上那根朱绳是主角暂借给她系稿的。归还戏之后收回，身上不该再有那一点红（D-038 第 8 条）",
  },
];

/**
 * 这一格该用哪张图。`has(flag)` 由引擎给——它知道 flag，这里不知道。
 *
 * 返回的名字**不保证存在**：调用方拿不到图时要退回 `<who>_<expr>`。
 * 这样即使表里写错一行，最坏也只是没换成图，不会白屏。
 */
export function spriteKey(who: string, expr: string, has: (flag: string) => boolean): string {
  for (const r of SPRITE_RULES) {
    if (r.who === who && has(r.flag)) return `${who}_${expr}_${r.suffix}`;
  }
  return `${who}_${expr}`;
}
