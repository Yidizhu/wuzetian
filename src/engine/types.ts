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
export const DATA_VERSION = 19;
/*
 * 版本记录（每次 +1 都在这里记一行，写清改了什么结构）
 *   1  B8   第一章 18 场
 *   2  B12  第一至三章接入：第一章前面加序幕 ch01-00，第二章 01 场、第三章 01 场前插旁白、行号重排
 *   3  B14  第四章接入；C13 在四条恋爱线各自的第一场加了初见的几句（D-070），那几场行号重排
 *   4  B17  C19／C15：第三章 08 场对白按 D-104 重改（170 行 → 113 行），第四章 01 场开头加题记，后面行号后移
 *   5  B21  C24 四笔：四章对白按 D-099＋D-104 重改、接榫补齐，86 场行号重排
 *   6  B25  C31：ch02-17 加天女闲谈、ch04-15 加砖塔，两场行号重排
 *   7  B26  C33 十八场（ch01 七场、ch02-15～18、ch03-17～20、ch04 三场）重排行号；驯马、补袖两场加事件图
 *   8  B29  D19＋D20：ch03-09 加答复场 09a／b／c；第四章关系选择 16 小场，ch04-05／08 后段移到 05z／08z（选项 id 随之改名）；八封回信补 pact 效果
 *   9  B31  D21（C38）：05c／05m／05q 中转场台词清空、新增 05pe、答复场删 22 句、ch03-12 改；十场行号重排
 *  10  B34  D23（C41）：四处节令空镜、四处闲场风物格、五处角色事件图格；二十五场行号重排
 *  11  B35  D24（C43）：四封节令信进书信表（16 → 20 封）。场次没动，老档只是多了四封还没触发的信
 *  12  B36  D25（C44）：四处「为你／关系」图格、节令信门槛、未受位线三处闲场、椅脚；七场行号重排
 *  13  B37  D26（C46）：八处事件图格（第一章五张漏排的图、三张物证）、上元兜底改道 ch01-15；相关场行号重排
 *  14  B39  D27（C47）：第四章 01 场题记挪到第一格、原首句挪到第二格，两行互换
 *  15  B41  D28（C48）：八场加布置（六处晴光、两处夜灯）。行号没动，照指挥部升一次（拿不准就 bump）
 *  16  B43  D29＋D30（C49、C50）：一章 08 布置公议；三章 11 三个灰提示；三章 15 归还图只在未登基支弹
 *  17  B44  D31（C51）：四章校对八处，只改字（七字→八字、「主角」→「你」）。行号没动，照指挥部升一次
 *  18  B46  D32（C52＋C53）：四章公务对白白话化、承欢告白信、121 处同拍画面；大量格号重排
 *  19  B47  D34（C54）：四章主线收诗标记、第四章四格读诗过渡；21 封信延迟改 3—6 分钟
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

/** 关系键（engine/pact.ts）的「是其中之一／不是其中之一」 */
export interface OneOf { in?: string[]; not?: string[] }

/**
 * 键是 "cai" | "affinity.<key>" | "flag.<name>"，或关系键（engine/pact.ts）。
 * 字符串和 OneOf 只给关系键用：`"pact.shenheng": "active"`、`"pact.shenheng": { "not": ["declined"] }`
 */
export type Condition = Record<string, Cmp | boolean | string | OneOf>;

/** 数值键是增量（可负），flag 键是绝对值；关系键写字符串或布尔（绝对值） */
export type Effects = Record<string, number | boolean | string>;

/** 按条件自动走的去向（B27）。从上往下取第一个满足的；都不满足就走场景的 goto */
export interface Branch { require?: Condition; goto: string }

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
  /**
   * 这一格读到的诗（D-238，B47）：`poems.json` 的 key。**读到这一格就收进收藏**，不用赢对诗；
   * 重复读不重复收（第一次才记这一章）。条件不满足、这一格没显示出来，就不收。剧本台词表的「收诗」列转出来
   */
  poem?: string;
  /**
   * 这一格同时铺的画面（D-223，B45）：`cgs.ts` 里的 key，和文字**同一拍**出现，不等点击、不另占一格。
   * 下一格没写就退回舞台；连着几格写同一个 key，图不闪。剧本台词表的「画面」列转出来。见 docs/story-schema.md
   */
  image?: string;
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
  /** 台词读完、没有选项时，按条件自动走（B27）。第四章「谈完回到原来那条路」用 */
  branches?: Branch[];
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
  /** 时间门是什么时候开始计的（D-239，B47）。信的分钟数改短了，按它重算到期时刻；老档没有就按「不延长剩余」算 */
  startedAt?: number;
  /** 这封信触发那一刻的关系时钟（pact.ts 规则 3）：晚拆的旧信不冲掉后来的谈话。老档没有，按 0 */
  rev?: number;
}

/**
 * 节令信（D-001 定的格式，D-184 定的投递，B33 接的引擎）。
 *
 * **不按真实日历，按剧情时间**：主线仍是秋末那几天（C42：节令写成旧景，不推进日期），
 * 信是「另一时日寄来的节令笺」。一章一封，在这一章**第一个闲场**（`weightless`）之后送到。
 *
 * 内部键不动（存档里存的是键）：中秋那个键 `zhongqiu` 留着，玩家看见的名字是「八月望夜」（D-180 照调研改的）。
 * 七夕 `qixi` 不用了，位置让给重阳——**一年四封，一章一封**，多一个节令就要多一章。
 */
export const SOLAR_TERMS = ["shangyuan", "hanshi", "zhongqiu", "chongyang"] as const;
export type SolarTermKey = (typeof SOLAR_TERMS)[number];

/** 玩家看见的名字。「中秋」按调研改成「八月望夜」，键不动 */
export const SOLAR_TERM_LABEL: Record<SolarTermKey, string> = {
  shangyuan: "上元", hanshi: "寒食", zhongqiu: "八月望夜", chongyang: "重阳",
};

/** 哪一章送哪一封（D-184） */
export const SOLAR_TERM_CHAPTER: Record<SolarTermKey, number> = {
  shangyuan: 1, hanshi: 2, zhongqiu: 3, chongyang: 4,
};

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
