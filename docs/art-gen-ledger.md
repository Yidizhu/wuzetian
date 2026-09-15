# 生图验收账本

## CC3 · E25 验收：盘上 16 张 CG

> 判定人 CC3。**过 6 张、退 5 张、5 张 v1 被 v2 取代不验。** 过的 5 张已 `art:post -- cg` 出到 `public/cg/` 并提交（`2ada7b7`）；无字之碑过了但**先不出图**：`check:art` 规定无字之碑有图就必须有 `seal`，`cgs.ts` 这一轮归 CC1，坐标写在 `docs/art-cc3-e25.md`，CC1 填完再出。
> 脸：遮发并排配定妆图 `Claude outputs/art-post/e25-faces-zhujiao.png`、`e25-faces-2.png`、`e25-faces-3.png`、`e25-faces-4.png`。字：纸面、卷面、碑面逐张放大看。

| 原件 | 结论 | 理由 |
|---|---|---|
| liqinghe_2_diye_v1 | **过，已上线** | 两张脸各配得上、分得开；四只手逐只认得出，素帕露在主角袖口，叶子在两人手之间没碰到；地面、苑墙、灰瓦都对。记：李令仪夹着落叶的左手在手机那一条外面（事在正中，不挡）；视线看主角的手不是袖口 |
| shenheng_4_bingzuo_v1 | **退** | 卷面满是像字的小墨痕（提示词写明卷上无字）；沈衡左手从案下右边缘露出来，写明只许三只手；沈衡袍子上笔触结成迷彩块（第十一节新加的禁止）。脸都配得上 |
| wenqiao_1_cangzhi_v1 | **退** | **主角的脸画成了温荞那样的圆脸、红脸蛋、大笑**，两张脸并排像姐妹（双人硬否决「两张脸分得开」）。温荞的脸、偷睁一只眼、背手藏纸都对 |
| ending_wuzibei_v1 | **过（等 seal 再出图）** | 碑面放大看是斑驳石纹，没有像字的刻痕；没有一点红；三块石头压角、右下角翻起；纸心平整（亮度标准差 4.8）。印位见 E25 报告 |
| ending_weijingzhizhao_v1 | **退** | 摊开的文书上画了格子，卷起来那一截上有像字的方块笔画（结局图无字硬门槛）。另外帔帛没解、袖口没挽、身后书架上是线装书。脸配得上绯 v1 |
| ending_liangxizhijian_v1 | **过，已上线** | 两张脸各配得上；主角指纸、李令仪拿饼笑、紫礼衣挂在衣架上，都说得出；纸只有一道边框，卷子外面空白；两人一样高。记：胡饼画成了圆的芝麻面包；主角另一只手被案挡住（写的是放在膝上，看不见也不算错） |
| ending_mandianwusheng_v1 | 被 v2 取代 | 不验 |
| ending_mandianwusheng_v2 | **退** | 赭黄对了，但主角身后是带雕花靠背的座、殿里一排排带靠背的座具（v1 就有）；奏牍画成线装书；地砖反光像镜子；沈衡的背影出了手机那一条 |
| ending_kaimenshouzi_v1 | 被 v2 取代 | 不验 |
| ending_kaimenshouzi_v2 | **退** | 阿荻纸上两道交叉墨线像一个「十」字（结局图无字硬门槛）。装束对了（褐布衣、无帔帛），脸都配得上，四只手对；主角的单髻梳在头顶，不是低髻 |
| ending_bushou_v1 | 被 v2 取代 | 不验 |
| ending_bushou_v2 | **过，已上线** | 褐布衣、木簪、无帔帛，两手捧一张芝麻胡饼，蓝包袱，卖饼人只露手臂，远处宫墙灰瓦鸱尾。记：髻不够低；腰带结有一个圈，像半个蝴蝶结；袖口偏宽；远处街上有几个很小的行人（不是围观） |
| ending_zhishangyouming_v1 | 被 v2 取代 | 不验 |
| ending_zhishangyouming_v2 | **过，已上线** | 褐布衣、木簪，翻起的纸两面空白，窗外挑纸卷的小贩，缺口茶碗。记：髻不够低；光偏暖，不是清早的冷光 |
| ending_guanshanyouxin_v1 | 被 v2 取代 | 不验 |
| ending_guanshanyouxin_v2 | **过，已上线** | 行装齐：青袍、头巾、革带算袋、行縢、短靴，帷帽挂在行囊上；裴照夜右手拿空信封看路；两条路、坏扫帚树都在；信纸和信封放大看空白。记：主角的领子画成了交领（写的是圆领）；远处运粮车前有拉车的牲口（很小） |

## C33 · E24 改装束五张 v2 统一交验

> 内置图像生成，非代码绘制。依据 C33 只出改装束五张 v2；未另出受位／拒位，也未重出其余结局。E24 报告明确的五张装束修改已采用，但该报告没有补齐十一张逐张验收结论，本轮不代填结论。
> 五张 PNG 已保存并读取文件头核对，均1024×1536；v1 保留，未后处理、未接入引擎。[实际提示词](art-c33-prompts.md)保留原文和附件顺序，参考图只管脸及身材；不附退回 CG v1。
> 初审仍有装束细节、座具及纸面笔画问题。合规门槛未过／未核完，不以艺术分数替代验收；待 CC3 统一定案。

| 原件 | 初审记录 | 状态 |
|---|---|---|
| [ending_mandianwusheng_v2.png](../assets/cg/ending_mandianwusheng_v2.png) | 赭黄已替代绯，仍双环无冠；主角身后靠背、远处座具仍存在，未解决坐席形制问题；地面反光偏亮。 | 已落盘，待 CC3 验收 |
| [ending_kaimenshouzi_v2.png](../assets/cg/ending_kaimenshouzi_v2.png) | 主角褐布衣、无帔帛，阿荻换浅麻夹袄；主角单髻仍偏高；纸上出现交叉笔画，触及无字硬门槛，须退回核对。 | 已落盘，待 CC3 验收 |
| [ending_bushou_v2.png](../assets/cg/ending_bushou_v2.png) | 茶褐布衣、单髻木簪、无帔帛；袖口偏宽、腰结像蝴蝶结；背景新增行人，非仅卖饼人手臂，须验。 | 已落盘，待 CC3 验收 |
| [ending_zhishangyouming_v2.png](../assets/cg/ending_zhishangyouming_v2.png) | 褐布衣、无帔帛、单髻木簪与翻空白纸齐；髻位置偏高；晨光偏暖，身份一致性待遮发比脸。 | 已落盘，待 CC3 验收 |
| [ending_guanshanyouxin_v2.png](../assets/cg/ending_guanshanyouxin_v2.png) | 头巾、革带算袋、裹腿短靴、摘下帷帽行囊齐；衣领仍读成交领而非要求圆领，袍摆较长；远处牲畜与禁马要求待验。 | 已落盘，待 CC3 验收 |


## E23 · 八张结局图原件统一交验（2026-09-15）

> 八张均已用内置图像生成工具生成并保存到 `assets/cg/`，不是代码绘制；逐份读取 PNG 文件头确认 1024×1536。仅新增 v1，不覆盖已有 CG，不接入引擎。
> 按 `ai-prompt.md` 第十二节八个完整代码块及指定已验收参考生成，只有满殿无声为 gold，其余 ink；[实际提示词快照](art-ending-generation-prompts.md)含附件顺序和唯一追加的尺寸请求。
> **待 CC3 验收，不宣称通过或上线**。初看各张动作与场所不同；正式遮标题八张并排、定妆遮发配脸、无字硬门槛及移动端裁切仍须验。形制／纸纹等合规问题未解决前不以 art-director 分数代替合规结论。

| 原件 | 结局 | 初看记录（非验收结论） | 状态 |
|---|---|---|---|
| [ending_mandianwusheng_v1.png](../assets/cg/ending_mandianwusheng_v1.png) | 满殿无声 | 冷光、整齐文书与沈衡离殿背影可读；空席被画成成排带靠背座具，主角身后也有靠背，形制须严格验；地面反光偏强。 | 待 CC3 统一验收 |
| [ending_wuzibei_v1.png](../assets/cg/ending_wuzibei_v1.png) | 无字之碑 | 无可见红色与文字，三石压角、右下纸角翻起；碑身斑驳纹理偏多，是否触及像字刻痕禁项待放大。纸偏大、中心低于提示词位置。目测纸外框约x110–890/y950–1300，平纸心候选矩形x330–650/y1020–1160；仅估计，须CC3实测及合屏后给CC1。 | 待 CC3 统一验收 |
| [ending_weijingzhizhao_v1.png](../assets/cg/ending_weijingzhizhao_v1.png) | 未竟之诏 | 算筹、暖灯、杂乱文书与大殿图区别明确；卷面有网格／笔画状纹理，须按无字硬门槛核对；帔帛仍搭前臂、未按要求解下。 | 待 CC3 统一验收 |
| [ending_liangxizhijian_v1.png](../assets/cg/ending_liangxizhijian_v1.png) | 两席之间 | 指纸争论、李令仪拿饼笑、紫礼衣挂在后方可读；胡饼读成圆面包，主角另一手遮挡，纸面边框与厚涂块状纹理待验。 | 待 CC3 统一验收 |
| [ending_kaimenshouzi_v1.png](../assets/cg/ending_kaimenshouzi_v1.png) | 开门授字 | 主角抬指停住、阿荻独立执笔、开门雪景和两名背影齐；纸上横线除指定划线外是否构成假字需严验；主角帔帛仍搭臂。 | 待 CC3 统一验收 |
| [ending_bushou_v1.png](../assets/cg/ending_bushou_v1.png) | 不受 | 主角捧单饼、蓝包袱、街边台阶可读；卖饼人的手在右上边缘会受竖屏裁切，主角面部与青v5需遮发比对；饼摊纸面无文字。 | 待 CC3 统一验收 |
| [ending_guanshanyouxin_v1.png](../assets/cg/ending_guanshanyouxin_v1.png) | 关山有信 | 读信笑与裴照夜看路、岔路车队可读；信封落在裴左手而非提示词右手，主角行囊被画得像皮箱；远处车畜与无马要求待验。 | 待 CC3 统一验收 |
| [ending_zhishangyouming_v1.png](../assets/cg/ending_zhishangyouming_v1.png) | 纸上有名 | 翻纸与临街晨光、楼下挑担可读；纸背空白，主角脸在侧转后的一致性需对照；冷晨光偏暖，和未竟之诏在动作／衣色上可区分。 | 待 CC3 统一验收 |


## C32 · 递叶、并坐、藏纸笑三张交验

> 2026-09-15：内置图像生成，非代码绘制。使用 `ai-prompt.md` 第十节三张最新竖幅完整代码块原文，仅追加单张 1024×1536 PNG 请求。参考图依序为李令仪郁金 v1／沈衡 v2／温荞 v1，各附主角青 v5，均有 E18／E22 验收依据。三份 PNG 文件头已核对，旧图未覆盖。未后处理、未接入；本轮停在三张，结局图留下一批。
> 初审问题如下，待 CC3 统一验收；合规未通过／未完成身份核对前不作通过评分。

| 原件 | 初审记录 | 状态 |
|---|---|---|
| [liqinghe_2_diye_v1.png](../assets/cg/liqinghe_2_diye_v1.png) | 四只手可见，接叶指尖尚未碰到；李令仪左手贴右边界，越过15%安全边；视线偏向主角脸而非袖口。初审裁切未过，待CC3定案。 | 原件已落盘，待 CC3 验收 |
| [shenheng_4_bingzuo_v1.png](../assets/cg/shenheng_4_bingzuo_v1.png) | 主角扶凳、沈衡护卷和互看可读；卷面出现字迹状纹理，沈衡左手在案下右边缘露出，违反空白卷和仅三只可见手要求。初审未过。 | 原件已落盘，待 CC3 验收 |
| [wenqiao_1_cangzhi_v1.png](../assets/cg/wenqiao_1_cangzhi_v1.png) | 偷睁一眼、温荞笑着背手藏纸、主角双手放膝均已出现；纸角靠右边，地面反光偏强、衣料块状笔触待验；须与定妆遮发并排核对双脸。 | 原件已落盘，待 CC3 验收 |


## CC3 · E22 验收：第二批十四张 ＋ 四张 CG

> 判定人 CC3。立绘、背景已出到 `public/`，CG 已出到 `public/cg/`；**都还没进版本库**（D-130，`check:art` 现在因此报 24 项，全是这一类）。原件不进库。
> 立绘的脸：同尺遮发并排两排（`Claude outputs/art-post/e22-faces-1.png`、`-2.png`），十三张分得开；CG 的脸和定妆图并排（`e22-cg-faces-1.png`、`-2.png`）。

### 立绘十张（全过）

| 原件 | 结论 | 记一笔（不挡） |
|---|---|---|
| wuze_tianzi_fei_default_v1 | 过 | 脸和青衣 v5 是同一张，眼尾那一笔挑线 v5 本来就有，不是这张新添的；头顶透光 33×61、32×61，过 1a |
| liqinghe_gongzhu_zi_default_v1 | 过 | 和郁金 v1 同一张脸 |
| shenheng_siji_shenlv_default_v2 | 过 | 长、窄、冷白，和主角分开了；略有偶像感，在门槛内 |
| peizhaoye_nvjiang_yanzhifei_default_v2 | 过 | 胭脂绯偏砖红，和主角绯同色相（3° 对 2°），明度低一档，站一起分得开 |
| wenqiao_shiren_xiang_default_v1 | 过（绿幕） | **缃偏浓**：袍子亮面中值 #E9C376（饱和 0.49）、暗面 #B88C47，规格 #DCC98E（0.35）；色相和李令仪郁金一样（37°–40°），但郁金饱和 0.80，站一起还分得开。下一版颜色往浅、往灰拉 |
| hetaihou_taihou_shenqing_default_v1 | 过 | — |
| xujinghe_nvguan_yuebai_default_v2 | 过（绿幕） | E22 加了绿幕抠底模式后缝里的绿干净了 |
| tangjian_dianji_qianlv_default_v2 | 过 | 身体正面、书不大，低头看书但脸看得见 |
| adi_gongren_ma_default_v2 | 过（灰底） | — |
| liuchenghuan_gongren_huiqing_default_v1 | 过（绿幕） | — |

### 背景四张（全过）

| 原件 | 结论 | 记一笔 |
|---|---|---|
| zhaoyang_ink_yedeng_v1 | 过 | 真夜景，要 CC1 给 `paintedNight` |
| hanyuan_gold_v1 | 过 | — |
| wuzibei_ink_beiyang_v1 | 过 | 真夜景，要 `paintedNight`；碑面和白天那张同位（量了：碑身 x 约 640–880、碑顶 y 约 80，差不到 10 像素），结局卡叠印坐标共用 |
| yilu_ink_yipang_v1 | 过 | 路边那只靴子是布置表写的（四章 16「裴蹲着倒出鞋里的细砂」），不是杂质 |

### CG 六张原件

| 原件 | 结论 | 理由 |
|---|---|---|
| adi_1_buxiu_v1 | **不用** | 横图，两张脸左右跨 545–1130，手机那一条（473 宽）装不下两个人——正是 D-150 说的废法 |
| **adi_1_buxiu_v2** | **过** | 两张脸配得上各自定妆图、彼此分得开；看得见三只手（主角一只搁案上，另一只在案下；阿荻两只捏袖、拿针），逐只认得出；同一地面高度，不是伺候；说得出「她在给她补袖口」。记：衣服上笔触结块像迷彩；针背贴腕没画出来 |
| peizhaoye_1_xunma_v1 | 不用 | 桶还倒着（剧本是她先扶起桶） |
| **peizhaoye_1_xunma_v2** | **过** | 桶扶正；脸和 v2 定妆同一张，没有男性化；手按马额而不是握辔头、另一只手被挡——安抚还看得出，不退。**焦点 x 45、y 30**（脸 520–660、马头 760–960 都在手机那一条 478–951 里），CC3 填进 `cgs.ts`。记：远景屋顶画成了故宫黄瓦；鬃不是三花 |
| **peizhaoye_3_woshou_v1** | **过** | 参照物（裴 v2、主角 v5）本轮验过，这张依赖的东西成立。脸都配得上；看得见三只手，握着的两只一上一下认得出，裴的右手按衣带；衣带没画成捆绑；说得出「她们握着手」，没有性内容。记：远景黄琉璃瓦红墙（故宫样子）；裴的脸比定妆老几岁 |
| **wenqiao_1_chaozhi_v1** | **过** | 脸配得上温荞 v1（圆脸、颊红、高髻竹簪）；两只手都在帘框上；纸坊是剧本里的（C-8、C-11）。记：右手擦着手机框边 |

## C31 · 四种类型 CG 一次交验

> 四张均为内置图像生成，原件已落盘；驯马 1536×1024 横图，其余 1024×1536 竖图，PNG 文件头已核对。仅此四张，旧版保留，未后处理、未接引擎。
> 按指挥日志 D-150 / D-151 / C31 的明确清单执行，未采用 E21 报告里的另一组四张。[实际提示词与改动依据](art-c31-prompts.md)已单独留档：温荞抄纸是按既定工坊／人物设定补写，不冒称 CC3 原文。三张竖图移除旧横图中央三分之一约束。正式验收依旧交 CC3；初审发现动作差异及身份待核问题，未通过合规门槛，不以美术分数代替验收。

| 原件 | 类型 | 初审记录 | 状态 |
|---|---|---|---|
| [peizhaoye_1_xunma_v2.png](../assets/cg/peizhaoye_1_xunma_v2.png) | 单人横·驯马 | 木桶扶正；手仍按马额而非握近嘴辔头，另一手遮挡，动作不符。建议焦点约(0.48,0.28)，仅供 CC3/CC1 试裁，不是已接入参数。 | 待 CC3 统一验收 |
| [adi_1_buxiu_v2.png](../assets/cg/adi_1_buxiu_v2.png) | 双人竖·补袖 | 竖图保住双脸与针线；主角未用手可被案遮挡，实际补的是左袖，针背贴腕未表现；动作左右和手数量须验。 | 待 CC3 统一验收 |
| [wenqiao_1_chaozhi_v1.png](../assets/cg/wenqiao_1_chaozhi_v1.png) | 单人竖·抄纸 | 单人提竹帘、湿纸浆滴水可读，两手都握框；温荞脸较定妆显瘦，须遮发对照，不先判同一人。 | 待 CC3 统一验收 |
| [peizhaoye_3_woshou_v1.png](../assets/cg/peizhaoye_3_woshou_v1.png) | 双人竖·亲密 | 握手可读，主角看裴、裴看手；实际左右手与提示词相反，主角未用手被遮挡；未体现双蹲，身高差与手指归属待验。 | 待 CC3 统一验收 |


## C30 · 两张 CG 原件交验（E19 提示词）

> 内置图像生成，非代码绘制。采用 `ai-prompt.md` 第九节两张完整代码块，追加单张 1536×1024 PNG 及实际附件版本说明；已逐份核对 PNG 尺寸。参考版本依据指挥日志 E20 对第二批脸的并排确认（账本 C29 旧登记仍写待验，未擅改）。仅出两张原件，未接入引擎，旧图未覆盖。
> 初审发现构图／动作未过门槛，按 art-director「先过合规、后评分」暂不打分；两张统一交 CC3 定案，不宣称通过。

| 原件 | 定妆参考 | 初审问题 | 状态 |
|---|---|---|---|
| [peizhaoye_1_xunma_v1.png](../assets/cg/peizhaoye_1_xunma_v1.png) | 裴照夜 v2 | 安抚马的动作可读；可见手按在马额，未按提示词握近嘴辔头，另一手遮挡；木桶仍倒着，三花鬃未明确呈现。脸的一致性及手臂归属待 CC3 核对 | 已落盘，待统一验收；初审未过动作要求 |
| [adi_1_buxiu_v1.png](../assets/cg/adi_1_buxiu_v1.png) | 阿荻 v2 + 主角青 v5（附件顺序） | 四只手可辨、两人都看针线；主角被补的是画面右侧手臂，左右手安排与提示词相反；阿荻脸右缘越出中央三分之一，主角脸左缘也贴近／越界。针背动作、同席等高及两人脸与定妆的一致性待严验 | 已落盘，待统一验收；初审未过中央裁切要求 |


## C29 · E18 第二批十四张统一交验

> **默认未生效**：十四张 PNG 原件已全部落盘，待 CC3 统一验收、后处理，再由 CC1 接入。本轮为内置图像生成，非代码绘制。
> 使用 `.claude/skills/art-style/references/ai-prompt.md` 第八节十四个完整提示词代码块，仅追加单张 PNG 尺寸请求。十套立绘 1024×1536、四张背景 1536×1024，逐份读取 PNG 文件头核对；旧图未覆盖。
> 换脸五人不附 v1；两套换装附本人定妆图，三个同地点背景附指定基础图。脸部初看已按脸型、眉眼、年龄、肤色分别记录；尚未完成遮发同尺全员并排验收，不以初看替代门槛三。遵照 C29「出完照旧一次交验」及 E18「Codex 出图 → CC3 验」，此处不代 CC3 宣布过关或评分。

| # | 原件 | 参考图 | 初看记录（非验收结论） | 状态 |
|---|---|---|---|---|
| 1 | [wenqiao_shiren_xiang_default_v1.png](../assets/portraits/wenqiao_shiren_xiang_default_v1.png) | 无 | 小圆脸、短下巴、嘴角微扬与侧瞥；与柳承欢同属圆脸，需遮发并排检验 | 待 CC3 验收 |
| 2 | [hetaihou_taihou_shenqing_default_v1.png](../assets/portraits/hetaihou_taihou_shenqing_default_v1.png) | 无 | 长方脸、宽下颌、下垂眼皮与年龄纹理明显；年龄与恶太后刻板感待验 | 待 CC3 验收 |
| 3 | [liuchenghuan_gongren_huiqing_default_v1.png](../assets/portraits/liuchenghuan_gongren_huiqing_default_v1.png) | 无 | 短圆脸、大眼向上、微张嘴；与温荞／主角的裸脸差异待验 | 待 CC3 验收 |
| 4 | [wuze_tianzi_fei_default_v1.png](../assets/portraits/wuze_tianzi_fei_default_v1.png) | wuze_cairen_qing_default_v5.png | 附青衣 v5 保持身份；双环透底，眼线、帔帛宽度和垂带仍需重点验 | 待 CC3 验收 |
| 5 | [liqinghe_gongzhu_zi_default_v1.png](../assets/portraits/liqinghe_gongzhu_zi_default_v1.png) | liqinghe_gongzhu_yujin_default_v1.png | 附郁金 v1 保持身份；紫色大袖与小冠；同一人一致性待验 | 待 CC3 验收 |
| 6 | [adi_gongren_ma_default_v2.png](../assets/portraits/adi_gongren_ma_default_v2.png) | 无 | 偏深肤色、瘦小脸、较高颧骨、警觉侧视；软布针包已出现 | 待 CC3 验收 |
| 7 | [tangjian_dianji_qianlv_default_v2.png](../assets/portraits/tangjian_dianji_qianlv_default_v2.png) | 无 | 方脸、宽颌、雀斑与皱眉；簿子仍偏大、目光下垂，正对姿态待验 | 待 CC3 验收 |
| 8 | [xujinghe_nvguan_yuebai_default_v2.png](../assets/portraits/xujinghe_nvguan_yuebai_default_v2.png) | 无 | 窄长脸、高额、淡眉、冷白无红晕；绿幕底，后处理险边待验 | 待 CC3 验收 |
| 9 | [shenheng_siji_shenlv_default_v2.png](../assets/portraits/shenheng_siji_shenlv_default_v2.png) | 无 | 清瘦长脸、半垂厚眼皮、墨绿；鼻眼现代感与主角相似度待严格验 | 待 CC3 验收 |
| 10 | [peizhaoye_nvjiang_yanzhifei_default_v2.png](../assets/portraits/peizhaoye_nvjiang_yanzhifei_default_v2.png) | 无 | 较宽脸、自然粗眉、较暖肤色和平视；年龄、女性感及暖绯待验 | 待 CC3 验收 |
| 11 | [zhaoyang_ink_yedeng_v1.png](../assets/scenes/zhaoyang_ink_yedeng_v1.png) | zhaoyang_gold_v1.png | 真夜景、红毯已去、单灯与左侧月光；灯是否处于案角待验 | 待 CC3 验收 |
| 12 | [hanyuan_gold_v1.png](../assets/scenes/hanyuan_gold_v1.png) | hanyuan_gold_gongyi_v1.png | 公议构图改为空殿；蓝帷与暖柱，地面反光偏亮待验 | 待 CC3 验收 |
| 13 | [wuzibei_ink_beiyang_v1.png](../assets/scenes/wuzibei_ink_beiyang_v1.png) | wuzibei_ink_v1.png | 真夜景，空白碑面、碑样纸与风灯；碑面坐标须重测，不能认定与白天完全一致 | 待 CC3 验收 |
| 14 | [yilu_ink_yipang_v1.png](../assets/scenes/yilu_ink_yipang_v1.png) | 无 | 午后横光、空匾、石旁单靴、远车；靴的现代形制倾向待验 | 待 CC3 验收 |


## C27 · E17 十三张统一交验

> **默认未生效**：十三张仅保存为本地 PNG 原件。CC3 验收及后处理后，由 CC1 接入；本轮不宣称已通过或上线。
> 全部使用内置图像生成工具，非代码绘制。提示词为 `.claude/skills/art-style/references/ai-prompt.md` 第七节各完整代码块原文，仅追加单张 PNG 尺寸请求。五套立绘 1024×1536、八张背景 1536×1024，已逐份读取 PNG 文件头核对。十三张齐后统一交验；旧图未覆盖。

| # | 原件 | 参考图 | 初看记录（非验收结论） | 状态 |
|---|---|---|---|---|
| 1 | [adi_gongren_ma_default_v1.png](../assets/portraits/adi_gongren_ma_default_v1.png) | 无 | 中灰底；围裳长度、针包和布带形制待验 | 待 CC3 验收 |
| 2 | [songhuizhen_cairen_zhe_default_v1.png](../assets/portraits/songhuizhen_cairen_zhe_default_v1.png) | 无 | 堕马髻、半臂已出现；帔帛宽度与年龄待验 | 待 CC3 验收 |
| 3 | [xujinghe_nvguan_yuebai_default_v1.png](../assets/portraits/xujinghe_nvguan_yuebai_default_v1.png) | 无 | 月白与中灰底；险边、衣身误抠空洞是重点 | 待 CC3 验收 |
| 4 | [tangjian_dianji_qianlv_default_v1.png](../assets/portraits/tangjian_dianji_qianlv_default_v1.png) | 无 | 簿子偏大、身体略转；窄袖与姿态待验 | 待 CC3 验收 |
| 5 | [liqinghe_gongzhu_yujin_default_v1.png](../assets/portraits/liqinghe_gongzhu_yujin_default_v1.png) | 无 | 郁金浓度、帔帛宽度、步摇待验 | 待 CC3 验收 |
| 6 | [shishe_ink_v1.png](../assets/scenes/shishe_ink_v1.png) | 无 | 中央地板空；水面反光及低案尺度待验 | 待 CC3 验收 |
| 7 | [nvguan_ink_v1.png](../assets/scenes/nvguan_ink_v1.png) | 无 | 同地点基础图；中央空地与家具尺度待验 | 待 CC3 验收 |
| 8 | [nvguan_ink_kaike_v1.png](../assets/scenes/nvguan_ink_kaike_v1.png) | nvguan_ink_v1.png | 附女冠观基础图；陈设与空地范围待验 | 待 CC3 验收 |
| 9 | [nvguan_ink_yeyu_v1.png](../assets/scenes/nvguan_ink_yeyu_v1.png) | nvguan_ink_v1.png | 附女冠观基础图；真夜雨、雨线及地面反光待验 | 待 CC3 验收 |
| 10 | [hanyuan_gold_gongyi_v1.png](../assets/scenes/hanyuan_gold_gongyi_v1.png) | 无 | 同地点基础图；地面高光与柱色待验 | 待 CC3 验收 |
| 11 | [hanyuan_gold_shouwei_v1.png](../assets/scenes/hanyuan_gold_shouwei_v1.png) | hanyuan_gold_gongyi_v1.png | 附含元殿公议；御床形制、光对比待验 | 待 CC3 验收 |
| 12 | [wuzibei_ink_v1.png](../assets/scenes/wuzibei_ink_v1.png) | 无 | 碑面无可见文字与红色；碑首浮雕偏深、纹样待严格核对 | 待 CC3 验收 |
| 13 | [yilu_ink_qicheng_v1.png](../assets/scenes/yilu_ink_qicheng_v1.png) | 无 | 木牌空白；木车、里堠尺度与雾中构图待验 | 待 CC3 验收 |


> 一版一行，只增不改。门槛见 `.claude/skills/art-style/SKILL.md`「验收生成图的七道门槛」，提示词见 `references/ai-prompt.md`。
> 列：① 剪影 ② 形制 ③ 脸 ④ 颜色与画法 ⑤ 身材 ⑥ 被看 ⑦ 杂质；否决：糊＝脸糊了，裴＝裴照夜男性化。✓ 过 ✗ 不过 △ 一半 — 没看。
> `眼` 是原件里眼睛所在的像素行，给 `npm run art:post -- portrait <套> --eye <眼>` 用。

| 日期 | 原件 | 生成 | 提示词 | ① | ② | ③ | ④ | ⑤ | ⑥ | ⑦ | 否决 | 眼 | 结论 | 看图的人 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-14 | `wuze_cairen_qing_default_v1.png` | Codex，内置图像生成 | E11 之前（D-095 骨架） | ✗ 两个圆球髻、自然腰通身袍、无帔帛 | ✗ 垂袖、蝴蝶结长垂带、白布鞋；✓ 交领右衽 | ✗ 现代网红脸 | ✗ 淡彩 | — | ✓ | ✓ | — | — | **不过**。D-103 七条 | Cowork（D-103） |
| 2026-09-14 | `wuze_cairen_qing_default_v2.png` | Codex，内置图像生成 | E11 之前（按 D-103 七条改） | ✗ 帔帛成三角斗篷盖住手臂；髻是圆柱发包；笔在 120px 看不见 | ✓ 右衽、窄袖、胸下小结；△ 翘头但是尖钩精灵鞋 | ✗ 与 v1 同一张现代脸 | △ 饱和了，但是钴蓝；满身同向笔触读成扎染 | — | ✓ | ✓ 头顶离上边 6px（不算杂质，提示词加了留白） | — | 258（目测） | **不过**。对照见 `ai-prompt.md` 第五节 | CC3 |
| 2026-09-14 | `wuze_cairen_qing_default_v3.png` | Codex，内置图像生成；无参考图 | E12 `ai-prompt.md` §三·1 原文；附输出尺寸请求 | — 待 120px 检查；双环已出现，帔帛偏宽 | — 初看有蝴蝶结、长垂带 | — 待七项量脸 | — 待验 | — 待同尺排图 | — | — 头顶留白明显不足 3% | 待 CC3 | — | **待 CC3 验收**；1024×1536 PNG 已落盘，未后处理、未接引擎 | Codex（仅生成登记与初看） |
| 2026-09-14 | `shenheng_siji_shenlv_default_v1.png` | Codex，内置图像生成；无参考图 | E12 `ai-prompt.md` §三·2 原文；附输出尺寸请求 | — 待 120px 检查 | — 待验 | — 待七项量脸及与主角比对 | — 待验 | — 待同尺排图 | — | — 头顶留白明显不足 3% | 待 CC3 | — | **待 CC3 验收**；1024×1536 PNG 已落盘，未后处理、未接引擎 | Codex（仅生成登记与初看） |
| 2026-09-14 | `peizhaoye_nvjiang_yanzhifei_default_v1.png` | Codex，内置图像生成；无参考图 | E12 `ai-prompt.md` §三·3 原文；附输出尺寸请求 | — 待 120px 检查；横刀部分叠在袍身 | — 待验 | — 待七项量脸 | — 待验 | — 待同尺排图 | — | — 头顶留白明显不足 3% | 待 CC3（含裴照夜硬否决） | — | **待 CC3 验收**；1024×1536 PNG 已落盘，未后处理、未接引擎 | Codex（仅生成登记与初看） |
| 2026-09-14 | `wuze_cairen_qing_default_v3.png`（判定） | — | — | ✗ 双鬟画成两个实心犄角（读成羊角）；帔帛仍是宽披肩 | ✓ 高腰、窄袖、交领右衽；△ 胸下结仍是蝴蝶结样 | ✓ 现代脸没了，七项压住 | ✗ 钴蓝，和沈衡的绿断了「一族两端」 | ✓ 与沈衡、裴照夜排队顺序对 | ✓ | △ 头顶留白 8px（不挡） | — | 188 | **不过**。v4 改三处：青偏绿发灰、扁空心环、帔帛一掌宽（`ai-prompt.md` §三·1） | Cowork（E13）；CC3 记，量眼睛行 |
| 2026-09-14 | `shenheng_siji_shenlv_default_v1.png`（判定） | — | — | ✓ | ✓；靴不是履，判不改 | ✓ | △ 绿偏鲜草绿，要墨绿一路 | ✓ | ✓ | △ 头顶留白 12px（不挡） | — | 165 | **过**，小改等下一批（v2 只改绿） | Cowork（E13）；CC3 记，量眼睛行 |
| 2026-09-14 | `peizhaoye_nvjiang_yanzhifei_default_v1.png`（判定） | — | — | ✓ 剪影读得出是穿男装的女人 | ✓ | △ 偏老偏男相，细纹加过头 | △ 绯偏洋红／玫红 | ✓ 最高最宽 | ✓ | △ 头顶留白 10px（不挡）；横刀部分叠在袍身 | 裴：✓ 没被画成男人 | 145 | **过**，小改等下一批（v2 改绯与脸龄） | Cowork（E13）；CC3 记，量眼睛行 |
| 2026-09-14 | `wuze_cairen_qing_default_v4.png` | Codex，内置图像生成；无参考图 | E13 `ai-prompt.md` §三·1 原文；附 1024×1536 输出请求 | — 初看双环有孔，帔帛仍偏宽；待 120px 验 | — 待验 | — 待验 | — 青色偏灰绿，待并排验 | — | — | — | 待验 | — | **待 CC3 验收**；1024×1536 PNG 已落盘，未后处理、未接引擎 | Codex（生成登记，非验收） |
| 2026-09-14 | `zhaoyang_gold_v1.png` | Codex，内置图像生成；无参考图 | E13 `ai-prompt.md` §四·1 原文；附 1536×1024 输出请求 | — 待验 | — 待验 | 不适用 | — 待与立绘合屏验 | — 待合屏量尺度 | 不适用 | — 初看左侧地砖反光，待验 | 不适用 | 不适用 | **待 CC3 验收**；1536×1024 PNG 已落盘，未后处理、未接引擎 | Codex（生成登记，非验收） |
| 2026-09-14 | `shuge_ink_v1.png` | Codex，内置图像生成；无参考图 | E13 `ai-prompt.md` §四·2 原文；附 1536×1024 输出请求 | — 待验 | — 待验 | 不适用 | — 待与立绘合屏验 | — 待合屏量尺度 | 不适用 | — 待验 | 不适用 | 不适用 | **待 CC3 验收**；1536×1024 PNG 已落盘，未后处理、未接引擎 | Codex（生成登记，非验收） |
| 2026-09-14 | `yeting_ink_v1.png` | Codex，内置图像生成；无参考图 | E13 `ai-prompt.md` §四·3 原文；附 1536×1024 输出请求 | — 中央地面有树影，待验 | — 待验 | 不适用 | — 待与立绘合屏验 | — 待合屏量尺度 | 不适用 | — 待验 | 不适用 | 不适用 | **待 CC3 验收**；1536×1024 PNG 已落盘，未后处理、未接引擎 | Codex（生成登记，非验收） |
| 2026-09-14 | `yuanye_ink_v1.png` | Codex，内置图像生成；无参考图 | E13 `ai-prompt.md` §四·4 原文；附 1536×1024 输出请求 | — 待验 | — 待验 | 不适用 | — 待夜滤镜及立绘合屏验 | — 待合屏量尺度 | 不适用 | — 天空出现云纹，待验 | 不适用 | 不适用 | **待 CC3 验收**；1536×1024 PNG 已落盘，未后处理、未接引擎 | Codex（生成登记，非验收） |
| 2026-09-14 | `wuze_cairen_qing_default_v4.png`（判定） | — | — | ✗ 双鬟仍是实心（两道缝，见下表）；帔帛仍是肩上的宽披肩 | ✓ | ✓ | ✓ **青对了**，和沈衡看得出一族两端 | ✓ | ✓ | △ 头顶留白不足（不挡） | — | 185（CC1 目测） | **不过**。v5 只改髻与帔帛，青不动（`ai-prompt.md` §三·1） | Cowork（E14）；CC3 记，机器量孔 |
| 2026-09-14 | `zhaoyang_gold_v1.png`（判定） | — | — | ✓ 眯眼三四块明暗，中间一条是殿内 | △ 门外远处一座黄琉璃瓦殿，明清故宫的样子（在画面最左、手机中间一条外面） | 不适用 | ✓ 铅丹柱退在人后面 | ✓ 脚线 22% 踩在地衣上（CC1 整屏） | 不适用 | △ 左侧地砖反光偏亮；**无字**：匾额、屏风空（放大核过） | 不适用 | 不适用 | **过**，`art:post` 已出到 `public/scene/`。黄瓦殿与地面反光下一版再改，不挡 | CC3（E14）；整屏合屏 Cowork R-025 |
| 2026-09-14 | `shuge_ink_v1.png`（判定） | — | — | ✓ | ✓ 卷轴不是线装书 | 不适用 | ✓ 素彩不是淡彩 | ✓ | 不适用 | ✓ **无字**：案上笺、卷签空（放大核过）；地面略有反光，不挡 | 不适用 | 不适用 | **过**，已出到 `public/scene/` | CC3（E14）；整屏合屏 Cowork R-025 |
| 2026-09-14 | `yeting_ink_v1.png`（判定） | — | — | ✓ | ✓ | 不适用 | ✓ | ✓ | 不适用 | △ 中央地面有树影斑驳（提示词不许中央有光斑）——整屏里反而把脚落住了，不挡；**无字**：门牌空（放大核过） | 不适用 | 不适用 | **过**，已出到 `public/scene/` | CC3（E14）；整屏合屏 Cowork R-025 |
| 2026-09-14 | `yuanye_ink_v1.png`（判定） | — | — | ✓ | ✓ | 不适用 | ✗ 套夜滤镜后读成黄昏，人还是白天的光（R-025） | ✓ | 不适用 | ✗ 天上满是云纹 | 不适用 | 不适用 | **不过，不上线**。改出真夜景 `yuanye_ink_v2`（D-121，`ai-prompt.md` §四·5）；v1 留作构图参考 | Cowork（R-025、D-121）；CC3 记 |

## 环里透光（E14 单列，`SKILL.md` 门槛 1a）

主角双鬟望仙髻：两个孔，每个宽 ≥ 45、高 ≥ 60 像素才算过。数字是 `npm run art:post -- portrait wuze_default --v N --eye <眼>` 报的「头顶透光」。

| 原件 | 眼睛行以上的孔（宽×高，像素） | 够大的 | 人看（120px 剪影） | 过没过 |
|---|---|---|---|---|
| `wuze_cairen_qing_default_v2.png` | 19×40（一个） | 0 | 圆柱发包 | ✗ |
| `wuze_cairen_qing_default_v3.png` | 16×46、18×45 | 0 | 两只实心犄角 | ✗ |
| `wuze_cairen_qing_default_v4.png` | 20×45、20×46 | 0 | 两只实心犄角 | ✗ |
| `wuze_cairen_qing_default_v5.png` | 待 CC3 机器量孔径 | 待量 | 初看两环均透出白底；待实际 120px 检查 | **待验**，不以目测代替 ≥45×60 的门槛 |

## C23 生成登记（E14 提示词，待 CC3 验收）

> C26 核对：本节两张已按 CC3 的 E14 新提示词生成，正是 C26 指定的主角 v5 和苑野真夜景 v2；沿用这两份原件交验，不重复生成、不覆盖。环里透光的机器门槛、帔帛宽度及夜景地面仍待 CC3 验收。

| 日期 | 原件 | 生成方式与提示词 | 尺寸 | 初看记录（非验收结论） | 状态 |
|---|---|---|---|---|---|
| 2026-09-14 | `assets/portraits/wuze_cairen_qing_default_v5.png` | 内置图像生成；无参考图；`ai-prompt.md` §三·1 原文，附尺寸请求 | 1024×1536 | 环中间可见白底，孔径待量；帔帛离开肩部、搭前臂，垂下部分仍显宽；青色沿用 E14 原文 | **待 CC3 验收**，原件已落盘，未后处理、未接引擎 |
| 2026-09-14 | `assets/scenes/yuanye_ink_v2.png` | 内置图像生成；苑野 v1 作构图参考；`ai-prompt.md` §四·5 原文，附尺寸请求 | 1536×1024 | 月亮与左侧风灯已出现，中央地面可辨；待核对地面高光及与夜间人物合屏效果 | **待 CC3 验收**，原件已落盘，未后处理、未接引擎 |
| 2026-09-14 | `wuze_cairen_qing_default_v5.png`（判定） | 33×60、33×12、32×61（机器）；两个够大（E15 校过的线 ≥28×50；按 E14 原线 45×60 是 0 个） | 2 | **两个孔清清楚楚**（`art:post -- silhouette`） | **✓ 过**（按 E15 的线；这条线是看过 v5 之后校的，交 Cowork 判） |

## E15 判定（接主表的列）

| 日期 | 原件 | ① | ② | ③ | ④ | ⑤ | ⑥ | ⑦ | 否决 | 眼 | 结论 | 看图的人 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-14 | `wuze_cairen_qing_default_v5.png` | ✓ 两个空心环看得出孔（1a 见上表）；帔帛离开了肩，肩和上臂轮廓露出来，两臂与身体之间透光 | ✓ 高腰、窄袖、交领右衽、翘头履；△ 胸下结垂带仍到大腿 | ✓ 面型、下颌、眼形、眉；△ 眼线略描黑、微挑（第 7 项一项不过，不挡） | ✓ 青与 v4 一样，站在沈衡旁边一族两端 | ✓ 排队顺序对 | ✓ | △ 头顶留白 8px（不挡） | — | 185 | **过**，`art:post` 已出到 `public/char/`。小改记下一版（帔帛垂下那两片仍比一掌宽、眼线、垂带），不重出 | CC3（E15） |
| 2026-09-14 | `yuanye_ink_v2.png` | ✓ 中间一条是路和城门，读得出是野地 | ✓ 城墙角楼、夯土墙、栅栏、鼓架 | 不适用 | ✓ 真夜：天深蓝，月在左上、风灯在左，地面干、只有淡冷光；✓ 素彩不是淡彩 | ✓ 构图和 v1 一样，CC1 按 v1 填的数照用 | 不适用 | ✓ **无字**：幡与鼓面只有磨旧的淡纹，不是字（放大核过）；△ 天约占三分之一出一点（地平线在 34%），不挡 | 不适用 | 不适用 | **过**，已出到 `public/scene/yuanye_ink.webp`。**要 CC1 给它关背景滤镜才对**（见 art-cc3-e15.md 待协调 1），关之前是两层夜、偏黑 | CC3（E15）；合屏见 `Claude outputs/art-post/e15-*` |

## E18 判定：C27 十三张（按 E18 改写后的门槛；门槛三是否定式 + 并排认脸）

> 立绘脸的判法见 `SKILL.md` 第 3 道；并排图 `Claude outputs/art-post/e18-faces-mask.png`（脸缩到同样大，椭圆遮掉头发冠帽衣领）。
> 已上线的三张（主角 v5、沈衡 v1、裴照夜 v1）一起并排，新的一张要和已验收的全部比。

| 原件 | ① 剪影 | ② 形制 | ③ 脸（否定式 ／ 并排认脸） | ④ 颜色 | ⑦ 杂质、抠底 | 眼 | 结论 |
|---|---|---|---|---|---|---|---|
| `adi_gongren_ma_default_v1.png` | ✓ 双丫髻、围裳 | ✓ | ✓ 否定式 ／ ✗ 和主角、沈衡同一种年轻窄脸 | ✓ 本色麻 | ✓ 中灰底抠得干净（险边 22.2%，但墨底那一格衣服边完好） | 161 | **重出 v2，只改脸** |
| `songhuizhen_cairen_zhe_default_v1.png` | ✓ 堕马髻、半臂、帔帛离肩 | ✓；△ 垂带到大腿（和主角 v5 同，不挡） | ✓ ／ ✓ 圆脸、红润、四十出头，分得开 | ✓ 赭；腰带是赭红不是正红（放大核过） | ✓；紫在簪头 | 140 | **过**，已出到 `public/char/` |
| `xujinghe_nvguan_yuebai_default_v1.png` | ✓ 黄冠、道帔 | ✓ | ✓ ／ ✗ 和李令仪同是白圆脸 | ✓ 月白 | **✗ 抠坏**：中灰底，墨底那一格右半边袍子和道帔被啃出锯齿洞，身上挖掉 6 个洞（最大 5294px 在袍身正中）；险边 12.8% | 171 | **重出 v2：改绿幕底 + 改脸** |
| `tangjian_dianji_qianlv_default_v1.png` | ✓ 托簿子横出一道 | ✓；△ 簿子偏大、身体略侧 | ✓ ／ ✗ 和宋蕙贞同是圆胖红脸 | ✓ 浅绿 | ✓ | 197 | **重出 v2：改脸，簿子改小、身体正对** |
| `liqinghe_gongzhu_yujin_default_v1.png` | ✓ 高髻步摇 | ✓；△ 垂带到膝 | ✓ ／ ✓ 满月脸、最白 | ✓ 郁金，不是明黄 | ✓ | 188 | **过**，已出到 `public/char/`；紫礼衣附这张当定妆图 |
| `shishe_ink_v1.png` | ✓ 中间一条是水榭地板 | ✓ | — | ✓ 素彩 | ✓ 晾纸、笺、团扇都空白；△ 天边有落日（这张允许） | — | **过**，已出 |
| `nvguan_ink_v1.png` | ✓ | ✓ | — | ✓ | ✓ 符纸空白 | — | **过**，已出 |
| `nvguan_ink_kaike_v1.png` | ✓ 和素的那张同一构图 | ✓ | — | ✓ | ✓ 所有纸空白 | — | **过**，已出 |
| `nvguan_ink_yeyu_v1.png` | ✓ 同一构图 | ✓ | — | ✓ 真夜；门外有细雨线（放大核过）、一盏灯 | ✓ | — | **过**，已出。**要 CC1 给 `paintedNight`** |
| `hanyuan_gold_gongyi_v1.png` | ✓ 两排案、中间通道空 | ✓ 铅丹柱 | — | ✓ 重彩 | △ 地砖略反光；匾额空 | — | **过**，已出 |
| `hanyuan_gold_shouwei_v1.png` | ✓ 同一柱列；后方空御床（榻，不是椅子） | ✓ | — | ✓ | ✓ 诏书没展开 | — | **过**，已出 |
| `wuzibei_ink_v1.png` | ✓ 碑在正中 | ✓ 碑首是云气浮雕，不是龙（放大核过） | — | ✓ 素彩，无红 | ✓ **碑面光素、无字、无印**（放大核过） | — | **过**，已出。碑面在原件 x 652–878、y 162–581（1536×1024），给 CC1 叠印 |
| `yilu_ink_qicheng_v1.png` | ✓ 路从正中伸进雾里 | ✓ 两轮车、无牲口 | — | ✓ | ✓ 里堠木牌空白（放大核过） | — | **过**，已出 |

**已上线三张按新门槛复查**：主角 v5 ✓（否定式里「描黑眼线」一条算轻，不挡，主角·绯那张写明不描）；沈衡 v1 ✗ 并排认脸——**和主角 v5 是全套最像的一对**，主角已定，沈衡 v2 换脸；裴照夜 v1 ✓（最分得开的一张）。**已上线的不撤**（D-116），v2 过了再换。

