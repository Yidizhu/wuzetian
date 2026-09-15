# 八条线的场次骨架

> 由 `tools/convert-routes.ts` 生成（CC2，D-115 第一步），交 ChatGPT 写《八条线的故事线》。不要手改；数据变了重跑这个脚本。
> 读的是 `src/data/converted/`（数据指纹 `7d22f7d5fff6`，对应 manifest 里 14 份原文的那一次转换），不读剧本原文。

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
| 满殿无声 | flag.enthroned 且 flag.ch04_dissent_removed 且 flag.ch04_originals_destroyed 且 flag.ch04_nomination_closed | 214 | 204 | 72—82 | 70 | 24 | 0 |
| 无字之碑 | flag.enthroned 且 flag.public_review 且 flag.ch04_nomination_open | 241 | 234 | 72—87 | 70 | 26 | 0 |
| 未竟之诏 | flag.enthroned | 1555 | 1170 | 72—84 | 70 | 26 | 0 |
| 两席之间 | flag.liqinghe_won 且 flag.liqinghe_together 且 非 flag.enthroned 且 非 flag.declined_crown 且 非 flag.founded_school 且 非 flag.road_agreement | 89 | 87 | 73—79 | 69 | 21 | 0 |
| 开门授字 | flag.founded_school 且 非 flag.enthroned 且 非 flag.declined_crown | 634 | 598 | 71—82 | 69 | 28 | 2 |
| 不受 | flag.declined_crown 且 非 flag.enthroned | 2084 | 1472 | 69—83 | 67 | 26 | 0 |
| 关山有信 | flag.road_agreement 且 非 flag.enthroned 且 非 flag.declined_crown | 642 | 589 | 71—82 | 69 | 28 | 2 |
| 纸上有名 | 无条件（兜底：前面七个都不成立时落到这里） | 1261 | 1184 | 70—85 | 67 | 29 | 0 |

## 1. 满殿无声（`mandianwusheng`）

判定：flag.enthroned 且 flag.ch04_dissent_removed 且 flag.ch04_originals_destroyed 且 flag.ch04_nomination_closed。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 0 个结局都不成立。

走到这里的路 214 条，不同的场次序列 204 种，每条 72—82 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（131 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（45 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（38 条）
- `ch04_dissent_removed` 要真：
  - `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真 ← 这一项要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」 写成真（214 条）
- `ch04_originals_destroyed` 要真：
  - `ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」 写成真 ← 这一项要 `ch04_originals_burn_order` 来自 `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真（它又要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」 写成真）（115 条）
  - `ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」 写成真 ← 这一项要 `ch04_originals_burn_order` 来自 `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真（它又要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」 写成真）（99 条）
- `ch04_nomination_closed` 要真：
  - `ch04_s17_nvguan` 选 B「收好今次交付的回凭」 写成真 ← 这一项要 `ch04_nomination_closed_order` 来自 `ch04_s07_hanyuan` 选 B「颁行仅由在位者提名的办法」 写成真（214 条）

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（214） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（214） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（214） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（107）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（107） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（214） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（107）；`ch01_s04_shuge` 对诗输（107） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（214） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（115）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（99） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（114）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（100） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（114）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（100） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（115）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（99） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（214） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（119）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（95） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（18%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（39）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（23%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（49）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（21%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（44）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（21%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（44）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s14_yuanye` 上一场走完直接进（49）；`ch01_s16_yuanye` 上一场走完直接进（44）；`ch01_s15_shishe` 上一场走完直接进（44）；`ch01_s13_shuge` 上一场走完直接进（39）；`ch01_s12_shuge` 选 E「直接去找阿荻」（38）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（110）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（104）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（214） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（214） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（110）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（104） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（214） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（60）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（60）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（50）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（44） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（214） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（111）；`ch02_s06_yeting` 选 B「先付六件，余款催原项」（103） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（82）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（69）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（63） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 A「连往返按半日给俸」（115）；`ch02_s08_shuge` 选 B「按次给俸，往返另记」（99） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（78）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（72）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（64） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（214） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（107）；`ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（107） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（214） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（109）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（105） |  |
| 34 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（24%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（52） |  |
| 35 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（33）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 36 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（19%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（40）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（28%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（60）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（14%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（29）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（60）；`ch02_s19_nvguan` 上一场走完直接进（52）；`ch02_s16_yuanye` 上一场走完直接进（40）；`ch02_s15_shuge` 上一场走完直接进（33）；`ch02_s17_shishe` 上一场走完直接进（29） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（114）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（100） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（214） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（120）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（94） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（112）；`ch02_s22_shuge` 选 A「我在门边等你」（102） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（214） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（214） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 B「今夜想独处，改日再问」（75）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（70）；`ch02_s24_shuge` 选 C「我只约你明日论议」（69） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（127）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（87） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（116）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（98） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（116）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（98） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（118）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（96） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（111）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（103） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（116）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（98） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（214） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（131）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（45）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（38） |  |
| 55 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（3）<br/>进入条件：flag.li_ch03_multi_told |  |
| 56 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（3%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（6）<br/>进入条件：flag.li_ch03_only_intent |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（0%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（1）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（92）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（90）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（9）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（8）；`ch03_s09a_yuanye` 上一场走完直接进（6）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（3）；`ch03_s09b_yuanye` 上一场走完直接进（3）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（2）；`ch03_s09c_yuanye` 上一场走完直接进（1） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（214） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（214） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（214） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（214） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（214） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（214） |  |
| 65 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（22%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（47） |  |
| 66 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（20%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（43）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 67 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（21%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（46）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 68 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（17%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（37）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 69 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（19%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（41）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（47）；`ch03_s18_yuanye` 上一场走完直接进（46）；`ch03_s19_shishe` 上一场走完直接进（43）；`ch03_s20_yuanye` 上一场走完直接进（41）；`ch03_s17_shuge` 上一场走完直接进（37） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（214） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（214） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（214） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 C「仍用添」（75）；`ch04_s01_zhaoyang` 选 A「写下天」（75）；`ch04_s01_zhaoyang` 选 B「写下曌」（64） |  |
| 75 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 2 次都经过它） | `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」（214）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 76 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」（214）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」（115）；`ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」（99）<br/>进入条件：flag.enthroned |  |
| 78 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（214） |  |
| 79 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 G「独自过一阵」（49）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（48）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（45）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（36）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（32）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（4） |  |
| 80 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（2%） | `ch04_s05pe_shuge` 换场（4） |  |
| 81 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（210）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（55）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（45）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（37）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（4） |  |
| 82 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（45） |  |
| 83 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（26%） | `ch04_s05c_shuge` 换场（55） |  |
| 84 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（17%） | `ch04_s05c_shuge` 换场（37） |  |
| 85 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（214）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（28）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（21）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（20）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（19）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（16）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（11）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（2）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（2）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（1） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（22%） | `ch04_s05q_shuge` 换场（49） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（17%） | `ch04_s05q_shuge` 换场（37） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（34） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（214） |  |
| 90 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s05r_shuge` 换场（214）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 91 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s05z_yeting` 选 B「收好今日的交付凭」（214）<br/>进入条件：flag.enthroned |  |
| 92 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s06_zhaoyang` 上一场走完直接进（214）<br/>进入条件：flag.enthroned |  |
| 93 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 B「颁行仅由在位者提名的办法」（214） |  |
| 94 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 B「收好今次交付的回凭」（214） |  |

## 2. 无字之碑（`wuzibei`）

判定：flag.enthroned 且 flag.public_review 且 flag.ch04_nomination_open。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 1 个结局都不成立。

走到这里的路 241 条，不同的场次序列 234 种，每条 72—87 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（148 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（48 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（45 条）
- `public_review` 要真：
  - `ch04_s05z_yeting` 选 A「收好今日的交付凭」 写成真 ← 这一项要 `ch04_dissent_retained` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真（它又要 `ch04_dissent_keep_order` 来自 `ch04_s02_hanyuan` 选 A「原议与答复同收」 写成真）；还要 `ch04_originals_retained` 来自 `ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」 写成真（它又要 `ch04_originals_keep_order` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真）（123 条）
  - `ch04_s05z_yeting` 选 A「收好今日的交付凭」 写成真 ← 这一项要 `ch04_dissent_retained` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真（它又要 `ch04_dissent_keep_order` 来自 `ch04_s02_hanyuan` 选 A「原议与答复同收」 写成真）；还要 `ch04_originals_retained` 来自 `ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」 写成真（它又要 `ch04_originals_keep_order` 来自 `ch04_s03_shuge` 选 A「原件归存，照权限查阅」 写成真）（118 条）
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
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（134）；`ch01_s04_shuge` 对诗赢（107） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（241） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（142）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（99） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（125）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（116） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（122）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（119） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（124）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（117） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（241） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（123）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（118） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（13%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（31）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（25%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（61）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（20%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（48）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（21%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（50）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s14_yuanye` 上一场走完直接进（61）；`ch01_s12_shuge` 选 E「直接去找阿荻」（51）；`ch01_s16_yuanye` 上一场走完直接进（50）；`ch01_s15_shishe` 上一场走完直接进（48）；`ch01_s13_shuge` 上一场走完直接进（31）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（125）；`ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（116）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（241） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（241） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（125）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（116） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（241） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（69）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（60）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（57）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（55） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（241） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（127）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（114） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（101）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（77）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（63） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（126）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（115） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 C「这次我也没余力陪读」（84）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（81）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（76） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（241） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（123）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（118） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（241） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（122）；`ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（119） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（38）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（35）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（62）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 37 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（35）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（29%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（71） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s19_nvguan` 上一场走完直接进（71）；`ch02_s18_yuanye` 上一场走完直接进（62）；`ch02_s15_shuge` 上一场走完直接进（38）；`ch02_s17_shishe` 上一场走完直接进（35）；`ch02_s16_yuanye` 上一场走完直接进（35） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（122）；`ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（119） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（241） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（131）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（110） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 A「我在门边等你」（122）；`ch02_s22_shuge` 选 B「今日先走，你慢慢收」（119） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（241） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（241） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（85）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（78）；`ch02_s24_shuge` 选 C「我只约你明日论议」（78） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（147）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（94） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（131）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（110） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（126）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（115） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（127）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（114） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（126）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（115） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（128）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（113） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（241） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（148）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（48）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（45） |  |
| 55 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（2%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（4）<br/>进入条件：flag.li_ch03_private_paused |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（2%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（5）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（3）<br/>进入条件：flag.li_ch03_only_intent |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（104）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（101）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（10）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（9）；`ch03_s09b_yuanye` 上一场走完直接进（5）；`ch03_s09c_yuanye` 上一场走完直接进（4）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（4）；`ch03_s09a_yuanye` 上一场走完直接进（3）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（1） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（241） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（241） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（241） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（241） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（241） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（241） |  |
| 65 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（21%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（51）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 66 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（22%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（53）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 67 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（25%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（60）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 68 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（18%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（44） |  |
| 69 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（14%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（33）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s18_yuanye` 上一场走完直接进（60）；`ch03_s20_yuanye` 上一场走完直接进（53）；`ch03_s19_shishe` 上一场走完直接进（51）；`ch03_s21_nvguan` 上一场走完直接进（44）；`ch03_s17_shuge` 上一场走完直接进（33） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（241） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（241） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（241） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 C「仍用添」（90）；`ch04_s01_zhaoyang` 选 A「写下天」（78）；`ch04_s01_zhaoyang` 选 B「写下曌」（73） |  |
| 75 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s02_hanyuan` 选 A「原议与答复同收」（241）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 76 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s03_shuge` 选 A「原件归存，照权限查阅」（241）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 2 次都经过它） | `ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」（123）；`ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」（118）<br/>进入条件：flag.enthroned |  |
| 78 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（241） |  |
| 79 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（45）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（39）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（39）；`ch04_s05p_shuge` 选 G「独自过一阵」（39）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（34）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（30）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（15） |  |
| 80 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（6%） | `ch04_s05pe_shuge` 换场（15） |  |
| 81 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（226）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（67）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（62）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（55）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（41）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（15） |  |
| 82 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（28%） | `ch04_s05c_shuge` 换场（67） |  |
| 83 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（26%） | `ch04_s05c_shuge` 换场（62） |  |
| 84 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（23%） | `ch04_s05c_shuge` 换场（55） |  |
| 85 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（17%） | `ch04_s05c_shuge` 换场（41） |  |
| 86 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（241）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（25）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（20）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（19）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（19）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（19）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（17）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（15）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（13）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（8）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（4）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（2）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（2） |  |
| 87 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（47） |  |
| 88 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（46） |  |
| 89 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（14%） | `ch04_s05q_shuge` 换场（34） |  |
| 90 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（36） |  |
| 91 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（241） |  |
| 92 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 2 次都经过它） | `ch04_s05r_shuge` 换场（241）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 93 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 5 次都经过它） | `ch04_s05z_yeting` 选 A「收好今日的交付凭」（241）<br/>进入条件：flag.enthroned |  |
| 94 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s06_zhaoyang` 上一场走完直接进（241）<br/>进入条件：flag.enthroned |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 A「颁行多方提名与异议办法」（241） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 A「收好今次交付的回凭」（241） |  |

## 3. 未竟之诏（`weijingzhizhao`）

判定：flag.enthroned。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 2 个结局都不成立。

走到这里的路 1555 条，不同的场次序列 1170 种，每条 72—84 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（924 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（321 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（310 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 ch04_nomination_closed（290）；缺 ch04_originals_destroyed（267）；缺 ch04_dissent_removed（258）；缺 ch04_dissent_removed、ch04_originals_destroyed（256）；缺 ch04_dissent_removed、ch04_nomination_closed（243）；缺 ch04_originals_destroyed、ch04_nomination_closed（241） |
| 无字之碑 | 缺 public_review（774）；缺 public_review、ch04_nomination_open（525）；缺 ch04_nomination_open（256） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（1555） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（1555） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（1555） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（778）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（777） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（1555） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（819）；`ch01_s04_shuge` 对诗输（736） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（1555） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（787）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（768） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（803）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（752） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（821）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（734） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（782）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（773） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（1555） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（779）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（776） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（224）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（22%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（338）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（21%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（322）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（22%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（343）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s16_yuanye` 上一场走完直接进（343）；`ch01_s14_yuanye` 上一场走完直接进（338）；`ch01_s12_shuge` 选 E「直接去找阿荻」（328）；`ch01_s15_shishe` 上一场走完直接进（322）；`ch01_s13_shuge` 上一场走完直接进（224）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（783）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（772）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（1555） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（1555） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（778）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（777） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（1555） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（398）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（389）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（385）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（383） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（1555） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（790）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（765） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（530）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（522）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（503） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（790）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（765） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（525）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（522）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（508） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（1555） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（783）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（772） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（1555） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（792）；`ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（763） |  |
| 34 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（405） |  |
| 35 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（407）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 36 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（269）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 37 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（236）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 38 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（238）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（407）；`ch02_s19_nvguan` 上一场走完直接进（405）；`ch02_s15_shuge` 上一场走完直接进（269）；`ch02_s16_yuanye` 上一场走完直接进（238）；`ch02_s17_shishe` 上一场走完直接进（236） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（800）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（755） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（1555） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（802）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（753） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（833）；`ch02_s22_shuge` 选 A「我在门边等你」（722） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（1555） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（1555） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（527）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（525）；`ch02_s24_shuge` 选 C「我只约你明日论议」（503） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（925）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（630） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（784）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（771） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（791）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（764） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（785）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（770） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（815）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（740） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（782）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（773） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（1555） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（924）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（321）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（310） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（23）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（12）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（19）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（667）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（654）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（86）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（72）；`ch03_s09a_yuanye` 上一场走完直接进（23）；`ch03_s09c_yuanye` 上一场走完直接进（19）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（13）；`ch03_s09b_yuanye` 上一场走完直接进（12）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（9） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（1555） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（1555） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（1555） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（1555） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（1555） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（1555） |  |
| 65 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（21%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（322）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 66 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（20%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（316）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 67 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（21%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（328）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 68 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（20%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（313） |  |
| 69 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（18%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（276）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s20_yuanye` 上一场走完直接进（328）；`ch03_s18_yuanye` 上一场走完直接进（322）；`ch03_s19_shishe` 上一场走完直接进（316）；`ch03_s21_nvguan` 上一场走完直接进（313）；`ch03_s17_shuge` 上一场走完直接进（276） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（1555） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（1555） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（1555） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 B「写下曌」（535）；`ch04_s01_zhaoyang` 选 A「写下天」（514）；`ch04_s01_zhaoyang` 选 C「仍用添」（506） |  |
| 75 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 15 次都经过它） | `ch04_s02_hanyuan` 选 B「议录只收答复，原议另存」（798）；`ch04_s02_hanyuan` 选 A「原议与答复同收」（757）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 76 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 20 次都经过它） | `ch04_s03_shuge` 选 C「原件归存，照权限查阅」（508）；`ch04_s03_shuge` 选 B「确认焚毁原案，不可恢复」（501）；`ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」（290）；`ch04_s03_shuge` 选 A「原件归存，照权限查阅」（256）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 11 次都经过它） | `ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」（408）；`ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」（389）；`ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」（383）；`ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」（375）<br/>进入条件：flag.enthroned |  |
| 78 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（1555） |  |
| 79 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 G「独自过一阵」（334）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（296）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（264）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（244）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（217）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（146）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（54） |  |
| 80 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（3%） | `ch04_s05pe_shuge` 换场（54） |  |
| 81 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1501）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（404）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（357）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（239）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（175）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（54） |  |
| 82 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（11%） | `ch04_s05c_shuge` 换场（175） |  |
| 83 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（26%） | `ch04_s05c_shuge` 换场（404） |  |
| 84 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（23%） | `ch04_s05c_shuge` 换场（357） |  |
| 85 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（15%） | `ch04_s05c_shuge` 换场（239） |  |
| 86 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（1555）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（148）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（134）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（130）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（121）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（114）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（103）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（74）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（72）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（17）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（14）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（12）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（11） |  |
| 87 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（289） |  |
| 88 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（17%） | `ch04_s05q_shuge` 换场（267） |  |
| 89 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（10%） | `ch04_s05q_shuge` 换场（160） |  |
| 90 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（234） |  |
| 91 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（1555） |  |
| 92 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 12 次都经过它） | `ch04_s05r_shuge` 换场（1555）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 93 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 14 次都经过它） | `ch04_s05z_yeting` 选 B「收好今日的交付凭」（798）；`ch04_s05z_yeting` 选 C「收好今日的交付凭」（501）；`ch04_s05z_yeting` 选 A「收好今日的交付凭」（256）<br/>进入条件：flag.enthroned |  |
| 94 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 15 次都经过它） | `ch04_s06_zhaoyang` 上一场走完直接进（1555）<br/>进入条件：flag.enthroned |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 B「颁行仅由在位者提名的办法」（781）；`ch04_s07_hanyuan` 选 A「颁行多方提名与异议办法」（774） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 B「收好今次交付的回凭」（781）；`ch04_s17_nvguan` 选 A「收好今次交付的回凭」（774） |  |

## 4. 两席之间（`liangxizhijian`）

判定：flag.liqinghe_won 且 flag.liqinghe_together 且 非 flag.enthroned 且 非 flag.declined_crown 且 非 flag.founded_school 且 非 flag.road_agreement。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 3 个结局都不成立。

走到这里的路 89 条，不同的场次序列 87 种，每条 73—79 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `liqinghe_won` 要真：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成真 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（89 条）
- `liqinghe_together` 要真：
  - `ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」 写成真（53 条）
  - `ch04_s09_yuanye` 选 A「先留京，再约时辰」 写成真（15 条）
  - `ch04_s09_yuanye` 选 B「办学的事仍要去问」 写成真（12 条）
  - `ch04_s09_yuanye` 选 C「行路的事仍要去问」 写成真（9 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（89 条）
- `declined_crown` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（89 条）
- `founded_school` 要假：
  - 从没被写过，保持初始的假（89 条）
- `road_agreement` 要假：
  - 从没被写过，保持初始的假（89 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（89） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（89） |
| 未竟之诏 | 缺 enthroned（89） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（89） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（89） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（89） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（47）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（42） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（89） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（45）；`ch01_s04_shuge` 对诗赢（44） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（89） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（48）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（41） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（45）；`ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（44） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（46）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（43） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（50）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（39） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（89） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（47）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（42） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（7%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（6）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（21%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（19）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（24%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（21）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（24%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（21）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s12_shuge` 选 E「直接去找阿荻」（22）；`ch01_s16_yuanye` 上一场走完直接进（21）；`ch01_s15_shishe` 上一场走完直接进（21）；`ch01_s14_yuanye` 上一场走完直接进（19）；`ch01_s13_shuge` 上一场走完直接进（6）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（46）；`ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（43）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（89） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（89） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（54）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（35） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（89） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 A「一起读。读完也想见你」（28）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（22）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（20）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（19） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（89） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（51）；`ch02_s06_yeting` 选 B「先付六件，余款催原项」（38） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（36）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（28）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（25） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（48）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（41） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 C「这次我也没余力陪读」（36）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（32）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（21） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（89） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（46）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（43） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（89） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（46）；`ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（43） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（20%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（18）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（12%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（11）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 36 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（13%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（12）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（22）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（29%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（26） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s19_nvguan` 上一场走完直接进（26）；`ch02_s18_yuanye` 上一场走完直接进（22）；`ch02_s15_shuge` 上一场走完直接进（18）；`ch02_s16_yuanye` 上一场走完直接进（12）；`ch02_s17_shishe` 上一场走完直接进（11） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（46）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（43） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（89） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（45）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（44） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（52）；`ch02_s22_shuge` 选 A「我在门边等你」（37） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（89） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（89） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 B「今夜想独处，改日再问」（36）；`ch02_s24_shuge` 选 C「我只约你明日论议」（31）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（22） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（59）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（30） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（55）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（34） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（45）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（44） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（45）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（44） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（46）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（43） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（48）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（41） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（89） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（89） |  |
| 55 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（1）<br/>进入条件：flag.li_ch03_private_paused |  |
| 56 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（39）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（29）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（7）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（6）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（6）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（1）；`ch03_s09c_yuanye` 上一场走完直接进（1） |  |
| 57 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（89） |  |
| 58 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（89） |  |
| 59 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（89） |  |
| 60 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（89） |  |
| 61 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（89） |  |
| 62 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（89） |  |
| 63 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（15%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（13）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 64 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（15%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（13）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 65 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（46%） | `ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（18）；`ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（13）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（10） |  |
| 66 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（17%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（15）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 67 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（8%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（7）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 68 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（41）；`ch03_s19_shishe` 上一场走完直接进（15）；`ch03_s20_yuanye` 上一场走完直接进（13）；`ch03_s18_yuanye` 上一场走完直接进（13）；`ch03_s17_shuge` 上一场走完直接进（7） |  |
| 69 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（89） |  |
| 70 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（89） |  |
| 71 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（89） |  |
| 72 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（89） |  |
| 73 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（89）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 74 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（89） |  |
| 75 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（89） |  |
| 76 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（89）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（26）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（25）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（22） |  |
| 77 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（22） |  |
| 78 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（28%） | `ch04_s05c_shuge` 换场（25） |  |
| 79 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（29%） | `ch04_s05c_shuge` 换场（26） |  |
| 80 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（89）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（89） |  |
| 81 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s05q_shuge` 换场（89）<br/>上一场的另一条去向：`ch04_s05qa_shuge`（无进入条件，但本线的选项没有走向它）、`ch04_s05qb_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s05qc_shishe`（无进入条件，但本线的选项没有走向它）、`ch04_s05r_shuge`（无进入条件，但本线的选项没有走向它） |  |
| 82 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（89） |  |
| 83 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s05r_shuge` 换场（89）<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 84 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（89）<br/>进入条件：非 flag.enthroned |  |
| 85 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（40%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（36）<br/>进入条件：flag.liqinghe_won |  |
| 86 | `ch04_s11_nvguan` | 三日以后谁付 | 选出来的（47%） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（30）；`ch04_s09_yuanye` 选 B「办学的事仍要去问」（12）<br/>进入条件：flag.liqinghe_won |  |
| 87 | `ch04_s14_shuge` | 归期写在前面 | 选出来的（36%） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（23）；`ch04_s09_yuanye` 选 C「行路的事仍要去问」（9）<br/>进入条件：flag.liqinghe_won |  |
| 88 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s11_nvguan` 选 B「这回先不接」（42）；`ch04_s14_shuge` 选 B「这回不接，归期的纸我留着」（32）；`ch04_s09_yuanye` 选 A「先留京，再约时辰」（15）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s12_nvguan`（要 flag.ch04_school_contract）、`ch04_s14_shuge`（要 flag.liqinghe_won）、`ch04_s15_yilu`（要 flag.ch04_road_contract） |  |
| 89 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（89） |  |
| 90 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（89） |  |

## 5. 开门授字（`kaimenshouzi`）

判定：flag.founded_school 且 非 flag.enthroned 且 非 flag.declined_crown。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 4 个结局都不成立。

走到这里的路 634 条，不同的场次序列 598 种，每条 71—82 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `founded_school` 要真：
  - `ch04_s12_nvguan` 选 A「收好今日的课页」 写成真（634 条）
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
| 两席之间 | 缺 liqinghe_together、非 founded_school（590）；缺 非 founded_school（44） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（634） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（634） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（634） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（330）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（304） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（634） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（322）；`ch01_s04_shuge` 对诗赢（312） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（634） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（331）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（303） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（323）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（311） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 A「先收六份，满额便明示」（330）；`ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（304） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（342）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（292） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（634） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（341）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（293） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（15%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（96）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（21%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（133）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（22%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（138）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（23%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（143）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s16_yuanye` 上一场走完直接进（143）；`ch01_s15_shishe` 上一场走完直接进（138）；`ch01_s14_yuanye` 上一场走完直接进（133）；`ch01_s12_shuge` 选 E「直接去找阿荻」（124）；`ch01_s13_shuge` 上一场走完直接进（96）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（323）；`ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（311）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（634） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（634） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（342）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（292） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（634） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 A「一起读。读完也想见你」（174）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（161）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（150）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（149） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（634） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（331）；`ch02_s06_yeting` 选 B「先付六件，余款催原项」（303） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（229）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（221）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（184） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 A「连往返按半日给俸」（322）；`ch02_s08_shuge` 选 B「按次给俸，往返另记」（312） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 C「这次我也没余力陪读」（218）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（211）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（205） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（634） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（339）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（295） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（634） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（326）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（308） |  |
| 34 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（13%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（82）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 35 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（29%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（186）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 36 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（164） |  |
| 37 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（103）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 38 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（99）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（186）；`ch02_s19_nvguan` 上一场走完直接进（164）；`ch02_s15_shuge` 上一场走完直接进（103）；`ch02_s17_shishe` 上一场走完直接进（99）；`ch02_s16_yuanye` 上一场走完直接进（82） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（318）；`ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（316） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（634） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（327）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（307） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（318）；`ch02_s22_shuge` 选 A「我在门边等你」（316） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（634） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（634） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（232）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（206）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（196） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（453）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（181） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（324）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（310） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（356）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（278） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（331）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（303） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（317）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（317） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（325）；`ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（309） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（634） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（634） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（8）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（2%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（14）<br/>进入条件：flag.li_ch03_private_paused |  |
| 57 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（0%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（3）<br/>进入条件：flag.li_ch03_multi_told |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（283）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（275）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（22）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（21）；`ch03_s09c_yuanye` 上一场走完直接进（14）；`ch03_s09a_yuanye` 上一场走完直接进（8）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（5）；`ch03_s09b_yuanye` 上一场走完直接进（3）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（3） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（634） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（634） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（634） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（634） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（634） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（634） |  |
| 65 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（16%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（99）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 66 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（13%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（83）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 67 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（15%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（96）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 68 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（12%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（74）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 69 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（44%） | `ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（100）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（93）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（89） |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（282）；`ch03_s18_yuanye` 上一场走完直接进（99）；`ch03_s19_shishe` 上一场走完直接进（96）；`ch03_s20_yuanye` 上一场走完直接进（83）；`ch03_s17_shuge` 上一场走完直接进（74） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（634） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（634） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（634） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（634） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 14 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（634）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（634） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（126）；`ch04_s05p_shuge` 选 G「独自过一阵」（107）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（105）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（96）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（90）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（79）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（31） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（5%） | `ch04_s05pe_shuge` 换场（31） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（603）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（173）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（157）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（143）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（91）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（31） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（23%） | `ch04_s05c_shuge` 换场（143） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（27%） | `ch04_s05c_shuge` 换场（173） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（157） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（14%） | `ch04_s05c_shuge` 换场（91） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（634）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（67）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（59）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（58）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（48）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（46）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（44）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（40）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（35）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（15）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（11）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（9）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（5） |  |
| 85 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（14%） | `ch04_s05q_shuge` 换场（88） |  |
| 86 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（21%） | `ch04_s05q_shuge` 换场（135） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（17%） | `ch04_s05q_shuge` 换场（113） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（101） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（634） |  |
| 90 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 选出来的（7%） | `ch04_s05r_shuge` 换场（44） |  |
| 91 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 17 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（590）；`ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（44）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 92 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（33%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（209）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s11_nvguan` | 三日以后谁付 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（425）；`ch04_s09_yuanye` 选 E「今后只谈公事，我去问办学」（193）；`ch04_s09_yuanye` 选 B「办学的事仍要去问」（16）<br/>进入条件：flag.liqinghe_won<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s14_shuge`（要 flag.liqinghe_won） |  |
| 94 | `ch04_s12_nvguan` | 半日也算来过 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s11_nvguan` 选 A「按这一月的约定办」（634）<br/>进入条件：flag.ch04_school_contract<br/>上一场的另一条去向：`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s11_nvguan`（要 flag.liqinghe_won） | ✓ |
| 95 | `ch04_s13_nvguan` | 她们收自己的席 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s12_nvguan` 选 A「收好今日的课页」（634）<br/>进入条件：flag.founded_school | ✓ |
| 96 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s13_nvguan` 上一场走完直接进（634） |  |
| 97 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（634） |  |

## 6. 不受（`bushou`）

判定：flag.declined_crown 且 非 flag.enthroned。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 5 个结局都不成立。

走到这里的路 2084 条，不同的场次序列 1472 种，每条 69—83 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `declined_crown` 要真：
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（1271 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（407 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（406 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」 写成真）（1271 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」 写成真）（407 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代递，留人核卷」 写成真）（406 条）

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
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（1046）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（1038） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（2084） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（1091）；`ch01_s04_shuge` 对诗赢（993） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（2084） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（1058）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（1026） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（1079）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（1005） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 A「先收六份，满额便明示」（1050）；`ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（1034） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（1051）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（1033） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（2084） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（1045）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（1039） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（15%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（304）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（21%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（443）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（21%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（428）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（23%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（480）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s16_yuanye` 上一场走完直接进（480）；`ch01_s14_yuanye` 上一场走完直接进（443）；`ch01_s12_shuge` 选 E「直接去找阿荻」（429）；`ch01_s15_shishe` 上一场走完直接进（428）；`ch01_s13_shuge` 上一场走完直接进（304）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（1052）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（1032）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（2084） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（2084） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（1079）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（1005） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（2084） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（561）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（519）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（514）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（490） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（2084） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（1045）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（1039） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（697）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（695）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（692） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（1059）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（1025） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（715）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（715）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（654） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（2084） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（1060）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（1024） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（2084） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（1105）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（979） |  |
| 34 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（320）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 35 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（24%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（509） |  |
| 36 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（326）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（27%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（556）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（18%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（373）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（556）；`ch02_s19_nvguan` 上一场走完直接进（509）；`ch02_s15_shuge` 上一场走完直接进（373）；`ch02_s16_yuanye` 上一场走完直接进（326）；`ch02_s17_shishe` 上一场走完直接进（320） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（1093）；`ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（991） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（2084） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（1077）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（1007） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（1048）；`ch02_s22_shuge` 选 A「我在门边等你」（1036） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（2084） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（2084） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 B「今夜想独处，改日再问」（734）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（698）；`ch02_s24_shuge` 选 C「我只约你明日论议」（652） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「不利页与补答一同交核」（1227）；`ch03_s01_shuge` 选 B「暂缓公开，先补证」（857） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（1052）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（1032） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（1051）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（1033） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（1045）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（1039） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（1051）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（1033） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（1047）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（1037） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（2084） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「缩为两处，先付钱并办实代递」（1271）；`ch03_s08_hanyuan` 选 B「缩办保经费，留人核卷」（407）；`ch03_s08_hanyuan` 选 C「先办代递，留人核卷」（406） |  |
| 55 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（22）<br/>进入条件：flag.li_ch03_private_paused |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（29）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（24）<br/>进入条件：flag.li_ch03_only_intent |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（892）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（878）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（97）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（86）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（33）；`ch03_s09b_yuanye` 上一场走完直接进（29）；`ch03_s09a_yuanye` 上一场走完直接进（24）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（23）；`ch03_s09c_yuanye` 上一场走完直接进（22） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（2084） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」（2084） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」（2084） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（2084） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（2084） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（2084） |  |
| 65 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（12%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（243）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 66 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（13%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（279）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 67 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（15%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（313）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 68 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（46%） | `ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（322）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（321）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（311） |  |
| 69 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（14%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（295）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（954）；`ch03_s20_yuanye` 上一场走完直接进（313）；`ch03_s19_shishe` 上一场走完直接进（295）；`ch03_s18_yuanye` 上一场走完直接进（279）；`ch03_s17_shuge` 上一场走完直接进（243） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（2084） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（2084） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（2084） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 D「领回自己的东西」（2084） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 16 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（2084）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（2084） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（414）；`ch04_s05p_shuge` 选 G「独自过一阵」（370）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（341）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（306）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（285）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（279）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（89） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（89） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1995）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（531）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（517）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（496）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（333）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（89） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（531） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（24%） | `ch04_s05c_shuge` 换场（496） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（517） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（16%） | `ch04_s05c_shuge` 换场（333） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（2084）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（173）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（173）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（168）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（154）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（150）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（146）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（145）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（135）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（30）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（24）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（16）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（11） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（371） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（310） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（335） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（309） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（2084） |  |
| 90 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 18 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（2084）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 91 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 16 次都经过它） | `ch04_s08z_shuge` 选 A「今日不定去处，出去吃点东西」（2084）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s14_shuge`（要 flag.liqinghe_won） |  |
| 92 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（2084） |  |
| 93 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（2084） |  |

## 7. 关山有信（`guanshanyouxin`）

判定：flag.road_agreement 且 非 flag.enthroned 且 非 flag.declined_crown。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 6 个结局都不成立。

走到这里的路 642 条，不同的场次序列 589 种，每条 71—82 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `road_agreement` 要真：
  - `ch04_s15_yilu` 选 A「随车到第一处交接」 写成真（642 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（642 条）
- `declined_crown` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」 写成假）（642 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（642） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（642） |
| 未竟之诏 | 缺 enthroned（642） |
| 两席之间 | 缺 liqinghe_together、非 road_agreement（603）；缺 非 road_agreement（39） |
| 开门授字 | 缺 founded_school（642） |
| 不受 | 缺 declined_crown（642） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（642） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（642） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（642） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（324）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（318） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（642） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（322）；`ch01_s04_shuge` 对诗输（320） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（642） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（346）；`ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（296） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（329）；`ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（313） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（337）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（305） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（322）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（320） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（642） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（322）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（320） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（15%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（97）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（23%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（145）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（21%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（134）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（20%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（131）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s14_yuanye` 上一场走完直接进（145）；`ch01_s12_shuge` 选 E「直接去找阿荻」（135）；`ch01_s15_shishe` 上一场走完直接进（134）；`ch01_s16_yuanye` 上一场走完直接进（131）；`ch01_s13_shuge` 上一场走完直接进（97）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（338）；`ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（304）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（642） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（642） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项核，门外散去」（331）；`ch02_s02_yeting` 选 B「午后再核，给她留半日」（311） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（642） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（170）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（163）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（156）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（153） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（642） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（322）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（320） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我核欠项，你去问她」（226）；`ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（223）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（193） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（353）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（289） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 C「这次我也没余力陪读」（223）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（210）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（209） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（642） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（321）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（321） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（642） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（349）；`ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（293） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（13%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（84）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（97）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（111）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（170） |  |
| 38 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（28%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（180）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（180）；`ch02_s19_nvguan` 上一场走完直接进（170）；`ch02_s17_shishe` 上一场走完直接进（111）；`ch02_s16_yuanye` 上一场走完直接进（97）；`ch02_s15_shuge` 上一场走完直接进（84） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（339）；`ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（303） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（642） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（327）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（315） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 A「我在门边等你」（341）；`ch02_s22_shuge` 选 B「今日先走，你慢慢收」（301） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（642） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（642） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 B「今夜想独处，改日再问」（225）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（210）；`ch02_s24_shuge` 选 C「我只约你明日论议」（207） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（413）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（229） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（330）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（312） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（338）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（304） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（331）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（311） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（335）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（307） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（321）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（321） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（642） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（642） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（5）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（9）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（4）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（278）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（275）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（33）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（25）；`ch03_s09b_yuanye` 上一场走完直接进（9）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（7）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（6）；`ch03_s09a_yuanye` 上一场走完直接进（5）；`ch03_s09c_yuanye` 上一场走完直接进（4） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（642） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（642） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（642） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（642） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（642） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（642） |  |
| 65 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（15%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（95）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 66 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（16%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（102）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 67 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（13%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（82）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 68 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（42%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（100）；`ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（96）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（73） |  |
| 69 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（15%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（94）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（269）；`ch03_s18_yuanye` 上一场走完直接进（102）；`ch03_s20_yuanye` 上一场走完直接进（95）；`ch03_s17_shuge` 上一场走完直接进（94）；`ch03_s19_shishe` 上一场走完直接进（82） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（642） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（642） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（642） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（642） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 13 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（642）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（642） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 G「独自过一阵」（125）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（122）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（115）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（89）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（85）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（84）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（22） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（3%） | `ch04_s05pe_shuge` 换场（22） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（620）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（153）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（152）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（143）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（80）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（22） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（24%） | `ch04_s05c_shuge` 换场（152） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（22%） | `ch04_s05c_shuge` 换场（143） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（24%） | `ch04_s05c_shuge` 换场（153） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（12%） | `ch04_s05c_shuge` 换场（80） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（642）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（65）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（57）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（54）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（49）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（45）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（43）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（41）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（39）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（10）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（10）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（7）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（1） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（21%） | `ch04_s05q_shuge` 换场（132） |  |
| 86 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（14%） | `ch04_s05q_shuge` 换场（91） |  |
| 87 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（107） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（14%） | `ch04_s05q_shuge` 换场（91） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（642） |  |
| 90 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 选出来的（6%） | `ch04_s05r_shuge` 换场（39） |  |
| 91 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 19 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（603）；`ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（39）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 92 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（36%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（234）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s14_shuge` | 归期写在前面 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（408）；`ch04_s09_yuanye` 选 F「今后只谈公事，我去问行路」（224）；`ch04_s09_yuanye` 选 C「行路的事仍要去问」（10）<br/>进入条件：flag.liqinghe_won<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s11_nvguan`（要 flag.liqinghe_won） |  |
| 94 | `ch04_s15_yilu` | 各自领一份 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s14_shuge` 选 A「接这一月的差，明早领款」（642）<br/>进入条件：flag.ch04_road_contract<br/>上一场的另一条去向：`ch04_s10_yuanye`（要 非 flag.enthroned） | ✓ |
| 95 | `ch04_s16_yilu` | 驿旁不是归处 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s15_yilu` 选 A「随车到第一处交接」（642）<br/>进入条件：flag.road_agreement | ✓ |
| 96 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s16_yilu` 上一场走完直接进（642） |  |
| 97 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（642） |  |

## 8. 纸上有名（`zhishangyouming`）

判定：无条件（兜底：前面七个都不成立时落到这里）。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 7 个结局都不成立。

走到这里的路 1261 条，不同的场次序列 1184 种，每条 70—85 场。

### 判定用到的 flag 是在哪里写下的

无：兜底结局不看 flag。

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（1261） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（1261） |
| 未竟之诏 | 缺 enthroned（1261） |
| 两席之间 | 缺 liqinghe_together（1261） |
| 开门授字 | 缺 founded_school（1261） |
| 不受 | 缺 declined_crown（1261） |
| 关山有信 | 缺 road_agreement（1261） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（1261） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（1261） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（1261） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（637）；`ch01_s02_zhaoyang` 选 B「逐张附改，我留名备查」（624） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（1261） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（638）；`ch01_s04_shuge` 对诗输（623） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（1261） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等核齐，我来补夜里的抄工」（659）；`ch01_s06_yeting` 选 A「先发已核的，我记余数追领」（602） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「我陪你催，但不替你许归期」（636）；`ch01_s07_yuanye` 选 B「日子仍要问，我陪你逐项核」（625） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（636）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（625） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（654）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（607） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（1261） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（654）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（607） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（173）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（21%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（266）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（21%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（264）<br/>进入条件：affinity.wenqiao >= 4 |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（22%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（276）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s12_shuge` 选 E「直接去找阿荻」（282）；`ch01_s16_yuanye` 上一场走完直接进（276）；`ch01_s14_yuanye` 上一场走完直接进（266）；`ch01_s15_shishe` 上一场走完直接进（264）；`ch01_s13_shuge` 上一场走完直接进（173）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「我先追原牒，请宋才人陪你」（634）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（627）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（1261） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（1261） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再核，给她留半日」（640）；`ch02_s02_yeting` 选 A「现在逐项核，门外散去」（621） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（1261） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 A「一起读。读完也想见你」（344）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（322）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（311）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（284） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（1261） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余款催原项」（633）；`ch02_s06_yeting` 选 A「暂垫补栏款，今日付清」（628） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 B「我核脚程，你把粮数列齐」（444）；`ch02_s07_yuanye` 选 A「我核欠项，你去问她」（412）；`ch02_s07_yuanye` 选 C「我今日接不下，另请人核」（405） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（654）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（607） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（460）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（412）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（389） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（1261） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先验封原件，再收议抄」（634）；`ch02_s11_hanyuan` 选 A「先收议抄，再一同验封」（627） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（1261） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「验存公务摘录，退还私笺」（634）；`ch02_s13_hanyuan` 选 A「全笺限阅，另存公务摘录」（627） |  |
| 34 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（316）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 35 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（19%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（235）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 36 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（321） |  |
| 37 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（197）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 38 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（192）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s19_nvguan` 上一场走完直接进（321）；`ch02_s18_yuanye` 上一场走完直接进（316）；`ch02_s15_shuge` 上一场走完直接进（235）；`ch02_s17_shishe` 上一场走完直接进（197）；`ch02_s16_yuanye` 上一场走完直接进（192） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 A「试联署核验，列回避与申辩」（646）；`ch02_s20_hanyuan` 选 B「试限期问策，列旅费与评期」（615） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（1261） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（647）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（614） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（649）；`ch02_s22_shuge` 选 A「我在门边等你」（612） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文牒，准备比较」（1261） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（1261） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（427）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（419）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（415） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「暂缓公开，先补证」（866）；`ch03_s01_shuge` 选 A「不利页与补答一同交核」（395） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（635）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（626） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（635）；`ch03_s03_yeting` 选 B「撤回代答，我出工费并交班」（626） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（631）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（630） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（631）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（630） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「收下合记摘要，底簿照留」（647）；`ch03_s06_shuge` 选 B「并列她的经手，我只署总办」（614） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（1261） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「保留六处扩办案，先交现有凭据」（1261） |  |
| 55 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（10）<br/>进入条件：flag.li_ch03_multi_told |  |
| 56 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（14）<br/>进入条件：flag.li_ch03_private_paused |  |
| 57 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（10）<br/>进入条件：flag.li_ch03_only_intent |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（554）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（537）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（63）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（58）；`ch03_s09c_yuanye` 上一场走完直接进（14）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（11）；`ch03_s09a_yuanye` 上一场走完直接进（10）；`ch03_s09b_yuanye` 上一场走完直接进（10）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（4） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（1261） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（1261） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（1261） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（1261） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「署下交讫，带走柳的凭据」（1261） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（1261） |  |
| 65 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（14%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（173）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 66 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（12%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（156）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 67 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（13%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（161）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 68 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（16%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（205）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 69 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（45%） | `ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（194）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（190）；`ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（182） |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（566）；`ch03_s19_shishe` 上一场走完直接进（205）；`ch03_s20_yuanye` 上一场走完直接进（173）；`ch03_s17_shuge` 上一场走完直接进（161）；`ch03_s18_yuanye` 上一场走完直接进（156） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（1261） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（1261） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（1261） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（1261） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 8 次都经过它） | `ch04_s02_hanyuan` 选 C「递交本人意见，领回存件」（1261）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（1261） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（273）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（232）；`ch04_s05p_shuge` 选 G「独自过一阵」（225）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（182）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（182）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（99）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（68） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（5%） | `ch04_s05pe_shuge` 换场（68） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1193）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（321）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（315）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（300）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（205）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（68） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（315） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（321） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（24%） | `ch04_s05c_shuge` 换场（300） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（16%） | `ch04_s05c_shuge` 换场（205） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（1261）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（117）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（115）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（112）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（111）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（99）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（91）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（89）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（30）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（26）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（21）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（16） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（253） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（17%） | `ch04_s05q_shuge` 换场（228） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（17%） | `ch04_s05q_shuge` 换场（217） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（10%） | `ch04_s05q_shuge` 换场（129） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（1261） |  |
| 90 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 12 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（1261）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 91 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（48%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（611）<br/>进入条件：flag.liqinghe_won |  |
| 92 | `ch04_s14_shuge` | 归期写在前面 | 选出来的（40%） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（327）；`ch04_s09_yuanye` 选 F「今后只谈公事，我去问行路」（180）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s11_nvguan` | 三日以后谁付 | 选出来的（39%） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（323）；`ch04_s09_yuanye` 选 E「今后只谈公事，我去问办学」（170）<br/>进入条件：flag.liqinghe_won |  |
| 94 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s14_shuge` 选 B「这回不接，归期的纸我留着」（507）；`ch04_s11_nvguan` 选 B「这回先不接」（493）；`ch04_s09_yuanye` 选 D「今后只谈公事，我先留京」（261）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s12_nvguan`（要 flag.ch04_school_contract）、`ch04_s14_shuge`（要 flag.liqinghe_won）、`ch04_s15_yilu`（要 flag.ch04_road_contract） |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（1261） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（1261） |  |

## 附：必经的复核记录

抽样里「每条都经过」、但图上绕得开的场，都朝那个结局专门绕着走过（每场最多 60 次，绕开一次就停）。绕开了的，那条路已经算进这条线，这一场随之变成「选出来的」。

- 复核 39 处，绕开 0 处，留作必经 39 处。

| 结局 | 场次 | 结果 |
|---|---|---|
| 不受 | `ch04_s08_shuge` | 没绕开：试 60 次，16 次走到本结局 |
| 不受 | `ch04_s08z_shuge` | 没绕开：试 60 次，18 次走到本结局 |
| 不受 | `ch04_s10_yuanye` | 没绕开：试 60 次，16 次走到本结局 |
| 关山有信 | `ch04_s08_shuge` | 没绕开：试 60 次，13 次走到本结局 |
| 关山有信 | `ch04_s08z_shuge` | 没绕开：试 60 次，19 次走到本结局 |
| 关山有信 | `ch04_s14_shuge` | 没绕开：试 60 次，0 次走到本结局 |
| 关山有信 | `ch04_s15_yilu` | 没绕开：试 60 次，0 次走到本结局 |
| 关山有信 | `ch04_s16_yilu` | 没绕开：试 60 次，0 次走到本结局 |
| 开门授字 | `ch04_s08_shuge` | 没绕开：试 60 次，14 次走到本结局 |
| 开门授字 | `ch04_s08z_shuge` | 没绕开：试 60 次，17 次走到本结局 |
| 开门授字 | `ch04_s11_nvguan` | 没绕开：试 60 次，0 次走到本结局 |
| 开门授字 | `ch04_s12_nvguan` | 没绕开：试 60 次，0 次走到本结局 |
| 开门授字 | `ch04_s13_nvguan` | 没绕开：试 60 次，0 次走到本结局 |
| 两席之间 | `ch04_s05qd_yuanye` | 没绕开：试 60 次，1 次走到本结局 |
| 两席之间 | `ch04_s05rl_yuanye` | 没绕开：试 60 次，1 次走到本结局 |
| 两席之间 | `ch04_s08_shuge` | 没绕开：试 60 次，1 次走到本结局 |
| 两席之间 | `ch04_s08z_shuge` | 没绕开：试 60 次，0 次走到本结局 |
| 两席之间 | `ch04_s10_yuanye` | 没绕开：试 60 次，0 次走到本结局 |
| 满殿无声 | `ch04_s03_shuge` | 没绕开：试 60 次，2 次走到本结局 |
| 满殿无声 | `ch04_s04_zhaoyang` | 没绕开：试 60 次，1 次走到本结局 |
| 满殿无声 | `ch04_s05_yeting` | 没绕开：试 60 次，0 次走到本结局 |
| 满殿无声 | `ch04_s05z_yeting` | 没绕开：试 60 次，0 次走到本结局 |
| 满殿无声 | `ch04_s06_zhaoyang` | 没绕开：试 60 次，3 次走到本结局 |
| 满殿无声 | `ch04_s07_hanyuan` | 没绕开：试 60 次，0 次走到本结局 |
| 未竟之诏 | `ch04_s03_shuge` | 没绕开：试 60 次，15 次走到本结局 |
| 未竟之诏 | `ch04_s04_zhaoyang` | 没绕开：试 60 次，20 次走到本结局 |
| 未竟之诏 | `ch04_s05_yeting` | 没绕开：试 60 次，11 次走到本结局 |
| 未竟之诏 | `ch04_s05z_yeting` | 没绕开：试 60 次，12 次走到本结局 |
| 未竟之诏 | `ch04_s06_zhaoyang` | 没绕开：试 60 次，14 次走到本结局 |
| 未竟之诏 | `ch04_s07_hanyuan` | 没绕开：试 60 次，15 次走到本结局 |
| 无字之碑 | `ch04_s03_shuge` | 没绕开：试 60 次，3 次走到本结局 |
| 无字之碑 | `ch04_s04_zhaoyang` | 没绕开：试 60 次，1 次走到本结局 |
| 无字之碑 | `ch04_s05_yeting` | 没绕开：试 60 次，2 次走到本结局 |
| 无字之碑 | `ch04_s05z_yeting` | 没绕开：试 60 次，2 次走到本结局 |
| 无字之碑 | `ch04_s06_zhaoyang` | 没绕开：试 60 次，5 次走到本结局 |
| 无字之碑 | `ch04_s07_hanyuan` | 没绕开：试 60 次，3 次走到本结局 |
| 纸上有名 | `ch04_s08_shuge` | 没绕开：试 60 次，8 次走到本结局 |
| 纸上有名 | `ch04_s08z_shuge` | 没绕开：试 60 次，12 次走到本结局 |
| 纸上有名 | `ch04_s10_yuanye` | 没绕开：试 60 次，0 次走到本结局 |

