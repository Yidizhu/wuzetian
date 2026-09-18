/**
 * 约会配乐（D-230、D-231，B46）。**按私人约会段放，不按人物出场、好感、事件图文件名放。**
 *
 * - 一段约会只切一次：段里换图、写景、连着同一张图都不重播（配乐层同一首在放就不动）。
 * - 段结束（到了 `until` 那一句，或者离开这一场），回到这一章的章曲；跨场连着同一首就一直放着。
 * - 公务、说停、拒绝、分开的场**不在表里**，照旧章曲（E39 第 5 节：ch04-05c* 说停、05q* 答复里的拒绝支、ch03-09a/b/c 分开）。
 * - 听雨（ch03-17）：约会曲照样放，配乐整体让位到一半（`soundscape.ts`），雨听得清。
 *
 * **不写格号，写原句锚点**：C52 改稿、D32 重转会重排格号（D-231 第 2 条），锚点是那一句里一小段不会变的字。
 * 测试逐条核锚点在正式数据里找得到（找不到就是稿改了，要回来对）。
 *
 * 三类，都照 E39 第 5 节：
 * 1. **十三场整场是约会的闲场**：进场就起（和布置夜雨一样在淡出那一刻），离场收。
 * 2. **承欢 ch02-26 受邀近坐那一段**：从她坐过来那一句起到场末。
 * 3. **多人场里的私人段**（B46 后半，D32 正式数据上核的）：这一句的条件写着 `love.<人>: true`，就放那个人的曲。
 *    D32 里这样的句子正好就是 E39 列的那几段：ch04-05z 四人、ch04-08z 三人、ch04-10 李令仪，外加 ch04-09 李令仪那四句。
 *    `love.<人>: false` 的句子（不爱那一支）不放。句子能显示出来就说明条件满足了，所以只看这一句自己的条件就够。
 * **不收的**：ch02-13 答应留身旁那支只有两句，夹在公议念信后面，为两句切曲太突兀；
 * ch04-05qa—qd 听答复，整场都在等她开口，「愿意」在最后一两句，先放约会曲等于替她答了。
 */
export const DATE_TRACKS = ["shenheng", "peizhaoye", "wenqiao", "liqinghe", "liuchenghuan"] as const;
export type DateTrack = (typeof DATE_TRACKS)[number];

export interface DateSegment {
  scene: string;
  track: DateTrack;
  /** 从哪一句起（这一句里的一小段字）。不写是进场就起 */
  from?: string;
  /** 到哪一句前收（这一句起就回章曲）。不写是到场末 */
  until?: string;
  why: string;
}

export const DATE_SEGMENTS: readonly DateSegment[] = [
  // 第一章：四人各一场闲场约会
  { scene: "ch01_s13_shuge",  track: "shenheng",  why: "推冷茶杯（E39：明确闲场）" },
  { scene: "ch01_s14_yuanye", track: "peizhaoye", why: "解结、先问再握手" },
  { scene: "ch01_s15_shishe", track: "wenqiao",   why: "藏两张纸后互看" },
  { scene: "ch01_s16_yuanye", track: "liqinghe",  why: "投叶、递叶" },
  // 第二章
  { scene: "ch02_s15_shuge",  track: "shenheng",  why: "认墨渍" },
  { scene: "ch02_s16_yuanye", track: "peizhaoye", why: "分饼，脆角落掌" },
  { scene: "ch02_s17_shishe", track: "wenqiao",   why: "竹窗影、获邀靠肩" },
  { scene: "ch02_s18_yuanye", track: "liqinghe",  why: "绕低枝后各挪近" },
  { scene: "ch02_s26_shuge",  track: "liuchenghuan", from: "她坐过来", why: "受邀近坐与真实心动（非正式恋爱线，D-225）；从她坐过来起" },
  // 第三章：私约之后各一场
  { scene: "ch03_s17_shuge",  track: "shenheng",  why: "听夜雨：接雨、吻指背、覆手待雨（雨声保留，配乐让位）" },
  { scene: "ch03_s18_yuanye", track: "peizhaoye", why: "树影长凳，挪近" },
  { scene: "ch03_s19_shishe", track: "wenqiao",   why: "共扇纸、贴肩" },
  { scene: "ch03_s20_yuanye", track: "liqinghe",  why: "各拿果子" },
  // 第四章
  { scene: "ch04_s16_yilu",   track: "peizhaoye", why: "驿旁倒靴砂，有独立归期" },
];

/** 这一首的地址（相对 BASE_URL） */
export function dateTrackUrl(t: DateTrack): string {
  return `bgm/date_${t}.m4a`;
}

/**
 * 这一场这一格该放哪首约会曲，没有就是 null（放章曲）。
 * `lines` 是这一场的格（按剧本顺序）；`at` 是当前格在里面的下标，**进场那一刻（还没到第一格）给 -1**。
 * 锚点找不到：这一段当它不存在（放章曲），不猜
 */
export function dateTrackAt(sceneId: string | undefined, lines: readonly { text: string; when?: object }[], at: number): DateTrack | null {
  if (!sceneId) return null;
  // 第 3 类：按恋爱状态才出现的那一句
  const w = at >= 0 ? (lines[at]?.when as Record<string, unknown> | undefined) : undefined;
  if (w) for (const t of DATE_TRACKS) if (w[`love.${t}`] === true) return t;
  for (const seg of DATE_SEGMENTS) {
    if (seg.scene !== sceneId) continue;
    const from = seg.from === undefined ? -1 : lines.findIndex((l) => l.text.includes(seg.from!));
    if (seg.from !== undefined && from < 0) continue;
    const until = seg.until === undefined ? Infinity : lines.findIndex((l) => l.text.includes(seg.until!));
    if (seg.until !== undefined && until < 0) continue;
    if (at >= from && at < until) return seg.track;
  }
  return null;
}

/** 承欢的告白信（D-225）：读它时暂用她那首。别的信不换曲 */
export function letterTrack(from: string): DateTrack | null {
  return from === "liuchenghuan" ? "liuchenghuan" : null;
}
