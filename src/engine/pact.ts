import type { GameState } from "./state.ts";

/**
 * 当前关系状态（B27，D-158 顺序里的「CC1 定字段」）。给第四章选择时刻、「那我算什么」用。
 *
 * **为什么不接着用 flag**：现在的剧本已经在拿 flag 手搓状态机——`li_ch02_private_no` 被写成「假」六次、
 * `shen_ch03_letter_stop` 被写成「假」二十次，都是为了让「后来的答复盖掉先前的答复」。
 * 这样一来「同一个人的私约同时有效又已停」写得出来，而没有任何东西拦。
 * 这里改成**每个人一个值**：同一时刻只能是一种状态，写错值校验器拦。
 *
 * **历史和当前分开**（C35 接续清单第一条）：回过哪封信、吻过没有，照旧是 flag，永远留着；
 * 这里只存「现在」，会被后来的谈话改掉。
 *
 * 键（四条恋爱线：沈衡、裴照夜、温荞、李令仪。柳承欢不进这张表，C35 写明）：
 *
 * | 键 | 值 | 意思 |
 * |---|---|---|
 * | `pact.<人>`   | none／active／paused／ended／declined | 私约：没有过／仍有效／暂缓／主角说停／她说停 |
 * | `told.<人>`   | 真／假 | 她已亲耳听主角说清「现在还和谁有私约」 |
 * | `answer.<人>` | none／only／open／no／wait | 她对这一问的答复：没答／愿意只彼此／知情后愿意不只彼此／不愿意／先去说完 |
 * | `asked.<人>`  | 真／假 | 主角这一轮点了要问她 |
 * | `intent`      | none／only／open／solo | 主角这一轮的意向：没说／只同一人／不只一人／独自过一阵 |
 *
 * 只读的派生键（只能写在条件里）：
 *
 * | 键 | 值 | 意思 |
 * |---|---|---|
 * | `love.<人>`    | 真／假 | 现在双方相爱：私约有效，且她答了 open；或答了 only 而主角已没有别的有效私约 |
 * | `pacts.active` | 数 | 现在有几份有效私约 |
 * | `pacts.love`   | 数 | 现在和几个人双方相爱 |
 *
 * 引擎守的三条规则（和 flag 互斥同一个办法：写的时候当场收拾，不靠剧本记得）：
 * 1. **她答「不愿意」，私约就是她说停**：`answer.X = no` 同时写 `pact.X = declined`。
 * 2. **信息变了，要重新告知、重新答**（C35「以后若新增对象、信息变化或有人说停，需要新的告知与答复」）：
 *    谁的私约一变，其余私约还有效或暂缓的人，`told` 清掉，答过的 only／open／wait 清回 none。
 * 3. **晚拆的旧信不冲掉新的谈话**（C35「旧信延迟拆读不得自动冲掉较新的暂停或拒绝」）：
 *    回信里的效果只能写 `pact`；只能从 none 开成 active、或把 active 停下，不能把暂缓／已停／她说停的私约重新打开；
 *    这封信触发之后她的私约又变过，这封信对她的私约不再起作用。
 */

export const LOVE_KEYS = ["shenheng", "peizhaoye", "wenqiao", "liqinghe"] as const;
export const PACT_STATES = ["none", "active", "paused", "ended", "declined"] as const;
export const ANSWERS = ["none", "only", "open", "no", "wait"] as const;
export const INTENTS = ["none", "only", "open", "solo"] as const;

export type PactState = (typeof PACT_STATES)[number];

/** 存进存档的那一份 */
export interface RelationState {
  /** 写过的键 → 值。没写过的按默认（none／假） */
  values: Record<string, string | boolean>;
  /** `pact.<人>` → 最后一次变的时刻（clock 的值）。规则 3 靠它 */
  at: Record<string, number>;
  /** 每变一次私约 +1。不是时间戳：同一毫秒里的两次谈话也要分得出先后 */
  clock: number;
}

export function newRelationState(): RelationState {
  return { values: {}, at: {}, clock: 0 };
}

export interface RelationKeyInfo {
  field: "pact" | "told" | "answer" | "asked" | "intent" | "love" | "pacts";
  who?: string;
  /** 取值：枚举列出来；布尔是 "bool"；派生计数是 "number" */
  kind: readonly string[] | "bool" | "number";
  /** 能不能写在效果里 */
  writable: boolean;
}

const LOVE = LOVE_KEYS as readonly string[];

/** 认一个键。不是关系键返回 null；是关系键但人不对、字段不对也返回 null（校验器据此报错） */
export function relationKey(key: string): RelationKeyInfo | null {
  if (key === "intent") return { field: "intent", kind: INTENTS, writable: true };
  if (key === "pacts.active" || key === "pacts.love") return { field: "pacts", who: key.slice(6), kind: "number", writable: false };
  const m = /^(pact|told|answer|asked|love)\.([a-z]+)$/.exec(key);
  if (!m || !LOVE.includes(m[2]!)) return null;
  const field = m[1] as RelationKeyInfo["field"];
  const who = m[2]!;
  switch (field) {
    case "pact": return { field, who, kind: PACT_STATES, writable: true };
    case "answer": return { field, who, kind: ANSWERS, writable: true };
    case "told": case "asked": return { field, who, kind: "bool", writable: true };
    default: return { field, who, kind: "bool", writable: false };
  }
}

/** 这个键长得像关系键（前缀对），不管人对不对。校验器用它区分「写错了人」和「根本不是关系键」 */
export function looksLikeRelationKey(key: string): boolean {
  return key === "intent" || /^(pact|told|answer|asked|love|pacts)\./.test(key);
}

function get(s: GameState, key: string): string | boolean {
  const v = s.relation.values[key];
  if (v !== undefined) return v;
  return key.startsWith("told.") || key.startsWith("asked.") ? false : "none";
}

function others(who: string): string[] {
  return LOVE.filter((k) => k !== who);
}

function loves(s: GameState, who: string): boolean {
  if (get(s, `pact.${who}`) !== "active") return false;
  const a = get(s, `answer.${who}`);
  if (a === "open") return true;
  return a === "only" && others(who).every((o) => get(s, `pact.${o}`) !== "active");
}

/** 读一个关系键的当前值。计数返回数，其余返回字符串或布尔 */
export function readRelation(key: string, s: GameState): string | boolean | number {
  const info = relationKey(key);
  if (!info) return 0;
  if (info.field === "love") return loves(s, info.who!);
  if (key === "pacts.active") return LOVE.filter((w) => get(s, `pact.${w}`) === "active").length;
  if (key === "pacts.love") return LOVE.filter((w) => loves(s, w)).length;
  return get(s, key);
}

/** 效果从哪来。回信要守规则 3 */
export interface EffectSource {
  /** 回信：这封信触发那一刻的 clock（LetterSlot.rev） */
  letterRev?: number;
  /** 哪封信，只用来打日志 */
  letterId?: string;
}

/**
 * 写一个关系键。返回实际变了的键（含规则连带改掉的），和 Store.apply 的返回一样给 UI 用。
 * 值不合法、只读键、回信越权：不写，warn/info 出来，返回空。
 */
export function applyRelation(s: GameState, key: string, value: string | boolean, from: EffectSource = {}): string[] {
  const info = relationKey(key);
  if (!info || !info.writable) {
    console.warn(`[pact] ${key} 不是能写的关系键`);
    return [];
  }
  const ok = info.kind === "bool" ? typeof value === "boolean" : typeof value === "string" && (info.kind as readonly string[]).includes(value);
  if (!ok) {
    console.warn(`[pact] ${key} 不能写成 ${String(value)}`);
    return [];
  }

  // 规则 3：回信
  if (from.letterRev !== undefined) {
    const tag = from.letterId ? `回信 ${from.letterId}` : "回信";
    if (info.field !== "pact") {
      console.warn(`[pact] ${tag} 想写 ${key}。回信只能动私约本身；告知、答复、意向要当面说`);
      return [];
    }
    if ((s.relation.at[key] ?? 0) > from.letterRev) {
      console.info(`[pact] ${tag} 是在 ${key} 最近一次变动之前触发的，晚拆不冲掉后来的谈话`);
      return [];
    }
    const cur = get(s, key);
    if (value === "active" && cur !== "none" && cur !== "active") {
      console.info(`[pact] ${tag} 不能把 ${key}=${String(cur)} 重新打开，要有新的当面谈话`);
      return [];
    }
  }

  if (get(s, key) === value) return [];
  s.relation.values[key] = value;
  const changed = [key];

  if (info.field === "pact") {
    s.relation.clock += 1;
    s.relation.at[key] = s.relation.clock;
    // 规则 2
    for (const o of others(info.who!)) {
      const p = get(s, `pact.${o}`);
      if (p !== "active" && p !== "paused") continue;
      if (get(s, `told.${o}`) === true) { s.relation.values[`told.${o}`] = false; changed.push(`told.${o}`); }
      const a = get(s, `answer.${o}`);
      if (a === "only" || a === "open" || a === "wait") { s.relation.values[`answer.${o}`] = "none"; changed.push(`answer.${o}`); }
    }
  }
  // 规则 1
  if (info.field === "answer" && value === "no") changed.push(...applyRelation(s, `pact.${info.who}`, "declined"));
  return changed;
}
