# CC3／E39 · 约会与写景全量核查

2026-09-18｜D-222—D-228／R-058｜文档交付，未生图、未上线。

冻结基线共 **107场**；明确闲场 **13场**、双人候选 **40场**、机器写景候选 **35条**、显式空镜 **9处**均逐项列出，并补 **26条**关键词漏检。后三类相互重叠，不能相加当场数。首批紧急 **12图**已冻结；后续B **44图**、C **39图**，合计 **95个候选新key**（含身份及不同动作的分图；准确既有景优先复用，见第7节补记）。这是一份缺口／接入计划，不是95张成图或全场景验收通过。

完整可复制提示词、绝对参考图路径、who／beat／focus计划、输出目标与精确when在 [art-c43-prompts.md](art-c43-prompts.md)。先做A；不以A完成冒充全量。补充漏检表内仍有明确“待E40核／待构图冻结”项，未给可生成key的项目不在C43授权生成边界。

## 1. 核查来源与边界

- 冻结根：`C:/Users/10656/Desktop/吾泽添 LE版/Claude outputs/command/20260918-review/`。读取107场JSON中的所有行、场require、逐格when、选择／分发入边；视觉语义按叙述、私话、动作与前后结果交叉核，不按cast机械判约会。
- `manifest.json` 的 **122项SHA-256全部吻合**；95条新图原句逐字回查冻结C稿，未命中 **0项**。
- 现行风格按 `.claude/skills/art-style/SKILL.md`、ai-prompt／character和冻结唐代物质手册；厚涂，不沿用旧SVG剪影规范。D-200优先于技能内“退回重生”旧流程：每key一版，小问题记账，硬伤不得报上线。
- 只写本报告及提示词。未写C-*、src、public、assets、生图账本、指挥日志。当前工作稿属于C52，旧格须以本报告原句映射到新格，不能用数字直接覆盖新稿。
- 现有CG原件目视核对：三章亲密3图、月酒、挡风v1、并坐v2、握手、递叶、藏纸v2、等句、归还、出行结局v3及7张人物参考。其他磁盘原件只据账本和存在性列候选，不伪称逐张视觉验收。
- 本轮没有新视觉产物，因此不给尚未生成的图编70分／85分。E40按art-director十项各10分写位置证据和最该改一条，同时查最终手机画面。

## 2. 先处理的错误与身份条件

1. ch03-17/l8是**接不到雨、指背沾灰**，不能画掌心盛水；D-222明确夜雨。灰瓦两侧落水与书阁卷架保留，不借女冠观。
2. ch03-01/l37是无人旧景水边柳圈，不是书阁桌上装饰；l38立刻回眼前。
3. ch03-18/l2各坐长凳两头，l21已挪近但醒着；早晚两拍分图，不能图先演完。
4. ch04-16/l2、l15是**裴倒自己的靴砂**。主角坐自己行囊、收原凭、看靴口；不是主角倒靴也不是裴替她穿靴。行装参考只取衣发，不复制结局事件。
5. ch02-26/l14在“再坐近些”之后；布卷垫腕、同高并坐，不跪侍、不喂水、不新增恋爱路线。
6. 第一／二章与第三章受位前主角青；ch03-12之后受位常服绯；辞受／落选在京仍青。第四章14→15→16由落选路的独立差程进入，才用出行青圆领袍与头巾；回京不无限沿用行装。
7. 所有身份分图与关系when分开。公主kiss必须保留 `li_ch03_only_intent=false AND li_ch03_multi_told=false AND li_ch03_private_paused=false`，再选青或绯；果子图不带亲吻，可覆盖暂停支。
8. 四章答复图是等待对方回答，不提前演“愿意”；only／open仍走原来同意或拒绝。说停的4场另画各自收物，不拿答复图或吻图遮盖拒绝。

## 3. 紧急批A（先行冻结）

|key|旧场／格及原句|关系／身份|原件 → 上线目标|状态|
|---|---|---|---|---|
|`shenheng_7_jieyu`|ch03_s17_shuge.l8：你照她指的地方伸手，一滴没接到。指背挨上窗框，沾了一条灰。|青；场门槛`{"affinity.shenheng":{"gte":14},"flag.shen_meng_boundary":true}`|`assets/cg/shenheng_7_jieyu_v1.png` → `public/cg/shenheng_7_jieyu.webp`|新增／已冻结，待C43／E40|
|`shenheng_7_jieyu_fei`|ch03_s17_shuge.l8：你照她指的地方伸手，一滴没接到。指背挨上窗框，沾了一条灰。|绯；场门槛`{"affinity.shenheng":{"gte":14},"flag.shen_meng_boundary":true}`|`assets/cg/shenheng_7_jieyu_fei_v1.png` → `public/cg/shenheng_7_jieyu_fei.webp`|新增／已冻结，待C43／E40|
|`wu_shangsi_liuquan`|ch03_s01_shuge.l37：旧景·上巳。水边一只柳圈搁在石上，细浪沾湿了梢头。|无人；场门槛`{}`|`assets/cg/wu_shangsi_liuquan_v1.png` → `public/cg/wu_shangsi_liuquan.webp`|新增／已冻结，待C43／E40|
|`shenheng_8_mozi`|ch02_s15_shuge.l21：你张了张嘴，又闭上。她先笑出了声，手指还捏着袖角。|青；场门槛`{"affinity.shenheng":{"gte":8},"flag.shen_joint_reading":true}`|`assets/cg/shenheng_8_mozi_v1.png` → `public/cg/shenheng_8_mozi.webp`|新增／已冻结，待C43／E40|
|`peizhaoye_7_baibing`|ch02_s16_yuanye.l22：她挑出自己手里那块的脆角，放到你掌心。|青；场门槛`{"affinity.peizhaoye":{"gte":8},"flag.pei_shared_check":true}`|`assets/cg/peizhaoye_7_baibing_v1.png` → `public/cg/peizhaoye_7_baibing.webp`|新增／已冻结，待C43／E40|
|`wenqiao_7_chuangying`|ch02_s17_shishe.l14：她拨开发尾，把肩侧让给你。你挪过去，额角贴上她的肩。|青；场门槛`{"affinity.wenqiao":{"gte":8},"flag.wen_reader_help":true}`|`assets/cg/wenqiao_7_chuangying_v1.png` → `public/cg/wenqiao_7_chuangying.webp`|新增／已冻结，待C43／E40|
|`liqinghe_7_dizhi`|ch02_s18_yuanye.l22：李令仪望了望两人之间，向你挪了一点。你也挪过去。|青；场门槛`{"affinity.liqinghe":{"gte":8},"flag.liqinghe_cost_check":true}`|`assets/cg/liqinghe_7_dizhi_v1.png` → `public/cg/liqinghe_7_dizhi.webp`|新增／已冻结，待C43／E40|
|`shenheng_9_liangcha`|ch01_s13_shuge.l22：沈衡手停在杯边，看了你一眼，才把杯子推过来。|青；场门槛`{"affinity.shenheng":{"gte":4}}`|`assets/cg/shenheng_9_liangcha_v1.png` → `public/cg/shenheng_9_liangcha.webp`|新增／已冻结，待C43／E40|
|`peizhaoye_8_shuying`|ch03_s18_yuanye.l21：你靠上树干，偏头看她。她没闭眼，也没问你看什么。|青；场门槛`{"affinity.peizhaoye":{"gte":14},"flag.pei_meng_no_troops":true}`|`assets/cg/peizhaoye_8_shuying_v1.png` → `public/cg/peizhaoye_8_shuying.webp`|新增／已冻结，待C43／E40|
|`peizhaoye_8_shuying_fei`|ch03_s18_yuanye.l21：你靠上树干，偏头看她。她没闭眼，也没问你看什么。|绯；场门槛`{"affinity.peizhaoye":{"gte":14},"flag.pei_meng_no_troops":true}`|`assets/cg/peizhaoye_8_shuying_fei_v1.png` → `public/cg/peizhaoye_8_shuying_fei.webp`|新增／已冻结，待C43／E40|
|`peizhaoye_9_yipang`|ch04_s16_yilu.l15：你将原凭收好，裴把空靴口递过来，让你看那粒砂。|出行青；场门槛`{"flag.road_agreement":true}`|`assets/cg/peizhaoye_9_yipang_v1.png` → `public/cg/peizhaoye_9_yipang.webp`|新增／已冻结，待C43／E40|
|`liuchenghuan_2_jinzuo`|ch02_s26_shuge.l14：你把膝边的书往里挪。她坐过来，裙角铺到那一小块亮处。|青；场门槛`{}`|`assets/cg/liuchenghuan_2_jinzuo_v1.png` → `public/cg/liuchenghuan_2_jinzuo.webp`|新增／已冻结，待C43／E40|

## 4. 107场逐场覆盖总表

本表覆盖所有场，包括没有画面的路由节点。新key原件统一 `assets/cg/<key>_v1.png`，上线 `public/cg/<key>.webp`；各key绝对路径、具体旧格与原句见第8节和提示词。既有CG不等于全场动作均被覆盖。

|场|性质／判定|现有图（旧CG格）|新增与落点|场门槛|
|---|---|---|---|---|
|ch01_s00_zhaoyang|题记与身体开场，非约会；薄霜枯叶为空镜，新增。|无独立CG|l4 `e39_ch01_s00_l4`|`{}`|
|ch01_s01_zhaoyang|公务试骑中注意到沈誊写，单人本行CG不能计双人约会；转纸香景另拍。|l5 `shenheng_1_tengxie`|l38 `e39_ch01_s01_l38`|`{}`|
|ch01_s02_zhaoyang|试骑手续协商非约会；上元记忆图前移到l43同拍。|l44 `wu_denglun`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch01_s03_yeting|阿荻补袖属照料，现有双人图；l61–82转为许静和茶边私谈，友谊／哲思不是恋爱确认。|l17 `adi_1_buxiu`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch01_s04_shuge|公务争论后仍愿同坐；已有双人并坐可用，只贴真实坐下格。|l11 `shenheng_4_bingzuo`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch01_s05_yuanye|与阿荻学鸟叫的友谊闲场；不是正式恋爱线，苑墙叶景单列，不能误标公务。|无独立CG|l2 `e39_ch01_s05_l2`|`{}`|
|ch01_s06_yeting|本场为改掉缺一人便扣整组领物的办法，并分担核账成本；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch01_s07_yuanye|赴园摸马与私人旧事；现有驯马为裴单人，补l20双人。|l18 `peizhaoye_1_xunma`|l20 `e39_ch01_s07_l20`|`{}`|
|ch01_s08_shuge|正式策问，公主单人博弈属本行，不强算约会。|l57 `liqinghe_1_boyi`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch01_s09_shuge|公事后侧室私见，递整稿、保留坐席；补中性双人。|无独立CG|l37 `e39_ch01_s09_l37`；l2 `e39_ch01_s09_l2`|`{}`|
|ch01_s10_yeting|本场为两个经办女人自行安排病舍核领，不等主角来解题；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch01_s11_shishe|共同抢纸＋署名与议价，带私人相识，抢纸和收湿纸不同拍。|无独立CG|l17 `e39_ch01_s11_l17`；l2 `e39_ch01_s11_l2`；l34 `e39_ch01_s11_l34`；l73 `e39_ch01_s11_l73`|`{}`|
|ch01_s12_shuge|擅引阿荻私话的封递，不当恋爱；油布／雨后檐滴需同拍。|无独立CG|l16 `e39_ch01_s12_l16`|`{}`|
|ch01_s13_shuge|明确闲场，推冷茶杯；两杯无热气。|无独立CG|l22 `shenheng_9_liangcha`；l2 `e39_ch01_s13_l2`|`{"affinity.shenheng":{"gte":4}}`|
|ch01_s14_yuanye|明确闲场，解结后先问再握手；既有握手图留在同意之后。|l25 `peizhaoye_3_woshou`|见写景／私人补核表；未列新增不等于视觉已过|`{"affinity.peizhaoye":{"gte":4}}`|
|ch01_s15_shishe|明确闲场，藏两张纸后互看；已有双人藏纸。|l15 `wenqiao_1_cangzhi`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch01_s16_yuanye|明确闲场，投叶／递叶；捡叶与递叶分拍，酥山只在旧景。|l30 `liqinghe_2_diye`；l37 `wu_sushan`|l2 `e39_ch01_s16_l2`|`{"affinity.liqinghe":{"gte":4}}`|
|ch01_s17_yeting|阿荻对擅引的异议，拒绝须保留；细雨关窗与湿纸不能用晴景。|无独立CG|l2 `e39_ch01_s17_l2`；l28 `e39_ch01_s17_l28`|`{"flag.petition_sent":true}`|
|ch01_s18_zhaoyang|补件未追回的后果；马景与窄光旧辙各是独立景，不是约会。|无独立CG|l27 `e39_ch01_s18_l27`；l50 `e39_ch01_s18_l50`|`{"flag.petition_sent":true}`|
|ch02_s01_yeting|本场为阿荻纠正主角自以为知道的欠付，拿回自己的说话次序；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch02_s02_yeting|本场为核问改为分项复述、本人确认，欠付与擅引分开；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch02_s03_nvguan|阿荻暂住意愿及宋伴侣提及；伴侣不在场，不能画虚构双人恋人。|无独立CG|l2 `e39_ch02_s03_l2`|`{}`|
|ch02_s04_shuge|核旧卷与私人邀约分开；l41尚未答应，不能画赴约后的贴靠。|无独立CG|l41 `e39_ch02_s04_l41`|`{}`|
|ch02_s05_yeting|与宋折帕的友谊闲场，非恋爱路线；帕角光为真物景。|无独立CG|l2 `e39_ch02_s05_l2`|`{}`|
|ch02_s06_yeting|本场为核准九件实际给付，辞出与欠款不再相互扣住；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch02_s07_yuanye|合抬粮袋＋核欠办，身体协作不是亲密同意。|无独立CG|l22 `e39_ch02_s07_l22`|`{}`|
|ch02_s08_shuge|本场为女冠校读正式给俸并限差务，同时把调笺授权摆到台前；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch02_s09_shishe|等主角起句属双人读诗，既有dengju；先前拒邀不抹掉，图不能画亲吻。|l44 `wenqiao_2_dengju`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch02_s10_nvguan|许静和夜灯剪灯花的友谊哲思，不算正式约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch02_s11_hanyuan|私笺被公开的越界，不画成甜蜜告白；太后灯影为动作中的景。|无独立CG|l3 `e39_ch02_s11_l3`|`{}`|
|ch02_s12_yeting|照料与拒绝谅解；已有diwen，不拿温水当原谅；寒食旧景同拍。|l4 `songhuizhen_1_diwen`；l49 `wu_lengzao`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch02_s13_hanyuan|多人场l39起分出主角与沈私人段；yes／wait／no台词分支全部保留，图只画留身旁不牵手。|无独立CG|l39 `e39_ch02_s13_l39`|`{}`|
|ch02_s14_zhaoyang|l34–41裴自己留下的半刻及挡风；已有获准v1，不以v2替换。|l41 `peizhaoye_2_dangfeng`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch02_s15_shuge|明确闲场，认墨渍；不是字画鉴赏，墨斑不能生成真鱼。|无独立CG|l21 `shenheng_8_mozi`|`{"affinity.shenheng":{"gte":8},"flag.shen_joint_reading":true}`|
|ch02_s16_yuanye|明确闲场，分饼脆角落掌；不是喂嘴。|无独立CG|l22 `peizhaoye_7_baibing`|`{"affinity.peizhaoye":{"gte":8},"flag.pei_shared_check":true}`|
|ch02_s17_shishe|明确闲场，竹窗影与获邀靠肩；袖上投影不变成印花。|无独立CG|l14 `wenqiao_7_chuangying`；l30 `e39_ch02_s17_l30`|`{"affinity.wenqiao":{"gte":8},"flag.wen_reader_help":true}`|
|ch02_s18_yuanye|明确闲场，绕低枝后各挪近；没有亲吻。|无独立CG|l22 `liqinghe_7_dizhi`|`{"affinity.liqinghe":{"gte":8},"flag.liqinghe_cost_check":true}`|
|ch02_s19_nvguan|许与主角尝酸果的友谊闲场；槐叶冷淘是旧景，不能贴到眼前果碟。|l21 `wu_lengtao`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch02_s20_hanyuan|本场为比较两种非宗室提名办法，承担各自的门槛与成本；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch02_s21_nvguan|温与许独立安排学徒工时，主角不在；不是主角恋爱图。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch02_s22_shuge|公务后温在l49邀私见，l54留门边空处；尚未答应，补邀请图。|无独立CG|l54 `e39_ch02_s22_l54`|`{}`|
|ch02_s23_hanyuan|本场为正式开放非宗室提名，本轮候选名单公布；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch02_s24_shuge|公主交财政稿之后想留；l40仍没坐下，不能强行同坐；窗纸夜风另图。|无独立CG|l40 `e39_ch02_s24_l40`；l39 `e39_ch02_s24_l39`|`{}`|
|ch02_s25_yeting|承欢有偿录工及过量代劳，自我取消不是恋爱奖励；不画束腕红线定情。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch02_s26_shuge|受邀近坐与真实心动，随后保留自我取消的原话；非新增第五正式恋爱线。|无独立CG|l14 `liuchenghuan_2_jinzuo`|`{}`|
|ch03_s01_shuge|本场为决定自己的不利材料是否和荐文一同交给复核人；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|l37 `wu_shangsi_liuquan`|`{}`|
|ch03_s02_shuge|撤差异议与愿相见并存；靠门空凳不等于主角已坐；已有rangzuo＋新增指边停手。|l33 `shenheng_2_rangzuo`|l22 `e39_ch03_s02_l22`|`{}`|
|ch03_s03_yeting|多人场承欢热布巾／捧碗照料夹劳动代价，不画无条件侍奉的甜图。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch03_s04_yuanye|裴只以自己赴约；扶行囊拔刺是中性共同动作，拥抱须等下一场flag。|无独立CG|l18 `e39_ch03_s04_l18`|`{}`|
|ch03_s05_shishe|开场承接裴拥抱或分开站的两支；主体温夜间让坐垫，相邀未开始唱。|无独立CG|l1 `e39_ch03_s05_l1`；l32 `e39_ch03_s05_l32`|`{}`|
|ch03_s06_shuge|本场公务；l1记忆前夜合唱只在wen_ch03_sing，l2离开支不得套图。|无独立CG|l1 `e39_ch03_s06_l1`|`{}`|
|ch03_s07_yeting|宋／阿荻安排自己的生活，未出场伴侣不凭空画。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch03_s08_hanyuan|本场为公开双方已经办成与尚未办成的事，以有限人手选择补证取舍；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch03_s09_yuanye|私见不撤竞选；公共中性拣叶梗和双私约追问分开。|l43 `liqinghe_5_suanshenme`|l6 `e39_ch03_s09_l6`|`{}`|
|ch03_s09a_yuanye|独占只是主角意向，尚未告诉温；李今夜自己走，不能画和好。|无独立CG|l6 `e39_ch03_s09a_l6`|`{"flag.li_ch03_only_intent":true}`|
|ch03_s09b_yuanye|多约未告知，李不同行；中性分别。|无独立CG|l7 `e39_ch03_s09b_l7`|`{"flag.li_ch03_multi_told":true}`|
|ch03_s09c_yuanye|暂停私约，明日公事仍来；不吻不牵。|无独立CG|l5 `e39_ch03_s09c_l5`|`{"flag.li_ch03_private_paused":true}`|
|ch03_s10_nvguan|李只送到岔口不进观；许的茶边收脚是友谊，灯影空处单列。|无独立CG|l25 `e39_ch03_s10_l25`|`{}`|
|ch03_s11_hanyuan|本场为按三席具名理由得出实际授位结果，只有获授者可以亲口拒绝；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|l88 `wu_chaipai`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch03_s12_hanyuan|三条身份在此分：受位绯、辞受青、李获授主角仍青；仪式大袖不可借给约会。|l15 `wuze_shouwei`；l34 `wu_cishoudie`；l46 `wuze_juwei`；l52 `wu_yinshou`|l66 `e39_ch03_s12_l66`|`{}`|
|ch03_s13_yeting|阿荻收针包与宋的友谊／工作关系；不是主角约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch03_s14_shuge|交差中的沈私人回看受shen_ch03_sit／leave限制；不将回忆并坐当现在或消除拒绝。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch03_s15_yeting|归还署名休假朱绳，亲密欲望与边界并存；已有青版，补绯版，不留绑腕绳。|l79 `liuchenghuan_1_guihuan`|l78 `liuchenghuan_1_guihuan_fei`|`{}`|
|ch03_s16_shuge|本场为结清旧私人差务的授权，给往后的考察与闲处留出空白；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch03_s17_shuge|明确闲场，接雨失败→吻指背→覆手待雨三拍；身份分图，旧吻手原件夜色还需E40核。|l24 `shenheng_3_zhibei`|l8 `shenheng_7_jieyu`；l8 `shenheng_7_jieyu_fei`；l22 `shenheng_3_zhibei_fei`；l2 `e39_ch03_s17_l2`；l2 `e39_ch03_s17_l2_fei`；l30 `e39_ch03_s17_l30`；l30 `e39_ch03_s17_l30_fei`|`{"affinity.shenheng":{"gte":14},"flag.shen_meng_boundary":true}`|
|ch03_s18_yuanye|明确闲场，各坐一头→主动挪近→看树影，醒着不是睡对方腿上。|无独立CG|l21 `peizhaoye_8_shuying`；l21 `peizhaoye_8_shuying_fei`；l2 `e39_ch03_s18_l2`；l2 `e39_ch03_s18_l2_fei`|`{"affinity.peizhaoye":{"gte":14},"flag.pei_meng_no_troops":true}`|
|ch03_s19_shishe|明确闲场，共扇纸中性图青绯；原贴肩图青、绯变体仅拆身份不改场门槛。|l32 `wenqiao_3_tiejian`|l30 `e39_ch03_s19_l30`；l30 `e39_ch03_s19_l30_fei`；l31 `wenqiao_3_tiejian_fei`；l8 `e39_ch03_s19_l8`|`{"affinity.wenqiao":{"gte":14},"flag.wen_meng_no_praise":true}`|
|ch03_s20_yuanye|明确闲场，各拿果子全分支；吻图仅三项私约flag全false，两色另选。|l23 `liqinghe_3_xiangying`|l7 `e39_ch03_s20_l7`；l7 `e39_ch03_s20_l7_fei`；l21 `liqinghe_3_xiangying_fei`|`{"affinity.liqinghe":{"gte":14},"flag.li_meng_real_competition":true}`|
|ch03_s21_nvguan|白日内屋仍点小灯，许与主角找灯花的友谊闲场；月酒为旧景。|l22 `wu_yuejiu`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch03_s22_nvguan|教字成本与温抄纸回忆，单人本行，不是赴恋爱约。|l19 `wenqiao_1_chaozhi`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch03_s23_yeting|柳独处脚追方光，主角不在；新单人景，不塞主角或奉茶。|无独立CG|l4 `e39_ch03_s23_l4`|`{}`|
|ch03_s24_shuge|交接后的新议件，暮光木垫空镜；不把晴午垫案图借来。|无独立CG|l39 `e39_ch03_s24_l39`|`{}`|
|ch04_s01_zhaoyang|本场为在已定身份下，由她自己决定名字或领回私物；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch04_s02_hanyuan|本场为受理结契照料来件，并选择自己异议的存处；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|l40 `e39_ch04_s02_l40`|`{}`|
|ch04_s03_shuge|公事异议与焚毁选择，沈未交手，现有huian禁止火；非甜蜜私见。|l29 `wuze_huian`|见写景／私人补核表；未列新增不等于视觉已过|`{"flag.enthroned":true}`|
|ch04_s04_zhaoyang|本场为兑现原案存毁，使照料权不依赖一人代签；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|l2 `e39_ch04_s04_l2`|`{"flag.enthroned":true}`|
|ch04_s05_yeting|领款与宋自己的授权，未在场伴侣不由主角替签。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{"flag.enthroned":true}`|
|ch04_s05c_shuge|无可见台词的条件分发／选择节点，不生成虚构约会；入边出边保留。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch04_s05ca_shuge|明确说停沈私约，收回空笺，青绯分别。|无独立CG|l3 `e39_ch04_s05ca_l3`；l3 `e39_ch04_s05ca_l3_fei`|`{}`|
|ch04_s05cb_yuanye|明确说停裴私约，系行囊无并排空位，青绯分别。|无独立CG|l3 `e39_ch04_s05cb_l3`；l3 `e39_ch04_s05cb_l3_fei`|`{}`|
|ch04_s05cc_shishe|明确说停温私约，收谱不是等待挽回，青绯分别。|无独立CG|l5 `e39_ch04_s05cc_l5`；l5 `e39_ch04_s05cc_l5_fei`|`{}`|
|ch04_s05cd_yuanye|明确说停李私约，交公稿不是相邀，青绯分别。|无独立CG|l3 `e39_ch04_s05cd_l3`；l3 `e39_ch04_s05cd_l3_fei`|`{}`|
|ch04_s05m_shuge|无可见台词的条件分发／选择节点，不生成虚构约会；入边出边保留。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch04_s05p_shuge|本场为往后怎样见面；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch04_s05pe_shuge|本场为选定本轮意向后出门，三句只播在进入循环之前；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch04_s05q_shuge|无可见台词的条件分发／选择节点，不生成虚构约会；入边出边保留。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch04_s05qa_shuge|听沈答：only同意、open拒绝；同一中性按纸图可覆盖两支，已有青绯。|l6 `shenheng_6_dafu`；l19 `shenheng_6_dafu`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch04_s05qb_yuanye|听裴答，only／open均可同意但必须等她说完；已有中性青绯。|l6 `peizhaoye_6_dafu`；l21 `peizhaoye_6_dafu`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch04_s05qc_shishe|听温答，only／open两支保留，尚待答复时不预先靠肩；已有青绯。|l6 `wenqiao_6_dafu`；l20 `wenqiao_6_dafu`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch04_s05qd_yuanye|听李答，only同意／open拒绝；已有中性青绯，不能把拒绝图改成牵手。|l6 `liqinghe_6_dafu`；l17 `liqinghe_6_dafu`|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch04_s05r_shuge|本场为各自答过以后；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{}`|
|ch04_s05rl_yuanye|先问能否牵手，李伸手后才接；由原分支抵达，青绯。|无独立CG|l2 `e39_ch04_s05rl_l2`；l2 `e39_ch04_s05rl_l2_fei`|`{}`|
|ch04_s05z_yeting|受位多人顺序来访：沈笑谈、裴笑话、温合唱、李廊下牵手四段各自love条件，不能四人同屏合影。|无独立CG|l31 `e39_ch04_s05z_l31_fei`；l70 `e39_ch04_s05z_l70_fei`；l100 `e39_ch04_s05z_l100_fei`；l139 `e39_ch04_s05z_l139_fei`|`{"flag.enthroned":true}`|
|ch04_s06_zhaoyang|与太后同灯一夜是家庭／旧恐惧谈话，不是恋爱；夜单灯＋重阳旧景。|l28 `wu_zhuyu`|l2 `e39_ch04_s06_l2`|`{"flag.enthroned":true}`|
|ch04_s07_hanyuan|本场为把下一轮提名交多方或收在一人手里；未见独立赴约或亲密动作，不能因在场有恋爱对象就算约会。|无独立CG|l2 `e39_ch04_s07_l2`|`{"flag.enthroned":true}`|
|ch04_s08_shuge|非受位取存件，暂无约会达成；真私人段在08z，不将青换布衣。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{"flag.enthroned":false}`|
|ch04_s08z_shuge|非受位夜书阁：沈／裴／温三段love条件私见；李只领公稿，此场没有复制05z牵手。|无独立CG|l30 `e39_ch04_s08z_l30`；l64 `e39_ch04_s08z_l64`；l94 `e39_ch04_s08z_l94`|`{"flag.enthroned":false}`|
|ch04_s09_yuanye|李已受位、主角落选，政治反对照留；l12仍停阶下，中性图覆盖爱与不爱，不能喂饼。|无独立CG|l12 `e39_ch04_s09_l12`|`{"flag.liqinghe_won":true}`|
|ch04_s10_yuanye|宋先各吃各的离开；love.liqinghe=true之后李才来并坐吃饼，false独食不套双人。|无独立CG|l22 `e39_ch04_s10_l22`|`{"flag.enthroned":false}`|
|ch04_s11_nvguan|借屋付教习钱，女观药筛景，不把雇教当亲密。|无独立CG|l2 `e39_ch04_s11_l2`|`{"flag.liqinghe_won":true}`|
|ch04_s12_nvguan|落选开课线的实际午后，未铺满坐席；不擅画满堂学生。|无独立CG|l2 `e39_ch04_s12_l2`|`{"flag.ch04_school_contract":true}`|
|ch04_s13_nvguan|主角不在的宋与温合移纸架，劳动协作不是擅定两人恋爱。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{"flag.founded_school":true}`|
|ch04_s14_shuge|落选支核独立差程，裴不替主角求职；未出发仍在书阁。|无独立CG|见写景／私人补核表；未列新增不等于视觉已过|`{"flag.liqinghe_won":true}`|
|ch04_s15_yilu|出行起程湿泥；路费独立、裴队先走，不能画情侣同骑。|无独立CG|l2 `e39_ch04_s15_l2`|`{"flag.ch04_road_contract":true}`|
|ch04_s16_yilu|明确闲场，驿旁裴倒自己靴里的砂，主角看后推回，行装青；有明确独立归期。|无独立CG|l15 `peizhaoye_9_yipang`|`{"flag.road_agreement":true}`|
|ch04_s17_nvguan|唐离开后柳谈自己的杯／试牒／课／鞋等分支；不是又侍候主角；末段宋与温归还私页，不擅加主角。|无独立CG|l5 `e39_ch04_s17_l5`|`{}`|
|ch04_s18_wuzibei|与许看无印碑样，空白尺寸不是替众人宣布沉默，夜景单列。|无独立CG|l2 `e39_ch04_s18_l2`|`{}`|

## 5. 13明确闲场与40双人候选复核

### 13明确闲场

|场|实际动作与分支判断|已有精确画面或新图|
|---|---|---|
|ch01_s13_shuge|明确闲场，推冷茶杯；两杯无热气。|`shenheng_9_liangcha`；`e39_ch01_s13_l2`|
|ch01_s14_yuanye|明确闲场，解结后先问再握手；既有握手图留在同意之后。|`peizhaoye_3_woshou`（移至前一原句同拍并保留when）|
|ch01_s15_shishe|明确闲场，藏两张纸后互看；已有双人藏纸。|`wenqiao_1_cangzhi`（移至前一原句同拍并保留when）|
|ch01_s16_yuanye|明确闲场，投叶／递叶；捡叶与递叶分拍，酥山只在旧景。|`e39_ch01_s16_l2`|
|ch02_s15_shuge|明确闲场，认墨渍；不是字画鉴赏，墨斑不能生成真鱼。|`shenheng_8_mozi`|
|ch02_s16_yuanye|明确闲场，分饼脆角落掌；不是喂嘴。|`peizhaoye_7_baibing`|
|ch02_s17_shishe|明确闲场，竹窗影与获邀靠肩；袖上投影不变成印花。|`wenqiao_7_chuangying`；`e39_ch02_s17_l30`|
|ch02_s18_yuanye|明确闲场，绕低枝后各挪近；没有亲吻。|`liqinghe_7_dizhi`|
|ch03_s17_shuge|明确闲场，接雨失败→吻指背→覆手待雨三拍；身份分图，旧吻手原件夜色还需E40核。|`shenheng_7_jieyu`；`shenheng_7_jieyu_fei`；`shenheng_3_zhibei_fei`；`e39_ch03_s17_l2`；`e39_ch03_s17_l2_fei`；`e39_ch03_s17_l30`；`e39_ch03_s17_l30_fei`|
|ch03_s18_yuanye|明确闲场，各坐一头→主动挪近→看树影，醒着不是睡对方腿上。|`peizhaoye_8_shuying`；`peizhaoye_8_shuying_fei`；`e39_ch03_s18_l2`；`e39_ch03_s18_l2_fei`|
|ch03_s19_shishe|明确闲场，共扇纸中性图青绯；原贴肩图青、绯变体仅拆身份不改场门槛。|`e39_ch03_s19_l30`；`e39_ch03_s19_l30_fei`；`wenqiao_3_tiejian_fei`；`e39_ch03_s19_l8`|
|ch03_s20_yuanye|明确闲场，各拿果子全分支；吻图仅三项私约flag全false，两色另选。|`e39_ch03_s20_l7`；`e39_ch03_s20_l7_fei`；`liqinghe_3_xiangying_fei`|
|ch04_s16_yilu|明确闲场，驿旁裴倒自己靴里的砂，主角看后推回，行装青；有明确独立归期。|`peizhaoye_9_yipang`|

### 40候选（公务、邀请、亲密、暂停、说停分开）

|场|关系段／旧格原句锚|身份及关系条件|既有图覆盖／缺口处置|
|---|---|---|---|
|ch01_s04_shuge|公务争论后仍愿同坐；已有双人并坐可用，只贴真实坐下格。 l10「你低头看她的袖边，两张凳子间只剩一道窄缝。」|`{"require":{},"图格when":{"ch01_s04_shuge.l11":{}}}`；青绯按第2节|复用原中性双人；裁切／同拍尚待E40|
|ch01_s07_yuanye|赴园摸马与私人旧事；现有驯马为裴单人，补l20双人。 l20「你用掌根碰上它颈侧，短毛底下轻轻一颤。」|`{"require":{},"图格when":{"ch01_s07_yuanye.l18":{}}}`；青绯按第2节|新增：`e39_ch01_s07_l20`|
|ch01_s09_shuge|公事后侧室私见，递整稿、保留坐席；补中性双人。 l37「她这回把整页推过来，遮住那四字，只露自己的正文。」；l2「移到侧室，帘影把泥金书签遮成一条暗线。」|`{"require":{},"图格when":{}}`；青绯按第2节|新增：`e39_ch01_s09_l37`、`e39_ch01_s09_l2`|
|ch01_s11_shishe|共同抢纸＋署名与议价，带私人相识，抢纸和收湿纸不同拍。 l17「她一脚抵住门，腾出两手，和你抬过湿滑的门槛。」；l2「雨忽然砸在檐口，晾纸绳一抖，水沿着纸角往下淌。」；l34「收卷篮满了，旁边又添一只，雨水滴在空篮沿上。」；l73「檐外雨声薄下去，你们把湿纸挪到风能吹到的一层。」|`{"require":{},"图格when":{}}`；青绯按第2节|新增：`e39_ch01_s11_l17`、`e39_ch01_s11_l2`、`e39_ch01_s11_l34`、`e39_ch01_s11_l73`|
|ch01_s13_shuge|明确闲场，推冷茶杯；两杯无热气。 l22「沈衡手停在杯边，看了你一眼，才把杯子推过来。」；l2「檐下反光亮到书阁卷架半腰，两杯茶搁凉了，一点热气也没有。」|`{"require":{"affinity.shenheng":{"gte":4}},"图格when":{}}`；青绯按第2节|新增：`shenheng_9_liangcha`、`e39_ch01_s13_l2`|
|ch01_s14_yuanye|明确闲场，解结后先问再握手；既有握手图留在同意之后。 l24「你看她递来的手，指尖越过衣带，落在你掌中。」|`{"require":{"affinity.peizhaoye":{"gte":4}},"图格when":{"ch01_s14_yuanye.l25":{}}}`；青绯按第2节|复用原中性双人；裁切／同拍尚待E40|
|ch01_s15_shishe|明确闲场，藏两张纸后互看；已有双人藏纸。 l14「你看她藏纸的手停在背后，脸却还朝着你。」|`{"require":{},"图格when":{"ch01_s15_shishe.l15":{}}}`；青绯按第2节|复用原中性双人；裁切／同拍尚待E40|
|ch01_s16_yuanye|明确闲场，投叶／递叶；捡叶与递叶分拍，酥山只在旧景。 l2「苑墙上还留着半截日光，公主捡起一片卷边叶，站到影子外。」|`{"require":{"affinity.liqinghe":{"gte":4}},"图格when":{"ch01_s16_yuanye.l30":{},"ch01_s16_yuanye.l37":{}}}`；青绯按第2节|新增：`e39_ch01_s16_l2`|
|ch02_s04_shuge|核旧卷与私人邀约分开；l41尚未答应，不能画赴约后的贴靠。 l41「她取出一张窄笺，与待交的调卷回执并放。」|`{"require":{},"图格when":{}}`；青绯按第2节|新增：`e39_ch02_s04_l41`|
|ch02_s07_yuanye|合抬粮袋＋核欠办，身体协作不是亲密同意。 l22「她松开托底的手。重量沉下来，你们一同挪到檐下。」|`{"require":{},"图格when":{}}`；青绯按第2节|新增：`e39_ch02_s07_l22`|
|ch02_s09_shishe|等主角起句属双人读诗，既有dengju；先前拒邀不抹掉，图不能画亲吻。 l43「你看向温荞，她收住了声，嘴唇还张着，等你起句。」|`{"require":{},"图格when":{"ch02_s09_shishe.l44":{}}}`；青绯按第2节|复用原中性双人；裁切／同拍尚待E40|
|ch02_s15_shuge|明确闲场，认墨渍；不是字画鉴赏，墨斑不能生成真鱼。 l21「你张了张嘴，又闭上。她先笑出了声，手指还捏着袖角。」|`{"require":{"affinity.shenheng":{"gte":8},"flag.shen_joint_reading":true},"图格when":{}}`；青绯按第2节|新增：`shenheng_8_mozi`|
|ch02_s16_yuanye|明确闲场，分饼脆角落掌；不是喂嘴。 l22「她挑出自己手里那块的脆角，放到你掌心。」|`{"require":{"affinity.peizhaoye":{"gte":8},"flag.pei_shared_check":true},"图格when":{}}`；青绯按第2节|新增：`peizhaoye_7_baibing`|
|ch02_s17_shishe|明确闲场，竹窗影与获邀靠肩；袖上投影不变成印花。 l14「她拨开发尾，把肩侧让给你。你挪过去，额角贴上她的肩。」；l30「温荞放下抬着的手，仍让窗影留在袖上。」|`{"require":{"affinity.wenqiao":{"gte":8},"flag.wen_reader_help":true},"图格when":{}}`；青绯按第2节|新增：`wenqiao_7_chuangying`、`e39_ch02_s17_l30`|
|ch02_s18_yuanye|明确闲场，绕低枝后各挪近；没有亲吻。 l22「李令仪望了望两人之间，向你挪了一点。你也挪过去。」|`{"require":{"affinity.liqinghe":{"gte":8},"flag.liqinghe_cost_check":true},"图格when":{}}`；青绯按第2节|新增：`liqinghe_7_dizhi`|
|ch02_s24_shuge|公主交财政稿之后想留；l40仍没坐下，不能强行同坐；窗纸夜风另图。 l40「她移开袖边的稿，露出半张席，却没有径自坐下。」；l39「窗纸下沿开了一道细口，风翻起案边一角素笺。」|`{"require":{},"图格when":{}}`；青绯按第2节|新增：`e39_ch02_s24_l40`、`e39_ch02_s24_l39`|
|ch02_s26_shuge|受邀近坐与真实心动，随后保留自我取消的原话；非新增第五正式恋爱线。 l14「你把膝边的书往里挪。她坐过来，裙角铺到那一小块亮处。」|`{"require":{},"图格when":{}}`；青绯按第2节|新增：`liuchenghuan_2_jinzuo`|
|ch03_s02_shuge|撤差异议与愿相见并存；靠门空凳不等于主角已坐；已有rangzuo＋新增指边停手。 l22「你伸手扶住歪倒的牌。她也伸了手，停在你指边，没有覆上来。」|`{"require":{},"图格when":{"ch03_s02_shuge.l33":{}}}`；青绯按第2节|新增：`e39_ch03_s02_l22`|
|ch03_s04_yuanye|裴只以自己赴约；扶行囊拔刺是中性共同动作，拥抱须等下一场flag。 l18「你扶住行囊，让她空出两只手。那根刺落进泥里，比米粒长一点。」|`{"require":{},"图格when":{}}`；青绯按第2节|新增：`e39_ch03_s04_l18`|
|ch03_s05_shishe|开场承接裴拥抱或分开站的两支；主体温夜间让坐垫，相邀未开始唱。 l1「裴抱住你，等你松手才退开。走到诗社时，衣襟还留着她袍上的皂香。」；l32「她甩两下手。你用脚把靠窗的坐垫拨过来，挪到她那只旁边。」|`{"require":{},"图格when":{}}`；青绯按第2节|新增：`e39_ch03_s05_l1`、`e39_ch03_s05_l32`|
|ch03_s09_yuanye|私见不撤竞选；公共中性拣叶梗和双私约追问分开。 l6「你替她拣去一片带刺的叶梗。她抬脚，袍角被你抽出来半寸。」|`{"require":{},"图格when":{"ch03_s09_yuanye.l43":{"pact.liqinghe":"active","pact.wenqiao":"active"}}}`；青绯按第2节|新增：`e39_ch03_s09_l6`|
|ch03_s09a_yuanye|独占只是主角意向，尚未告诉温；李今夜自己走，不能画和好。 l6「她松开掌心，线圈压在手指上，没有再递过来。」|`{"require":{"flag.li_ch03_only_intent":true},"图格when":{}}`；青绯按第2节|新增：`e39_ch03_s09a_l6`|
|ch03_s09b_yuanye|多约未告知，李不同行；中性分别。 l7「她把松线放回袖里，站到石阶下。」|`{"require":{"flag.li_ch03_multi_told":true},"图格when":{}}`；青绯按第2节|新增：`e39_ch03_s09b_l7`|
|ch03_s09c_yuanye|暂停私约，明日公事仍来；不吻不牵。 l5「你把稿拿回自己怀里。她捡起外袍垂下的一角，往另一边走了。」|`{"require":{"flag.li_ch03_private_paused":true},"图格when":{}}`；青绯按第2节|新增：`e39_ch03_s09c_l5`|
|ch03_s15_yeting|归还署名休假朱绳，亲密欲望与边界并存；已有青版，补绯版，不留绑腕绳。 l78「你看柳承欢空下来的腕侧，弯着的手指已离开你的掌心。」|`{"require":{},"图格when":{"ch03_s15_yeting.l79":{"flag.enthroned":false}}}`；青绯按第2节|新增：`liuchenghuan_1_guihuan_fei`|
|ch03_s17_shuge|明确闲场，接雨失败→吻指背→覆手待雨三拍；身份分图，旧吻手原件夜色还需E40核。 l8「你照她指的地方伸手，一滴没接到。指背挨上窗框，沾了一条灰。」；l22「沈衡伸过手来。你用两只手拢住，低头贴了贴她的指背。」；l2「檐下一片瓦往外翘，雨从两边落。沈把凳子挪开，凳脚在地上留了两个湿印。」；l30「檐水接成了线。你们的手搁在膝间，等雨小下来才分开。」|`{"require":{"affinity.shenheng":{"gte":14},"flag.shen_meng_boundary":true},"图格when":{"ch03_s17_shuge.l24":{"flag.enthroned":false}}}`；青绯按第2节|新增：`shenheng_7_jieyu`、`shenheng_7_jieyu_fei`、`shenheng_3_zhibei_fei`、`e39_ch03_s17_l2`、`e39_ch03_s17_l2_fei`、`e39_ch03_s17_l30`、`e39_ch03_s17_l30_fei`|
|ch03_s18_yuanye|明确闲场，各坐一头→主动挪近→看树影，醒着不是睡对方腿上。 l21「你靠上树干，偏头看她。她没闭眼，也没问你看什么。」；l2「苑中树影盖住半条长凳。裴坐一头，你坐一头，中间落了两枚干果壳。」|`{"require":{"affinity.peizhaoye":{"gte":14},"flag.pei_meng_no_troops":true},"图格when":{}}`；青绯按第2节|新增：`peizhaoye_8_shuying`、`peizhaoye_8_shuying_fei`、`e39_ch03_s18_l2`、`e39_ch03_s18_l2_fei`|
|ch03_s19_shishe|明确闲场，共扇纸中性图青绯；原贴肩图青、绯变体仅拆身份不改场门槛。 l30「你替她撑开纸角，两人各捏一边，扇起一点风。」；l31「温荞挨过来，你看她低头合拢纸角，肩头贴着你的肩。」；l8「温挪到另一边，把半扇窗又推开一些。窗外的晾布鼓起，风没进来。」|`{"require":{"affinity.wenqiao":{"gte":14},"flag.wen_meng_no_praise":true},"图格when":{"ch03_s19_shishe.l32":{"flag.enthroned":false}}}`；青绯按第2节|新增：`e39_ch03_s19_l30`、`e39_ch03_s19_l30_fei`、`wenqiao_3_tiejian_fei`、`e39_ch03_s19_l8`|
|ch03_s20_yuanye|明确闲场，各拿果子全分支；吻图仅三项私约flag全false，两色另选。 l7「你挑了一只小的，咬到果肉才发现皮厚。李把自己那只转向另一面。」；l21「你放下手里的果，凑过去。她迎上来，唇贴住你的唇。」|`{"require":{"affinity.liqinghe":{"gte":14},"flag.li_meng_real_competition":true},"图格when":{"ch03_s20_yuanye.l23":{"flag.enthroned":false,"flag.li_ch03_only_intent":false,"flag.li_ch03_multi_told":false,"flag.li_ch03_private_paused":false}}}`；青绯按第2节|新增：`e39_ch03_s20_l7`、`e39_ch03_s20_l7_fei`、`liqinghe_3_xiangying_fei`|
|ch04_s05ca_shuge|明确说停沈私约，收回空笺，青绯分别。 l3「你接回没写字的纸，她把自己的笺叠好，没有替你收袖。」|`{"require":{},"图格when":{},"入边":[{"from":"ch04_s05c_shuge","id":"branches","require":{"pact.shenheng":{"in":["active","paused"]},"asked.shenheng":false},"effects":{}}]}`；青绯按第2节|新增：`e39_ch04_s05ca_l3`、`e39_ch04_s05ca_l3_fei`|
|ch04_s05cb_yuanye|明确说停裴私约，系行囊无并排空位，青绯分别。 l3「她系好行囊，没再给你空出并排的一边。」|`{"require":{},"图格when":{},"入边":[{"from":"ch04_s05c_shuge","id":"branches","require":{"pact.peizhaoye":{"in":["active","paused"]},"asked.peizhaoye":false},"effects":{}}]}`；青绯按第2节|新增：`e39_ch04_s05cb_l3`、`e39_ch04_s05cb_l3_fei`|
|ch04_s05cc_shishe|明确说停温私约，收谱不是等待挽回，青绯分别。 l5「你停住话。她卷起自己的谱纸，搁回筐里。」|`{"require":{},"图格when":{},"入边":[{"from":"ch04_s05c_shuge","id":"branches","require":{"pact.wenqiao":{"in":["active","paused"]},"asked.wenqiao":false},"effects":{}}]}`；青绯按第2节|新增：`e39_ch04_s05cc_l5`、`e39_ch04_s05cc_l5_fei`|
|ch04_s05cd_yuanye|明确说停李私约，交公稿不是相邀，青绯分别。 l3「你点头，她把卷送到你手里，没有扣下一页。」|`{"require":{},"图格when":{},"入边":[{"from":"ch04_s05c_shuge","id":"branches","require":{"pact.liqinghe":{"in":["active","paused"]},"asked.liqinghe":false},"effects":{}}]}`；青绯按第2节|新增：`e39_ch04_s05cd_l3`、`e39_ch04_s05cd_l3_fei`|
|ch04_s05qa_shuge|听沈答：only同意、open拒绝；同一中性按纸图可覆盖两支，已有青绯。 l5「你看沈衡的手，两只都按在空纸上，纸边没有卷起来。」；l18「你看她按着那张空纸，指尖停在原先朝向你的那一边。」|`{"require":{},"图格when":{"ch04_s05qa_shuge.l6":{"intent":"only"},"ch04_s05qa_shuge.l19":{"intent":"open"}},"入边":[{"from":"ch04_s05q_shuge","id":"branches","require":{"asked.shenheng":true,"pact.shenheng":"active","told.shenheng":false},"effects":{}}]}`；青绯按第2节|复用原中性双人；裁切／同拍尚待E40|
|ch04_s05qb_yuanye|听裴答，only／open均可同意但必须等她说完；已有中性青绯。 l5「你看她空下来的手，行囊带落在靴边，没有绕回腕上。」；l20「你看裴照夜站在面前，行囊在脚边，她的手没有伸向刀。」|`{"require":{},"图格when":{"ch04_s05qb_yuanye.l6":{"intent":"only"},"ch04_s05qb_yuanye.l21":{"intent":"open"}},"入边":[{"from":"ch04_s05q_shuge","id":"branches","require":{"asked.peizhaoye":true,"pact.peizhaoye":"active","told.peizhaoye":false},"effects":{}}]}`；青绯按第2节|复用原中性双人；裁切／同拍尚待E40|
|ch04_s05qc_shishe|听温答，only／open两支保留，尚待答复时不预先靠肩；已有青绯。 l5「你看温荞压住纸角，嘴角没有像往常那样先弯起来。」；l19「你看她的手掌压在纸上，折歪的那一角露在指缝外。」|`{"require":{},"图格when":{"ch04_s05qc_shishe.l6":{"intent":"only"},"ch04_s05qc_shishe.l20":{"intent":"open"}},"入边":[{"from":"ch04_s05q_shuge","id":"branches","require":{"asked.wenqiao":true,"pact.wenqiao":"active","told.wenqiao":false},"effects":{}}]}`；青绯按第2节|复用原中性双人；裁切／同拍尚待E40|
|ch04_s05qd_yuanye|听李答，only同意／open拒绝；已有中性青绯，不能把拒绝图改成牵手。 l5「你看李令仪空着的那只手，袖口垂下来，离你的手还有一截。」；l16「你看她站在自己的石阶上，稿留在手里，另一只手垂着。」|`{"require":{},"图格when":{"ch04_s05qd_yuanye.l6":{"intent":"only"},"ch04_s05qd_yuanye.l17":{"intent":"open"}},"入边":[{"from":"ch04_s05q_shuge","id":"branches","require":{"asked.liqinghe":true,"pact.liqinghe":"active","told.liqinghe":false},"effects":{}}]}`；青绯按第2节|复用原中性双人；裁切／同拍尚待E40|
|ch04_s05rl_yuanye|先问能否牵手，李伸手后才接；由原分支抵达，青绯。 l2「李令仪将稿换到外侧，伸过手。你接住，没有拉她转身。」|`{"require":{},"图格when":{},"入边":[{"from":"ch04_s05r_shuge","id":"branches","require":{"flag.liqinghe_won":true,"love.liqinghe":true},"effects":{}}]}`；青绯按第2节|新增：`e39_ch04_s05rl_l2`、`e39_ch04_s05rl_l2_fei`|
|ch04_s09_yuanye|李已受位、主角落选，政治反对照留；l12仍停阶下，中性图覆盖爱与不爱，不能喂饼。 l12「你在石阶下停住，她把卷放到另一侧。」|`{"require":{"flag.liqinghe_won":true},"图格when":{}}`；青绯按第2节|新增：`e39_ch04_s09_l12`|
|ch04_s16_yilu|明确闲场，驿旁裴倒自己靴里的砂，主角看后推回，行装青；有明确独立归期。 l15「你将原凭收好，裴把空靴口递过来，让你看那粒砂。」|`{"require":{"flag.road_agreement":true},"图格when":{}}`；青绯按第2节|新增：`peizhaoye_9_yipang`|

### 多人场内私人段（不由cast过滤）

|旧场／格|关系及条件|画面处置|
|---|---|---|
|ch01_s03_yeting/l61–82|阿荻／宋离开后许静和茶边哲思；友谊，不擅改恋爱。|不是新的甜蜜约会；无准确新图时维持舞台，不虚报CG覆盖；若要动作特写须另冻结|
|ch02_s13_hanyuan/l39–53|公务核抄转私人留身旁；shen_ch02_private_yes／wait／no只影响私话，图不示牵手。|新增`e39_ch02_s13_l39`@l39|
|ch02_s14_zhaoyang/l34–41|裴自己的半刻与挡风；复用已获准v1，原幞头小问题照D-200留账。|复用`peizhaoye_2_dangfeng`并保留原when|
|ch02_s22_shuge/l49–54|温邀请未答，不借待答纸图演已经相恋。|新增`e39_ch02_s22_l54`@l54|
|ch03_s03_yeting/l33–38|承欢温布巾／捧水，照料与劳动损失同时成立；不画俯首服侍。|不是新的甜蜜约会；无准确新图时维持舞台，不虚报CG覆盖；若要动作特写须另冻结|
|ch03_s05_shishe/l1–2|裴拥抱与陪站两支过渡；hug图只用于l1前半，转入诗社后恢复舞台。|新增`e39_ch03_s05_l1`@l1|
|ch03_s06_shuge/l1–2|温昨夜合唱仅sing=true；leave=true不出合唱图。|新增`e39_ch03_s06_l1`@l1|
|ch03_s14_shuge/l17–24|沈谈前次sit／leave；不是当下已经坐近，不拿旧夜坐图错贴现在。|不是新的甜蜜约会；无准确新图时维持舞台，不虚报CG覆盖；若要动作特写须另冻结|
|ch04_s05z_yeting/l22–31|沈love且原案未毁才笑谈；绯／掖庭傍晚。|新增`e39_ch04_s05z_l31_fei`@l31|
|ch04_s05z_yeting/l62–70|裴love后忘词陪笑；绯／掖庭翌日。|新增`e39_ch04_s05z_l70_fei`@l70|
|ch04_s05z_yeting/l94–103|温love后合唱；绯／掖庭。|新增`e39_ch04_s05z_l100_fei`@l100|
|ch04_s05z_yeting/l134–139|李love后廊下牵手；绯／掖庭，稿仍在她手。|新增`e39_ch04_s05z_l139_fei`@l139|
|ch04_s08z_shuge/l21–30|沈love且原案未毁；青／书阁夜。|新增`e39_ch04_s08z_l30`@l30|
|ch04_s08z_shuge/l56–64|裴love陪笑；青／书阁夜，不能用掖庭日光版。|新增`e39_ch04_s08z_l64`@l64|
|ch04_s08z_shuge/l88–97|温love合唱；青／书阁夜。|新增`e39_ch04_s08z_l94`@l94|
|ch04_s08z_shuge/l98–125|李只领稿、回应旧信，无新牵手段；不照抄05z。|不是新的甜蜜约会；无准确新图时维持舞台，不虚报CG覆盖；若要动作特写须另冻结|
|ch04_s10_yuanye/l18–28|love.liqinghe=true李才在宋走后进场；false主角独食。|新增`e39_ch04_s10_l22`@l22|
|ch04_s17_nvguan/l14–30|柳自己的去处／杯／纸／鞋有身份分支；不再端第二杯侍候主角。|不是新的甜蜜约会；无准确新图时维持舞台，不虚报CG覆盖；若要动作特写须另冻结|
|ch04_s17_nvguan/l31–45|宋与温归还私页，主角已出门，不推断二人恋爱。|不是新的甜蜜约会；无准确新图时维持舞台，不虚报CG覆盖；若要动作特写须另冻结|

## 6. 35写景候选逐条裁决

同拍是把image放在该原句行，不是下一次点击才出图。“动作中的景”也须看见其主体；“误命中”才可不新增。复用／裁切未测项不算已过。

|#|旧场／格／原句|判定|复用／裁切／新增与理由|
|---|---|---|---|
|1|ch01_s00_zhaoyang.l4「宫墙上沿积着薄霜，瓦沟里横着一片枯叶。」|真写景|新增：`e39_ch01_s00_l4`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|2|ch01_s01_zhaoyang.l38「帷幔外的甲煎气迟迟不散，沈衡把纸转向自己。」|动作中的景|新增：`e39_ch01_s01_l38`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|3|ch01_s11_shishe.l1「布包送往病舍时，你走到了诗社檐下。」|误命中|只是到诗社檐下的地点过渡；不独立生图，后l2雨纸才是实景。|
|4|ch01_s11_shishe.l2「雨忽然砸在檐口，晾纸绳一抖，水沿着纸角往下淌。」|真写景|新增：`e39_ch01_s11_l2`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|5|ch01_s11_shishe.l34「收卷篮满了，旁边又添一只，雨水滴在空篮沿上。」|真写景|新增：`e39_ch01_s11_l34`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|6|ch01_s11_shishe.l73「檐外雨声薄下去，你们把湿纸挪到风能吹到的一层。」|动作中的景|新增：`e39_ch01_s11_l73`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|7|ch01_s12_shuge.l16「檐水一滴一滴敲着石阶，封递用的油布已铺在唐简膝上。」|动作中的景|新增：`e39_ch01_s12_l16`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|8|ch01_s13_shuge.l1「你留在书阁，随沈衡坐到檐下。」|误命中|只是坐到檐下的地点／人物动作，无独立景物主体；l2冷茶专图。|
|9|ch01_s13_shuge.l2「檐下反光亮到书阁卷架半腰，两杯茶搁凉了，一点热气也没有。」|真写景|新增：`e39_ch01_s13_l2`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|10|ch01_s16_yuanye.l2「苑墙上还留着半截日光，公主捡起一片卷边叶，站到影子外。」|动作中的景|新增：`e39_ch01_s16_l2`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|11|ch01_s17_yeting.l2「天又落起细雨，宋蕙贞把半扇窗关上，留下案边一点亮光。」|动作中的景|新增：`e39_ch01_s17_l2`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|12|ch01_s17_yeting.l28「雨点从窗隙打进来，抄件一角慢慢洇湿。」|真写景|新增：`e39_ch01_s17_l28`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|13|ch01_s18_zhaoyang.l27「昭阳殿檐口还在滴雨，缺耳尖的马等着回厩，鼻息吹动湿鬃。」|真写景|新增：`e39_ch01_s18_l27`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|14|ch01_s18_zhaoyang.l50「门槛外的日光只剩窄窄一条，照着石面上的旧车辙。」|真写景|新增：`e39_ch01_s18_l50`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|15|ch02_s05_yeting.l2「帘下漏进一小块日光，正照着帕子翘起的角。」|真写景|新增：`e39_ch02_s05_l2`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|16|ch02_s07_yuanye.l22「她松开托底的手。重量沉下来，你们一同挪到檐下。」|动作中的景|新增：`e39_ch02_s07_l22`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|17|ch02_s11_hanyuan.l3「何太后冠上横梁掠过灯影，大袖垂在案侧，一只手扶着案沿。」|动作中的景|新增：`e39_ch02_s11_l3`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|18|ch02_s17_shishe.l30「温荞放下抬着的手，仍让窗影留在袖上。」|动作中的景|新增：`e39_ch02_s17_l30`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|19|ch03_s01_shuge.l37「旧景·上巳。水边一只柳圈搁在石上，细浪沾湿了梢头。」|真写景|新增：`wu_shangsi_liuquan`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|20|ch03_s08_hanyuan.l103「唐将本月余款与下月拟拨的两页分开，指尖压住月份。」|误命中|“本月／下月／月份”是财务时点，不是月色；不生成月景。|
|21|ch03_s10_nvguan.l25「许把碟子移远一些。你收回抵在门槛上的脚，灯影空出一小块。」|动作中的景|新增：`e39_ch03_s10_l25`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|22|ch03_s17_shuge.l1「差务单交清，你留在书阁陪沈衡听雨。」|动作中的景|听雨为场景引入；C52可与紧接l2雨檐子句同拍合格，使用l2图。不得换成女冠观。 对应 `e39_ch03_s17_l2`／`e39_ch03_s17_l2_fei`，不另生相同雨檐。|
|23|ch03_s17_shuge.l2「檐下一片瓦往外翘，雨从两边落。沈把凳子挪开，凳脚在地上留了两个湿印。」|动作中的景|新增：`e39_ch03_s17_l2`、`e39_ch03_s17_l2_fei`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|24|ch03_s17_shuge.l30「檐水接成了线。你们的手搁在膝间，等雨小下来才分开。」|动作中的景|新增：`e39_ch03_s17_l30`、`e39_ch03_s17_l30_fei`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|25|ch03_s18_yuanye.l2「苑中树影盖住半条长凳。裴坐一头，你坐一头，中间落了两枚干果壳。」|动作中的景|新增：`e39_ch03_s18_l2`、`e39_ch03_s18_l2_fei`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|26|ch03_s18_yuanye.l24「你不再装睡，陪她看树影移过靴尖。鸟又叫了，两人都没抬头。」|动作中的景|A的并坐图只可裁出树影及靴尖后复用；需E40核原件是否含双靴与移动树影，未测不得算过。 候选 `peizhaoye_8_shuying`／`peizhaoye_8_shuying_fei`；若原件未画到双靴，报缺口，不能用脸部冒充。|
|27|ch03_s21_nvguan.l21「旧景·八月望夜。月照着一盏酒、梨和葡萄，折好的信还没封。」|真写景|复用／裁切 `assets/cg/wu_yuejiu_v1.png` → `public/cg/wu_yuejiu.webp`。原件可见满月、酒盏、梨葡萄与未封信；四章需E40核一弯杯影裁切，旧景后恢复原舞台。|
|28|ch03_s24_shuge.l39「案脚一片薄木垫在砖缝上，暮光停在翘起的那一端。」|真写景|新增：`e39_ch03_s24_l39`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|29|ch04_s01_zhaoyang.l27「旧景·八月望夜。满月照进窗，案上酒盏投下一弯黑影。」|真写景|复用／裁切 `assets/cg/wu_yuejiu_v1.png` → `public/cg/wu_yuejiu.webp`。原件可见满月、酒盏、梨葡萄与未封信；四章需E40核一弯杯影裁切，旧景后恢复原舞台。|
|30|ch04_s02_hanyuan.l40「帷幔下摆离地半寸，光从底下穿过，落在空着的砖面上。」|真写景|新增：`e39_ch04_s02_l40`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|31|ch04_s04_zhaoyang.l2「次日帷幔已卷起，殿内残留熏香，门口的冷风吹不到案后。」|真写景|新增：`e39_ch04_s04_l2`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|32|ch04_s06_zhaoyang.l2「昭阳殿夜里只点一盏灯，灯油的气味留在垂下的帷幔内。」|真写景|新增：`e39_ch04_s06_l2`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|33|ch04_s12_nvguan.l2「午后日光越过门槛，屋里坐席没有铺满；新裁的纸边碰着你的腕。」|动作中的景|新增：`e39_ch04_s12_l2`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|34|ch04_s15_yilu.l2「天亮时驿路泥还湿，车辙压出细水，轮边的泥点溅到你的靴面。」|动作中的景|新增：`e39_ch04_s15_l2`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|
|35|ch04_s17_nvguan.l5「一个多月后，女观窗下晒着新洗的布，冷风带进院中煎药的气味。」|真写景|新增：`e39_ch04_s17_l5`。现有默认舞台没有证实包含此精确主体／动作，不能以同地点替代。|

### 补出的26条漏检／动作景

|旧场／格／原句|判定|处置及未决条件|
|---|---|---|
|ch01_s02_zhaoyang.l2「晨光只到昭阳殿最上一级阶，裴照夜站在阴处，绳没有绷紧。」|动作中的景|晨光只到殿最上阶，裴阴处松绳；默认殿景须E40核顶阶光/站位，暂无准确独立图，不记已覆盖。 |
|ch01_s04_shuge.l2「书阁灯火罩在卷架外，整排架脚没入暗处；沈衡将两卷纸隔开一掌。」|动作中的景|夜书阁罩灯与架脚暗部：既有bingzuo暗卷架可复用景部，但不得提前显示尚未坐近的人；裁切待E40。 |
|ch01_s05_yuanye.l2「苑墙挡住了北风，落叶晒出干草味，阿荻在树下仰着脸。」|真写景|墙挡北风与落叶；新增C只覆盖景物子句，阿荻仰脸句用舞台，C52拆句保持顺序。 新增`e39_ch01_s05_l2`|
|ch01_s06_yeting.l2「掖庭库门只进一线斜光，陈布味闷在门内，阿荻托了两次才抽出底包。」|动作中的景|库门一线斜光、底部布包；非恋爱，背景有无窄光与陈布待E40核，不用空院替代库内。 |
|ch01_s07_yuanye.l2「次日，园门边的积水映着晴光，那匹马正低头嗅草。」|真写景|园门积水映晴光、马嗅草；新l20图不适合提前摸马，旧单人xunma须核积水与动作后才可裁景复用。 |
|ch01_s09_shuge.l2「移到侧室，帘影把泥金书签遮成一条暗线。」|真写景|帘影与泥金书签，新增无人局部。 新增`e39_ch01_s09_l2`|
|ch02_s03_nvguan.l2「晨风把晾毯吹得贴上柱子。你伸手扯开。」|动作中的景|晨风晾毯贴柱，扯开手；新增C，不能借夜雨女观。 新增`e39_ch02_s03_l2`|
|ch02_s10_nvguan.l16「许拿起灯剪，剪下那一点焦黑。」|动作中的景|许剪灯花的实物动作，灯影不是月景；原stage需核剪灯花，未核不算过。 |
|ch02_s19_nvguan.l2「碟里三颗果子滚向低处，许用杯底抵住碟沿。」|动作中的景|三颗果滚向低处、杯抵碟；wu_lengtao画凉面，不覆盖眼前果碟。待补物件构图，未冻结新key。 |
|ch03_s08_hanyuan.l2「两张长案拼到一起，案脚高低不齐。唐垫进薄木片，水碗才不往一侧滑。」|动作中的景|两案高低不齐、唐垫木片；与后午光／暮光木片不同动作，不能提前放空镜。 |
|ch03_s12_hanyuan.l66「午光穿过殿门，照到那块垫案脚的薄木片。案上的水碗仍旧放得平。」|真写景|午光木片、水碗平，新增C，与暮光木垫分图。 新增`e39_ch03_s12_l66`|
|ch03_s15_yeting.l66「你把笔搁在桌中央。窗外有人晾布，竹竿擦过墙，响了一声。」|动作中的景|窗外晾布竹竿擦墙主要为声景；归还图只覆盖桌面，音景由CC1核，不能放女观布景冒充掖庭。 |
|ch03_s19_shishe.l8「温挪到另一边，把半扇窗又推开一些。窗外的晾布鼓起，风没进来。」|真写景|窗外晾布鼓起而屋内无风，新增C。 新增`e39_ch03_s19_l8`|
|ch03_s21_nvguan.l2「内屋白日也点着小灯。许拨下灯花，刚落进碟里，被袖口带到了桌沿。」|动作中的景|内屋白日也点小灯，拨下灯花被袖带走；不可用夜灯画面，待E40核近物景。 |
|ch03_s23_yeting.l4「光落到鞋尖上，缺了一角。她转过脚踝，又转回去。」|动作中的景|柳独处鞋追方光，新增单人C；不加主角。 新增`e39_ch03_s23_l4`|
|ch03_s24_shuge.l32「唐将砚盖揭开，墨面上浮着一丝窗光。门外有人走过，没有进来催。」|真写景|砚盖揭开墨面一丝窗光；暮光木垫不是砚面，暂无精确原图，待近物构图冻结。 |
|ch04_s05_yeting.l2「数日后，掖庭晾起洗过的布，湿气贴着廊柱。阿荻把钱一枚枚分开。」|动作中的景|掖庭晾洗布湿廊柱，阿荻数钱；与女观新洗布地点不同，不强行复用。 |
|ch04_s07_hanyuan.l2「早朝的风吹过龙尾道，殿门外两份荐牒用同一块石压着。」|真写景|门外两荐牒同石压，新增C。 新增`e39_ch04_s07_l2`|
|ch04_s08_shuge.l2「当晚书阁只点罩灯，冷风沿卷架底下走，唐把你的存件放在灯外。」|真写景|书阁夜罩灯，存件在灯外；夜书阁现有图可裁但须核冷暗架脚和纸所在，未核不算过。 |
|ch04_s10_yuanye.l2「暮色落尽，你带着入园前买的胡饼，油纸还暖，芝麻香从折口透出来。」|动作中的景|夜园暖胡饼油纸；l22只有love=true图，不能覆盖此处宋在场共段；普通舞台和饼近物待E40。 |
|ch04_s11_nvguan.l2「次日，女观窗下晾着药筛，晒干的草叶气味混进纸里。」|真写景|窗下药筛晒草叶，新增C。 新增`e39_ch04_s11_l2`|
|ch04_s12_nvguan.l25「阿荻把纸夹进针包，先出了门；其他人仍照自己的快慢写。」|动作中的景|阿荻先出门而其余人仍写：课堂人数与离开次序须保持，不画阿荻一直留到末尾。 |
|ch04_s13_nvguan.l2「学生走后，屋里只剩晒热的纸味，宋把一张席卷到一半。」|动作中的景|课后卷一半席与纸味，非恋爱；课堂底图须只留宋温，不能空景声称有卷席动作。 |
|ch04_s14_shuge.l2「书阁夜灯照着刚递来的差牒，窗下冷，裴把湿靴留在席外。」|动作中的景|夜书阁新差牒，裴湿靴在席外；不得提前换到旱驿路行装图。 |
|ch04_s15_yilu.l21「城的那一边，一座方形砖塔露在屋脊上。」|真写景|远方方形砖塔只露顶、路需绕行；现有qicheng图待核塔形与距离，不可用现代塔。 |
|ch04_s18_wuzibei.l2「夜里石旁没有印，灯照着一张空的碑样纸，纸角被风吹得贴上石面。」|真写景|夜石旁无印的空碑样，新增C，不用已刻碑结局。 新增`e39_ch04_s18_l2`|

### 9处显式空镜

|旧锚|原句|精确图／状态|
|---|---|---|
|ch01_s00_zhaoyang.l4|宫墙上沿积着薄霜，瓦沟里横着一片枯叶。|新增 `e39_ch01_s00_l4`|
|ch01_s02_zhaoyang.l43|旧景·上元。宫墙边的灯轮亮着，矮案上一盏小灯将熄。|复用`wu_denglun`，将次格CG移到本格image，去掉重复弹图；条件保留|
|ch01_s18_zhaoyang.l50|门槛外的日光只剩窄窄一条，照着石面上的旧车辙。|新增 `e39_ch01_s18_l50`|
|ch02_s12_yeting.l48|旧景·寒食。灶口封着泥，冷饼旁的粥面已凝住。|复用`wu_lengzao`，将次格CG移到本格image，去掉重复弹图；条件保留|
|ch02_s24_shuge.l39|窗纸下沿开了一道细口，风翻起案边一角素笺。|新增 `e39_ch02_s24_l39`|
|ch03_s01_shuge.l37|旧景·上巳。水边一只柳圈搁在石上，细浪沾湿了梢头。|新增 `wu_shangsi_liuquan`|
|ch03_s24_shuge.l39|案脚一片薄木垫在砖缝上，暮光停在翘起的那一端。|新增 `e39_ch03_s24_l39`|
|ch04_s01_zhaoyang.l27|旧景·八月望夜。满月照进窗，案上酒盏投下一弯黑影。|复用`wu_yuejiu`，杯影裁切待E40|
|ch04_s02_hanyuan.l40|帷幔下摆离地半寸，光从底下穿过，落在空着的砖面上。|新增 `e39_ch04_s02_l40`|

## 7. 既有图复用与三章亲密图专项

|图|原件观察／限制|本轮处置|
|---|---|---|
|shenheng_3_zhibei|青衣，双手拢沈手、唇贴指背、雨窗灰瓦；原件室外明亮，不能称已符合新的夜雨；膝手低位及边角旧书装订须整屏核。|A接雨两色先补公共场面；新增绯吻手版已冻结。旧青吻手的夜色／裁切交E40核，不因D-200小问题自行重生成或抹掉吻手格。未解决前此亲密拍仍标待E40。|
|wenqiao_3_tiejian|青衣肩贴、双手捏空纸，已有动作准确；膝部手靠低位。|青复用裁切，绯变体已冻结；原l31的青身份限定拆为两色对应，场affinity与wen_meng_no_praise保持。另有共同扇纸两色中性图，不以亲密图覆盖其它动作。|
|liqinghe_3_xiangying|青衣侧吻、四手、果碟白帕；两手接近底部对白区。|青裁切、绯变体；三项关系flag全false才可播；任何暂停／意向未说清支用各自果子图。|
|四张 *_6_dafu 及 *_fei|账本E38已有8张，等待答复的姿态，未提前牵手。|不重生；分别沿only/open原when，把旧前一句与图同拍，拒绝支也保持中性。|
|peizhaoye_2_dangfeng_v1|D-200已接受，软幞头问题是已记录小毛病；v2并非可替代合格版。|复用v1，禁止自动选编号最高的v2。|
|wu_yuejiu|目视有满月、酒盏、梨葡萄、未封空信；没有人物。|ch03-21/l21同拍取代l22，ch04-01/l27复用；杯影需最终裁切确认，不能以已看缩图充当运行验收。|

### 现有CG文件证据与同拍迁移候选

以下列出冻结JSON中全部独立CG落点；原件路径按既有版本登记／磁盘候选列，未目视的仍需E40。前一格仅是迁移候选，必须核其when与CG相交，并按C52原句映射。

|旧CG格|key／原件|上线目标|同拍候选原句格|必须保留的CG条件|
|---|---|---|---|---|
|ch01_s01_zhaoyang.l5|`shenheng_1_tengxie`；`assets/cg/shenheng_1_tengxie_v1.png`|`public/cg/shenheng_1_tengxie.webp`|ch01_s01_zhaoyang.l4：你看她持笔的手，笔尖低低悬着，袖里露出折过的草稿。|`{}`|
|ch01_s02_zhaoyang.l44|`wu_denglun`；`assets/cg/wu_denglun_v1.png`|`public/cg/wu_denglun.webp`|ch01_s02_zhaoyang.l43：旧景·上元。宫墙边的灯轮亮着，矮案上一盏小灯将熄。|`{}`|
|ch01_s03_yeting.l17|`adi_1_buxiu`；`assets/cg/adi_1_buxiu_v1.png`|`public/cg/adi_1_buxiu.webp`|ch01_s03_yeting.l16：你低头看阿荻的手，灯照着她的指节，针尖始终没朝向你。|`{}`|
|ch01_s04_shuge.l11|`shenheng_4_bingzuo`；`assets/cg/shenheng_4_bingzuo_v2.png`|`public/cg/shenheng_4_bingzuo.webp`|ch01_s04_shuge.l10：你低头看她的袖边，两张凳子间只剩一道窄缝。|`{}`|
|ch01_s07_yuanye.l18|`peizhaoye_1_xunma`；`assets/cg/peizhaoye_1_xunma_v2.png`|`public/cg/peizhaoye_1_xunma.webp`|ch01_s07_yuanye.l17：你望着裴照夜。她低头按着马颈，颊边被马鬃蹭着，也没躲。|`{}`|
|ch01_s08_shuge.l57|`liqinghe_1_boyi`；`assets/cg/liqinghe_1_boyi_v2.png`|`public/cg/liqinghe_1_boyi.webp`|ch01_s08_shuge.l56：你看她拢住紫色大袖，手掌压着册子，抬眼等你。|`{}`|
|ch01_s14_yuanye.l25|`peizhaoye_3_woshou`；`assets/cg/peizhaoye_3_woshou_v1.png`|`public/cg/peizhaoye_3_woshou.webp`|ch01_s14_yuanye.l24：你看她递来的手，指尖越过衣带，落在你掌中。|`{}`|
|ch01_s15_shishe.l15|`wenqiao_1_cangzhi`；`assets/cg/wenqiao_1_cangzhi_v2.png`|`public/cg/wenqiao_1_cangzhi.webp`|ch01_s15_shishe.l14：你看她藏纸的手停在背后，脸却还朝着你。|`{}`|
|ch01_s16_yuanye.l30|`liqinghe_2_diye`；`assets/cg/liqinghe_2_diye_v1.png`|`public/cg/liqinghe_2_diye.webp`|ch01_s16_yuanye.l29：你看她指间断了梗的叶子，手还停在你面前。|`{}`|
|ch01_s16_yuanye.l37|`wu_sushan`；`assets/cg/wu_sushan_v1.png`|`public/cg/wu_sushan.webp`|ch01_s16_yuanye.l36：旧景·夏日宫宴。食案上的酥山淌下一线水，花枝歪在碗沿。|`{}`|
|ch02_s09_shishe.l44|`wenqiao_2_dengju`；`assets/cg/wenqiao_2_dengju_v1.png`|`public/cg/wenqiao_2_dengju.webp`|ch02_s09_shishe.l43：你看向温荞，她收住了声，嘴唇还张着，等你起句。|`{}`|
|ch02_s12_yeting.l4|`songhuizhen_1_diwen`；`assets/cg/songhuizhen_1_diwen_v1.png`|`public/cg/songhuizhen_1_diwen.webp`|ch02_s12_yeting.l3：你看宋蕙贞把碗挪到席边，手指还扶着碗沿。|`{}`|
|ch02_s12_yeting.l49|`wu_lengzao`；`assets/cg/wu_lengzao_v1.png`|`public/cg/wu_lengzao.webp`|ch02_s12_yeting.l48：旧景·寒食。灶口封着泥，冷饼旁的粥面已凝住。|`{}`|
|ch02_s14_zhaoyang.l41|`peizhaoye_2_dangfeng`；`assets/cg/peizhaoye_2_dangfeng_v1.png`|`public/cg/peizhaoye_2_dangfeng.webp`|ch02_s14_zhaoyang.l40：你看她站到迎风处，袍角翻起，靴子仍停在你身侧。|`{}`|
|ch02_s19_nvguan.l21|`wu_lengtao`；`assets/cg/wu_lengtao_v1.png`|`public/cg/wu_lengtao.webp`|ch02_s19_nvguan.l20：旧景·夏日。井栏上搁着一碗槐叶冷淘，桶底的水滴在苔上。|`{}`|
|ch03_s02_shuge.l33|`shenheng_2_rangzuo`；`assets/cg/shenheng_2_rangzuo_v1.png`|`public/cg/shenheng_2_rangzuo.webp`|ch03_s02_shuge.l32：你看她在卷架边坐下，靠门那张凳子空着，凳脚朝着你。|`{}`|
|ch03_s09_yuanye.l43|`liqinghe_5_suanshenme`；`assets/cg/liqinghe_5_suanshenme_v1.png`|`public/cg/liqinghe_5_suanshenme.webp`|ch03_s09_yuanye.l42：你看她指上的松线，一圈贴着指节，外袍的袖子垂在肩旁。|`{"pact.liqinghe":"active","pact.wenqiao":"active"}`|
|ch03_s11_hanyuan.l88|`wu_chaipai`；`assets/cg/wu_chaipai_v1.png`|`public/cg/wu_chaipai.webp`|ch03_s11_hanyuan.l87：你解下候选差牌，反扣在漆匣口，看丝绦垂下。|`{"flag.ch03_evidence_majority":true}`|
|ch03_s12_hanyuan.l15|`wuze_shouwei`；`assets/cg/wuze_shouwei_v1.png`|`public/cg/wuze_shouwei.webp`|ch03_s12_hanyuan.l14：三日后，你站到新席前，低头看见绯衣垂在阶上。|`{"flag.ch03_accept_offer":true}`|
|ch03_s12_hanyuan.l34|`wu_cishoudie`；`assets/cg/wu_cishoudie_v1.png`|`public/cg/wu_cishoudie.webp`|ch03_s12_hanyuan.l33：你低头看辞受牒，折痕穿过末行，朱印压在纸角。|`{"flag.ch03_decline_offer":true}`|
|ch03_s12_hanyuan.l46|`wuze_juwei`；`assets/cg/wuze_juwei_v1.png`|`public/cg/wuze_juwei.webp`|ch03_s12_hanyuan.l45：唐核完目录，署下收讫。你解下候选差牌，看着它落进匣里。|`{"flag.ch03_decline_offer":true}`|
|ch03_s12_hanyuan.l52|`wu_yinshou`；`assets/cg/wu_yinshou_v1.png`|`public/cg/wu_yinshou.webp`|ch03_s12_hanyuan.l51：三日后的礼上，你望向漆盘，印绶还搁在盘中。|`{"flag.ch03_offer_li":true}`|
|ch03_s15_yeting.l79|`liuchenghuan_1_guihuan`；`assets/cg/liuchenghuan_1_guihuan_v1.png`|`public/cg/liuchenghuan_1_guihuan.webp`|ch03_s15_yeting.l78：你看柳承欢空下来的腕侧，弯着的手指已离开你的掌心。|`{"flag.enthroned":false}`|
|ch03_s17_shuge.l24|`shenheng_3_zhibei`；`assets/cg/shenheng_3_zhibei_v1.png`|`public/cg/shenheng_3_zhibei.webp`|ch03_s17_shuge.l23：你抬眼看沈衡，她低着头，指节还贴在你唇边。|`{"flag.enthroned":false}`|
|ch03_s19_shishe.l32|`wenqiao_3_tiejian`；`assets/cg/wenqiao_3_tiejian_v1.png`|`public/cg/wenqiao_3_tiejian.webp`|ch03_s19_shishe.l31：温荞挨过来，你看她低头合拢纸角，肩头贴着你的肩。|`{"flag.enthroned":false}`|
|ch03_s20_yuanye.l23|`liqinghe_3_xiangying`；`assets/cg/liqinghe_3_xiangying_v1.png`|`public/cg/liqinghe_3_xiangying.webp`|ch03_s20_yuanye.l22：你贴着她的唇，看见她颊边的碎发挨上了你的脸。|`{"flag.enthroned":false,"flag.li_ch03_only_intent":false,"flag.li_ch03_multi_told":false,"flag.li_ch03_private_paused":false}`|
|ch03_s21_nvguan.l22|`wu_yuejiu`；`assets/cg/wu_yuejiu_v1.png`|`public/cg/wu_yuejiu.webp`|ch03_s21_nvguan.l21：旧景·八月望夜。月照着一盏酒、梨和葡萄，折好的信还没封。|`{}`|
|ch03_s22_nvguan.l19|`wenqiao_1_chaozhi`；`assets/cg/wenqiao_1_chaozhi_v1.png`|`public/cg/wenqiao_1_chaozhi.webp`|ch03_s22_nvguan.l18：记忆里，温荞在纸槽前抬起竹帘，水从帘角滴下。|`{}`|
|ch04_s03_shuge.l29|`wuze_huian`；`assets/cg/wuze_huian_v1.png`|`public/cg/wuze_huian.webp`|ch04_s03_shuge.l28：你看沈衡按着那页纸，罩灯还在原处，门边露着唐的衣角。|`{}`|
|ch04_s05qa_shuge.l6|`shenheng_6_dafu`；`assets/cg/shenheng_6_dafu_v1.png`|`public/cg/shenheng_6_dafu.webp`|ch04_s05qa_shuge.l5：你看沈衡的手，两只都按在空纸上，纸边没有卷起来。|`{"intent":"only"}`|
|ch04_s05qa_shuge.l19|`shenheng_6_dafu`；`assets/cg/shenheng_6_dafu_v1.png`|`public/cg/shenheng_6_dafu.webp`|ch04_s05qa_shuge.l18：你看她按着那张空纸，指尖停在原先朝向你的那一边。|`{"intent":"open"}`|
|ch04_s05qb_yuanye.l6|`peizhaoye_6_dafu`；`assets/cg/peizhaoye_6_dafu_v1.png`|`public/cg/peizhaoye_6_dafu.webp`|ch04_s05qb_yuanye.l5：你看她空下来的手，行囊带落在靴边，没有绕回腕上。|`{"intent":"only"}`|
|ch04_s05qb_yuanye.l21|`peizhaoye_6_dafu`；`assets/cg/peizhaoye_6_dafu_v1.png`|`public/cg/peizhaoye_6_dafu.webp`|ch04_s05qb_yuanye.l20：你看裴照夜站在面前，行囊在脚边，她的手没有伸向刀。|`{"intent":"open"}`|
|ch04_s05qc_shishe.l6|`wenqiao_6_dafu`；`assets/cg/wenqiao_6_dafu_v1.png`|`public/cg/wenqiao_6_dafu.webp`|ch04_s05qc_shishe.l5：你看温荞压住纸角，嘴角没有像往常那样先弯起来。|`{"intent":"only"}`|
|ch04_s05qc_shishe.l20|`wenqiao_6_dafu`；`assets/cg/wenqiao_6_dafu_v1.png`|`public/cg/wenqiao_6_dafu.webp`|ch04_s05qc_shishe.l19：你看她的手掌压在纸上，折歪的那一角露在指缝外。|`{"intent":"open"}`|
|ch04_s05qd_yuanye.l6|`liqinghe_6_dafu`；`assets/cg/liqinghe_6_dafu_v1.png`|`public/cg/liqinghe_6_dafu.webp`|ch04_s05qd_yuanye.l5：你看李令仪空着的那只手，袖口垂下来，离你的手还有一截。|`{"intent":"only"}`|
|ch04_s05qd_yuanye.l17|`liqinghe_6_dafu`；`assets/cg/liqinghe_6_dafu_v1.png`|`public/cg/liqinghe_6_dafu.webp`|ch04_s05qd_yuanye.l16：你看她站在自己的石阶上，稿留在手里，另一只手垂着。|`{"intent":"open"}`|
|ch04_s06_zhaoyang.l28|`wu_zhuyu`；`assets/cg/wu_zhuyu_v1.png`|`public/cg/wu_zhuyu.webp`|ch04_s06_zhaoyang.l27：旧景·重阳。塔栏上的茱萸囊横在风里，菊花酒还未饮尽。|`{}`|


### 现有22张场景原件复核补记

已查看 `assets/scenes/*.png` 全部22张缩览（含旧苑野版本），以下是为什么不能只套同地点底图；这是静态对照，不代替原尺寸／手机验收。

|场景原件|可见主体|复用边界|
|---|---|---|
|`assets/scenes/shuge_ink_v1.png`|晴日纸窗、卷架、低案、空地|可作普通书阁；没有两人接雨、夜雨檐瓦、茶杯动作或破窗纸；新增动作与近物有必要。|
|`assets/scenes/shishe_ink_v1.png`|黄昏敞廊、晾纸、远水|没有雨幕湿纸、竹影落袖或半开后窗吹布；不能替代具体雨纸／双人动作。|
|`assets/scenes/yuanye_ink_qingguang_v1.png`、`yuanye_ink_v1.png`、`yuanye_ink_v2.png`|晴日／旧日／月夜苑外泥地、篱栏、柳树|晴版适合一般日间苑野；没有坐凳两端、果壳、并坐树干或低枝靠近，需动作图。|
|`assets/scenes/nvguan_ink_v1.png`、`nvguan_ink_kaike_v1.png`|白日女观空屋、架、低案与开课少量席|普通空间可复用；纸擦腕、筛中药叶和窗下新洗布的指定主体不清楚；近物图不能从空地裁出来。|
|`assets/scenes/nvguan_ink_yeyu_v1.png`|女观雨夜、小灯、门口湿地|可以核ch03-10的环境，不能冒充书阁夜雨；收脚／移碟仍需对应动作。|
|`assets/scenes/zhaoyang_gold_v1.png`|昭阳白日柱、侧帷、低案与空地|已进一步看原尺寸：为侧束长帷，不是原句“已卷起”。普通白日殿景可复用，指定卷帷近景仍按C生成。|
|`assets/scenes/zhaoyang_ink_yedeng_v1.png`|暗殿、蓝窗、局部案边暖光|已进一步看原尺寸：确有一盏油灯，但帷仍侧束，未构成垂帷内侧。指定单灯垂帷近景按C生成，旧底图保留夜殿常景。|
|`assets/scenes/hanyuan_gold_v1.png`、`hanyuan_gold_gongyi_v1.png`、`hanyuan_gold_shouwei_v1.png`|宽殿柱列、日光、各布置案席|无法靠空殿表达夜议私人留凳、帷下半寸缝光或垫案木片；不能以“有殿”判覆盖。|
|`assets/scenes/yilu_ink_qicheng_v1.png`、`yilu_ink_yipang_v1.png`|旱路、粮车／驿旁屋与柳荫|驿旁可作空间参考；启程原件干路无轮边湿泥水，不能覆盖ch04-15/l2。倒砂双人动作也不在底图中。|
|`assets/scenes/wuzibei_ink_v1.png`、`wuzibei_ink_beiyang_v1.png`|整碑远景、日／夜及灯|没有空白碑样纸贴石的近处主体，不能把整碑当纸样。|
|`assets/scenes/vista_ch1_v1.png`—`vista_ch4_v1.png`|章间城市／荒野／大殿／乡路远景|不是每格风物证据，不承担近物或私见覆盖。|

C43去重优先于“完成95张”的数量目标；**95是冻结候选key上限，A的12张仍为先行紧急批**。上述两张已在E39进一步看原尺寸，具体差异写在各行；无需等待E40再作生成前决定。未来若出现已准确的新原件，则记复用不重复出图。

## 8. 新图全量冻结登记表（CC1／C52／C43共用）

所有新图默认竖1024×1536。focus计划中心(50%,45%)不是实测，竖图可不登记focus；若工具返回横图由E40测定，不照抄计划。原件和上线目标均已在提示词列绝对路径。身体动作建议sfx=cloth_rustle；马图是否horse_bell由CC1与实物核对，不能马未戴铃就乱加铃声；beat=风物不加纸响。

|批/key|旧场格／原句|who / beat / 身份|原件 → 目标|原条件|
|---|---|---|---|---|
|A / `shenheng_7_jieyu`|ch03_s17_shuge.l8「你照她指的地方伸手，一滴没接到。指背挨上窗框，沾了一条灰。」|`["wuze","shenheng"]` / 关系 / 青|`assets/cg/shenheng_7_jieyu_v1.png` → `public/cg/shenheng_7_jieyu.webp`|场`{"affinity.shenheng":{"gte":14},"flag.shen_meng_boundary":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|A / `shenheng_7_jieyu_fei`|ch03_s17_shuge.l8「你照她指的地方伸手，一滴没接到。指背挨上窗框，沾了一条灰。」|`["wuze","shenheng"]` / 关系 / 绯|`assets/cg/shenheng_7_jieyu_fei_v1.png` → `public/cg/shenheng_7_jieyu_fei.webp`|场`{"affinity.shenheng":{"gte":14},"flag.shen_meng_boundary":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|A / `wu_shangsi_liuquan`|ch03_s01_shuge.l37「旧景·上巳。水边一只柳圈搁在石上，细浪沾湿了梢头。」|`[]` / 风物 / 无人|`assets/cg/wu_shangsi_liuquan_v1.png` → `public/cg/wu_shangsi_liuquan.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|A / `shenheng_8_mozi`|ch02_s15_shuge.l21「你张了张嘴，又闭上。她先笑出了声，手指还捏着袖角。」|`["wuze","shenheng"]` / 关系 / 青|`assets/cg/shenheng_8_mozi_v1.png` → `public/cg/shenheng_8_mozi.webp`|场`{"affinity.shenheng":{"gte":8},"flag.shen_joint_reading":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|A / `peizhaoye_7_baibing`|ch02_s16_yuanye.l22「她挑出自己手里那块的脆角，放到你掌心。」|`["wuze","peizhaoye"]` / 关系 / 青|`assets/cg/peizhaoye_7_baibing_v1.png` → `public/cg/peizhaoye_7_baibing.webp`|场`{"affinity.peizhaoye":{"gte":8},"flag.pei_shared_check":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|A / `wenqiao_7_chuangying`|ch02_s17_shishe.l14「她拨开发尾，把肩侧让给你。你挪过去，额角贴上她的肩。」|`["wuze","wenqiao"]` / 关系 / 青|`assets/cg/wenqiao_7_chuangying_v1.png` → `public/cg/wenqiao_7_chuangying.webp`|场`{"affinity.wenqiao":{"gte":8},"flag.wen_reader_help":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|A / `liqinghe_7_dizhi`|ch02_s18_yuanye.l22「李令仪望了望两人之间，向你挪了一点。你也挪过去。」|`["wuze","liqinghe"]` / 关系 / 青|`assets/cg/liqinghe_7_dizhi_v1.png` → `public/cg/liqinghe_7_dizhi.webp`|场`{"affinity.liqinghe":{"gte":8},"flag.liqinghe_cost_check":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|A / `shenheng_9_liangcha`|ch01_s13_shuge.l22「沈衡手停在杯边，看了你一眼，才把杯子推过来。」|`["wuze","shenheng"]` / 关系 / 青|`assets/cg/shenheng_9_liangcha_v1.png` → `public/cg/shenheng_9_liangcha.webp`|场`{"affinity.shenheng":{"gte":4}}`；格`{}`；选图条件见提示词，绯版只拆身份|
|A / `peizhaoye_8_shuying`|ch03_s18_yuanye.l21「你靠上树干，偏头看她。她没闭眼，也没问你看什么。」|`["wuze","peizhaoye"]` / 关系 / 青|`assets/cg/peizhaoye_8_shuying_v1.png` → `public/cg/peizhaoye_8_shuying.webp`|场`{"affinity.peizhaoye":{"gte":14},"flag.pei_meng_no_troops":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|A / `peizhaoye_8_shuying_fei`|ch03_s18_yuanye.l21「你靠上树干，偏头看她。她没闭眼，也没问你看什么。」|`["wuze","peizhaoye"]` / 关系 / 绯|`assets/cg/peizhaoye_8_shuying_fei_v1.png` → `public/cg/peizhaoye_8_shuying_fei.webp`|场`{"affinity.peizhaoye":{"gte":14},"flag.pei_meng_no_troops":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|A / `peizhaoye_9_yipang`|ch04_s16_yilu.l15「你将原凭收好，裴把空靴口递过来，让你看那粒砂。」|`["wuze","peizhaoye"]` / 关系 / 出行青|`assets/cg/peizhaoye_9_yipang_v1.png` → `public/cg/peizhaoye_9_yipang.webp`|场`{"flag.road_agreement":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|A / `liuchenghuan_2_jinzuo`|ch02_s26_shuge.l14「你把膝边的书往里挪。她坐过来，裙角铺到那一小块亮处。」|`["wuze","liuchenghuan"]` / 关系 / 青|`assets/cg/liuchenghuan_2_jinzuo_v1.png` → `public/cg/liuchenghuan_2_jinzuo.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch01_s07_l20`|ch01_s07_yuanye.l20「你用掌根碰上它颈侧，短毛底下轻轻一颤。」|`["wuze","peizhaoye"]` / 关系 / 青|`assets/cg/e39_ch01_s07_l20_v1.png` → `public/cg/e39_ch01_s07_l20.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch01_s09_l37`|ch01_s09_shuge.l37「她这回把整页推过来，遮住那四字，只露自己的正文。」|`["wuze","liqinghe"]` / 关系 / 青|`assets/cg/e39_ch01_s09_l37_v1.png` → `public/cg/e39_ch01_s09_l37.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch01_s11_l17`|ch01_s11_shishe.l17「她一脚抵住门，腾出两手，和你抬过湿滑的门槛。」|`["wuze","wenqiao"]` / 关系 / 青|`assets/cg/e39_ch01_s11_l17_v1.png` → `public/cg/e39_ch01_s11_l17.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch02_s04_l41`|ch02_s04_shuge.l41「她取出一张窄笺，与待交的调卷回执并放。」|`["wuze","shenheng"]` / 关系 / 青|`assets/cg/e39_ch02_s04_l41_v1.png` → `public/cg/e39_ch02_s04_l41.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch02_s07_l22`|ch02_s07_yuanye.l22「她松开托底的手。重量沉下来，你们一同挪到檐下。」|`["wuze","peizhaoye"]` / 关系 / 青|`assets/cg/e39_ch02_s07_l22_v1.png` → `public/cg/e39_ch02_s07_l22.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch02_s13_l39`|ch02_s13_hanyuan.l39「众人转去核议抄。你把挡路的矮凳移开，留在她身旁。」|`["wuze","shenheng"]` / 关系 / 青|`assets/cg/e39_ch02_s13_l39_v1.png` → `public/cg/e39_ch02_s13_l39.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch02_s22_l54`|ch02_s22_shuge.l54「她抱起最后一摞纸，留下门边一人宽的空处。」|`["wuze","wenqiao"]` / 关系 / 青|`assets/cg/e39_ch02_s22_l54_v1.png` → `public/cg/e39_ch02_s22_l54.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch02_s24_l40`|ch02_s24_shuge.l40「她移开袖边的稿，露出半张席，却没有径自坐下。」|`["wuze","liqinghe"]` / 关系 / 青|`assets/cg/e39_ch02_s24_l40_v1.png` → `public/cg/e39_ch02_s24_l40.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch03_s02_l22`|ch03_s02_shuge.l22「你伸手扶住歪倒的牌。她也伸了手，停在你指边，没有覆上来。」|`["wuze","shenheng"]` / 关系 / 青|`assets/cg/e39_ch03_s02_l22_v1.png` → `public/cg/e39_ch03_s02_l22.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch03_s04_l18`|ch03_s04_yuanye.l18「你扶住行囊，让她空出两只手。那根刺落进泥里，比米粒长一点。」|`["wuze","peizhaoye"]` / 关系 / 青|`assets/cg/e39_ch03_s04_l18_v1.png` → `public/cg/e39_ch03_s04_l18.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch03_s05_l1`|ch03_s05_shishe.l1「裴抱住你，等你松手才退开。走到诗社时，衣襟还留着她袍上的皂香。」|`["wuze","peizhaoye"]` / 亲密 / 青|`assets/cg/e39_ch03_s05_l1_v1.png` → `public/cg/e39_ch03_s05_l1.webp`|场`{}`；格`{"flag.pei_ch03_hug":true}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch03_s05_l32`|ch03_s05_shishe.l32「她甩两下手。你用脚把靠窗的坐垫拨过来，挪到她那只旁边。」|`["wuze","wenqiao"]` / 关系 / 青|`assets/cg/e39_ch03_s05_l32_v1.png` → `public/cg/e39_ch03_s05_l32.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch03_s06_l1`|ch03_s06_shuge.l1「昨夜你错入了一拍，温跟着错了半句。到第三遍，你们才一同收住尾音。」|`["wuze","wenqiao"]` / 关系 / 青|`assets/cg/e39_ch03_s06_l1_v1.png` → `public/cg/e39_ch03_s06_l1.webp`|场`{}`；格`{"flag.wen_ch03_sing":true}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch03_s09_l6`|ch03_s09_yuanye.l6「你替她拣去一片带刺的叶梗。她抬脚，袍角被你抽出来半寸。」|`["wuze","liqinghe"]` / 关系 / 青|`assets/cg/e39_ch03_s09_l6_v1.png` → `public/cg/e39_ch03_s09_l6.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch03_s09a_l6`|ch03_s09a_yuanye.l6「她松开掌心，线圈压在手指上，没有再递过来。」|`["wuze","liqinghe"]` / 关系 / 青|`assets/cg/e39_ch03_s09a_l6_v1.png` → `public/cg/e39_ch03_s09a_l6.webp`|场`{"flag.li_ch03_only_intent":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch03_s09b_l7`|ch03_s09b_yuanye.l7「她把松线放回袖里，站到石阶下。」|`["wuze","liqinghe"]` / 关系 / 青|`assets/cg/e39_ch03_s09b_l7_v1.png` → `public/cg/e39_ch03_s09b_l7.webp`|场`{"flag.li_ch03_multi_told":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch03_s09c_l5`|ch03_s09c_yuanye.l5「你把稿拿回自己怀里。她捡起外袍垂下的一角，往另一边走了。」|`["wuze","liqinghe"]` / 关系 / 青|`assets/cg/e39_ch03_s09c_l5_v1.png` → `public/cg/e39_ch03_s09c_l5.webp`|场`{"flag.li_ch03_private_paused":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `liuchenghuan_1_guihuan_fei`|ch03_s15_yeting.l78「你看柳承欢空下来的腕侧，弯着的手指已离开你的掌心。」|`["wuze","liuchenghuan"]` / 转变 / 绯|`assets/cg/liuchenghuan_1_guihuan_fei_v1.png` → `public/cg/liuchenghuan_1_guihuan_fei.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch03_s19_l30`|ch03_s19_shishe.l30「你替她撑开纸角，两人各捏一边，扇起一点风。」|`["wuze","wenqiao"]` / 关系 / 青|`assets/cg/e39_ch03_s19_l30_v1.png` → `public/cg/e39_ch03_s19_l30.webp`|场`{"affinity.wenqiao":{"gte":14},"flag.wen_meng_no_praise":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch03_s19_l30_fei`|ch03_s19_shishe.l30「你替她撑开纸角，两人各捏一边，扇起一点风。」|`["wuze","wenqiao"]` / 关系 / 绯|`assets/cg/e39_ch03_s19_l30_fei_v1.png` → `public/cg/e39_ch03_s19_l30_fei.webp`|场`{"affinity.wenqiao":{"gte":14},"flag.wen_meng_no_praise":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch03_s20_l7`|ch03_s20_yuanye.l7「你挑了一只小的，咬到果肉才发现皮厚。李把自己那只转向另一面。」|`["wuze","liqinghe"]` / 关系 / 青|`assets/cg/e39_ch03_s20_l7_v1.png` → `public/cg/e39_ch03_s20_l7.webp`|场`{"affinity.liqinghe":{"gte":14},"flag.li_meng_real_competition":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch03_s20_l7_fei`|ch03_s20_yuanye.l7「你挑了一只小的，咬到果肉才发现皮厚。李把自己那只转向另一面。」|`["wuze","liqinghe"]` / 关系 / 绯|`assets/cg/e39_ch03_s20_l7_fei_v1.png` → `public/cg/e39_ch03_s20_l7_fei.webp`|场`{"affinity.liqinghe":{"gte":14},"flag.li_meng_real_competition":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `shenheng_3_zhibei_fei`|ch03_s17_shuge.l22「沈衡伸过手来。你用两只手拢住，低头贴了贴她的指背。」|`["wuze","shenheng"]` / 亲密 / 绯|`assets/cg/shenheng_3_zhibei_fei_v1.png` → `public/cg/shenheng_3_zhibei_fei.webp`|场`{"affinity.shenheng":{"gte":14},"flag.shen_meng_boundary":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `liqinghe_3_xiangying_fei`|ch03_s20_yuanye.l21「你放下手里的果，凑过去。她迎上来，唇贴住你的唇。」|`["wuze","liqinghe"]` / 亲密 / 绯|`assets/cg/liqinghe_3_xiangying_fei_v1.png` → `public/cg/liqinghe_3_xiangying_fei.webp`|场`{"affinity.liqinghe":{"gte":14},"flag.li_meng_real_competition":true}`；格`{"flag.li_ch03_only_intent":false,"flag.li_ch03_multi_told":false,"flag.li_ch03_private_paused":false}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s05ca_l3`|ch04_s05ca_shuge.l3「你接回没写字的纸，她把自己的笺叠好，没有替你收袖。」|`["wuze","shenheng"]` / 转变 / 青|`assets/cg/e39_ch04_s05ca_l3_v1.png` → `public/cg/e39_ch04_s05ca_l3.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s05ca_l3_fei`|ch04_s05ca_shuge.l3「你接回没写字的纸，她把自己的笺叠好，没有替你收袖。」|`["wuze","shenheng"]` / 转变 / 绯|`assets/cg/e39_ch04_s05ca_l3_fei_v1.png` → `public/cg/e39_ch04_s05ca_l3_fei.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s05cb_l3`|ch04_s05cb_yuanye.l3「她系好行囊，没再给你空出并排的一边。」|`["wuze","peizhaoye"]` / 转变 / 青|`assets/cg/e39_ch04_s05cb_l3_v1.png` → `public/cg/e39_ch04_s05cb_l3.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s05cb_l3_fei`|ch04_s05cb_yuanye.l3「她系好行囊，没再给你空出并排的一边。」|`["wuze","peizhaoye"]` / 转变 / 绯|`assets/cg/e39_ch04_s05cb_l3_fei_v1.png` → `public/cg/e39_ch04_s05cb_l3_fei.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s05cc_l5`|ch04_s05cc_shishe.l5「你停住话。她卷起自己的谱纸，搁回筐里。」|`["wuze","wenqiao"]` / 转变 / 青|`assets/cg/e39_ch04_s05cc_l5_v1.png` → `public/cg/e39_ch04_s05cc_l5.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s05cc_l5_fei`|ch04_s05cc_shishe.l5「你停住话。她卷起自己的谱纸，搁回筐里。」|`["wuze","wenqiao"]` / 转变 / 绯|`assets/cg/e39_ch04_s05cc_l5_fei_v1.png` → `public/cg/e39_ch04_s05cc_l5_fei.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s05cd_l3`|ch04_s05cd_yuanye.l3「你点头，她把卷送到你手里，没有扣下一页。」|`["wuze","liqinghe"]` / 转变 / 青|`assets/cg/e39_ch04_s05cd_l3_v1.png` → `public/cg/e39_ch04_s05cd_l3.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s05cd_l3_fei`|ch04_s05cd_yuanye.l3「你点头，她把卷送到你手里，没有扣下一页。」|`["wuze","liqinghe"]` / 转变 / 绯|`assets/cg/e39_ch04_s05cd_l3_fei_v1.png` → `public/cg/e39_ch04_s05cd_l3_fei.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s05rl_l2`|ch04_s05rl_yuanye.l2「李令仪将稿换到外侧，伸过手。你接住，没有拉她转身。」|`["wuze","liqinghe"]` / 亲密 / 青|`assets/cg/e39_ch04_s05rl_l2_v1.png` → `public/cg/e39_ch04_s05rl_l2.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s05rl_l2_fei`|ch04_s05rl_yuanye.l2「李令仪将稿换到外侧，伸过手。你接住，没有拉她转身。」|`["wuze","liqinghe"]` / 亲密 / 绯|`assets/cg/e39_ch04_s05rl_l2_fei_v1.png` → `public/cg/e39_ch04_s05rl_l2_fei.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s05z_l31_fei`|ch04_s05z_yeting.l31「她偏过脸，没绷住。你陪她笑了一会儿，才把卷拿稳。」|`["wuze","shenheng"]` / 关系 / 绯|`assets/cg/e39_ch04_s05z_l31_fei_v1.png` → `public/cg/e39_ch04_s05z_l31_fei.webp`|场`{"flag.enthroned":true}`；格`{"love.shenheng":true,"flag.ch04_originals_destroyed":false}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s08z_l30`|ch04_s08z_shuge.l30「她偏过脸，没绷住。你陪她笑了一会儿，才把卷拿稳。」|`["wuze","shenheng"]` / 关系 / 青|`assets/cg/e39_ch04_s08z_l30_v1.png` → `public/cg/e39_ch04_s08z_l30.webp`|场`{"flag.enthroned":false}`；格`{"love.shenheng":true,"flag.ch04_originals_destroyed":false}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s05z_l70_fei`|ch04_s05z_yeting.l70「你越想越笑，没说成。裴陪你坐了一会儿，才起身。」|`["wuze","peizhaoye"]` / 关系 / 绯|`assets/cg/e39_ch04_s05z_l70_fei_v1.png` → `public/cg/e39_ch04_s05z_l70_fei.webp`|场`{"flag.enthroned":true}`；格`{"love.peizhaoye":true}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s08z_l64`|ch04_s08z_shuge.l64「你越想越笑，没说成。裴陪你坐了一会儿，才起身。」|`["wuze","peizhaoye"]` / 关系 / 青|`assets/cg/e39_ch04_s08z_l64_v1.png` → `public/cg/e39_ch04_s08z_l64.webp`|场`{"flag.enthroned":false}`；格`{"love.peizhaoye":true}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s05z_l100_fei`|ch04_s05z_yeting.l100「温荞从头哼起。你跟进去，又差半拍，她拖住尾音等你。」|`["wuze","wenqiao"]` / 关系 / 绯|`assets/cg/e39_ch04_s05z_l100_fei_v1.png` → `public/cg/e39_ch04_s05z_l100_fei.webp`|场`{"flag.enthroned":true}`；格`{"love.wenqiao":true}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s08z_l94`|ch04_s08z_shuge.l94「温荞从头哼起。你跟进去，又差半拍，她拖住尾音等你。」|`["wuze","wenqiao"]` / 关系 / 青|`assets/cg/e39_ch04_s08z_l94_v1.png` → `public/cg/e39_ch04_s08z_l94.webp`|场`{"flag.enthroned":false}`；格`{"love.wenqiao":true}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s05z_l139_fei`|ch04_s05z_yeting.l139「她把卷移到外侧，你们沿廊走了一小段，才松手各回。」|`["wuze","liqinghe"]` / 关系 / 绯|`assets/cg/e39_ch04_s05z_l139_fei_v1.png` → `public/cg/e39_ch04_s05z_l139_fei.webp`|场`{"flag.enthroned":true}`；格`{"love.liqinghe":true}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s09_l12`|ch04_s09_yuanye.l12「你在石阶下停住，她把卷放到另一侧。」|`["wuze","liqinghe"]` / 关系 / 青|`assets/cg/e39_ch04_s09_l12_v1.png` → `public/cg/e39_ch04_s09_l12.webp`|场`{"flag.liqinghe_won":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|B / `e39_ch04_s10_l22`|ch04_s10_yuanye.l22「你看她掰饼，袖口总往下滑，她索性挽起一折。」|`["wuze","liqinghe"]` / 关系 / 青|`assets/cg/e39_ch04_s10_l22_v1.png` → `public/cg/e39_ch04_s10_l22.webp`|场`{"flag.enthroned":false}`；格`{"love.liqinghe":true}`；选图条件见提示词，绯版只拆身份|
|B / `wenqiao_3_tiejian_fei`|ch03_s19_shishe.l31「温荞挨过来，你看她低头合拢纸角，肩头贴着你的肩。」|`["wuze","wenqiao"]` / 亲密 / 绯|`assets/cg/wenqiao_3_tiejian_fei_v1.png` → `public/cg/wenqiao_3_tiejian_fei.webp`|场`{"affinity.wenqiao":{"gte":14},"flag.wen_meng_no_praise":true}`；格`{"flag.enthroned":false}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch01_s00_l4`|ch01_s00_zhaoyang.l4「宫墙上沿积着薄霜，瓦沟里横着一片枯叶。」|`[]` / 风物 / 无人|`assets/cg/e39_ch01_s00_l4_v1.png` → `public/cg/e39_ch01_s00_l4.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch01_s01_l38`|ch01_s01_zhaoyang.l38「帷幔外的甲煎气迟迟不散，沈衡把纸转向自己。」|`["shenheng"]` / 本行 / 同伴|`assets/cg/e39_ch01_s01_l38_v1.png` → `public/cg/e39_ch01_s01_l38.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch01_s11_l2`|ch01_s11_shishe.l2「雨忽然砸在檐口，晾纸绳一抖，水沿着纸角往下淌。」|`[]` / 风物 / 无人|`assets/cg/e39_ch01_s11_l2_v1.png` → `public/cg/e39_ch01_s11_l2.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch01_s11_l34`|ch01_s11_shishe.l34「收卷篮满了，旁边又添一只，雨水滴在空篮沿上。」|`[]` / 风物 / 无人|`assets/cg/e39_ch01_s11_l34_v1.png` → `public/cg/e39_ch01_s11_l34.webp`|场`{}`；格`{"flag.self_submit_window":true}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch01_s11_l73`|ch01_s11_shishe.l73「檐外雨声薄下去，你们把湿纸挪到风能吹到的一层。」|`["wuze","wenqiao"]` / 本行 / 青|`assets/cg/e39_ch01_s11_l73_v1.png` → `public/cg/e39_ch01_s11_l73.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch01_s12_l16`|ch01_s12_shuge.l16「檐水一滴一滴敲着石阶，封递用的油布已铺在唐简膝上。」|`["tangjian"]` / 本行 / 同伴|`assets/cg/e39_ch01_s12_l16_v1.png` → `public/cg/e39_ch01_s12_l16.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch01_s13_l2`|ch01_s13_shuge.l2「檐下反光亮到书阁卷架半腰，两杯茶搁凉了，一点热气也没有。」|`[]` / 风物 / 无人|`assets/cg/e39_ch01_s13_l2_v1.png` → `public/cg/e39_ch01_s13_l2.webp`|场`{"affinity.shenheng":{"gte":4}}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch01_s16_l2`|ch01_s16_yuanye.l2「苑墙上还留着半截日光，公主捡起一片卷边叶，站到影子外。」|`["liqinghe"]` / 风物 / 同伴|`assets/cg/e39_ch01_s16_l2_v1.png` → `public/cg/e39_ch01_s16_l2.webp`|场`{"affinity.liqinghe":{"gte":4}}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch01_s17_l2`|ch01_s17_yeting.l2「天又落起细雨，宋蕙贞把半扇窗关上，留下案边一点亮光。」|`["songhuizhen"]` / 本行 / 同伴|`assets/cg/e39_ch01_s17_l2_v1.png` → `public/cg/e39_ch01_s17_l2.webp`|场`{"flag.petition_sent":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch01_s17_l28`|ch01_s17_yeting.l28「雨点从窗隙打进来，抄件一角慢慢洇湿。」|`[]` / 风物 / 无人|`assets/cg/e39_ch01_s17_l28_v1.png` → `public/cg/e39_ch01_s17_l28.webp`|场`{"flag.petition_sent":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch01_s18_l27`|ch01_s18_zhaoyang.l27「昭阳殿檐口还在滴雨，缺耳尖的马等着回厩，鼻息吹动湿鬃。」|`[]` / 风物 / 无人|`assets/cg/e39_ch01_s18_l27_v1.png` → `public/cg/e39_ch01_s18_l27.webp`|场`{"flag.petition_sent":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch01_s18_l50`|ch01_s18_zhaoyang.l50「门槛外的日光只剩窄窄一条，照着石面上的旧车辙。」|`[]` / 风物 / 无人|`assets/cg/e39_ch01_s18_l50_v1.png` → `public/cg/e39_ch01_s18_l50.webp`|场`{"flag.petition_sent":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch02_s05_l2`|ch02_s05_yeting.l2「帘下漏进一小块日光，正照着帕子翘起的角。」|`[]` / 风物 / 无人|`assets/cg/e39_ch02_s05_l2_v1.png` → `public/cg/e39_ch02_s05_l2.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch02_s11_l3`|ch02_s11_hanyuan.l3「何太后冠上横梁掠过灯影，大袖垂在案侧，一只手扶着案沿。」|`["hetaihou"]` / 本行 / 同伴|`assets/cg/e39_ch02_s11_l3_v1.png` → `public/cg/e39_ch02_s11_l3.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch02_s17_l30`|ch02_s17_shishe.l30「温荞放下抬着的手，仍让窗影留在袖上。」|`["wenqiao"]` / 风物 / 同伴|`assets/cg/e39_ch02_s17_l30_v1.png` → `public/cg/e39_ch02_s17_l30.webp`|场`{"affinity.wenqiao":{"gte":8},"flag.wen_reader_help":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch02_s24_l39`|ch02_s24_shuge.l39「窗纸下沿开了一道细口，风翻起案边一角素笺。」|`[]` / 风物 / 无人|`assets/cg/e39_ch02_s24_l39_v1.png` → `public/cg/e39_ch02_s24_l39.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch03_s10_l25`|ch03_s10_nvguan.l25「许把碟子移远一些。你收回抵在门槛上的脚，灯影空出一小块。」|`["wuze","xujinghe"]` / 风物 / 青|`assets/cg/e39_ch03_s10_l25_v1.png` → `public/cg/e39_ch03_s10_l25.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch03_s17_l2`|ch03_s17_shuge.l2「檐下一片瓦往外翘，雨从两边落。沈把凳子挪开，凳脚在地上留了两个湿印。」|`["wuze","shenheng"]` / 风物 / 青|`assets/cg/e39_ch03_s17_l2_v1.png` → `public/cg/e39_ch03_s17_l2.webp`|场`{"affinity.shenheng":{"gte":14},"flag.shen_meng_boundary":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch03_s17_l2_fei`|ch03_s17_shuge.l2「檐下一片瓦往外翘，雨从两边落。沈把凳子挪开，凳脚在地上留了两个湿印。」|`["wuze","shenheng"]` / 风物 / 绯|`assets/cg/e39_ch03_s17_l2_fei_v1.png` → `public/cg/e39_ch03_s17_l2_fei.webp`|场`{"affinity.shenheng":{"gte":14},"flag.shen_meng_boundary":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch03_s17_l30`|ch03_s17_shuge.l30「檐水接成了线。你们的手搁在膝间，等雨小下来才分开。」|`["wuze","shenheng"]` / 亲密 / 青|`assets/cg/e39_ch03_s17_l30_v1.png` → `public/cg/e39_ch03_s17_l30.webp`|场`{"affinity.shenheng":{"gte":14},"flag.shen_meng_boundary":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch03_s17_l30_fei`|ch03_s17_shuge.l30「檐水接成了线。你们的手搁在膝间，等雨小下来才分开。」|`["wuze","shenheng"]` / 亲密 / 绯|`assets/cg/e39_ch03_s17_l30_fei_v1.png` → `public/cg/e39_ch03_s17_l30_fei.webp`|场`{"affinity.shenheng":{"gte":14},"flag.shen_meng_boundary":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch03_s18_l2`|ch03_s18_yuanye.l2「苑中树影盖住半条长凳。裴坐一头，你坐一头，中间落了两枚干果壳。」|`["wuze","peizhaoye"]` / 风物 / 青|`assets/cg/e39_ch03_s18_l2_v1.png` → `public/cg/e39_ch03_s18_l2.webp`|场`{"affinity.peizhaoye":{"gte":14},"flag.pei_meng_no_troops":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch03_s18_l2_fei`|ch03_s18_yuanye.l2「苑中树影盖住半条长凳。裴坐一头，你坐一头，中间落了两枚干果壳。」|`["wuze","peizhaoye"]` / 风物 / 绯|`assets/cg/e39_ch03_s18_l2_fei_v1.png` → `public/cg/e39_ch03_s18_l2_fei.webp`|场`{"affinity.peizhaoye":{"gte":14},"flag.pei_meng_no_troops":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch03_s24_l39`|ch03_s24_shuge.l39「案脚一片薄木垫在砖缝上，暮光停在翘起的那一端。」|`[]` / 风物 / 无人|`assets/cg/e39_ch03_s24_l39_v1.png` → `public/cg/e39_ch03_s24_l39.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch04_s02_l40`|ch04_s02_hanyuan.l40「帷幔下摆离地半寸，光从底下穿过，落在空着的砖面上。」|`[]` / 风物 / 无人|`assets/cg/e39_ch04_s02_l40_v1.png` → `public/cg/e39_ch04_s02_l40.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch04_s04_l2`|ch04_s04_zhaoyang.l2「次日帷幔已卷起，殿内残留熏香，门口的冷风吹不到案后。」|`[]` / 风物 / 无人|`assets/cg/e39_ch04_s04_l2_v1.png` → `public/cg/e39_ch04_s04_l2.webp`|场`{"flag.enthroned":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch04_s06_l2`|ch04_s06_zhaoyang.l2「昭阳殿夜里只点一盏灯，灯油的气味留在垂下的帷幔内。」|`[]` / 风物 / 无人|`assets/cg/e39_ch04_s06_l2_v1.png` → `public/cg/e39_ch04_s06_l2.webp`|场`{"flag.enthroned":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch04_s12_l2`|ch04_s12_nvguan.l2「午后日光越过门槛，屋里坐席没有铺满；新裁的纸边碰着你的腕。」|`["wuze"]` / 风物 / 青|`assets/cg/e39_ch04_s12_l2_v1.png` → `public/cg/e39_ch04_s12_l2.webp`|场`{"flag.ch04_school_contract":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch04_s15_l2`|ch04_s15_yilu.l2「天亮时驿路泥还湿，车辙压出细水，轮边的泥点溅到你的靴面。」|`["wuze"]` / 风物 / 出行青|`assets/cg/e39_ch04_s15_l2_v1.png` → `public/cg/e39_ch04_s15_l2.webp`|场`{"flag.ch04_road_contract":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch04_s17_l5`|ch04_s17_nvguan.l5「一个多月后，女观窗下晒着新洗的布，冷风带进院中煎药的气味。」|`[]` / 风物 / 无人|`assets/cg/e39_ch04_s17_l5_v1.png` → `public/cg/e39_ch04_s17_l5.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch01_s05_l2`|ch01_s05_yuanye.l2「苑墙挡住了北风，落叶晒出干草味，阿荻在树下仰着脸。」|`[]` / 风物 / 无人|`assets/cg/e39_ch01_s05_l2_v1.png` → `public/cg/e39_ch01_s05_l2.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch01_s09_l2`|ch01_s09_shuge.l2「移到侧室，帘影把泥金书签遮成一条暗线。」|`[]` / 风物 / 无人|`assets/cg/e39_ch01_s09_l2_v1.png` → `public/cg/e39_ch01_s09_l2.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch02_s03_l2`|ch02_s03_nvguan.l2「晨风把晾毯吹得贴上柱子。你伸手扯开。」|`["wuze"]` / 风物 / 青|`assets/cg/e39_ch02_s03_l2_v1.png` → `public/cg/e39_ch02_s03_l2.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch03_s12_l66`|ch03_s12_hanyuan.l66「午光穿过殿门，照到那块垫案脚的薄木片。案上的水碗仍旧放得平。」|`[]` / 风物 / 无人|`assets/cg/e39_ch03_s12_l66_v1.png` → `public/cg/e39_ch03_s12_l66.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch03_s19_l8`|ch03_s19_shishe.l8「温挪到另一边，把半扇窗又推开一些。窗外的晾布鼓起，风没进来。」|`[]` / 风物 / 无人|`assets/cg/e39_ch03_s19_l8_v1.png` → `public/cg/e39_ch03_s19_l8.webp`|场`{"affinity.wenqiao":{"gte":14},"flag.wen_meng_no_praise":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch04_s07_l2`|ch04_s07_hanyuan.l2「早朝的风吹过龙尾道，殿门外两份荐牒用同一块石压着。」|`[]` / 风物 / 无人|`assets/cg/e39_ch04_s07_l2_v1.png` → `public/cg/e39_ch04_s07_l2.webp`|场`{"flag.enthroned":true}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch04_s11_l2`|ch04_s11_nvguan.l2「次日，女观窗下晾着药筛，晒干的草叶气味混进纸里。」|`[]` / 风物 / 无人|`assets/cg/e39_ch04_s11_l2_v1.png` → `public/cg/e39_ch04_s11_l2.webp`|场`{"flag.liqinghe_won":true}`；格`{"flag.ch04_school_cost_question":false}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch04_s18_l2`|ch04_s18_wuzibei.l2「夜里石旁没有印，灯照着一张空的碑样纸，纸角被风吹得贴上石面。」|`[]` / 风物 / 无人|`assets/cg/e39_ch04_s18_l2_v1.png` → `public/cg/e39_ch04_s18_l2.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|
|C / `e39_ch03_s23_l4`|ch03_s23_yeting.l4「光落到鞋尖上，缺了一角。她转过脚踝，又转回去。」|`["liuchenghuan"]` / 风物 / 同伴|`assets/cg/e39_ch03_s23_l4_v1.png` → `public/cg/e39_ch03_s23_l4.webp`|场`{}`；格`{}`；选图条件见提示词，绯版只拆身份|

## 9. 验收与交接

- **CC1 B45**：按冻结key登记唯一CGS，保持已有who=cg兼容及Line.image语义；青绯选择须可达，不误用旧摘要的“46/46”证明约会全覆盖。
- **C52**：逐句将旧锚迁移到改稿，拆多时空行（裴拥抱→到诗社、前夜合唱→眼前书阁）时图只落实际动作子句；不让下一拍旧CG再弹一次。别为图改变已有choice id、effects、goto、关系门槛。
- **C43**：仅按提示词冻结的A/B/C边界，每图一版；生成前重列磁盘／账本去重。参考图不生成到正文，不修改public、源码。工具失败留待产出，不写空文件。
- **E40**：看原件与真实手机场格后再裁切、评分。至少核两处用户截图、四个第二章约会、三章青绯与李暂停、承欢近坐、驿旁砂、9空镜及多人私人段。旧青吻指背夜色、月酒杯影、树影双靴、补充表待核景都不能靠总图数判过。
- **声音**：书阁夜雨、诗社抢纸、掖庭细雨与雨后轻滴水分开；声景由CC1显式映射。E39没有开声试听或运行测试，不声称听雨已修。
- **本轮验证**：107场／13／40／35／9数量一致；122项快照SHA吻合；95个新key互异，原句均存在于冻结JSON，绝对参考路径存在；提示词与登记表一一对应。只检查自己的两份文档，不运行与本轮无关的工程测试。
- **状态**：文档与key已冻结；全部新图待C43，裁切／评分／同拍实际显示待E40＋D32，部署待B46；补充表未冻结的近物景仍待E40核现有背景后决定，绝不写成全量视觉过关。
