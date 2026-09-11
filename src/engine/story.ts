import type { Choice, Ending, Scene } from "./types.ts";
import { pickEnding, resolveBody } from "./endings.ts";
import { Store, subst } from "./state.ts";
import { meets, missingReason } from "./conditions.ts";
import * as save from "./save.ts";
import type { SceneRenderer } from "../scene/SceneRenderer.ts";
import type { LetterT, PoemDuelT } from "./schema.ts";
import { Letters, type ReplyKind } from "./letters.ts";

/**
 * 需要等玩家操作的界面，由 main 注入。
 * Story 因此仍然不认识 DOM：它只知道「打一局对诗，告诉我赢没赢」。
 */
export interface StoryHooks {
  duel(d: PoemDuelT): Promise<boolean>;
  chapterEnd(chapter: number, poemsThisChapter: string[]): Promise<void>;
}

export interface ChoiceView {
  choice: Choice;
  enabled: boolean;
  lockHint: string | null;
}

export type StoryEvent =
  | { kind: "line"; who: string; expr: string; text: string; lineKind: string; first: boolean }
  | { kind: "choices"; items: ChoiceView[] }
  | { kind: "scene"; scene: Scene }
  | { kind: "ending"; ending: Ending; body: string }
  | { kind: "flare"; who: string }
  | { kind: "letters"; unread: number; arrived: string[] }
  /** 一章走完了，下一章的数据还没有。不是错误，是当前这版的边界（D-034） */
  | { kind: "toBeContinued"; chapter: number }
  | { kind: "end" };

/**
 * 场景机。它只知道 Scene 数据和 Store，不知道 DOM，也不知道背景层长什么样。
 * UI 订阅 on()，背景层通过 renderer 接口被驱动，两边都可以整体替换。
 */
export class Story {
  private scenes = new Map<string, Scene>();
  private cur: Scene | null = null;
  private idx = 0;
  private listeners = new Set<(e: StoryEvent) => void>();

  private endings = new Map<string, Ending>();
  /** 判定顺序就是 endings.json 里的顺序，不要排序 */
  private endingOrder: Ending[] = [];

  private duels = new Map<string, PoemDuelT>();
  /** 本章收到的诗，章末结算页用。跨章清空。 */
  private poemsThisChapter: string[] = [];
  readonly letters: Letters;
  /** 对诗之后先播一句胜负台词，玩家点一下再往下走 */
  private resume: (() => void) | null = null;

  /**
   * engine 下一律不用构造参数属性（`constructor(private x: T)`）。
   * Node 的 strip-only 模式不支持那个语法，一用工具链就跑不了引擎代码，
   * tools/smoke-chapter.ts 这类无头脚本会当场报 ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX。
   */
  private store: Store;
  private renderer: SceneRenderer;
  private hooks: StoryHooks;
  private startId: string;

  constructor(
    scenes: Scene[],
    endings: Ending[],
    duels: PoemDuelT[],
    letters: LetterT[],
    store: Store,
    renderer: SceneRenderer,
    hooks: StoryHooks,
    startId: string,
  ) {
    this.store = store;
    this.renderer = renderer;
    this.hooks = hooks;
    this.startId = startId;
    for (const d of duels) this.duels.set(d.id, d);
    this.letters = new Letters(letters, store);
    for (const s of scenes) this.scenes.set(s.id, s);
    this.endingOrder = endings;
    for (const e of endings) this.endings.set(e.key, e);
  }

  on(fn: (e: StoryEvent) => void): void { this.listeners.add(fn); }
  private emit(e: StoryEvent): void { for (const fn of this.listeners) fn(e); }

  get sceneId(): string { return this.cur?.id ?? this.startId; }
  get lineIndex(): number { return this.idx; }
  get currentScene(): Scene | null { return this.cur; }

  /** 从存档或开头启动 */
  async start(): Promise<void> {
    const s = save.read(save.AUTO_SLOT);
    if (s && this.scenes.has(s.sceneId)) {
      const { state, sceneId, lineIndex } = save.deserialize(s);
      this.store.replace(state);
      // 不在的这段时间到的信一次收齐，一封不少
      const arrived = this.letters.deliver();
      this.emit({ kind: "letters", unread: this.letters.unreadCount(), arrived });
      await this.enter(sceneId, lineIndex);
      return;
    }
    await this.enter(this.startId, 0);
  }

  async restart(): Promise<void> {
    save.clear(save.AUTO_SLOT);
    location.reload();
  }

  private async enter(sceneId: string, lineIndex: number): Promise<void> {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      // 校验器会在构建期拦下断链，这里是最后一道：宁可让玩家看到一个收尾，
      // 也不要留在一个点了没反应的画面上——那是最糟的失败方式。
      console.error(`[story] 找不到场景 ${sceneId}，就地收尾`);
      this.emit({ kind: "end" });
      return;
    }

    // 离开上一场：触发本场留的信，推进在路上的信的场次门
    if (this.cur && this.cur.id !== sceneId) {
      this.letters.onSceneEnd(this.cur.id);
      this.emit({ kind: "letters", unread: this.letters.unreadCount(), arrived: [] });
      // 被截的信优先：进那个朝廷场景，它自己的去向再把人带回主线
      const hit = this.letters.pendingIntercept();
      if (hit) {
        const to = this.letters.consumeIntercept(hit.id);
        if (to && this.scenes.has(to) && to !== sceneId) { this.cur = null; await this.enter(to, 0); return; }
      }
    }

    // 换章就先结算。章号变了就是章末——除非上一场自己标了 chapterEnd，
    // 那一场已经在 runChapterEnd() 里结算过，这里再来一次就是连出两页。
    if (this.cur && !this.cur.chapterEnd && this.cur.chapter !== scene.chapter) {
      await this.hooks.chapterEnd(this.cur.chapter, this.poemsThisChapter);
      this.poemsThisChapter = [];
    }

    this.cur = scene;
    this.idx = lineIndex;

    // 色板跟着场景走。整个 UI 只认 CSS 变量，不知道自己在哪套色板里。
    document.documentElement.dataset.palette = scene.palette;

    const d = { key: scene.scene, palette: scene.palette, act: scene.act };
    await this.renderer.load(d);
    await this.renderer.show(d);

    this.emit({ kind: "scene", scene });
    this.present();
  }

  /** 把当前位置的内容推给 UI */
  private present(): void {
    const scene = this.cur;
    if (!scene) return;
    // 逐句条件（D-026）：不满足的句子直接跳过
    while (this.idx < scene.lines.length && !meets(scene.lines[this.idx]!.when, this.store.state)) {
      this.idx += 1;
    }
    if (this.idx < scene.lines.length) {
      const line = scene.lines[this.idx]!;
      const first = this.store.markSeen(line.id);
      this.emit({
        kind: "line",
        who: line.who,
        expr: line.expr ?? "default",
        text: subst(line.text, this.store.state),
        lineKind: line.kind ?? "say",
        first,
      });
      this.autosave();
      return;
    }
    // 台词读完，先打对诗，再进选项
    if (scene.duel && !this.duelDone.has(scene.id)) {
      const d = this.duels.get(scene.duel);
      if (!d) { console.error(`[story] 场景 ${scene.id} 指向不存在的对局 ${scene.duel}`); }
      else { void this.runDuel(scene.id, d); return; }
    }

    if (scene.choices?.length) {
      this.emit({ kind: "choices", items: this.viewChoices(scene.choices) });
      this.autosave();
      return;
    }
    // 章末（D-034）。排在 goto 前面：这一场的出口是结算页，翻过页才轮到下一章。
    if (scene.chapterEnd && !this.chapterDone.has(scene.id)) {
      this.chapterDone.add(scene.id);
      void this.runChapterEnd(scene);
      return;
    }
    if (scene.goto) { void this.enter(scene.goto, 0); return; }

    const e = scene.judgeEnding ? this.judgeEnding()
            : scene.ending ? this.endings.get(scene.ending) ?? null
            : null;
    if (e) { this.finish(e); return; }
    if (scene.ending) console.error(`[story] 场景 ${scene.id} 指向不存在的结局 ${scene.ending}`);
    this.emit({ kind: "end" });
  }

  private duelDone = new Set<string>();
  /** 已经结算过的章末场。玩家在结算页后面再点一下，不该把结算页再叫出来 */
  private chapterDone = new Set<string>();

  /**
   * 章末：先出结算页，再看下一章在不在。
   *
   * 下一章不在不是错误——发布的时候第二章本来就可能还没写完。
   * 这时候要明明白白告诉玩家「下章待续」，而不是丢一句「没有结局数据」，
   * 那句话是给我看的，不是给她看的。
   */
  private async runChapterEnd(scene: Scene): Promise<void> {
    await this.hooks.chapterEnd(scene.chapter, this.poemsThisChapter);
    this.poemsThisChapter = [];
    if (scene.goto && this.scenes.has(scene.goto)) { await this.enter(scene.goto, 0); return; }
    if (scene.goto) console.info(`[story] 第 ${scene.chapter} 章走完，下一章 ${scene.goto} 还没有数据`);
    this.emit({ kind: "toBeContinued", chapter: scene.chapter });
  }

  /**
   * 打一局对诗。赢了收下这首诗，输了走另一条路——输不是死路，
   * 对方欣赏她敢接，也给一点好感（效果由 duels.json 的 onLose 定）。
   */
  private async runDuel(sceneId: string, d: PoemDuelT): Promise<void> {
    const won = await this.hooks.duel(d);
    this.duelDone.add(sceneId);
    const outcome = won ? d.onWin : d.onLose;
    this.store.apply(outcome?.effects);
    if (won && !this.store.state.poemsCollected.has(d.poemRef)) {
      this.store.state.poemsCollected.add(d.poemRef);
      this.poemsThisChapter.push(d.poemRef);
    }
    const next = async () => {
      if (outcome?.goto) { await this.enter(outcome.goto, 0); return; }
      this.present();
    };
    // 胜负专属的一句台词（D-026）：用普通对话框播，玩家点一下再走
    if (outcome?.line) {
      const l = outcome.line;
      this.store.markSeen(l.id);
      this.emit({ kind: "line", who: l.who, expr: l.expr ?? "default", text: subst(l.text, this.store.state), lineKind: l.kind ?? "say", first: true });
      this.resume = () => void next();
      return;
    }
    await next();
  }

  private judgeEnding(): Ending | null {
    const e = pickEnding(this.endingOrder, this.store.state);
    if (!e) console.error("[story] 结局表没有兜底项。最后一条的判定必须留空");
    return e;
  }

  private finish(e: Ending): void {
    this.store.state.endingsUnlocked.add(e.key);
    // 结局有自己的色板。势高心低那条线回到金碧，画面本身就是判词。
    document.documentElement.dataset.palette = e.palette;
    this.autosave();
    this.emit({ kind: "ending", ending: e, body: subst(resolveBody(e, this.store.state), this.store.state) });
  }

  private viewChoices(choices: Choice[]): ChoiceView[] {
    return choices.map((c) => {
      const ok = meets(c.require, this.store.state);
      return {
        choice: { ...c, text: subst(c.text, this.store.state) },
        enabled: ok,
        // 剧本给的 lockHint 优先，没给就自动生成一个。绝不给无理由的灰选项。
        lockHint: ok ? null : (c.lockHint ?? missingReason(c.require, this.store.state)),
      };
    });
  }

  /** 点一下：推进一句，或者到了句尾就交给选项 */
  advance(): void {
    if (this.resume) { const r = this.resume; this.resume = null; r(); return; }
    if (!this.cur) return;
    if (this.idx < this.cur.lines.length) this.idx += 1;
    this.present();
  }

  async choose(id: string): Promise<void> {
    const scene = this.cur;
    if (!scene?.choices) return;
    const c = scene.choices.find((x) => x.id === id);
    if (!c) return;
    if (!meets(c.require, this.store.state)) return;
    this.store.apply(c.effects);
    if (c.irreversible) { this.renderer.beat("irreversible"); this.emit({ kind: "flare", who: "wuze" }); }
    await this.enter(c.goto, 0);
  }

  /** 回信。效果与她的反应由 Letters 结算；带 goto 的回法直接进那一场 */
  async replyLetter(id: string, kind: ReplyKind, poemTags: string[] = []) {
    const r = this.letters.reply(id, kind, poemTags);
    this.autosave();
    this.emit({ kind: "letters", unread: this.letters.unreadCount(), arrived: [] });
    if (r?.goto && this.scenes.has(r.goto)) await this.enter(r.goto, 0);
    return r;
  }

  markLetterRead(id: string): void {
    this.letters.markRead(id);
    this.autosave();
    this.emit({ kind: "letters", unread: this.letters.unreadCount(), arrived: [] });
  }

  /** 存到手动槽 */
  saveTo(slot: number): void {
    save.write(slot, save.serialize(this.store.state, this.sceneId, this.idx));
  }

  /** 从手动槽读档 */
  async loadFrom(slot: number): Promise<void> {
    const s = save.read(slot);
    if (!s || !this.scenes.has(s.sceneId)) { console.warn(`[story] ${slot} 号槽读不出来`); return; }
    const { state, sceneId, lineIndex } = save.deserialize(s);
    this.store.replace(state);
    this.cur = null;                    // 读档不触发章末结算
    this.duelDone.clear();
    this.chapterDone.clear();
    this.poemsThisChapter = [];
    await this.enter(sceneId, lineIndex);
  }

  private autosave(): void {
    save.write(save.AUTO_SLOT, save.serialize(this.store.state, this.sceneId, this.idx));
  }
}
