import { DATA_VERSION, type Choice, type Ending, type Scene } from "./types.ts";
import { pickEnding, resolveBody } from "./endings.ts";
import { Store, subst } from "./state.ts";
import { meets, missingReason } from "./conditions.ts";
import { inkLevel } from "./ink.ts";
import * as save from "./save.ts";
import type { SceneRenderer } from "../scene/SceneRenderer.ts";
import type { LetterT, PoemDuelT } from "./schema.ts";
import { Letters, type ReplyKind } from "./letters.ts";
import { entranceIndex } from "./entrances.ts";

/** 结局卡出来那一刻给背景层的布置。key 是 endings.json 的 key，值是 scene/dressings.ts 里的 key */
export const ENDING_DRESSINGS: Readonly<Record<string, string>> = {
  wuzibei: "yin",           // 无字之碑：碑前纸上那一枚朱砂印
};

/**
 * 需要等玩家操作的界面，由 main 注入。
 * Story 因此仍然不认识 DOM：它只知道「打一局对诗，告诉我赢没赢」。
 */
export interface StoryHooks {
  duel(d: PoemDuelT): Promise<boolean>;
  chapterEnd(chapter: number, poemsThisChapter: string[]): Promise<void>;
  /**
   * 题记（D-063）：一张纸，几行竖排，玩家看完了才 resolve。
   * 可选：无头工具不画纸，引擎直接跳过这几句往下走。
   */
  epigraph?(lines: string[]): Promise<void>;
  /**
   * 结局的第一拍（D-084）：只有画面，玩家看够了点一下才 resolve，然后才出正文。
   * 可选：无头工具不看画面，直接出正文。
   */
  endingPicture?(ending: Ending): Promise<void>;
  /**
   * 进这一场之前，把这一场要用的图先备好（B21：立绘和对白出来有延迟）。
   * 引擎 await 它，所以背景的墨晕开和立绘换上是同一拍。`soon` 为真时是预取下一场，不该阻塞，也不必等完。
   * 可选：无头工具没有图。
   */
  preload?(scene: Scene, soon?: boolean): Promise<void>;
}

export interface ChoiceView {
  choice: Choice;
  enabled: boolean;
  lockHint: string | null;
}

export type StoryEvent =
  | { kind: "line"; who: string; expr: string; text: string; lineKind: string; first: boolean }
  | { kind: "choices"; items: ChoiceView[] }
  /**
   * 进了一场。`castHeld` 为真时台上先空着，人等 castEnter 再上（D-076，见 engine/entrances.ts）
   */
  | { kind: "scene"; scene: Scene; castHeld: boolean }
  /** 这一场的人进画面。紧跟着的就是那一句的 line 事件 */
  | { kind: "castEnter"; cast: string[] }
  | { kind: "ending"; ending: Ending; body: string }
  | { kind: "flare"; who: string }
  | { kind: "letters"; unread: number; arrived: string[] }
  /** 一章走完了，下一章的数据还没有。不是错误，是当前这版的边界（D-034） */
  | { kind: "toBeContinued"; chapter: number }
  /** 旧档遇上改过结构的剧本，位置被退回章首（D-037 第 3 条） */
  | { kind: "rewound"; chapter: number }
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

  /**
   * 换一个背景层，**不打断当前这一场**（D-069：3D 扛不住时退回 CSS 版）。
   *
   * 台词、选项、对诗、题记全都不动，玩家手上正在做的事照常；只是背景层按当前这一场
   * 重新 load/show 一遍，墨层和布置补上，然后旧的那一层才释放。先建后拆，中间不会闪一下空白。
   * 调用方负责把新的一层 mount 到同一个容器里。
   */
  async replaceRenderer(next: SceneRenderer): Promise<void> {
    const old = this.renderer;
    this.renderer = next;
    const scene = this.cur;
    if (scene) {
      const d = { key: scene.scene, palette: scene.palette, act: scene.act, dressing: scene.dressing };
      await next.load(d);
      if (!this.stagePending) {
        await next.show(d);
        next.setInk?.(inkLevel(this.store.state, scene.act));
        next.setDressing?.(scene.dressing ?? "");
      }
    }
    old.dispose();
  }

  /**
   * 启动。`fresh` 为真是标题上的「入宫」：不管有没有自动存档，从第一场开始。
   * 否则是「接着上次」（或者没有标题画面的场合，比如无头工具）：有档读档，没有就从头。
   */
  async start(opts: { fresh?: boolean } = {}): Promise<void> {
    if (opts.fresh) {
      save.stashAutosave();
      save.clear(save.AUTO_SLOT);
      await this.enter(this.startId, 0);
      return;
    }
    const s = save.read(save.AUTO_SLOT);
    if (s && this.scenes.has(s.sceneId)) {
      const { state, sceneId, lineIndex } = save.deserialize(s);
      this.store.replace(state);
      const at = this.reconcile(s, sceneId, lineIndex);
      // 不在的这段时间到的信一次收齐，一封不少
      const arrived = this.letters.deliver();
      this.emit({ kind: "letters", unread: this.letters.unreadCount(), arrived });
      await this.enter(at.sceneId, at.lineIndex);
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

    // 固定截获点（D-039 第 2 条）：走进这一场，那封信当场被截，不看延迟也不看未读数。
    // 放在换场结算之前：这封信要在玩家看到这一场的第一句之前就已经在朝堂上了。
    const forced = this.letters.forceInterceptAt(sceneId);
    if (forced) {
      const to = this.letters.consumeIntercept(forced.id);
      this.emit({ kind: "letters", unread: this.letters.unreadCount(), arrived: [] });
      // 去向通常就是这一场本身（信在这里被当众展开），那就别再进一次，会绕回来
      if (to && to !== sceneId && this.scenes.has(to)) { this.cur = null; await this.enter(to, 0); return; }
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
    this.finished = false;                 // 读档读回结局之前，这一局还没落幕
    this.picturing = false;                // 看结局画面时读了档：那一拍的钩子不会再 resolve，别让它锁住点击

    // 色板跟着场景走。整个 UI 只认 CSS 变量，不知道自己在哪套色板里。
    document.documentElement.dataset.palette = scene.palette;

    const d = { key: scene.scene, palette: scene.palette, act: scene.act, dressing: scene.dressing };
    // 背景和立绘一起备：两边都解码完再换场，进场那一下不会先白一片、人再慢慢出来
    await Promise.all([this.renderer.load(d), this.hooks.preload?.(scene)]);
    // D-076：一场从题记开始，景要等纸收起来才显。show 自带那一次墨晕开，
    // 放到纸后面，玩家看到的就是「只有纸 → 墨晕开、景出来」，不用加新的转场
    this.stagePending = this.opensWithEpigraph(scene, lineIndex);
    if (!this.stagePending) await this.showStage(scene);

    this.castEntersAt = entranceIndex(scene, lineIndex);
    this.emit({ kind: "scene", scene, castHeld: this.castEntersAt >= 0 });
    this.present();
    void this.prefetch(scene);
  }

  /**
   * 把下一场可能去的地方的图先取回来（B21）。不 await：这一场已经在演了，取图是后台的事。
   * 取的是这一场的去向和每个选项的去向——玩家选哪个都已经备好；取不到就算了，进场时还会再取一次。
   */
  private async prefetch(scene: Scene): Promise<void> {
    const next = [scene.goto, ...(scene.choices ?? []).map((c) => c.goto)]
      .filter((id): id is string => !!id)
      .filter((id, i, all) => all.indexOf(id) === i)
      .slice(0, 4);
    for (const id of next) {
      const s = this.scenes.get(id);
      if (!s) continue;
      try {
        await this.renderer.load({ key: s.scene, palette: s.palette, act: s.act, dressing: s.dressing });
        await this.hooks.preload?.(s, true);
      } catch { /* 预取失败不影响正在演的这一场 */ }
    }
  }

  /** 景还没显出来：这一场从题记开始，纸还在屏幕上 */
  private stagePending = false;
  /** 人等到第几句才进画面，-1 是一开场就在（D-076） */
  private castEntersAt = -1;

  private async showStage(scene: Scene): Promise<void> {
    this.stagePending = false;
    const d = { key: scene.scene, palette: scene.palette, act: scene.act, dressing: scene.dressing };
    await this.renderer.show(d);
    // 墨层的覆盖面积就是她的权力进度（D-010 第 3 条）。
    // show() 之后才调：show 会把墨层按幕数重置成默认值，先调会被它盖掉。
    this.renderer.setInk?.(inkLevel(this.store.state, scene.act));
    // 布置（D-046 第 2 条）：和墨层一样在 show 之后调，空串 = 平常的样子。
    // descriptor 里也带着 dressing，这一行是给 CC3 那条「show 之后再改」的路。
    this.renderer.setDressing?.(scene.dressing ?? "");
  }

  /** 从 `from` 起第一句要显示的（条件不满足的跳过）是不是题记 */
  private opensWithEpigraph(scene: Scene, from: number): boolean {
    for (let i = from; i < scene.lines.length; i++) {
      const l = scene.lines[i]!;
      if (!meets(l.when, this.store.state)) continue;
      return l.who === "tiji";
    }
    return false;
  }

  /** 把当前位置的内容推给 UI */
  private present(): void {
    const scene = this.cur;
    if (!scene) return;
    // 逐句条件（D-026）：不满足的句子直接跳过
    while (this.idx < scene.lines.length && !meets(scene.lines[this.idx]!.when, this.store.state)) {
      this.idx += 1;
    }
    // 人上台（D-076）。按句号比，不按 id 等：那一句要是带条件被跳过了，人照样在它之后进来
    if (this.castEntersAt >= 0 && this.idx >= this.castEntersAt) {
      this.castEntersAt = -1;
      this.emit({ kind: "castEnter", cast: scene.cast });
    }
    if (this.idx < scene.lines.length) {
      const line = scene.lines[this.idx]!;
      // 题记不进对话框：连着的几句收成一张纸，交给题记层
      if (line.who === "tiji") { void this.runEpigraph(scene); return; }
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
    if (e) { void this.finish(scene, e); return; }
    if (scene.ending) console.error(`[story] 场景 ${scene.id} 指向不存在的结局 ${scene.ending}`);
    this.emit({ kind: "end" });
  }

  /** 题记那张纸还在屏幕上。这时候的推进（键盘回车之类）一律不算，否则会叠出第二张 */
  private epigraphing = false;

  /**
   * 把从当前位置起连续的题记句收成一次（D-063）。
   *
   * 条件不满足的句子照常跳过，而且不打断收集——剧本在两句题记之间夹一句带条件的旁白，
   * 不该让玩家看见两张各写一行的纸。
   *
   * 自动存档停在题记的第一句：看到一半关掉网页，回来再看一次这张纸，而不是从纸后面接着读。
   */
  private async runEpigraph(scene: Scene): Promise<void> {
    const texts: string[] = [];
    let i = this.idx;
    while (i < scene.lines.length) {
      const l = scene.lines[i]!;
      if (!meets(l.when, this.store.state)) { i += 1; continue; }
      if (l.who !== "tiji") break;
      this.store.markSeen(l.id);
      texts.push(subst(l.text, this.store.state));
      i += 1;
    }
    this.autosave();
    this.epigraphing = true;
    try {
      await this.hooks.epigraph?.(texts);
    } finally {
      this.epigraphing = false;
    }
    if (this.cur !== scene) return;        // 看题记的时候读了档，别把位置写回去
    this.idx = i;
    // 纸收起来了，景这时候才墨晕开（D-076）。先显景再读下一句：墨晕开的那一下，对话框还是空的
    if (this.stagePending) await this.showStage(scene);
    if (this.cur !== scene) return;
    this.present();
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

  /**
   * 旧档配新剧本（D-037 第 3 条）。
   *
   * 存档记的是「哪一场、第几句」。剧本一改行数，那个句号就指到别的话上去了；
   * 玩家看到的是一段接不上的对白，而且不知道为什么。所以结构版本对不上就退回章首。
   *
   * 退的只是位置。数值、好感、flag、收到的诗、案上的信全部留着——
   * 那些是她这一路做的决定，凭什么因为我们改了剧本就作废。
   */
  private reconcile(s: { dataVersion?: number }, sceneId: string, lineIndex: number): { sceneId: string; lineIndex: number } {
    if ((s.dataVersion ?? 0) === DATA_VERSION) return { sceneId, lineIndex };
    const chapter = this.scenes.get(sceneId)?.chapter;
    const head = chapter === undefined ? null : this.chapterStart(chapter);
    if (!head) return { sceneId, lineIndex: 0 };   // 认不出章，至少退到这一场开头
    console.info(`[save] 剧本结构版本从 ${s.dataVersion ?? 0} 变成 ${DATA_VERSION}，位置退回第 ${chapter} 章开头 ${head}`);
    this.emit({ kind: "rewound", chapter: chapter! });
    return { sceneId: head, lineIndex: 0 };
  }

  /**
   * 一章从哪一场开始：这一章里没有任何同章场景指向它的那一个。
   * 不用 id 排序是因为 id 由场景标题生成，不保证能排出剧情顺序（D-037 第 2 条）。
   * 万一算不出唯一答案（多个入口，或者互相成环），再退回按 id 取最小的那个。
   */
  private chapterStart(chapter: number): string | null {
    const inChapter = [...this.scenes.values()].filter((x) => x.chapter === chapter);
    if (!inChapter.length) return null;
    const pointedAt = new Set<string>();
    for (const x of inChapter) {
      for (const to of [...(x.choices ?? []).map((c) => c.goto), x.goto]) {
        if (to && this.scenes.get(to)?.chapter === chapter) pointedAt.add(to);
      }
      const d = x.duel ? this.duels.get(x.duel) : undefined;
      for (const to of [d?.onWin?.goto, d?.onLose?.goto]) {
        if (to && this.scenes.get(to)?.chapter === chapter) pointedAt.add(to);
      }
    }
    const heads = inChapter.filter((x) => !pointedAt.has(x.id));
    if (heads.length === 1) return heads[0]!.id;
    return [...inChapter].sort((a, b) => a.id.localeCompare(b.id))[0]!.id;
  }

  private judgeEnding(): Ending | null {
    const e = pickEnding(this.endingOrder, this.store.state);
    if (!e) console.error("[story] 结局表没有兜底项。最后一条的判定必须留空");
    return e;
  }

  /**
   * 结局已经出过了。之后的点击一律不算：原来句尾再点一下就是再 present 一次，
   * 结局判定再跑一遍、题名再叠一层，点几下叠几层
   */
  private finished = false;
  /** 结局第一拍的画面还在（D-084）。这时候的推进不算，否则第二拍会被连点跳过去 */
  private picturing = false;

  /**
   * 落幕，分两拍（D-084）：第一拍只有画面——色板、布置（无字碑的印）都在这一拍到位；
   * 玩家点一下，第二拍才出题名和正文。
   * 两拍之间的停顿是尾韵，不是加载：走完四章，先给一屏安静的画面，再给字。
   */
  private async finish(scene: Scene, e: Ending): Promise<void> {
    this.finished = true;
    this.store.state.endingsUnlocked.add(e.key);
    // 结局有自己的色板。势高心低那条线回到金碧，画面本身就是判词。
    document.documentElement.dataset.palette = e.palette;
    // D-067：无字碑默认无印，只在「无字之碑」这张结局卡出来的那一刻盖上。
    // 引擎给，不靠剧本写：全书最后一场是八个结局共用的，那里写了印就是八个结局都有印
    const dressing = ENDING_DRESSINGS[e.key];
    if (dressing) this.renderer.setDressing?.(dressing);
    this.autosave();
    this.picturing = true;
    try {
      await this.hooks.endingPicture?.(e);
    } finally {
      this.picturing = false;
    }
    if (this.cur !== scene) return;        // 看画面的时候读了档
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
    if (this.epigraphing || this.picturing || this.finished) return;
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
    // 章末场的选项可以不写去向（D-043）：答完这一句，直接进章末结算页。
    // 第二章最后那一问就是这样——它是整章最后一个由玩家出手的动作，
    // 结算页要出现在选择之后，那才叫「这一章你做完了这些」。
    if (!c.goto) {
      if (scene.chapterEnd && !this.chapterDone.has(scene.id)) {
        this.chapterDone.add(scene.id);
        await this.runChapterEnd(scene);
        return;
      }
      console.error(`[story] 选项 ${c.id} 没有去向，而这一场也不是章末。就地收尾`);
      this.emit({ kind: "end" });
      return;
    }
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
    const at = this.reconcile(s, sceneId, lineIndex);
    await this.enter(at.sceneId, at.lineIndex);
  }

  private autosave(): void {
    save.write(save.AUTO_SLOT, save.serialize(this.store.state, this.sceneId, this.idx));
  }
}
