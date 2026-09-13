import type { Scene } from "./types.ts";

/**
 * 人什么时候进画面（D-076）。
 *
 * 默认：一场开始，名单上的人就站在台上。
 * 例外：这张表里的场，人等到那一句才进画面，在那之前台上只有景。
 *
 * 为什么是一张表而不是剧本里的一个字段：D-076 说「一个字的文本都不用改、不加新机制」，
 * 而且全游戏眼下只有序幕这一处。第二处出现的时候再考虑进 schema。
 * 表里写的是句子 id，剧本改了句序、id 对不上，校验器报错——不会悄悄变回「一开场人就在」。
 */
export const ENTRANCES: Readonly<Record<string, string>> = {
  // 序幕：题记三句只有纸；纸收起、墨晕开，是空的昭阳殿；
  // 到「阶下已有人连姓叫你的名字」这一句，她才进画面——有人叫她，她才在场
  ch01_s00_zhaoyang: "ch01_s00_zhaoyang.l7",
};

/**
 * 从 `lineIndex` 开始读这一场，人要等到第几句才上台。
 * 已经读过那一句（读档读在后面）、或者这一场不在表里、或者表里那句找不到，都返回 -1：人一开场就在。
 */
export function entranceIndex(scene: Scene, lineIndex: number): number {
  const id = ENTRANCES[scene.id];
  if (!id) return -1;
  const at = scene.lines.findIndex((l) => l.id === id);
  return at > lineIndex ? at : -1;
}
