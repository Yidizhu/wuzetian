import type { LetterT } from "./schema.ts";
import type { GameState } from "./state.ts";
import { Store } from "./state.ts";
import { meets } from "./conditions.ts";
import { INBOX_UNREAD_MAX, type LetterSlot } from "./types.ts";

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
    }
  }

  get(id: string): LetterT | undefined { return this.byId.get(id); }

  private slot(id: string): LetterSlot | undefined {
    return this.store.state.letters.find((s) => s.id === id);
  }

  /** 场景结束时调用：触发本场留的信，推进在路上的信的场次门 */
  onSceneEnd(sceneId: string): void {
    const s = this.store.state;
    // 触发
    for (const l of this.bySceneTrigger.get(sceneId) ?? []) {
      if (this.slot(l.id)) continue;               // 重读不累计
      s.letters.push({ id: l.id, state: "pending", dueAt: 0, repliedWith: null, scenesLeft: l.trigger.kind === "scene" ? l.trigger.afterScenes : 0 });
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
    this.deliver();
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
    const unread = () => s.letters.filter((x) => x.state === "arrived");
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

  /** 被截了、还没进那个朝廷场景的信 */
  pendingIntercept(): LetterT | null {
    const slot = this.store.state.letters.find((x) => x.state === "intercepted" && !x.repliedWith);
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

    let outcome: { effects?: Record<string, number | boolean>; reaction: string; goto?: string; id?: string };
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
    this.store.apply(outcome.effects);
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

/** 给 UI 用：从图鉴里已收的诗挑意象标签 */
export function poemTagsOf(poemId: string, poems: Map<string, { tags: string[] }>): string[] {
  return poems.get(poemId)?.tags ?? [];
}

export function hasLetterSupport(s: GameState): boolean {
  return Array.isArray(s.letters);
}
