/**
 * 光栅立绘的清单（E11，D-095；E12 按 D-105 去掉主角的绿）。**十三套装束，一套一行。** 这是唯一的一份：
 * 后处理（`tools/art-post.ts`）从这里取身高，生成原件按这里的 `asset` 命名，
 * 引擎以后按这里知道哪些图存在。别处不许再抄一份（D-098）。
 *
 * **现状（E18）**：主角·青、沈衡、裴照夜、宋蕙贞、李令仪·郁金五套是光栅图（`public/char/`），其余仍是 `src/char/*.svg`（D-116 一张换一张）。
 * 这张表只在 PNG 验收过、CC1 接上之后才被引擎读。旧 SVG 一张不删，是 fallback（D-095）。
 *
 * 命名沿用现在立绘的规矩 `<who>_<expr>[_<suffix>]`（见 `sprite-rules.ts`），好让引擎拿不到变体时照旧退回 `<who>_<expr>`：
 * - 主角两套（D-091、D-105）：青是底，文件就叫 `wuze_default`；绯带后缀 `_fei`，只在 `enthroned` 之后。
 *   剧本里她的身份只变一次，所以没有「绿」。
 * - 李令仪两套（D-092）：日常郁金是底，正式礼衣的紫带 `_zi`。
 * - 柳承欢的 `_bare` **不另生成**：从她那张验收过的图上把腕上朱绳修掉（两次生成必然两张脸，D-095）。
 *
 * 身高 `height` 是相对主角的比例，起点抄自 SVG 生成器 `tools/gen-char.ts`（那边已停，不再维护）。
 * 后处理按它把每个人缩到同一把尺子上——**生成图里人人都顶天立地，不缩就十一个人一样高**。
 */

export type BgKind = "white" | "gray" | "green";

export interface Portrait {
  /** 引擎里的名字（不带扩展名）：public/char/{full,knee}/<file>.webp */
  file: string;
  /**
   * 生成原件的名字，`<who>_<身份>_<色>_<表情>`，原件落在 `assets/portraits/<asset>_v<N>.png`，一版一个文件、不覆盖。
   * 这是 Codex 第一张实测图（`wuze_cairen_qing_default_v1.png`）已经在用的写法，照它定。
   * 主角的绯是登基之后（`enthroned`，D-105），身份位写 tianzi
   */
  asset: string;
  who: string;
  /** 这一套的主色，品色服（D-082、D-091、D-092、D-093）。给人看的名字 + 近似值，生图模型只认名字 */
  robe: string;
  hex: string;
  /** 相对主角的身高 */
  height: number;
  /**
   * 生成时要的底色。浅色衣服在纯白底上抠不干净：亮面和白底差不到二十个色阶。
   * E11 定的是中灰底；**E18 实测许静和 v1（月白）在中灰底上抠坏了**——衣服暗面落到了中灰上，右半边袍子被啃出锯齿洞。
   * 所以浅色、灰色系的衣服改用绿幕：选一种这个人身上完全没有的颜色。阿荻（本色麻）v1 在中灰底上抠得干净，不改
   *
   * **底色规格（D-149，写死）**：
   * - white：默认。主色够深、够有颜色的都用它
   * - gray（#808080）：暖的中间调、离中灰够远的（阿荻本色麻）
   * - green（#00B140）：浅色、灰色系，**并且身上没有绿**（许静和月白、温荞缃、柳承欢灰青）
   * - **穿绿的人（沈衡、唐简，将来任何主色落在绿里的）一律不许 green**
   * `tools/art-post.ts` 的 `bgClash` 管这条：这张表写错，art:post 任何命令都不跑；原件底色和主色相近，那一张不出图
   */
  bg: BgKind;
  /** 不另生成，从哪一张修出来 */
  derivedFrom?: string;
}

export const PORTRAITS: Portrait[] = [
  { file: "wuze_default", asset: "wuze_cairen_qing_default",        who: "wuze",         robe: "青",           hex: "#4F7F8A", height: 1.0,  bg: "white" },
  { file: "wuze_default_fei", asset: "wuze_tianzi_fei_default",     who: "wuze",         robe: "绯（胭脂一系）", hex: "#A8454A", height: 1.0,  bg: "white" },
  { file: "shenheng_default", asset: "shenheng_siji_shenlv_default",    who: "shenheng",     robe: "深绿",         hex: "#2A5A48", height: 1.04, bg: "white" },
  { file: "peizhaoye_default", asset: "peizhaoye_nvjiang_yanzhifei_default",   who: "peizhaoye",    robe: "绯（胭脂）",   hex: "#8E3A3A", height: 1.1,  bg: "white" },
  { file: "wenqiao_default", asset: "wenqiao_shiren_xiang_default",     who: "wenqiao",      robe: "缃",           hex: "#DCC98E", height: 0.97, bg: "green" },
  { file: "liqinghe_default", asset: "liqinghe_gongzhu_yujin_default",    who: "liqinghe",     robe: "郁金",         hex: "#D2A035", height: 1.03, bg: "white" },
  { file: "liqinghe_default_zi", asset: "liqinghe_gongzhu_zi_default", who: "liqinghe",     robe: "紫（礼衣）",   hex: "#6A4470", height: 1.03, bg: "white" },
  { file: "songhuizhen_default", asset: "songhuizhen_cairen_zhe_default", who: "songhuizhen",  robe: "赭",           hex: "#9A6A45", height: 0.99, bg: "white" },
  { file: "hetaihou_default", asset: "hetaihou_taihou_shenqing_default",    who: "hetaihou",     robe: "深石青",       hex: "#1F3F6E", height: 1.0,  bg: "white" },
  { file: "xujinghe_default", asset: "xujinghe_nvguan_yuebai_default",    who: "xujinghe",     robe: "月白",         hex: "#D6E3E6", height: 1.01, bg: "green" },
  { file: "tangjian_default", asset: "tangjian_dianji_qianlv_default",    who: "tangjian",     robe: "浅绿",         hex: "#6E9A7C", height: 0.96, bg: "white" },
  { file: "adi_default", asset: "adi_gongren_ma_default",         who: "adi",          robe: "本色麻",       hex: "#BFA27C", height: 0.94, bg: "gray" },
  { file: "liuchenghuan_default", asset: "liuchenghuan_gongren_huiqing_default", who: "liuchenghuan", robe: "灰青",        hex: "#8FA3B0", height: 1.0,  bg: "green" },
  { file: "liuchenghuan_default_bare", asset: "liuchenghuan_gongren_huiqing_default_bare", who: "liuchenghuan", robe: "灰青",   hex: "#8FA3B0", height: 1.0,  bg: "green", derivedFrom: "liuchenghuan_default" },
];

/**
 * 同一把尺子（后处理与引擎共用，改这里一处）：
 * 画布 1024×1536，脚底落在第 1500 行，主角（height 1.0）从头顶到脚底 1280 像素。
 * 膝上裁切取第 0 到 1080 行——对最高的裴照夜（1.1）刚好在膝盖上面，对最矮的阿荻高出膝盖一截。
 * **裁切行是固定的，不按每个人的外框算**：按外框裁，对话里十一个人又一样高了。
 */
export const CANVAS = { width: 1024, height: 1536, feetY: 1500, stature: 1280, kneeCropY: 1080 } as const;

/** 眼睛离脚底是身高的多少（成人约 0.936）。给了眼睛那一行，后处理就不用拿发髻冠子的顶去算身高 */
export const EYE_RATIO = 0.936;
