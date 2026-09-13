/**
 * 3D 舞台帧数太低时，一次性地退回 CSS 版（D-069）。
 *
 * D-003 原本的写法是「默认 CSS，3D 过了真机闸门再切」。可真机数字一直没来，
 * 于是退路悄悄变成了正路：六轮里玩家默认一个 3D 场景都没见过。现在反过来——
 * 默认 3D，机器扛不住才退。
 *
 * 判据要守住两件事：
 *
 * 1. **不冤枉。** 刚换场的那几百毫秒在编译着色器、推镜头，本来就慢；
 *    切到后台再回来，第一帧的间隔是几十秒。这些都不算。
 * 2. **不来回抖。** 退了就不再回来；连续看够一段时间都流畅，就不再看了。
 *    一个一会儿 3D 一会儿 CSS 的画面，比一直是 CSS 还糟。
 *
 * 具体数字：
 * - 前 4 秒不看（首场推镜 2.6 秒，加上着色器编译）；
 * - 看最近 120 帧（流畅时 2 秒，卡的时候更久）；
 * - 其中七成以上超过 41.7 毫秒（低于 24 帧），判慢——D-003 的线是 30 帧，
 *   这里放宽到 24，因为这是不可逆的一刀，宁可晚切，不要错切；
 * - 累计 20 秒没判慢，判「这台机器扛得住」，收工；
 * - 单帧间隔超过 1 秒的不计（切后台、系统弹窗、断点）。
 *
 * 这个文件只做判断，不碰 DOM、不碰 rAF，所以测得了。
 */

export interface JudgeOptions {
  warmupMs: number;
  windowFrames: number;
  slowFrameMs: number;
  slowShare: number;
  settleMs: number;
  ignoreAboveMs: number;
}

export const DEFAULT_JUDGE: JudgeOptions = {
  warmupMs: 4000,
  windowFrames: 120,
  slowFrameMs: 1000 / 24,
  slowShare: 0.7,
  settleMs: 20000,
  ignoreAboveMs: 1000,
};

export type Verdict = "slow" | "ok" | null;

export class FrameJudge {
  private opts: JudgeOptions;
  private elapsed = 0;
  private watched = 0;
  private window: number[] = [];
  private done: Verdict = null;

  constructor(opts: Partial<JudgeOptions> = {}) {
    this.opts = { ...DEFAULT_JUDGE, ...opts };
  }

  get verdict(): Verdict { return this.done; }

  /** 喂一帧的间隔（毫秒）。判出结论之后返回结论，之后再喂也只会返回同一个结论 */
  push(dt: number): Verdict {
    if (this.done) return this.done;
    if (!(dt > 0) || dt > this.opts.ignoreAboveMs) return null;
    this.elapsed += dt;
    if (this.elapsed < this.opts.warmupMs) return null;

    this.watched += dt;
    this.window.push(dt);
    if (this.window.length > this.opts.windowFrames) this.window.shift();
    if (this.window.length === this.opts.windowFrames) {
      const slow = this.window.filter((x) => x > this.opts.slowFrameMs).length;
      if (slow / this.window.length >= this.opts.slowShare) return (this.done = "slow");
    }
    if (this.watched >= this.opts.settleMs) return (this.done = "ok");
    return null;
  }

  /** 切到后台再回来：窗口清空重看，热身重来一遍（回来那一下常常要重新上传纹理） */
  reset(): void {
    if (this.done) return;
    this.elapsed = 0;
    this.window = [];
  }
}
