/**
 * 抽查的场景清单。舞台抽查台（stage-preview.ts）和自动审查循环（tools/art-loop.ts）共用这一份，
 * 加一个场景状态只加这里一行，两边就都会跑到。
 *
 * 只放纯数据、只 import type：循环脚本在 Node 里直接读它，不能牵进 three。
 */
import type { Palette, SceneKey } from "../engine/types.ts";

/** yilu 是第九个地点（D-062）。CC1 把它加进 SceneKey 之后这个并集自然合并 */
export type StageKey = SceneKey | "yilu";

export interface Shot {
  key: StageKey;
  palette: Palette;
  act: number;
  label: string;
  /** 覆盖 setInk 的默认值 */
  ink?: number;
  /** 布置，空就是没有 */
  dress?: string;
  /** 这一版是哪一轮加的。循环默认跑全部，`--new` 只跑最新一批 */
  since?: string;
}

export const SHOTS: Shot[] = [
  { key: "yeting",   palette: "ink",  act: 1, label: "掖庭偏院 · 清晨薄雾" },
  { key: "zhaoyang", palette: "gold", act: 1, label: "昭阳殿 · 正午 · 一幕" },
  { key: "shuge",    palette: "gold", act: 1, label: "书阁 · 午后斜光 · 一幕" },
  { key: "shuge",    palette: "ink",  act: 1, label: "书阁 · 夜 · 一盏灯" },
  { key: "nvguan",   palette: "ink",  act: 1, label: "女冠观 · 阴天漫射" },
  { key: "shishe",   palette: "ink",  act: 1, label: "诗社水榭 · 黄昏" },
  { key: "yuanye",   palette: "ink",  act: 1, label: "御花园 · 夜 · 月光" },
  { key: "hanyuan",  palette: "gold", act: 1, label: "含元殿 · 逆光 · 一幕" },
  { key: "wuzibei",  palette: "ink",  act: 1, label: "无字碑 · 正面平光（结局卡）", dress: "yin" },
  { key: "zhaoyang", palette: "gold", act: 2, label: "昭阳殿 · 二幕 · 墨屏进殿" },
  { key: "hanyuan",  palette: "gold", act: 3, label: "含元殿 · 三幕 · 墨盖过来" },
  { key: "zhaoyang", palette: "gold", act: 2, label: "昭阳殿 · 公议", dress: "gongyi" },
  { key: "hanyuan",  palette: "gold", act: 3, label: "含元殿 · 公议", dress: "gongyi" },
  { key: "nvguan",   palette: "ink",  act: 3, label: "女冠观 · 夜雨（三章 10 夜谈三）", dress: "yeyu" },
  { key: "hanyuan",  palette: "gold", act: 3, label: "含元殿 · 受位议决（三章 12）", dress: "shouwei" },
  // E6：第四章
  { key: "wuzibei",  palette: "ink",  act: 4, label: "无字碑 · 夜 · 碑样无印（四章 18 夜谈五）", dress: "beiyang", since: "E6" },
  { key: "yilu",     palette: "ink",  act: 4, label: "驿路 · 启程（四章 15）", dress: "qicheng", since: "E6" },
  { key: "yilu",     palette: "ink",  act: 4, label: "驿路 · 驿旁（四章 16）", dress: "yipang", since: "E6" },
  { key: "zhaoyang", palette: "ink",  act: 4, label: "昭阳殿 · 水墨（四章 01、04）", since: "E6" },
  { key: "zhaoyang", palette: "ink",  act: 4, label: "昭阳殿 · 夜 · 一盏灯（四章 06 夜谈四）", dress: "yedeng", since: "E6" },
  { key: "nvguan",   palette: "ink",  act: 4, label: "女冠观 · 开课（四章 11—13）", dress: "kaike", since: "E6" },
];

/** 自动判定用的门槛。数值出处都在 art-style，改那边再改这里 */
export const GATES = {
  tris: 1500,          // E1 / scene.md
  ms: 3,               // D-003
  blankInk: 40,        // SKILL.md 第 1 条
  blankGold: 30,       // composition.md：金碧的「满」是意思的一部分
  accent: 3,           // SKILL.md 第 3 条
  purple: 0.5,         // palette.md「一点紫」
  /** 色板外的颜色。抗锯齿的边、灯光染暖的面会落进「其他」，所以不是 0，是一个容差 */
  offPalette: 2.5,
} as const;

export interface ShotResult {
  key: string; palette: Palette; act: number; dress: string; label: string;
  fit: number;
  tris: number; ms: number;
  blank: number; blankCells: number;
  accent: number; purple: number; offPalette: number;
  areas: [string, number][];
}
