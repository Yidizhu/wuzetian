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
import { Scene, Line, Choice, Poem, PoemDuel, Letter, Ending, CHARACTER_KEYS, SCENE_KEYS, SpeakerKey } from "../src/engine/schema.ts";
import type { SceneT, PoemT, PoemDuelT, LetterT, EndingT } from "../src/engine/schema.ts";
import type { Condition } from "../src/engine/types.ts";
import { AFFINITY_BANDS } from "../src/engine/types.ts";
import { DRESSINGS } from "../src/scene/dressings.ts";
import { CGS } from "../src/scene/cgs.ts";
import { relationKey, looksLikeRelationKey, LOVE_KEYS, type RelationKeyInfo } from "../src/engine/pact.ts";

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
  /** 场景 id -> 原文标题（去掉场次号）。只给分支图用，不写进 JSON */
  titles?: Record<string, string>;
  /**
   * 没转出来的场景和信，原文里提到了哪些 flag 的读和写。只给 flag 体检用：
   * 一场转不出来，它写的 flag 就会在体检里变成「有人读、没人写」的假警报，得认得出来。
   */
  unconverted?: { label: string; file: string; chapter: number; reads: string[]; writes: string[] }[];
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
 * 关系键（B27／D-161，键和取值只从 src/engine/pact.ts 取，不抄一份）：
 *   `pact.shenheng = active`         → `"pact.shenheng": "active"`
 *   `pact.liqinghe = active/paused`  → `{ in: ["active", "paused"] }`（其中之一）
 *   `pact.shenheng != none/declined` → `{ not: ["none", "declined"] }`（不是其中之一；单个值也写 not）
 *   `told.wenqiao`、`非 love.shenheng` → 布尔，写法同 flag
 *   `pacts.active >= 2`               → 比较，写法同数值
 * 认不出的一律进 issues，不要猜。
 */
export function parseCondition(text: string): Condition {
  const out: Condition = {};
  if (!text.trim()) return out;
  for (const part of text.split("且").map(x => x.trim())) {
    const flag = /^(非\s+)?(flag\.[a-z][a-z0-9_]*)$/.exec(part);
    if (flag) { put(out, flag[2], !flag[1]); continue; }
    const relBool = /^(非\s+)?((?:pact|told|answer|asked|love|pacts)\.[a-z]+|intent)$/.exec(part);
    if (relBool) {
      const info = relationInfo(relBool[2]);
      if (info.kind !== "bool") throw new Error(`「${relBool[2]}」不是真假值，要写成「${relBool[2]} = 取值」${info.kind === "number" ? "或比较（>= 2 这种）" : `（${(info.kind as readonly string[]).join("／")}）`}`);
      put(out, relBool[2], !relBool[1]); continue;
    }
    const rel = /^((?:pact|told|answer|asked|love|pacts)\.[a-z]+|intent)\s*(!=|=)\s*([a-z]+(?:\s*\/\s*[a-z]+)*)$/.exec(part);
    if (rel) {
      const info = relationInfo(rel[1]);
      if (info.kind === "bool") throw new Error(`「${rel[1]}」是真假值，条件里直接写「${rel[1]}」或「非 ${rel[1]}」`);
      if (info.kind === "number") throw new Error(`「${rel[1]}」是个数，要写比较（>= 2 这种）`);
      const vals = rel[3].split("/").map(x => x.trim());
      for (const x of vals) if (!(info.kind as readonly string[]).includes(x)) throw new Error(`「${rel[1]}」没有「${x}」这个值，只能是 ${(info.kind as readonly string[]).join("／")}`);
      if (new Set(vals).size !== vals.length) throw new Error(`「${part}」里有重复的值`);
      put(out, rel[1], rel[2] === "!=" ? { not: vals } : vals.length === 1 ? vals[0] : { in: vals });
      continue;
    }
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
/** 关系键的说明（src/engine/pact.ts）。长得像关系键却认不出——人写错了或字段写错了——当场说清楚 */
function relationInfo(key: string): RelationKeyInfo {
  const info = relationKey(key);
  if (!info) throw new Error(`关系键「${key}」写错了：人只能是 ${LOVE_KEYS.join("／")}，字段只能是 pact／told／answer／asked／love，或 intent、pacts.active、pacts.love（src/engine/pact.ts）`);
  return info;
}
function numericKey(key: string): string {
  key = key.replace(/^好感\./, "affinity.");
  if (/^(shi|ming|cai|xin)$/.test(key)) return key;
  if (looksLikeRelationKey(key)) {
    if (relationInfo(key).kind !== "number") throw new Error(`「${key}」不是个数，不能比大小`);
    return key;
  }
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
 * 关系键（B27）也是绝对值：`pact.shenheng = ended`、`answer.peizhaoye = open`、`intent = only`、`told.wenqiao = 真`。
 * 算出来的键（love.*、pacts.*）不能写；回信能写什么由引擎守（pact.ts 规则 3），转换器不替它挡。
 */
export function parseEffects(text: string): Record<string, number | boolean | string> {
  const out: Record<string, number | boolean | string> = {};
  if (!text.trim()) return out;
  for (const part of text.split(/[,，]/).map(x => x.trim())) {
    const flag = /^(flag\.[a-z][a-z0-9_]*)\s*=\s*(真|假)$/.exec(part);
    if (flag) { put(out, flag[1], flag[2] === "真"); continue; }
    const rel = /^((?:pact|told|answer|asked|love|pacts)\.[a-z]+|intent)\s*=\s*(\S+)$/.exec(part);
    if (rel) {
      const info = relationInfo(rel[1]);
      if (!info.writable) throw new Error(`「${rel[1]}」是算出来的，只能写在条件里，不能写进效果`);
      if (info.kind === "bool") {
        if (rel[2] !== "真" && rel[2] !== "假") throw new Error(`「${rel[1]}」只能写真或假`);
        put(out, rel[1], rel[2] === "真"); continue;
      }
      const allowed = info.kind as readonly string[];
      if (!allowed.includes(rel[2])) throw new Error(`「${rel[1]}」没有「${rel[2]}」这个值，只能是 ${allowed.join("／")}；效果里一次只能写一个值`);
      put(out, rel[1], rel[2]); continue;
    }
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
  branches: "branches" in shapeOf(Scene),                                     // B27 自动去向
};

/** 说话人允许的取值：十个冻结角色，加主角内心与旁白 */
// 从 schema 的 SpeakerKey 取，不自己抄一份：D-063 要加「题记」这类新取值时，schema 一改这里自动跟上
export const SPEAKERS = new Set<string>((() => {
  const walk = (t: any): string[] => typeof t === "string" ? [t] : t?.options ? t.options.flatMap(walk) : t?._def?.values ?? (typeof t?.value === "string" ? [t.value] : []);
  const got = walk(SpeakerKey);
  return got.length ? got : [...CHARACTER_KEYS, "self", "narr"];
})());
/**
 * 剧本「说话人」一栏里写的中文标签 → schema 的 key。D-063 的「题记」→ tiji，D-142／B23 的「事件图」→ cg，
 * D-176／B31 的「空镜」→ empty（值是 CC1 定的；空镜格的三条规矩写在 schema 的 Scene 里，转换器照它报，不另抄一份）
 * （src/engine/schema.ts 的 SpeakerKey 注释写明了这两对）。key 本身必须在 SPEAKERS 里，测试会查。
 */
export const SPEAKER_LABELS: Record<string, string> = { 题记: "tiji", 事件图: "cg", 空镜: "empty" };

/**
 * 事件图那一行的文本是图的 key，只有一个出处：src/scene/cgs.ts（CC3 定图、CC1 管机制）。
 * 写了表里没有的 key，引擎走到那一格找不到图就当它不存在——戏照走、图不出，每一场单看都合法，
 * 所以在转换这一关报出来，挡转换（R-019）。表里有名字相近的就列出来：多半是改名撞车，不是乱写
 */
function unknownCg(key: string): string {
  const bare = (k: string) => k.replace(/_\d+_/, "_");
  const near = Object.keys(CGS).filter(k => bare(k) === bare(key) || k.split("_")[0] === key.split("_")[0]);
  return `事件图「${key}」不在 src/scene/cgs.ts 的表里，引擎走到这一格会找不到图、直接跳过。` +
    (near.length ? `表里名字相近的有：${near.join("、")}——若是表改了名，请 ChatGPT 按表改文本，或 CC1／CC3 把表的 key 改回来，两边对齐一处即可。` : `现有：${Object.keys(CGS).join("、")}。`) +
    `这一场照常输出，只是这一格的图出不来`;
}

/** 认不出的角色 key：可能是新批准的角色还没进枚举，也可能是笔误。两条路都写出来 */
function unknownCharacter(key: string, where: string): string {
  return `${where}的角色 key「${key}」不在 D-016 冻结的十个里。若这是指挥日志新批准的角色，要 CC1 先加进 src/engine/schema.ts 的 CHARACTER_KEYS 和角色表；若是笔误，请 ChatGPT 改原文。在那之前这一场不输出`;
}

/** 比对前去掉标点和空白：原文里断句方式五花八门，片段要按字对 */
export function normalizeForPoems(text: string): string {
  return text.replace(/[\s，。、！？；：“”‘’「」《》（）()【】…—·,.!?;:'"\-]/g, "");
}
/** 宋以后诗词黑名单，见 tools/convert-song-blacklist.json */
export const SONG_BLACKLIST: { key: string; line: string; author: string; work: string; dynasty: string }[] =
  JSON.parse(readFileSync(new URL("./convert-song-blacklist.json", import.meta.url), "utf8").replace(/^﻿/, "")).entries
    .map((e: any) => ({ key: normalizeForPoems(e.fragment), line: e.line, author: e.author, work: e.work, dynasty: e.dynasty }));

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
    } catch (e) {
      // 表格中间多了一个空行：markdown 在空行处把表断开，后面几行就成了没有表头的「新表」。
      // 逐行报会刷出一串看不懂的「缺少分隔行」；认出这种情形，整段只报一条，说清怎么改。
      const prev = lines[i - 1] ?? "", before = lines[i - 2] ?? "";
      if (!prev.trim() && before.trim().startsWith("|")) {
        let end = i;
        while (end + 1 < lines.length && lines[end + 1].trim().startsWith("|")) end++;
        issues.push({ file, line: i, excerpt: raw, message: `表格中间多了一个空行（第 ${i} 行）：从第 ${i + 1} 行到第 ${end + 1} 行被当成了没有表头的新表，这几行读不进上面那张表。删掉这个空行即可` });
        i = end;
        continue;
      }
      issues.push({ file, line: i + 1, excerpt: raw, message: String(e) });
    }
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
    data: ["章", "幕", "地点 key", "色板", "在场", "进入条件", "无用场景", "一句话目的", "去向", "自动去向", "章末", "布置", "留信", "对诗", "终局判定", "结局", "BGM"],
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
/** 「警告」不挡流水线：比如宋以后的诗句，查到了要人看一眼，但转换照常 */
export type IssueKind = "ChatGPT 格式" | "CC1 接口" | "待交付" | "警告";
export function classify(message: string): IssueKind {
  if (/CC1|架构方|schema/.test(message)) return "CC1 接口";
  if (/待交|未交付|尚未交付|一同转换/.test(message)) return "待交付";
  return "ChatGPT 格式";
}

/** Batch parsing resolves forward and cross-file references without filesystem-dependent guesses. */
export function convertBatch(inputs: { markdown: string; file: string }[]): ConvertResult {
  const result: ConvertResult = { scenes: [], poems: [], duels: [], letters: [], endings: [], issues: [], titles: {}, unconverted: [] };
  /**
   * 大纲（文件名带「大纲」）只贡献场次索引表，别的一概不读。
   * 大纲里会夹出口合同、样稿，甚至一整场先交的正文（C-12 的 ch04-09），
   * 当正文转就会从大纲里拼出半个下一章——原文自己说了「未成稿前不单独接成可玩尾章」。
   * 那些场的正文到了自己章的文件里再转。
   */
  const isOutline = (file: string) => /大纲/.test(file);
  const isIndexTable = (t: Table) => t.header.includes("场景标题") && t.header.includes("地点 key");
  const blocks = inputs.flatMap(i => {
    const read = readBlocks(i.markdown, i.file, isOutline(i.file) ? [] : result.issues);
    return isOutline(i.file) ? read.map(b => ({ ...b, heading: `大纲：${b.heading}`, tables: b.tables.filter(isIndexTable), prose: [] })) : read;
  });
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
      if (kind === "场景" && t.header.includes("章末后去向")) continue; // 章末身份核对表，场景里单独核
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
    const cgNotes: { row: Row; message: string }[] = [];
    /** 和 value.lines 一一对应的原文行：schema 按台词下标报的问题（空镜那几条）要指回剧本那一格 */
    const lineRows: Row[] = [];
    for (const row of lt.table.rows) attempt(b, row, () => {
      const cell = (name: string) => lt.at(row, name);
      const [n, rawWho, expr, kind, text, cond] = [cell("#"), cell("说话人"), cell("表情"), cell("类型"), cell("台词"), cell("条件")];
      const who = SPEAKER_LABELS[rawWho.trim()] ?? rawWho;
      const number = integer(n); const lid = lineId(id, number); unique("line", lid);
      if (number !== value.lines.length + 1) throw new Error("台词序号须从 1 连续递增");
      // 事件图那一行「类型」留空（B23 的写法）：它不是说出口的话，不进对话框，按旁白记，和题记同一类
      // 事件图、空镜那一行「类型」留空也行：都不是说出口的话，按旁白记（空镜 schema 要求就是 aside）
      const mapped = (who === "cg" || who === "empty") && !kind.trim() ? "aside" : ({ 说: "say", 内心: "inner", 旁白: "aside", 诗: "poem" } as Record<string, string>)[kind];
      if (!mapped) throw new Error(`未知台词类型：${kind}`);
      if (!SPEAKERS.has(who)) throw new Error(unknownCharacter(who, "说话人"));
      if (who === "cg" && !CGS[text.trim()]) cgNotes.push({ row, message: unknownCg(text.trim()) });
      const line: any = { id: lid, who, ...(expr ? { expr } : {}), kind: mapped, text };
      // Validate each line at its own source row for precise diagnostics.
      const checked = Line.safeParse(line);
      if (!checked.success) throw new Error(zodMessage(checked.error));
      // D-026：「条件」列 -> Line.when。空 = 总是播放。写法同选项表「需要」列。
      if (cond.trim()) line.when = parseCondition(cond);
      value.lines.push(line);
      lineRows.push(row);
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
    // 章末结算页。两种写法：D-034 的「去向 | 章末」，和 D-039 的「章末 | 是」加一个去向。
    // 章末与选项可以并存（D-043）：选项结算完 → 结算页 → 场景级去向，所以有选项时场景级去向也要写出来。
    // 普通场景有选项表时仍不写场景级去向：story-schema 1.2 说去向写在选项里，两处都写会互相打架。
    if (chapterEndHere) value.chapterEnd = true;
    const sceneDest = v("去向").trim();
    if (sceneDest && sceneDest !== "章末" && (!choices || chapterEndHere)) value.goto = attempt(b, f["去向"], () => ref(sceneDest));
    // B27：「自动去向 | 条件 → ch04-05ca；条件 → ch04-05cb；兜底 → ch04-08z」→ branches + goto。
    // 从上往下取第一个满足的；兜底就是场景级 goto，所以要写在最后，也不能和「去向」各写一个
    if (v("自动去向")) attempt(b, f["自动去向"], () => {
      if (!SCHEMA_HAS.branches) throw new Error("场景表写了「自动去向」，但 schema 还没有 Scene.branches，需要 CC1 先加（B27）");
      const branches: { require?: Condition; goto: string }[] = [];
      let fallback: string | undefined;
      for (const piece of v("自动去向").split(/[；;]/).map(x => x.trim()).filter(Boolean)) {
        const m = /^(.*?)\s*(?:→|->)\s*(\S+)$/.exec(piece);
        if (!m) throw new Error(`自动去向每一条写成「条件 → 场次」，最后一条可以是「兜底 → 场次」：${piece}`);
        if (fallback) throw new Error(`「兜底」要写在自动去向的最后一条，后面的「${piece}」永远轮不到`);
        if (m[1].trim() === "兜底") { fallback = ref(m[2]); continue; }
        if (!m[1].trim()) throw new Error(`自动去向这一条没写条件：${piece}。不带条件的请写「兜底 → 场次」`);
        branches.push({ require: parseCondition(m[1]), goto: ref(m[2]) });
      }
      if (!branches.length) throw new Error("自动去向只有兜底：直接写「去向」就行");
      if (fallback && value.goto && value.goto !== fallback) throw new Error(`「去向」写的是 ${value.goto}，「自动去向」的兜底写的是 ${fallback}，两处要一致，或者只写一处`);
      value.branches = branches;
      if (fallback) value.goto = fallback;
    });
    // D-046：场景表「布置 | 公议」-> Scene.dressing。哪几场是公议写在剧本里，不写进引擎白名单，
    // 否则改一句标题就悄悄少一排案，而且没有任何东西会报错。
    // schema 没跟上时照常输出这一场，只把布置记一条：丢的是一排道具，戏文一句不少。
    // 为此不能挡住整章——别的地方（信的附页、角色 key）丢的是玩家读不到的正文，那才要拦。
    let dressingNote: string | undefined;
    if (v("布置")) attempt(b, f["布置"], () => {
      // 中文名到 key 的对照只有一个出处：src/scene/dressings.ts（CC3 维护，渲染器认的也是那几个 key）。
      // 转换器不再自己抄一份——和说话人名单从 schema 取是同一个道理。认不出的也不扣整场，理由同上
      const key = DRESSINGS[v("布置").trim()]?.key;
      if (!key) dressingNote = `场景表写了「布置 | ${v("布置").trim()}」，src/scene/dressings.ts 里没有这个中文名（现有：${Object.keys(DRESSINGS).join("、")}）。这一场照常输出、暂不带这个布置；要加新布置请 CC3 在那张表里加一行`;
      else if (SCHEMA_HAS.dressing) value.dressing = key;
      else dressingNote = "场景表写了「布置 | 公议」，但 schema 还没有 Scene.dressing（D-046）。这一场照常输出，只是暂时不带公议布置；CC1 加上字段后重跑就有了";
    });
    // 章末身份核对表（C-11 第 24 场那种）：按身份列出章末之后去哪。它若只是核对——每一行都去
    // 场景级去向那一场——就不丢任何路由，放行；若真的按身份分去不同的场，schema 只有一个 goto 装不下，报接口。
    const routing = b.tables.find(t => t.header.includes("章末后去向"));
    if (routing) attempt(b, routing.rows[0], () => {
      if (!chapterEndHere) throw new Error("场景里有「章末后去向」表，但这一场没标章末");
      const destCol = routing.header.indexOf("章末后去向"), condCol = routing.header.indexOf("条件");
      const targets = new Set<string>();
      for (const row of routing.rows) {
        if (condCol >= 0 && row.cells[condCol].trim()) { try { parseCondition(row.cells[condCol]); } catch (e) { throw new LocatedError(row, (e as Error).message); } }
        try { targets.add(ref(row.cells[destCol])); } catch (e) { throw new LocatedError(row, (e as Error).message); }
      }
      if (targets.size > 1 || (value.goto && !targets.has(value.goto))) {
        throw new Error(`章末之后按身份去不同的场（${[...targets].join("、")}），但场景只有一个去向${value.goto ? ` ${value.goto}` : ""}。schema 装不下按条件分流的章末，需要 CC1 定接口；在那之前这一场不输出`);
      }
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
      for (const i of r.error.issues) {
        if (gotoFailed && /场景没有出口/.test(i.message)) continue;
        // D-169：循环回到自己的中转场不放台词（每回来一次都会重播）。台词表空着是剧本的本意，
        // 挡住它的是 schema 的「每场至少一句」，这是接口问题，不是原文写错
        if (i.path[0] === "lines" && i.code === "too_small" && value.lines.length === 0) {
          addIssue(b, f["一句话目的"] ?? undefined, `这一场台词表是空的：D-169 定了中转场不放台词，但 src/engine/schema.ts 的 Scene.lines 还要求至少一句。引擎本身能走零台词的场（和台词全被条件跳过同一条路），需要 CC1 把 lines 放开到可以为空（至少对有出口的场）。在那之前这一场不输出`, "CC1 接口");
          continue;
        }
        const lineRow = i.path[0] === "lines" && typeof i.path[1] === "number" ? lineRows[i.path[1]] : undefined;
        addIssue(b, choiceRow(i.path) ?? lineRow, zodMessage({ issues: [i] }));
      }
    }
    if (r.success && !blockHasErrors(b)) {
      const parsed: any = r.data;
      // Line.when 由 schema 收录（D-026）；万一 schema 回退成剥掉未知键的版本，这里按原位补回，JSON 里必须有它。
      value.lines.forEach((l: any, i: number) => { if (l.when && !parsed.lines[i].when) parsed.lines[i].when = l.when; });
      result.scenes.push(parsed);
      result.titles![id] = b.heading.slice(3).replace(/^ch\d+-\d+[a-z]*\s*/, "").trim();
      // 记在这一场输出之后：它是一条提醒，不是挡住这一场的错
      if (dressingNote) addIssue(b, f["布置"], dressingNote, "CC1 接口");
      // 同理记在输出之后：丢的是一张图，戏文一句不少，不扣整场；但它是静默失效，要挡转换
      for (const n of cgNotes) addIssue(b, n.row, n.message, "ChatGPT 格式");
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
  // 结局走不走得到：结局表里有结局，却没有任何一场做终局判定（也没有钉死结局），
  // 而故事最后一场是没有去向的章末——玩家走到底只会看到「下章待续」，一个结局都出不来。
  // 只在「最后一章的最后出口是空章末」时报：第一到三章转的时候，章末都还接着下一章，不该提前响
  if (result.endings.length && !result.scenes.some(x => (x as any).judgeEnding || x.ending)) {
    const lastChapter = Math.max(...result.scenes.map(x => x.chapter));
    for (const dead of result.scenes.filter(x => x.chapter === lastChapter && (x as any).chapterEnd && !x.goto)) {
      const b = blocks.find(k => k.heading.startsWith("场景 ") && (() => { try { return sceneId(k.heading.slice(3), fields(k)["地点 key"]?.cells[1] ?? "") === dead.id; } catch { return false; } })());
      if (!b) continue;
      const f = fields(b);
      addIssue(b, f["章末"] ?? f["去向"], `结局表有 ${result.endings.length} 个结局，但全库没有一场标「终局判定 | 是」，而 ${dead.id} 是全书最后一个出口、只标了章末。玩家走到这里只会看到「下章待续」，一个结局都出不来。story-schema 1.2：终局判定全游戏只填一次；这一场要改成终局判定（章末与终局判定不能同时写）`, "ChatGPT 格式");
    }
  }
  // D-065：契盟门槛降到 8、14，但门槛写在剧本原文里。原文不改，转出来就还是 10、16——
  // CC1 只改了正式数据，下一次转换会悄悄改回去。在转换这一关就报出来，让写原文的人看得见
  const floors = new Set<number>(AFFINITY_BANDS.map(b => b.min));
  for (const b of blocks) {
    if (b.heading.startsWith("大纲：")) continue;
    for (const t of b.tables) for (const row of t.rows) t.header.forEach((h, i) => {
      const gateCell = ["需要", "条件"].includes(h) || (h === "值" && row.cells[0] === "进入条件");
      if (!gateCell) return;
      for (const m of (row.cells[i] ?? "").matchAll(/好感\.([a-z]+)\s*>=\s*(\d+)/g)) {
        if (floors.has(Number(m[2]))) continue;
        addIssue(b, row, `好感门槛写的是 ${m[1]} >= ${m[2]}，不是档位下限（${AFFINITY_BANDS.slice().reverse().map(x => `${x.label} ${x.min}`).join("／")}）。D-065 之后契档门是 8、盟档门是 14；请 ChatGPT 把原文改掉，转换器不替原文改数`, "警告");
      }
    });
  }
  // tone-bible 第六节：只许唐及唐以前的诗。黑名单查不全，但能拦住最常见的那几十句
  for (const b of blocks) {
    if (b.heading.startsWith("大纲：")) continue;
    for (const t of b.tables) for (const row of t.rows) {
      const flat = normalizeForPoems(row.cells.join(""));
      for (const e of SONG_BLACKLIST) {
        if (!flat.includes(e.key)) continue;
        addIssue(b, row, `疑似唐以后的诗句「${e.line}」（${e.dynasty}·${e.author}《${e.work}》）。tone-bible 第六节只许唐及唐以前；若是有意化用或同形巧合，人看一眼确认即可`, "警告");
      }
    }
  }
  // 没转出来的场景与信：从原文表格里粗扫它们读写了哪些 flag（只作体检标注，不进数据）
  const flagsIn = (text: string) => [...new Set([...text.matchAll(/flag\.([a-z][a-z0-9_]*)/g)].map(m => m[1]))];
  const convertedScenes = new Set(result.scenes.map(x => x.id)), convertedLetters = new Set(result.letters.map(x => x.id));
  for (const b of blocks) {
    const sceneHead = b.heading.startsWith("场景 ") ? /^场景\s+(ch(\d+)-\d+[a-z]*)/.exec(b.heading) : null;
    const letterHead = /^信\s+(lt-ch(\d+)-[a-z0-9-]+)/.exec(b.heading);
    const head = sceneHead ?? letterHead;
    if (!head) continue;
    const done = sceneHead ? [...convertedScenes].some(id => id.startsWith(sceneLabel(head[1]).replace("-", "_s") + "_")) : convertedLetters.has(head[1].replace(/-/g, "_"));
    if (done) continue;
    const reads: string[] = [], writes: string[] = [];
    for (const t of b.tables) for (const row of t.rows) t.header.forEach((h, i) => {
      const cell = row.cells[i] ?? "";
      if (h === "效果") writes.push(...flagsIn(cell));
      else if (["需要", "条件", "判定"].includes(h)) reads.push(...flagsIn(cell));
      else if (h === "值" && ["进入条件", "她可能不回"].includes(row.cells[0])) reads.push(...flagsIn(cell));
    });
    result.unconverted!.push({ label: head[1], file: b.file, chapter: Number(head[2]), reads: [...new Set(reads)], writes: [...new Set(writes)] });
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
  const kinds: IssueKind[] = ["ChatGPT 格式", "CC1 接口", "待交付", "警告"];
  const kindOf = (i: ConvertIssue) => i.kind ?? classify(i.message);
  const count = (k: IssueKind) => r.issues.filter(i => kindOf(i) === k).length;
  const who: Record<IssueKind, string> = { "ChatGPT 格式": "ChatGPT 改 markdown 原文", "CC1 接口": "CC1 改 schema／引擎／校验器", "待交付": "等下一批交付，再跑一次转换", "警告": "人看一眼；不挡转换" };
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

// ------------------------------------------------------------ 分支图与 flag 体检

type Edge = { from: string; to: string | undefined; label: string; kind: "choice" | "goto" | "duel" | "chapterEnd" | "intercept"; locked: boolean };

/** 全部出边。章末选项没有 goto，走的是场景级去向（D-043），画成那一场的章末边 */
export function sceneEdges(r: ConvertResult): Edge[] {
  const duels = new Map(r.duels.map(d => [d.id, d]));
  const edges: Edge[] = [];
  for (const s of r.scenes as any[]) {
    for (const c of s.choices ?? []) if (c.goto) edges.push({ from: s.id, to: c.goto, label: `${c.id.split(".c")[1]} ${c.text}`, kind: "choice", locked: !!c.require });
    // B27 自动去向：不让玩家选，按条件走。画成带锁的边，标「自动」
    (s.branches ?? []).forEach((br: any, i: number) => edges.push({ from: s.id, to: br.goto, label: `自动${i + 1}`, kind: "goto", locked: !!(br.require && Object.keys(br.require).length) }));
    if (s.goto) edges.push({ from: s.id, to: s.goto, label: s.chapterEnd ? "章末" : "", kind: s.chapterEnd ? "chapterEnd" : "goto", locked: false });
    const d = s.duel ? duels.get(s.duel) : undefined;
    if (d?.onWin?.goto) edges.push({ from: s.id, to: d.onWin.goto, label: "对诗·赢", kind: "duel", locked: false });
    if (d?.onLose?.goto) edges.push({ from: s.id, to: d.onLose.goto, label: "对诗·输", kind: "duel", locked: false });
  }
  for (const l of r.letters as any[]) {
    const at = l.interceptAt ?? (l.trigger?.kind === "scene" ? l.trigger.sceneId : undefined);
    if (at && l.onIntercept?.goto && l.onIntercept.goto !== at) edges.push({ from: at, to: l.onIntercept.goto, label: `截信 ${l.id}`, kind: "intercept", locked: false });
  }
  return edges;
}

/**
 * docs/story-graph.md：每章一张 mermaid 图，外加摘要。从转换产物画，覆盖交了的所有章。
 * 起点是编号最小的那一场（有序幕就是 ch01-00）；朱砂描边的是从起点走不到的孤儿。
 * 不模拟条件：带锁的边照画，门槛能不能达到是 smoke 的事。
 */
export function storyGraph(r: ConvertResult): string {
  const ids = r.scenes.map(s => s.id).sort();
  const byId = new Map(r.scenes.map(s => [s.id, s as any]));
  const edges = sceneEdges(r);
  const start = ids[0];
  const seen = new Set(start ? [start] : []); const queue = start ? [start] : [];
  while (queue.length) { const at = queue.pop()!; for (const e of edges) if (e.from === at && e.to && byId.has(e.to) && !seen.has(e.to)) { seen.add(e.to); queue.push(e.to); } }
  const chapters = [...new Set(r.scenes.map(s => s.chapter))].sort((a, b) => a - b);
  const esc = (t: string) => t.replace(/["|<>#]/g, "").slice(0, 14);
  const node = (id: string) => id.replace(/[^A-Za-z0-9_]/g, "_");
  const out: string[] = [
    "# 剧情分支图", "",
    "> 由 `tools/convert-story.ts` 在每次转换后生成，读的是 `src/data/converted/`（CC2 转换产物），覆盖已交付的所有章。不要手改。",
    "> CC1 的 `npm run graph` 读正式数据，正式数据接入之前它只画得出第一章；两者不一致时以这一份为准。", "",
    `起点 \`${start ?? "（无）"}\`。纸色是水墨、绢色是金碧；**朱砂描边是从起点走不到的孤儿**；虚线框是还没交付、只被指向的场；🔒 是有条件的选项；虚线箭头是章末结算后的去向。`, "",
    "## 摘要", "", "| 章 | 场数 | 从起点可达 | 孤儿 | 章末 | 无用场景 | 公议布置 | 指向未交付 |", "|---|---|---|---|---|---|---|---|",
  ];
  for (const ch of chapters) {
    const mine = r.scenes.filter(s => s.chapter === ch) as any[];
    const orphans = mine.filter(s => !seen.has(s.id));
    const dangling = [...new Set(edges.filter(e => byId.get(e.from)?.chapter === ch && e.to && !byId.has(e.to)).map(e => e.to!))];
    out.push(`| ${ch} | ${mine.length} | ${mine.length - orphans.length} | ${orphans.length ? orphans.map(s => `\`${s.id}\``).join(" ") : "0"} | ${mine.filter(s => s.chapterEnd).length} | ${mine.filter(s => s.weightless).length} | ${mine.filter(s => s.dressing).length} | ${dangling.length ? dangling.map(x => `\`${x}\``).join(" ") : "无"} |`);
  }
  for (const ch of chapters) {
    const mine = (r.scenes.filter(s => s.chapter === ch) as any[]).sort((a, b) => a.id.localeCompare(b.id));
    out.push("", `## 第 ${ch} 章`, "", "```mermaid", "flowchart TD",
      "  classDef ink fill:#f4efe6,stroke:#3a3a3a,color:#1a1a1a", "  classDef gold fill:#efe2bf,stroke:#8a6a2a,color:#1a1a1a",
      "  classDef orphan stroke:#b23a2a,stroke-width:3px", "  classDef pending fill:#ffffff,stroke:#999,stroke-dasharray:4 3,color:#666");
    const external = new Set<string>();
    for (const s of mine) {
      const marks = [s.weightless ? "无用" : "", s.chapterEnd ? "章末" : "", s.dressing ? "公议" : "", s.duel ? "对诗" : ""].filter(Boolean).join("·");
      out.push(`  ${node(s.id)}["${s.id.replace(/^ch\d+_s/, "")} ${esc(r.titles?.[s.id] ?? "")}<br/>${s.scene}${marks ? " · " + marks : ""}"]:::${s.palette === "gold" ? "gold" : "ink"}`);
      if (!seen.has(s.id)) out.push(`  class ${node(s.id)} orphan`);
    }
    for (const e of edges.filter(e => byId.get(e.from)?.chapter === ch && e.to)) {
      const target = byId.get(e.to!);
      if (!target || target.chapter !== ch) external.add(e.to!);
      const label = `${e.locked ? "🔒 " : ""}${esc(e.label)}`;
      const arrow = e.kind === "chapterEnd" ? "-.->" : "-->";
      out.push(`  ${node(e.from)} ${arrow}${label.trim() ? `|"${label}"|` : ""} ${node(e.to!)}`);
    }
    for (const x of external) {
      const t = byId.get(x);
      out.push(`  ${node(x)}["${t ? `→ 第 ${t.chapter} 章 ${x.replace(/^ch\d+_s/, "")}` : `未交付 ${x}`}"]:::pending`);
    }
    out.push("```");
  }
  return out.join("\n") + "\n";
}

/**
 * flag 登记表（tools/convert-flag-ledger.json，CC2 维护）。
 * 真正的空缺／空转要么当场修掉，要么在这里登记判定、理由和谁来了结。
 */
export type FlagVerdict = "漏读" | "漏写" | "真死";
export interface FlagLedgerEntry { flag: string; verdict: FlagVerdict; why: string; fix: string }
export const FLAG_VERDICTS: readonly FlagVerdict[] = ["漏读", "漏写", "真死"];
export const FLAG_LEDGER_TEXT = readFileSync(new URL("./convert-flag-ledger.json", import.meta.url), "utf8").replace(/^\uFEFF/, "");
export const FLAG_LEDGER: FlagLedgerEntry[] = JSON.parse(FLAG_LEDGER_TEXT).entries;

/**
 * 把体检里真正的空缺／空转变成问题单条目。
 *
 * 为什么挡转换：D-091 让立绘开始按 flag 选。flag 名拼错时，写的那头变成「没人读」、
 * 读的那头（若别处没人写）变成「没人写」，每一场单看都合法。R-019 说的正是这一类，做成 error 不做 warning。
 * 只挡「真正的」：对面在待发布章节、连带假警报、引擎读取的，都不算。
 *
 * - 没登记 → ChatGPT 格式（挡）。行号指到原文里第一次写到这个 flag 的那一行。
 * - 登记了且判定对得上 → 待交付，挂在「了结」那个人名下。
 * - 登记了但已经不空了、或判定和缺的那头对不上 → 警告，提醒改登记表。登记表不清，以后同名的新问题会被旧登记盖住。
 */
export function flagIssues(r: ConvertResult, ctx: FlagAuditContext, inputs: { file: string; markdown: string }[],
  ledger: FlagLedgerEntry[] = FLAG_LEDGER, ledgerText = FLAG_LEDGER_TEXT, ledgerFile = "tools/convert-flag-ledger.json"): ConvertIssue[] {
  const real = flagFindings(r, ctx).gaps.filter(g => !g.expected);
  const at = (name: string): Pick<ConvertIssue, "file" | "line" | "excerpt"> => {
    const re = new RegExp(`(?<![a-z0-9_])flag\\.${name}(?![a-z0-9_])`);
    for (const i of inputs) {
      if (/大纲/.test(i.file)) continue;
      const lines = i.markdown.split(/\r?\n/);
      const n = lines.findIndex(l => re.test(l));
      if (n >= 0) return { file: i.file, line: n + 1, excerpt: lines[n].trim() };
    }
    return { file: "docs/convert-flags.md", line: 1, excerpt: `flag.${name}` };
  };
  const ledgerLine = (name: string) => Math.max(1, ledgerText.split(/\r?\n/).findIndex(l => l.includes(`"flag": "${name}"`)) + 1);
  const fits = (v: FlagVerdict, missing: FlagGap["missing"]) => v === "真死" || (v === "漏读") === (missing === "reads");
  const out: ConvertIssue[] = [];
  for (const g of real) {
    const what = g.missing === "reads" ? "写了，已发布的章里没人读" : "被读取，已发布的章里没人写";
    const entry = ledger.find(e => e.flag === g.name);
    if (!entry) {
      out.push({ ...at(g.name), kind: "ChatGPT 格式", message: `flag.${g.name} ${what}（${g.sites.slice(0, 3).join("、")}）。D-091 之后没人${g.missing === "reads" ? "读" : "写"}的 flag 和拼错的 flag 在数据里长得一模一样，所以这一条挡转换：拼错了就改成对的名字；该有人${g.missing === "reads" ? "读" : "写"}就补上；真没用就删掉这条${g.missing === "reads" ? "效果" : "条件"}。一时了结不了的，由 CC2 在 ${ledgerFile} 登记判定与理由` });
    } else if (!fits(entry.verdict, g.missing)) {
      out.push({ file: ledgerFile, line: ledgerLine(g.name), excerpt: g.name, kind: "警告", message: `登记表把 flag.${g.name} 判成「${entry.verdict}」，可它现在是${what}，判定和现状对不上。请 CC2 重判这一行` });
    } else {
      out.push({ ...at(g.name), kind: "待交付", message: `flag.${g.name} ${what}，已登记为「${entry.verdict}」：${entry.why}。了结：${entry.fix}` });
    }
  }
  for (const e of ledger) {
    if (real.some(g => g.name === e.flag)) continue;
    out.push({ file: ledgerFile, line: ledgerLine(e.flag), excerpt: e.flag, kind: "警告", message: `登记表里的 flag.${e.flag}（${e.verdict}）已经不是真正的空缺／空转了：已经了结，或对面进了待发布章节。请 CC2 删掉这一行，免得以后同名的新问题被它盖住` });
  }
  return out;
}

/** 从一份转换结果里收集 flag 的读取点与写入点（只认 flag.*） */
export function collectFlags(r: ConvertResult): { reads: Map<string, string[]>; writes: Map<string, string[]> } {
  const reads = new Map<string, string[]>(); const writes = new Map<string, string[]>();
  const add = (m: Map<string, string[]>, key: string, site: string) => { if (!key.startsWith("flag.")) return; const n = key.slice(5); (m.get(n) ?? m.set(n, []).get(n)!).push(site); };
  const readCond = (c: any, site: string) => { for (const k of Object.keys(c ?? {})) add(reads, k, site); };
  const writeEff = (e: any, site: string) => { for (const k of Object.keys(e ?? {})) add(writes, k, site); };
  for (const s of r.scenes as any[]) {
    readCond(s.require, `${s.id} 进入条件`);
    for (const l of s.lines) readCond(l.when, `${l.id}`);
    for (const c of s.choices ?? []) { readCond(c.require, `${c.id} 需要`); writeEff(c.effects, c.id); }
    (s.branches ?? []).forEach((br: any, i: number) => readCond(br.require, `${s.id} 自动去向${i + 1}`));
  }
  for (const d of r.duels as any[]) { writeEff(d.onWin?.effects, `${d.id} 赢`); writeEff(d.onLose?.effects, `${d.id} 输`); }
  for (const l of r.letters as any[]) {
    readCond(l.sheMayNotReply, `${l.id} 她可能不回`);
    for (const p of l.body?.pages ?? []) readCond(p.when, `${l.id} 附页·${p.key}`);
    for (const x of l.replies.plain) writeEff(x.effects, x.id);
    writeEff(l.replies.poem.onResonant.effects, `${l.id} 诗答·合`); writeEff(l.replies.poem.onMismatch.effects, `${l.id} 诗答·不合`);
    writeEff(l.replies.silence.effects, `${l.id} 不回`);
  }
  for (const e of r.endings as any[]) readCond(e.require, `结局 ${e.key}`);
  return { reads, writes };
}

/**
 * docs/convert-flags.md：全库 flag 体检（D-063 起分支图与体检都归 CC2）。
 *
 * 读取：场景进入条件、台词条件、选项需要、信的「她可能不回」与附页条件、结局判定。
 * 写入：选项效果、对诗胜负效果、回信效果。
 *
 * 每张表分两段：先列真正的空缺／空转，再列「已知预期」——免得每轮都把同一批当新问题看（D8）：
 *  ① 对面在还没发布的章里：第四章正文未转、或只在未交章节的大纲里提到；
 *  ② 连带假警报：对面那一场（或那封信）这一轮没转出来，它原文里明明写着这个 flag。
 * 引擎代码直接用到的（换图、互斥表、登基前置）另标「引擎读取」，也不算空转。
 */
export interface FlagAuditContext {
  engineText: string; outlineText: string; knownText: string;
  /** 待发布章节的试转结果（不落盘），用来认出「对面在第四章」 */
  pending?: ConvertResult;
  /** 登记表，默认空。CLI 传 FLAG_LEDGER */
  ledger?: FlagLedgerEntry[];
}

/** 一个缺了读或写的 flag。expected 为空 = 真正的空缺／空转 */
export interface FlagGap { name: string; missing: "reads" | "writes"; sites: string[]; expected: string }

const flagMention = (name: string) => new RegExp(`(?<![a-z0-9_])(flag\\.)?${name}(?![a-z0-9_])`);

/** 体检的判定部分：flagAudit 拿它出报告，flagIssues 拿它挡转换，两边不许各判各的 */
export function flagFindings(r: ConvertResult, ctx: FlagAuditContext): {
  reads: Map<string, string[]>; writes: Map<string, string[]>; gaps: FlagGap[];
  pending?: ReturnType<typeof collectFlags> & { chapters: Set<number>; unconverted: NonNullable<ConvertResult["unconverted"]> };
} {
  const { reads, writes } = collectFlags(r);
  const released = new Set(r.scenes.map(s => s.chapter));
  const pending = ctx.pending ? (() => {
    const chapters = new Set([...ctx.pending!.scenes.map(s => s.chapter), ...(ctx.pending!.unconverted ?? []).map(u => u.chapter)].filter(c => !released.has(c)));
    const only: ConvertResult = { ...ctx.pending!, scenes: ctx.pending!.scenes.filter(s => chapters.has(s.chapter)),
      letters: ctx.pending!.letters.filter(l => chapters.has(Number(/^lt_ch(\d+)/.exec(l.id)?.[1]))), duels: [], endings: [], poems: [] };
    return { ...collectFlags(only), chapters, unconverted: (ctx.pending!.unconverted ?? []).filter(u => !released.has(u.chapter)) };
  })() : undefined;
  const failedHere = (r.unconverted ?? []).filter(u => released.has(u.chapter));
  const mentions = (text: string, name: string) => flagMention(name).test(text);
  const sites = (xs: string[]) => `${xs.slice(0, 3).map(x => `\`${x}\``).join("、")}${xs.length > 3 ? ` 等 ${xs.length} 处` : ""}`;
  const chapterOfSite = (site: string) => Number(/ch(\d+)/.exec(site)?.[1] ?? NaN);

  /** 这个 flag 缺的那一头（写或读）为什么缺。返回空串 = 真空缺 */
  const expected = (name: string, missing: "writes" | "reads"): string => {
    const failed = failedHere.filter(u => u[missing].includes(name)).map(u => u.label);
    if (failed.length) return `② 连带：${failed.join("、")} 这一轮没转出来，原文里写着它`;
    const inPending = pending?.[missing].get(name);
    if (inPending?.length) {
      const chs = [...new Set(inPending.map(chapterOfSite).filter(n => !Number.isNaN(n)))].sort();
      return `① ${missing === "writes" ? "写入点" : "读取者"}在待发布的第 ${chs.join("、")} 章（${sites(inPending)}）`;
    }
    const pendingFailed = (pending?.unconverted ?? []).filter(u => u[missing].includes(name)).map(u => u.label);
    if (pendingFailed.length) return `① ${missing === "writes" ? "写入点" : "读取者"}在待发布章节（${pendingFailed.join("、")}，试转未过）`;
    const prefix = /^ch(\d+)_/.exec(name);
    if (prefix && !released.has(Number(prefix[1]))) return `① 第 ${Number(prefix[1])} 章还没发布${mentions(ctx.outlineText, name) ? "，大纲里有" : "；**大纲里也没有，交正文时要复查**"}`;
    if (mentions(ctx.outlineText, name)) return "① 未发布章节的大纲提到";
    return "";
  };
  const gap = (name: string, missing: "reads" | "writes"): FlagGap => ({
    name, missing, sites: (missing === "reads" ? writes : reads).get(name)!,
    // 写了没人读、但引擎在读：不是空转，而且读它的就是引擎，不必再往大纲里找
    expected: missing === "reads" && mentions(ctx.engineText, name) ? "引擎读取" : expected(name, missing),
  });
  const gaps = [
    ...[...reads.keys()].filter(n => !writes.has(n)).sort().map(n => gap(n, "writes")),
    ...[...writes.keys()].filter(n => !reads.has(n)).sort().map(n => gap(n, "reads")),
  ];
  return { reads, writes, gaps, pending };
}

export function flagAudit(r: ConvertResult, ctx: FlagAuditContext): string {
  const { reads, writes, gaps, pending } = flagFindings(r, ctx);
  const released = new Set(r.scenes.map(s => s.chapter));
  const ledger = ctx.ledger ?? [];
  const mentions = (text: string, name: string) => flagMention(name).test(text);
  const sites = (xs: string[]) => `${xs.slice(0, 3).map(x => `\`${x}\``).join("、")}${xs.length > 3 ? ` 等 ${xs.length} 处` : ""}`;
  const esc = (x: string) => x.replace(/\|/g, "\\|");

  const row = (n: string, sitesOf: string[], exp: string) =>
    `| \`${n}\` | ${sites(sitesOf)} | ${mentions(ctx.engineText, n) ? "有" : "—"} | ${mentions(ctx.knownText, n) ? "已点名" : "新"} | ${exp || "—"} |`;
  const head = "| flag | 在哪里 | 引擎代码提到 | 缺口清单 | 已知预期 |\n|---|---|---|---|---|";
  const split = (missing: "writes" | "reads") => {
    const mine = gaps.filter(g => g.missing === missing);
    const real = mine.filter(g => !g.expected), known = mine.filter(g => g.expected);
    const open = real.filter(g => !ledger.some(e => e.flag === g.name));
    const logged = real.flatMap(g => ledger.filter(e => e.flag === g.name).map(e => ({ g, e })));
    return [
      `### 真正的${missing === "writes" ? "空缺" : "空转"}（${real.length}）`, "",
      `未登记的 ${open.length} 个挡转换；登记了判定的 ${logged.length} 个降为待交付，等「了结」那一栏写的人处理。`, "",
      open.length ? head + "\n" + open.map(g => row(g.name, g.sites, "")).join("\n") : "未登记：无。", "",
      ...(logged.length ? [
        "| flag | 在哪里 | 判定 | 为什么 | 了结 |", "|---|---|---|---|---|",
        ...logged.map(({ g, e }) => `| \`${g.name}\` | ${sites(g.sites)} | ${e.verdict} | ${esc(e.why)} | ${esc(e.fix)} |`), "",
      ] : []),
      `### 已知预期（${known.length}）`, "",
      known.length ? head + "\n" + known.map(g => row(g.name, g.sites, g.expected)).join("\n") : "无。", "",
    ];
  };
  const noWriter = gaps.filter(g => g.missing === "writes");
  const noReader = gaps.filter(g => g.missing === "reads");
  // D-061：玩家怎么回信，之后要有人提起。逐封信、逐种回法看它写的 flag 有没有读取者
  const echo = (outcome: any): string => {
    const names = Object.keys(outcome?.effects ?? {}).filter(k => k.startsWith("flag.")).map(k => k.slice(5));
    if (!names.length) return "（不写 flag）";
    const here = names.flatMap(n => reads.get(n) ?? []);
    if (here.length) return `✓ ${sites(here)}`;
    const later = names.flatMap(n => pending?.reads.get(n) ?? []);
    if (later.length) return `待发布 ${sites(later)}`;
    const laterRaw = (pending?.unconverted ?? []).filter(u => names.some(n => u.reads.includes(n))).map(u => u.label);
    if (laterRaw.length) return `待发布 ${laterRaw.join("、")}（试转未过）`;
    return "**无**";
  };
  const letterRows = (r.letters as any[]).slice().sort((a, b) => a.id.localeCompare(b.id)).map(l => {
    const cells = [...l.replies.plain.map(echo), echo(l.replies.poem.onResonant), echo(l.replies.silence)];
    return "| `" + l.id + "` | " + cells.join(" | ") + " |";
  });
  const echoSection = [
    "## 三、回信的回声（D-061）", "",
    "每封信、每种回法写下的 flag，之后有没有人读。✓ 是已发布的章里读了；「待发布」是还没发布的章里读了（那一章转进来之后会变成 ✓）；**无** 是玩家这样回了、之后谁也没提。以诗代答只看「合意象」那一栏。", "",
    "| 信 | 直言 A | 直言 B | 直言 C | 以诗代答 | 不回 |", "|---|---|---|---|---|---|",
    ...letterRows, "",
  ];
  const pendingNote = pending?.chapters.size ? `待发布章节：第 ${[...pending.chapters].sort().join("、")} 章（试转，不落盘）。` : "没有提供待发布章节。";
  return [
    "# flag 体检", "",
    "> 由 `tools/convert-story.ts` 在每次转换后生成，读的是 `src/data/converted/` 加结局表。不要手改。", "",
    `已发布的章：第 ${[...released].sort().join("、")} 章。${pendingNote}全库读取 ${reads.size} 个 flag、写入 ${writes.size} 个。`, "",
    "「已知预期」两类：**①** 对面在还没发布的章里；**②** 对面那一场这一轮没转出来，属于连带假警报。「引擎读取」是引擎代码直接用的，也不算空转。只有「真正的空缺／空转」需要有人去补。", "",
    "D-091 之后立绘按 flag 选，没人读的 flag 和拼错的 flag 在数据里长得一模一样。所以真正的空缺／空转不许悬着：没登记的挡转换，登记表在 `tools/convert-flag-ledger.json`。", "",
    `## 一、被读取，但已发布的章里没有写入点（${noWriter.length}）`, "",
    ...split("writes"),
    `## 二、被写入，但已发布的章里没有读取者（${noReader.length}）`, "",
    ...split("reads"),
    ...echoSection,
  ].join("\n");
}


export function runCli(args: string[]): number {
  const root = resolve(import.meta.dirname, "..");
  // --pending 之后的文件：还没发布的章（比如刚交、未审的第四章）。只试转、只喂给 flag 体检，不写任何产物
  const pi = args.indexOf("--pending");
  const pendingFiles = pi >= 0 ? args.slice(pi + 1) : [];
  const mainArgs = pi >= 0 ? args.slice(0, pi) : args;
  const all = mainArgs.includes("--all");
  const files = all ? readdirSync(join(root, "docs")).filter(f => /^C.*\.md$/.test(f)).sort().map(f => `docs/${f}`) : mainArgs;
  if (!files.length || files.some(f => f.startsWith("--")) || pendingFiles.some(f => f.startsWith("--"))) {
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
  // 分支图与 flag 体检：每次转换都重画，免得又出现「图还停在第一章」这种事（缺口清单第 5 条）
  const walkTs = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(d =>
    d.isDirectory() ? (d.name === "data" ? [] : walkTs(join(dir, d.name))) : d.name.endsWith(".ts") ? [join(dir, d.name)] : []);
  const engineText = walkTs(join(root, "src")).map(f => readFileSync(f, "utf8")).join("\n");
  // 只算还没发布的那些章的大纲：一章已经转出来了，它大纲里的提及就不再是「以后会有人读」的凭据
  const releasedChapters = new Set(result.scenes.map(x => x.chapter));
  const outlineChapter = (md: string) => Number(/\|\s*ch(\d+)-\d+/.exec(md)?.[1] ?? NaN);
  const outlineText = inputs.filter(i => /大纲/.test(i.file) && !releasedChapters.has(outlineChapter(i.markdown))).map(i => i.markdown).join("\n");
  const knownPath = join(root, "docs", "00b-缺口清单.md");
  const knownText = existsSync(knownPath) ? readFileSync(knownPath, "utf8") : "";
  writeFileSync(join(root, "docs", "story-graph.md"), storyGraph(result), "utf8");
  const pendingInputs = pendingFiles.map(file => ({ file: relative(root, resolve(root, file)).split("\\").join("/"), markdown: readFileSync(resolve(root, file), "utf8") }));
  const pending = pendingInputs.length ? convertBatch([...inputs, ...pendingInputs]) : undefined;
  const flagCtx: FlagAuditContext = { engineText, outlineText, knownText, pending, ledger: FLAG_LEDGER };
  writeFileSync(join(root, "docs", "convert-flags.md"), flagAudit(result, flagCtx), "utf8");
  // 放在正式数据写完之后：体检条目挂在正文文件上，不该反过来挡住诗词库和结局表的合并
  result.issues.push(...flagIssues(result, flagCtx, inputs));
  writeFileSync(manifestPath, JSON.stringify({
    inputs: inputs.map(i => ({ file: i.file, sha256: createHash("sha256").update(i.markdown).digest("hex") })),
    scenes: result.scenes.map(s => s.id), poems: result.poems.map(p => p.id), duels: result.duels.map(d => d.id), letters: result.letters.map(l => l.id), endings: result.endings.map(e => e.key),
    issues: result.issues.length,
  }, null, 2) + "\n", "utf8");
  // 人写在问题单末尾的补记（CC1 的处理记录等）原样带过去，别让自动生成把它冲掉
  const issuePath = join(root, "docs", "convert-issues.md");
  const tail = existsSync(issuePath) ? manualTail(readFileSync(issuePath, "utf8")) : "";
  writeFileSync(issuePath, issueReport(result) + `\n---\n\n${MANUAL_MARK}\n${tail}`, "utf8");
  if (pending) {
    const own = pending.issues.filter(i => pendingInputs.some(p => p.file === i.file));
    const released = new Set(result.scenes.map(x => x.chapter));
    const extra = pending.scenes.filter(x => !released.has(x.chapter));
    console.log(`待发布（不落盘）：${pendingInputs.map(p => p.file).join("、")} 试转出 ${extra.length} 场；${own.length} 个问题`);
  }
  console.log(`转换至 ${relative(root, out)}：${result.scenes.length} 场，${result.poems.length} 首诗，${result.duels.length} 局，${result.letters.length} 封信；${result.issues.length} 个问题。`);
  // 「待交付」是排期，不是错：原文没毛病，等下一批交了重跑就好，不该让它挡住别人的流水线
  const blocking = result.issues.filter(i => !["待交付", "警告"].includes(i.kind ?? classify(i.message)));
  if (!blocking.length && result.issues.length) console.log(`其中 ${result.issues.length} 条都是待交付或警告，不算错。`);
  return blocking.length ? 1 : 0;
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try { process.exitCode = runCli(process.argv.slice(2)); }
  catch (e) { console.error((e as Error).message); process.exitCode = 2; }
}
