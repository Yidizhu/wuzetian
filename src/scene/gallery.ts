import { CGS, CG_FEI_SUFFIX, isFeiVariant } from "./cgs.ts";

/**
 * 事件图回廊的排法（D-220，B43）。纯函数、零 DOM，测试和 UI 共用。
 *
 * - **按章列**：一张图属于剧本里第一次写到它的那一章，章里按场次、格序排。
 * - **结局图单独一排**，按 endings.json 的顺序。
 * - **绯版和原版算一张**（D-216）：格子只按原图的 key 排；解锁了哪个就显示哪个，两个都看过显示绯版（登基路走得更远）。
 * - **没解锁的留空位**：格子数照实给，不写名字、不给图——空位本身不剧透（D-220）。
 */

export interface GalleryScene {
  id: string;
  chapter: number;
  lines: { who: string; text: string }[];
}

export interface GallerySection {
  /** 章号；结局那一排是 null */
  chapter: number | null;
  /** 这一排每个格子的原图 key，顺序就是显示顺序 */
  keys: string[];
}

export function galleryLayout(scenes: GalleryScene[], endingKeys: string[]): GallerySection[] {
  const chapterOf = new Map<string, number>();
  const sorted = [...scenes].sort((a, b) => a.chapter - b.chapter || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const order: string[] = [];
  for (const s of sorted) {
    for (const l of s.lines) {
      if (l.who !== "cg" || chapterOf.has(l.text) || !CGS[l.text] || CGS[l.text]!.ending) continue;
      chapterOf.set(l.text, s.chapter);
      order.push(l.text);
    }
  }
  const chapters = [...new Set(order.map((k) => chapterOf.get(k)!))].sort((a, b) => a - b);
  const out: GallerySection[] = chapters.map((c) => ({ chapter: c, keys: order.filter((k) => chapterOf.get(k) === c) }));
  const ends = endingKeys.filter((k) => CGS[k]?.ending);
  if (ends.length) out.push({ chapter: null, keys: ends });
  return out;
}

/**
 * 这一格显示哪张图，没解锁是 null。`seen` 是存档里的 cgsSeen；`hasImage` 是这张图在不在（图读不出来就当没有）。
 * 绯版看过、图在 → 绯版；原图看过、图在 → 原图
 */
export function galleryPick(key: string, seen: ReadonlySet<string>, hasImage: (k: string) => boolean): string | null {
  const fei = key + CG_FEI_SUFFIX;
  if (!isFeiVariant(key) && CGS[fei] && seen.has(fei) && hasImage(fei)) return fei;
  if ((seen.has(key) || seen.has(fei)) && hasImage(key)) return key;
  return null;
}

const CHAPTER_NAMES = ["序", "第一章", "第二章", "第三章", "第四章"];
export function sectionTitle(s: GallerySection): string {
  return s.chapter === null ? "结局" : CHAPTER_NAMES[s.chapter] ?? `第${s.chapter}章`;
}
