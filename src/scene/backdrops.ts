import type { SceneDescriptor } from "./SceneRenderer.ts";

/**
 * 整图背景表（D-095、D-107；B17 C 线）。**一种「地点·色板·布置」一张日景**，名字就是 `public/scene/<key>.webp`。
 *
 * **默认是关的**：`public/scene/` 现在是空的，表里每一条都还没有图，CSS 版照旧画渐变。
 * 谁来开：CC3 的 `art:post -- scene <key>` 出了验收过的 webp，那一条就当场用图，引擎不用改。
 *
 * 这张表管的是**剧本用到了哪些组合、每张图怎么摆**；有没有图看 `public/scene/` 里有没有文件（构建期扫出来）。
 * 校验器守两件：剧本里用到的组合这张表必须都有；`public/scene/` 里的文件必须是表里的名字。
 *
 * 字段都可以不写，不写就是默认值。数由 CC3 看图后填（raster-pipeline.md 第五节）：
 * - `night`：夜场。**不另出图**，同一张日景套一层冷暗滤镜（D-107）。滤镜不够再单独出那两三张
 * - `floor`：人脚踩的那条线离画面底边多少（%），写进 `--stage-floor`。不写 22%，和渐变版一样
 * - `person`：人多大，写进 `--stage-person`。不写 1
 * - `push`：缓慢推近往哪边走，`left`／`center`／`right`，朝留白那边推（composition.md）。不写 center
 * - `from` + `tone`：**借另一条的图，加一层滤镜**（B21）。色板是同一个地方的两种画法，不是两个地方：
 *   昭阳殿水墨＝昭阳殿金碧那张降饱和去金，书阁金碧＝书阁水墨那张加金。两条省两张图，滤镜的数归 CC3 调
 * - `paintedNight`：这张图本身就画成了夜（苑野 v2）。背景不再套夜滤镜、不再叠暖光晕，
 *   再压一层就黑成一片；**人照样套**，人和夜才是同一种光（D-121 的例外，CC3 在 raster.css 里写好了另一半）
 */
export interface Backdrop {
  night?: boolean;
  floor?: number;
  person?: number;
  push?: "left" | "center" | "right";
  /** 借哪一条的图 */
  from?: string;
  /** 借来之后套哪种色调滤镜 */
  tone?: "ink" | "gold";
  /** 图本身就是夜景 */
  paintedNight?: boolean;
  /** 给人看：用在哪几场 */
  where: string;
}

/** 表的键：`<地点>_<色板>[_<布置>]`，比如 `hanyuan_gold_gongyi`、`yuanye_ink` */
export function backdropKey(d: Pick<SceneDescriptor, "key" | "palette" | "dressing">): string {
  return [d.key, d.palette, d.dressing].filter(Boolean).join("_");
}

export const BACKDROPS: Record<string, Backdrop> = {
  // B18：这四行的数是看 Codex 第一批 v1 原件、四张都在整屏里截过图之后填的（D-118）。图还没验收，验收换版后要再看一次
  yeting_ink:           { floor: 22, person: 1, push: "center", where: "掖庭，十六场。v1：院子土地铺到画底，人站 22% 踩在土上" },
  // 序幕走的就是这一条。B21 之前它没有图，序幕是一片白底（YIDI 真机报的第 2 条）
  zhaoyang_ink:         { from: "zhaoyang_gold", tone: "ink", floor: 22, person: 1, push: "center", where: "昭阳殿水墨，序幕与四章。借金碧那张，降饱和去金" },
  zhaoyang_gold:        { floor: 22, person: 1, push: "center", where: "昭阳殿金碧。v1：红毯居中铺到画底，朝毯心推" },
  zhaoyang_ink_yedeng:  { night: true, where: "四章 06 夜谈四（夜灯）。dressings.ts 里有，剧本眼下没写这一条布置" },
  shuge_ink:            { floor: 22, person: 1, push: "right", where: "书阁水墨，十二场。四章 08、14 是夜里，剧本没有时辰一栏，眼下按日景（D-107）。v1：光从左窗进来，右边书架间有纵深，朝右推" },
  shuge_gold:           { from: "shuge_ink", tone: "gold", floor: 22, person: 1, push: "right", where: "书阁金碧。借水墨那张，加金" },
  // B22：以下八行看第二批 v1（E18 验收）在缩略图上量过：地面都铺过 22% 那条线；推向朝画面里空着的那一边
  nvguan_ink:           { floor: 22, person: 1, push: "center", where: "女冠观。v1：左门开着，中间一张案，地面铺到画底" },
  nvguan_ink_kaike:     { floor: 22, person: 1, push: "center", where: "四章 12、13 开课。与素版同一构图，多晾纸与两张低案" },
  // 画出来的真夜景（E17、E18，和苑野同一种）：背景不再压夜，人照样压
  nvguan_ink_yeyu:      { night: true, paintedNight: true, floor: 22, person: 1, push: "center", where: "三章 10 夜谈三（夜雨）。v1 真夜：案上一盏灯，门外冷蓝" },
  shishe_ink:           { floor: 22, person: 1, push: "left", where: "诗社。v1：左边临水、晾着诗笺，朝左推" },
  // v2 是画出来的真夜景（E15 验收过）：背景不再套滤镜，人照样套
  yuanye_ink:           { night: true, paintedNight: true, floor: 22, person: 1, push: "center", where: "原野，十三场。v2 真夜景：月在左上、风灯在左；路朝城门居中收，朝中推" },
  hanyuan_gold:         { where: "含元殿" },
  hanyuan_gold_gongyi:  { floor: 22, person: 1, push: "center", where: "含元殿公议，六场。v1：两排议案，殿门在正中" },
  hanyuan_gold_shouwei: { floor: 22, person: 1, push: "center", where: "三章 12 受位议决。v1：御床在殿门前正中" },
  wuzibei_ink:          { floor: 22, person: 1, push: "center", where: "无字碑。v1：碑居中、碑面无字；碑面在原件 x 652–878、y 162–581（CC3 E18 量）" },
  // B22：剧本里真正走无字碑的只有这一条（碑样之后没有场次用素版）。自己的图没到之前借素版那张、套夜滤镜，
  // 碑样那张 CC3 会按同一构图出，到了就自动用自己的（resolveBackdrop 先看自己）
  wuzibei_ink_beiyang:  { night: true, from: "wuzibei_ink", floor: 22, person: 1, push: "center", where: "四章 18 夜谈五（碑样，C15）。自己的图没到，先借素版套夜滤镜" },
  yilu_ink_qicheng:     { floor: 22, person: 1, push: "center", where: "四章 15 启程。v1：路居中往雾里收，左车右里堠" },
  yilu_ink_yipang:      { where: "四章 16 驿旁" },
};
