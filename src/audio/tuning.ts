/**
 * 章首进声的两个开关（D-209，B40）：YIDI 真机听了说第一章那一下「欢跳」，两种改法都做，她在手机上听了定。
 *
 * - `intro`：第一章配乐怎么进。`soft`（默认）＝4 秒淡入、从这一首最静的一小节起；`plain`＝B32 原样（1.6 秒淡入、从头起）
 * - `epihit`：题记收起那一下响什么。`bell`（默认）＝远钟一声；`drum`＝B36 原样，远鼓一通
 *
 * **怎么切**：网址后面加 `?intro=plain`、`?epihit=drum`（或换回 `soft`、`bell`）打开一次，这台设备就记住了，
 * 之后不带参数也照这个放。微信里开不了控制台，只能靠网址（和 `?tapdebug=1` 同一个道理）。
 * 定下来之后把默认值改成她选的那个，开关可以留着。
 */
export type IntroMode = "soft" | "plain";
export type EpigraphHit = "bell" | "drum";

export interface SoundTuning { intro: IntroMode; epihit: EpigraphHit }

export const TUNING_DEFAULTS: SoundTuning = { intro: "soft", epihit: "bell" };

const KEY = "wuzetian.sound.tuning";

/** 网址参数优先，并记下来；没有参数读上次记的；都没有是默认。纯函数那一半给测试用 */
export function resolveTuning(search: string, stored: string | null): { tuning: SoundTuning; save: boolean } {
  let base: Partial<SoundTuning> = {};
  try { base = stored ? JSON.parse(stored) as Partial<SoundTuning> : {}; } catch { /* 坏了就当没记过 */ }
  const q = new URLSearchParams(search);
  const intro = q.get("intro");
  const epihit = q.get("epihit");
  const t: SoundTuning = {
    intro: intro === "soft" || intro === "plain" ? intro : base.intro === "plain" ? "plain" : TUNING_DEFAULTS.intro,
    epihit: epihit === "bell" || epihit === "drum" ? epihit : base.epihit === "drum" ? "drum" : TUNING_DEFAULTS.epihit,
  };
  return { tuning: t, save: q.has("intro") || q.has("epihit") };
}

export function loadTuning(): SoundTuning {
  let stored: string | null = null;
  try { stored = localStorage.getItem(KEY); } catch { /* 无痕模式 */ }
  const { tuning, save } = resolveTuning(location.search, stored);
  if (save) { try { localStorage.setItem(KEY, JSON.stringify(tuning)); } catch { /* 记不住就只管这一次 */ } }
  return tuning;
}
