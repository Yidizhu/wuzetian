/**
 * 声音桥播放器（D-198，B36）。规则在 `cues.ts`（纯函数、有测试），这里只管放。
 *
 * 文件：`public/sfx/<名>.m4a`，原件在仓库根 `sfx/`（不进版本库）。单声道 AAC 48 kbps，
 * 循环类首尾交叉淡化过（`rain_loop` 28 秒、`wind_loop` 34 秒），单响类 1—3 秒。来源与许可记在 `docs/sfx-ledger.md`。
 *
 * - **有哪些文件**：构建时扫 `public/sfx/`（`virtual:raster-assets` 的 `sfx`），同步就知道，不用先去请求一次才晓得。
 * - **文件没到**：退回 D-053 合成的那一层（雨、风、纸、鼓）；合成也没有的就静音，不报错。
 * - **读不出来**（请求失败、解码失败）：记一笔，之后这一声走合成或静音，同样不报错。
 * - 共用环境声那个 AudioContext：默认静音、手势解锁、切后台暂停都跟着它（ambient.ts）。
 * - 单响第一次要先取文件再放，会晚一两百毫秒；换场时顺手把这一场会用到的先取回来。
 */
import { audibleSpan } from "./bgm.ts";
import { sourceFor, type LoopName, type SfxName, type SoundCue } from "./cues.ts";

interface Host {
  readonly audio: AudioContext | null;
  readonly enabled: boolean;
  rain(on: boolean): void;
  wind(on: boolean): void;
  drum(beats?: number): void;
  paper(): void;
}

/** 各声的音量（文件里已经按峰值定过一遍，这里是压在台词和配乐底下的总档） */
const GAIN: Record<SfxName, number> = {
  rain_loop: 0.7, wind_loop: 0.6, paper_unfold: 0.8, drum_far: 0.8,
  bell_far: 0.7, horse_bell: 0.7, cloth_rustle: 0.8, steps_hall: 0.8,
};
const LOOP_FADE = 1.2;

export class Sfx {
  private host: Host;
  private base: string;
  private available: Set<string>;
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  /** 循环声现在该不该响（关着声时也记着，开声那一刻补上） */
  private want: Record<LoopName, boolean> = { rain_loop: false, wind_loop: false };
  private playing = new Map<LoopName, { src: AudioBufferSourceNode; gain: GainNode }>();

  constructor(host: Host, available: string[], base: string) {
    this.host = host;
    this.available = new Set(available);
    this.base = base;
  }

  /**
   * 单响预取（B37）：进场时把这一场可能用到的先取回来、解好码，第一次响不再晚一两百毫秒。
   * 没开声不取（静音的人不花流量）；取不到照旧不报错
   */
  preload(names: SfxName[]): void {
    if (!this.host.enabled || !this.host.audio) return;
    for (const n of names) if (this.available.has(n)) void this.buffer(n);
  }

  /** 真文件在不在（在就不用合成那一层） */
  has(name: SfxName): boolean { return this.available.has(name); }

  run(cues: SoundCue[]): void {
    for (const c of cues) {
      if (c.kind === "loop") this.loop(c.name, c.on);
      else this.hit(c.name);
    }
  }

  /** 开关跟「声」走：开的时候把该响的循环补上，关的时候全收 */
  setEnabled(on: boolean): void {
    for (const name of Object.keys(this.want) as LoopName[]) {
      if (on && this.want[name]) void this.startLoop(name);
      if (!on) this.stopLoop(name, 0.3);
    }
  }

  private loop(name: LoopName, on: boolean): void {
    this.want[name] = on;
    const src = sourceFor(name, this.available);
    if (src === "synth") { if (name === "rain_loop") this.host.rain(on); else this.host.wind(on); return; }
    if (src === "silent") return;
    if (on) void this.startLoop(name); else this.stopLoop(name, LOOP_FADE);
  }

  private hit(name: SfxName): void {
    if (!this.host.enabled) return;
    const src = sourceFor(name, this.available);
    if (src === "synth") { this.synthHit(name); return; }
    if (src === "silent") return;
    void this.buffer(name).then((buf) => {
      const ctx = this.host.audio;
      if (!ctx || !this.host.enabled) return;
      if (!buf) { if (sourceFor(name, this.available) === "synth") this.synthHit(name); return; }
      const s = ctx.createBufferSource();
      s.buffer = buf;
      const g = ctx.createGain();
      g.gain.value = GAIN[name];
      s.connect(g).connect(ctx.destination);
      s.onended = () => g.disconnect();
      s.start();
    });
  }

  private synthHit(name: SfxName): void {
    if (name === "paper_unfold") this.host.paper();
    else if (name === "drum_far") this.host.drum(1);
  }

  private async startLoop(name: LoopName): Promise<void> {
    if (!this.host.enabled || this.playing.has(name)) return;
    const buf = await this.buffer(name);
    const ctx = this.host.audio;
    if (!ctx || !this.want[name] || !this.host.enabled || this.playing.has(name)) return;
    if (!buf) { this.loop(name, this.want[name]); return; }   // 读不出来：这一次起走合成
    const chans = Array.from({ length: buf.numberOfChannels }, (_, i) => buf.getChannelData(i));
    const [a, b] = audibleSpan(chans);
    const s = ctx.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    s.loopStart = a / buf.sampleRate;
    s.loopEnd = b / buf.sampleRate;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(GAIN[name], t + LOOP_FADE);
    s.connect(g).connect(ctx.destination);
    s.start(t, s.loopStart);
    this.playing.set(name, { src: s, gain: g });
  }

  private stopLoop(name: LoopName, fade: number): void {
    const p = this.playing.get(name);
    const ctx = this.host.audio;
    this.playing.delete(name);
    if (!p || !ctx) return;
    const t = ctx.currentTime;
    p.gain.gain.cancelScheduledValues(t);
    p.gain.gain.setValueAtTime(p.gain.gain.value, t);
    p.gain.gain.linearRampToValueAtTime(0, t + fade);
    try { p.src.stop(t + fade + 0.05); } catch { /* 已经停了 */ }
  }

  /** 取文件、解码，只取一次。失败了把它从「有文件」里拿掉，之后走合成或静音 */
  private buffer(name: SfxName): Promise<AudioBuffer | null> {
    let p = this.buffers.get(name);
    if (!p) {
      p = (async () => {
        const ctx = this.host.audio;
        if (!ctx) { this.buffers.delete(name); return null; }
        try {
          const res = await fetch(`${this.base}sfx/${name}.m4a`);
          if (!res.ok) throw new Error(String(res.status));
          return await ctx.decodeAudioData(await res.arrayBuffer());
        } catch {
          this.available.delete(name);
          return null;
        }
      })();
      this.buffers.set(name, p);
    }
    return p;
  }
}
