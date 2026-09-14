/** 与 docs/story-schema.md 第二部分一一对应。改这里之前先改那份文档。 */

/**
 * 剧本结构版本（D-037 第 3 条）。
 *
 * 存档存的是「哪一场、第几句」。剧本一改句子数，旧档里那个句号就指到别处去了——
 * 玩家读出来的是一段接不上的话，而且没有任何提示告诉她发生了什么。
 *
 * **什么时候要 +1**：改了场景 id、增删场景、增删或重排任何一场的台词行。
 * 只改字、不改行数不用动（那种改动句号还对得上）。
 * 忘了 bump 的代价是老玩家读到错位的台词；多 bump 一次的代价只是她回到本章开头。
 * 两者不对称，所以拿不准就 bump。
 *
 * 对不上的旧档不会被丢掉：数值、好感、flag、收到的诗全部保留，
 * 只把位置退回该章开头，并且当面告诉她为什么（见 story.ts 的 reconcile）。
 *
 * 定义放在 types.ts 而不是 schema.ts：schema.ts 依赖 zod，而 zod 是构建期的校验器。
 * 运行时只要从那边取一个整数，整个 zod 就会被打进玩家下载的包里——实测多 62 KB。
 * schema.ts 仍然把它再导出一次，文档上那里还是它的家。
 */
export const DATA_VERSION = 6;
/*
 * 版本记录（每次 +1 都在这里记一行，写清改了什么结构）
 *   1  B8   第一章 18 场
 *   2  B12  第一至三章接入：第一章前面加序幕 ch01-00，第二章 01 场、第三章 01 场前插旁白、行号重排
 *   3  B14  第四章接入；C13 在四条恋爱线各自的第一场加了初见的几句（D-070），那几场行号重排
 *   4  B17  C19／C15：第三章 08 场对白按 D-104 重改（170 行 → 113 行），第四章 01 场开头加题记，后面行号后移
 *   5  B21  C24 四笔：四章对白按 D-099＋D-104 重改、接榫补齐，86 场行号重排
 *   6  B25  C31：ch02-17 加天女闲谈、ch04-15 加砖塔，两场行号重排
 */

export type StatKey = "shi" | "ming" | "cai" | "xin";
export type Palette = "ink" | "gold";
export type SceneKey =
  | "yeting" | "zhaoyang" | "shuge" | "nvguan"
  | "shishe" | "yuanye" | "hanyuan" | "wuzibei"
  | "yilu";                                // 驿路，第九个地点（D-062）

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
  /** 章末场的选项可以不写去向（D-043）：结算效果 → 章末结算页 → 场景级 goto */
  goto?: string;
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
  /** 场景布置（D-046 第 2 条）。现在只有 "gongyi"。美术按它换陈设，引擎只负责传 */
  dressing?: string;
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

/**
 * 好感四档，见 story-schema 1.1。
 *
 * D-065 把契档、盟档的门槛从 10、16 降到 8、14，D-078 把识档从 5 降到 4。档位的下限必须和门槛是同一个数：
 * 章末结算页写着「识」，她却已经进了契档的专属场，玩家会以为出了错。
 * 降门槛的理由见 docs/engine-cc1-b12.md 第三节：不回信时每道门前的好感恰好等于门槛，余量为零。
 */
export const AFFINITY_BANDS = [
  { min: 14, label: "盟" },
  { min: 8,  label: "契" },
  { min: 4,  label: "识" },
  { min: 0,  label: "疏" },
] as const;

export function affinityBand(v: number): string {
  for (const b of AFFINITY_BANDS) if (v >= b.min) return b.label;
  return "疏";
}
