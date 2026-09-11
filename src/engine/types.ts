/** 与 docs/story-schema.md 第二部分一一对应。改这里之前先改那份文档。 */

export type StatKey = "shi" | "ming" | "cai" | "xin";
export type Palette = "ink" | "gold";
export type SceneKey =
  | "yeting" | "zhaoyang" | "shuge" | "nvguan"
  | "shishe" | "yuanye" | "hanyuan" | "wuzibei";

export const STAT_KEYS: StatKey[] = ["shi", "ming", "cai", "xin"];
export const STAT_LABEL: Record<StatKey, string> = {
  shi: "势", ming: "名", cai: "才", xin: "心",
};

/** 数值范围 0..20，开局各 3。见 story-schema 1.1 */
export const STAT_MIN = 0;
export const STAT_MAX = 20;
export const STAT_START = 3;

export interface Cmp {
  gte?: number; lte?: number; gt?: number; lt?: number; eq?: number;
}

/** 键是 "cai" | "affinity.<key>" | "flag.<name>" */
export type Condition = Record<string, Cmp | boolean>;

/** 数值键是增量（可负），flag 键是绝对值 */
export type Effects = Record<string, number | boolean>;

export type LineKind = "say" | "inner" | "aside" | "poem";
export type Expr = "default" | "guarded" | "open";

export interface Line {
  id: string;
  /** 逐句条件（D-026）。不满足就跳过 */
  when?: Condition;
  who: string;            // 角色 key | "self" | "narr"
  expr?: Expr;
  kind?: LineKind;
  text: string;
}

export interface Choice {
  id: string;
  text: string;
  require?: Condition;
  lockHint?: string;
  effects?: Effects;
  irreversible?: boolean;
  goto: string;
}

export interface Scene {
  id: string;
  chapter: number;
  act: number;
  scene: SceneKey;
  palette: Palette;
  bgm?: string;
  cast: string[];
  require?: Condition;
  weightless?: boolean;
  /** 台词读完之后先打一局对诗，再进选项。对局在 duels.json 里 */
  duel?: string;
  /** 走到这里就按结局表从上往下取首个满足者。全游戏只有一个这样的点 */
  judgeEnding?: boolean;
  /** 章末出口（D-034）。先出结算页；goto 有下一章就接着走，没有就停在「下章待续」 */
  chapterEnd?: boolean;
  /** 这一场结束时谁「有话没说完」。对应场景表的「留信」一列，笺系统在 M4 用它。 */
  leavesLetter?: string[];
  purpose: string;
  lines: Line[];
  choices?: Choice[];
  goto?: string;
  ending?: string;
}

/**
 * 信箱里一封信的状态。投递逻辑在 M4 实现（src/engine/letters.ts），
 * M1 先把字段带进存档，免得 M4 再加一次迁移。见 story-schema 2.3 与 2.4。
 */
export type LetterState =
  | "pending"       // 已触发，还在路上
  | "arrived"       // 到了，未读
  | "read"
  | "replied"
  | "intercepted"   // 未读满 3 封时最旧的一封被截，转成朝廷场景
  | "lost";         // 节气信错过了，明年还有

export interface LetterSlot {
  id: string;
  state: LetterState;
  /** 绝对时间戳，不是倒计时。关掉游戏那段时间信照走。0 = 场次门还没过 */
  dueAt: number;
  repliedWith: string | null;
  /** 场次门：还要走几场才开始计时。C-4：按实际经过的主场次计 */
  scenesLeft?: number;
}

/** 未读上限。第 4 封到达时最旧的一封被截，这不是惩罚，是剧情。 */
export const INBOX_UNREAD_MAX = 3;

/** 登基线的结局按玩家选的那个字给三段变体，见 R-003 第 2 条 */
export interface EndingBodyVariants { tian: string; zhao: string; kept: string }

export interface Ending {
  key: string;
  title: string;
  require?: Condition;   // 留空 = 兜底
  palette: Palette;
  theme: string;
  body: string | EndingBodyVariants;
  card?: string;
}

/** 改名三个 flag。D-020：只切文本变体，不做结局门槛。 */
export const NAME_FLAGS = ["name_tian", "name_zhao", "name_kept"] as const;
export type NameFlag = (typeof NAME_FLAGS)[number];

/**
 * flag 互斥，来自 C-B 结局树第四节。成对写不是分组写：
 * 落选给李令仪之后仍然可以去办学或行路，这几个末段选择并非彼此排斥。
 */
export const FLAG_CONFLICTS: [string, string][] = [
  ["name_tian", "name_zhao"], ["name_tian", "name_kept"], ["name_zhao", "name_kept"],
  ["enthroned", "declined_crown"], ["enthroned", "liqinghe_won"],
  ["enthroned", "founded_school"], ["enthroned", "road_agreement"],
  ["declined_crown", "liqinghe_won"], ["declined_crown", "liqinghe_together"],
  ["declined_crown", "founded_school"], ["declined_crown", "road_agreement"],
  ["founded_school", "road_agreement"],
];

/** 写真之前，被依赖的那个必须已经为真 */
export const FLAG_REQUIRES: Record<string, string> = {
  enthroned: "succession_open",
  liqinghe_together: "liqinghe_won",
  name_tian: "enthroned",
  name_zhao: "enthroned",
  name_kept: "enthroned",
};

export function conflictsOf(flag: string): string[] {
  const out: string[] = [];
  for (const [a, b] of FLAG_CONFLICTS) {
    if (a === flag) out.push(b);
    else if (b === flag) out.push(a);
  }
  return out;
}

/** 好感四档，见 story-schema 1.1 */
export const AFFINITY_BANDS = [
  { min: 16, label: "盟" },
  { min: 10, label: "契" },
  { min: 5,  label: "识" },
  { min: 0,  label: "疏" },
] as const;

export function affinityBand(v: number): string {
  for (const b of AFFINITY_BANDS) if (v >= b.min) return b.label;
  return "疏";
}
