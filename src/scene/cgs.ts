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
  /**
   * 这张图铺开那一下响什么（D-202，B37）。不写就是规则 ③ 的纸响；风物图（`beat: "风物"`）不响——它们不是纸，也不是动作。
   * 身体、衣料动的写 `cloth_rustle`，有马的写 `horse_bell`
   */
  sfx?: "cloth_rustle" | "horse_bell";
  /** 给人看：画的是什么、在哪一场 */
  where: string;
}

export const CGS: Record<string, Cg> = {
  // E19／E20：先试的两张（D-146）
  peizhaoye_1_xunma:  { who: ["peizhaoye"],            beat: "本行",       focus: { x: 45, y: 30 }, sfx: "horse_bell", where: "裴照夜驯马（单人）。ch01-07 苑野。主体本身是宽的，按 D-150 横构图。焦点 CC3 E22 按 v2 量：她的脸 x 520–660、马头 760–960，手机那一条 478–951 都装得下（CC3 加，待协调）" },
  adi_1_buxiu:        { who: ["adi", "wuze"],          beat: "关系",       where: "阿荻替主角补袖（双人，有接触）。ch01-03" },
  // E21：四种类型各一张，位置来自 C32 样稿（样稿写回正文之前，剧本里还没有这四句）
  wenqiao_1_chaozhi:  { who: ["wenqiao"],              beat: "本行",       where: "温荞在纸坊提帘抄纸（单人，竖）。D-151／D-158；剧本还没有格子（CC3 加，待协调）" },
  wenqiao_1_cangzhi:  { who: ["wenqiao", "wuze"],      beat: "注意到她",   where: "温荞把两张纸藏到身后，笑得收不住，两人对看。ch01-15 诗社" },
  liqinghe_2_diye:    { who: ["liqinghe", "wuze"],     beat: "为你",       where: "李令仪捡一片断梗的叶子递到主角面前，眼睛看着她的袖口。ch01-16 苑墙" },
  peizhaoye_3_woshou: { who: ["peizhaoye", "wuze"],    beat: "亲密",       sfx: "cloth_rustle", where: "「这只手，给我握一会儿」，裴照夜垂眼看两人握着的手。ch01-14 苑里" },
  shenheng_4_bingzuo: { who: ["shenheng", "wuze"],     beat: "主角先想要", sfx: "cloth_rustle", where: "主角把月牙凳提到沈衡身侧坐下，沈衡侧过脸看她。ch01-04 书阁，当夜" },

  // D-159 第二优先：受位／拒位，ch03-12 含元殿，两张都竖（ai-prompt 第十三节）。剧本那一格「事件图」还没写，ChatGPT 补
  wuze_shouwei:       { who: ["wuze", "shenheng"],     beat: "转变",       sfx: "cloth_rustle", where: "受位。ch03-12 第 12 格，她穿上绯，看自己沉下来的袖口；赭黄叠在旁边漆盘里，没穿（D-165）" },
  wuze_juwei:         { who: ["wuze", "tangjian"],     beat: "转变",       sfx: "cloth_rustle", where: "拒位。ch03-12 第 37—41 格，她解下候选差牌放回匣里，帛带上空了一截丝绦，手还往那里去。青，不变" },

  // E26（D-173）：七张双人，落点和画面照 CC3 E26 第二节。都是竖图；答复四张一张图盖「愿意」「不愿意」两支，主角穿青
  shenheng_6_dafu:        { who: ["shenheng", "wuze"],     beat: "答复", where: "ch04-05qa 第 2／16 格。沈衡在案后，两手按着那张空纸，抬头看主角" },
  peizhaoye_6_dafu:       { who: ["peizhaoye", "wuze"],    beat: "答复", where: "ch04-05qb 第 4 格。裴照夜把行囊放到脚边，空着手站到主角面前" },
  wenqiao_6_dafu:         { who: ["wenqiao", "wuze"],      beat: "答复", where: "ch04-05qc 第 4／19 格。温荞手掌压着一张纸，看着主角，没接玩笑" },
  liqinghe_6_dafu:        { who: ["liqinghe", "wuze"],     beat: "答复", where: "ch04-05qd 第 4／16 格。李令仪站在自己那一级石阶上，稿在一只手里，另一只手空着" },
  // 绯版（D-216，B42）：同一刻、主角穿绯。**剧本图格 key 不变**，铺图时主角是绯、这一行有图就换成它（cgFor）。图待上线
  shenheng_6_dafu_fei:    { who: ["shenheng", "wuze"],     beat: "答复", where: "shenheng_6_dafu 的绯版，登基路用" },
  peizhaoye_6_dafu_fei:   { who: ["peizhaoye", "wuze"],    beat: "答复", where: "peizhaoye_6_dafu 的绯版，登基路用" },
  wenqiao_6_dafu_fei:     { who: ["wenqiao", "wuze"],      beat: "答复", where: "wenqiao_6_dafu 的绯版，登基路用" },
  liqinghe_6_dafu_fei:    { who: ["liqinghe", "wuze"],     beat: "答复", where: "liqinghe_6_dafu 的绯版，登基路用" },
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
  peizhaoye_2_dangfeng:   { who: ["peizhaoye", "wuze"],    beat: "为你", sfx: "cloth_rustle", where: "ch02-14 第 39 格后。她站到来风那一侧，袍角还在翻，靴子停在主角身侧；门口留着一块空地" },
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

  // ---------------------------------------------------------------- E39 全量冻结登记（D-222、D-223，B46）
  // 约会、写景、空镜补图，照 docs/art-cc3-e39.md 第 8 节逐行登记（95 行＋4 个基础名），where 抄原句锚点和身份。
  // - 全部竖构图 1024×1536：不写 focus（E39：计划中心不是实测）。
  // - **不写 sfx**：D-229 起出图默认不响，双人图哪几张可以响、响什么，等 CC3 E40 按实际画面列名单再加。
  // - 登记 ≠ 可用：有没有图看 public/cg/；E40 暂缓的 5 张（陌生人物、可读匾额）没有文件，那几格照常读字。
  // - `e39_ch04_s05z_l31／l70／l100／l139` 四个基础名是 B46 定的：E39 只给了 `_fei` 名，而「画面」列只写基础名（D-216）。
  //   这四格在第四章，主角是绯时铺绯版；不是绯时没有青版图，只读字
  shenheng_7_jieyu: { who: ["wuze", "shenheng"], beat: "关系", where: "ch03_s17_shuge.l8「你照她指的地方伸手，一滴没接到。指背挨上窗框，沾了一条灰。」（青）" },
  shenheng_7_jieyu_fei: { who: ["wuze", "shenheng"], beat: "关系", where: "ch03_s17_shuge.l8「你照她指的地方伸手，一滴没接到。指背挨上窗框，沾了一条灰。」（绯）" },
  wu_shangsi_liuquan: { who: [], beat: "风物", where: "ch03_s01_shuge.l37「旧景·上巳。水边一只柳圈搁在石上，细浪沾湿了梢头。」（无人）" },
  shenheng_8_mozi: { who: ["wuze", "shenheng"], beat: "关系", where: "ch02_s15_shuge.l21「你张了张嘴，又闭上。她先笑出了声，手指还捏着袖角。」（青）" },
  peizhaoye_7_baibing: { who: ["wuze", "peizhaoye"], beat: "关系", where: "ch02_s16_yuanye.l22「她挑出自己手里那块的脆角，放到你掌心。」（青）" },
  wenqiao_7_chuangying: { who: ["wuze", "wenqiao"], beat: "关系", where: "ch02_s17_shishe.l14「她拨开发尾，把肩侧让给你。你挪过去，额角贴上她的肩。」（青）" },
  liqinghe_7_dizhi: { who: ["wuze", "liqinghe"], beat: "关系", where: "ch02_s18_yuanye.l22「李令仪望了望两人之间，向你挪了一点。你也挪过去。」（青）" },
  shenheng_9_liangcha: { who: ["wuze", "shenheng"], beat: "关系", where: "ch01_s13_shuge.l22「沈衡手停在杯边，看了你一眼，才把杯子推过来。」（青）" },
  peizhaoye_8_shuying: { who: ["wuze", "peizhaoye"], beat: "关系", where: "ch03_s18_yuanye.l21「你靠上树干，偏头看她。她没闭眼，也没问你看什么。」（青）" },
  peizhaoye_8_shuying_fei: { who: ["wuze", "peizhaoye"], beat: "关系", where: "ch03_s18_yuanye.l21「你靠上树干，偏头看她。她没闭眼，也没问你看什么。」（绯）" },
  peizhaoye_9_yipang: { who: ["wuze", "peizhaoye"], beat: "关系", where: "ch04_s16_yilu.l15「你将原凭收好，裴把空靴口递过来，让你看那粒砂。」（出行青）" },
  liuchenghuan_2_jinzuo: { who: ["wuze", "liuchenghuan"], beat: "关系", where: "ch02_s26_shuge.l14「你把膝边的书往里挪。她坐过来，裙角铺到那一小块亮处。」（青）" },
  e39_ch01_s07_l20: { who: ["wuze", "peizhaoye"], beat: "关系", where: "ch01_s07_yuanye.l20「你用掌根碰上它颈侧，短毛底下轻轻一颤。」（青）" },
  e39_ch01_s09_l37: { who: ["wuze", "liqinghe"], beat: "关系", where: "ch01_s09_shuge.l37「她这回把整页推过来，遮住那四字，只露自己的正文。」（青）" },
  e39_ch01_s11_l17: { who: ["wuze", "wenqiao"], beat: "关系", where: "ch01_s11_shishe.l17「她一脚抵住门，腾出两手，和你抬过湿滑的门槛。」（青）" },
  e39_ch02_s04_l41: { who: ["wuze", "shenheng"], beat: "关系", where: "ch02_s04_shuge.l41「她取出一张窄笺，与待交的调卷回执并放。」（青）" },
  e39_ch02_s07_l22: { who: ["wuze", "peizhaoye"], beat: "关系", where: "ch02_s07_yuanye.l22「她松开托底的手。重量沉下来，你们一同挪到檐下。」（青）" },
  e39_ch02_s13_l39: { who: ["wuze", "shenheng"], beat: "关系", where: "ch02_s13_hanyuan.l39「众人转去核议抄。你把挡路的矮凳移开，留在她身旁。」（青）" },
  e39_ch02_s22_l54: { who: ["wuze", "wenqiao"], beat: "关系", where: "ch02_s22_shuge.l54「她抱起最后一摞纸，留下门边一人宽的空处。」（青）" },
  e39_ch02_s24_l40: { who: ["wuze", "liqinghe"], beat: "关系", where: "ch02_s24_shuge.l40「她移开袖边的稿，露出半张席，却没有径自坐下。」（青）" },
  e39_ch03_s02_l22: { who: ["wuze", "shenheng"], beat: "关系", where: "ch03_s02_shuge.l22「你伸手扶住歪倒的牌。她也伸了手，停在你指边，没有覆上来。」（青）" },
  e39_ch03_s04_l18: { who: ["wuze", "peizhaoye"], beat: "关系", where: "ch03_s04_yuanye.l18「你扶住行囊，让她空出两只手。那根刺落进泥里，比米粒长一点。」（青）" },
  e39_ch03_s05_l1: { who: ["wuze", "peizhaoye"], beat: "亲密", where: "ch03_s05_shishe.l1「裴抱住你，等你松手才退开。走到诗社时，衣襟还留着她袍上的皂香。」（青）" },
  e39_ch03_s05_l32: { who: ["wuze", "wenqiao"], beat: "关系", where: "ch03_s05_shishe.l32「她甩两下手。你用脚把靠窗的坐垫拨过来，挪到她那只旁边。」（青）" },
  e39_ch03_s06_l1: { who: ["wuze", "wenqiao"], beat: "关系", where: "ch03_s06_shuge.l1「昨夜你错入了一拍，温跟着错了半句。到第三遍，你们才一同收住尾音。」（青）" },
  e39_ch03_s09_l6: { who: ["wuze", "liqinghe"], beat: "关系", where: "ch03_s09_yuanye.l6「你替她拣去一片带刺的叶梗。她抬脚，袍角被你抽出来半寸。」（青）" },
  e39_ch03_s09a_l6: { who: ["wuze", "liqinghe"], beat: "关系", where: "ch03_s09a_yuanye.l6「她松开掌心，线圈压在手指上，没有再递过来。」（青）" },
  e39_ch03_s09b_l7: { who: ["wuze", "liqinghe"], beat: "关系", where: "ch03_s09b_yuanye.l7「她把松线放回袖里，站到石阶下。」（青）" },
  e39_ch03_s09c_l5: { who: ["wuze", "liqinghe"], beat: "关系", where: "ch03_s09c_yuanye.l5「你把稿拿回自己怀里。她捡起外袍垂下的一角，往另一边走了。」（青）" },
  liuchenghuan_1_guihuan_fei: { who: ["wuze", "liuchenghuan"], beat: "转变", where: "ch03_s15_yeting.l78「你看柳承欢空下来的腕侧，弯着的手指已离开你的掌心。」（绯）" },
  e39_ch03_s19_l30: { who: ["wuze", "wenqiao"], beat: "关系", where: "ch03_s19_shishe.l30「你替她撑开纸角，两人各捏一边，扇起一点风。」（青）" },
  e39_ch03_s19_l30_fei: { who: ["wuze", "wenqiao"], beat: "关系", where: "ch03_s19_shishe.l30「你替她撑开纸角，两人各捏一边，扇起一点风。」（绯）" },
  e39_ch03_s20_l7: { who: ["wuze", "liqinghe"], beat: "关系", where: "ch03_s20_yuanye.l7「你挑了一只小的，咬到果肉才发现皮厚。李把自己那只转向另一面。」（青）" },
  e39_ch03_s20_l7_fei: { who: ["wuze", "liqinghe"], beat: "关系", where: "ch03_s20_yuanye.l7「你挑了一只小的，咬到果肉才发现皮厚。李把自己那只转向另一面。」（绯）" },
  shenheng_3_zhibei_fei: { who: ["wuze", "shenheng"], beat: "亲密", where: "ch03_s17_shuge.l22「沈衡伸过手来。你用两只手拢住，低头贴了贴她的指背。」（绯）" },
  liqinghe_3_xiangying_fei: { who: ["wuze", "liqinghe"], beat: "亲密", where: "ch03_s20_yuanye.l21「你放下手里的果，凑过去。她迎上来，唇贴住你的唇。」（绯）" },
  e39_ch04_s05ca_l3: { who: ["wuze", "shenheng"], beat: "转变", where: "ch04_s05ca_shuge.l3「你接回没写字的纸，她把自己的笺叠好，没有替你收袖。」（青）" },
  e39_ch04_s05ca_l3_fei: { who: ["wuze", "shenheng"], beat: "转变", where: "ch04_s05ca_shuge.l3「你接回没写字的纸，她把自己的笺叠好，没有替你收袖。」（绯）" },
  e39_ch04_s05cb_l3: { who: ["wuze", "peizhaoye"], beat: "转变", where: "ch04_s05cb_yuanye.l3「她系好行囊，没再给你空出并排的一边。」（青）" },
  e39_ch04_s05cb_l3_fei: { who: ["wuze", "peizhaoye"], beat: "转变", where: "ch04_s05cb_yuanye.l3「她系好行囊，没再给你空出并排的一边。」（绯）" },
  e39_ch04_s05cc_l5: { who: ["wuze", "wenqiao"], beat: "转变", where: "ch04_s05cc_shishe.l5「你停住话。她卷起自己的谱纸，搁回筐里。」（青）" },
  e39_ch04_s05cc_l5_fei: { who: ["wuze", "wenqiao"], beat: "转变", where: "ch04_s05cc_shishe.l5「你停住话。她卷起自己的谱纸，搁回筐里。」（绯）" },
  e39_ch04_s05cd_l3: { who: ["wuze", "liqinghe"], beat: "转变", where: "ch04_s05cd_yuanye.l3「你点头，她把卷送到你手里，没有扣下一页。」（青）" },
  e39_ch04_s05cd_l3_fei: { who: ["wuze", "liqinghe"], beat: "转变", where: "ch04_s05cd_yuanye.l3「你点头，她把卷送到你手里，没有扣下一页。」（绯）" },
  e39_ch04_s05rl_l2: { who: ["wuze", "liqinghe"], beat: "亲密", where: "ch04_s05rl_yuanye.l2「李令仪将稿换到外侧，伸过手。你接住，没有拉她转身。」（青）" },
  e39_ch04_s05rl_l2_fei: { who: ["wuze", "liqinghe"], beat: "亲密", where: "ch04_s05rl_yuanye.l2「李令仪将稿换到外侧，伸过手。你接住，没有拉她转身。」（绯）" },
  e39_ch04_s05z_l31: { who: ["wuze", "shenheng"], beat: "关系", where: "ch04_s05z_yeting.l31 的基础名（E39 只给了绯版名；B46 定，没有青版图：主角是绯铺绯版，否则只读字）" },
  e39_ch04_s05z_l31_fei: { who: ["wuze", "shenheng"], beat: "关系", where: "ch04_s05z_yeting.l31「她偏过脸，没绷住。你陪她笑了一会儿，才把卷拿稳。」（绯）" },
  e39_ch04_s08z_l30: { who: ["wuze", "shenheng"], beat: "关系", where: "ch04_s08z_shuge.l30「她偏过脸，没绷住。你陪她笑了一会儿，才把卷拿稳。」（青）" },
  e39_ch04_s05z_l70: { who: ["wuze", "peizhaoye"], beat: "关系", where: "ch04_s05z_yeting.l70 的基础名（E39 只给了绯版名；B46 定，没有青版图：主角是绯铺绯版，否则只读字）" },
  e39_ch04_s05z_l70_fei: { who: ["wuze", "peizhaoye"], beat: "关系", where: "ch04_s05z_yeting.l70「你越想越笑，没说成。裴陪你坐了一会儿，才起身。」（绯）" },
  e39_ch04_s08z_l64: { who: ["wuze", "peizhaoye"], beat: "关系", where: "ch04_s08z_shuge.l64「你越想越笑，没说成。裴陪你坐了一会儿，才起身。」（青）" },
  e39_ch04_s05z_l100: { who: ["wuze", "wenqiao"], beat: "关系", where: "ch04_s05z_yeting.l100 的基础名（E39 只给了绯版名；B46 定，没有青版图：主角是绯铺绯版，否则只读字）" },
  e39_ch04_s05z_l100_fei: { who: ["wuze", "wenqiao"], beat: "关系", where: "ch04_s05z_yeting.l100「温荞从头哼起。你跟进去，又差半拍，她拖住尾音等你。」（绯）" },
  e39_ch04_s08z_l94: { who: ["wuze", "wenqiao"], beat: "关系", where: "ch04_s08z_shuge.l94「温荞从头哼起。你跟进去，又差半拍，她拖住尾音等你。」（青）" },
  e39_ch04_s05z_l139: { who: ["wuze", "liqinghe"], beat: "关系", where: "ch04_s05z_yeting.l139 的基础名（E39 只给了绯版名；B46 定，没有青版图：主角是绯铺绯版，否则只读字）" },
  e39_ch04_s05z_l139_fei: { who: ["wuze", "liqinghe"], beat: "关系", where: "ch04_s05z_yeting.l139「她把卷移到外侧，你们沿廊走了一小段，才松手各回。」（绯）" },
  e39_ch04_s09_l12: { who: ["wuze", "liqinghe"], beat: "关系", where: "ch04_s09_yuanye.l12「你在石阶下停住，她把卷放到另一侧。」（青）" },
  e39_ch04_s10_l22: { who: ["wuze", "liqinghe"], beat: "关系", where: "ch04_s10_yuanye.l22「你看她掰饼，袖口总往下滑，她索性挽起一折。」（青）" },
  wenqiao_3_tiejian_fei: { who: ["wuze", "wenqiao"], beat: "亲密", where: "ch03_s19_shishe.l31「温荞挨过来，你看她低头合拢纸角，肩头贴着你的肩。」（绯）" },
  e39_ch01_s00_l4: { who: [], beat: "风物", where: "ch01_s00_zhaoyang.l4「宫墙上沿积着薄霜，瓦沟里横着一片枯叶。」（无人）" },
  e39_ch01_s01_l38: { who: ["shenheng"], beat: "本行", where: "ch01_s01_zhaoyang.l38「帷幔外的甲煎气迟迟不散，沈衡把纸转向自己。」（同伴）" },
  e39_ch01_s11_l2: { who: [], beat: "风物", where: "ch01_s11_shishe.l2「雨忽然砸在檐口，晾纸绳一抖，水沿着纸角往下淌。」（无人）" },
  e39_ch01_s11_l34: { who: [], beat: "风物", where: "ch01_s11_shishe.l34「收卷篮满了，旁边又添一只，雨水滴在空篮沿上。」（无人）" },
  e39_ch01_s11_l73: { who: ["wuze", "wenqiao"], beat: "本行", where: "ch01_s11_shishe.l73「檐外雨声薄下去，你们把湿纸挪到风能吹到的一层。」（青）" },
  e39_ch01_s12_l16: { who: ["tangjian"], beat: "本行", where: "ch01_s12_shuge.l16「檐水一滴一滴敲着石阶，封递用的油布已铺在唐简膝上。」（同伴）" },
  e39_ch01_s13_l2: { who: [], beat: "风物", where: "ch01_s13_shuge.l2「檐下反光亮到书阁卷架半腰，两杯茶搁凉了，一点热气也没有。」（无人）" },
  e39_ch01_s16_l2: { who: ["liqinghe"], beat: "风物", where: "ch01_s16_yuanye.l2「苑墙上还留着半截日光，公主捡起一片卷边叶，站到影子外。」（同伴）" },
  e39_ch01_s17_l2: { who: ["songhuizhen"], beat: "本行", where: "ch01_s17_yeting.l2「天又落起细雨，宋蕙贞把半扇窗关上，留下案边一点亮光。」（同伴）" },
  e39_ch01_s17_l28: { who: [], beat: "风物", where: "ch01_s17_yeting.l28「雨点从窗隙打进来，抄件一角慢慢洇湿。」（无人）" },
  e39_ch01_s18_l27: { who: [], beat: "风物", where: "ch01_s18_zhaoyang.l27「昭阳殿檐口还在滴雨，缺耳尖的马等着回厩，鼻息吹动湿鬃。」（无人）" },
  e39_ch01_s18_l50: { who: [], beat: "风物", where: "ch01_s18_zhaoyang.l50「门槛外的日光只剩窄窄一条，照着石面上的旧车辙。」（无人）" },
  e39_ch02_s05_l2: { who: [], beat: "风物", where: "ch02_s05_yeting.l2「帘下漏进一小块日光，正照着帕子翘起的角。」（无人）" },
  e39_ch02_s11_l3: { who: ["hetaihou"], beat: "本行", where: "ch02_s11_hanyuan.l3「何太后冠上横梁掠过灯影，大袖垂在案侧，一只手扶着案沿。」（同伴）" },
  e39_ch02_s17_l30: { who: ["wenqiao"], beat: "风物", where: "ch02_s17_shishe.l30「温荞放下抬着的手，仍让窗影留在袖上。」（同伴）" },
  e39_ch02_s24_l39: { who: [], beat: "风物", where: "ch02_s24_shuge.l39「窗纸下沿开了一道细口，风翻起案边一角素笺。」（无人）" },
  e39_ch03_s10_l25: { who: ["wuze", "xujinghe"], beat: "风物", where: "ch03_s10_nvguan.l25「许把碟子移远一些。你收回抵在门槛上的脚，灯影空出一小块。」（青）" },
  e39_ch03_s17_l2: { who: ["wuze", "shenheng"], beat: "风物", where: "ch03_s17_shuge.l2「檐下一片瓦往外翘，雨从两边落。沈把凳子挪开，凳脚在地上留了两个湿印。」（青）" },
  e39_ch03_s17_l2_fei: { who: ["wuze", "shenheng"], beat: "风物", where: "ch03_s17_shuge.l2「檐下一片瓦往外翘，雨从两边落。沈把凳子挪开，凳脚在地上留了两个湿印。」（绯）" },
  e39_ch03_s17_l30: { who: ["wuze", "shenheng"], beat: "亲密", where: "ch03_s17_shuge.l30「檐水接成了线。你们的手搁在膝间，等雨小下来才分开。」（青）" },
  e39_ch03_s17_l30_fei: { who: ["wuze", "shenheng"], beat: "亲密", where: "ch03_s17_shuge.l30「檐水接成了线。你们的手搁在膝间，等雨小下来才分开。」（绯）" },
  e39_ch03_s18_l2: { who: ["wuze", "peizhaoye"], beat: "风物", where: "ch03_s18_yuanye.l2「苑中树影盖住半条长凳。裴坐一头，你坐一头，中间落了两枚干果壳。」（青）" },
  e39_ch03_s18_l2_fei: { who: ["wuze", "peizhaoye"], beat: "风物", where: "ch03_s18_yuanye.l2「苑中树影盖住半条长凳。裴坐一头，你坐一头，中间落了两枚干果壳。」（绯）" },
  e39_ch03_s24_l39: { who: [], beat: "风物", where: "ch03_s24_shuge.l39「案脚一片薄木垫在砖缝上，暮光停在翘起的那一端。」（无人）" },
  e39_ch04_s02_l40: { who: [], beat: "风物", where: "ch04_s02_hanyuan.l40「帷幔下摆离地半寸，光从底下穿过，落在空着的砖面上。」（无人）" },
  e39_ch04_s04_l2: { who: [], beat: "风物", where: "ch04_s04_zhaoyang.l2「次日帷幔已卷起，殿内残留熏香，门口的冷风吹不到案后。」（无人）" },
  e39_ch04_s06_l2: { who: [], beat: "风物", where: "ch04_s06_zhaoyang.l2「昭阳殿夜里只点一盏灯，灯油的气味留在垂下的帷幔内。」（无人）" },
  e39_ch04_s12_l2: { who: ["wuze"], beat: "风物", where: "ch04_s12_nvguan.l2「午后日光越过门槛，屋里坐席没有铺满；新裁的纸边碰着你的腕。」（青）" },
  e39_ch04_s15_l2: { who: ["wuze"], beat: "风物", where: "ch04_s15_yilu.l2「天亮时驿路泥还湿，车辙压出细水，轮边的泥点溅到你的靴面。」（出行青）" },
  e39_ch04_s17_l5: { who: [], beat: "风物", where: "ch04_s17_nvguan.l5「一个多月后，女观窗下晒着新洗的布，冷风带进院中煎药的气味。」（无人）" },
  e39_ch01_s05_l2: { who: [], beat: "风物", where: "ch01_s05_yuanye.l2「苑墙挡住了北风，落叶晒出干草味，阿荻在树下仰着脸。」（无人）" },
  e39_ch01_s09_l2: { who: [], beat: "风物", where: "ch01_s09_shuge.l2「移到侧室，帘影把泥金书签遮成一条暗线。」（无人）" },
  e39_ch02_s03_l2: { who: ["wuze"], beat: "风物", where: "ch02_s03_nvguan.l2「晨风把晾毯吹得贴上柱子。你伸手扯开。」（青）" },
  e39_ch03_s12_l66: { who: [], beat: "风物", where: "ch03_s12_hanyuan.l66「午光穿过殿门，照到那块垫案脚的薄木片。案上的水碗仍旧放得平。」（无人）" },
  e39_ch03_s19_l8: { who: [], beat: "风物", where: "ch03_s19_shishe.l8「温挪到另一边，把半扇窗又推开一些。窗外的晾布鼓起，风没进来。」（无人）" },
  e39_ch04_s07_l2: { who: [], beat: "风物", where: "ch04_s07_hanyuan.l2「早朝的风吹过龙尾道，殿门外两份荐牒用同一块石压着。」（无人）" },
  e39_ch04_s11_l2: { who: [], beat: "风物", where: "ch04_s11_nvguan.l2「次日，女观窗下晾着药筛，晒干的草叶气味混进纸里。」（无人）" },
  e39_ch04_s18_l2: { who: [], beat: "风物", where: "ch04_s18_wuzibei.l2「夜里石旁没有印，灯照着一张空的碑样纸，纸角被风吹得贴上石面。」（无人）" },
  e39_ch03_s23_l4: { who: ["liuchenghuan"], beat: "风物", where: "ch03_s23_yeting.l4「光落到鞋尖上，缺了一角。她转过脚踝，又转回去。」（同伴）" },

  // D-160：八个结局各一张，结局卡第一拍。名字按 ending_<结局 key>，CC3 定了别的名字改这里一处就行。
  // 画面含义照 C-B 结局树（D-159「别自己发明结局的含义」），where 只抄 endings.json 的主题句，人由 CC3 按提示词改
  ending_mandianwusheng:  { who: ["wuze"],             beat: "结局", ending: "mandianwusheng",  where: "满殿无声（gold）。她跨过了血缘的门槛，却把别人的异议关在门外" },
  ending_wuzibei:         { who: ["wuze"],             beat: "结局", ending: "wuzibei", seal: { x: 49, y: 72 }, where: "无字之碑（ink）。碑上不许有字，印不画进图里，引擎按 seal 叠（D-067）" },
  ending_weijingzhizhao:  { who: ["wuze"],             beat: "结局", ending: "weijingzhizhao",  where: "未竟之诏（ink）。非宗室皇帝已经出现，改革仍须经办" },
  ending_liangxizhijian:  { who: ["liqinghe", "wuze"], beat: "结局", ending: "liangxizhijian", focus: { x: 62, y: 50 }, where: "两席之间（ink）。李令仪赢了，主角没有赢；落选者不消失" },
  ending_kaimenshouzi:    { who: ["wuze"],             beat: "结局", ending: "kaimenshouzi",    where: "开门授字（ink）。不登基，让更多人有可用的本领与去处" },
  ending_bushou:          { who: ["wuze"],             beat: "结局", ending: "bushou",          where: "不受（ink）。赢得了受位资格，又选择不要" },
  ending_guanshanyouxin:  { who: ["peizhaoye", "wuze"], beat: "结局", ending: "guanshanyouxin", sfx: "horse_bell", where: "关山有信（ink）。在地方把事情办下去，与裴照夜各有职分" },
  ending_zhishangyouming: { who: ["wuze"],             beat: "结局", ending: "zhishangyouming", where: "纸上有名（ink）。没有取得权位，人生仍不只剩失败" },
};

/** 身份变体的后缀（D-216）：和立绘 `_fei` 同一个词 */
export const CG_FEI_SUFFIX = "_fei";

/** 这一行是不是另一行的绯版（后缀 `_fei`，去掉后缀那一行在表里） */
export function isFeiVariant(key: string): boolean {
  return key.endsWith(CG_FEI_SUFFIX) && !!CGS[key.slice(0, -CG_FEI_SUFFIX.length)];
}

/**
 * 剧本图格写的是 `key`，这一刻实际铺哪一张（D-216，B42）。和立绘同一个规则（`engine/identity.ts`）：
 * **主角此刻是绯、表里有 `<key>_fei`、那张图在** → 用绯版；缺一样就是原图，不空、不跳过。
 * `hasImage` 由调用方给（构建期扫出来的清单），这里不碰文件
 */
export function cgFor(key: string, rank: "qing" | "fei", hasImage: (k: string) => boolean): string {
  const fei = key + CG_FEI_SUFFIX;
  return rank === "fei" && CGS[fei] && hasImage(fei) ? fei : key;
}

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
