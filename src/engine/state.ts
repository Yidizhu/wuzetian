import {
  STAT_KEYS, STAT_MIN, STAT_MAX, STAT_START, FLAG_REQUIRES, conflictsOf,
  type Effects, type LetterSlot, type StatKey,
} from "./types.ts";

/**
 * 全局可变状态。所有会进存档的东西都在这里，不在这里的都不进存档。
 * 这条边界是刻意的：存档结构等于这个对象的形状，两边不会漂移。
 */
export interface GameState {
  stats: Record<StatKey, number>;
  affinity: Record<string, number>;
  flags: Record<string, boolean>;
  /**
   * 主角显示名。默认「吾则添」，改名 beat 之后换成玩家选的字。
   * 存档里存的是当时的快照，所以改名前的存档回看仍然显示「添」。
   * 见 开发计划 3.3。
   */
  protagonistName: string;
  /** skip 只跳读过的文本，所以要记住读过哪些句 */
  seenLineIds: Set<string>;
  poemsCollected: Set<string>;
  endingsUnlocked: Set<string>;
  /** 信箱。投递逻辑在 M4，M1 只是把它带进存档。 */
  letters: LetterSlot[];
  /** 上次关掉游戏的时刻。回来时用它算这段时间里有哪些信到了。 */
  lastSeenAt: number;
  /**
   * 见过登场卡的角色（D-048）。一个人只介绍一次——
   * 十一个人每次出场都报一遍职务，第三次就成了噪音。
   */
  introsSeen: Set<string>;
  /** 解锁过的事件图（D-142，B23）。以后回廊用；现在只决定「第一次看要停一拍」 */
  cgsSeen: Set<string>;
}

export const DEFAULT_NAME = "吾则添";

export function newState(): GameState {
  const stats = {} as Record<StatKey, number>;
  for (const k of STAT_KEYS) stats[k] = STAT_START;
  return {
    stats,
    affinity: {},
    flags: {},
    protagonistName: DEFAULT_NAME,
    seenLineIds: new Set(),
    poemsCollected: new Set(),
    endingsUnlocked: new Set(),
    letters: [],
    lastSeenAt: Date.now(),
    introsSeen: new Set(),
    cgsSeen: new Set(),
  };
}

type Listener = (s: GameState) => void;

export class Store {
  private listeners = new Set<Listener>();
  /** 不写成构造参数属性：Node 的 strip-only 模式不支持那个语法，测试跑不起来 */
  state: GameState;
  constructor(initial: GameState = newState()) { this.state = initial; }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  private emit() { for (const fn of this.listeners) fn(this.state); }

  private enforceFlagRules(name: string): string[] {
    const cleared: string[] = [];
    for (const other of conflictsOf(name)) {
      if (this.state.flags[other]) {
        this.state.flags[other] = false;
        cleared.push(`flag.${other}`);
        console.warn(`[state] flag.${name} 与 flag.${other} 互斥，已清掉后者。剧本里这两条路不该同时发生`);
      }
    }
    const need = FLAG_REQUIRES[name];
    if (need && !this.state.flags[need]) {
      console.warn(`[state] flag.${name} 置真时 flag.${need} 还是假。按 C-B 结局树，前者要以后者为前提`);
    }
    return cleared;
  }

  replace(s: GameState) { this.state = s; this.emit(); }

  /** 记住这一句读过了。返回 true 表示这是第一次读到。 */
  markSeen(lineId: string): boolean {
    if (this.state.seenLineIds.has(lineId)) return false;
    this.state.seenLineIds.add(lineId);
    return true;
  }

  setName(name: string) {
    this.state.protagonistName = name;
    this.emit();
  }

  /**
   * 应用一组效果。数值键是增量并夹在 0..20，flag 键是绝对值。
   * 返回实际发生变化的键，UI 拿它做墨晕反馈——只给真的变了的那根线做动效。
   */
  apply(effects: Effects | undefined): string[] {
    if (!effects) return [];
    const changed: string[] = [];
    for (const [key, raw] of Object.entries(effects)) {
      if (typeof raw === "boolean") {
        const name = key.startsWith("flag.") ? key.slice(5) : key;
        if (this.state.flags[name] !== raw) {
          this.state.flags[name] = raw;
          changed.push(key);
        }
        if (raw) changed.push(...this.enforceFlagRules(name));
        continue;
      }
      if (key.startsWith("affinity.")) {
        const who = key.slice(9);
        const before = this.state.affinity[who] ?? 0;
        const after = clamp(before + raw);
        if (after !== before) { this.state.affinity[who] = after; changed.push(key); }
        continue;
      }
      if ((STAT_KEYS as string[]).includes(key)) {
        const k = key as StatKey;
        const before = this.state.stats[k];
        const after = clamp(before + raw);
        if (after !== before) { this.state.stats[k] = after; changed.push(key); }
        continue;
      }
      console.warn(`[state] 认不出的效果键：${key}。校验工具应该在构建期就拦下它`);
    }
    if (changed.length) this.emit();
    return changed;
  }
}

/**
 * flag 写真之后立刻收拾互斥关系，见 C-B 结局树第四节。
 *
 * 冲突的 flag 直接清掉而不是报错退出，是因为一份已经存在的档里同时挂着
 * enthroned 和 declined_crown 会让结局判定取到错的那一个，玩家看到的是
 * 一个和自己经历对不上的结尾。清掉能自愈，同时 warn 出来，作者一眼能看见。
 * 前置条件不满足只 warn 不阻拦：结局树的门槛是叙事约定，不是运行时不变量。
 */
function clamp(v: number): number {
  return Math.max(STAT_MIN, Math.min(STAT_MAX, v));
}

/** 把文本里的 {名} 换成当前的主角名。见 story-schema 1.1 */
export function subst(text: string, s: GameState): string {
  return text.replace(/\{名\}/g, s.protagonistName);
}
