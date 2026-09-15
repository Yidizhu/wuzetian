import type { LetterT } from "./schema.ts";
import type { GameState } from "./state.ts";
import { Store } from "./state.ts";
import { meets } from "./conditions.ts";
import { INBOX_UNREAD_MAX, SOLAR_TERM_CHAPTER, type LetterSlot } from "./types.ts";

/**
 * 笺：投递队列。机制见 docs/机制设计-v1.md 第 1 节，数据格式见 story-schema 2.4。
 *
 * 一封信从触发到送达要过两道门（C-4「双门槛」）：
 *   1. 场次门：触发场景结束后再走 afterScenes 场；
 *   2. 时间门：真实时间再过 delayMinutes 分钟。
 * 两道都过才到。时间门存的是绝对时间戳 dueAt，不是倒计时——
 * 关掉游戏那段时间信照走，回来一次收齐，一封不少（不绑架规则）。
 *
 * 未读上限 3。第 4 封到达时最旧的一封转 intercepted，跳它的 onIntercept
 * （不堆积规则：这不是惩罚，是剧情——宫里有人在看你的信）。
 */

export type ReplyKind = "plainA" | "plainB" | "plainC" | "poemResonant" | "poemMismatch" | "silence";

export interface ReplyResult {
  /** 她的反应。她不回时为 null，口头话留到相见 */
  reaction: string | null;
  goto?: string;
  /** 是否石沉大海（sheMayNotReply 命中） */
  silent: boolean;
}

export class Letters {
  private byId = new Map<string, LetterT>();
  private bySceneTrigger = new Map<string, LetterT[]>();
  /** 有固定截获点的信，按那一场分组（D-039 第 2 条） */
  private byInterceptAt = new Map<string, LetterT[]>();

  /** 同 story.ts：engine 下不用构造参数属性，否则无头工具跑不起来 */
  private store: Store;

  constructor(letters: LetterT[], store: Store) {
    this.store = store;
    for (const l of letters) {
      this.byId.set(l.id, l);
      if (l.trigger.kind === "scene") {
        const arr = this.bySceneTrigger.get(l.trigger.sceneId) ?? [];
        arr.push(l);
        this.bySceneTrigger.set(l.trigger.sceneId, arr);
      }
      if (l.interceptAt) {
        const arr = this.byInterceptAt.get(l.interceptAt) ?? [];
        arr.push(l);
        this.byInterceptAt.set(l.interceptAt, arr);
      }
    }
  }

  get(id: string): LetterT | undefined { return this.byId.get(id); }

  private slot(id: string): LetterSlot | undefined {
    return this.store.state.letters.find((s) => s.id === id);
  }

  /**
   * 节令信（D-184，B33）：这一章第一个闲场之后送到，一章一封。
   *
   * - **闲场**：`weightless` 的那些场。节令笺是私人的东西，跟在办完事之后、不打断正事。
   * - 好感不够（信自己写的下限）就等这一章下一个闲场；整章过完都不够，记一笔「错过了」，不再送。
   * - 不占未读上限、不会被截：见 `deliver()`。
   */
  private solarTerms(scene: { id: string; chapter: number; weightless?: boolean }): void {
    const s = this.store.state;
    for (const l of this.byId.values()) {
      if (l.trigger.kind !== "solarTerm") continue;
      if (this.slot(l.id)) continue;
      const want = SOLAR_TERM_CHAPTER[l.trigger.term];
      if (scene.chapter > want) {
        // 这一章走完了都没送出去：记一笔，案上不会再出现它
        s.letters.push({ id: l.id, state: "lost", dueAt: 0, repliedWith: null });
        console.info(`[letters] ${l.id}（${l.trigger.term}）第 ${want} 章没送出去，记作错过`);
        continue;
      }
      if (scene.chapter !== want || !scene.weightless) continue;
      if ((s.affinity[l.from] ?? 0) < l.trigger.minAffinity) continue;   // 交情还不到，等这一章下一个闲场
      s.letters.push({ id: l.id, state: "pending", dueAt: Date.now() + l.delayMinutes * 60_000, repliedWith: null, rev: s.relation.clock });
    }
  }

  /** 这一封是不是节令信：不占未读上限、不会被截 */
  private isSolar(id: string): boolean {
    return this.byId.get(id)?.trigger.kind === "solarTerm";
  }

  /** 场景结束时调用：触发本场留的信，推进在路上的信的场次门。返回这一下送到案上的信 */
  onSceneEnd(scene: { id: string; chapter: number; weightless?: boolean } | string): string[] {
    const s = this.store.state;
    const sceneId = typeof scene === "string" ? scene : scene.id;
    if (typeof scene !== "string") this.solarTerms(scene);
    // 触发
    for (const l of this.bySceneTrigger.get(sceneId) ?? []) {
      if (this.slot(l.id)) continue;               // 重读不累计
      s.letters.push({ id: l.id, state: "pending", dueAt: 0, repliedWith: null, scenesLeft: l.trigger.kind === "scene" ? l.trigger.afterScenes : 0, rev: s.relation.clock });
    }
    // 场次门
    for (const slot of s.letters) {
      if (slot.state !== "pending" || slot.dueAt) continue;
      if (slot.scenesLeft === undefined) continue;
      slot.scenesLeft -= 1;
      if (slot.scenesLeft <= 0) {
        const l = this.byId.get(slot.id);
        slot.dueAt = Date.now() + (l?.delayMinutes ?? 10) * 60_000;   // 时间门开始计时
      }
    }
    return this.deliver();
  }

  /** 把 dueAt 已过的信送到案上。启动时也要调一次：不在的这段时间到的信一次收齐 */
  deliver(): string[] {
    const s = this.store.state;
    const now = Date.now();
    const arrived: string[] = [];
    for (const slot of s.letters) {
      if (slot.state === "pending" && slot.dueAt && slot.dueAt <= now) {
        slot.state = "arrived";
        arrived.push(slot.id);
      }
    }
    // 未读上限。超了就截一封——但只截剧本安排好会被截的那种。
    //
    // 被截是一场戏：信在朝堂上被念出来，主角要当场应对。没有 onIntercept 去向的信
    // 一旦被截就是凭空消失：案上没有、剧情里也没有，玩家只知道有人给她写过信，
    // 然后信不见了，还不知道为什么。宁可让案上多躺一封，也不要那样丢东西。
    // 节令信不算在这三封里，也不会被选中截走（D-184）：它是私人的节令笺，不该在公议上被念出来，
    // 也不该因为玩家攒着不拆，就把剧情信挤成「被截」
    const unread = () => s.letters.filter((x) => x.state === "arrived" && !this.isSolar(x.id));
    while (unread().length > INBOX_UNREAD_MAX) {
      const victim = unread().find((x) => {
        const l = this.byId.get(x.id);
        return l?.interceptable && l.onIntercept?.goto;
      });
      if (!victim) {
        console.info(`[letters] 案上 ${unread().length} 封未读，超过上限 ${INBOX_UNREAD_MAX}，但没有一封是剧本允许被截的，都留着`);
        break;
      }
      victim.state = "intercepted";
      console.warn(`[letters] 未读超过 ${INBOX_UNREAD_MAX} 封，${victim.id} 被截了`);
    }
    return arrived;
  }

  /** 案上有几封没读 */
  unreadCount(): number {
    return this.store.state.letters.filter((x) => x.state === "arrived").length;
  }

  /** 案上的信，按到达先后 */
  onDesk(): LetterT[] {
    return this.store.state.letters
      .filter((x) => x.state === "arrived" || x.state === "read")
      .map((x) => this.byId.get(x.id))
      .filter((l): l is LetterT => !!l);
  }

  /**
   * 固定截获点（D-039 第 2 条）：走进这一场，该被截的那封信当场被截。
   *
   * 三种状态都要截：还在路上（pending）、到了没读（arrived）、读了没回（read）。
   * 唯独**已经回过的不截**——她要是已经把话说完了，这封信在公议上被展开就没有戏了，
   * 那一幕会变成重复交代一件玩家已经处理完的事。
   *
   * 返回被截的那封，没有就是 null。
   */
  forceInterceptAt(sceneId: string): LetterT | null {
    const s = this.store.state;
    for (const l of this.byInterceptAt.get(sceneId) ?? []) {
      let slot = this.slot(l.id);
      if (!slot) {
        // 还没触发就走到了截获点：信照样存在，只是玩家没等到它送来
        slot = { id: l.id, state: "pending", dueAt: 0, repliedWith: null, scenesLeft: 0, rev: s.relation.clock };
        s.letters.push(slot);
      }
      if (slot.state === "replied" || slot.repliedWith) continue;
      // 早先因为未读攒满已经被截了（D-124）：那时没有跳场，就等玩家自己走到这里，这一场就是它被当众展开的地方
      if (slot.state === "intercepted") {
        console.info(`[letters] ${l.id} 早先因未读攒满被截，到 ${sceneId} 才当众展开`);
        return l;
      }
      slot.state = "intercepted";
      console.info(`[letters] ${l.id} 在 ${sceneId} 被强制截下（D-039）`);
      return l;
    }
    return null;
  }

  /**
   * 被截了、还没进那个朝廷场景、而且**要当场跳过去**的信。
   *
   * 有固定截获点（`interceptAt`）的信不在这里：它的截获场本来就在主线上，玩家自己会走到。
   * 未读攒满时当场跳过去，等于把玩家从这里一把拉到截获场，中间几场整段跳过——
   * D-124：第一章四封信只拆 0 或 1 封的玩家，第二章 06—10 就是这样没了，而每一场单看都合法。
   * 这种信被截之后留在 intercepted，走进截获场时由 forceInterceptAt 接住。
   */
  pendingIntercept(): LetterT | null {
    const slot = this.store.state.letters.find((x) =>
      x.state === "intercepted" && !x.repliedWith && !this.byId.get(x.id)?.interceptAt);
    return slot ? this.byId.get(slot.id) ?? null : null;
  }

  markRead(id: string): void {
    const slot = this.slot(id);
    if (slot && slot.state === "arrived") slot.state = "read";
  }

  /**
   * 回信。六种回法互斥，各结算一次。
   * 「她可能不回」在收到答复时、加本次好感之前判断（C-4）：命中就石沉大海，
   * 效果照算但不生成书面回应，口头话留到真的相见。
   */
  reply(id: string, kind: ReplyKind, poemTags: string[] = []): ReplyResult | null {
    const l = this.byId.get(id);
    const slot = this.slot(id);
    if (!l || !slot || slot.state === "replied") return null;

    const silent = meets(l.sheMayNotReply, this.store.state) && !!l.sheMayNotReply;

    let outcome: { effects?: Record<string, number | boolean | string>; reaction: string; goto?: string; id?: string };
    let repliedWith = kind as string;
    switch (kind) {
      case "plainA": outcome = l.replies.plain[0]!; repliedWith = `plain:${outcome.id ?? "A"}`; break;
      case "plainB": outcome = l.replies.plain[1]!; repliedWith = `plain:${outcome.id ?? "B"}`; break;
      case "plainC": outcome = l.replies.plain[2]!; repliedWith = `plain:${outcome.id ?? "C"}`; break;
      case "poemResonant":
      case "poemMismatch": {
        const hit = poemTags.some((t) => l.replies.poem.resonantTags.includes(t));
        outcome = hit ? l.replies.poem.onResonant : l.replies.poem.onMismatch;
        repliedWith = hit ? "poem:resonant" : "poem:mismatch";
        break;
      }
      case "silence": outcome = l.replies.silence; break;
    }
    // 回信动私约守 pact.ts 规则 3：这封信触发之后她的私约又变过，就不再起作用
    this.store.apply(outcome.effects, { letterRev: slot.rev ?? 0, letterId: id });
    slot.state = "replied";
    slot.repliedWith = repliedWith;
    return { reaction: silent ? null : outcome.reaction, goto: outcome.goto, silent };
  }

  /** 某封信被截之后进那个朝廷场景，回来时标一下免得重复 */
  consumeIntercept(id: string): string | null {
    const l = this.byId.get(id);
    const slot = this.slot(id);
    if (!l || !slot) return null;
    slot.repliedWith = "intercepted";
    return l.onIntercept?.goto ?? null;
  }
}

/**
 * 这封信此刻该显示哪几段附页（D-044）。
 *
 * `when` 空的段落总是出现；其余按当时的 flag 取。顺序就是剧本里的顺序。
 *
 * 放在引擎而不是 Inbox：哪几段出现是**规则**，不是画法。信被截了在朝堂上宣读，
 * 走的也是这条规则，那一处根本没有信箱界面。
 */
export function pagesFor(l: LetterT, state: GameState): { key: string; text: string; readAloud: boolean }[] {
  return (l.body.pages ?? [])
    .filter((p) => meets(p.when, state))
    .map((p) => ({ key: p.key, text: p.text, readAloud: p.readAloud !== false }));
}

/**
 * 被截之后当众念出来的那几段。
 *
 * 和 pagesFor 的差别只有一处：`readAloud: false` 的那一段被留下了。
 * 被截的伤害不在于念了什么，在于她还有一句没来得及给你，
 * 而所有人都听见了前面那些。
 */
export function readAloudPages(l: LetterT, state: GameState): string[] {
  return pagesFor(l, state).filter((p) => p.readAloud).map((p) => p.text);
}

/** 给 UI 用：从图鉴里已收的诗挑意象标签 */
export function poemTagsOf(poemId: string, poems: Map<string, { tags: string[] }>): string[] {
  return poems.get(poemId)?.tags ?? [];
}

export function hasLetterSupport(s: GameState): boolean {
  return Array.isArray(s.letters);
}
