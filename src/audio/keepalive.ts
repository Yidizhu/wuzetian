/**
 * iPhone 静音键（D-218，B42）。
 *
 * 配乐、环境声、音效都走 Web Audio（AudioContext）。iOS 把 AudioContext 归「环境声」一类，**听侧边静音键**：
 * 拨到静音，音量键按到头也没声。`<audio>` 元素在用户手势里播起来算「媒体播放」，**不听静音键**。
 * 所以在手势里同时放一个循环的一秒静音 `<audio>`（`public/sfx/silence.m4a`），页面就被当成媒体播放，
 * 之后 Web Audio 的声也不再被静音键管。配乐的交叉循环一行没动。
 *
 * 三条和环境声一样的规矩：
 * - **只在开着声的时候放。** 媒体播放会把别的 App 的音乐停掉——没开声的人不该因为进了游戏，耳机里的歌就断了。
 *   所以「入宫」时上次开着声才放、HUD 开声时放、关声时停。
 * - **只在手势里起。** `play()` 不在手势里会被拒，拒了不报错，下一次手势再试。
 * - **切后台就停**，切回来、声还开着就接着放（切回来不是手势，iOS 多半允许恢复；不允许就等下一次点开关）。
 *
 * 怎么验（CC1 这边没有 iPhone，交 YIDI）：iPhone 侧边拨到静音 → 打开游戏、「入宫」（上次开着声）或进去后点「声：开」→
 * 按音量键应该能调响、听得到配乐；锁屏或切走再回来，声停了又接上。拨着静音键、声关着：什么都不响，别的 App 的音乐不被打断。
 */
export class MediaKeepAlive {
  private el: HTMLAudioElement | null = null;
  private wanted = false;
  private src: string;

  constructor(src: string) {
    this.src = src;
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (!this.el) return;
        if (document.hidden) this.el.pause();
        else if (this.wanted) void this.el.play().catch(() => { /* 等下一次手势 */ });
      });
    }
  }

  /** 在手势回调里调：`on` 为真起（或保持）静音循环，为假停 */
  set(on: boolean): void {
    this.wanted = on;
    if (!on) { this.el?.pause(); return; }
    if (typeof document === "undefined") return;
    if (!this.el) {
      const a = document.createElement("audio");
      a.src = this.src;
      a.loop = true;
      a.preload = "auto";
      a.setAttribute("playsinline", "");
      a.setAttribute("webkit-playsinline", "");
      a.setAttribute("aria-hidden", "true");
      a.volume = 1;                       // 文件本身是静音；音量调小有的机器会被当成「不是真在播」
      a.style.display = "none";
      document.body.appendChild(a);
      this.el = a;
    }
    void this.el.play().catch(() => { /* 不在手势里、或者文件没到：安安静静，下一次手势再试 */ });
  }

  get playing(): boolean { return !!this.el && !this.el.paused; }
}
