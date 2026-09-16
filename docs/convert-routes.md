# 八条线的场次骨架

> 由 `tools/convert-routes.ts` 生成（CC2，D-115 第一步），交 ChatGPT 写《八条线的故事线》。不要手改；数据变了重跑这个脚本。
> 读的是 `src/data/converted/`（数据指纹 `aba804934c0b`，对应 manifest 里 14 份原文的那一次转换），不读剧本原文。

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
| 满殿无声 | flag.enthroned 且 flag.ch04_dissent_removed 且 flag.ch04_originals_destroyed 且 flag.ch04_nomination_closed | 284 | 257 | 72—80 | 70 | 24 | 0 |
| 无字之碑 | flag.enthroned 且 flag.public_review 且 flag.ch04_nomination_open | 252 | 245 | 72—84 | 70 | 26 | 0 |
| 未竟之诏 | flag.enthroned | 1576 | 1173 | 72—86 | 70 | 26 | 0 |
| 两席之间 | flag.liqinghe_won 且 flag.liqinghe_together 且 非 flag.enthroned 且 非 flag.declined_crown 且 非 flag.founded_school 且 非 flag.road_agreement | 91 | 87 | 73—80 | 69 | 22 | 0 |
| 开门授字 | flag.founded_school 且 非 flag.enthroned 且 非 flag.declined_crown | 614 | 577 | 71—84 | 69 | 28 | 2 |
| 不受 | flag.declined_crown 且 非 flag.enthroned | 2068 | 1413 | 69—85 | 67 | 26 | 0 |
| 关山有信 | flag.road_agreement 且 非 flag.enthroned 且 非 flag.declined_crown | 634 | 593 | 71—86 | 69 | 28 | 2 |
| 纸上有名 | 无条件（兜底：前面七个都不成立时落到这里） | 1201 | 1130 | 70—83 | 67 | 29 | 0 |

## 1. 满殿无声（`mandianwusheng`）

判定：flag.enthroned 且 flag.ch04_dissent_removed 且 flag.ch04_originals_destroyed 且 flag.ch04_nomination_closed。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 0 个结局都不成立。

走到这里的路 284 条，不同的场次序列 257 种，每条 72—80 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（175 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（59 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（50 条）
- `ch04_dissent_removed` 要真：
  - `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真 ← 这一项要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」 写成真（284 条）
- `ch04_originals_destroyed` 要真：
  - `ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」 写成真 ← 这一项要 `ch04_originals_burn_order` 来自 `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真（它又要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」 写成真）（143 条）
  - `ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」 写成真 ← 这一项要 `ch04_originals_burn_order` 来自 `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真（它又要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」 写成真）（141 条）
- `ch04_nomination_closed` 要真：
  - `ch04_s17_nvguan` 选 B「收好今次交付的回凭」 写成真 ← 这一项要 `ch04_nomination_closed_order` 来自 `ch04_s07_hanyuan` 选 B「颁行仅由在位者提名的办法」 写成真（284 条）

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（284） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（284） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（284） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（146）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（138） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（284） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（143）；`ch01_s04_shuge` 对诗赢（141） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（284） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（147）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（137） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（151）；`ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（133） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 A「先收六份，满额便明示」（149）；`ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（135） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（154）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（130） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（284） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（152）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（132） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（40）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（26%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（73）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（20%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（56）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（20%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（56）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s14_yuanye` 上一场走完直接进（73）；`ch01_s12_shuge` 选 E「直接去找阿荻」（59）；`ch01_s16_yuanye` 上一场走完直接进（56）；`ch01_s15_shishe` 上一场走完直接进（56）；`ch01_s13_shuge` 上一场走完直接进（40）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（150）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（134）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（284） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（284） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（143）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（141） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（284） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（78）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（77）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（77）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（52） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（284） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（157）；`ch02_s06_yeting` 选 B「先付六件，余款催原项」（127） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（98）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（96）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（90） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 A「连往返按半日给俸」（153）；`ch02_s08_shuge` 选 B「按次给俸，往返另记」（131） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 C「这次我也没余力陪读」（106）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（95）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（83） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（284） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（149）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（135） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（284） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（149）；`ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（135） |  |
| 34 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（29%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（83）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 35 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（71） |  |
| 36 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（44）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 37 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（18%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（50）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 38 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（13%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（36）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（83）；`ch02_s19_nvguan` 上一场走完直接进（71）；`ch02_s15_shuge` 上一场走完直接进（50）；`ch02_s16_yuanye` 上一场走完直接进（44）；`ch02_s17_shishe` 上一场走完直接进（36） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（149）；`ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（135） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（284） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（154）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（130） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 A「我在门边等你」（147）；`ch02_s22_shuge` 选 B「今日先走，你慢慢收」（137） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（284） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（284） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（107）；`ch02_s24_shuge` 选 C「我只约你明日论议」（93）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（84） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（167）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（117） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（152）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（132） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（150）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（134） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（153）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（131） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（155）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（129） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（152）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（132） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（284） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（175）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（59）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（50） |  |
| 55 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（2%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（5）<br/>进入条件：flag.li_ch03_private_paused |  |
| 56 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（2%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（5）<br/>进入条件：flag.li_ch03_only_intent |  |
| 57 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（3）<br/>进入条件：flag.li_ch03_multi_told |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（115）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（115）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（18）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（16）；`ch03_s09a_yuanye` 上一场走完直接进（5）；`ch03_s09c_yuanye` 上一场走完直接进（5）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（4）；`ch03_s09b_yuanye` 上一场走完直接进（3）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（3） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（284） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（284） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（284） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（284） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（284） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（284） |  |
| 65 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（17%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（49）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 66 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（21%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（59）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 67 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（21%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（60）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 68 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（20%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（57） |  |
| 69 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（21%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（59）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s20_yuanye` 上一场走完直接进（60）；`ch03_s18_yuanye` 上一场走完直接进（59）；`ch03_s17_shuge` 上一场走完直接进（59）；`ch03_s21_nvguan` 上一场走完直接进（57）；`ch03_s19_shishe` 上一场走完直接进（49） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（284） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（284） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（284） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 B「写下曌」（100）；`ch04_s01_zhaoyang` 选 A「写下天」（93）；`ch04_s01_zhaoyang` 选 C「仍用添」（91） |  |
| 75 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」（284）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 76 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 4 次都经过它） | `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」（284）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」（143）；`ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」（141）<br/>进入条件：flag.enthroned |  |
| 78 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（284） |  |
| 79 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 G「独自过一阵」（61）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（59）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（54）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（54）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（49）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（7） |  |
| 80 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（2%） | `ch04_s05pe_shuge` 换场（7） |  |
| 81 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（277）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（62）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（61）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（47）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（7） |  |
| 82 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（61） |  |
| 83 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（22%） | `ch04_s05c_shuge` 换场（62） |  |
| 84 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（17%） | `ch04_s05c_shuge` 换场（47） |  |
| 85 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（284）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（35）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（34）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（26）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（23）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（22）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（21）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（4）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（2）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（1） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（58） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（57） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（53） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（284） |  |
| 90 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 6 次都经过它） | `ch04_s05r_shuge` 换场（284）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 91 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 4 次都经过它） | `ch04_s05z_yeting` 选 B「收好今日的交付凭」（284）<br/>进入条件：flag.enthroned |  |
| 92 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s06_zhaoyang` 上一场走完直接进（284）<br/>进入条件：flag.enthroned |  |
| 93 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 B「颁行仅由在位者提名的办法」（284） |  |
| 94 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 B「收好今次交付的回凭」（284） |  |

## 2. 无字之碑（`wuzibei`）

判定：flag.enthroned 且 flag.public_review 且 flag.ch04_nomination_open。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 1 个结局都不成立。

走到这里的路 252 条，不同的场次序列 245 种，每条 72—84 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（158 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（60 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（34 条）
- `public_review` 要真：
  - `ch04_s05z_yeting` 选 A「收好今日的交付凭」 写成真 ← 这一项要 `ch04_dissent_retained` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真（它又要 `ch04_dissent_keep_order` 来自 `ch04_s02_hanyuan` 选 A「原议与答复同收」 写成真）；还要 `ch04_originals_retained` 来自 `ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」 写成真（它又要 `ch04_originals_keep_order` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真）（127 条）
  - `ch04_s05z_yeting` 选 A「收好今日的交付凭」 写成真 ← 这一项要 `ch04_dissent_retained` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真（它又要 `ch04_dissent_keep_order` 来自 `ch04_s02_hanyuan` 选 A「原议与答复同收」 写成真）；还要 `ch04_originals_retained` 来自 `ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」 写成真（它又要 `ch04_originals_keep_order` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真）（125 条）
- `ch04_nomination_open` 要真：
  - `ch04_s17_nvguan` 选 A「收好今次交付的回凭」 写成真 ← 这一项要 `ch04_nomination_open_order` 来自 `ch04_s07_hanyuan` 选 A「颁行多方提名与异议办法」 写成真（252 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（252） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（252） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（252） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（252） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（136）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（116） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（252） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（135）；`ch01_s04_shuge` 对诗输（117） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（252） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（128）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（124） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（128）；`ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（124） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（132）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（120） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（132）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（120） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（252） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（131）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（121） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（15%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（39）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（21%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（53）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（21%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（53）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（20%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（50）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s12_shuge` 选 E「直接去找阿荻」（57）；`ch01_s14_yuanye` 上一场走完直接进（53）；`ch01_s15_shishe` 上一场走完直接进（53）；`ch01_s16_yuanye` 上一场走完直接进（50）；`ch01_s13_shuge` 上一场走完直接进（39）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（128）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（124）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（252） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（252） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（131）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（121） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（252） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（80）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（71）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（65）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（36） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（252） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（130）；`ch02_s06_yeting` 选 B「先付六件，余款催原项」（122） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（87）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（83）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（82） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（132）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（120） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 C「这次我也没余力陪读」（94）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（82）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（76） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（252） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（140）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（112） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（252） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（128）；`ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（124） |  |
| 34 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（62） |  |
| 35 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（30%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（75）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（37）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（43）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 38 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（14%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（35）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（75）；`ch02_s19_nvguan` 上一场走完直接进（62）；`ch02_s15_shuge` 上一场走完直接进（43）；`ch02_s17_shishe` 上一场走完直接进（37）；`ch02_s16_yuanye` 上一场走完直接进（35） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（131）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（121） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（252） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（129）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（123） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（150）；`ch02_s22_shuge` 选 A「我在门边等你」（102） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（252） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（252） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（86）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（84）；`ch02_s24_shuge` 选 C「我只约你明日论议」（82） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（142）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（110） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（139）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（113） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（133）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（119） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（137）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（115） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（136）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（116） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（127）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（125） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（252） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（158）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（60）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（34） |  |
| 55 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（2%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（4）<br/>进入条件：flag.li_ch03_multi_told |  |
| 56 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（3%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（7）<br/>进入条件：flag.li_ch03_private_paused |  |
| 57 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（0%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（1）<br/>进入条件：flag.li_ch03_only_intent |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（110）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（98）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（15）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（14）；`ch03_s09c_yuanye` 上一场走完直接进（7）；`ch03_s09b_yuanye` 上一场走完直接进（4）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（2）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（1）；`ch03_s09a_yuanye` 上一场走完直接进（1） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（252） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（252） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（252） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（252） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（252） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（252） |  |
| 65 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（19%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（48）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 66 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（17%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（43）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 67 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（15%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（39）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 68 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（21%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（53）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 69 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（27%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（69） |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（69）；`ch03_s20_yuanye` 上一场走完直接进（53）；`ch03_s18_yuanye` 上一场走完直接进（48）；`ch03_s17_shuge` 上一场走完直接进（43）；`ch03_s19_shishe` 上一场走完直接进（39） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（252） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（252） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（252） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 C「仍用添」（86）；`ch04_s01_zhaoyang` 选 B「写下曌」（85）；`ch04_s01_zhaoyang` 选 A「写下天」（81） |  |
| 75 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s02_hanyuan` 选 A「原议与答复同收」（252）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 76 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 5 次都经过它） | `ch04_s03_shuge` 选 A「原件归存，照权限查阅」（252）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 2 次都经过它） | `ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」（127）；`ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」（125）<br/>进入条件：flag.enthroned |  |
| 78 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（252） |  |
| 79 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 G「独自过一阵」（47）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（45）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（43）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（39）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（39）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（31）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（8） |  |
| 80 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（3%） | `ch04_s05pe_shuge` 换场（8） |  |
| 81 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（244）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（64）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（60）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（55）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（38）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（8） |  |
| 82 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（24%） | `ch04_s05c_shuge` 换场（60） |  |
| 83 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（22%） | `ch04_s05c_shuge` 换场（55） |  |
| 84 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（64） |  |
| 85 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（15%） | `ch04_s05c_shuge` 换场（38） |  |
| 86 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（252）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（24）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（23）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（22）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（22）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（20）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（19）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（17）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（16）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（5）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（3）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（1）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（1） |  |
| 87 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（50） |  |
| 88 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（13%） | `ch04_s05q_shuge` 换场（34） |  |
| 89 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（17%） | `ch04_s05q_shuge` 换场（43） |  |
| 90 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（46） |  |
| 91 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（252） |  |
| 92 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s05r_shuge` 换场（252）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 93 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s05z_yeting` 选 A「收好今日的交付凭」（252）<br/>进入条件：flag.enthroned |  |
| 94 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s06_zhaoyang` 上一场走完直接进（252）<br/>进入条件：flag.enthroned |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 A「颁行多方提名与异议办法」（252） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 A「收好今次交付的回凭」（252） |  |

## 3. 未竟之诏（`weijingzhizhao`）

判定：flag.enthroned。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 2 个结局都不成立。

走到这里的路 1576 条，不同的场次序列 1173 种，每条 72—86 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（941 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（338 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（297 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 ch04_nomination_closed（309）；缺 ch04_dissent_removed、ch04_originals_destroyed（273）；缺 ch04_originals_destroyed、ch04_nomination_closed（262）；缺 ch04_originals_destroyed（254）；缺 ch04_dissent_removed、ch04_nomination_closed（240）；缺 ch04_dissent_removed（238） |
| 无字之碑 | 缺 public_review（811）；缺 public_review、ch04_nomination_open（492）；缺 ch04_nomination_open（273） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（1576） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（1576） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（1576） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（789）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（787） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（1576） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（813）；`ch01_s04_shuge` 对诗赢（763） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（1576） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（801）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（775） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（823）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（753） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（820）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（756） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（800）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（776） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（1576） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（812）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（764） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（225）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（21%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（327）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（21%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（336）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（23%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（361）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s16_yuanye` 上一场走完直接进（361）；`ch01_s15_shishe` 上一场走完直接进（336）；`ch01_s14_yuanye` 上一场走完直接进（327）；`ch01_s12_shuge` 选 E「直接去找阿荻」（327）；`ch01_s13_shuge` 上一场走完直接进（225）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（796）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（780）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（1576） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（1576） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（799）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（777） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（1576） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（406）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（404）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（396）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（370） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（1576） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（798）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（778） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（543）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（538）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（495） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（819）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（757） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（532）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（525）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（519） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（1576） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（794）；`ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（782） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（1576） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（794）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（782） |  |
| 34 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（24%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（386）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 35 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（18%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（286）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 36 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（259）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 37 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（231）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（414） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s19_nvguan` 上一场走完直接进（414）；`ch02_s18_yuanye` 上一场走完直接进（386）；`ch02_s15_shuge` 上一场走完直接进（286）；`ch02_s16_yuanye` 上一场走完直接进（259）；`ch02_s17_shishe` 上一场走完直接进（231） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（798）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（778） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（1576） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（802）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（774） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（794）；`ch02_s22_shuge` 选 A「我在门边等你」（782） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（1576） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（1576） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（530）；`ch02_s24_shuge` 选 C「我只约你明日论议」（527）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（519） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（928）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（648） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（809）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（767） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（805）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（771） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（807）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（769） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（819）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（757） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（792）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（784） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（1576） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（941）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（338）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（297） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（2%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（28）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（2%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（24）<br/>进入条件：flag.li_ch03_private_paused |  |
| 57 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（2%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（24）<br/>进入条件：flag.li_ch03_multi_told |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（676）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（630）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（84）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（73）；`ch03_s09a_yuanye` 上一场走完直接进（28）；`ch03_s09c_yuanye` 上一场走完直接进（24）；`ch03_s09b_yuanye` 上一场走完直接进（24）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（22）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（15） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（1576） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（1576） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（1576） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（1576） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（1576） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（1576） |  |
| 65 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（21%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（326）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 66 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（20%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（315）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 67 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（19%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（293）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 68 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（20%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（318）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 69 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（21%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（324） |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s20_yuanye` 上一场走完直接进（326）；`ch03_s21_nvguan` 上一场走完直接进（324）；`ch03_s19_shishe` 上一场走完直接进（318）；`ch03_s18_yuanye` 上一场走完直接进（315）；`ch03_s17_shuge` 上一场走完直接进（293） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（1576） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（1576） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（1576） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 C「仍用添」（546）；`ch04_s01_zhaoyang` 选 A「写下天」（534）；`ch04_s01_zhaoyang` 选 B「写下曌」（496） |  |
| 75 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 13 次都经过它） | `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」（825）；`ch04_s02_hanyuan` 选 A「原议与答复同收」（751）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 76 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 11 次都经过它） | `ch04_s03_shuge` 选 C「原件归存，照权限查阅」（516）；`ch04_s03_shuge` 选 B「确认焚毁原案，不可恢复」（478）；`ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」（309）；`ch04_s03_shuge` 选 A「原件归存，照权限查阅」（273）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 11 次都经过它） | `ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」（411）；`ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」（397）；`ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」（390）；`ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」（378）<br/>进入条件：flag.enthroned |  |
| 78 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（1576） |  |
| 79 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 G「独自过一阵」（358）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（300）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（263）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（237）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（223）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（138）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（57） |  |
| 80 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（57） |  |
| 81 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1519）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（409）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（337）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（268）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（190）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（57） |  |
| 82 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（12%） | `ch04_s05c_shuge` 换场（190） |  |
| 83 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（337） |  |
| 84 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（26%） | `ch04_s05c_shuge` 换场（409） |  |
| 85 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（17%） | `ch04_s05c_shuge` 换场（268） |  |
| 86 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（1576）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（149）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（142）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（128）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（123）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（116）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（100）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（75）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（63）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（22）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（20）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（15）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（4） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（262） |  |
| 88 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（299） |  |
| 89 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（10%） | `ch04_s05q_shuge` 换场（153） |  |
| 90 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（243） |  |
| 91 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（1576） |  |
| 92 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 15 次都经过它） | `ch04_s05r_shuge` 换场（1576）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 93 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 10 次都经过它） | `ch04_s05z_yeting` 选 B「收好今日的交付凭」（825）；`ch04_s05z_yeting` 选 C「收好今日的交付凭」（478）；`ch04_s05z_yeting` 选 A「收好今日的交付凭」（273）<br/>进入条件：flag.enthroned |  |
| 94 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 9 次都经过它） | `ch04_s06_zhaoyang` 上一场走完直接进（1576）<br/>进入条件：flag.enthroned |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 A「颁行多方提名与异议办法」（811）；`ch04_s07_hanyuan` 选 B「颁行仅由在位者提名的办法」（765） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 A「收好今次交付的回凭」（811）；`ch04_s17_nvguan` 选 B「收好今次交付的回凭」（765） |  |

## 4. 两席之间（`liangxizhijian`）

判定：flag.liqinghe_won 且 flag.liqinghe_together 且 非 flag.enthroned 且 非 flag.declined_crown 且 非 flag.founded_school 且 非 flag.road_agreement。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 3 个结局都不成立。

走到这里的路 91 条，不同的场次序列 87 种，每条 73—80 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `liqinghe_won` 要真：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成真 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（91 条）
- `liqinghe_together` 要真：
  - `ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」 写成真（49 条）
  - `ch04_s09_yuanye` 选 A「先留京，再约时辰」 写成真（22 条）
  - `ch04_s09_yuanye` 选 C「行路的事仍要去问」 写成真（11 条）
  - `ch04_s09_yuanye` 选 B「办学的事仍要去问」 写成真（9 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（91 条）
- `declined_crown` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（91 条）
- `founded_school` 要假：
  - 从没被写过，保持初始的假（91 条）
- `road_agreement` 要假：
  - 从没被写过，保持初始的假（91 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（91） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（91） |
| 未竟之诏 | 缺 enthroned（91） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（91） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（91） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（91） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（55）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（36） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（91） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（48）；`ch01_s04_shuge` 对诗输（43） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（91） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（49）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（42） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（47）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（44） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 A「先收六份，满额便明示」（52）；`ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（39） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（48）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（43） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（91） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（47）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（44） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（13%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（12）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（29%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（26）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（21%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（19）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（18%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（16）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s14_yuanye` 上一场走完直接进（26）；`ch01_s15_shishe` 上一场走完直接进（19）；`ch01_s12_shuge` 选 E「直接去找阿荻」（18）；`ch01_s16_yuanye` 上一场走完直接进（16）；`ch01_s13_shuge` 上一场走完直接进（12）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（53）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（38）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（91） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（91） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（49）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（42） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（91） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 C「我只核这卷，不约私见」（31）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（23）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（21）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（16） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（91） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（49）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（42） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（32）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（31）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（28） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 A「连往返按半日给俸」（53）；`ch02_s08_shuge` 选 B「按次给俸，往返另记」（38） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（37）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（31）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（23） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（91） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（55）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（36） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（91） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（49）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（42） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（20%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（18）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（23） |  |
| 36 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（27%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（25）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 37 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（12%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（11）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 38 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（14）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（25）；`ch02_s19_nvguan` 上一场走完直接进（23）；`ch02_s15_shuge` 上一场走完直接进（18）；`ch02_s16_yuanye` 上一场走完直接进（14）；`ch02_s17_shishe` 上一场走完直接进（11） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（47）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（44） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（91） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（51）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（40） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（50）；`ch02_s22_shuge` 选 A「我在门边等你」（41） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（91） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（91） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（34）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（29）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（28） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（70）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（21） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（51）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（40） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（47）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（44） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（48）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（43） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（55）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（36） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（51）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（40） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（91） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（91） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（1）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（1）<br/>进入条件：flag.li_ch03_private_paused |  |
| 57 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（36）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（31）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（13）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（6）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（3）；`ch03_s09c_yuanye` 上一场走完直接进（1）；`ch03_s09a_yuanye` 上一场走完直接进（1） |  |
| 58 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（91） |  |
| 59 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（91） |  |
| 60 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（91） |  |
| 61 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（91） |  |
| 62 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（91） |  |
| 63 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（91） |  |
| 64 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（10%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（9）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 65 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（16%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（15）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 66 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（43%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（13）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（13）；`ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（13） |  |
| 67 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（14%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（13）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 68 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（16%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（15）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 69 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（39）；`ch03_s20_yuanye` 上一场走完直接进（15）；`ch03_s19_shishe` 上一场走完直接进（15）；`ch03_s17_shuge` 上一场走完直接进（13）；`ch03_s18_yuanye` 上一场走完直接进（9） |  |
| 70 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（91） |  |
| 71 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（91） |  |
| 72 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（91） |  |
| 73 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（91） |  |
| 74 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（91）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 75 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（91） |  |
| 76 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（91） |  |
| 77 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（91）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（29）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（25）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（23） |  |
| 78 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（27%） | `ch04_s05c_shuge` 换场（25） |  |
| 79 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（32%） | `ch04_s05c_shuge` 换场（29） |  |
| 80 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（23） |  |
| 81 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（91）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（91） |  |
| 82 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s05q_shuge` 换场（91）<br/>上一场的另一条去向：`ch04_s05qa_shuge`（无进入条件，但本线的选项没有走向它）、`ch04_s05qb_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s05qc_shishe`（无进入条件，但本线的选项没有走向它）、`ch04_s05r_shuge`（无进入条件，但本线的选项没有走向它） |  |
| 83 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（91） |  |
| 84 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s05r_shuge` 换场（91）<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 85 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（91）<br/>进入条件：非 flag.enthroned |  |
| 86 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（46%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（42）<br/>进入条件：flag.liqinghe_won |  |
| 87 | `ch04_s11_nvguan` | 三日以后谁付 | 选出来的（47%） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（34）；`ch04_s09_yuanye` 选 B「办学的事仍要去问」（9）<br/>进入条件：flag.liqinghe_won |  |
| 88 | `ch04_s14_shuge` | 归期写在前面 | 选出来的（29%） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（15）；`ch04_s09_yuanye` 选 C「行路的事仍要去问」（11）<br/>进入条件：flag.liqinghe_won |  |
| 89 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s11_nvguan` 选 B「这回先不接」（43）；`ch04_s14_shuge` 选 B「这回不接，归期的纸我留着」（26）；`ch04_s09_yuanye` 选 A「先留京，再约时辰」（22）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s12_nvguan`（要 flag.ch04_school_contract）、`ch04_s14_shuge`（要 flag.liqinghe_won）、`ch04_s15_yilu`（要 flag.ch04_road_contract） |  |
| 90 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（91） |  |
| 91 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（91） |  |

## 5. 开门授字（`kaimenshouzi`）

判定：flag.founded_school 且 非 flag.enthroned 且 非 flag.declined_crown。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 4 个结局都不成立。

走到这里的路 614 条，不同的场次序列 577 种，每条 71—84 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `founded_school` 要真：
  - `ch04_s12_nvguan` 选 A「收好今日的课页」 写成真（614 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（614 条）
- `declined_crown` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（614 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（614） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（614） |
| 未竟之诏 | 缺 enthroned（614） |
| 两席之间 | 缺 liqinghe_together、非 founded_school（578）；缺 非 founded_school（36） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（614） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（614） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（614） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（311）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（303） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（614） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（313）；`ch01_s04_shuge` 对诗赢（301） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（614） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（307）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（307） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（325）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（289） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（310）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（304） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（315）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（299） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（614） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（308）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（306） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（16%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（96）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（20%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（120）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（21%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（126）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（23%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（141）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s16_yuanye` 上一场走完直接进（141）；`ch01_s12_shuge` 选 E「直接去找阿荻」（131）；`ch01_s15_shishe` 上一场走完直接进（126）；`ch01_s14_yuanye` 上一场走完直接进（120）；`ch01_s13_shuge` 上一场走完直接进（96）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（325）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（289）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（614） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（614） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（310）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（304） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（614） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 A「一起读。读完也想见你」（170）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（150）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（149）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（145） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（614） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（323）；`ch02_s06_yeting` 选 B「先付六件，余款催原项」（291） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（217）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（209）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（188） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 A「连往返按半日给俸」（315）；`ch02_s08_shuge` 选 B「按次给俸，往返另记」（299） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 C「这次我也没余力陪读」（224）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（206）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（184） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（614） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（311）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（303） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（614） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（310）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（304） |  |
| 34 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（158） |  |
| 35 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（14%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（88）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 36 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（92）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（29%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（176）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（100）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（176）；`ch02_s19_nvguan` 上一场走完直接进（158）；`ch02_s15_shuge` 上一场走完直接进（100）；`ch02_s16_yuanye` 上一场走完直接进（92）；`ch02_s17_shishe` 上一场走完直接进（88） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（330）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（284） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（614） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（320）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（294） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（332）；`ch02_s22_shuge` 选 A「我在门边等你」（282） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（614） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（614） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（208）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（205）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（201） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（398）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（216） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（317）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（297） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（318）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（296） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（332）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（282） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（314）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（300） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（308）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（306） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（614） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（614） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（6）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（9）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（4）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（288）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（232）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（31）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（27）；`ch03_s09b_yuanye` 上一场走完直接进（9）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（9）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（8）；`ch03_s09a_yuanye` 上一场走完直接进（6）；`ch03_s09c_yuanye` 上一场走完直接进（4） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（614） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（614） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（614） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（614） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（614） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（614） |  |
| 65 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（15%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（91）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 66 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（41%） | `ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（98）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（87）；`ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（68） |  |
| 67 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（16%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（100）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 68 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（14%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（89）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 69 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（13%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（81）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（253）；`ch03_s20_yuanye` 上一场走完直接进（100）；`ch03_s19_shishe` 上一场走完直接进（91）；`ch03_s17_shuge` 上一场走完直接进（89）；`ch03_s18_yuanye` 上一场走完直接进（81） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（614） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（614） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（614） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（614） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 14 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（614）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（614） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（124）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（114）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（94）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（93）；`ch04_s05p_shuge` 选 G「独自过一阵」（89）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（77）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（23） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（23） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（591）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（170）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（167）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（132）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（95）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（23） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（28%） | `ch04_s05c_shuge` 换场（170） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（132） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（27%） | `ch04_s05c_shuge` 换场（167） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（15%） | `ch04_s05c_shuge` 换场（95） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（614）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（59）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（57）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（54）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（50）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（44）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（44）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（41）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（36）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（5）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（5）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（4）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（2） |  |
| 85 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（120） |  |
| 86 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（103） |  |
| 87 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（96） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（13%） | `ch04_s05q_shuge` 换场（82） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（614） |  |
| 90 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 选出来的（6%） | `ch04_s05r_shuge` 换场（36） |  |
| 91 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 21 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（578）；`ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（36）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 92 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（33%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（204）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s11_nvguan` | 三日以后谁付 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（410）；`ch04_s09_yuanye` 选 E「今后只谈公事，我去问办学」（197）；`ch04_s09_yuanye` 选 B「办学的事仍要去问」（7）<br/>进入条件：flag.liqinghe_won<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s14_shuge`（要 flag.liqinghe_won） |  |
| 94 | `ch04_s12_nvguan` | 半日也算来过 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s11_nvguan` 选 A「按这一月的约定办」（614）<br/>进入条件：flag.ch04_school_contract<br/>上一场的另一条去向：`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s11_nvguan`（要 flag.liqinghe_won） | ✓ |
| 95 | `ch04_s13_nvguan` | 她们收自己的席 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s12_nvguan` 选 A「收好今日的课页」（614）<br/>进入条件：flag.founded_school | ✓ |
| 96 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s13_nvguan` 上一场走完直接进（614） |  |
| 97 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（614） |  |

## 6. 不受（`bushou`）

判定：flag.declined_crown 且 非 flag.enthroned。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 5 个结局都不成立。

走到这里的路 2068 条，不同的场次序列 1413 种，每条 69—85 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `declined_crown` 要真：
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（1275 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（399 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（394 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（1275 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（399 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（394 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（2068） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（2068） |
| 未竟之诏 | 缺 enthroned（2068） |
| 两席之间 | 缺 liqinghe_won、liqinghe_together、非 declined_crown（2068） |
| 开门授字 | 缺 founded_school、非 declined_crown（2068） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（2068） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（2068） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（2068） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（1035）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（1033） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（2068） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（1059）；`ch01_s04_shuge` 对诗赢（1009） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（2068） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（1048）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（1020） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（1078）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（990） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（1034）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（1034） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（1053）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（1015） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（2068） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（1050）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（1018） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（15%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（300）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（22%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（458）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（20%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（414）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（23%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（473）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s16_yuanye` 上一场走完直接进（473）；`ch01_s14_yuanye` 上一场走完直接进（458）；`ch01_s12_shuge` 选 E「直接去找阿荻」（423）；`ch01_s15_shishe` 上一场走完直接进（414）；`ch01_s13_shuge` 上一场走完直接进（300）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（1043）；`ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（1025）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（2068） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（2068） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（1050）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（1018） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（2068） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 A「一起读。读完也想见你」（575）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（517）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（498）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（478） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（2068） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（1045）；`ch02_s06_yeting` 选 B「先付六件，余款催原项」（1023） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（718）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（684）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（666） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（1051）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（1017） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（706）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（684）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（678） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（2068） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（1069）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（999） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（2068） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（1048）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（1020） |  |
| 34 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（331）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 35 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（24%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（504） |  |
| 36 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（340）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（28%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（575）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（318）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（575）；`ch02_s19_nvguan` 上一场走完直接进（504）；`ch02_s15_shuge` 上一场走完直接进（340）；`ch02_s17_shishe` 上一场走完直接进（331）；`ch02_s16_yuanye` 上一场走完直接进（318） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（1037）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（1031） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（2068） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（1055）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（1013） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（1083）；`ch02_s22_shuge` 选 A「我在门边等你」（985） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（2068） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（2068） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（708）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（690）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（670） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（1217）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（851） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（1073）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（995） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（1042）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（1026） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（1048）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（1020） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（1051）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（1017） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（1048）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（1020） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（2068） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（1275）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（399）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（394） |  |
| 55 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（21）<br/>进入条件：flag.li_ch03_private_paused |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（17）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（24）<br/>进入条件：flag.li_ch03_only_intent |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（888）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（860）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（105）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（104）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（33）；`ch03_s09a_yuanye` 上一场走完直接进（24）；`ch03_s09c_yuanye` 上一场走完直接进（21）；`ch03_s09b_yuanye` 上一场走完直接进（17）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（16） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（2068） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」（2068） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」（2068） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（2068） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（2068） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（2068） |  |
| 65 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（46%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（334）；`ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（312）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（307） |  |
| 66 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（13%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（273）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 67 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（14%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（284）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 68 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（13%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（274）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 69 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（14%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（284）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（953）；`ch03_s20_yuanye` 上一场走完直接进（284）；`ch03_s19_shishe` 上一场走完直接进（284）；`ch03_s17_shuge` 上一场走完直接进（274）；`ch03_s18_yuanye` 上一场走完直接进（273） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（2068） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（2068） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（2068） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 D「领回自己的东西」（2068） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 25 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（2068）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（2068） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（373）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（359）；`ch04_s05p_shuge` 选 G「独自过一阵」（358）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（309）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（296）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（285）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（88） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（88） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1980）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（505）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（496）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（444）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（328）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（88） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（24%） | `ch04_s05c_shuge` 换场（505） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（444） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（24%） | `ch04_s05c_shuge` 换场（496） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（16%） | `ch04_s05c_shuge` 换场（328） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（2068）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（191）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（179）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（170）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（168）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（155）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（153）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（141）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（132）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（29）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（27）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（26）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（13） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（386） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（351） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（333） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（314） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（2068） |  |
| 90 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 9 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（2068）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 91 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 21 次都经过它） | `ch04_s08z_shuge` 选 A「今日不定去处，出去吃点东西」（2068）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s14_shuge`（要 flag.liqinghe_won） |  |
| 92 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（2068） |  |
| 93 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（2068） |  |

## 7. 关山有信（`guanshanyouxin`）

判定：flag.road_agreement 且 非 flag.enthroned 且 非 flag.declined_crown。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 6 个结局都不成立。

走到这里的路 634 条，不同的场次序列 593 种，每条 71—86 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `road_agreement` 要真：
  - `ch04_s15_yilu` 选 A「随车到第一处交接」 写成真（634 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（634 条）
- `declined_crown` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（634 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（634） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（634） |
| 未竟之诏 | 缺 enthroned（634） |
| 两席之间 | 缺 liqinghe_together、非 road_agreement（591）；缺 非 road_agreement（43） |
| 开门授字 | 缺 founded_school（634） |
| 不受 | 缺 declined_crown（634） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（634） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（634） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（634） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（322）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（312） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（634） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（320）；`ch01_s04_shuge` 对诗赢（314） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（634） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（328）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（306） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（336）；`ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（298） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（318）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（316） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（334）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（300） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（634） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（321）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（313） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（13%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（81）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（22%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（140）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（22%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（140）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（21%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（132）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s12_shuge` 选 E「直接去找阿荻」（141）；`ch01_s15_shishe` 上一场走完直接进（140）；`ch01_s14_yuanye` 上一场走完直接进（140）；`ch01_s16_yuanye` 上一场走完直接进（132）；`ch01_s13_shuge` 上一场走完直接进（81）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（336）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（298）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（634） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（634） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（342）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（292） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（634） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（187）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（156）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（149）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（142） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（634） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（323）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（311） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（227）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（211）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（196） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（348）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（286） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（235）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（210）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（189） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（634） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（326）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（308） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（634） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（318）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（316） |  |
| 34 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（18%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（111）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 35 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（108）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 36 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（162） |  |
| 37 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（97）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 38 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（156）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s19_nvguan` 上一场走完直接进（162）；`ch02_s18_yuanye` 上一场走完直接进（156）；`ch02_s16_yuanye` 上一场走完直接进（111）；`ch02_s17_shishe` 上一场走完直接进（108）；`ch02_s15_shuge` 上一场走完直接进（97） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（339）；`ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（295） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（634） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（332）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（302） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 A「我在门边等你」（320）；`ch02_s22_shuge` 选 B「今日先走，你慢慢收」（314） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（634） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（634） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（224）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（210）；`ch02_s24_shuge` 选 C「我只约你明日论议」（200） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（418）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（216） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（331）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（303） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（323）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（311） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（320）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（314） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（323）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（311） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（318）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（316） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（634） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（634） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（4）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（0%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（2）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（2%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（10）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（272）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（259）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（37）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（34）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（10）；`ch03_s09c_yuanye` 上一场走完直接进（10）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（6）；`ch03_s09a_yuanye` 上一场走完直接进（4）；`ch03_s09b_yuanye` 上一场走完直接进（2） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（634） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（634） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（634） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（634） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（634） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（634） |  |
| 65 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（17%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（107）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 66 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（45%） | `ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（101）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（92）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（90） |  |
| 67 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（10%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（63）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 68 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（16%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（99）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 69 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（13%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（82）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（283）；`ch03_s18_yuanye` 上一场走完直接进（107）；`ch03_s20_yuanye` 上一场走完直接进（99）；`ch03_s19_shishe` 上一场走完直接进（82）；`ch03_s17_shuge` 上一场走完直接进（63） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（634） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（634） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（634） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（634） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 12 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（634）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（634） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（117）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（115）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（107）；`ch04_s05p_shuge` 选 G「独自过一阵」（104）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（85）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（81）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（25） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（25） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（609）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（176）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（157）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（123）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（111）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（25） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（28%） | `ch04_s05c_shuge` 换场（176） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（19%） | `ch04_s05c_shuge` 换场（123） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（157） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（18%） | `ch04_s05c_shuge` 换场（111） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（634）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（63）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（62）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（53）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（50）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（48）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（43）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（42）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（35）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（8）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（6）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（4）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（3） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（123） |  |
| 86 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（14%） | `ch04_s05q_shuge` 换场（88） |  |
| 87 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（117） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（14%） | `ch04_s05q_shuge` 换场（89） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（634） |  |
| 90 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 选出来的（7%） | `ch04_s05r_shuge` 换场（43） |  |
| 91 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 17 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（591）；`ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（43）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 92 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（37%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（237）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s14_shuge` | 归期写在前面 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（397）；`ch04_s09_yuanye` 选 F「今后只谈公事，我去问行路」（222）；`ch04_s09_yuanye` 选 C「行路的事仍要去问」（15）<br/>进入条件：flag.liqinghe_won<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s11_nvguan`（要 flag.liqinghe_won） |  |
| 94 | `ch04_s15_yilu` | 各自领一份 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s14_shuge` 选 A「接这一月的差，明早领款」（634）<br/>进入条件：flag.ch04_road_contract<br/>上一场的另一条去向：`ch04_s10_yuanye`（要 非 flag.enthroned） | ✓ |
| 95 | `ch04_s16_yilu` | 驿旁不是归处 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s15_yilu` 选 A「随车到第一处交接」（634）<br/>进入条件：flag.road_agreement | ✓ |
| 96 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s16_yilu` 上一场走完直接进（634） |  |
| 97 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（634） |  |

## 8. 纸上有名（`zhishangyouming`）

判定：无条件（兜底：前面七个都不成立时落到这里）。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 7 个结局都不成立。

走到这里的路 1201 条，不同的场次序列 1130 种，每条 70—83 场。

### 判定用到的 flag 是在哪里写下的

无：兜底结局不看 flag。

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（1201） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（1201） |
| 未竟之诏 | 缺 enthroned（1201） |
| 两席之间 | 缺 liqinghe_together（1201） |
| 开门授字 | 缺 founded_school（1201） |
| 不受 | 缺 declined_crown（1201） |
| 关山有信 | 缺 road_agreement（1201） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（1201） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（1201） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（1201） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（604）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（597） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（1201） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（631）；`ch01_s04_shuge` 对诗输（570） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（1201） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（602）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（599） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（609）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（592） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（626）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（575） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（611）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（590） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（1201） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（604）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（597） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（15%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（177）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（21%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（257）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（21%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（255）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（22%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（259）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s16_yuanye` 上一场走完直接进（259）；`ch01_s14_yuanye` 上一场走完直接进（257）；`ch01_s15_shishe` 上一场走完直接进（255）；`ch01_s12_shuge` 选 E「直接去找阿荻」（253）；`ch01_s13_shuge` 上一场走完直接进（177）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（606）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（595）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（1201） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（1201） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（642）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（559） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（1201） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（306）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（303）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（297）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（295） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（1201） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（612）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（589） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（424）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（408）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（369） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（609）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（592） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（412）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（396）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（393） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（1201） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（619）；`ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（582） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（1201） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（623）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（578） |  |
| 34 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（305）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 35 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（188）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 36 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（310） |  |
| 37 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（193）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 38 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（205）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s19_nvguan` 上一场走完直接进（310）；`ch02_s18_yuanye` 上一场走完直接进（305）；`ch02_s16_yuanye` 上一场走完直接进（205）；`ch02_s17_shishe` 上一场走完直接进（193）；`ch02_s15_shuge` 上一场走完直接进（188） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（625）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（576） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（1201） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（606）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（595） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（608）；`ch02_s22_shuge` 选 A「我在门边等你」（593） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（1201） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（1201） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（414）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（399）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（388） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（787）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（414） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（607）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（594） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（610）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（591） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（627）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（574） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（608）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（593） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（607）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（594） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（1201） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（1201） |  |
| 55 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（2%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（21）<br/>进入条件：flag.li_ch03_multi_told |  |
| 56 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（14）<br/>进入条件：flag.li_ch03_only_intent |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（0%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（6）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（533）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（521）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（50）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（42）；`ch03_s09b_yuanye` 上一场走完直接进（21）；`ch03_s09a_yuanye` 上一场走完直接进（14）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（8）；`ch03_s09c_yuanye` 上一场走完直接进（6）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（6） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（1201） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（1201） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（1201） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（1201） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（1201） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（1201） |  |
| 65 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（14%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（170）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 66 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（47%） | `ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（191）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（190）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（178） |  |
| 67 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（13%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（157）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 68 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（14%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（173）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 69 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（12%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（142）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（559）；`ch03_s20_yuanye` 上一场走完直接进（173）；`ch03_s18_yuanye` 上一场走完直接进（170）；`ch03_s19_shishe` 上一场走完直接进（157）；`ch03_s17_shuge` 上一场走完直接进（142） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（1201） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（1201） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（1201） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（1201） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 12 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（1201）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（1201） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（234）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（228）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（220）；`ch04_s05p_shuge` 选 G「独自过一阵」（199）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（172）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（102）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（46） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（46） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1155）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（313）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（312）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（241）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（163）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（46） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（26%） | `ch04_s05c_shuge` 换场（312） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（20%） | `ch04_s05c_shuge` 换场（241） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（26%） | `ch04_s05c_shuge` 换场（313） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（14%） | `ch04_s05c_shuge` 换场（163） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（1201）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（127）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（113）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（111）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（109）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（102）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（101）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（80）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（20）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（16）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（10）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（9） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（240） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（250） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（190） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（10%） | `ch04_s05q_shuge` 换场（118） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（1201） |  |
| 90 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 14 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（1201）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 91 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（47%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（566）<br/>进入条件：flag.liqinghe_won |  |
| 92 | `ch04_s11_nvguan` | 三日以后谁付 | 选出来的（41%） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（329）；`ch04_s09_yuanye` 选 E「今后只谈公事，我去问办学」（162）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s14_shuge` | 归期写在前面 | 选出来的（38%） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（306）；`ch04_s09_yuanye` 选 F「今后只谈公事，我去问行路」（154）<br/>进入条件：flag.liqinghe_won |  |
| 94 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s11_nvguan` 选 B「这回先不接」（491）；`ch04_s14_shuge` 选 B「这回不接，归期的纸我留着」（460）；`ch04_s09_yuanye` 选 D「今后只谈公事，我先留京」（250）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s12_nvguan`（要 flag.ch04_school_contract）、`ch04_s14_shuge`（要 flag.liqinghe_won）、`ch04_s15_yilu`（要 flag.ch04_road_contract） |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（1201） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（1201） |  |

## 附：必经的复核记录

抽样里「每条都经过」、但图上绕得开的场，都朝那个结局专门绕着走过（每场最多 60 次，绕开一次就停）。绕开了的，那条路已经算进这条线，这一场随之变成「选出来的」。

- 复核 39 处，绕开 0 处，留作必经 39 处。

| 结局 | 场次 | 结果 |
|---|---|---|
| 不受 | `ch04_s08_shuge` | 没绕开：试 60 次，25 次走到本结局 |
| 不受 | `ch04_s08z_shuge` | 没绕开：试 60 次，9 次走到本结局 |
| 不受 | `ch04_s10_yuanye` | 没绕开：试 60 次，21 次走到本结局 |
| 关山有信 | `ch04_s08_shuge` | 没绕开：试 60 次，12 次走到本结局 |
| 关山有信 | `ch04_s08z_shuge` | 没绕开：试 60 次，17 次走到本结局 |
| 关山有信 | `ch04_s14_shuge` | 没绕开：试 60 次，0 次走到本结局 |
| 关山有信 | `ch04_s15_yilu` | 没绕开：试 60 次，0 次走到本结局 |
| 关山有信 | `ch04_s16_yilu` | 没绕开：试 60 次，0 次走到本结局 |
| 开门授字 | `ch04_s08_shuge` | 没绕开：试 60 次，14 次走到本结局 |
| 开门授字 | `ch04_s08z_shuge` | 没绕开：试 60 次，21 次走到本结局 |
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
| 未竟之诏 | `ch04_s05_yeting` | 没绕开：试 60 次，11 次走到本结局 |
| 未竟之诏 | `ch04_s05z_yeting` | 没绕开：试 60 次，15 次走到本结局 |
| 未竟之诏 | `ch04_s06_zhaoyang` | 没绕开：试 60 次，10 次走到本结局 |
| 未竟之诏 | `ch04_s07_hanyuan` | 没绕开：试 60 次，9 次走到本结局 |
| 无字之碑 | `ch04_s03_shuge` | 没绕开：试 60 次，1 次走到本结局 |
| 无字之碑 | `ch04_s04_zhaoyang` | 没绕开：试 60 次，5 次走到本结局 |
| 无字之碑 | `ch04_s05_yeting` | 没绕开：试 60 次，2 次走到本结局 |
| 无字之碑 | `ch04_s05z_yeting` | 没绕开：试 60 次，3 次走到本结局 |
| 无字之碑 | `ch04_s06_zhaoyang` | 没绕开：试 60 次，3 次走到本结局 |
| 无字之碑 | `ch04_s07_hanyuan` | 没绕开：试 60 次，3 次走到本结局 |
| 纸上有名 | `ch04_s08_shuge` | 没绕开：试 60 次，12 次走到本结局 |
| 纸上有名 | `ch04_s08z_shuge` | 没绕开：试 60 次，14 次走到本结局 |
| 纸上有名 | `ch04_s10_yuanye` | 没绕开：试 60 次，0 次走到本结局 |

