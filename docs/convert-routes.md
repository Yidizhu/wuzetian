# 八条线的场次骨架

> 由 `tools/convert-routes.ts` 生成（CC2，D-115 第一步），交 ChatGPT 写《八条线的故事线》。不要手改；数据变了重跑这个脚本。
> 读的是 `src/data/converted/`（数据指纹 `3da0b3aed9ff`，对应 manifest 里 14 份原文的那一次转换），不读剧本原文。

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
| 满殿无声 | flag.enthroned 且 flag.ch04_dissent_removed 且 flag.ch04_originals_destroyed 且 flag.ch04_nomination_closed | 278 | 253 | 72—80 | 70 | 24 | 0 |
| 无字之碑 | flag.enthroned 且 flag.public_review 且 flag.ch04_nomination_open | 250 | 244 | 72—84 | 70 | 26 | 0 |
| 未竟之诏 | flag.enthroned | 1585 | 1179 | 72—86 | 70 | 26 | 0 |
| 两席之间 | flag.liqinghe_won 且 flag.liqinghe_together 且 非 flag.enthroned 且 非 flag.declined_crown 且 非 flag.founded_school 且 非 flag.road_agreement | 92 | 88 | 73—80 | 69 | 22 | 0 |
| 开门授字 | flag.founded_school 且 非 flag.enthroned 且 非 flag.declined_crown | 611 | 570 | 71—84 | 69 | 28 | 2 |
| 不受 | flag.declined_crown 且 非 flag.enthroned | 2084 | 1426 | 69—85 | 67 | 26 | 0 |
| 关山有信 | flag.road_agreement 且 非 flag.enthroned 且 非 flag.declined_crown | 615 | 576 | 71—86 | 69 | 28 | 2 |
| 纸上有名 | 无条件（兜底：前面七个都不成立时落到这里） | 1205 | 1132 | 70—83 | 67 | 29 | 0 |

## 1. 满殿无声（`mandianwusheng`）

判定：flag.enthroned 且 flag.ch04_dissent_removed 且 flag.ch04_originals_destroyed 且 flag.ch04_nomination_closed。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 0 个结局都不成立。

走到这里的路 278 条，不同的场次序列 253 种，每条 72—80 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（170 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（58 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（50 条）
- `ch04_dissent_removed` 要真：
  - `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真 ← 这一项要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」 写成真（278 条）
- `ch04_originals_destroyed` 要真：
  - `ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」 写成真 ← 这一项要 `ch04_originals_burn_order` 来自 `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真（它又要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」 写成真）（140 条）
  - `ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」 写成真 ← 这一项要 `ch04_originals_burn_order` 来自 `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真（它又要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」 写成真）（138 条）
- `ch04_nomination_closed` 要真：
  - `ch04_s17_nvguan` 选 B「收好今次交付的回凭」 写成真 ← 这一项要 `ch04_nomination_closed_order` 来自 `ch04_s07_hanyuan` 选 B「颁行仅由在位者提名的办法」 写成真（278 条）

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（278） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（278） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（278） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（145）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（133） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（278） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（143）；`ch01_s04_shuge` 对诗输（135） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（278） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（144）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（134） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（146）；`ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（132） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 A「先收六份，满额便明示」（149）；`ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（129） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（153）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（125） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（278） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（146）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（132） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（13%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（37）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（26%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（73）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（19%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（54）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（20%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（56）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s14_yuanye` 上一场走完直接进（73）；`ch01_s12_shuge` 选 E「直接去找阿荻」（58）；`ch01_s16_yuanye` 上一场走完直接进（56）；`ch01_s15_shishe` 上一场走完直接进（54）；`ch01_s13_shuge` 上一场走完直接进（37）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（145）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（133）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（278） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（278） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（141）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（137） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（278） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 A「一起读。读完也想见你」（77）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（77）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（72）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（52） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（278） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（153）；`ch02_s06_yeting` 选 B「先付六件，余款催原项」（125） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（96）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（93）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（89） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 A「连往返按半日给俸」（151）；`ch02_s08_shuge` 选 B「按次给俸，往返另记」（127） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 C「这次我也没余力陪读」（104）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（93）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（81） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（278） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（154）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（124） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（278） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（150）；`ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（128） |  |
| 34 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（30%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（83）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 35 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（72） |  |
| 36 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（41）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 37 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（18%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（50）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 38 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（12%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（32）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（83）；`ch02_s19_nvguan` 上一场走完直接进（72）；`ch02_s15_shuge` 上一场走完直接进（50）；`ch02_s16_yuanye` 上一场走完直接进（41）；`ch02_s17_shishe` 上一场走完直接进（32） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（144）；`ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（134） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（278） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（153）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（125） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 A「我在门边等你」（144）；`ch02_s22_shuge` 选 B「今日先走，你慢慢收」（134） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（278） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（278） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（102）；`ch02_s24_shuge` 选 C「我只约你明日论议」（96）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（80） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（164）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（114） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（149）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（129） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（148）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（130） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（152）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（126） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（151）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（127） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（150）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（128） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（278） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（170）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（58）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（50） |  |
| 55 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（4）<br/>进入条件：flag.li_ch03_private_paused |  |
| 56 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（2%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（5）<br/>进入条件：flag.li_ch03_only_intent |  |
| 57 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（3）<br/>进入条件：flag.li_ch03_multi_told |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（115）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（109）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（19）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（16）；`ch03_s09a_yuanye` 上一场走完直接进（5）；`ch03_s09c_yuanye` 上一场走完直接进（4）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（4）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（3）；`ch03_s09b_yuanye` 上一场走完直接进（3） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（278） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（278） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（278） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（278） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（278） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（278） |  |
| 65 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（17%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（48）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 66 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（21%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（59）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 67 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（20%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（55）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 68 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（20%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（56） |  |
| 69 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（22%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（60）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s18_yuanye` 上一场走完直接进（60）；`ch03_s17_shuge` 上一场走完直接进（59）；`ch03_s21_nvguan` 上一场走完直接进（56）；`ch03_s20_yuanye` 上一场走完直接进（55）；`ch03_s19_shishe` 上一场走完直接进（48） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（278） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（278） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（278） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 B「写下曌」（97）；`ch04_s01_zhaoyang` 选 C「仍用添」（91）；`ch04_s01_zhaoyang` 选 A「写下天」（90） |  |
| 75 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」（278）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 76 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 4 次都经过它） | `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」（278）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」（140）；`ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」（138）<br/>进入条件：flag.enthroned |  |
| 78 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（278） |  |
| 79 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（62）；`ch04_s05p_shuge` 选 G「独自过一阵」（60）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（51）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（50）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（49）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（6） |  |
| 80 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（2%） | `ch04_s05pe_shuge` 换场（6） |  |
| 81 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（272）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（61）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（57）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（45）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（6） |  |
| 82 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（57） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（16%） | `ch04_s05c_shuge` 换场（45） |  |
| 84 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（22%） | `ch04_s05c_shuge` 换场（61） |  |
| 85 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（278）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（33）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（33）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（27）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（22）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（21）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（18）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（4）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（2）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（1） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（55） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（53） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（53） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（278） |  |
| 90 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 6 次都经过它） | `ch04_s05r_shuge` 换场（278）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 91 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 4 次都经过它） | `ch04_s05z_yeting` 选 B「收好今日的交付凭」（278）<br/>进入条件：flag.enthroned |  |
| 92 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s06_zhaoyang` 上一场走完直接进（278）<br/>进入条件：flag.enthroned |  |
| 93 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 B「颁行仅由在位者提名的办法」（278） |  |
| 94 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 B「收好今次交付的回凭」（278） |  |

## 2. 无字之碑（`wuzibei`）

判定：flag.enthroned 且 flag.public_review 且 flag.ch04_nomination_open。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 1 个结局都不成立。

走到这里的路 250 条，不同的场次序列 244 种，每条 72—84 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（157 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（58 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（35 条）
- `public_review` 要真：
  - `ch04_s05z_yeting` 选 A「收好今日的交付凭」 写成真 ← 这一项要 `ch04_dissent_retained` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真（它又要 `ch04_dissent_keep_order` 来自 `ch04_s02_hanyuan` 选 A「原议与答复同收」 写成真）；还要 `ch04_originals_retained` 来自 `ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」 写成真（它又要 `ch04_originals_keep_order` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真）（126 条）
  - `ch04_s05z_yeting` 选 A「收好今日的交付凭」 写成真 ← 这一项要 `ch04_dissent_retained` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真（它又要 `ch04_dissent_keep_order` 来自 `ch04_s02_hanyuan` 选 A「原议与答复同收」 写成真）；还要 `ch04_originals_retained` 来自 `ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」 写成真（它又要 `ch04_originals_keep_order` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真）（124 条）
- `ch04_nomination_open` 要真：
  - `ch04_s17_nvguan` 选 A「收好今次交付的回凭」 写成真 ← 这一项要 `ch04_nomination_open_order` 来自 `ch04_s07_hanyuan` 选 A「颁行多方提名与异议办法」 写成真（250 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（250） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（250） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（250） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（250） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（137）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（113） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（250） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（136）；`ch01_s04_shuge` 对诗输（114） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（250） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（125）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（125） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（130）；`ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（120） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（130）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（120） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（129）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（121） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（250） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（129）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（121） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（16%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（41）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（20%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（51）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（20%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（51）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（19%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（48）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s12_shuge` 选 E「直接去找阿荻」（59）；`ch01_s14_yuanye` 上一场走完直接进（51）；`ch01_s15_shishe` 上一场走完直接进（51）；`ch01_s16_yuanye` 上一场走完直接进（48）；`ch01_s13_shuge` 上一场走完直接进（41）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（126）；`ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（124）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（250） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（250） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（127）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（123） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（250） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（78）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（71）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（65）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（36） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（250） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（128）；`ch02_s06_yeting` 选 B「先付六件，余款催原项」（122） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（87）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（86）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（77） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（130）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（120） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 C「这次我也没余力陪读」（95）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（79）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（76） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（250） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（139）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（111） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（250） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（127）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（123） |  |
| 34 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（63） |  |
| 35 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（29%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（72）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（38）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（43）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 38 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（14%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（34）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（72）；`ch02_s19_nvguan` 上一场走完直接进（63）；`ch02_s15_shuge` 上一场走完直接进（43）；`ch02_s17_shishe` 上一场走完直接进（38）；`ch02_s16_yuanye` 上一场走完直接进（34） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（127）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（123） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（250） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（127）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（123） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（145）；`ch02_s22_shuge` 选 A「我在门边等你」（105） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（250） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（250） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（87）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（83）；`ch02_s24_shuge` 选 C「我只约你明日论议」（80） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（141）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（109） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（133）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（117） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（130）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（120） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（134）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（116） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（136）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（114） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（126）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（124） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（250） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（157）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（58）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（35） |  |
| 55 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（2%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（4）<br/>进入条件：flag.li_ch03_multi_told |  |
| 56 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（2%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（6）<br/>进入条件：flag.li_ch03_private_paused |  |
| 57 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（0%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（1）<br/>进入条件：flag.li_ch03_only_intent |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（108）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（100）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（15）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（13）；`ch03_s09c_yuanye` 上一场走完直接进（6）；`ch03_s09b_yuanye` 上一场走完直接进（4）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（2）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（1）；`ch03_s09a_yuanye` 上一场走完直接进（1） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（250） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（250） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（250） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（250） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（250） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（250） |  |
| 65 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（16%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（40）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 66 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（20%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（50）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 67 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（18%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（44）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 68 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（21%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（52）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 69 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（26%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（64） |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（64）；`ch03_s20_yuanye` 上一场走完直接进（52）；`ch03_s18_yuanye` 上一场走完直接进（50）；`ch03_s17_shuge` 上一场走完直接进（44）；`ch03_s19_shishe` 上一场走完直接进（40） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（250） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（250） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（250） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 C「仍用添」（86）；`ch04_s01_zhaoyang` 选 B「写下曌」（82）；`ch04_s01_zhaoyang` 选 A「写下天」（82） |  |
| 75 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s02_hanyuan` 选 A「原议与答复同收」（250）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 76 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 5 次都经过它） | `ch04_s03_shuge` 选 A「原件归存，照权限查阅」（250）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 2 次都经过它） | `ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」（126）；`ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」（124）<br/>进入条件：flag.enthroned |  |
| 78 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（250） |  |
| 79 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（46）；`ch04_s05p_shuge` 选 G「独自过一阵」（45）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（43）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（40）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（38）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（30）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（8） |  |
| 80 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（3%） | `ch04_s05pe_shuge` 换场（8） |  |
| 81 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（242）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（63）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（62）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（58）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（38）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（8） |  |
| 82 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（63） |  |
| 83 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（23%） | `ch04_s05c_shuge` 换场（58） |  |
| 84 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（62） |  |
| 85 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（15%） | `ch04_s05c_shuge` 换场（38） |  |
| 86 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（250）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（24）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（23）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（23）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（23）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（19）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（19）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（17）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（15）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（4）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（3）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（2）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（1） |  |
| 87 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（50） |  |
| 88 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（13%） | `ch04_s05q_shuge` 换场（33） |  |
| 89 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（17%） | `ch04_s05q_shuge` 换场（44） |  |
| 90 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（46） |  |
| 91 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（250） |  |
| 92 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s05r_shuge` 换场（250）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 93 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s05z_yeting` 选 A「收好今日的交付凭」（250）<br/>进入条件：flag.enthroned |  |
| 94 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s06_zhaoyang` 上一场走完直接进（250）<br/>进入条件：flag.enthroned |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 A「颁行多方提名与异议办法」（250） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 A「收好今次交付的回凭」（250） |  |

## 3. 未竟之诏（`weijingzhizhao`）

判定：flag.enthroned。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 2 个结局都不成立。

走到这里的路 1585 条，不同的场次序列 1179 种，每条 72—86 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（954 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（333 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（298 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 ch04_nomination_closed（306）；缺 ch04_dissent_removed、ch04_originals_destroyed（275）；缺 ch04_originals_destroyed、ch04_nomination_closed（266）；缺 ch04_originals_destroyed（260）；缺 ch04_dissent_removed、ch04_nomination_closed（239）；缺 ch04_dissent_removed（239） |
| 无字之碑 | 缺 public_review（811）；缺 public_review、ch04_nomination_open（499）；缺 ch04_nomination_open（275） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（1585） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（1585） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（1585） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（795）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（790） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（1585） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（824）；`ch01_s04_shuge` 对诗赢（761） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（1585） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（806）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（779） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（823）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（762） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（830）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（755） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（807）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（778） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（1585） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（825）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（760） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（224）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（21%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（330）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（21%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（338）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（23%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（365）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s16_yuanye` 上一场走完直接进（365）；`ch01_s15_shishe` 上一场走完直接进（338）；`ch01_s14_yuanye` 上一场走完直接进（330）；`ch01_s12_shuge` 选 E「直接去找阿荻」（328）；`ch01_s13_shuge` 上一场走完直接进（224）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（802）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（783）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（1585） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（1585） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（803）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（782） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（1585） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（415）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（404）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（396）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（370） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（1585） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（804）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（781） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（552）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（541）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（492） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（823）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（762） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（537）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（534）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（514） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（1585） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（794）；`ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（791） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（1585） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（804）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（781） |  |
| 34 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（24%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（380）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 35 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（18%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（286）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（230）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（264）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（27%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（425） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s19_nvguan` 上一场走完直接进（425）；`ch02_s18_yuanye` 上一场走完直接进（380）；`ch02_s15_shuge` 上一场走完直接进（286）；`ch02_s16_yuanye` 上一场走完直接进（264）；`ch02_s17_shishe` 上一场走完直接进（230） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（803）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（782） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（1585） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（807）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（778） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 A「我在门边等你」（796）；`ch02_s22_shuge` 选 B「今日先走，你慢慢收」（789） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（1585） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（1585） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（546）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（522）；`ch02_s24_shuge` 选 C「我只约你明日论议」（517） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（927）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（658） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（813）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（772） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（806）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（779） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（816）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（769） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（823）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（762） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（795）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（790） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（1585） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（954）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（333）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（298） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（2%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（27）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（2%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（24）<br/>进入条件：flag.li_ch03_private_paused |  |
| 57 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（2%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（24）<br/>进入条件：flag.li_ch03_multi_told |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（688）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（633）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（82）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（72）；`ch03_s09a_yuanye` 上一场走完直接进（27）；`ch03_s09c_yuanye` 上一场走完直接进（24）；`ch03_s09b_yuanye` 上一场走完直接进（24）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（20）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（15） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（1585） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（1585） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（1585） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（1585） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（1585） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（1585） |  |
| 65 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（21%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（329）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 66 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（20%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（316）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 67 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（18%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（292）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 68 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（20%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（320）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 69 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（21%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（328） |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s20_yuanye` 上一场走完直接进（329）；`ch03_s21_nvguan` 上一场走完直接进（328）；`ch03_s19_shishe` 上一场走完直接进（320）；`ch03_s18_yuanye` 上一场走完直接进（316）；`ch03_s17_shuge` 上一场走完直接进（292） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（1585） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（1585） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（1585） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 C「仍用添」（548）；`ch04_s01_zhaoyang` 选 A「写下天」（538）；`ch04_s01_zhaoyang` 选 B「写下曌」（499） |  |
| 75 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 13 次都经过它） | `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」（832）；`ch04_s02_hanyuan` 选 A「原议与答复同收」（753）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 76 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 11 次都经过它） | `ch04_s03_shuge` 选 C「原件归存，照权限查阅」（526）；`ch04_s03_shuge` 选 B「确认焚毁原案，不可恢复」（478）；`ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」（306）；`ch04_s03_shuge` 选 A「原件归存，照权限查阅」（275）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 10 次都经过它） | `ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」（418）；`ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」（393）；`ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」（391）；`ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」（383）<br/>进入条件：flag.enthroned |  |
| 78 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（1585） |  |
| 79 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 G「独自过一阵」（352）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（304）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（268）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（237）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（221）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（144）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（59） |  |
| 80 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（59） |  |
| 81 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1526）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（417）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（332）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（274）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（195）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（59） |  |
| 82 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（12%） | `ch04_s05c_shuge` 换场（195） |  |
| 83 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（332） |  |
| 84 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（26%） | `ch04_s05c_shuge` 换场（417） |  |
| 85 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（17%） | `ch04_s05c_shuge` 换场（274） |  |
| 86 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（1585）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（149）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（139）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（133）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（123）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（117）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（98）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（77）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（67）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（22）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（18）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（14）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（4） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（260） |  |
| 88 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（304） |  |
| 89 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（10%） | `ch04_s05q_shuge` 换场（158） |  |
| 90 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（239） |  |
| 91 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（1585） |  |
| 92 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 15 次都经过它） | `ch04_s05r_shuge` 换场（1585）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 93 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 10 次都经过它） | `ch04_s05z_yeting` 选 B「收好今日的交付凭」（832）；`ch04_s05z_yeting` 选 C「收好今日的交付凭」（478）；`ch04_s05z_yeting` 选 A「收好今日的交付凭」（275）<br/>进入条件：flag.enthroned |  |
| 94 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 9 次都经过它） | `ch04_s06_zhaoyang` 上一场走完直接进（1585）<br/>进入条件：flag.enthroned |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 A「颁行多方提名与异议办法」（811）；`ch04_s07_hanyuan` 选 B「颁行仅由在位者提名的办法」（774） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 A「收好今次交付的回凭」（811）；`ch04_s17_nvguan` 选 B「收好今次交付的回凭」（774） |  |

## 4. 两席之间（`liangxizhijian`）

判定：flag.liqinghe_won 且 flag.liqinghe_together 且 非 flag.enthroned 且 非 flag.declined_crown 且 非 flag.founded_school 且 非 flag.road_agreement。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 3 个结局都不成立。

走到这里的路 92 条，不同的场次序列 88 种，每条 73—80 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `liqinghe_won` 要真：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成真 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（92 条）
- `liqinghe_together` 要真：
  - `ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」 写成真（51 条）
  - `ch04_s09_yuanye` 选 A「先留京，再约时辰」 写成真（22 条）
  - `ch04_s09_yuanye` 选 C「行路的事仍要去问」 写成真（11 条）
  - `ch04_s09_yuanye` 选 B「办学的事仍要去问」 写成真（8 条）
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
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（56）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（36） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（92） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（47）；`ch01_s04_shuge` 对诗输（45） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（92） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（49）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（43） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（46）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（46） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 A「先收六份，满额便明示」（51）；`ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（41） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（50）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（42） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（92） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（47）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（45） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（13）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（28%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（26）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（21%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（19）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（20%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（18）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s14_yuanye` 上一场走完直接进（26）；`ch01_s15_shishe` 上一场走完直接进（19）；`ch01_s16_yuanye` 上一场走完直接进（18）；`ch01_s12_shuge` 选 E「直接去找阿荻」（16）；`ch01_s13_shuge` 上一场走完直接进（13）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（53）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（39）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（92） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（92） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（51）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（41） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（92） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 C「我只核这卷，不约私见」（31）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（23）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（22）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（16） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（92） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（48）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（44） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（33）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（31）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（28） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 A「连往返按半日给俸」（52）；`ch02_s08_shuge` 选 B「按次给俸，往返另记」（40） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（38）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（31）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（23） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（92） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（54）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（38） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（92） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（50）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（42） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（20%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（18）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（28%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（26）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 36 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（23） |  |
| 37 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（14）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 38 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（12%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（11）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（26）；`ch02_s19_nvguan` 上一场走完直接进（23）；`ch02_s15_shuge` 上一场走完直接进（18）；`ch02_s16_yuanye` 上一场走完直接进（14）；`ch02_s17_shishe` 上一场走完直接进（11） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（48）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（44） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（92） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（52）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（40） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（53）；`ch02_s22_shuge` 选 A「我在门边等你」（39） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（92） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（92） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（32）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（31）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（29） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（71）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（21） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（51）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（41） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（47）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（45） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（49）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（43） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（54）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（38） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（51）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（41） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（92） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（92） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（1）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（1）<br/>进入条件：flag.li_ch03_private_paused |  |
| 57 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（37）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（29）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（13）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（8）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（3）；`ch03_s09c_yuanye` 上一场走完直接进（1）；`ch03_s09a_yuanye` 上一场走完直接进（1） |  |
| 58 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（92） |  |
| 59 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（92） |  |
| 60 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（92） |  |
| 61 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（92） |  |
| 62 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（92） |  |
| 63 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（92） |  |
| 64 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（18%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（17）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 65 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（13%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（12）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 66 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（41%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（13）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（13）；`ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（12） |  |
| 67 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（17%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（16）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 68 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（10%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（9）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 69 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（38）；`ch03_s20_yuanye` 上一场走完直接进（17）；`ch03_s19_shishe` 上一场走完直接进（16）；`ch03_s17_shuge` 上一场走完直接进（12）；`ch03_s18_yuanye` 上一场走完直接进（9） |  |
| 70 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（92） |  |
| 71 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（92） |  |
| 72 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（92） |  |
| 73 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（92） |  |
| 74 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（92）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 75 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（92） |  |
| 76 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（92） |  |
| 77 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（92）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（27）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（27）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（23） |  |
| 78 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（29%） | `ch04_s05c_shuge` 换场（27） |  |
| 79 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（29%） | `ch04_s05c_shuge` 换场（27） |  |
| 80 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（23） |  |
| 81 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（92）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（92） |  |
| 82 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s05q_shuge` 换场（92）<br/>上一场的另一条去向：`ch04_s05qa_shuge`（无进入条件，但本线的选项没有走向它）、`ch04_s05qb_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s05qc_shishe`（无进入条件，但本线的选项没有走向它）、`ch04_s05r_shuge`（无进入条件，但本线的选项没有走向它） |  |
| 83 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（92） |  |
| 84 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s05r_shuge` 换场（92）<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 85 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（92）<br/>进入条件：非 flag.enthroned |  |
| 86 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（45%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（41）<br/>进入条件：flag.liqinghe_won |  |
| 87 | `ch04_s11_nvguan` | 三日以后谁付 | 选出来的（48%） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（36）；`ch04_s09_yuanye` 选 B「办学的事仍要去问」（8）<br/>进入条件：flag.liqinghe_won |  |
| 88 | `ch04_s14_shuge` | 归期写在前面 | 选出来的（28%） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（15）；`ch04_s09_yuanye` 选 C「行路的事仍要去问」（11）<br/>进入条件：flag.liqinghe_won |  |
| 89 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s11_nvguan` 选 B「这回先不接」（44）；`ch04_s14_shuge` 选 B「这回不接，归期的纸我留着」（26）；`ch04_s09_yuanye` 选 A「先留京，再约时辰」（22）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s12_nvguan`（要 flag.ch04_school_contract）、`ch04_s14_shuge`（要 flag.liqinghe_won）、`ch04_s15_yilu`（要 flag.ch04_road_contract） |  |
| 90 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（92） |  |
| 91 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（92） |  |

## 5. 开门授字（`kaimenshouzi`）

判定：flag.founded_school 且 非 flag.enthroned 且 非 flag.declined_crown。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 4 个结局都不成立。

走到这里的路 611 条，不同的场次序列 570 种，每条 71—84 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `founded_school` 要真：
  - `ch04_s12_nvguan` 选 A「收好今日的课页」 写成真（611 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（611 条）
- `declined_crown` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（611 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（611） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（611） |
| 未竟之诏 | 缺 enthroned（611） |
| 两席之间 | 缺 liqinghe_together、非 founded_school（577）；缺 非 founded_school（34） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（611） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（611） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（611） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（311）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（300） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（611） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（310）；`ch01_s04_shuge` 对诗赢（301） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（611） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（308）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（303） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（323）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（288） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（311）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（300） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（310）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（301） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（611） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（308）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（303） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（16%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（97）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（20%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（120）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（20%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（124）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（23%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（139）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s16_yuanye` 上一场走完直接进（139）；`ch01_s12_shuge` 选 E「直接去找阿荻」（131）；`ch01_s15_shishe` 上一场走完直接进（124）；`ch01_s14_yuanye` 上一场走完直接进（120）；`ch01_s13_shuge` 上一场走完直接进（97）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（324）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（287）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（611） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（611） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（311）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（300） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（611） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 A「一起读。读完也想见你」（170）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（150）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（146）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（145） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（611） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（323）；`ch02_s06_yeting` 选 B「先付六件，余款催原项」（288） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（210）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（209）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（192） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 A「连往返按半日给俸」（319）；`ch02_s08_shuge` 选 B「按次给俸，往返另记」（292） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 C「这次我也没余力陪读」（224）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（200）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（187） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（611） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（309）；`ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（302） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（611） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（309）；`ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（302） |  |
| 34 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（155） |  |
| 35 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（14%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（85）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 36 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（100）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（29%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（177）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（94）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（177）；`ch02_s19_nvguan` 上一场走完直接进（155）；`ch02_s15_shuge` 上一场走完直接进（100）；`ch02_s16_yuanye` 上一场走完直接进（94）；`ch02_s17_shishe` 上一场走完直接进（85） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（328）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（283） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（611） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（322）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（289） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（332）；`ch02_s22_shuge` 选 A「我在门边等你」（279） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（611） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（611） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（205）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（205）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（201） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（402）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（209） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（316）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（295） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（320）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（291） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（326）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（285） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（308）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（303） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（309）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（302） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（611） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（611） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（7）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（8）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（4）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（288）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（227）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（32）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（27）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（10）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（8）；`ch03_s09b_yuanye` 上一场走完直接进（8）；`ch03_s09a_yuanye` 上一场走完直接进（7）；`ch03_s09c_yuanye` 上一场走完直接进（4） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（611） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（611） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（611） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（611） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（611） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（611） |  |
| 65 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（14%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（86）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 66 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（42%） | `ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（100）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（88）；`ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（70） |  |
| 67 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（16%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（97）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 68 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（15%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（90）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 69 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（13%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（80）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（258）；`ch03_s20_yuanye` 上一场走完直接进（97）；`ch03_s17_shuge` 上一场走完直接进（90）；`ch03_s19_shishe` 上一场走完直接进（86）；`ch03_s18_yuanye` 上一场走完直接进（80） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（611） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（611） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（611） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（611） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 14 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（611）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（611） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（125）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（115）；`ch04_s05p_shuge` 选 G「独自过一阵」（91）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（91）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（88）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（77）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（24） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（24） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（587）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（170）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（165）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（127）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（98）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（24） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（27%） | `ch04_s05c_shuge` 换场（165） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（127） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（28%） | `ch04_s05c_shuge` 换场（170） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（16%） | `ch04_s05c_shuge` 换场（98） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（611）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（60）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（58）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（50）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（49）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（43）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（43）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（42）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（34）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（6）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（5）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（4）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（2） |  |
| 85 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（98） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（122） |  |
| 87 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（93） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（14%） | `ch04_s05q_shuge` 换场（83） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（611） |  |
| 90 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 选出来的（6%） | `ch04_s05r_shuge` 换场（34） |  |
| 91 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 20 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（577）；`ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（34）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 92 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（32%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（196）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s11_nvguan` | 三日以后谁付 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（415）；`ch04_s09_yuanye` 选 E「今后只谈公事，我去问办学」（189）；`ch04_s09_yuanye` 选 B「办学的事仍要去问」（7）<br/>进入条件：flag.liqinghe_won<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s14_shuge`（要 flag.liqinghe_won） |  |
| 94 | `ch04_s12_nvguan` | 半日也算来过 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s11_nvguan` 选 A「按这一月的约定办」（611）<br/>进入条件：flag.ch04_school_contract<br/>上一场的另一条去向：`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s11_nvguan`（要 flag.liqinghe_won） | ✓ |
| 95 | `ch04_s13_nvguan` | 她们收自己的席 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s12_nvguan` 选 A「收好今日的课页」（611）<br/>进入条件：flag.founded_school | ✓ |
| 96 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s13_nvguan` 上一场走完直接进（611） |  |
| 97 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（611） |  |

## 6. 不受（`bushou`）

判定：flag.declined_crown 且 非 flag.enthroned。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 5 个结局都不成立。

走到这里的路 2084 条，不同的场次序列 1426 种，每条 69—85 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `declined_crown` 要真：
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（1284 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（405 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（395 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（1284 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（405 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（395 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（2084） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（2084） |
| 未竟之诏 | 缺 enthroned（2084） |
| 两席之间 | 缺 liqinghe_won、liqinghe_together、非 declined_crown（2084） |
| 开门授字 | 缺 founded_school、非 declined_crown（2084） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（2084） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（2084） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（2084） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（1045）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（1039） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（2084） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（1075）；`ch01_s04_shuge` 对诗赢（1009） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（2084） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（1057）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（1027） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（1084）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（1000） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（1048）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（1036） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（1068）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（1016） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（2084） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（1056）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（1028） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（299）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（22%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（455）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（20%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（416）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（23%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（482）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s16_yuanye` 上一场走完直接进（482）；`ch01_s14_yuanye` 上一场走完直接进（455）；`ch01_s12_shuge` 选 E「直接去找阿荻」（432）；`ch01_s15_shishe` 上一场走完直接进（416）；`ch01_s13_shuge` 上一场走完直接进（299）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（1052）；`ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（1032）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（2084） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（2084） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（1065）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（1019） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（2084） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 A「一起读。读完也想见你」（575）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（517）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（514）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（478） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（2084） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（1054）；`ch02_s06_yeting` 选 B「先付六件，余款催原项」（1030） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（720）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（686）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（678） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（1059）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（1025） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（720）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（690）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（674） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（2084） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（1085）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（999） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（2084） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（1056）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（1028） |  |
| 34 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（329）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 35 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（513） |  |
| 36 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（340）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（28%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（575）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（327）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（575）；`ch02_s19_nvguan` 上一场走完直接进（513）；`ch02_s15_shuge` 上一场走完直接进（340）；`ch02_s17_shishe` 上一场走完直接进（329）；`ch02_s16_yuanye` 上一场走完直接进（327） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（1066）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（1018） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（2084） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（1061）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（1023） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（1086）；`ch02_s22_shuge` 选 A「我在门边等你」（998） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（2084） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（2084） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（708）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（698）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（678） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（1227）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（857） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（1068）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（1016） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（1058）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（1026） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（1065）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（1019） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（1052）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（1032） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（1059）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（1025） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（2084） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（1284）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（405）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（395） |  |
| 55 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（17）<br/>进入条件：flag.li_ch03_multi_told |  |
| 56 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（22）<br/>进入条件：flag.li_ch03_private_paused |  |
| 57 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（25）<br/>进入条件：flag.li_ch03_only_intent |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（892）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（871）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（107）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（103）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（31）；`ch03_s09a_yuanye` 上一场走完直接进（25）；`ch03_s09c_yuanye` 上一场走完直接进（22）；`ch03_s09b_yuanye` 上一场走完直接进（17）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（16） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（2084） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」（2084） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」（2084） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（2084） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（2084） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（2084） |  |
| 65 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（46%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（332）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（309）；`ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（309） |  |
| 66 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（14%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（282）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 67 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（14%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（289）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 68 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（13%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（277）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 69 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（14%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（286）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（950）；`ch03_s20_yuanye` 上一场走完直接进（289）；`ch03_s19_shishe` 上一场走完直接进（286）；`ch03_s18_yuanye` 上一场走完直接进（282）；`ch03_s17_shuge` 上一场走完直接进（277） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（2084） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（2084） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（2084） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 D「领回自己的东西」（2084） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 26 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（2084）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（2084） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 G「独自过一阵」（369）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（368）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（364）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（312）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（298）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（284）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（89） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（89） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1995）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（508）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（493）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（446）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（333）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（89） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（24%） | `ch04_s05c_shuge` 换场（508） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（446） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（24%） | `ch04_s05c_shuge` 换场（493） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（16%） | `ch04_s05c_shuge` 换场（333） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（2084）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（193）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（183）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（172）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（171）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（156）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（153）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（141）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（131）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（31）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（28）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（27）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（14） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（391） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（356） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（338） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（315） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（2084） |  |
| 90 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 9 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（2084）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 91 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 21 次都经过它） | `ch04_s08z_shuge` 选 A「今日不定去处，出去吃点东西」（2084）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s14_shuge`（要 flag.liqinghe_won） |  |
| 92 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（2084） |  |
| 93 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（2084） |  |

## 7. 关山有信（`guanshanyouxin`）

判定：flag.road_agreement 且 非 flag.enthroned 且 非 flag.declined_crown。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 6 个结局都不成立。

走到这里的路 615 条，不同的场次序列 576 种，每条 71—86 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `road_agreement` 要真：
  - `ch04_s15_yilu` 选 A「随车到第一处交接」 写成真（615 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（615 条）
- `declined_crown` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（615 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（615） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（615） |
| 未竟之诏 | 缺 enthroned（615） |
| 两席之间 | 缺 liqinghe_together、非 road_agreement（575）；缺 非 road_agreement（40） |
| 开门授字 | 缺 founded_school（615） |
| 不受 | 缺 declined_crown（615） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（615） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（615） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（615） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（313）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（302） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（615） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（311）；`ch01_s04_shuge` 对诗输（304） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（615） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（315）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（300） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（319）；`ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（296） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 A「先收六份，满额便明示」（316）；`ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（299） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（326）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（289） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（615） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（308）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（307） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（13%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（81）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（22%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（137）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（22%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（138）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（20%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（125）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（138）；`ch01_s14_yuanye` 上一场走完直接进（137）；`ch01_s12_shuge` 选 E「直接去找阿荻」（134）；`ch01_s16_yuanye` 上一场走完直接进（125）；`ch01_s13_shuge` 上一场走完直接进（81）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（324）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（291）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（615） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（615） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（340）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（275） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（615） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（168）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（156）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（149）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（142） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（615） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（314）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（301） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（220）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（208）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（187） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（333）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（282） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（225）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（205）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（185） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（615） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（317）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（298） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（615） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（309）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（306） |  |
| 34 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（18%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（111）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 35 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（101）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 36 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（155） |  |
| 37 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（97）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 38 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（151）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s19_nvguan` 上一场走完直接进（155）；`ch02_s18_yuanye` 上一场走完直接进（151）；`ch02_s16_yuanye` 上一场走完直接进（111）；`ch02_s17_shishe` 上一场走完直接进（101）；`ch02_s15_shuge` 上一场走完直接进（97） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（330）；`ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（285） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（615） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（319）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（296） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（308）；`ch02_s22_shuge` 选 A「我在门边等你」（307） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（615） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（615） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（216）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（205）；`ch02_s24_shuge` 选 C「我只约你明日论议」（194） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（406）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（209） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（324）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（291） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（315）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（300） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（313）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（302） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（311）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（304） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（311）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（304） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（615） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（615） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（0%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（3）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（0%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（2）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（2%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（10）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（260）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（252）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（38）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（34）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（10）；`ch03_s09c_yuanye` 上一场走完直接进（10）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（6）；`ch03_s09a_yuanye` 上一场走完直接进（3）；`ch03_s09b_yuanye` 上一场走完直接进（2） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（615） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（615） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（615） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（615） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（615） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（615） |  |
| 65 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（17%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（104）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 66 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（44%） | `ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（96）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（87）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（86） |  |
| 67 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（10%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（64）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 68 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（16%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（97）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 69 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（13%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（81）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（269）；`ch03_s18_yuanye` 上一场走完直接进（104）；`ch03_s20_yuanye` 上一场走完直接进（97）；`ch03_s19_shishe` 上一场走完直接进（81）；`ch03_s17_shuge` 上一场走完直接进（64） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（615） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（615） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（615） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（615） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 12 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（615）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（615） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（117）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（111）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（104）；`ch04_s05p_shuge` 选 G「独自过一阵」（102）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（79）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（77）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（25） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（25） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（590）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（173）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（155）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（127）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（110）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（25） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（28%） | `ch04_s05c_shuge` 换场（173） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（127） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（155） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（18%） | `ch04_s05c_shuge` 换场（110） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（615）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（61）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（59）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（52）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（49）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（47）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（40）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（39）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（32）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（8）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（6）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（4）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（3） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（119） |  |
| 86 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（13%） | `ch04_s05q_shuge` 换场（84） |  |
| 87 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（114） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（13%） | `ch04_s05q_shuge` 换场（83） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（615） |  |
| 90 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 选出来的（7%） | `ch04_s05r_shuge` 换场（40） |  |
| 91 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 17 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（575）；`ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（40）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 92 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（38%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（232）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s14_shuge` | 归期写在前面 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（383）；`ch04_s09_yuanye` 选 F「今后只谈公事，我去问行路」（217）；`ch04_s09_yuanye` 选 C「行路的事仍要去问」（15）<br/>进入条件：flag.liqinghe_won<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s11_nvguan`（要 flag.liqinghe_won） |  |
| 94 | `ch04_s15_yilu` | 各自领一份 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s14_shuge` 选 A「接这一月的差，明早领款」（615）<br/>进入条件：flag.ch04_road_contract<br/>上一场的另一条去向：`ch04_s10_yuanye`（要 非 flag.enthroned） | ✓ |
| 95 | `ch04_s16_yilu` | 驿旁不是归处 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s15_yilu` 选 A「随车到第一处交接」（615）<br/>进入条件：flag.road_agreement | ✓ |
| 96 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s16_yilu` 上一场走完直接进（615） |  |
| 97 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（615） |  |

## 8. 纸上有名（`zhishangyouming`）

判定：无条件（兜底：前面七个都不成立时落到这里）。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 7 个结局都不成立。

走到这里的路 1205 条，不同的场次序列 1132 种，每条 70—83 场。

### 判定用到的 flag 是在哪里写下的

无：兜底结局不看 flag。

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（1205） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（1205） |
| 未竟之诏 | 缺 enthroned（1205） |
| 两席之间 | 缺 liqinghe_together（1205） |
| 开门授字 | 缺 founded_school（1205） |
| 不受 | 缺 declined_crown（1205） |
| 关山有信 | 缺 road_agreement（1205） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（1205） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（1205） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（1205） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（610）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（595） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（1205） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（634）；`ch01_s04_shuge` 对诗输（571） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（1205） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（604）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（601） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（613）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（592） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（626）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（579） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（614）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（591） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（1205） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（608）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（597） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（15%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（178）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（22%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（262）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（21%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（259）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（21%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（255）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s14_yuanye` 上一场走完直接进（262）；`ch01_s15_shishe` 上一场走完直接进（259）；`ch01_s16_yuanye` 上一场走完直接进（255）；`ch01_s12_shuge` 选 E「直接去找阿荻」（251）；`ch01_s13_shuge` 上一场走完直接进（178）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（615）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（590）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（1205） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（1205） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（639）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（566） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（1205） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（310）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（303）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（297）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（295） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（1205） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（614）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（591） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（430）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（402）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（373） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（605）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（600） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（409）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（404）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（392） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（1205） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（621）；`ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（584） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（1205） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（624）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（581） |  |
| 34 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（307）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 35 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（188）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（192）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（312） |  |
| 38 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（206）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s19_nvguan` 上一场走完直接进（312）；`ch02_s18_yuanye` 上一场走完直接进（307）；`ch02_s16_yuanye` 上一场走完直接进（206）；`ch02_s17_shishe` 上一场走完直接进（192）；`ch02_s15_shuge` 上一场走完直接进（188） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（632）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（573） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（1205） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（606）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（599） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 A「我在门边等你」（606）；`ch02_s22_shuge` 选 B「今日先走，你慢慢收」（599） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（1205） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（1205） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（412）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（400）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（393） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（788）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（417） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（603）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（602） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（612）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（593） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（631）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（574） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（608）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（597） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（606）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（599） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（1205） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（1205） |  |
| 55 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（2%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（20）<br/>进入条件：flag.li_ch03_multi_told |  |
| 56 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（14）<br/>进入条件：flag.li_ch03_only_intent |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（8）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（539）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（519）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（51）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（41）；`ch03_s09b_yuanye` 上一场走完直接进（20）；`ch03_s09a_yuanye` 上一场走完直接进（14）；`ch03_s09c_yuanye` 上一场走完直接进（8）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（7）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（6） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（1205） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（1205） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（1205） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（1205） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（1205） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（1205） |  |
| 65 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（14%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（168）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 66 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（46%） | `ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（196）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（184）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（177） |  |
| 67 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（12%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（143）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 68 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（13%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（157）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 69 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（15%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（180）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（557）；`ch03_s20_yuanye` 上一场走完直接进（180）；`ch03_s18_yuanye` 上一场走完直接进（168）；`ch03_s19_shishe` 上一场走完直接进（157）；`ch03_s17_shuge` 上一场走完直接进（143） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（1205） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（1205） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（1205） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（1205） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 13 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（1205）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（1205） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（237）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（222）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（220）；`ch04_s05p_shuge` 选 G「独自过一阵」（204）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（170）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（108）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（44） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（44） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1161）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（315）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（310）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（242）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（165）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（44） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（26%） | `ch04_s05c_shuge` 换场（310） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（20%） | `ch04_s05c_shuge` 换场（242） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（26%） | `ch04_s05c_shuge` 换场（315） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（14%） | `ch04_s05c_shuge` 换场（165） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（1205）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（124）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（112）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（110）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（108）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（108）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（100）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（79）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（20）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（16）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（10）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（9） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（242） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（242） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（188） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（10%） | `ch04_s05q_shuge` 换场（124） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（1205） |  |
| 90 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 14 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（1205）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 91 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（47%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（565）<br/>进入条件：flag.liqinghe_won |  |
| 92 | `ch04_s11_nvguan` | 三日以后谁付 | 选出来的（41%） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（335）；`ch04_s09_yuanye` 选 E「今后只谈公事，我去问办学」（163）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s14_shuge` | 归期写在前面 | 选出来的（38%） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（305）；`ch04_s09_yuanye` 选 F「今后只谈公事，我去问行路」（150）<br/>进入条件：flag.liqinghe_won |  |
| 94 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s11_nvguan` 选 B「这回先不接」（498）；`ch04_s14_shuge` 选 B「这回不接，归期的纸我留着」（455）；`ch04_s09_yuanye` 选 D「今后只谈公事，我先留京」（252）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s12_nvguan`（要 flag.ch04_school_contract）、`ch04_s14_shuge`（要 flag.liqinghe_won）、`ch04_s15_yilu`（要 flag.ch04_road_contract） |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（1205） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（1205） |  |

## 附：必经的复核记录

抽样里「每条都经过」、但图上绕得开的场，都朝那个结局专门绕着走过（每场最多 60 次，绕开一次就停）。绕开了的，那条路已经算进这条线，这一场随之变成「选出来的」。

- 复核 39 处，绕开 0 处，留作必经 39 处。

| 结局 | 场次 | 结果 |
|---|---|---|
| 不受 | `ch04_s08_shuge` | 没绕开：试 60 次，26 次走到本结局 |
| 不受 | `ch04_s08z_shuge` | 没绕开：试 60 次，9 次走到本结局 |
| 不受 | `ch04_s10_yuanye` | 没绕开：试 60 次，21 次走到本结局 |
| 关山有信 | `ch04_s08_shuge` | 没绕开：试 60 次，12 次走到本结局 |
| 关山有信 | `ch04_s08z_shuge` | 没绕开：试 60 次，17 次走到本结局 |
| 关山有信 | `ch04_s14_shuge` | 没绕开：试 60 次，0 次走到本结局 |
| 关山有信 | `ch04_s15_yilu` | 没绕开：试 60 次，0 次走到本结局 |
| 关山有信 | `ch04_s16_yilu` | 没绕开：试 60 次，0 次走到本结局 |
| 开门授字 | `ch04_s08_shuge` | 没绕开：试 60 次，14 次走到本结局 |
| 开门授字 | `ch04_s08z_shuge` | 没绕开：试 60 次，20 次走到本结局 |
| 开门授字 | `ch04_s11_nvguan` | 没绕开：试 60 次，0 次走到本结局 |
| 开门授字 | `ch04_s12_nvguan` | 没绕开：试 60 次，0 次走到本结局 |
| 开门授字 | `ch04_s13_nvguan` | 没绕开：试 60 次，0 次走到本结局 |
| 两席之间 | `ch04_s05qd_yuanye` | 没绕开：试 60 次，1 次走到本结局 |
| 两席之间 | `ch04_s05rl_yuanye` | 没绕开：试 60 次，1 次走到本结局 |
| 两席之间 | `ch04_s08_shuge` | 没绕开：试 60 次，1 次走到本结局 |
| 两席之间 | `ch04_s08z_shuge` | 没绕开：试 60 次，1 次走到本结局 |
| 两席之间 | `ch04_s10_yuanye` | 没绕开：试 60 次，0 次走到本结局 |
| 满殿无声 | `ch04_s03_shuge` | 没绕开：试 60 次，3 次走到本结局 |
| 满殿无声 | `ch04_s04_zhaoyang` | 没绕开：试 60 次，4 次走到本结局 |
| 满殿无声 | `ch04_s05_yeting` | 没绕开：试 60 次，1 次走到本结局 |
| 满殿无声 | `ch04_s05z_yeting` | 没绕开：试 60 次，6 次走到本结局 |
| 满殿无声 | `ch04_s06_zhaoyang` | 没绕开：试 60 次，4 次走到本结局 |
| 满殿无声 | `ch04_s07_hanyuan` | 没绕开：试 60 次，0 次走到本结局 |
| 未竟之诏 | `ch04_s03_shuge` | 没绕开：试 60 次，13 次走到本结局 |
| 未竟之诏 | `ch04_s04_zhaoyang` | 没绕开：试 60 次，11 次走到本结局 |
| 未竟之诏 | `ch04_s05_yeting` | 没绕开：试 60 次，10 次走到本结局 |
| 未竟之诏 | `ch04_s05z_yeting` | 没绕开：试 60 次，15 次走到本结局 |
| 未竟之诏 | `ch04_s06_zhaoyang` | 没绕开：试 60 次，10 次走到本结局 |
| 未竟之诏 | `ch04_s07_hanyuan` | 没绕开：试 60 次，9 次走到本结局 |
| 无字之碑 | `ch04_s03_shuge` | 没绕开：试 60 次，1 次走到本结局 |
| 无字之碑 | `ch04_s04_zhaoyang` | 没绕开：试 60 次，5 次走到本结局 |
| 无字之碑 | `ch04_s05_yeting` | 没绕开：试 60 次，2 次走到本结局 |
| 无字之碑 | `ch04_s05z_yeting` | 没绕开：试 60 次，3 次走到本结局 |
| 无字之碑 | `ch04_s06_zhaoyang` | 没绕开：试 60 次，3 次走到本结局 |
| 无字之碑 | `ch04_s07_hanyuan` | 没绕开：试 60 次，3 次走到本结局 |
| 纸上有名 | `ch04_s08_shuge` | 没绕开：试 60 次，13 次走到本结局 |
| 纸上有名 | `ch04_s08z_shuge` | 没绕开：试 60 次，14 次走到本结局 |
| 纸上有名 | `ch04_s10_yuanye` | 没绕开：试 60 次，0 次走到本结局 |

