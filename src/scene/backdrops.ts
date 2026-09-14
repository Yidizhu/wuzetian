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
 */
export interface Backdrop {
  night?: boolean;
  floor?: number;
  person?: number;
  push?: "left" | "center" | "right";
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
  zhaoyang_ink:         { where: "昭阳殿水墨，序幕与四章" },
  zhaoyang_gold:        { floor: 22, person: 1, push: "center", where: "昭阳殿金碧。v1：红毯居中铺到画底，朝毯心推" },
  zhaoyang_ink_yedeng:  { night: true, where: "四章 06 夜谈四（夜灯）。dressings.ts 里有，剧本眼下没写这一条布置" },
  shuge_ink:            { floor: 22, person: 1, push: "right", where: "书阁水墨，十二场。四章 08、14 是夜里，剧本没有时辰一栏，眼下按日景（D-107）。v1：光从左窗进来，右边书架间有纵深，朝右推" },
  shuge_gold:           { where: "书阁金碧" },
  nvguan_ink:           { where: "女冠观" },
  nvguan_ink_kaike:     { where: "四章 12、13 开课" },
  nvguan_ink_yeyu:      { night: true, where: "三章 10 夜谈三（夜雨）" },
  shishe_ink:           { where: "诗社" },
  yuanye_ink:           { night: true, floor: 22, person: 1, push: "center", where: "原野，十三场。渐变版一直按夜场画。v1 是阴天日景，套夜滤镜后读得出是傍晚；路朝城门居中收，朝中推" },
  hanyuan_gold:         { where: "含元殿" },
  hanyuan_gold_gongyi:  { where: "含元殿公议，六场" },
  hanyuan_gold_shouwei: { where: "三章 12 受位议决" },
  wuzibei_ink:          { where: "无字碑" },
  wuzibei_ink_beiyang:  { night: true, where: "四章 18 夜谈五（碑样，C15）" },
  yilu_ink_qicheng:     { where: "四章 15 启程" },
  yilu_ink_yipang:      { where: "四章 16 驿旁" },
};
