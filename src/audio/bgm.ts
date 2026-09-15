/**
 * 配乐（D-053 第 2 层，D-179，B32）。YIDI 给的四首，一章一首，章内循环，结局卡淡出到静音。
 *
 *   序幕＋第一章 → ch1，第二／三／四章 → ch2／ch3／ch4
 *
 * **文件**：`public/bgm/ch1–4.m4a`，每首从原件（`bgm/1–4.mp3`，54–66 MB，一小时上下的长曲，不进版本库）
 * 里挑一段稳的剪成 2 分 45 秒，响度拉到 -22 LUFS（压在台词底下），首尾 5 秒等功率交叉淡化，AAC 96 kbps，一首约 2 MB。
 * 用 AAC 不用 MP3：机器上唯一的 ffmpeg 是剪映带的那一份，它的 MP3 编码器一跑就崩；AAC 在 iOS、微信、桌面浏览器都能放。
 *
 * **为什么走 Web Audio 不走 `<audio loop>`**：`<audio loop>` 接缝处有几十毫秒的空，还会带上编码器的前导静音，
 * 两分多钟响一次「咯」。这里把整首解码进内存，每一遍用一个新的 source 排在上一遍收尾前 30 毫秒，两遍之间再交叉一次——
 * 首尾本来已经淡化过，这 30 毫秒只是把样本级的跳变抹平。前后的纯静音（编码器补的）找出来跳过。
 * 代价是一首解码后几十 MB 内存；同一时刻只留当前那一首（换章那两秒例外）。
 *
 * 三条手机上的规矩和环境声一样（ambient.ts）：默认静音、只在手势里解锁、切后台就停——
 * **共用环境声那一个 AudioContext**，所以「声」开关、切后台暂停都是同一套，不另起一套。
 * **没开声不下载**：静音的人不花这 2 MB 流量；开声那一刻才去取当前章那一首。
 */

/** 这一章放哪一首。序幕是第一章的第 0 场，也放 ch1 */
export function bgmForChapter(chapter: number): string {
  const n = Math.max(1, Math.min(4, Math.floor(chapter) || 1));
  return `bgm/ch${n}.m4a`;
}

/**
 * 解码后前后纯静音的边界（编码器补的前导、尾部的零）。返回可以循环的那一段 [起, 止)，单位样本。
 * 只看绝对值很小的样本：交叉淡化过的首尾不会是静音，找到的只可能是编码器补的那几十毫秒
 */
export function audibleSpan(channels: Float32Array[], threshold = 1e-4): [number, number] {
  const n = channels[0]?.length ?? 0;
  const loud = (i: number) => channels.some((c) => Math.abs(c[i]!) > threshold);
  let a = 0;
  while (a < n && !loud(a)) a += 1;
  let b = n;
  while (b > a && !loud(b - 1)) b -= 1;
  return a < b ? [a, b] : [0, n];
}

/** 两遍之间的交叉（秒）：只抹样本级跳变，听不出 */
const SEAM = 0.03;
/** 换章：旧的淡出、新的淡入（秒） */
const SWITCH = 1.6;
/** 配乐整体音量：环境声是 1，配乐压在它和台词底下 */
const LEVEL = 0.6;

interface AudioHost {
  /** 环境声那一个上下文；还没解锁是 null */
  readonly audio: AudioContext | null;
}

interface Playing {
  url: string;
  gain: GainNode;
  sources: AudioBufferSourceNode[];
  timer: number;
}

export class Bgm {
  private host: AudioHost;
  private master: GainNode | null = null;
  private on = false;
  /** 该放哪一首（进章时定）。没开声也记着，开声那一刻才取 */
  private want: string | null = null;
  private cur: Playing | null = null;
  /** 取图解码是异步的：换得快时，只让最后一次请求落地 */
  private token = 0;
  private cache = new Map<string, AudioBuffer>();

  constructor(host: AudioHost) {
    this.host = host;
  }

  /** 开关，跟「声」按钮走。关的时候停掉、放掉解码的数据 */
  setEnabled(on: boolean): void {
    this.on = on;
    const ctx = this.host.audio;
    if (!ctx) return;
    const m = this.out(ctx);
    const t = ctx.currentTime;
    m.gain.cancelScheduledValues(t);
    m.gain.setTargetAtTime(on ? LEVEL : 0, t, 0.3);
    if (on) void this.sync();
    else window.setTimeout(() => { if (!this.on) this.drop(0); }, 900);
  }

  /** 进了一章：放这一首。同一首在放就不动 */
  play(url: string): void {
    this.want = url;
    if (this.on) void this.sync();
  }

  /** 结局卡：淡出到静音。之后再进场（重开一局）会重新放 */
  stop(fade = 3): void {
    this.want = null;
    this.drop(fade);
  }

  private out(ctx: AudioContext): GainNode {
    if (!this.master) {
      this.master = ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(ctx.destination);
    }
    return this.master;
  }

  private async sync(): Promise<void> {
    const ctx = this.host.audio;
    const url = this.want;
    if (!ctx || !url || this.cur?.url === url) return;
    const token = ++this.token;
    let buf = this.cache.get(url);
    if (!buf) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(String(res.status));
        buf = await ctx.decodeAudioData(await res.arrayBuffer());
      } catch (e) {
        console.warn(`[bgm] ${url} 取不到或解不开，这一章不放配乐`, e);
        return;
      }
    }
    if (token !== this.token || this.want !== url || !this.on) return;
    this.cache.clear();                    // 只留当前这一首
    this.cache.set(url, buf);
    this.drop(SWITCH);
    this.start(ctx, url, buf);
  }

  private start(ctx: AudioContext, url: string, buf: AudioBuffer): void {
    const chans = Array.from({ length: buf.numberOfChannels }, (_, i) => buf.getChannelData(i));
    const [a, b] = audibleSpan(chans);
    const offset = a / buf.sampleRate;
    const dur = (b - a) / buf.sampleRate;
    const gain = ctx.createGain();
    gain.connect(this.out(ctx));
    const t0 = ctx.currentTime + 0.05;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(1, t0 + SWITCH);
    const p: Playing = { url, gain, sources: [], timer: 0 };
    let next = t0;
    const queue = (at: number): void => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, at);
      env.gain.linearRampToValueAtTime(1, at + SEAM);
      env.gain.setValueAtTime(1, at + dur - SEAM);
      env.gain.linearRampToValueAtTime(0, at + dur);
      src.connect(env).connect(gain);
      src.start(at, offset, dur);
      src.onended = () => { p.sources = p.sources.filter((s) => s !== src); env.disconnect(); };
      p.sources.push(src);
      next = at + dur - SEAM;
    };
    queue(t0);
    // 下一遍提前两秒排上。后台时上下文是停的，currentTime 不走，这里也就不会越排越多
    const tick = (): void => {
      if (this.cur !== p) return;
      while (ctx.currentTime > next - 2) queue(next);
      p.timer = window.setTimeout(tick, 500);
    };
    this.cur = p;
    tick();
  }

  /** 当前这一首淡出后拿掉 */
  private drop(fade: number): void {
    const p = this.cur;
    const ctx = this.host.audio;
    this.cur = null;
    if (!p || !ctx) return;
    window.clearTimeout(p.timer);
    const t = ctx.currentTime;
    p.gain.gain.cancelScheduledValues(t);
    p.gain.gain.setValueAtTime(p.gain.gain.value, t);
    p.gain.gain.linearRampToValueAtTime(0, t + Math.max(0.01, fade));
    for (const s of p.sources) { try { s.stop(t + fade + 0.05); } catch { /* 已经停了 */ } }
    window.setTimeout(() => p.gain.disconnect(), (fade + 0.2) * 1000);
    if (!this.want) this.cache.clear();
  }
}
