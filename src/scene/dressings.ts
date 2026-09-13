/**
 * 布置（Scene.dressing）的中文名与 key。**这张表是唯一的出处**：
 * 剧本场景表里写「布置 | 开课」，转换器查这里得到 `kaike`，渲染器认的也是这几个 key。
 *
 * 纯数据、零依赖，Node 里的转换器可以直接 import。加一种布置：这里加一行，
 * ThreeStageRenderer 里对应场景认它，shots.ts 加一条抽查，跑一遍 npm run art:loop。
 */
export interface Dressing {
  key: string;
  /** 只在哪个场景有意义。写在别的场景上不会报错，只是什么都不变 */
  scene: string;
  /** 用在哪几场，给写剧本的人查 */
  where: string;
}

export const DRESSINGS: Record<string, Dressing> = {
  公议: { key: "gongyi",  scene: "zhaoyang / hanyuan", where: "二章 11、13；三章 08、11；四章 02、07" },
  夜雨: { key: "yeyu",    scene: "nvguan",   where: "三章 10 夜谈三" },
  受位: { key: "shouwei", scene: "hanyuan",  where: "三章 12 受位议决" },
  夜灯: { key: "yedeng",  scene: "zhaoyang", where: "四章 06 夜谈四（水墨）" },
  开课: { key: "kaike",   scene: "nvguan",   where: "四章 11—13" },
  碑样: { key: "beiyang", scene: "wuzibei",  where: "四章 18 夜谈五。不写这一行，碑上就有结局卡那枚朱砂印" },
  启程: { key: "qicheng", scene: "yilu",     where: "四章 15。驿路不写布置也是启程" },
  驿旁: { key: "yipang",  scene: "yilu",     where: "四章 16" },
};
