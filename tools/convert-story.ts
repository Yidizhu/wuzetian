/**
 * markdown 转 JSON。Prompt D 实现；运行与交接说明见 docs/convert-story.md。
 *
 * 输入：ChatGPT 交付的 `docs/C-*.md`（场景表、台词表、选项表、对诗对局表、结局表、信件表）
 * 输出：`src/data/` 下的 JSON
 * 对照规则：`docs/story-schema.md` 第三部分那张表，一一对应，不发挥
 *
 * 三条不能破的规矩：
 *
 * 1. **不猜。** markdown 不合规范时不要脑补一个合理值，把行号和问题写进
 *    `docs/convert-issues.md`，交给人改。转换器猜错一次，剧本里就多一处
 *    没人知道的偏差，几百个场景之后没人查得出来。
 * 2. **id 由你生成。** ChatGPT 的表里没有 id，人写 id 一定会重复和错字。
 *    生成规则见下面 `sceneId` / `lineId` / `choiceId`，必须是纯函数：
 *    同样的输入永远得到同样的 id，否则每次转换都会把存档打乱。
 * 3. **转完必须跑 `npm run validate`，0 硬错误才算完成。** 警告列出来给人看。
 *
 * 跑法：
 *   node --experimental-strip-types tools/convert-story.ts docs/C-C-第一章.md
 *   node --experimental-strip-types tools/convert-story.ts --all
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { Scene, Line, Choice, Poem, PoemDuel, Letter, Ending, CHARACTER_KEYS, SCENE_KEYS } from "../src/engine/schema.ts";
import type { SceneT, PoemT, PoemDuelT, LetterT, EndingT } from "../src/engine/schema.ts";
import type { Condition } from "../src/engine/types.ts";

// ---------------------------------------------------------------- 结果类型

/** 一条转换不了的地方。行号是给人回去改 markdown 用的，必须准。 */
export interface ConvertIssue {
  file: string;
  /** markdown 里的行号，从 1 开始 */
  line: number;
  /** 出问题的那一格原文，方便人搜 */
  excerpt: string;
  /** 说清楚缺什么或哪里不合规范，不要只说「格式错误」 */
  message: string;
  /** 谁去处理。不填时按 classify() 从文案推断 */
  kind?: IssueKind;
}

export interface ConvertResult {
  poems: PoemT[];
  scenes: SceneT[];
  duels: PoemDuelT[];
  letters: LetterT[];
  endings: EndingT[];
  issues: ConvertIssue[];
}

// ------------------------------------------------------------------ id 生成

/**
 * 场景 id。`ch01-03 昭阳殿一角` + 地点 key `zhaoyang` -> `ch01_s03_zhaoyang`
 *
 * - 短横改下划线，章号与序号各补零到两位
 * - 地点 key 取自场景表的「地点 key」一列，不是从中文标题猜
 * - 分支后缀保留：`ch01-04a` -> `ch01_s04a_<key>`
 */
export function sceneId(label: string, sceneKey: string): string {
  if (!(SCENE_KEYS as readonly string[]).includes(sceneKey)) throw new Error(`未知地点 key：${sceneKey}`);
  return `${sceneLabel(label).replace("-", "_s")}_${sceneKey}`;
}
function sceneLabel(label: string): string {
  const m = /^ch(\d+)-(\d+)([a-z]*)(?:\s|$)/.exec(label.trim());
  if (!m) throw new Error(`场次须为 ch01-03 或带分支后缀：${label}`);
  return `ch${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}${m[3]}`;
}

/** 台词 id：`<sceneId>.l<行号>`，行号是台词表里那一列，从 1 开始 */
export function lineId(id: string, row: number): string {
  if (!Number.isInteger(row) || row < 1) throw new Error("台词序号必须为正整数");
  return `${id}.l${row}`;
}

/** 选项 id：`<sceneId>.c<字母>`，字母是选项表的第一列 */
export function choiceId(id: string, key: string): string {
  if (!/^[A-Z]$/.test(key)) throw new Error("选项编号必须为大写字母");
  return `${id}.c${key}`;
}

// ------------------------------------------------------------------ 表达式

/**
 * 条件表达式。`cai >= 6 且 flag.took_seal 且 非 flag.refused_marriage`
 * 转成 `{ cai: { gte: 6 }, "flag.took_seal": true, "flag.refused_marriage": false }`
 *
 * 认这些写法：`>= <= > < =`、`且`、`非`、`好感.<key>`（转 `affinity.<key>`）。
 * 认不出的一律进 issues，不要猜。
 */
export function parseCondition(text: string): Condition {
  const out: Condition = {};
  if (!text.trim()) return out;
  for (const part of text.split("且").map(x => x.trim())) {
    const flag = /^(非\s+)?(flag\.[a-z][a-z0-9_]*)$/.exec(part);
    if (flag) { put(out, flag[2], !flag[1]); continue; }
    const m = /^(\S+)\s*(>=|<=|>|<|=)\s*(-?\d+(?:\.\d+)?)$/.exec(part);
    if (!m) throw new Error(`不能解析条件：${part}`);
    const k = numericKey(m[1]);
    const op = ({ ">=": "gte", "<=": "lte", ">": "gt", "<": "lt", "=": "eq" } as const)[m[2]];
    const prev = out[k];
    if (prev && typeof prev === "object" && op in prev) throw new Error(`重复条件：${part}`);
    out[k] = { ...(typeof prev === "object" ? prev : {}), [op]: Number(m[3]) };
  }
  return out;
}
function numericKey(key: string): string {
  key = key.replace(/^好感\./, "affinity.");
  if (/^(shi|ming|cai|xin)$/.test(key)) return key;
  if (key.startsWith("affinity.") && (CHARACTER_KEYS as readonly string[]).includes(key.slice(9))) return key;
  throw new Error(`未知数值或角色：${key}`);
}
function put(obj: Record<string, any>, key: string, value: any) {
  if (Object.hasOwn(obj, key)) throw new Error(`重复键：${key}`);
  obj[key] = value;
}

/**
 * 效果表达式。`cai +2, ming +1, flag.took_seal = 真`
 * 转成 `{ cai: 2, ming: 1, "flag.took_seal": true }`
 *
 * 数值键是增量，可以为负；flag 键是绝对值，`真`/`假`。
 */
export function parseEffects(text: string): Record<string, number | boolean> {
  const out: Record<string, number | boolean> = {};
  if (!text.trim()) return out;
  for (const part of text.split(/[,，]/).map(x => x.trim())) {
    const flag = /^(flag\.[a-z][a-z0-9_]*)\s*=\s*(真|假)$/.exec(part);
    if (flag) { put(out, flag[1], flag[2] === "真"); continue; }
    const m = /^(\S+)\s+([+-]\d+(?:\.\d+)?)$/.exec(part);
    if (!m) throw new Error(`不能解析效果：${part}`);
    put(out, numericKey(m[1]), Number(m[2]));
  }
  return out;
}

// -------------------------------------------------------------------- 主入口

/** 解析一份 markdown。不写文件，只返回结果，这样才好测。 */
export function convert(markdown: string, file: string): ConvertResult {
  return convertBatch([{ markdown, file }]);
}

/**
 * 写盘。scenes 按章分目录；poems/duels/endings 合并数组，letters 一封一文件。
 * 有 issues 时照样写出已经转成功的部分，同时生成 convert-issues.md，
 * 让人能一边修 markdown 一边看到进度，而不是全有或全无。
 */
/**
 * @param replace 这一批的输入是否已经覆盖了上一批。是的话 poems/duels/endings
 *   直接按本批重写，把改过 id 或删掉的条目清出去；否则只合并，免得只转一份文件
 *   就把别处来的条目冲掉。判断在 runCli 里做，靠 manifest 记的输入清单。
 */
/**
 * 一个场景或一封信写在哪。写盘和清理陈旧文件共用这一条规则，
 * 两边各写一遍的话，删的和写的迟早对不上。
 */
export function outputPathFor(id: string, outDir: string): string {
  if (id.startsWith("lt_")) return join(outDir, "letters", `${id}.json`);
  const chapter = /^ch(\d+)/.exec(id)?.[1];
  if (!chapter) throw new Error(`认不出这是第几章的东西：${id}`);
  return join(outDir, "chapters", `ch${chapter}`, `${id}.json`);
}

export function writeOut(r: ConvertResult, outDir: string, replace = false): void {
  const write = (path: string, value: unknown) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf8");
  };
  for (const s of r.scenes) write(outputPathFor(s.id, outDir), s);
  // Runtime loader expects one object per letter in letters/, not an array.
  for (const l of r.letters) write(outputPathFor(l.id, outDir), l);
  for (const group of ["poems", "duels", "endings"] as const) {
    if (!r[group].length) continue;
    const path = join(outDir, `${group}.json`);
    const old = replace ? [] : existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : [];
    const key = group === "endings" ? "key" : "id";
    const merged = new Map(old.map((x: any) => [x[key], x]));
    for (const x of r[group]) merged.set((x as any)[key], x);
    write(path, group === "endings" ? r.endings : [...merged.values()]);
  }
}

/** 取 zod 对象的字段表；superRefine 包了一层，要先剥开 */
function shapeOf(schema: unknown): Record<string, unknown> {
  const s = schema as any;
  try { return s?.innerType?.()?.shape ?? s?.shape ?? {}; } catch { return {}; }
}
/**
 * schema 跟上没有。跟上了才写那个字段，没跟上就报一条接口问题、并且不输出这个对象——
 * 硬塞一个引擎不认的字段，等于把"这段信文读不到"变成没人发现的事。
 */
const SCHEMA_HAS = {
  interceptAt: "interceptAt" in shapeOf(Letter),                              // D-039
  letterPages: "pages" in shapeOf(shapeOf(Letter).body),                      // D-044
  dressing: "dressing" in shapeOf(Scene),                                     // D-046
  chapterEndChoice: Choice.safeParse({ id: "x", text: "y" }).success,         // D-043
};

/** 说话人允许的取值：十个冻结角色，加主角内心与旁白 */
const SPEAKERS = new Set<string>([...CHARACTER_KEYS, "self", "narr"]);
/** 认不出的角色 key：可能是新批准的角色还没进枚举，也可能是笔误。两条路都写出来 */
function unknownCharacter(key: string, where: string): string {
  return `${where}的角色 key「${key}」不在 D-016 冻结的十个里。若这是指挥日志新批准的角色，要 CC1 先加进 src/engine/schema.ts 的 CHARACTER_KEYS 和角色表；若是笔误，请 ChatGPT 改原文。在那之前这一场不输出`;
}

// ------------------------------------------------------------ Markdown reader
interface Row { cells: string[]; line: number; raw: string }
interface Table { header: string[]; rows: Row[]; line: number }
interface Block { heading: string; line: number; file: string; tables: Table[]; prose: Row[] }
const registry = JSON.parse(readFileSync(new URL("./convert-ids.json", import.meta.url), "utf8").replace(/^\uFEFF/, ""));
const list = (s: string) => s.split(/[,，、]/).map(x => x.trim()).filter(Boolean);
const plainTitle = (s: string) => s.replace(/（[^）]*）/g, "");
const stableId = (prefix: string, value: string) => `${prefix}_${createHash("sha256").update(value).digest("hex").slice(0, 16)}`;
function poemId(author: string, title: string): string {
  return registry.poems.find((p: any) => p.author === plainTitle(author) && p.title === plainTitle(title))?.id
    ?? stableId("poem", `${author}\n${title}`);
}

/** Escaped pipes and backslashes are decoded once; commas inside dialogue stay intact. */
export function tableCells(raw: string): string[] {
  const text = raw.trim();
  if (!text.startsWith("|") || !text.endsWith("|")) throw new Error("表格行须以竖线开始和结束");
  const out: string[] = []; let cell = "";
  for (let i = 1; i < text.length - 1; i++) {
    const ch = text[i];
    if (ch === "\\" && /[\\|]/.test(text[i + 1] ?? "")) { cell += text[++i]; continue; }
    if (ch === "|") { out.push(cell.trim()); cell = ""; } else cell += ch;
  }
  out.push(cell.trim());
  return out;
}
function readBlocks(markdown: string, file: string, issues: ConvertIssue[]): Block[] {
  const blocks: Block[] = [];
  let block: Block = { heading: "", line: 1, file, tables: [], prose: [] };
  blocks.push(block);
  const lines = markdown.replace(/^\uFEFF/, "").split(/\r?\n/);
  let fence = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (/^\s*```/.test(raw)) { fence = !fence; continue; }
    if (fence) continue;
    const h = /^#{1,6}\s+(.+)$/.exec(raw);
    if (h) { block = { heading: h[1], line: i + 1, file, tables: [], prose: [] }; blocks.push(block); continue; }
    if (!raw.trim().startsWith("|")) { if (raw.trim()) block.prose.push({ cells: [], line: i + 1, raw }); continue; }
    try {
      const header = tableCells(raw);
      const sep = tableCells(lines[i + 1] ?? "");
      if (sep.length !== header.length || !sep.every(c => /^:?-{3,}:?$/.test(c))) throw new Error("缺少匹配表头的 Markdown 分隔行");
      const t: Table = { header, rows: [], line: i + 1 }; block.tables.push(t); i++;
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith("|")) {
        i++;
        try {
          const cells = tableCells(lines[i]);
          if (cells.length !== header.length) throw new Error(`应有 ${header.length} 列，实际 ${cells.length} 列；正文竖线请写 \\|`);
          t.rows.push({ cells, line: i + 1, raw: lines[i] });
        } catch (e) { issues.push({ file, line: i + 1, excerpt: lines[i], message: String(e) }); }
      }
    } catch (e) { issues.push({ file, line: i + 1, excerpt: raw, message: String(e) }); }
  }
  return blocks;
}
function fields(b: Block): Record<string, Row> {
  const out: Record<string, Row> = {};
  for (const t of b.tables.filter(t => t.header[0] === "字段")) {
    for (const row of t.rows) {
      if (out[row.cells[0]]) throw new LocatedError(row, `重复字段：${row.cells[0]}`);
      out[row.cells[0]] = row;
    }
  }
  return out;
}
class LocatedError extends Error {
  row: Row;
  constructor(row: Row, message: string) { super(message); this.row = row; }
}
function yes(s: string): boolean {
  if (s === "是") return true;
  if (s === "否" || s === "") return false;
  throw new Error(`应填是、否或留空：${s}`);
}
function integer(s: string): number {
  if (!/^\d+$/.test(s)) throw new Error(`应为整数：${s}`);
  return Number(s);
}
const LINE_COLUMNS = ["#", "说话人", "表情", "类型", "台词"] as const;
/**
 * 台词表：五列基本表，或按 D-026 多一列「条件」。
 *
 * 取值按列名，不按位置：story-schema 1.3 把「条件」写在「台词」之前，
 * 第一章的 C-3 写在最后，两种都得认，否则不是第一章断就是第二章断。
 * 列名认不出来才报错——那说明真的写错了，不是排法不同。
 */
function lineTable(b: Block): { table: Table; at: (row: Row, name: string) => string } {
  const ok = (t: Table) => {
    const names = new Set(t.header);
    return names.size === t.header.length && LINE_COLUMNS.every(c => names.has(c)) &&
      [...names].every(c => (LINE_COLUMNS as readonly string[]).includes(c) || c === "条件");
  };
  const table = b.tables.find(ok);
  if (table) {
    const index = new Map(table.header.map((name, i) => [name, i]));
    return { table, at: (row, name) => (index.has(name) ? row.cells[index.get(name)!] : "") };
  }
  const near = b.tables.find(t => t.header[0] === "#" && t.header.includes("台词"));
  if (near) throw new Error(`台词表列名不合规范：要有且只有「# | 说话人 | 表情 | 类型 | 台词」，可另加一列「条件」（D-026）；实际「${near.header.join(" | ")}」`);
  throw new Error("缺少规范台词表（# | 说话人 | 表情 | 类型 | 条件 | 台词）。承接段正文请按 D-026 合并进本表，用「条件」列标条件");
}
type ZodLike = { issues: { path: (string | number)[]; message: string }[] };
/** 把 zod 的报错压成一行给人看，不要整段 JSON；常见的英文数值报错顺手译成中文。 */
function zodMessage(e: ZodLike): string {
  const cn = (m: string) => m
    .replace(/^Number must be greater than or equal to (\S+)$/, "须 ≥ $1")
    .replace(/^Number must be less than or equal to (\S+)$/, "须 ≤ $1")
    .replace(/^String must contain at most (\d+) character\(s\)$/, "最多 $1 字")
    .replace(/^String must contain at least (\d+) character\(s\)$/, "至少 $1 字")
    .replace(/^Array must contain exactly (\d+) element\(s\)$/, "须恰有 $1 项")
    .replace(/^Required$/, "缺少此字段");
  return e.issues.map(i => (i.path.length ? `${i.path.join(".")}：` : "") + cn(i.message)).join("；");
}
/** 对局 id：`pd-01` → `pd_01`。只认这一种写法。 */
function duelIdOf(s: string): string {
  const id = s.trim().replace(/-/g, "_");
  if (!/^pd_[a-z0-9_]+$/.test(id)) throw new Error(`对诗 id 须为 pd-01 这类写法：${s}`);
  return id;
}
/**
 * 各类「字段 | 值」表认得的字段名。
 *
 * 认不出的字段一律报问题，不静默丢：新机制（比如 D-035 的双鲤折法）要是只在
 * markdown 里多写一行，而转换器默默忽略，那这件事就从剧本里消失了，谁也不会发现。
 * 剧作自查用的那几行（进场想要、阻碍……）是明知故不转，列在这里免得天天报。
 */
const KNOWN_FIELDS: Record<string, { data: string[]; notes?: string[] }> = {
  场景: {
    data: ["章", "幕", "地点 key", "色板", "在场", "进入条件", "无用场景", "一句话目的", "去向", "章末", "布置", "留信", "对诗", "终局判定", "结局", "BGM"],
    notes: ["进场想要", "阻碍", "行动", "翻转", "出场所知"],
  },
  信: { data: ["发信人", "触发", "延迟分钟", "节气", "笺", "明面", "引诗", "引诗要说的", "空白", "她可能不回", "会被截", "被截去向", "截获场景"] },
  对诗: { data: ["出句", "出处", "难度", "题面", "给玩家的题面", "判题重点", "正确答案"] },
  结局: { data: ["结局 key", "标题", "判定", "色板", "主题", "正文", "正文 · 天", "正文 · 曌", "正文 · 不改", "结局卡"] },
};

/**
 * 各类块认得的表。认不出的表要报出来：C-8 的沈衡信多了一张「附页 | 条件 | 正文」，
 * 那是七段按 flag 分岔的信文，schema 的 body.surface 只装得下一段。
 * 静默丢掉的话，这封信会"转换成功"，而玩家永远读不到那七段。
 */
const KNOWN_TABLES: Record<string, string[]> = {
  场景: ["字段|值", "#|选项文本|需要|效果|去向|备注"],
  信: ["字段|值", "回信|内容|效果|去向", "回信|她的反应", "附页|条件|正文", "附页|条件|正文|宣读"],
  对诗: ["字段|值", "选项|对句|对错|为什么", "结果|效果|去向", "结果|效果|去向|她说", "结果|效果|去向|台词"],
  结局: ["字段|值"],
};

/** 问题分类：给人分拣用。规则以关键词为准，写问题文案时要带上这些词。 */
export type IssueKind = "ChatGPT 格式" | "CC1 接口" | "待交付";
export function classify(message: string): IssueKind {
  if (/CC1|架构方|schema/.test(message)) return "CC1 接口";
  if (/待交|未交付|尚未交付|一同转换/.test(message)) return "待交付";
  return "ChatGPT 格式";
}

/** Batch parsing resolves forward and cross-file references without filesystem-dependent guesses. */
export function convertBatch(inputs: { markdown: string; file: string }[]): ConvertResult {
  const result: ConvertResult = { scenes: [], poems: [], duels: [], letters: [], endings: [], issues: [] };
  const blocks = inputs.flatMap(i => readBlocks(i.markdown, i.file, result.issues));
  const blockEnd = (b: Block) => blocks.find(x => x.file === b.file && x.line > b.line)?.line ?? Infinity;
  const blockHasErrors = (b: Block) => result.issues.some(i => i.file === b.file && i.line >= b.line && i.line < blockEnd(b));
  const sceneRefs = new Map<string, string>();
  const seen = new Set<string>();
  const addIssue = (b: Block, row: Row | undefined, message: string, kind?: IssueKind) =>
    result.issues.push({ file: b.file, line: row?.line ?? b.line, excerpt: row?.raw ?? b.heading, message, ...(kind ? { kind } : {}) });
  const attempt = <T>(b: Block, row: Row | undefined, fn: () => T): T | undefined => {
    try { return fn(); } catch (e) { addIssue(b, e instanceof LocatedError ? e.row : row, (e as Error).message); return undefined; }
  };
  /**
   * 过一遍 schema。每条 zod 报错单独成一条问题，并尽量定位到出错字段所在的 markdown 行
   * （rowFor 按 zod path 找行），找不到才落在表头。
   */
  const take = <T>(b: Block, row: Row | undefined, schema: { safeParse(x: unknown): { success: true; data: T } | { success: false; error: ZodLike } }, value: unknown,
    rowFor?: (path: (string | number)[]) => Row | undefined,
    /** 已知边界的字段：补一句怎么改，并钉死这条归谁 */
    noteFor?: (path: (string | number)[]) => { text: string; kind: IssueKind } | undefined): T | undefined => {
    const r = schema.safeParse(value);
    if (r.success) return r.data;
    for (const i of r.error.issues) {
      const note = noteFor?.(i.path);
      addIssue(b, rowFor?.(i.path) ?? row, zodMessage({ issues: [i] }) + (note ? `；${note.text}` : ""), note?.kind);
    }
    return undefined;
  };
  const unique = (kind: string, id: string) => { const key = `${kind}:${id}`; if (seen.has(key)) throw new Error(`重复 ${kind} id：${id}`); seen.add(key); };
  for (const b of blocks) {
    if (/进入条件[：:]/.test(b.heading)) addIssue(b, undefined, "承接段写法已废（D-026）：请把这段台词并入本场唯一的台词表，末尾加一列「条件」写入场条件（如 flag.trial_recopy），条件行与无条件行按顺序混排");
    if (!/^(场景 |对诗\s|第[一二三四五六七八九十\d]+局\s|信\s)/.test(b.heading) && b.tables.some(t => t.header[0] === "#" && t.header.includes("台词"))) {
      addIssue(b, undefined, "台词表不在场景表之下，不能确定它属于哪一场；请按 D-026 并入所属场景的台词表");
    }
  }
  /** 场景表「对诗」一行：sceneId -> 对局 id。对局块没写 id 时就用它。 */
  const declaredDuels = new Map<string, { id: string; row: Row }>();
  /**
   * 大纲的场次索引：场次 -> 地点 key。大纲（C-1、C-6 这类）有一张总表，
   * 每行一场，写着地点 key。正文分批交付时，前一批的末场会指向后一批的场次，
   * 那时全文还没有，但大纲已经写明了地点 key——用它接上，比丢掉一整场正文强。
   * 这不是猜：来源是已审过的大纲，而且每用一次都记一条问题，C-8 到了必须重跑确认。
   */
  const outline = new Map<string, { key: string; block: Block; row: Row }>();
  for (const b of blocks) for (const t of b.tables) {
    const title = t.header.indexOf("场景标题"), place = t.header.indexOf("地点 key");
    if (title < 0 || place < 0) continue;
    for (const row of t.rows) {
      try { const label = sceneLabel(row.cells[title]); if (!outline.has(label)) outline.set(label, { key: row.cells[place], block: b, row }); }
      catch { /* 大纲里夹着的说明行不是场次，跳过就好 */ }
    }
  }
  /** 这一批里靠大纲接上的前向去向，最后每个记一条问题 */
  const fromOutline = new Map<string, { id: string; block: Block; row: Row }>();
  for (const b of blocks.filter(b => b.heading.startsWith("场景 "))) {
    attempt(b, undefined, () => {
      const f = fields(b); const label = sceneLabel(b.heading.slice(3));
      if (sceneRefs.has(label)) throw new Error(`同一场景表出现两次：${label}`);
      const id = sceneId(label, f["地点 key"]?.cells[1] ?? "");
      sceneRefs.set(label, id);
      if (f["对诗"]?.cells[1]) attempt(b, f["对诗"], () => declaredDuels.set(id, { id: duelIdOf(f["对诗"].cells[1]), row: f["对诗"] }));
    });
  }
  const ref = (value: string): string => {
    // 选项的去向写「章末」：选完这一句就该出结算页。现在 schema 既不许章末场带选项，
    // 选项本身又必须有去向，两头都堵着，只能等 CC1 定（建议：章末场允许带选项，选项的去向可空）。
    if (value.trim() === "章末") throw new Error("选项的去向写的是「章末」：这一场要先让玩家选（各自记 flag），再出章末结算页。现在 schema 不许章末场带选项，Choice.goto 也不能空，两条都要 CC1 松一处才转得了（D-039 只定了场景级的章末＋去向）");
    // 「第二章（待交）」这类占位不是错字，是下一章还没交；单独说清楚，别混进格式错误里。
    if (/待交/.test(value)) throw new Error(`去向标为待交：${value}。章末出口已由 D-034 定为 chapterEnd，请把「去向」改填「章末」；转换器不替原文改`);
    const key = sceneLabel(value);
    // References must be a bare scene label, never a Chinese title or prose suffix.
    if (value.trim() !== /^ch\d+-\d+[a-z]*/.exec(value.trim())?.[0]) throw new Error(`去向只能填写场次：${value}`);
    const id = sceneRefs.get(key);
    if (id) return id;
    // 同章后面的场次还没交（第二章 13+ 在 C-8），这是排期，不是写错。
    // 大纲写明了地点 key 就照它接上并记一条；大纲也没有才停下，不猜 id、不补空场景。
    const planned = outline.get(key);
    if (planned) {
      const forward = sceneId(key, planned.key);
      if (!fromOutline.has(key)) fromOutline.set(key, { id: forward, block: planned.block, row: planned.row });
      return forward;
    }
    throw new Error(`去向 ${value} 的场景全文尚未交付，大纲里也没有它的地点 key，取不到 id；本场暂不输出，那一批交了重跑即可`);
  };
  // Poem library is independent of input file ordering.
  for (const b of blocks) for (const t of b.tables.filter(t => t.header.includes("完整原文（／换行）"))) {
    for (const row of t.rows) attempt(b, row, () => {
      const get = (key: string) => row.cells[t.header.indexOf(key)] ?? "";
      const title = get("题名"), author = get("作者"), id = poemId(author, title);
      unique("poem", id);
      const source = /^\[([^\]]+)\]\((.+)\)$/.exec(get("出处"));
      const value = { id, title, author, lines: get("完整原文（／换行）").split("／"), source: source?.[1] ?? get("出处"),
        ...(source ? { sourceUrl: source[2] } : {}), tags: list(get("意象标签")), mood: list(get("情绪")),
        occasion: get("适合场合（设）"), difficulty: integer(get("难度")) };
      result.poems.push(Poem.parse(value));
    });
  }
  const poemRef = (source: string): string => {
    const m = /^([^《]+)《([^》]+)》/.exec(source);
    if (!m) throw new Error(`诗词出处须为作者《题名》：${source}`);
    const id = poemId(m[1], m[2]);
    if (!result.poems.some(p => p.id === id) && !registry.poems.some((p: any) => p.id === id)) throw new Error(`诗词引用不在本批诗库或冻结 id 表中：${source}`);
    return id;
  };
  /** 字段表里认不出的行：报出来，绝不静默丢。见 KNOWN_FIELDS 的说明 */
  const checkFields = (b: Block, kind: keyof typeof KNOWN_FIELDS, f: Record<string, Row>) => {
    const known = KNOWN_FIELDS[kind];
    for (const [name, row] of Object.entries(f)) {
      if (known.data.includes(name) || known.notes?.includes(name)) continue;
      addIssue(b, row, `${kind}的字段表里有认不出的一行「${name}」：转换器不会静默丢掉它。若是新机制（例如双鲤折法这类 D-035 的东西）要先定 schema 字段；若是笔误或改了名，请改原文`, "ChatGPT 格式");
    }
  };
  /** 认不出的整张表：同样不静默丢。台词表列名另有 lineTable() 把关 */
  const checkTables = (b: Block, kind: keyof typeof KNOWN_TABLES) => {
    for (const t of b.tables) {
      const head = t.header.join("|");
      if (KNOWN_TABLES[kind].includes(head)) continue;
      if (kind === "场景" && t.header.includes("台词")) continue;   // 台词表由 lineTable() 认
      addIssue(b, t.rows[0], `${kind}里有一张认不出的表「${t.header.join(" | ")}」：转换器读不了，也不会假装它不存在。这多半是个新机制，需要先定 schema 字段（找 CC1）；若只是格式写岔了请改原文`, "CC1 接口");
    }
  };

  // Duels are compiled before scenes so the source scene can reference its duel.
  const boundDuels = new Map<string, string>();
  for (const b of blocks.filter(b => /^(对诗\s|第[一二三四五六七八九十\d]+局\s)/.test(b.heading))) attempt(b, undefined, () => {
    const f = fields(b); const v = (k: string) => f[k]?.cells[1] ?? "";
    checkFields(b, "对诗", f); checkTables(b, "对诗");
    const base = registry.duels.find((d: any) => d.prompt === v("出句"));
    const binding = /场景\s+(ch\d+-\d+[a-z]*)/.exec(b.heading);
    const bound = binding ? ref(binding[1]) : undefined;
    const explicit = /^对诗\s+(pd[-_][a-zA-Z0-9_-]+)/.exec(b.heading)?.[1].replace(/-/g, "_");
    const title = b.heading.match(/局\s*·\s*(.+)$/)?.[1] ?? base?.title;
    if (!title) throw new Error("对诗缺少标题，且无法匹配冻结题库");
    // id 取法：表头写了就用表头；没写就用所绑场景表「对诗」一行；都没有才按场景 id 或题库生成。
    const declared = bound ? declaredDuels.get(bound)?.id : undefined;
    if (explicit && declared && explicit !== declared) throw new Error(`对诗表头 id ${explicit} 与场景表「对诗」${declared} 不一致，以哪个为准请改原文`);
    const id = explicit ?? declared ?? (bound ? `pd_${bound}` : base?.id ?? stableId("pd", title));
    unique("duel", id);
    const t = b.tables.find(t => t.header.join("|") === "选项|对句|对错|为什么");
    if (!t) throw new Error("缺少对句选项表");
    const keys = new Set<string>();
    const options = t.rows.map(row => {
      const [key, text, correct, why] = row.cells;
      if (keys.has(key)) throw new LocatedError(row, `重复对诗选项：${key}`); keys.add(key);
      if (!/^[A-D]$/.test(key) || !["对", "错"].includes(correct)) throw new LocatedError(row, "对诗选项须 A–D，对错须填对或错");
      return { key, text, correct: correct === "对", why };
    });
    if (v("正确答案") && options.find(o => o.correct)?.key !== v("正确答案")) throw new LocatedError(f["正确答案"], "正确答案与选项表冲突");
    const value: any = { id, title, prompt: v("出句"), poemRef: poemRef(v("出处")), brief: v("题面") || v("给玩家的题面"), judgingFocus: v("判题重点"), difficulty: integer(v("难度")), options };
    if (bound) { value.sceneId = bound; value.opponent = /对手\s+(\w+)/.exec(b.heading)?.[1]; }
    const results = b.tables.find(t => t.header[0] === "结果");
    // 第四列 story-schema 1.5 叫「她说」，C-2 写的是「台词」。两个名字都认，不因为列名退回原文。
    if (results && !["结果|效果|去向", "结果|效果|去向|她说", "结果|效果|去向|台词"].includes(results.header.join("|"))) {
      throw new LocatedError(results.rows[0] ?? t.rows[0], "结果表列应为「结果 | 效果 | 去向」，可加第四列「她说」（D-026 胜负专属一句）");
    }
    for (const row of results?.rows ?? []) {
      const [name, effects, dest, say = ""] = row.cells;
      if (!["赢", "输"].includes(name)) throw new LocatedError(row, "结果须为赢或输");
      const key = name === "赢" ? "onWin" : "onLose";
      if (value[key]) throw new LocatedError(row, `重复结果：${name}`);
      value[key] = { effects: parseEffects(effects), ...(dest ? { goto: ref(dest) } : {}) };
      if (say.trim()) {
        // D-026 胜负专属一句。写法 `角色key：台词`（story-schema 1.5）；只写台词时说话人取表头的对手。
        // 两种写法都不从中文名猜 key。
        const m = /^([a-z][a-z0-9_]*)\s*[：:]\s*(.+)$/s.exec(say.trim());
        const who = m?.[1] ?? value.opponent;
        if (!who) throw new LocatedError(row, "胜负台词要写成「角色key：台词」，或在对诗表头写「对手 <角色key>」");
        const line = { id: `${id}.${name === "赢" ? "win" : "lose"}`, who, kind: "say", text: (m?.[2] ?? say).trim() };
        const checked = Line.safeParse(line);
        if (!checked.success) throw new LocatedError(row, zodMessage(checked.error));
        value[key].line = line;
      }
    }
    const parsed: any = take(b, t.rows[0], PoemDuel, value, path => path[0] === "onWin" || path[0] === "onLose" ? results?.rows.find(r => r.cells[0] === (path[0] === "onWin" ? "赢" : "输")) : undefined);
    if (parsed && !blockHasErrors(b)) {
      // onWin/onLose.line 由 schema 收录（D-026）；万一 schema 回退成剥掉未知键的版本，按原位补回。
      for (const key of ["onWin", "onLose"]) if (value[key]?.line && !parsed[key]?.line) parsed[key].line = value[key].line;
      result.duels.push(parsed); if (bound) boundDuels.set(bound, id);
    }
    if (!value.onWin?.line && !value.onLose?.line) for (const row of b.prose.filter(r => r.raw.startsWith("胜负反馈文案"))) {
      addIssue(b, row, "胜负反馈写成了散文，转换器不从中文名猜说话人；请改成结果表第四列「台词」，赢、输各一句（D-026）");
    }
  });
  for (const b of blocks.filter(b => b.heading.startsWith("场景 "))) attempt(b, undefined, () => {
    const f = fields(b); const v = (k: string) => f[k]?.cells[1] ?? "";
    checkFields(b, "场景", f); checkTables(b, "场景");
    for (const who of list(v("在场"))) if (!(CHARACTER_KEYS as readonly string[]).includes(who)) throw new LocatedError(f["在场"], unknownCharacter(who, "在场"));
    const id = sceneId(b.heading.slice(3), v("地点 key")); unique("scene", id);
    const value: any = { id, chapter: integer(v("章")), act: integer(v("幕")), scene: v("地点 key"), palette: v("色板"), cast: list(v("在场")),
      require: attempt(b, f["进入条件"], () => parseCondition(v("进入条件"))), weightless: yes(v("无用场景")), leavesLetter: list(v("留信")), purpose: v("一句话目的"), lines: [] };
    if (!v("进入条件")) delete value.require;
    if (Number(/ch(\d+)/.exec(id)![1]) !== value.chapter) throw new Error("表头章号与章字段不一致");
    for (const key of ["章", "幕", "地点 key", "色板", "在场", "无用场景", "一句话目的"]) if (!f[key]) throw new Error(`缺少字段：${key}`);
    if (v("BGM")) value.bgm = v("BGM");
    if (v("终局判定")) value.judgeEnding = yes(v("终局判定"));
    if (v("结局")) value.ending = v("结局");
    const lt = lineTable(b);
    for (const row of lt.table.rows) attempt(b, row, () => {
      const cell = (name: string) => lt.at(row, name);
      const [n, who, expr, kind, text, cond] = [cell("#"), cell("说话人"), cell("表情"), cell("类型"), cell("台词"), cell("条件")];
      const number = integer(n); const lid = lineId(id, number); unique("line", lid);
      if (number !== value.lines.length + 1) throw new Error("台词序号须从 1 连续递增");
      const mapped = ({ 说: "say", 内心: "inner", 旁白: "aside", 诗: "poem" } as Record<string, string>)[kind];
      if (!mapped) throw new Error(`未知台词类型：${kind}`);
      if (!SPEAKERS.has(who)) throw new Error(unknownCharacter(who, "说话人"));
      const line: any = { id: lid, who, ...(expr ? { expr } : {}), kind: mapped, text };
      // Validate each line at its own source row for precise diagnostics.
      const checked = Line.safeParse(line);
      if (!checked.success) throw new Error(zodMessage(checked.error));
      // D-026：「条件」列 -> Line.when。空 = 总是播放。写法同选项表「需要」列。
      if (cond.trim()) line.when = parseCondition(cond);
      value.lines.push(line);
    });
    // 先看这一场是不是章末：选项去向写「章末」时要对得上（D-043）
    const chapterEndHere = v("去向").trim() === "章末" || (!!v("章末") && attempt(b, f["章末"], () => yes(v("章末"))) === true);
    const choices = b.tables.find(t => t.header.join("|") === "#|选项文本|需要|效果|去向|备注");
    if (choices) value.choices = choices.rows.map(row => attempt(b, row, () => {
      const [key, text, require, effects, dest, note] = row.cells;
      const cid = choiceId(id, key); unique("choice", cid);
      // D-043：去向写「章末」= 结算这个选项的效果，然后出章末结算页，再走场景级的去向
      // 去向空着：要么忘了填，要么本意是"选完就进章末结算页"——后者按 D-043 要写「章末」两个字
      if (!dest.trim()) throw new LocatedError(row, chapterEndHere
        ? "选项的去向空着。这一场标了章末，若本意是选完就出结算页，请按 D-043 在去向里写「章末」两个字；空格子看不出是本意还是漏填"
        : "选项的去向空着：每个选项都要写去向，否则玩家选完不知道去哪");
      if (dest.trim() === "章末") {
        if (!SCHEMA_HAS.chapterEndChoice) throw new LocatedError(row, "选项的去向写「章末」（D-043）：效果结算完出章末结算页。schema 还不许 Choice 省略 goto，等 CC1 改完再转");
        if (!chapterEndHere) throw new LocatedError(row, "选项的去向写「章末」，但这一场没标「章末 | 是」。两处要一致（D-043）");
        return { id: cid, text, ...(require ? { require: parseCondition(require) } : {}), effects: parseEffects(effects), irreversible: note.includes("不可逆"),
          ...(note.match(/提示[「“]([^」”]+)[」”]/) ? { lockHint: note.match(/提示[「“]([^」”]+)[」”]/)![1] } : {}) };
      }
      return { id: cid, text, ...(require ? { require: parseCondition(require) } : {}), effects: parseEffects(effects), goto: ref(dest), irreversible: note.includes("不可逆"),
        ...(note.match(/提示[「“]([^」”]+)[」”]/) ? { lockHint: note.match(/提示[「“]([^」”]+)[」”]/)![1] } : {}) };
    })).filter(Boolean);
    // 章末结算页。两种写法：D-034 的「去向 | 章末」，和 D-039 的「章末 | 是」——
    // 后者可以和「去向」并存：先出结算页，翻过去再进下一章第一场。
    else if (v("去向").trim() === "章末") value.chapterEnd = true;
    else if (v("去向")) value.goto = attempt(b, f["去向"], () => ref(v("去向")));
    if (v("章末")) attempt(b, f["章末"], () => { if (yes(v("章末"))) value.chapterEnd = true; });
    // D-046：场景表「布置 | 公议」-> Scene.dressing。哪几场是公议写在剧本里，不写进引擎白名单，
    // 否则改一句标题就悄悄少一排案，而且没有任何东西会报错。
    // schema 没跟上时照常输出这一场，只把布置记一条：丢的是一排道具，戏文一句不少。
    // 为此不能挡住整章——别的地方（信的附页、角色 key）丢的是玩家读不到的正文，那才要拦。
    let dressingNote: string | undefined;
    if (v("布置")) attempt(b, f["布置"], () => {
      const key = ({ 公议: "gongyi" } as Record<string, string>)[v("布置").trim()];
      if (!key) throw new Error(`认不出的布置「${v("布置")}」：现在只有「公议」。要加新的先定 schema 与渲染（D-046）`);
      if (SCHEMA_HAS.dressing) value.dressing = key;
      else dressingNote = "场景表写了「布置 | 公议」，但 schema 还没有 Scene.dressing（D-046）。这一场照常输出，只是暂时不带公议布置；CC1 加上字段后重跑就有了";
    });
    // 对诗出口：场景表「对诗」一行与本场绑定的对局块必须指同一局；对局要真的存在，不猜。
    const declared = declaredDuels.get(id); const bound = boundDuels.get(id);
    if (declared && bound && declared.id !== bound) throw new LocatedError(declared.row, `场景表「对诗」${declared.id} 与本场对诗表头 id ${bound} 不一致`);
    const duel = declared?.id ?? bound;
    if (duel) attempt(b, declared?.row, () => {
      const found = result.duels.find(d => d.id === duel);
      if (!found && !registry.duels.some((d: any) => d.id === duel)) throw new Error(`对诗 ${duel} 不在本批对局或冻结题库中（或该对局转换失败，见其问题）`);
      value.duel = duel;
      const duelOnly = !(value.choices?.length || value.goto || value.ending || value.judgeEnding);
      if (duelOnly && found && !(found.onWin?.goto && found.onLose?.goto)) throw new Error(`本场只有对诗出口，对局 ${duel} 的赢、输两行都必须写去向`);
    });
    const choiceRow = (path: (string | number)[]) => path[0] === "choices" && typeof path[1] === "number" ? choices?.rows[path[1]] : undefined;
    const r = Scene.safeParse(value);
    if (!r.success) {
      // 去向写了但没解析成功（比如「第二章（待交）」）时，原因已经报过；再报一条「没有出口」只是噪音。
      const gotoFailed = !!v("去向") && !value.goto && !value.choices?.length;
      for (const i of r.error.issues) if (!(gotoFailed && /场景没有出口/.test(i.message))) addIssue(b, choiceRow(i.path), zodMessage({ issues: [i] }));
    }
    if (r.success && !blockHasErrors(b)) {
      const parsed: any = r.data;
      // Line.when 由 schema 收录（D-026）；万一 schema 回退成剥掉未知键的版本，这里按原位补回，JSON 里必须有它。
      value.lines.forEach((l: any, i: number) => { if (l.when && !parsed.lines[i].when) parsed.lines[i].when = l.when; });
      result.scenes.push(parsed);
      // 记在这一场输出之后：它是一条提醒，不是挡住这一场的错
      if (dressingNote) addIssue(b, f["布置"], dressingNote, "CC1 接口");
    }
  });
  /** 所有试过转换的信（含失败的），留信核对时用来区分「没交信」和「信交了但没转过」 */
  const letterAttempts: { id: string; from: string; sceneId?: string }[] = [];
  for (const b of blocks.filter(b => /^信\s/.test(b.heading))) attempt(b, undefined, () => {
    const f = fields(b); const v = (k: string) => f[k]?.cells[1] ?? "";
    checkFields(b, "信", f); checkTables(b, "信");
    const id = b.heading.slice(2).trim().replace(/-/g, "_");
    if (!/^lt_[a-z0-9_]+$/.test(id)) throw new Error("信件表头须为 lt-ch01-shenheng-01 格式");
    unique("letter", id);
    const trigger = /^场景\s+(ch\d+-\d+[a-z]*)\s+之后第\s*(\d+)\s*场$/.exec(v("触发"));
    letterAttempts.push({ id, from: v("发信人"), sceneId: trigger ? attempt(b, f["触发"], () => ref(trigger[1])) : undefined });
    const term = ({ 上元: "shangyuan", 寒食: "hanshi", 七夕: "qixi", 中秋: "zhongqiu" } as Record<string,string>)[v("节气")];
    if (v("节气") && !term) throw new LocatedError(f["节气"], "未知节气");
    if (!term && !trigger) throw new LocatedError(f["触发"], "触发须写场景 ch01-06 之后第 3 场");
    const paper = ({ 黄麻纸: "huangma", 秘书省黄麻纸: "huangma", 军中素笺: "junzhong", 泥金笺: "nijin", 自制花笺: "huajian", 常笺: "chang" } as Record<string,string>)[v("笺")];
    const reactions = new Map<string, string>();
    const replyKeys = ["直言 A", "直言 B", "直言 C", "以诗代答 · 合意象", "以诗代答 · 不合", "不回"];
    for (const row of b.tables.find(t => t.header.join("|") === "回信|她的反应")?.rows ?? []) {
      if (reactions.has(row.cells[0]) || !replyKeys.includes(row.cells[0])) throw new LocatedError(row, `重复或未知反应：${row.cells[0]}`);
      reactions.set(row.cells[0], row.cells[1]);
    }
    const replies: Record<string, any> = {};
    for (const row of b.tables.find(t => t.header.join("|") === "回信|内容|效果|去向")?.rows ?? []) {
      const [key, text, effects, dest] = row.cells;
      if (!replyKeys.includes(key)) throw new LocatedError(row, `未知回信：${key}`);
      if (replies[key]) throw new LocatedError(row, `重复回信：${key}`);
      if (!reactions.has(key)) throw new LocatedError(row, `缺少她的反应：${key}`);
      replies[key] = { text, effects: parseEffects(effects), reaction: reactions.get(key), ...(dest ? { goto: ref(dest) } : {}) };
    }
    const outcome = (key: string) => { if (!replies[key]) throw new Error(`缺少回信：${key}`); const { text, ...o } = replies[key]; return o; };
    // D-044：附页表 = 同一封信在不同路线上的正文。顺序即表格顺序，条件空 = 总是出现。
    // 「宣读」空或「是」= 被截宣读时当众念出来；「否」= 只有私下读信才看得见。
    const pageTable = b.tables.find(t => ["附页|条件|正文", "附页|条件|正文|宣读"].includes(t.header.join("|")));
    const pages = pageTable?.rows.map(row => {
      const [key, when, text, aloud = ""] = row.cells;
      if (!key.trim() || !text.trim()) throw new LocatedError(row, "附页要有名目和正文");
      const readAloud = aloud.trim() === "" ? true : yes(aloud.trim());
      const cond = when.trim() ? (() => { try { return parseCondition(when); } catch (e) { throw new LocatedError(row, (e as Error).message); } })() : undefined;
      return { key: key.trim(), ...(cond ? { when: cond } : {}), text: text.trim(), readAloud };
    });
    if (pages?.length && !SCHEMA_HAS.letterPages) {
      throw new Error("这封信有分条件的附页（D-044 的 Letter.body.pages），schema 还没有这个字段。不输出——七段正文只留一段，等于把玩家读不到的东西说成已经转好了。等 CC1 加上再转");
    }
    const quote = v("引诗").split(/\s*·\s*/);
    if (quote.length !== 2) throw new LocatedError(f["引诗"], "引诗须写作者《题名》· 诗句");
    const mayNot = attempt(b, f["她可能不回"], () => parseCondition(v("她可能不回")));
    const value = { id, from: v("发信人"), trigger: term ? { kind: "solarTerm", term } : { kind: "scene", sceneId: ref(trigger![1]), afterScenes: Number(trigger![2]) },
      delayMinutes: integer(v("延迟分钟")), paper, body: { surface: v("明面"), poem: { ref: poemRef(quote[0]), line: quote[1] }, poemMeans: v("引诗要说的"), blank: v("空白"), ...(pages?.length ? { pages } : {}) },
      ...(mayNot && Object.keys(mayNot).length ? { sheMayNotReply: mayNot } : {}), interceptable: yes(v("会被截")), ...(v("被截去向") ? { onIntercept: { goto: ref(v("被截去向")) } } : {}),
      ...(v("截获场景") ? { interceptAt: attempt(b, f["截获场景"], () => ref(v("截获场景"))) } : {}),
      replies: { plain: ["A", "B", "C"].map(k => ({ id: `${id}.r${k}`, text: replies[`直言 ${k}`]?.text, ...outcome(`直言 ${k}`) })),
        poem: { resonantTags: list(replies["以诗代答 · 合意象"]?.text ?? ""), onResonant: outcome("以诗代答 · 合意象"), onMismatch: outcome("以诗代答 · 不合") }, silence: outcome("不回") } };
    // zod 报错尽量落到出错字段那一行，人回去改 markdown 才知道改哪里。
    const fieldRow: Record<string, string> = { from: "发信人", trigger: "触发", delayMinutes: "延迟分钟", paper: "笺", sheMayNotReply: "她可能不回", interceptable: "会被截", onIntercept: "被截去向" };
    const bodyRow: Record<string, string> = { surface: "明面", poem: "引诗", poemMeans: "引诗要说的", blank: "空白" };
    const replyTable = b.tables.find(t => t.header.join("|") === "回信|内容|效果|去向");
    const replyRow = (path: (string | number)[]) => {
      if (path[1] === "plain" && typeof path[2] === "number") return replyTable?.rows.find(r => r.cells[0] === `直言 ${"ABC"[path[2] as number]}`);
      if (path[1] === "poem") return replyTable?.rows.find(r => r.cells[0] === (path[2] === "onMismatch" ? "以诗代答 · 不合" : "以诗代答 · 合意象"));
      if (path[1] === "silence") return replyTable?.rows.find(r => r.cells[0] === "不回");
      return undefined;
    };
    // schema 的数值边界（story-schema 2.4）不是转换器定的。报错时说清两条路，别让人以为只能改原文。
    const bounds: Record<string, string> = {
      delayMinutes: "送信延迟 schema 定为 10–180 分钟。要么改 markdown 填 10 以上，要么请 CC1 定夺是否放宽下限（军中素笺本就该快）",
      "trigger.afterScenes": "触发场数 schema 定为 2–4 场。要么改 markdown 填 2 以上，要么请 CC1 定夺是否允许隔 1 场就送到",
      "replies.plain": "直言必须正好三条（story-schema 1.8.2）",
    };
    const parsed = take(b, undefined, Letter, value,
      path => path[0] === "body" ? f[bodyRow[path[1] as string]] : path[0] === "replies" ? replyRow(path) : f[fieldRow[path[0] as string]],
      path => { const text = bounds[path.join(".")]; return text ? { text, kind: "ChatGPT 格式" } : undefined; });
    if (parsed && !blockHasErrors(b)) {
      if (value.interceptAt && !SCHEMA_HAS.interceptAt) {
        addIssue(b, f["截获场景"], "这封信要在固定场景被截（D-039 的 Letter.interceptAt），但 schema 还没有这个字段。不写进 JSON——否则被截与否会退回成「未读满三封才截」，由玩家读信节奏决定，不是剧本决定。等 CC1 加上再转", "CC1 接口");
        return;
      }
      if (value.interceptAt) (parsed as any).interceptAt = value.interceptAt;
      result.letters.push(parsed);
    }
  });
  for (const b of blocks.filter(b => b.tables.some(t => t.rows.some(r => r.cells[0] === "结局 key")))) attempt(b, undefined, () => {
    const f = fields(b); const v = (k: string) => f[k]?.cells[1] ?? "";
    checkFields(b, "结局", f); checkTables(b, "结局");
    const key = v("结局 key"); unique("ending", key);
    const variants = ["正文 · 天", "正文 · 曌", "正文 · 不改"];
    if (v("正文") && variants.some(k => v(k))) throw new Error("正文与三段变体不能同时填写");
    const value = { key, title: v("标题"), require: parseCondition(v("判定")), palette: v("色板"), theme: v("主题"), body: variants.some(k => v(k)) ? { tian: v(variants[0]), zhao: v(variants[1]), kept: v(variants[2]) } : v("正文") };
    const endingRow: Record<string, string> = { key: "结局 key", title: "标题", require: "判定", palette: "色板", theme: "主题", body: "正文" };
    const parsed = take(b, f["判定"], Ending, value, path => f[endingRow[path[0] as string]] ?? (path[0] === "body" ? f[variants[0]] : undefined));
    if (parsed && !blockHasErrors(b)) result.endings.push(parsed);
  });
  for (const b of blocks.filter(b => b.heading.startsWith("场景 "))) attempt(b, undefined, () => {
    const f = fields(b); const row = f["留信"];
    if (f["去向"]?.cells[1] && f["去向"].cells[1].trim() !== "章末") attempt(b, f["去向"], () => ref(f["去向"].cells[1]));
    if (!row) return;
    const id = sceneId(b.heading.slice(3), f["地点 key"]?.cells[1] ?? "");
    for (const from of list(row.cells[1])) {
      if (result.letters.some(l => l.from === from && l.trigger.kind === "scene" && l.trigger.sceneId === id)) continue;
      const tried = letterAttempts.find(l => l.from === from && l.sceneId === id);
      addIssue(b, row, tried
        ? `留了 ${from} 的信，对应信件 ${tried.id} 未通过转换，见该信的问题`
        : `留了 ${from} 的信，但本批输入没有对应完整信件；请把本章的书信文件一并交付并一同转换`);
    }
  });
  // Even an unsupported nested section can contain a concrete missing destination.
  for (const b of blocks) for (const t of b.tables) {
    const column = t.header.indexOf("去向");
    if (column < 0 || !(t.header.includes("选项文本") || ["结果", "回信"].includes(t.header[0]))) continue;
    for (const row of t.rows) if (row.cells[column] && row.cells[column].trim() !== "章末") attempt(b, row, () => ref(row.cells[column]));
  }
  for (const [label, { id, block, row }] of fromOutline) {
    addIssue(block, row, `${label} 的正文尚未交付；指向它的去向按大纲的地点 key 先接成 ${id}，那一批交了必须重跑确认地点没改`, "待交付");
  }
  const uniqueIssues = new Set<string>();
  result.issues = result.issues.filter(i => {
    const key = JSON.stringify(i);
    if (uniqueIssues.has(key)) return false;
    uniqueIssues.add(key); return true;
  });
  result.issues.sort((a,b) => a.file.localeCompare(b.file) || a.line - b.line);
  return result;
}

/** 问题单里这一行以下是人写的，转换器不覆盖。CC1、CC3 的补记都写在它下面。 */
export const MANUAL_MARK = "<!-- 人工补记：以下内容转换器不会覆盖 -->";

/**
 * 从旧问题单里取出人写的部分。认两种：本文件的标记行，
 * 以及 CC1 在标记出现之前用过的写法（分隔线 + 「## CC1 已处理」这类小标题）。
 */
export function manualTail(old: string): string {
  const marked = old.indexOf(MANUAL_MARK);
  if (marked >= 0) return old.slice(marked + MANUAL_MARK.length).replace(/^\r?\n/, "");
  const legacy = /\n---\s*\n+(?=#{2,3}\s*(?:CC1|CC3|人工|补记))/.exec(old);
  return legacy ? old.slice(legacy.index + legacy[0].length) : "";
}

export function issueReport(r: ConvertResult): string {
  const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  const kinds: IssueKind[] = ["ChatGPT 格式", "CC1 接口", "待交付"];
  const kindOf = (i: ConvertIssue) => i.kind ?? classify(i.message);
  const count = (k: IssueKind) => r.issues.filter(i => kindOf(i) === k).length;
  const who: Record<IssueKind, string> = { "ChatGPT 格式": "ChatGPT 改 markdown 原文", "CC1 接口": "CC1 改 schema／引擎／校验器", "待交付": "等下一批交付，再跑一次转换" };
  const summary = kinds.map(k => `| ${k} | ${count(k)} | ${who[k]} |`).join("\n");
  const table = (k: IssueKind) => {
    const rows = r.issues.filter(i => kindOf(i) === k);
    if (!rows.length) return "";
    return `\n## ${k}（${rows.length}）\n\n| 文件 | 行号 | 原文 | 问题 |\n|---|---|---|---|\n${rows.map(i => `| ${esc(i.file)} | ${i.line} | ${esc(i.excerpt)} | ${esc(i.message)} |`).join("\n")}\n`;
  };
  return `# 转换问题单\n\n自动生成（tools/convert-story.ts，CC2 维护）；不修改原文、schema 或引擎。仅处理命令指定的正文和诗词库。\n\n成功解析：${r.scenes.length} 场、${r.poems.length} 首诗、${r.duels.length} 局对诗、${r.letters.length} 封信、${r.endings.length} 个结局。\n\n结果保存在 src/data/converted/，不自动接入现有 demo；npm run validate 仅检查正式数据。${r.issues.length ? "存在转换问题，不代表可运行章节。" : "无转换问题，仍需整章联调校验。"}\n\n| 类别 | 条数 | 谁处理 |\n|---|---|---|\n${summary}\n${kinds.map(table).join("")}`;
}

// ------------------------------------------------------------------ 测试用例
//
// 下面这些是验收标准，实现完要让 tests/convert.test.ts 全绿。
// 每一条都对应 story-schema 第三部分的一行，或者一个真踩过的坑。

/** 给 tests/convert.test.ts 用的样例。改这里就等于改验收标准，慎重。 */
export const CASES = {
  sceneId: [
    { in: ["ch01-03 昭阳殿一角", "zhaoyang"], out: "ch01_s03_zhaoyang" },
    { in: ["ch01-04a", "yeting"], out: "ch01_s04a_yeting" },
    { in: ["ch1-3 书阁", "shuge"], out: "ch01_s03_shuge", why: "章号与序号都补零" },
  ],
  lineId: [
    { in: ["ch01_s03_zhaoyang", 1], out: "ch01_s03_zhaoyang.l1" },
    { in: ["ch01_s03_zhaoyang", 12], out: "ch01_s03_zhaoyang.l12" },
  ],
  choiceId: [
    { in: ["ch01_s03_zhaoyang", "A"], out: "ch01_s03_zhaoyang.cA" },
  ],
  condition: [
    { in: "cai >= 6", out: { cai: { gte: 6 } } },
    { in: "好感.shenheng >= 10", out: { "affinity.shenheng": { gte: 10 } } },
    { in: "flag.took_seal", out: { "flag.took_seal": true } },
    { in: "非 flag.refused_marriage", out: { "flag.refused_marriage": false } },
    {
      in: "cai >= 6 且 非 flag.refused_marriage",
      out: { cai: { gte: 6 }, "flag.refused_marriage": false },
    },
    { in: "", out: {}, why: "空的「需要」列表示无条件，不是错误" },
    { in: "如果她已经足够坚定", issue: true, why: "文学化描述执行不了，进 issues 不要猜" },
    { in: "wuqi >= 3", issue: true, why: "认不出的键，不要新造数值" },
  ],
  effects: [
    { in: "xin +1, 好感.shenheng +2", out: { xin: 1, "affinity.shenheng": 2 } },
    { in: "好感.shenheng -1", out: { "affinity.shenheng": -1 } },
    { in: "flag.took_seal = 真", out: { "flag.took_seal": true } },
    { in: "flag.silent = 假", out: { "flag.silent": false } },
    { in: "cai +9", out: { cai: 9 }, why: "超过 4 点是警告不是错误，转换器照转，validate 去警告" },
  ],
  scene: [
    { field: "无用场景「是」", out: { weightless: true } },
    { field: "无用场景「否」或留空", out: { weightless: false } },
    { field: "留信 shenheng, wenqiao", out: { leavesLetter: ["shenheng", "wenqiao"] } },
    { field: "台词表第六列「条件」flag.trial_recopy", out: { when: { "flag.trial_recopy": true } }, why: "D-026：空 = 总是播放，写法同选项表「需要」列" },
    { field: "对诗「pd-01」", out: { duel: "pd_01" }, why: "D-026：对局要真的在本批或冻结题库里，只有对诗出口时赢输两行都要有去向" },
    { field: "结果表第四列「台词」", out: { "onWin.line": { who: "<对手>", kind: "say", text: "…" } }, why: "D-026：胜负专属一句，说话人是表头的对手，不从中文名猜" },
    { field: "色板「gold」", out: { palette: "gold" } },
    { field: "类型「说 / 内心 / 旁白 / 诗」", out: { kind: "say / inner / aside / poem" } },
    { field: "{名}", out: "原样保留，引擎运行时替换", why: "不要在转换期替换成任何具体名字" },
  ],
  /** 真踩过的坑，回归用 */
  regressions: [
    { case: "台词里有半角逗号或竖线", why: "markdown 表格会被切错列，要按转义规则处理，不是直接 split" },
    { case: "同一场景表出现两次", why: "报 issue，不要后面的悄悄覆盖前面的" },
    { case: "选项去向写的是中文场景名不是 id", why: "报 issue。去向必须能对上另一份场景表的表头" },
    { case: "角色 key 不在 D-016 冻结的十个里", why: "报 issue。schema 的 enum 会拦，但转换期就该说清是哪一行" },
    { case: "结局表判定列写了 flag.name_tian", why: "报 issue。D-020：改名不做门槛，只切文本变体" },
    { case: "同一份 markdown 转两次", why: "输出必须逐字节相同。id 生成是纯函数，不许带时间戳或自增计数器" },
  ],
} as const;

export function runCli(args: string[]): number {
  const root = resolve(import.meta.dirname, "..");
  const all = args.includes("--all");
  const files = all ? readdirSync(join(root, "docs")).filter(f => /^C.*\.md$/.test(f)).sort().map(f => `docs/${f}`) : args;
  if (!files.length || files.some(f => f.startsWith("--"))) {
    console.error("用法：node --experimental-strip-types tools/convert-story.ts docs/C-2-第一章前六场.md docs/C0-2-诗词库与对诗.md（或 --all）");
    return 2;
  }
  const inputs = files.map(file => ({ file: relative(root, resolve(root, file)).replace(/\\/g, "/"), markdown: readFileSync(resolve(root, file), "utf8") }));
  const result = convertBatch(inputs);
  const data = join(root, "src", "data");
  // An incomplete chapter must not replace a runnable demo or masquerade as complete.
  const out = join(data, "converted");
  const manifestPath = join(out, "manifest.json");
  /**
   * 这一批的输入是否盖过了上一批。盖过了就说明同一批原文应该转出同一批东西，
   * 于是按本批重写；上一批留下、这一批不再产生的条目是陈旧数据，清掉
   * （pd_ch01_s04_shuge 改成 pd_01 之后，旧 id 就这样留在文件里没人引用）。
   * 只转其中一两份文件时不重写，免得把别处来的条目冲掉。
   */
  let replace = false;
  if (existsSync(manifestPath)) {
    try {
      const prev = JSON.parse(readFileSync(manifestPath, "utf8"));
      const now = new Set(inputs.map(i => i.file));
      replace = (prev.inputs ?? []).every((p: any) => now.has(p.file));
    } catch { /* manifest 坏了就当没有，不因为它挡住转换 */ }
  }
  writeOut(result, out, replace);
  // 上一批写出过、这一批不再产出的场景与信：把文件删掉。
  // 留着的话，一份因为改名或转换失败而作废的 JSON 会继续冒充有效数据，
  // 校验器只看得见文件，看不见它已经和原文对不上了。
  if (replace && existsSync(manifestPath)) {
    try {
      const prev = JSON.parse(readFileSync(manifestPath, "utf8"));
      const now = new Set([...result.scenes.map(x => x.id), ...result.letters.map(x => x.id)]);
      for (const id of [...(prev.scenes ?? []), ...(prev.letters ?? [])]) {
        if (now.has(id)) continue;
        const path = outputPathFor(id, out);
        if (existsSync(path)) { rmSync(path); console.log(`删掉不再产出的 ${relative(root, path)}`); }
      }
    } catch { /* manifest 坏了就不删，宁可留着也不误删 */ }
  }
  writeFileSync(manifestPath, JSON.stringify({
    inputs: inputs.map(i => ({ file: i.file, sha256: createHash("sha256").update(i.markdown).digest("hex") })),
    scenes: result.scenes.map(s => s.id), poems: result.poems.map(p => p.id), duels: result.duels.map(d => d.id), letters: result.letters.map(l => l.id), endings: result.endings.map(e => e.key),
    issues: result.issues.length,
  }, null, 2) + "\n", "utf8");
  const poemFiles = inputs.filter(i => i.markdown.includes("完整原文（／换行）")).map(i => i.file);
  if (result.poems.length && !result.issues.some(i => poemFiles.includes(i.file))) {
    // 正式数据是 CC1 的地盘：只合并，不按本批重写，免得删掉他那边加的东西
    writeOut({ ...result, scenes: [], duels: [], letters: [], endings: [] }, data);
  }
  const endingFiles = inputs.filter(i => /\|\s*结局 key\s*\|/.test(i.markdown)).map(i => i.file);
  const completeEndings = result.endings.length > 0 && result.endings.every((e, i) =>
    i === result.endings.length - 1 ? !Object.keys(e.require ?? {}).length : Object.keys(e.require ?? {}).length > 0);
  if (completeEndings && !result.issues.some(i => endingFiles.includes(i.file))) {
    writeOut({ ...result, scenes: [], duels: [], letters: [], poems: [] }, data);
  }
  // 人写在问题单末尾的补记（CC1 的处理记录等）原样带过去，别让自动生成把它冲掉
  const issuePath = join(root, "docs", "convert-issues.md");
  const tail = existsSync(issuePath) ? manualTail(readFileSync(issuePath, "utf8")) : "";
  writeFileSync(issuePath, issueReport(result) + `\n---\n\n${MANUAL_MARK}\n${tail}`, "utf8");
  console.log(`转换至 ${relative(root, out)}：${result.scenes.length} 场，${result.poems.length} 首诗，${result.duels.length} 局，${result.letters.length} 封信；${result.issues.length} 个问题。`);
  // 「待交付」是排期，不是错：原文没毛病，等下一批交了重跑就好，不该让它挡住别人的流水线
  const blocking = result.issues.filter(i => (i.kind ?? classify(i.message)) !== "待交付");
  if (!blocking.length && result.issues.length) console.log(`其中 ${result.issues.length} 条都是待交付，等下一批原文，不算错。`);
  return blocking.length ? 1 : 0;
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try { process.exitCode = runCli(process.argv.slice(2)); }
  catch (e) { console.error((e as Error).message); process.exitCode = 2; }
}
