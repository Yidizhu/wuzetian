/**
 * 环境声（D-053 第 1 层）：街鼓、风、雨、纸。全部用 Web Audio 当场合成，一个音频文件都没有。
 *
 * 为什么合成而不是放录音：零 KB，单文件版里也有声；而且这个游戏不要配乐铺满，
 * 要的是几处能听出「这是哪儿、什么时辰」的声音。合成的声音粗，粗正好——
 * 它不抢台词，只是让画面不是哑的。
 *
 * 三条手机上的规矩：
 * 1. **默认静音。** 没人愿意一打开网页就出声。
 * 2. **只能在手势里解锁。** iOS 的 AudioContext 必须在用户点击的回调里建或恢复，
 *    标题画面的「入宫」那一下正好是这个时机（`unlock()`）。
 * 3. **切到后台就停。** 锁屏、切 App 还在响，是最快被关掉的办法。
 *
 * engine 下的规矩这里也守：不用构造参数属性，无头工具要能 import。
 */

type Ctx = AudioContext;

export class Ambient {
  private ctx: Ctx | null = null;
  private master: GainNode | null = null;
  private rainNode: { stop(): void } | null = null;
  private windNode: { stop(): void } | null = null;
  private noise: AudioBuffer | null = null;
  private on = false;

  constructor() {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (!this.ctx) return;
        if (document.hidden) void this.ctx.suspend();
        else if (this.on) void this.ctx.resume();
      });
    }
  }

  get enabled(): boolean { return this.on; }

  /** 解锁过的上下文（配乐 bgm.ts 共用这一个，开关、切后台暂停都跟着它）。没解锁是 null */
  get audio(): AudioContext | null { return this.ctx; }

  /**
   * 在手势回调里调。建上下文、恢复它，但**不出声**——开不开声由 setEnabled 定。
   * 标题的「入宫」、HUD 的开关都会调它，重复调没关系。
   */
  unlock(): void {
    const g = globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const AC = g.AudioContext ?? g.webkitAudioContext;
    if (!AC) return;                       // 没有 Web Audio 的浏览器：安安静静地没声，不报错
    if (!this.ctx) {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended" && this.on) void this.ctx.resume();
  }

  setEnabled(on: boolean): void {
    this.on = on;
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? 1 : 0, t, 0.25);   // 淡入淡出，不「啪」一下
    if (on) { void this.ctx.resume(); return; }
    // 关的时候也把雨停掉：否则再打开时它还在后台排着，一开就是满耳朵
    this.rain(false);
    this.wind(false);
    window.setTimeout(() => { if (!this.on) void this.ctx?.suspend(); }, 900);
  }

  // ------------------------------------------------------------ 四种声音

  /**
   * 街鼓。大鼓面：一个从 95Hz 往 42Hz 掉下去的正弦，加一记闷的低通噪声当鼓皮。
   * 一通敲 `beats` 下，越敲越密一点——坊门的鼓是催人的。
   */
  drum(beats = 5): void {
    const c = this.ready();
    if (!c) return;
    let at = c.currentTime + 0.05;
    for (let i = 0; i < beats; i++) {
      this.hit(at, Math.max(0.2, 0.55 - i * 0.05));
      at += Math.max(0.42, 0.95 - i * 0.12) + Math.random() * 0.05;
    }
  }

  /** 雨：带通噪声，音量慢慢起伏，像风把雨一阵阵推过来 */
  rain(on: boolean): void {
    if (!on) { this.rainNode?.stop(); this.rainNode = null; return; }
    if (this.rainNode) return;
    const c = this.ready();
    if (!c) return;
    const src = this.loop(c);
    const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 420;
    const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 0.5;
    const g = c.createGain(); g.gain.value = 0;
    g.gain.setTargetAtTime(0.07, c.currentTime, 1.2);
    const lfo = c.createOscillator(); lfo.frequency.value = 0.13;
    const depth = c.createGain(); depth.gain.value = 0.02;
    lfo.connect(depth).connect(g.gain);
    src.connect(hp).connect(bp).connect(g).connect(this.master!);
    src.start(); lfo.start();
    this.rainNode = this.fadeStopper(c, g, [src, lfo]);
  }

  /** 风：低通噪声，截止频率被一个很慢的振荡推着走。合成好了，还没接进剧情 */
  wind(on: boolean): void {
    if (!on) { this.windNode?.stop(); this.windNode = null; return; }
    if (this.windNode) return;
    const c = this.ready();
    if (!c) return;
    const src = this.loop(c);
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520; lp.Q.value = 0.8;
    const lfo = c.createOscillator(); lfo.frequency.value = 0.08;
    const sweep = c.createGain(); sweep.gain.value = 300;
    lfo.connect(sweep).connect(lp.frequency);
    const g = c.createGain(); g.gain.value = 0;
    g.gain.setTargetAtTime(0.05, c.currentTime, 1.5);
    src.connect(lp).connect(g).connect(this.master!);
    src.start(); lfo.start();
    this.windNode = this.fadeStopper(c, g, [src, lfo]);
  }

  /** 纸：一小截高通噪声，七十毫秒。翻信、展卷用。合成好了，还没接进剧情 */
  paper(): void {
    const c = this.ready();
    if (!c) return;
    const src = c.createBufferSource(); src.buffer = this.noiseBuffer(c);
    const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3200;
    const g = c.createGain();
    const t = c.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 0.07);
    src.connect(hp).connect(g).connect(this.master!);
    src.start(t, Math.random(), 0.09);
  }

  // ------------------------------------------------------------ 零件

  /** 静音或还没解锁时返回 null：什么都不排，免得一开声音把攒下的鼓一齐敲出来 */
  private ready(): Ctx | null {
    return this.on && this.ctx && this.master ? this.ctx : null;
  }

  private hit(at: number, level: number): void {
    const c = this.ctx!;
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(95, at);
    osc.frequency.exponentialRampToValueAtTime(42, at + 0.28);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(level, at + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 1.3);
    osc.connect(g).connect(this.master!);
    osc.start(at); osc.stop(at + 1.4);

    // 鼓皮：一记很短的低通噪声，没有它就只是一个「嗡」
    const n = c.createBufferSource(); n.buffer = this.noiseBuffer(c);
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 180;
    const ng = c.createGain();
    ng.gain.setValueAtTime(level * 0.9, at);
    ng.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
    n.connect(lp).connect(ng).connect(this.master!);
    n.start(at, Math.random(), 0.15);
  }

  private noiseBuffer(c: Ctx): AudioBuffer {
    if (this.noise) return this.noise;
    const len = c.sampleRate * 2;
    const b = c.createBuffer(1, len, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = b;
    return b;
  }

  private loop(c: Ctx): AudioBufferSourceNode {
    const s = c.createBufferSource();
    s.buffer = this.noiseBuffer(c);
    s.loop = true;
    return s;
  }

  /** 停的时候先淡出再断开，雨不该像拔了插头 */
  private fadeStopper(c: Ctx, g: GainNode, nodes: AudioScheduledSourceNode[]): { stop(): void } {
    return {
      stop: () => {
        g.gain.setTargetAtTime(0, c.currentTime, 0.6);
        for (const n of nodes) n.stop(c.currentTime + 2.5);
      },
    };
  }
}
