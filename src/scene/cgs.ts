/**
 * 事件图（CG，D-142）表。**一张事件图一行**，名字就是 `public/cg/<key>.webp`，照 CC3 的命名 `<人>_<序号>_<动作>`。
 *
 * **默认是关的（D-097）**：`public/cg/` 现在是空的，剧本里也还没有一句「事件图」。
 * 谁来开：CC3 验收、`art:post -- cg <key>` 出图到 `public/cg/`；ChatGPT 在剧本里写一行说话人「事件图」、文本写这里的 key。
 * 两样都到了那一格才会铺图；只有剧本没有图，那一格直接跳过，游戏照常走。
 *
 * 剧本写法和题记同一个办法，不加新字段：
 *   | 序 | 说话人 | 表情 | 类型 | 条件 | 文本 |
 *   | 12 | 事件图 |  |  |  | peizhaoye_3_woshou |
 * 转换器出 `who: "cg"`、`text: "peizhaoye_3_woshou"`。前一格写她看见了什么，后一格写她没说出口的那一句（D-144）。
 *
 * **构图（D-150）**：默认竖构图；只有主体本身是宽的才横，横的**必须记焦点**（`focus`），引擎按焦点裁。
 * 横竖不写在表里，**看图本身的宽高**——表里写一份、图是另一份，迟早对不上（D-098）。
 * 竖图在宽屏上两侧用同一张图虚化填满；横图在手机上按焦点铺满。
 * `check:art` 读 `public/cg/` 里每张图的宽高：横的没写焦点就拦。
 *
 * 校验器守两件：剧本里写的 key 这张表必须有；`public/cg/` 里的文件必须是表里的名字。
 *
 * **结局图（D-159、D-160，B27）**：八个结局各一行，写 `ending`。它们不在剧本里写「事件图」那一格，
 * 由引擎在结局卡第一拍自己铺（D-084 两拍：画面／题名正文）；第二拍默认收掉（cg.css）。
 * **印（D-067）仍然只在「无字之碑」**：印不画进图里，引擎按表里的 `seal` 叠在图上；
 * 别的结局写了 `seal`、或者无字之碑有图没写 `seal`，`check:art` 都拦。
 * `check:art` 还守：endings.json 里每个结局，这张表都得有一行（「装得下八张」）。
 */
export interface Cg {
  /** 画里的人（角色 key） */
  who: string[];
  /** D-143 三段式：注意到她／本行 → 为你 → 亲密；D-148 主角先想要；非恋爱线写「关系」 */
  /** 「转变」（B29）：主角身份变的那一刻，D-159 第二优先的受位／拒位 */
  /** 「追问」「答复」（B31，CC3 E26 序号 5、6）：她问出口主角还没答；主角说完意向、她答的那一刻 */
  beat: "注意到她" | "本行" | "为你" | "亲密" | "主角先想要" | "关系" | "转变" | "追问" | "答复" | "风物" | "结局";
  /**
   * 焦点：画面里最要紧的那一点，占宽、高的百分比。**横图必须写**（D-150），手机上按它裁；竖图可不写。
   * 数由 CC3 看图后填
   */
  focus?: { x: number; y: number };
  /** 结局图：endings.json 的 key。填了就由引擎在结局卡第一拍铺，剧本不用写 */
  ending?: string;
  /** 印的中心，占图宽、高的百分比（D-067）。**只有无字之碑那张能写**，数由 CC3 看图后填 */
  seal?: { x: number; y: number };
  /** 给人看：画的是什么、在哪一场 */
  where: string;
}

export const CGS: Record<string, Cg> = {
  // E19／E20：先试的两张（D-146）
  peizhaoye_1_xunma:  { who: ["peizhaoye"],            beat: "本行",       focus: { x: 45, y: 30 }, where: "裴照夜驯马（单人）。ch01-07 苑野。主体本身是宽的，按 D-150 横构图。焦点 CC3 E22 按 v2 量：她的脸 x 520–660、马头 760–960，手机那一条 478–951 都装得下（CC3 加，待协调）" },
  adi_1_buxiu:        { who: ["adi", "wuze"],          beat: "关系",       where: "阿荻替主角补袖（双人，有接触）。ch01-03" },
  // E21：四种类型各一张，位置来自 C32 样稿（样稿写回正文之前，剧本里还没有这四句）
  wenqiao_1_chaozhi:  { who: ["wenqiao"],              beat: "本行",       where: "温荞在纸坊提帘抄纸（单人，竖）。D-151／D-158；剧本还没有格子（CC3 加，待协调）" },
  wenqiao_1_cangzhi:  { who: ["wenqiao", "wuze"],      beat: "注意到她",   where: "温荞把两张纸藏到身后，笑得收不住，两人对看。ch01-15 诗社" },
  liqinghe_2_diye:    { who: ["liqinghe", "wuze"],     beat: "为你",       where: "李令仪捡一片断梗的叶子递到主角面前，眼睛看着她的袖口。ch01-16 苑墙" },
  peizhaoye_3_woshou: { who: ["peizhaoye", "wuze"],    beat: "亲密",       where: "「这只手，给我握一会儿」，裴照夜垂眼看两人握着的手。ch01-14 苑里" },
  shenheng_4_bingzuo: { who: ["shenheng", "wuze"],     beat: "主角先想要", where: "主角把月牙凳提到沈衡身侧坐下，沈衡侧过脸看她。ch01-04 书阁，当夜" },

  // D-159 第二优先：受位／拒位，ch03-12 含元殿，两张都竖（ai-prompt 第十三节）。剧本那一格「事件图」还没写，ChatGPT 补
  wuze_shouwei:       { who: ["wuze", "shenheng"],     beat: "转变",       where: "受位。ch03-12 第 12 格，她穿上绯，看自己沉下来的袖口；赭黄叠在旁边漆盘里，没穿（D-165）" },
  wuze_juwei:         { who: ["wuze", "tangjian"],     beat: "转变",       where: "拒位。ch03-12 第 37—41 格，她解下候选差牌放回匣里，帛带上空了一截丝绦，手还往那里去。青，不变" },

  // E26（D-173）：七张双人，落点和画面照 CC3 E26 第二节。都是竖图；答复四张一张图盖「愿意」「不愿意」两支，主角穿青
  shenheng_6_dafu:        { who: ["shenheng", "wuze"],     beat: "答复", where: "ch04-05qa 第 2／16 格。沈衡在案后，两手按着那张空纸，抬头看主角" },
  peizhaoye_6_dafu:       { who: ["peizhaoye", "wuze"],    beat: "答复", where: "ch04-05qb 第 4 格。裴照夜把行囊放到脚边，空着手站到主角面前" },
  wenqiao_6_dafu:         { who: ["wenqiao", "wuze"],      beat: "答复", where: "ch04-05qc 第 4／19 格。温荞手掌压着一张纸，看着主角，没接玩笑" },
  liqinghe_6_dafu:        { who: ["liqinghe", "wuze"],     beat: "答复", where: "ch04-05qd 第 4／16 格。李令仪站在自己那一级石阶上，稿在一只手里，另一只手空着" },
  liqinghe_5_suanshenme:  { who: ["liqinghe", "wuze"],     beat: "追问", where: "ch03-09 第 40—41 格。她把松线绕在指上，问「那我算什么」，主角还没答" },
  wuze_huian:             { who: ["wuze", "shenheng", "tangjian"], beat: "转变", where: "ch04-03 第 17—27 格（毁卷两选在 03 末尾）。沈衡把缺字的那页摊平，手没交出去；罩灯没挪近纸；唐简在门边逆光。绯，不许有火" },
  liuchenghuan_1_guihuan: { who: ["liuchenghuan", "wuze"], beat: "关系", where: "ch03-15 第 77 格。柳承欢把朱绳放进主角摊开的手里，手指收回来时还弯着；她腕上已空" },

  // E27（D-176／D-177）：三张亲密、两张本行，落点照 CC3 E27 第二节（亲密三张照 C39，未受位支，主角青）
  shenheng_3_zhibei:      { who: ["shenheng", "wuze"],     beat: "亲密", where: "ch03-17（C39：22 格后）。主角两手拢住沈衡的手，唇贴指背，抬眼看她" },
  wenqiao_3_tiejian:      { who: ["wenqiao", "wuze"],      beat: "亲密", where: "ch03-19（C39：30 格后）。各捏折纸扇一端，温荞挨过来合纸角，肩贴肩" },
  liqinghe_3_xiangying:   { who: ["liqinghe", "wuze"],     beat: "亲密", where: "ch03-20（C39：21 格后）。主角凑过去，李令仪迎上来，唇相贴（侧面）" },
  shenheng_1_tengxie:     { who: ["shenheng"],             beat: "本行", where: "ch01-01 昭阳殿第 4、10 格。沈衡站在案边誊清，笔持得低、尖朝下，废稿折进袖里。单人" },
  liqinghe_1_boyi:        { who: ["liqinghe"],             beat: "本行", where: "ch01-08 第 25、56 格。李令仪穿紫礼衣拢起大袖、压平册子，抬眼问「这两笔代价，你选哪笔」。单人" },
  // E30（D-173）：最后四张。落点、装束照 C42；「为你」是 D-143 第二段，宋蕙贞不是恋爱线、这是她的第一张。
  // 温荞那张的动作词 CC3 定为 dengju（等句），不是日志里的 dengqi
  peizhaoye_2_dangfeng:   { who: ["peizhaoye", "wuze"],    beat: "为你", where: "ch02-14 第 39 格后。她站到来风那一侧，袍角还在翻，靴子停在主角身侧；门口留着一块空地" },
  wenqiao_2_dengju:       { who: ["wenqiao", "wuze"],      beat: "为你", where: "ch02-09 第 42 格后。她收住声，嘴唇还张着、手停在半空，等主角起下一句；两人抬头看着对方" },
  shenheng_2_rangzuo:     { who: ["shenheng", "wuze"],     beat: "为你", where: "ch03-02 第 31 格后。她坐到卷架那一侧，靠门的凳子空着、凳脚朝着主角；主角还站着" },
  songhuizhen_1_diwen:    { who: ["songhuizhen", "wuze", "adi"], beat: "关系", where: "ch02-12 第 2 格后。宋蕙贞把温水挪到席边，手指还扶着碗沿；阿荻在旁边缝自己的针包，不回头" },

  // 风物（D-180，E28）：画东西不画人，`who` 空；key 接画面里那样东西的名字，不接节名。
  // 四张节令配四封节令信与节令空镜，两张吃的配每章那个闲场
  wu_denglun:   { who: [], beat: "风物", where: "上元（gold）。宫墙边一架七层灯轮；前景矮案上点名簿、一叠领灯差牌、一盏快熄的小灯" },
  wu_lengzao:   { who: [], beat: "风物", where: "寒食（ink）。泥封的冷灶，灶台上前一天做好的冷饼、凉粥，一盏凉了的药" },
  wu_yuejiu:    { who: [], beat: "风物", where: "八月望夜（ink）。窗外满月；案上一盏酒、一碟梨和葡萄、一封折好还没封口的信" },
  wu_zhuyu:     { who: [], beat: "风物", where: "重阳（ink）。塔顶栏杆上系着的茱萸囊被风吹横；一盏菊花酒；远处是长安的坊" },
  wu_sushan:    { who: [], beat: "风物", where: "酥山（gold）。一人一案的食案上，碎冰淋酥、插着花草，底下开始化" },
  wu_lengtao:   { who: [], beat: "风物", where: "槐叶冷淘（ink）。掖庭井栏上一碗碧绿的凉面，旁边刚打上来的水桶在滴水" },
  // D-197：受位／拒位那一场的三样物证，按风物图规矩（无人、无字）。图待上线；格子在 C46
  wu_chaipai:   { who: [], beat: "风物", where: "候选差牌。ch03-11 选择前、提出代价者那句之后。窄木牌系着丝绦放在漆匣口，牌面朝下或空白面朝上，不写字" },
  wu_cishoudie: { who: [], beat: "风物", where: "辞受牒。ch03-12 第 32 格后（辞受支）。一纸摊在案上，只画折痕和一枚朱印，末行一道墨痕示意，不画可读的字" },
  wu_yinshou:   { who: [], beat: "风物", where: "印绶。ch03-12 第 48 格前（李受位支，主角站在阶下）。一方印、一条绶带盘在漆盘里，还没有人的手" },

  // D-160：八个结局各一张，结局卡第一拍。名字按 ending_<结局 key>，CC3 定了别的名字改这里一处就行。
  // 画面含义照 C-B 结局树（D-159「别自己发明结局的含义」），where 只抄 endings.json 的主题句，人由 CC3 按提示词改
  ending_mandianwusheng:  { who: ["wuze"],             beat: "结局", ending: "mandianwusheng",  where: "满殿无声（gold）。她跨过了血缘的门槛，却把别人的异议关在门外" },
  ending_wuzibei:         { who: ["wuze"],             beat: "结局", ending: "wuzibei", seal: { x: 49, y: 72 }, where: "无字之碑（ink）。碑上不许有字，印不画进图里，引擎按 seal 叠（D-067）" },
  ending_weijingzhizhao:  { who: ["wuze"],             beat: "结局", ending: "weijingzhizhao",  where: "未竟之诏（ink）。非宗室皇帝已经出现，改革仍须经办" },
  ending_liangxizhijian:  { who: ["liqinghe", "wuze"], beat: "结局", ending: "liangxizhijian", focus: { x: 62, y: 50 }, where: "两席之间（ink）。李令仪赢了，主角没有赢；落选者不消失" },
  ending_kaimenshouzi:    { who: ["wuze"],             beat: "结局", ending: "kaimenshouzi",    where: "开门授字（ink）。不登基，让更多人有可用的本领与去处" },
  ending_bushou:          { who: ["wuze"],             beat: "结局", ending: "bushou",          where: "不受（ink）。赢得了受位资格，又选择不要" },
  ending_guanshanyouxin:  { who: ["peizhaoye", "wuze"], beat: "结局", ending: "guanshanyouxin", where: "关山有信（ink）。在地方把事情办下去，与裴照夜各有职分" },
  ending_zhishangyouming: { who: ["wuze"],             beat: "结局", ending: "zhishangyouming", where: "纸上有名（ink）。没有取得权位，人生仍不只剩失败" },
};

/** 这个结局的结局图 key，表里没有就是 null */
export function endingCg(endingKey: string): string | null {
  for (const [k, c] of Object.entries(CGS)) if (c.ending === endingKey) return k;
  return null;
}

/**
 * 图上一点（占图宽、高的百分比）铺到屏上落在哪个像素（B27，印要跟着图走）。
 * 两种铺法和 CgLayer／cg.css 一致：cover 按焦点对齐（background-position 百分比的算法），contain 居中整张放进来。
 * 纯函数，窗口一变就重算
 */
export function placeOnImage(
  img: { w: number; h: number }, box: { w: number; h: number },
  fit: "cover" | "contain", focus: { x: number; y: number }, p: { x: number; y: number },
): { x: number; y: number } {
  const scale = fit === "cover" ? Math.max(box.w / img.w, box.h / img.h) : Math.min(box.w / img.w, box.h / img.h);
  const w = img.w * scale, h = img.h * scale;
  const ox = fit === "cover" ? (box.w - w) * focus.x / 100 : (box.w - w) / 2;
  const oy = fit === "cover" ? (box.h - h) * focus.y / 100 : (box.h - h) / 2;
  return { x: ox + w * p.x / 100, y: oy + h * p.y / 100 };
}
