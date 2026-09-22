import { z } from "zod";

/**
 * 运行时校验的唯一来源。`docs/story-schema.md` 第二部分是它的说明书，
 * 两边不一致时以这个文件为准，然后立刻回去改文档。
 *
 * 引擎启动时不跑校验（开销白付），构建期由 tools/validate-story.ts 跑。
 */

/** 角色 key 冻结于指挥日志 D-016。加人先改那里。 */
/**
 * 冻结的角色 key（D-016，D-045 加了第十一个）。
 *
 * 冻结的意思是「不改」，不是「不加」：新增一个 key 不动任何已有存档、
 * 结局判定或立绘；改名或删 key 才会动到那三样。以后批准新人物同此办理。
 */
export const CHARACTER_KEYS = [
  "wuze", "shenheng", "peizhaoye", "wenqiao", "liqinghe",
  "songhuizhen", "hetaihou", "xujinghe", "tangjian", "adi",
  "liuchenghuan",
] as const;
export const CharacterKey = z.enum(CHARACTER_KEYS, {
  errorMap: () => ({ message: `不是 D-016 冻结的角色 key。只能是：${CHARACTER_KEYS.join("、")}` }),
});

/** 说话人还可以是主角内心和旁白，它们不是角色 */
/**
 * 说话人还可以是主角内心、旁白，以及题记（D-063）。
 *
 * 题记不是一个人在说话，是纸上先写好的几行。剧本「说话人」一栏写「题记」，转换器出 `tiji`；
 * 引擎把连续的题记句收成一次，交给 CC3 的题记层（竖排、墨晕进出），不进对话框。
 * 不加新字段：它就是台词的一种说话人，序幕和第二、三章开头的短序都走这一条。
 *
 * 事件图（D-142，B23）也走同一条：剧本「说话人」写「事件图」，转换器出 `cg`，**文本写图的 key**（src/scene/cgs.ts）。
 * 引擎走到这一句就铺一张整图，点一下退回，这一句本身不进对话框。
 */
// "empty" 空镜（D-145／D-176，B31）：这一格台上没有人，背景整幅露出来，下一格有人说话再上来
export const SpeakerKey = z.union([CharacterKey, z.enum(["self", "narr", "tiji", "cg", "empty"])], {
  errorMap: () => ({ message: `说话人只能是角色 key，或 self（主角内心）、narr（旁白）、tiji（题记）、cg（事件图）` }),
});

/**
 * 地点。D-062 加了第九个 `yilu`（驿路），给第四章行路线的启程与驿旁。
 * 「关山有信」是八个结局之一，没有自己的画面那个结局立不住——她走了，画面上得真的有一条路。
 * 加 key 不动存档与结局判定，同 D-045。
 */
export const SCENE_KEYS = [
  "yeting", "zhaoyang", "shuge", "nvguan",
  "shishe", "yuanye", "hanyuan", "wuzibei",
  "yilu",
] as const;
export const SceneKeyEnum = z.enum(SCENE_KEYS, {
  errorMap: () => ({ message: `不是 art-style 里的场景之一：${SCENE_KEYS.join("、")}` }),
});
export const PaletteEnum = z.enum(["ink", "gold"], {
  errorMap: () => ({ message: "色板只有 ink（水墨）和 gold（金碧）两种，见 D-010" }),
});

const Cmp = z.object({
  gte: z.number().optional(), lte: z.number().optional(),
  gt: z.number().optional(), lt: z.number().optional(), eq: z.number().optional(),
}).strict();

import { relationKey, looksLikeRelationKey } from "./pact.ts";
import { SOLAR_TERMS } from "./types.ts";

const STAT_RE = /^(shi|ming|cai|xin)$/;
const REF_RE = /^(affinity|flag)\.[a-z][a-z0-9_]*$/;

/** 条件与效果的键：四个数值，或 affinity.<key>，或 flag.<name> */
const keyed = <T extends z.ZodTypeAny>(value: T) =>
  z.record(z.string(), value).superRefine((obj, ctx) => {
    for (const k of Object.keys(obj)) {
      if (looksLikeRelationKey(k)) {
        if (!relationKey(k)) ctx.addIssue({
          code: z.ZodIssueCode.custom, path: [k],
          message: `关系键「${k}」写错了：人只能是 shenheng／peizhaoye／wenqiao／liqinghe，字段只能是 pact／told／answer／asked／love，或 intent、pacts.active、pacts.love（engine/pact.ts）`,
        });
        continue;
      }
      if (STAT_RE.test(k) || REF_RE.test(k)) continue;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [k],
        message: `认不出的键「${k}」。只能是 shi/ming/cai/xin，或 affinity.<角色key>，或 flag.<小写下划线名>，或关系键（engine/pact.ts）`,
      });
    }
  });

const OneOf = z.object({ in: z.array(z.string()).min(1).optional(), not: z.array(z.string()).min(1).optional() }).strict();

/** 关系键的值对不对（B27）：枚举键只能写表里的值，布尔键只能写真假，派生键不能写 */
function relationValues(obj: Record<string, unknown>, ctx: z.RefinementCtx, asEffect: boolean): void {
  for (const [k, v] of Object.entries(obj)) {
    const info = relationKey(k);
    const add = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: [k], message });
    const oneOf = typeof v === "object" && v !== null && ("in" in v || "not" in v);
    if (!info) {
      if (typeof v === "string" || oneOf) add(`「${k}」不是关系键，不能写成字符串或「其中之一」`);
      continue;
    }
    if (asEffect && !info.writable) { add(`「${k}」是算出来的，只能写在条件里`); continue; }
    if (info.kind === "bool") { if (typeof v !== "boolean") add(`「${k}」只能写真或假`); continue; }
    if (info.kind === "number") { if (typeof v !== "object" || v === null || oneOf) add(`「${k}」是个数，要写比较（>= 2 这种）`); continue; }
    const allowed = info.kind as readonly string[];
    const vals = typeof v === "string" ? [v]
      : oneOf && !asEffect ? [...((v as { in?: string[] }).in ?? []), ...((v as { not?: string[] }).not ?? [])]
      : null;
    if (!vals) { add(`「${k}」要写成 ${allowed.join("／")} 之一${asEffect ? "" : "，或「其中之一」"}`); continue; }
    for (const x of vals) if (!allowed.includes(x)) add(`「${k}」没有「${x}」这个值，只能是 ${allowed.join("／")}`);
  }
}

export const Condition = keyed(z.union([Cmp, z.boolean(), z.string(), OneOf])).superRefine((o, ctx) => relationValues(o, ctx, false));
export const Effects = keyed(z.union([z.number(), z.boolean(), z.string()])).superRefine((o, ctx) => relationValues(o, ctx, true));

export const Line = z.object({
  id: z.string().min(1),
  /** 逐句条件（D-026）。不满足就跳过这一句。空 = 总是播放 */
  when: z.lazy(() => Condition).optional(),
  who: SpeakerKey,
  expr: z.enum(["default", "guarded", "open"], {
    errorMap: () => ({ message: "表情差分只有三种：default、guarded、open" }),
  }).optional(),
  kind: z.enum(["say", "inner", "aside", "poem"], {
    errorMap: () => ({ message: "类型只有 say（说）、inner（内心）、aside（旁白）、poem（诗）" }),
  }).default("say"),
  text: z.string().min(1, "台词不能是空的").max(40, "一句台词不超过 40 字，手机装不下"),
  /** 同一拍的画面（D-223，B45）：cgs.ts 的 key。key 在不在表里、能不能用，校验器查（validate-story） */
  image: z.string().min(1, "画面一栏写了就要写 key").optional(),
  /** 这一格读到的诗（D-238，B47）：poems.json 的 key。在不在诗库里，校验器查 */
  poem: z.string().min(1, "收诗一栏写了就要写诗的 key").optional(),
});

export const Choice = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(24),
  require: Condition.optional(),
  lockHint: z.string().optional(),
  effects: Effects.optional(),
  irreversible: z.boolean().default(false),
  /**
   * 去向。**章末场的选项可以不写**（D-043）：那时候的语义是
   * 「结算这个选项的效果 → 章末结算页 → 场景级 goto」。
   * 其余场景不写去向就是死路，Scene 的 superRefine 会拦。
   */
  goto: z.string().min(1).optional(),
});

export const Scene = z.object({
  id: z.string().min(1),
  chapter: z.number().int().min(0),
  // D-066：第四章是第四幕。幕数是墨层的地板（engine/ink.ts），第四幕的地板是 1.0
  act: z.number().int().min(1, "幕只有 1 到 4").max(4, "幕只有 1 到 4"),
  scene: SceneKeyEnum,
  palette: PaletteEnum,
  bgm: z.string().optional(),
  cast: z.array(CharacterKey),
  require: Condition.optional(),
  weightless: z.boolean().default(false),
  leavesLetter: z.array(CharacterKey).default([]),
  purpose: z.string().min(1, "说不出目的的场景应该被合并或删掉"),
  /**
   * 台词表。**可以为空（B30，D-172）**：D-169 定第四章的中转场（05c／05m／05q，谈完一个人回到自己）不放台词，
   * 否则每回来一次重播一句。空台词场一进来就直接到出口，引擎走的是「台词读完」那一条路（全被条件跳过也是这条）。
   * 但**没有选项、自动去向、goto 的场仍要至少一句**——结局、章末、对诗那种场没有一句就一闪而过，下面 superRefine 拦
   */
  lines: z.array(Line),
  /**
   * 场景布置（D-046 第 2 条）。自由字符串，现在只有 `"gongyi"`（公议：多几张案、一面收封簿）。
   *
   * 为什么写进数据而不是让美术按场景 id 列一张白名单：场景 id 由标题生成，
   * 而标题是会改的（D-037 说改内容零影响）。白名单等于给剧本的自由加一道暗锁——
   * 改一句标题就悄悄少了一排案，而且没有任何东西会报错。写在这里，剧本改到哪儿它跟到哪儿。
   */
  dressing: z.string().min(1).optional(),
  /** 台词读完之后先打一局对诗，再进选项。对局在 duels.json 里 */
  duel: z.string().optional(),
  /** 走到这里就按结局表从上往下取首个满足者。全游戏只有一个这样的点 */
  judgeEnding: z.boolean().optional(),
  /**
   * 章末出口（D-034、D-039 第 1 条）。**和 goto 并存**：
   * 先出结算页，翻过去再进 goto；没写 goto、或者那一章还没交，就停在结算页显示「下章待续」。
   *
   * 为什么要显式写而不是靠章号变了自动判断：最后一章的最后一场后面没有下一场，
   * 章号永远不变，自动判断在那里什么都不会发生。剧本要能说「这里是一章的头」。
   *
   * 剧本里写成场景表的一行 `| 章末 | 是 |`，去向照常写下一章第一场。
   */
  chapterEnd: z.boolean().optional(),
  choices: z.array(Choice).optional(),
  /**
   * 按条件自动走（B27）。台词读完、没有选项时从上往下取第一个满足的去向；都不满足走 goto。
   * 第四章关系谈话要「谈完回到原来那条路」，原来那条路是玩家更早选的，不能再让她选一次
   */
  branches: z.array(z.object({ require: Condition.optional(), goto: z.string().min(1) }).strict()).min(1).optional(),
  goto: z.string().optional(),
  ending: z.string().optional(),
}).superRefine((s, ctx) => {
  // 空镜格（D-176）：只是一句环境旁白，不带表情；不许两格连着没人；不许是选项前的最后一格（要做决定时台上不能是空的）
  s.lines.forEach((l, i) => {
    if (l.who !== "empty") return;
    const at = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["lines", i], message });
    if (l.kind !== "aside") at(`空镜格 ${l.id} 的类型要写旁白（aside）`);
    if (l.expr) at(`空镜格 ${l.id} 没有人，不能带表情`);
    if (s.lines[i + 1]?.who === "empty") at(`空镜格 ${l.id} 后面又是一格空镜：两格连着没人，D-176 不许`);
    if (i === s.lines.length - 1 && s.choices?.length) at(`空镜格 ${l.id} 是选项前的最后一格：要做决定时台上是空的。挪到前面，或者后面补一格有人的`);
  });
  if (!s.lines.length && !(s.choices?.length || s.branches?.length || s.goto)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom, path: ["lines"],
      message: "空台词场只能是中转场：要有选项、自动去向或 goto。结局、章末、对诗那种场一句都没有，玩家看到的是一闪而过（D-172）",
    });
  }
  if (s.branches) {
    if (s.choices?.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["branches"], message: "有选项的场不能再写自动去向：选项是玩家选，自动去向是不让她选，两个只能有一个" });
    if (s.chapterEnd || s.ending || s.judgeEnding || s.duel) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["branches"], message: "自动去向不和章末、结局、对诗写在同一场" });
    if (!s.goto && s.branches.every((b) => b.require && Object.keys(b.require).length)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["branches"], message: "自动去向每一条都带条件、也没写 goto：都不满足时玩家会卡住。最后一条不写条件，或者写 goto 兜底" });
    }
  }
  // duel 也算出口（D-026）：胜负各自的 goto 带玩家离开。两条都得有，校验器另查
  if (!(s.choices?.length || s.branches?.length || s.goto || s.ending || s.judgeEnding || s.duel || s.chapterEnd)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "场景没有出口：choices、goto、ending、judgeEnding、duel、chapterEnd 六者至少要有一个，否则玩家会卡死在这里",
    });
  }
  if (s.chapterEnd && (s.ending || s.judgeEnding)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["chapterEnd"],
      message: "章末是翻页，结局是落幕，一场戏不能既翻页又落幕。要收全局就用 judgeEnding",
    });
  }
  // D-043 松开了「章末不许带选项」：第二章最后一场要玩家先答一句再进结算。
  // 那一问是整章最后一个由玩家出手的动作，挪到别处会削掉整章的收尾。
  // 选项去向可以空，意思是「结算这个选项的效果 → 章末结算页 → 场景级 goto」。
  for (const c of s.choices ?? []) {
    if (!c.goto && !s.chapterEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["choices"],
        message: `选项 ${c.id} 没有去向。只有章末场的选项可以空着去向（走章末结算页），这一场没标章末`,
      });
    }
  }
  if (s.ending && s.judgeEnding) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["judgeEnding"],
      message: "ending 是钉死一个结局，judgeEnding 是按表判定，两个不能同时写",
    });
  }
});

export const Poem = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  author: z.string().min(1),
  /** 一行一句，不含换行符 */
  lines: z.array(z.string().min(1)).min(1),
  source: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  tags: z.array(z.string().min(1)).min(1),
  mood: z.array(z.string().min(1)).min(1),
  occasion: z.string().min(1),
  difficulty: z.number().int().min(1).max(3),
  note: z.string().optional(),
});

export const PoemDuel = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  opponent: CharacterKey.optional(),          // 场景定稿时再绑对手
  sceneId: z.string().optional(),
  prompt: z.string().min(1),                  // 出句
  poemRef: z.string().min(1),                 // 出句来自哪一首
  /**
   * 给玩家的题面：这一局到底限定了什么。
   * 有了它，错项才是「没满足写明的限制」，而不是「意境不对」这种说不清的判词。
   */
  brief: z.string().min(1),
  judgingFocus: z.string().min(1),
  difficulty: z.number().int().min(1).max(3),
  options: z.array(z.object({
    key: z.string().length(1),
    text: z.string().min(1),
    correct: z.boolean(),
    why: z.string().min(10, "错项必须说得出理由，这是游戏唯一的教学环节"),
  })).length(4),
  /** 胜负各自的效果、去向，以及一句专属台词（D-026）。台词由对话框播，不塞进判题页 */
  onWin: z.object({ effects: Effects.optional(), goto: z.string().optional(), line: z.lazy(() => Line).optional() }).optional(),
  onLose: z.object({ effects: Effects.optional(), goto: z.string().optional(), line: z.lazy(() => Line).optional() }).optional(),
}).superRefine((d, ctx) => {
  const n = d.options.filter((o) => o.correct).length;
  if (n !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["options"],
      message: `有且只有一个正确对句，现在有 ${n} 个`,
    });
  }
});

// 节令四个键见 types.ts（B33）：七夕 qixi 让位给重阳；中秋键仍是 zhongqiu，玩家看见的是「八月望夜」
const SolarTerm = z.enum(SOLAR_TERMS);

const LetterTrigger = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("scene"),
    sceneId: z.string().min(1),
    // 下限 1（D-034 / R-006）：军中素笺本来就该快，隔一场就到才对
    afterScenes: z.number().int().min(1).max(4),
  }),
  z.object({
    kind: z.literal("solarTerm"),
    term: SolarTerm,
    minAffinity: z.number().int().default(5),
  }),
]);

const ReplyOutcome = z.object({
  effects: Effects.optional(),
  reaction: z.string().min(1, "每种回信都要有她的反应，否则回信就是没有后果的按钮"),
  goto: z.string().optional(),
});

export const Letter = z.object({
  id: z.string().min(1),
  from: CharacterKey,
  trigger: LetterTrigger,
  // 下限 5 分钟（R-006）。再短就不像「过了一会儿」，像系统弹窗
  delayMinutes: z.number().int().min(5).max(180),
  paper: z.enum(["huangma", "junzhong", "nijin", "huajian", "chang"]),
  body: z.object({
    surface: z.string().min(1),
    /**
     * 分条件的附页（D-044）。一封信、几段正文，按当时的 flag 各取一段。
     *
     * 为什么不拆成几封信：一封信在不同路线上说不同的话，正是它作为
     * 「只给一个人读的东西」的全部意义。拆开的话，案上会多出几封根本不存在的信。
     *
     * `when` 空 = 总是出现；顺序就是表格里的顺序。
     */
    pages: z.array(z.object({
      key: z.string().min(1),
      when: Condition.optional(),
      text: z.string().min(1),
      /**
       * 被截宣读时，这一段会不会当众被念出来。默认会。
       *
       * 填「否」的那一段是整封信的戏眼：被截的伤害不在于念了什么，
       * 在于她还有一句没来得及给你，而所有人都听见了前面那些。
       */
      readAloud: z.boolean().default(true),
    })).optional(),
    poem: z.object({ ref: z.string(), line: z.string() }).optional(),
    poemMeans: z.string().optional(),
    blank: z.string().min(1),
  }),
  sheMayNotReply: Condition.optional(),
  interceptable: z.boolean().default(false),
  /**
   * 固定截获点（D-039 第 2 条）。玩家走进这一场时，这封信如果还在路上、
   * 或者已经到了还没读，一律强制「送达并被截」，然后进被截去向。
   *
   * 为什么不交给真实延迟和未读数：那两样是玩家的节奏，快的人可能早就读完回完了，
   * 慢的人可能还没收到。可这封信被当众展开是剧情的支点，不能看运气。
   * 已经回过的信不再被截——她要是已经把话说完了，那一幕就不该再发生。
   */
  interceptAt: z.string().min(1).optional(),
  onIntercept: z.object({ goto: z.string().min(1) }).optional(),
  replies: z.object({
    plain: z.array(ReplyOutcome.extend({
      id: z.string().min(1),
      text: z.string().min(1).max(30),
    })).length(3),
    poem: z.object({
      resonantTags: z.array(z.string().min(1)).min(1),
      onResonant: ReplyOutcome,
      onMismatch: ReplyOutcome,
    }),
    silence: ReplyOutcome,
  }),
}).superRefine((l, ctx) => {
  if ((l.interceptable || l.interceptAt) && !l.onIntercept) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["onIntercept"],
      message: "会被截的信必须写明被截之后去哪一场",
    });
  }
  if (l.trigger.kind === "solarTerm" && (l.interceptable || l.interceptAt)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom, path: ["interceptable"],
      message: "节令信不会被截（D-184）：它不占未读上限，也不该在公议上被念出来。把 interceptable／interceptAt 去掉",
    });
  }
  if (l.interceptAt && !l.interceptable) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["interceptable"],
      message: "写了截获场景就等于这封信会被截。「会被截」也要填是，两处别打架",
    });
  }
});

/**
 * 改名三个 flag。D-020：三选无优劣，任何结局判定都不许拿它们当门槛，
 * 只能用来切文本变体。校验器会强制这一条。
 */
export const NAME_FLAGS = ["flag.name_tian", "flag.name_zhao", "flag.name_kept"] as const;

/**
 * 结局正文。登基线的结局要按玩家选的那个字给三段变体，
 * 因为登基后的名字是她自己挑的，结局卡不能对此毫无反应（R-003 第 2 条）。
 */
export const EndingBody = z.union([
  z.string().min(1),
  z.object({
    tian: z.string().min(1),
    zhao: z.string().min(1),
    kept: z.string().min(1),
  }),
]);

export const Ending = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  require: Condition.optional(),        // 留空 = 兜底
  palette: PaletteEnum,
  theme: z.string().min(1),
  body: EndingBody,
  card: z.string().optional(),
}).superRefine((e, ctx) => {
  for (const f of NAME_FLAGS) {
    if (e.require && f in e.require) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["require", f],
        message: `结局判定不许用 ${f}（D-020）。改名三选没有优劣之分，一旦拿它当门槛，那一幕就有了「正确答案」。要区分就用 body 的三段变体`,
      });
    }
  }
});

/**
 * flag 互斥。来自 C-B 结局树第四节，成对写而不是分组写，
 * 因为并非所有末段选择都互相排斥：落选给李令仪之后仍然可以去办学或行路。
 */
/** 剧本结构版本（D-037 第 3 条）。定义在 types.ts，那边写了为什么不放这里 */
export { DATA_VERSION } from "./types.ts";

export const FLAG_CONFLICTS: [string, string][] = [
  ["name_tian", "name_zhao"], ["name_tian", "name_kept"], ["name_zhao", "name_kept"],
  ["enthroned", "declined_crown"], ["enthroned", "liqinghe_won"],
  ["enthroned", "founded_school"], ["enthroned", "road_agreement"],
  ["declined_crown", "liqinghe_won"], ["declined_crown", "liqinghe_together"],
  ["declined_crown", "founded_school"], ["declined_crown", "road_agreement"],
  ["founded_school", "road_agreement"],
  // 名单开还是关是第四章那一下的两个方向，也是满殿无声与无字碑的分水岭（D-028）。
  // 两个都为真时结局表只会取到排在前面的那个，玩家做的另一半决定就悄悄消失了。
  ["ch04_nomination_open", "ch04_nomination_closed"],
];

/** flag 的前置条件：写真之前，被依赖的那个必须已经为真 */
export const FLAG_REQUIRES: Record<string, string> = {
  enthroned: "succession_open",
  liqinghe_together: "liqinghe_won",
  name_tian: "enthroned",
  name_zhao: "enthroned",
  name_kept: "enthroned",
};

export type SceneT = z.infer<typeof Scene>;
export type PoemT = z.infer<typeof Poem>;
export type PoemDuelT = z.infer<typeof PoemDuel>;
export type LetterT = z.infer<typeof Letter>;
export type EndingT = z.infer<typeof Ending>;
