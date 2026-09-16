# 八条线的场次骨架

> 由 `tools/convert-routes.ts` 生成（CC2，D-115 第一步），交 ChatGPT 写《八条线的故事线》。不要手改；数据变了重跑这个脚本。
> 读的是 `src/data/converted/`（数据指纹 `243999d4c1e8`，对应 manifest 里 14 份原文的那一次转换），不读剧本原文。

## 这份表是怎么来的

用真引擎（`src/engine/story.ts`，和玩家手里是同一份代码）从 `ch01_s00_zhaoyang` 一路走到结局卡，一共走了 6720 遍：1500 遍每个岔口随机挑；其余朝某个结局定向挑、掺一部分随机；另有一批是为复核「必经」专门绕着某一场走的。信会真的送到，每封都拆，九成随机挑一种回法回、一成读了不回；对诗随机赢输。随机数种子固定，数据不变就写出同一份表。

每条线就是「落到这个结局的那些路」。表里只有走出来的东西：

- **必经**：落到这个结局的每一条路都经过这一场。后面括号说凭什么：**图上绕不开**是按去向算的证明；**条件绕不开**是图上还有别的去向，但朝这个结局专门绕着它走也没绕开，下面写出另一条去向要什么条件。
- **选出来的**：有的路经过、有的不经过，百分比是经过它的路占这条线的比例。
- **信拆不拆**：模拟玩家每封信都拆。以前信一直不拆会让第二章 06—10 整段跳过，CC1 在 B19 修了（D-124），烟测断言拆 0 封、拆 1 封都不跳场，所以拆不拆不再改场次；「图上绕不开」只按场景去向算。
- **从哪里进来**：上一场是哪一场、怎么进来的（选了哪个选项、上一场走完直接进、对诗赢输）。同一场有几种进法就列几种，括号里是次数。
- **只在本线**：别的结局的路一次都没经过这一场。
- **判定用到的 flag 是在哪里写下的**：这条线的路上，结局判定要的那几个 flag，最后一次是哪一场哪个选项写成现在这个值的；那个选项要是被更早的选项放行的，接着写出那一格。
- **场次的顺序**是走出来的先后，不是 id 的大小。

**写故事线时只能顺着这里的场写，不许添这里没有的场。** 选出来的场可以写成「如果……」，但要按这里的进法写。

## 总览

| 结局 | 判定 | 走到的路 | 不同的场次序列 | 场数（最短—最长） | 必经 | 选出来的 | 只在本线 |
|---|---|---|---|---|---|---|---|
| 满殿无声 | flag.enthroned 且 flag.ch04_dissent_removed 且 flag.ch04_originals_destroyed 且 flag.ch04_nomination_closed | 273 | 236 | 73—80 | 70 | 24 | 0 |
| 无字之碑 | flag.enthroned 且 flag.public_review 且 flag.ch04_nomination_open | 241 | 232 | 73—84 | 70 | 26 | 0 |
| 未竟之诏 | flag.enthroned | 1588 | 1087 | 73—84 | 70 | 26 | 0 |
| 两席之间 | flag.liqinghe_won 且 flag.liqinghe_together 且 非 flag.enthroned 且 非 flag.declined_crown 且 非 flag.founded_school 且 非 flag.road_agreement | 92 | 89 | 74—81 | 69 | 22 | 0 |
| 开门授字 | flag.founded_school 且 非 flag.enthroned 且 非 flag.declined_crown | 616 | 553 | 72—84 | 69 | 28 | 2 |
| 不受 | flag.declined_crown 且 非 flag.enthroned | 2073 | 1297 | 70—85 | 67 | 26 | 0 |
| 关山有信 | flag.road_agreement 且 非 flag.enthroned 且 非 flag.declined_crown | 641 | 580 | 72—82 | 69 | 28 | 2 |
| 纸上有名 | 无条件（兜底：前面七个都不成立时落到这里） | 1196 | 1092 | 71—82 | 67 | 29 | 0 |

## 1. 满殿无声（`mandianwusheng`）

判定：flag.enthroned 且 flag.ch04_dissent_removed 且 flag.ch04_originals_destroyed 且 flag.ch04_nomination_closed。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 0 个结局都不成立。

走到这里的路 273 条，不同的场次序列 236 种，每条 73—80 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（163 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（56 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（54 条）
- `ch04_dissent_removed` 要真：
  - `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真 ← 这一项要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」 写成真（273 条）
- `ch04_originals_destroyed` 要真：
  - `ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」 写成真 ← 这一项要 `ch04_originals_burn_order` 来自 `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真（它又要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」 写成真）（137 条）
  - `ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」 写成真 ← 这一项要 `ch04_originals_burn_order` 来自 `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真（它又要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」 写成真）（136 条）
- `ch04_nomination_closed` 要真：
  - `ch04_s17_nvguan` 选 B「收好今次交付的回凭」 写成真 ← 这一项要 `ch04_nomination_closed_order` 来自 `ch04_s07_hanyuan` 选 B「颁行仅由在位者提名的办法」 写成真（273 条）

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（273） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（273） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（273） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（137）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（136） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（273） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（137）；`ch01_s04_shuge` 对诗输（136） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（273） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（140）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（133） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（147）；`ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（126） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 A「先收六份，满额便明示」（141）；`ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（132） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（148）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（125） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（273） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（137）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（136） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（37）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（27%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（73）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（39%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（54）；`ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（53） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（21%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（56）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（107）；`ch01_s14_yuanye` 上一场走完直接进（73）；`ch01_s16_yuanye` 上一场走完直接进（56）；`ch01_s13_shuge` 上一场走完直接进（37）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（140）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（133）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（273） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（273） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（142）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（131） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（273） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 A「一起读。读完也想见你」（82）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（68）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（64）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（59） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（273） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（141）；`ch02_s06_yeting` 选 B「先付六件，余款催原项」（132） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（93）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（90）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（90） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 A「连往返按半日给俸」（150）；`ch02_s08_shuge` 选 B「按次给俸，往返另记」（123） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（102）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（91）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（80） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（273） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（149）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（124） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（273） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（157）；`ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（116） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（18%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（49）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（14%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（38）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（14%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（38）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（29%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（80）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（68） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（80）；`ch02_s19_nvguan` 上一场走完直接进（68）；`ch02_s15_shuge` 上一场走完直接进（49）；`ch02_s16_yuanye` 上一场走完直接进（38）；`ch02_s17_shishe` 上一场走完直接进（38） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（138）；`ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（135） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（273） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（155）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（118） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 A「我在门边等你」（139）；`ch02_s22_shuge` 选 B「今日先走，你慢慢收」（134） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（273） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（273） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（98）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（96）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（79） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（165）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（108） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（137）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（136） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（140）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（133） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（151）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（122） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（143）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（130） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（149）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（124） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（273） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（163）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（56）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（54） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（4）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（3）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（3）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（113）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（111）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（18）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（14）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（4）；`ch03_s09a_yuanye` 上一场走完直接进（4）；`ch03_s09c_yuanye` 上一场走完直接进（3）；`ch03_s09b_yuanye` 上一场走完直接进（3）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（3） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（273） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（273） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（273） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（273） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（273） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（273） |  |
| 65 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（23%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（62） |  |
| 66 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（18%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（50）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 67 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（16%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（44）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 68 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（23%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（62）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 69 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（20%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（55）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s18_yuanye` 上一场走完直接进（62）；`ch03_s21_nvguan` 上一场走完直接进（62）；`ch03_s17_shuge` 上一场走完直接进（55）；`ch03_s20_yuanye` 上一场走完直接进（50）；`ch03_s19_shishe` 上一场走完直接进（44） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（273） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（273） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（273） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 B「写下曌」（96）；`ch04_s01_zhaoyang` 选 A「写下天」（89）；`ch04_s01_zhaoyang` 选 C「仍用添」（88） |  |
| 75 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 2 次都经过它） | `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」（273）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 76 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 5 次都经过它） | `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」（273）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」（137）；`ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」（136）<br/>进入条件：flag.enthroned |  |
| 78 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（273） |  |
| 79 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 G「独自过一阵」（65）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（59）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（52）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（48）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（45）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（4） |  |
| 80 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（1%） | `ch04_s05pe_shuge` 换场（4） |  |
| 81 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（269）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（58）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（55）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（40）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（4） |  |
| 82 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（20%） | `ch04_s05c_shuge` 换场（55） |  |
| 83 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（58） |  |
| 84 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（15%） | `ch04_s05c_shuge` 换场（40） |  |
| 85 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（273）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（30）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（28）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（26）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（23）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（22）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（18）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（2）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（2） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（53） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（17%） | `ch04_s05q_shuge` 换场（48） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（50） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（273） |  |
| 90 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 7 次都经过它） | `ch04_s05r_shuge` 换场（273）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 91 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 4 次都经过它） | `ch04_s05z_yeting` 选 B「收好今日的交付凭」（273）<br/>进入条件：flag.enthroned |  |
| 92 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s06_zhaoyang` 上一场走完直接进（273）<br/>进入条件：flag.enthroned |  |
| 93 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 B「颁行仅由在位者提名的办法」（273） |  |
| 94 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 B「收好今次交付的回凭」（273） |  |

## 2. 无字之碑（`wuzibei`）

判定：flag.enthroned 且 flag.public_review 且 flag.ch04_nomination_open。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 1 个结局都不成立。

走到这里的路 241 条，不同的场次序列 232 种，每条 73—84 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（151 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（54 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（36 条）
- `public_review` 要真：
  - `ch04_s05z_yeting` 选 A「收好今日的交付凭」 写成真 ← 这一项要 `ch04_dissent_retained` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真（它又要 `ch04_dissent_keep_order` 来自 `ch04_s02_hanyuan` 选 A「原议与答复同收」 写成真）；还要 `ch04_originals_retained` 来自 `ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」 写成真（它又要 `ch04_originals_keep_order` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真）（122 条）
  - `ch04_s05z_yeting` 选 A「收好今日的交付凭」 写成真 ← 这一项要 `ch04_dissent_retained` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真（它又要 `ch04_dissent_keep_order` 来自 `ch04_s02_hanyuan` 选 A「原议与答复同收」 写成真）；还要 `ch04_originals_retained` 来自 `ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」 写成真（它又要 `ch04_originals_keep_order` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真）（119 条）
- `ch04_nomination_open` 要真：
  - `ch04_s17_nvguan` 选 A「收好今次交付的回凭」 写成真 ← 这一项要 `ch04_nomination_open_order` 来自 `ch04_s07_hanyuan` 选 A「颁行多方提名与异议办法」 写成真（241 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（241） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（241） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（241） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（241） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（135）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（106） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（241） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（137）；`ch01_s04_shuge` 对诗输（104） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（241） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（127）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（114） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（134）；`ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（107） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（124）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（117） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（125）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（116） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（241） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（122）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（119） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（17%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（41）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（21%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（51）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（42%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（51）；`ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（50） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（20%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（48）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（101）；`ch01_s14_yuanye` 上一场走完直接进（51）；`ch01_s16_yuanye` 上一场走完直接进（48）；`ch01_s13_shuge` 上一场走完直接进（41）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（129）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（112）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（241） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（241） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（122）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（119） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（241） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（74）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（63）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（58）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（46） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（241） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（127）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（114） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（84）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（84）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（73） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（130）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（111） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 C「这次我也没余力陪读」（82）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（80）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（79） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（241） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（130）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（111） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（241） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（126）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（115） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（42）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（35）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（38）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（61）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（27%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（65） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s19_nvguan` 上一场走完直接进（65）；`ch02_s18_yuanye` 上一场走完直接进（61）；`ch02_s15_shuge` 上一场走完直接进（42）；`ch02_s17_shishe` 上一场走完直接进（38）；`ch02_s16_yuanye` 上一场走完直接进（35） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（122）；`ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（119） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（241） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（121）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（120） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（139）；`ch02_s22_shuge` 选 A「我在门边等你」（102） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（241） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（241） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 B「今夜想独处，改日再问」（90）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（80）；`ch02_s24_shuge` 选 C「我只约你明日论议」（71） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（143）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（98） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（121）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（120） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（122）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（119） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（126）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（115） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（124）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（117） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（128）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（113） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（241） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（151）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（54）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（36） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（2）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（2）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（2%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（6）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（102）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（99）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（15）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（10）；`ch03_s09c_yuanye` 上一场走完直接进（6）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（3）；`ch03_s09b_yuanye` 上一场走完直接进（2）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（2）；`ch03_s09a_yuanye` 上一场走完直接进（2） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（241） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（241） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（241） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（241） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（241） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（241） |  |
| 65 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（17%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（40）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 66 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（15%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（35）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 67 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（23%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（56）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 68 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（20%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（49）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 69 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（25%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（61） |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（61）；`ch03_s20_yuanye` 上一场走完直接进（56）；`ch03_s18_yuanye` 上一场走完直接进（49）；`ch03_s17_shuge` 上一场走完直接进（40）；`ch03_s19_shishe` 上一场走完直接进（35） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（241） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（241） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（241） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 B「写下曌」（82）；`ch04_s01_zhaoyang` 选 A「写下天」（82）；`ch04_s01_zhaoyang` 选 C「仍用添」（77） |  |
| 75 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 2 次都经过它） | `ch04_s02_hanyuan` 选 A「原议与答复同收」（241）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 76 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 4 次都经过它） | `ch04_s03_shuge` 选 A「原件归存，照权限查阅」（241）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」（122）；`ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」（119）<br/>进入条件：flag.enthroned |  |
| 78 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（241） |  |
| 79 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 G「独自过一阵」（45）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（44）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（43）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（39）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（34）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（25）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（11） |  |
| 80 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（5%） | `ch04_s05pe_shuge` 换场（11） |  |
| 81 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（230）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（56）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（56）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（48）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（37）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（11） |  |
| 82 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（23%） | `ch04_s05c_shuge` 换场（56） |  |
| 83 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（20%） | `ch04_s05c_shuge` 换场（48） |  |
| 84 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（23%） | `ch04_s05c_shuge` 换场（56） |  |
| 85 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（15%） | `ch04_s05c_shuge` 换场（37） |  |
| 86 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（241）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（26）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（23）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（21）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（20）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（19）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（19）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（16）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（12）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（4）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（3）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（2）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（1） |  |
| 87 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（47） |  |
| 88 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（12%） | `ch04_s05q_shuge` 换场（29） |  |
| 89 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（47） |  |
| 90 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（43） |  |
| 91 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（241） |  |
| 92 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 4 次都经过它） | `ch04_s05r_shuge` 换场（241）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 93 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s05z_yeting` 选 A「收好今日的交付凭」（241）<br/>进入条件：flag.enthroned |  |
| 94 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s06_zhaoyang` 上一场走完直接进（241）<br/>进入条件：flag.enthroned |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 A「颁行多方提名与异议办法」（241） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 A「收好今次交付的回凭」（241） |  |

## 3. 未竟之诏（`weijingzhizhao`）

判定：flag.enthroned。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 2 个结局都不成立。

走到这里的路 1588 条，不同的场次序列 1087 种，每条 73—84 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（938 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（339 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（311 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 ch04_nomination_closed（310）；缺 ch04_dissent_removed、ch04_originals_destroyed（277）；缺 ch04_originals_destroyed（255）；缺 ch04_originals_destroyed、ch04_nomination_closed（253）；缺 ch04_dissent_removed、ch04_nomination_closed（250）；缺 ch04_dissent_removed（243） |
| 无字之碑 | 缺 public_review（813）；缺 public_review、ch04_nomination_open（498）；缺 ch04_nomination_open（277） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（1588） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（1588） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（1588） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（807）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（781） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（1588） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（830）；`ch01_s04_shuge` 对诗赢（758） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（1588） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（804）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（784） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（814）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（774） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（828）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（760） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（795）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（793） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（1588） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（829）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（759） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（224）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（21%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（330）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（42%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（338）；`ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（331） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（23%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（365）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（669）；`ch01_s16_yuanye` 上一场走完直接进（365）；`ch01_s14_yuanye` 上一场走完直接进（330）；`ch01_s13_shuge` 上一场走完直接进（224）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（807）；`ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（781）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（1588） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（1588） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（815）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（773） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（1588） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（416）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（412）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（382）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（378） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（1588） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（802）；`ch02_s06_yeting` 选 B「先付六件，余款催原项」（786） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（555）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（525）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（508） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（816）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（772） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 C「这次我也没余力陪读」（540）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（539）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（509） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（1588） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（805）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（783） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（1588） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（803）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（785） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（274）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（263）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（14%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（227）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（24%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（385）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（28%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（439） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s19_nvguan` 上一场走完直接进（439）；`ch02_s18_yuanye` 上一场走完直接进（385）；`ch02_s15_shuge` 上一场走完直接进（274）；`ch02_s16_yuanye` 上一场走完直接进（263）；`ch02_s17_shishe` 上一场走完直接进（227） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（799）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（789） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（1588） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（809）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（779） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 A「我在门边等你」（805）；`ch02_s22_shuge` 选 B「今日先走，你慢慢收」（783） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（1588） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（1588） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（544）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（527）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（517） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（938）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（650） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（827）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（761） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（823）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（765） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（820）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（768） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（816）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（772） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（810）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（778） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（1588） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（938）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（339）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（311） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（23）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（2%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（26）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（22）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（683）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（648）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（86）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（71）；`ch03_s09b_yuanye` 上一场走完直接进（26）；`ch03_s09a_yuanye` 上一场走完直接进（23）；`ch03_s09c_yuanye` 上一场走完直接进（22）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（18）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（11） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（1588） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（1588） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（1588） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（1588） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（1588） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（1588） |  |
| 65 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（21%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（330） |  |
| 66 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（18%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（293）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 67 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（20%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（322）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 68 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（20%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（323）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 69 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（20%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（320）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（330）；`ch03_s19_shishe` 上一场走完直接进（323）；`ch03_s18_yuanye` 上一场走完直接进（322）；`ch03_s20_yuanye` 上一场走完直接进（320）；`ch03_s17_shuge` 上一场走完直接进（293） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（1588） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（1588） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（1588） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 C「仍用添」（548）；`ch04_s01_zhaoyang` 选 A「写下天」（533）；`ch04_s01_zhaoyang` 选 B「写下曌」（507） |  |
| 75 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 15 次都经过它） | `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」（818）；`ch04_s02_hanyuan` 选 A「原议与答复同收」（770）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 76 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 12 次都经过它） | `ch04_s03_shuge` 选 C「原件归存，照权限查阅」（508）；`ch04_s03_shuge` 选 B「确认焚毁原案，不可恢复」（493）；`ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」（310）；`ch04_s03_shuge` 选 A「原件归存，照权限查阅」（277）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 10 次都经过它） | `ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」（411）；`ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」（407）；`ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」（396）；`ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」（374）<br/>进入条件：flag.enthroned |  |
| 78 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（1588） |  |
| 79 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 G「独自过一阵」（338）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（322）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（265）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（238）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（230）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（136）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（59） |  |
| 80 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（59） |  |
| 81 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1529）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（425）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（340）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（260）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（202）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（59） |  |
| 82 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（13%） | `ch04_s05c_shuge` 换场（202） |  |
| 83 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（340） |  |
| 84 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（27%） | `ch04_s05c_shuge` 换场（425） |  |
| 85 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（16%） | `ch04_s05c_shuge` 换场（260） |  |
| 86 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（1588）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（146）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（134）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（134）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（122）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（120）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（108）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（69）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（67）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（19）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（16）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（14）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（5） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（259） |  |
| 88 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（294） |  |
| 89 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（249） |  |
| 90 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（10%） | `ch04_s05q_shuge` 换场（152） |  |
| 91 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（1588） |  |
| 92 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 17 次都经过它） | `ch04_s05r_shuge` 换场（1588）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 93 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 11 次都经过它） | `ch04_s05z_yeting` 选 B「收好今日的交付凭」（818）；`ch04_s05z_yeting` 选 C「收好今日的交付凭」（493）；`ch04_s05z_yeting` 选 A「收好今日的交付凭」（277）<br/>进入条件：flag.enthroned |  |
| 94 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 8 次都经过它） | `ch04_s06_zhaoyang` 上一场走完直接进（1588）<br/>进入条件：flag.enthroned |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 A「颁行多方提名与异议办法」（813）；`ch04_s07_hanyuan` 选 B「颁行仅由在位者提名的办法」（775） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 A「收好今次交付的回凭」（813）；`ch04_s17_nvguan` 选 B「收好今次交付的回凭」（775） |  |

## 4. 两席之间（`liangxizhijian`）

判定：flag.liqinghe_won 且 flag.liqinghe_together 且 非 flag.enthroned 且 非 flag.declined_crown 且 非 flag.founded_school 且 非 flag.road_agreement。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 3 个结局都不成立。

走到这里的路 92 条，不同的场次序列 89 种，每条 74—81 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `liqinghe_won` 要真：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成真 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（92 条）
- `liqinghe_together` 要真：
  - `ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」 写成真（48 条）
  - `ch04_s09_yuanye` 选 A「先留京，再约时辰」 写成真（24 条）
  - `ch04_s09_yuanye` 选 C「行路的事仍要去问」 写成真（13 条）
  - `ch04_s09_yuanye` 选 B「办学的事仍要去问」 写成真（7 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（92 条）
- `declined_crown` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（92 条）
- `founded_school` 要假：
  - 从没被写过，保持初始的假（92 条）
- `road_agreement` 要假：
  - 从没被写过，保持初始的假（92 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（92） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（92） |
| 未竟之诏 | 缺 enthroned（92） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（92） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（92） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（92） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（53）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（39） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（92） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（48）；`ch01_s04_shuge` 对诗输（44） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（92） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（52）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（40） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（46）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（46） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 A「先收六份，满额便明示」（52）；`ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（40） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（47）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（45） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（92） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（49）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（43） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（13）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（28%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（26）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（38%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（19）；`ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（16） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（20%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（18）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（35）；`ch01_s14_yuanye` 上一场走完直接进（26）；`ch01_s16_yuanye` 上一场走完直接进（18）；`ch01_s13_shuge` 上一场走完直接进（13）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（56）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（36）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（92） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（92） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（50）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（42） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（92） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 C「我只核这卷，不约私见」（33）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（24）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（23）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（12） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（92） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（50）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（42） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（34）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（32）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（26） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 A「连往返按半日给俸」（56）；`ch02_s08_shuge` 选 B「按次给俸，往返另记」（36） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（35）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（31）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（26） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（92） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（54）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（38） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（92） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（52）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（40） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（20%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（18）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（14%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（13）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（15）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（24）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（24%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（22） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（24）；`ch02_s19_nvguan` 上一场走完直接进（22）；`ch02_s15_shuge` 上一场走完直接进（18）；`ch02_s17_shishe` 上一场走完直接进（15）；`ch02_s16_yuanye` 上一场走完直接进（13） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（46）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（46） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（92） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（49）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（43） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（55）；`ch02_s22_shuge` 选 A「我在门边等你」（37） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（92） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（92） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 B「今夜想独处，改日再问」（32）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（30）；`ch02_s24_shuge` 选 C「我只约你明日论议」（30） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（69）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（23） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（47）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（45） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（49）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（43） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（48）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（44） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（54）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（38） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（47）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（45） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（92） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（92） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（1）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（1）<br/>进入条件：flag.li_ch03_private_paused |  |
| 57 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（42）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（27）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（13）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（6）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（2）；`ch03_s09c_yuanye` 上一场走完直接进（1）；`ch03_s09a_yuanye` 上一场走完直接进（1） |  |
| 58 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（92） |  |
| 59 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（92） |  |
| 60 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（92） |  |
| 61 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（92） |  |
| 62 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（92） |  |
| 63 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（92） |  |
| 64 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（11%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（10）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 65 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（17%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（16）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 66 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（16%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（15）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 67 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（42%） | `ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（15）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（13）；`ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（11） |  |
| 68 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（13%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（12）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 69 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（39）；`ch03_s19_shishe` 上一场走完直接进（16）；`ch03_s20_yuanye` 上一场走完直接进（15）；`ch03_s17_shuge` 上一场走完直接进（12）；`ch03_s18_yuanye` 上一场走完直接进（10） |  |
| 70 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（92） |  |
| 71 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（92） |  |
| 72 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（92） |  |
| 73 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（92） |  |
| 74 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（92）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 75 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（92） |  |
| 76 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（92） |  |
| 77 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（92）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（29）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（29）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（24） |  |
| 78 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（32%） | `ch04_s05c_shuge` 换场（29） |  |
| 79 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（32%） | `ch04_s05c_shuge` 换场（29） |  |
| 80 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（26%） | `ch04_s05c_shuge` 换场（24） |  |
| 81 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（92）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（92） |  |
| 82 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s05q_shuge` 换场（92）<br/>上一场的另一条去向：`ch04_s05qa_shuge`（无进入条件，但本线的选项没有走向它）、`ch04_s05qb_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s05qc_shishe`（无进入条件，但本线的选项没有走向它）、`ch04_s05r_shuge`（无进入条件，但本线的选项没有走向它） |  |
| 83 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（92） |  |
| 84 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 2 次都经过它） | `ch04_s05r_shuge` 换场（92）<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 85 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（92）<br/>进入条件：非 flag.enthroned |  |
| 86 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（48%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（44）<br/>进入条件：flag.liqinghe_won |  |
| 87 | `ch04_s11_nvguan` | 三日以后谁付 | 选出来的（42%） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（32）；`ch04_s09_yuanye` 选 B「办学的事仍要去问」（7）<br/>进入条件：flag.liqinghe_won |  |
| 88 | `ch04_s14_shuge` | 归期写在前面 | 选出来的（32%） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（16）；`ch04_s09_yuanye` 选 C「行路的事仍要去问」（13）<br/>进入条件：flag.liqinghe_won |  |
| 89 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s11_nvguan` 选 B「这回先不接」（39）；`ch04_s14_shuge` 选 B「这回不接，归期的纸我留着」（29）；`ch04_s09_yuanye` 选 A「先留京，再约时辰」（24）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s12_nvguan`（要 flag.ch04_school_contract）、`ch04_s14_shuge`（要 flag.liqinghe_won）、`ch04_s15_yilu`（要 flag.ch04_road_contract） |  |
| 90 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（92） |  |
| 91 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（92） |  |

## 5. 开门授字（`kaimenshouzi`）

判定：flag.founded_school 且 非 flag.enthroned 且 非 flag.declined_crown。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 4 个结局都不成立。

走到这里的路 616 条，不同的场次序列 553 种，每条 72—84 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `founded_school` 要真：
  - `ch04_s12_nvguan` 选 A「收好今日的课页」 写成真（616 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（616 条）
- `declined_crown` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（616 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（616） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（616） |
| 未竟之诏 | 缺 enthroned（616） |
| 两席之间 | 缺 liqinghe_together、非 founded_school（571）；缺 非 founded_school（45） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（616） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（616） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（616） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（320）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（296） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（616） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（309）；`ch01_s04_shuge` 对诗赢（307） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（616） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（312）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（304） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（333）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（283） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（310）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（306） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（313）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（303） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（616） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（316）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（300） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（16%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（97）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（19%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（120）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（42%） | `ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（136）；`ch01_s12_shuge` 选 C「去听温荞说纸声」（124） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（23%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（139）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（260）；`ch01_s16_yuanye` 上一场走完直接进（139）；`ch01_s14_yuanye` 上一场走完直接进（120）；`ch01_s13_shuge` 上一场走完直接进（97）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（326）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（290）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（616） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（616） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（312）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（304） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（616） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 A「一起读。读完也想见你」（172）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（150）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（149）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（145） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（616） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（323）；`ch02_s06_yeting` 选 B「先付六件，余款催原项」（293） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（213）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（204）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（199） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 A「连往返按半日给俸」（318）；`ch02_s08_shuge` 选 B「按次给俸，往返另记」（298） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 C「这次我也没余力陪读」（223）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（217）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（176） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（616） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（314）；`ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（302） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（616） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（316）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（300） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（96）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（97）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（92）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（30%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（182）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（24%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（149） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（182）；`ch02_s19_nvguan` 上一场走完直接进（149）；`ch02_s16_yuanye` 上一场走完直接进（97）；`ch02_s15_shuge` 上一场走完直接进（96）；`ch02_s17_shishe` 上一场走完直接进（92） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（324）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（292） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（616） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（315）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（301） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（322）；`ch02_s22_shuge` 选 A「我在门边等你」（294） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（616） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（616） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（211）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（207）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（198） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（399）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（217） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（323）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（293） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（325）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（291） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（324）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（292） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（313）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（303） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（312）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（304） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（616） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（616） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（2%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（10）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（2%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（10）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（4）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（278）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（238）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（31）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（29）；`ch03_s09b_yuanye` 上一场走完直接进（10）；`ch03_s09a_yuanye` 上一场走完直接进（10）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（8）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（8）；`ch03_s09c_yuanye` 上一场走完直接进（4） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（616） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（616） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（616） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（616） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（616） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（616） |  |
| 65 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（16%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（99）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 66 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（44%） | `ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（99）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（93）；`ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（76） |  |
| 67 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（15%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（94）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 68 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（13%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（83）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 69 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（12%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（72）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（268）；`ch03_s20_yuanye` 上一场走完直接进（99）；`ch03_s17_shuge` 上一场走完直接进（94）；`ch03_s19_shishe` 上一场走完直接进（83）；`ch03_s18_yuanye` 上一场走完直接进（72） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（616） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（616） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（616） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（616） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 16 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（616）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（616） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（125）；`ch04_s05p_shuge` 选 G「独自过一阵」（107）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（103）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（98）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（82）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（81）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（20） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（3%） | `ch04_s05pe_shuge` 换场（20） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（596）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（170）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（167）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（122）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（96）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（20） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（27%） | `ch04_s05c_shuge` 换场（167） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（20%） | `ch04_s05c_shuge` 换场（122） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（28%） | `ch04_s05c_shuge` 换场（170） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（16%） | `ch04_s05c_shuge` 换场（96） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（616）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（56）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（51）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（51）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（47）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（45）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（44）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（42）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（37）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（7）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（4）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（4）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（2） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（100） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（111） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（14%） | `ch04_s05q_shuge` 换场（90） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（14%） | `ch04_s05q_shuge` 换场（89） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（616） |  |
| 90 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 选出来的（7%） | `ch04_s05r_shuge` 换场（45） |  |
| 91 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 18 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（571）；`ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（45）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 92 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（30%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（185）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s11_nvguan` | 三日以后谁付 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（431）；`ch04_s09_yuanye` 选 E「今后只谈公事，我去问办学」（174）；`ch04_s09_yuanye` 选 B「办学的事仍要去问」（11）<br/>进入条件：flag.liqinghe_won<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s14_shuge`（要 flag.liqinghe_won） |  |
| 94 | `ch04_s12_nvguan` | 半日也算来过 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s11_nvguan` 选 A「按这一月的约定办」（616）<br/>进入条件：flag.ch04_school_contract<br/>上一场的另一条去向：`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s11_nvguan`（要 flag.liqinghe_won） | ✓ |
| 95 | `ch04_s13_nvguan` | 她们收自己的席 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s12_nvguan` 选 A「收好今日的课页」（616）<br/>进入条件：flag.founded_school | ✓ |
| 96 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s13_nvguan` 上一场走完直接进（616） |  |
| 97 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（616） |  |

## 6. 不受（`bushou`）

判定：flag.declined_crown 且 非 flag.enthroned。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 5 个结局都不成立。

走到这里的路 2073 条，不同的场次序列 1297 种，每条 70—85 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `declined_crown` 要真：
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（1258 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（421 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（394 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（1258 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（421 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（394 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（2073） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（2073） |
| 未竟之诏 | 缺 enthroned（2073） |
| 两席之间 | 缺 liqinghe_won、liqinghe_together、非 declined_crown（2073） |
| 开门授字 | 缺 founded_school、非 declined_crown（2073） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（2073） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（2073） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（2073） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（1040）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（1033） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（2073） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（1047）；`ch01_s04_shuge` 对诗赢（1026） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（2073） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（1052）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（1021） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（1074）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（999） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（1038）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（1035） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（1037）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（1036） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（2073） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（1049）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（1024） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（299）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（22%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（455）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（40%） | `ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（421）；`ch01_s12_shuge` 选 C「去听温荞说纸声」（416） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（23%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（482）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（837）；`ch01_s16_yuanye` 上一场走完直接进（482）；`ch01_s14_yuanye` 上一场走完直接进（455）；`ch01_s13_shuge` 上一场走完直接进（299）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（1046）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（1027）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（2073） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（2073） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（1071）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（1002） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（2073） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 A「一起读。读完也想见你」（561）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（523）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（495）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（494） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（2073） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（1038）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（1035） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（700）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（690）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（683） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（1055）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（1018） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（718）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（678）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（677） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（2073） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（1077）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（996） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（2073） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（1048）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（1025） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（348）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（333）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（312）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（28%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（585）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（24%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（495） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（585）；`ch02_s19_nvguan` 上一场走完直接进（495）；`ch02_s15_shuge` 上一场走完直接进（348）；`ch02_s16_yuanye` 上一场走完直接进（333）；`ch02_s17_shishe` 上一场走完直接进（312） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（1056）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（1017） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（2073） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（1041）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（1032） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（1085）；`ch02_s22_shuge` 选 A「我在门边等你」（988） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（2073） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（2073） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（719）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（685）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（669） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（1226）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（847） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（1083）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（990） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（1048）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（1025） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（1046）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（1027） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（1054）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（1019） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（1046）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（1027） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（2073） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（1258）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（421）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（394） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（26）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（17）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（19）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（888）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（871）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（105）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（103）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（28）；`ch03_s09a_yuanye` 上一场走完直接进（26）；`ch03_s09c_yuanye` 上一场走完直接进（19）；`ch03_s09b_yuanye` 上一场走完直接进（17）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（16） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（2073） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」（2073） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」（2073） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（2073） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（2073） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（2073） |  |
| 65 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（14%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（284）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 66 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（46%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（329）；`ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（322）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（293） |  |
| 67 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（14%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（291）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 68 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（13%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（271）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 69 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（14%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（283）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（944）；`ch03_s19_shishe` 上一场走完直接进（291）；`ch03_s17_shuge` 上一场走完直接进（284）；`ch03_s20_yuanye` 上一场走完直接进（283）；`ch03_s18_yuanye` 上一场走完直接进（271） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（2073） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（2073） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（2073） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 D「领回自己的东西」（2073） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 25 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（2073）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（2073） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（370）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（356）；`ch04_s05p_shuge` 选 G「独自过一阵」（351）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（312）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（310）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（282）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（92） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（92） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1981）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（493）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（486）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（419）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（324）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（92） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（24%） | `ch04_s05c_shuge` 换场（493） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（20%） | `ch04_s05c_shuge` 换场（419） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（23%） | `ch04_s05c_shuge` 换场（486） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（16%） | `ch04_s05c_shuge` 换场（324） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（2073）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（190）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（190）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（184）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（180）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（152）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（145）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（144）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（130）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（30）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（30）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（29）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（15） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（399） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（17%） | `ch04_s05q_shuge` 换场（358） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（17%） | `ch04_s05q_shuge` 换场（350） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（312） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（2073） |  |
| 90 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 10 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（2073）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 91 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 18 次都经过它） | `ch04_s08z_shuge` 选 A「今日不定去处，出去吃点东西」（2073）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s14_shuge`（要 flag.liqinghe_won） |  |
| 92 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（2073） |  |
| 93 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（2073） |  |

## 7. 关山有信（`guanshanyouxin`）

判定：flag.road_agreement 且 非 flag.enthroned 且 非 flag.declined_crown。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 6 个结局都不成立。

走到这里的路 641 条，不同的场次序列 580 种，每条 72—82 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `road_agreement` 要真：
  - `ch04_s15_yilu` 选 A「随车到第一处交接」 写成真（641 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（641 条）
- `declined_crown` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（641 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（641） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（641） |
| 未竟之诏 | 缺 enthroned（641） |
| 两席之间 | 缺 liqinghe_together、非 road_agreement（596）；缺 非 road_agreement（45） |
| 开门授字 | 缺 founded_school（641） |
| 不受 | 缺 declined_crown（641） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（641） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（641） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（641） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（326）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（315） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（641） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（330）；`ch01_s04_shuge` 对诗赢（311） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（641） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（321）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（320） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（325）；`ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（316） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 A「先收六份，满额便明示」（325）；`ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（316） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（339）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（302） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（641） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（330）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（311） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（13%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（81）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（21%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（137）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（46%） | `ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（160）；`ch01_s12_shuge` 选 C「去听温荞说纸声」（138） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（20%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（125）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（298）；`ch01_s14_yuanye` 上一场走完直接进（137）；`ch01_s16_yuanye` 上一场走完直接进（125）；`ch01_s13_shuge` 上一场走完直接进（81）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（336）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（305）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（641） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（641） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（347）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（294） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（641） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（183）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（159）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（155）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（144） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（641） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（327）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（314） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（226）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（225）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（190） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（332）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（309） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（244）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（202）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（195） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（641） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（335）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（306） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（641） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（322）；`ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（319） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（101）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（108）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（107）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（168）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（24%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（157） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（168）；`ch02_s19_nvguan` 上一场走完直接进（157）；`ch02_s16_yuanye` 上一场走完直接进（108）；`ch02_s17_shishe` 上一场走完直接进（107）；`ch02_s15_shuge` 上一场走完直接进（101） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（329）；`ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（312） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（641） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（322）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（319） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（328）；`ch02_s22_shuge` 选 A「我在门边等你」（313） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（641） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（641） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 B「今夜想独处，改日再问」（219）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（216）；`ch02_s24_shuge` 选 C「我只约你明日论议」（206） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（421）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（220） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（333）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（308） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（322）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（319） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（326）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（315） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（337）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（304） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（321）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（320） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（641） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（641） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（5）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（5）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（2%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（10）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（274）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（265）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（37）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（30）；`ch03_s09c_yuanye` 上一场走完直接进（10）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（9）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（6）；`ch03_s09a_yuanye` 上一场走完直接进（5）；`ch03_s09b_yuanye` 上一场走完直接进（5） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（641） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（641） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（641） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（641） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（641） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（641） |  |
| 65 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（15%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（94）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 66 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（11%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（73）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 67 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（41%） | `ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（94）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（88）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（83） |  |
| 68 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（17%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（106）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 69 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（16%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（103）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（265）；`ch03_s18_yuanye` 上一场走完直接进（106）；`ch03_s20_yuanye` 上一场走完直接进（103）；`ch03_s19_shishe` 上一场走完直接进（94）；`ch03_s17_shuge` 上一场走完直接进（73） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（641） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（641） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（641） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（641） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 15 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（641）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（641） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（116）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（112）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（109）；`ch04_s05p_shuge` 选 G「独自过一阵」（108）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（88）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（84）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（24） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（24） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（617）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（182）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（159）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（136）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（107）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（24） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（28%） | `ch04_s05c_shuge` 换场（182） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（136） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（159） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（17%） | `ch04_s05c_shuge` 换场（107） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（641）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（62）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（55）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（54）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（54）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（49）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（45）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（43）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（39）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（6）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（5）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（4）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（1） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（115） |  |
| 86 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（14%） | `ch04_s05q_shuge` 换场（89） |  |
| 87 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（121） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（14%） | `ch04_s05q_shuge` 换场（92） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（641） |  |
| 90 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 选出来的（7%） | `ch04_s05r_shuge` 换场（45） |  |
| 91 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 20 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（596）；`ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（45）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 92 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（37%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（235）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s14_shuge` | 归期写在前面 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（406）；`ch04_s09_yuanye` 选 F「今后只谈公事，我去问行路」（221）；`ch04_s09_yuanye` 选 C「行路的事仍要去问」（14）<br/>进入条件：flag.liqinghe_won<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s11_nvguan`（要 flag.liqinghe_won） |  |
| 94 | `ch04_s15_yilu` | 各自领一份 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s14_shuge` 选 A「接这一月的差，明早领款」（641）<br/>进入条件：flag.ch04_road_contract<br/>上一场的另一条去向：`ch04_s10_yuanye`（要 非 flag.enthroned） | ✓ |
| 95 | `ch04_s16_yilu` | 驿旁不是归处 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s15_yilu` 选 A「随车到第一处交接」（641）<br/>进入条件：flag.road_agreement | ✓ |
| 96 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s16_yilu` 上一场走完直接进（641） |  |
| 97 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（641） |  |

## 8. 纸上有名（`zhishangyouming`）

判定：无条件（兜底：前面七个都不成立时落到这里）。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 7 个结局都不成立。

走到这里的路 1196 条，不同的场次序列 1092 种，每条 71—82 场。

### 判定用到的 flag 是在哪里写下的

无：兜底结局不看 flag。

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（1196） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（1196） |
| 未竟之诏 | 缺 enthroned（1196） |
| 两席之间 | 缺 liqinghe_together（1196） |
| 开门授字 | 缺 founded_school（1196） |
| 不受 | 缺 declined_crown（1196） |
| 关山有信 | 缺 road_agreement（1196） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（1196） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（1196） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（1196） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（611）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（585） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（1196） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（618）；`ch01_s04_shuge` 对诗输（578） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（1196） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（617）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（579） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（621）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（575） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（626）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（570） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（604）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（592） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（1196） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（615）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（581） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（15%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（178）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（22%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（262）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（42%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（259）；`ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（242） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（21%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（255）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（501）；`ch01_s14_yuanye` 上一场走完直接进（262）；`ch01_s16_yuanye` 上一场走完直接进（255）；`ch01_s13_shuge` 上一场走完直接进（178）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（608）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（588）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（1196） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（1196） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（616）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（580） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（1196） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（318）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（295）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（292）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（291） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（1196） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（605）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（591） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（424）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（400）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（372） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（611）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（585） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（417）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（409）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（370） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（1196） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（627）；`ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（569） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（1196） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（611）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（585） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（182）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（209）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（190）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（316）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（299） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（316）；`ch02_s19_nvguan` 上一场走完直接进（299）；`ch02_s16_yuanye` 上一场走完直接进（209）；`ch02_s17_shishe` 上一场走完直接进（190）；`ch02_s15_shuge` 上一场走完直接进（182） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（614）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（582） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（1196） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（602）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（594） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 A「我在门边等你」（608）；`ch02_s22_shuge` 选 B「今日先走，你慢慢收」（588） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（1196） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（1196） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（412）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（398）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（386） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（790）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（406） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（606）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（590） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（602）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（594） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（616）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（580） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（613）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（583） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（614）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（582） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（1196） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（1196） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（14）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（17）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（7）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（537）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（514）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（53）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（43）；`ch03_s09b_yuanye` 上一场走完直接进（17）；`ch03_s09a_yuanye` 上一场走完直接进（14）；`ch03_s09c_yuanye` 上一场走完直接进（7）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（6）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（5） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（1196） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（1196） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（1196） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（1196） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（1196） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（1196） |  |
| 65 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（14%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（166）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 66 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（15%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（182）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 67 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（12%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（142）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 68 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（46%） | `ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（186）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（186）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（177） |  |
| 69 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（13%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（157）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（549）；`ch03_s20_yuanye` 上一场走完直接进（182）；`ch03_s19_shishe` 上一场走完直接进（166）；`ch03_s18_yuanye` 上一场走完直接进（157）；`ch03_s17_shuge` 上一场走完直接进（142） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（1196） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（1196） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（1196） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（1196） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 13 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（1196）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（1196） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（241）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（213）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（212）；`ch04_s05p_shuge` 选 G「独自过一阵」（210）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（167）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（101）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（52） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（52） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1144）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（303）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（294）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（264）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（168）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（52） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（303） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（22%） | `ch04_s05c_shuge` 换场（264） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（294） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（14%） | `ch04_s05c_shuge` 换场（168） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（1196）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（118）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（109）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（106）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（106）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（101）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（100）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（76）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（22）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（20）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（12）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（6） |  |
| 85 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（239） |  |
| 86 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（234） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（182） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（10%） | `ch04_s05q_shuge` 换场（121） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（1196） |  |
| 90 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 15 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（1196）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 91 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（47%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（563）<br/>进入条件：flag.liqinghe_won |  |
| 92 | `ch04_s11_nvguan` | 三日以后谁付 | 选出来的（41%） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（326）；`ch04_s09_yuanye` 选 E「今后只谈公事，我去问办学」（160）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s14_shuge` | 归期写在前面 | 选出来的（38%） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（307）；`ch04_s09_yuanye` 选 F「今后只谈公事，我去问行路」（149）<br/>进入条件：flag.liqinghe_won |  |
| 94 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s11_nvguan` 选 B「这回先不接」（486）；`ch04_s14_shuge` 选 B「这回不接，归期的纸我留着」（456）；`ch04_s09_yuanye` 选 D「今后只谈公事，我先留京」（254）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s12_nvguan`（要 flag.ch04_school_contract）、`ch04_s14_shuge`（要 flag.liqinghe_won）、`ch04_s15_yilu`（要 flag.ch04_road_contract） |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（1196） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（1196） |  |

## 附：必经的复核记录

抽样里「每条都经过」、但图上绕得开的场，都朝那个结局专门绕着走过（每场最多 60 次，绕开一次就停）。绕开了的，那条路已经算进这条线，这一场随之变成「选出来的」。

- 复核 39 处，绕开 0 处，留作必经 39 处。

| 结局 | 场次 | 结果 |
|---|---|---|
| 不受 | `ch04_s08_shuge` | 没绕开：试 60 次，25 次走到本结局 |
| 不受 | `ch04_s08z_shuge` | 没绕开：试 60 次，10 次走到本结局 |
| 不受 | `ch04_s10_yuanye` | 没绕开：试 60 次，18 次走到本结局 |
| 关山有信 | `ch04_s08_shuge` | 没绕开：试 60 次，15 次走到本结局 |
| 关山有信 | `ch04_s08z_shuge` | 没绕开：试 60 次，20 次走到本结局 |
| 关山有信 | `ch04_s14_shuge` | 没绕开：试 60 次，0 次走到本结局 |
| 关山有信 | `ch04_s15_yilu` | 没绕开：试 60 次，0 次走到本结局 |
| 关山有信 | `ch04_s16_yilu` | 没绕开：试 60 次，0 次走到本结局 |
| 开门授字 | `ch04_s08_shuge` | 没绕开：试 60 次，16 次走到本结局 |
| 开门授字 | `ch04_s08z_shuge` | 没绕开：试 60 次，18 次走到本结局 |
| 开门授字 | `ch04_s11_nvguan` | 没绕开：试 60 次，0 次走到本结局 |
| 开门授字 | `ch04_s12_nvguan` | 没绕开：试 60 次，0 次走到本结局 |
| 开门授字 | `ch04_s13_nvguan` | 没绕开：试 60 次，0 次走到本结局 |
| 两席之间 | `ch04_s05qd_yuanye` | 没绕开：试 60 次，0 次走到本结局 |
| 两席之间 | `ch04_s05rl_yuanye` | 没绕开：试 60 次，2 次走到本结局 |
| 两席之间 | `ch04_s08_shuge` | 没绕开：试 60 次，0 次走到本结局 |
| 两席之间 | `ch04_s08z_shuge` | 没绕开：试 60 次，0 次走到本结局 |
| 两席之间 | `ch04_s10_yuanye` | 没绕开：试 60 次，0 次走到本结局 |
| 满殿无声 | `ch04_s03_shuge` | 没绕开：试 60 次，2 次走到本结局 |
| 满殿无声 | `ch04_s04_zhaoyang` | 没绕开：试 60 次，5 次走到本结局 |
| 满殿无声 | `ch04_s05_yeting` | 没绕开：试 60 次，1 次走到本结局 |
| 满殿无声 | `ch04_s05z_yeting` | 没绕开：试 60 次，7 次走到本结局 |
| 满殿无声 | `ch04_s06_zhaoyang` | 没绕开：试 60 次，4 次走到本结局 |
| 满殿无声 | `ch04_s07_hanyuan` | 没绕开：试 60 次，0 次走到本结局 |
| 未竟之诏 | `ch04_s03_shuge` | 没绕开：试 60 次，15 次走到本结局 |
| 未竟之诏 | `ch04_s04_zhaoyang` | 没绕开：试 60 次，12 次走到本结局 |
| 未竟之诏 | `ch04_s05_yeting` | 没绕开：试 60 次，10 次走到本结局 |
| 未竟之诏 | `ch04_s05z_yeting` | 没绕开：试 60 次，17 次走到本结局 |
| 未竟之诏 | `ch04_s06_zhaoyang` | 没绕开：试 60 次，11 次走到本结局 |
| 未竟之诏 | `ch04_s07_hanyuan` | 没绕开：试 60 次，8 次走到本结局 |
| 无字之碑 | `ch04_s03_shuge` | 没绕开：试 60 次，2 次走到本结局 |
| 无字之碑 | `ch04_s04_zhaoyang` | 没绕开：试 60 次，4 次走到本结局 |
| 无字之碑 | `ch04_s05_yeting` | 没绕开：试 60 次，1 次走到本结局 |
| 无字之碑 | `ch04_s05z_yeting` | 没绕开：试 60 次，4 次走到本结局 |
| 无字之碑 | `ch04_s06_zhaoyang` | 没绕开：试 60 次，3 次走到本结局 |
| 无字之碑 | `ch04_s07_hanyuan` | 没绕开：试 60 次，3 次走到本结局 |
| 纸上有名 | `ch04_s08_shuge` | 没绕开：试 60 次，13 次走到本结局 |
| 纸上有名 | `ch04_s08z_shuge` | 没绕开：试 60 次，15 次走到本结局 |
| 纸上有名 | `ch04_s10_yuanye` | 没绕开：试 60 次，0 次走到本结局 |

