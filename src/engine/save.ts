import { newState, type GameState } from "./state.ts";
import { STAT_KEYS, type LetterSlot, type StatKey } from "./types.ts";

/**
 * 存档。五条要点见 story-schema 2.3：
 *   1. version 从第一天就有，迁移写成 v -> v+1 的纯函数链
 *   2. 随处可存：存 sceneId + lineIndex，不是存章节检查点
 *   3. protagonistName 存快照，不是渲染时查全局
 *   4. seenLineIds 决定 skip 的范围
 *   5. 信箱存 dueAt 绝对时间戳，不是剩余分钟数——关掉游戏那段时间信照走
 *
 * 已装的 save-systems 技能讲的临时文件加重命名是文件系统语境，这里用 localStorage
 * 不适用。对应做法是写之前把旧值抄进 .bak，解析失败时回退。
 */

export const SAVE_VERSION = 1;
const KEY = (slot: number) => `wuzetian.save.${slot}`;
const BAK = (slot: number) => `wuzetian.save.${slot}.bak`;
export const AUTO_SLOT = 0;

export interface SaveV1 {
  version: 1;
  savedAt: number;
  sceneId: string;
  lineIndex: number;
  stats: Record<StatKey, number>;
  affinity: Record<string, number>;
  flags: Record<string, boolean>;
  protagonistName: string;
  seenLineIds: string[];
  poemsCollected: string[];
  endingsUnlocked: string[];
  letters: LetterSlot[];
  lastSeenAt: number;
}

type AnySave = { version?: number } & Record<string, unknown>;

/** 迁移链。每个函数把 v 变成 v+1，纯函数，不读外部状态。 */
const MIGRATIONS: Record<number, (d: AnySave) => AnySave> = {
  // 0: (d) => ({ ...d, version: 1 }),   // 将来加在这里
};

export function serialize(s: GameState, sceneId: string, lineIndex: number): SaveV1 {
  return {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    sceneId,
    lineIndex,
    stats: { ...s.stats },
    affinity: { ...s.affinity },
    flags: { ...s.flags },
    protagonistName: s.protagonistName,
    seenLineIds: [...s.seenLineIds],
    poemsCollected: [...s.poemsCollected],
    endingsUnlocked: [...s.endingsUnlocked],
    letters: s.letters.map((l) => ({ ...l })),
    lastSeenAt: Date.now(),
  };
}

export function deserialize(d: SaveV1): { state: GameState; sceneId: string; lineIndex: number } {
  const state = newState();
  for (const k of STAT_KEYS) state.stats[k] = d.stats?.[k] ?? state.stats[k];
  state.affinity = { ...(d.affinity ?? {}) };
  state.flags = { ...(d.flags ?? {}) };
  state.protagonistName = d.protagonistName || state.protagonistName;
  state.seenLineIds = new Set(d.seenLineIds ?? []);
  state.poemsCollected = new Set(d.poemsCollected ?? []);
  state.endingsUnlocked = new Set(d.endingsUnlocked ?? []);
  state.letters = (d.letters ?? []).map((l) => ({ ...l }));
  // 读档时保留存档里那个时刻，M4 靠它算「你不在的这段时间有哪些信到了」
  state.lastSeenAt = d.lastSeenAt ?? Date.now();
  return { state, sceneId: d.sceneId, lineIndex: d.lineIndex ?? 0 };
}

/**
 * 这个环境到底存不存得住档。
 *
 * 存不住有好几种：Safari 无痕、iOS 从文件管理器双击打开的本地文件、
 * 系统设置里关掉了网站数据。它们的共同点是——**不报错，只是什么都没发生**。
 * 玩家会一直玩到关掉页面才发现进度没了。所以要在她开始玩之前就问出这一句。
 */
export function storageWorks(): boolean {
  try {
    const probe = "wuzetian.probe";
    localStorage.setItem(probe, "1");
    const ok = localStorage.getItem(probe) === "1";
    localStorage.removeItem(probe);
    return ok;
  } catch {
    return false;
  }
}

export function write(slot: number, save: SaveV1): void {
  try {
    const prev = localStorage.getItem(KEY(slot));
    if (prev) localStorage.setItem(BAK(slot), prev);   // 先留退路，再覆盖
    localStorage.setItem(KEY(slot), JSON.stringify(save));
  } catch (e) {
    console.warn("[save] 写入失败，可能是隐私模式或配额满", e);
  }
}

export function read(slot: number): SaveV1 | null {
  return parseSlot(KEY(slot)) ?? parseSlot(BAK(slot));
}

function parseSlot(key: string): SaveV1 | null {
  let raw: string | null = null;
  try { raw = localStorage.getItem(key); } catch { return null; }
  if (!raw) return null;
  try {
    let d = JSON.parse(raw) as AnySave;
    let v = typeof d.version === "number" ? d.version : 0;
    if (v > SAVE_VERSION) {
      console.warn(`[save] 存档版本 ${v} 比程序还新，拒绝读取`);
      return null;
    }
    while (v < SAVE_VERSION) {
      const m = MIGRATIONS[v];
      if (!m) { console.warn(`[save] 缺少 v${v} 到 v${v + 1} 的迁移`); return null; }
      d = m(d); v += 1; d.version = v;
    }
    if (typeof d.sceneId !== "string") return null;
    return d as unknown as SaveV1;
  } catch (e) {
    console.warn(`[save] ${key} 解析失败`, e);
    return null;
  }
}

/** 手动存档槽。0 号是自动存档，玩家看不到也覆盖不了。 */
export const MANUAL_SLOTS = [1, 2, 3] as const;

export interface SlotInfo {
  slot: number;
  save: SaveV1 | null;
}

export function listSlots(): SlotInfo[] {
  return MANUAL_SLOTS.map((slot) => ({ slot, save: read(slot) }));
}

export function clear(slot: number): void {
  try {
    localStorage.removeItem(KEY(slot));
    localStorage.removeItem(BAK(slot));
  } catch { /* 隐私模式下忽略 */ }
}
