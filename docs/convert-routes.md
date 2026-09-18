# 八条线的场次骨架

> 由 `tools/convert-routes.ts` 生成（CC2，D-115 第一步），交 ChatGPT 写《八条线的故事线》。不要手改；数据变了重跑这个脚本。
> 读的是 `src/data/converted/`（数据指纹 `a98717d7815e`，对应 manifest 里 14 份原文的那一次转换），不读剧本原文。

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
| 满殿无声 | flag.enthroned 且 flag.ch04_dissent_removed 且 flag.ch04_originals_destroyed 且 flag.ch04_nomination_closed | 264 | 227 | 73—80 | 70 | 23 | 0 |
| 无字之碑 | flag.enthroned 且 flag.public_review 且 flag.ch04_nomination_open | 273 | 250 | 73—82 | 70 | 26 | 0 |
| 未竟之诏 | flag.enthroned | 1581 | 1109 | 73—83 | 70 | 26 | 0 |
| 两席之间 | flag.liqinghe_won 且 flag.liqinghe_together 且 非 flag.enthroned 且 非 flag.declined_crown 且 非 flag.founded_school 且 非 flag.road_agreement | 87 | 85 | 74—80 | 69 | 22 | 0 |
| 开门授字 | flag.founded_school 且 非 flag.enthroned 且 非 flag.declined_crown | 623 | 557 | 72—87 | 69 | 28 | 2 |
| 不受 | flag.declined_crown 且 非 flag.enthroned | 2040 | 1310 | 70—83 | 67 | 26 | 0 |
| 关山有信 | flag.road_agreement 且 非 flag.enthroned 且 非 flag.declined_crown | 638 | 572 | 72—86 | 69 | 28 | 2 |
| 纸上有名 | 无条件（兜底：前面七个都不成立时落到这里） | 1214 | 1103 | 71—84 | 67 | 29 | 0 |

## 1. 满殿无声（`mandianwusheng`）

判定：flag.enthroned 且 flag.ch04_dissent_removed 且 flag.ch04_originals_destroyed 且 flag.ch04_nomination_closed。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 0 个结局都不成立。

走到这里的路 264 条，不同的场次序列 227 种，每条 73—80 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「减为两处，付足钱并办好代送」 写成真）（152 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「先保经费，留人查卷，代送缓办」 写成真）（59 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代送并查卷，下月经费待补」 写成真）（53 条）
- `ch04_dissent_removed` 要真：
  - `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真 ← 这一项要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只留我答的，反对原话另存」 写成真（264 条）
- `ch04_originals_destroyed` 要真：
  - `ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」 写成真 ← 这一项要 `ch04_originals_burn_order` 来自 `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真（它又要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只留我答的，反对原话另存」 写成真）（149 条）
  - `ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」 写成真 ← 这一项要 `ch04_originals_burn_order` 来自 `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」 写成真（它又要 `ch04_dissent_remove_order` 来自 `ch04_s02_hanyuan` 选 B「议录只留我答的，反对原话另存」 写成真）（115 条）
- `ch04_nomination_closed` 要真：
  - `ch04_s17_nvguan` 选 B「收好今次交付的回凭」 写成真 ← 这一项要 `ch04_nomination_closed_order` 来自 `ch04_s07_hanyuan` 选 B「只许在位者荐人」 写成真（264 条）

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（264） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（264） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（264） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（137）；`ch01_s02_zhaoyang` 选 B「逐张补明改处，我签名备查」（127） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（264） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（135）；`ch01_s04_shuge` 对诗输（129） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（264） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先领布，我记下缺线再追领」（137）；`ch01_s06_yeting` 选 B「等布线齐了，我留下补抄」（127） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「陪你逐项查清，再问归期」（132）；`ch01_s07_yuanye` 选 A「陪你催欠钱，不替你许归期」（132） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 A「先收六份，满额便明示」（142）；`ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（122） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（135）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（129） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（264） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（134）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（130） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（37）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（22%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（58）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（44%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（59）；`ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（56） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（20%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（54）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（115）；`ch01_s14_yuanye` 上一场走完直接进（58）；`ch01_s16_yuanye` 上一场走完直接进（54）；`ch01_s13_shuge` 上一场走完直接进（37）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「先追呈文，请宋才人陪你」（144）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（120）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（264） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（264） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项查清，请门外的人散去」（141）；`ch02_s02_yeting` 选 B「午后再查，给她留半日」（123） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（264） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 C「我只核这卷，不约私见」（78）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（74）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（59）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（53） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（264） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「先垫修栏的钱，今日付清」（133）；`ch02_s06_yeting` 选 B「先付六件，余下三件另催」（131） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我查欠了什么，你去问她」（104）；`ch02_s07_yuanye` 选 B「我查行程，你列齐粮数」（90）；`ch02_s07_yuanye` 选 C「这回不接，请另找人查」（70） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（140）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（124） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（91）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（88）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（85） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（264） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先查原封，再收住议抄」（139）；`ch02_s11_hanyuan` 选 A「先收住议抄，再查原封」（125） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（264） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「整封限人查阅，另抄公务部分」（139）；`ch02_s13_hanyuan` 选 B「核存公务部分，把私信退还」（125） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（13%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（35）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（40）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（45）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（28%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（75）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（69） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（75）；`ch02_s19_nvguan` 上一场走完直接进（69）；`ch02_s17_shishe` 上一场走完直接进（45）；`ch02_s16_yuanye` 上一场走完直接进（40）；`ch02_s15_shuge` 上一场走完直接进（35） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「限期自行答问，列清路费与日期」（139）；`ch02_s20_hanyuan` 选 A「三处联署，列清避嫌与申辩办法」（125） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（264） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（134）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（130） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（141）；`ch02_s22_shuge` 选 A「我在门边等你」（123） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文书，准备逐项比较」（264） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（264） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（96）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（84）；`ch02_s24_shuge` 选 C「我只约你明日论议」（84） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「反对的话和我的说明一起送查」（156）；`ch03_s01_shuge` 选 B「先补证再公开，错过本轮查证」（108） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（134）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（130） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「请另两人代班，我付钱并交班」（134）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（130） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（134）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（130） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（133）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（131） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她做的事，我只署总管」（143）；`ch03_s06_shuge` 选 A「简录只列我，底簿留她的名」（121） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（264） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「减为两处，付足钱并办好代送」（152）；`ch03_s08_hanyuan` 选 B「先保经费，留人查卷，代送缓办」（59）；`ch03_s08_hanyuan` 选 C「先办代送并查卷，下月经费待补」（53） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（2）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（2）<br/>进入条件：flag.li_ch03_private_paused |  |
| 57 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（116）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（112）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（15）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（10）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（4）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（3）；`ch03_s09a_yuanye` 上一场走完直接进（2）；`ch03_s09c_yuanye` 上一场走完直接进（2） |  |
| 58 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（264） |  |
| 59 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（264） |  |
| 60 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（264） |  |
| 61 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（264） |  |
| 62 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「签明交清，带走柳的凭据」（264） |  |
| 63 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（264） |  |
| 64 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（22%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（57）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 65 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（23%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（61）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 66 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（18%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（48）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 67 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（20%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（52） |  |
| 68 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（17%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（46）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 69 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s19_shishe` 上一场走完直接进（61）；`ch03_s18_yuanye` 上一场走完直接进（57）；`ch03_s21_nvguan` 上一场走完直接进（52）；`ch03_s20_yuanye` 上一场走完直接进（48）；`ch03_s17_shuge` 上一场走完直接进（46） |  |
| 70 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（264） |  |
| 71 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（264） |  |
| 72 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（264） |  |
| 73 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 A「写下天」（99）；`ch04_s01_zhaoyang` 选 C「仍用添」（84）；`ch04_s01_zhaoyang` 选 B「写下曌」（81） |  |
| 74 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s02_hanyuan` 选 B「议录只留我答的，反对原话另存」（264）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 75 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」（264）<br/>进入条件：flag.enthroned |  |
| 76 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 5 次都经过它） | `ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」（149）；`ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」（115）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（264） |  |
| 78 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 G「独自过一阵」（75）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（55）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（46）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（43）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（41）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（4） |  |
| 79 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（2%） | `ch04_s05pe_shuge` 换场（4） |  |
| 80 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（260）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（65）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（45）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（38）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（4） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（17%） | `ch04_s05c_shuge` 换场（45） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（65） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（14%） | `ch04_s05c_shuge` 换场（38） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（264）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（31）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（28）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（25）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（23）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（20）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（18）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（4）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（1）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（1） |  |
| 85 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（22%） | `ch04_s05q_shuge` 换场（60） |  |
| 86 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（42） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（49） |  |
| 88 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（264） |  |
| 89 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 2 次都经过它） | `ch04_s05r_shuge` 换场（264）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 90 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s05z_yeting` 选 B「收好今日的交付凭」（264）<br/>进入条件：flag.enthroned |  |
| 91 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 2 次都经过它） | `ch04_s06_zhaoyang` 上一场走完直接进（264）<br/>进入条件：flag.enthroned |  |
| 92 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 B「只许在位者荐人」（264） |  |
| 93 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 B「收好今次交付的回凭」（264） |  |

## 2. 无字之碑（`wuzibei`）

判定：flag.enthroned 且 flag.public_review 且 flag.ch04_nomination_open。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 1 个结局都不成立。

走到这里的路 273 条，不同的场次序列 250 种，每条 73—82 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「减为两处，付足钱并办好代送」 写成真）（161 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代送并查卷，下月经费待补」 写成真）（60 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「先保经费，留人查卷，代送缓办」 写成真）（52 条）
- `public_review` 要真：
  - `ch04_s05z_yeting` 选 A「收好今日的交付凭」 写成真 ← 这一项要 `ch04_dissent_retained` 来自 `ch04_s03_shuge` 选 A「保存原件，按准许的范围查阅」 写成真（它又要 `ch04_dissent_keep_order` 来自 `ch04_s02_hanyuan` 选 A「把反对原话与我的答复一起存」 写成真）；还要 `ch04_originals_retained` 来自 `ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」 写成真（它又要 `ch04_originals_keep_order` 来自 `ch04_s03_shuge` 选 A「保存原件，按准许的范围查阅」 写成真）（141 条）
  - `ch04_s05z_yeting` 选 A「收好今日的交付凭」 写成真 ← 这一项要 `ch04_dissent_retained` 来自 `ch04_s03_shuge` 选 A「保存原件，按准许的范围查阅」 写成真（它又要 `ch04_dissent_keep_order` 来自 `ch04_s02_hanyuan` 选 A「把反对原话与我的答复一起存」 写成真）；还要 `ch04_originals_retained` 来自 `ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」 写成真（它又要 `ch04_originals_keep_order` 来自 `ch04_s03_shuge` 选 A「保存原件，按准许的范围查阅」 写成真）（132 条）
- `ch04_nomination_open` 要真：
  - `ch04_s17_nvguan` 选 A「收好今次交付的回凭」 写成真 ← 这一项要 `ch04_nomination_open_order` 来自 `ch04_s07_hanyuan` 选 A「许多处荐人，并收反对的话」 写成真（273 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（273） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（273） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（273） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（273） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（144）；`ch01_s02_zhaoyang` 选 B「逐张补明改处，我签名备查」（129） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（273） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（140）；`ch01_s04_shuge` 对诗输（133） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（273） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先领布，我记下缺线再追领」（156）；`ch01_s06_yeting` 选 B「等布线齐了，我留下补抄」（117） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「陪你逐项查清，再问归期」（137）；`ch01_s07_yuanye` 选 A「陪你催欠钱，不替你许归期」（136） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（138）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（135） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（137）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（136） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（273） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（152）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（121） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（15%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（41）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（22%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（61）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（43%） | `ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（59）；`ch01_s12_shuge` 选 C「去听温荞说纸声」（58） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（20%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（54）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（117）；`ch01_s14_yuanye` 上一场走完直接进（61）；`ch01_s16_yuanye` 上一场走完直接进（54）；`ch01_s13_shuge` 上一场走完直接进（41）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「先追呈文，请宋才人陪你」（141）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（132）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（273） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（273） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再查，给她留半日」（143）；`ch02_s02_yeting` 选 A「现在逐项查清，请门外的人散去」（130） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（273） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（81）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（68）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（62）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（62） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（273） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余下三件另催」（139）；`ch02_s06_yeting` 选 A「先垫修栏的钱，今日付清」（134） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 A「我查欠了什么，你去问她」（113）；`ch02_s07_yuanye` 选 B「我查行程，你列齐粮数」（86）；`ch02_s07_yuanye` 选 C「这回不接，请另找人查」（74） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 A「连往返按半日给俸」（144）；`ch02_s08_shuge` 选 B「按次给俸，往返另记」（129） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（93）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（91）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（89） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（273） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 A「先收住议抄，再查原封」（146）；`ch02_s11_hanyuan` 选 B「先查原封，再收住议抄」（127） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（273） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「整封限人查阅，另抄公务部分」（148）；`ch02_s13_hanyuan` 选 B「核存公务部分，把私信退还」（125） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（19%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（52）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（19%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（53）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（12%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（33）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（70）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（24%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（65） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（70）；`ch02_s19_nvguan` 上一场走完直接进（65）；`ch02_s16_yuanye` 上一场走完直接进（53）；`ch02_s15_shuge` 上一场走完直接进（52）；`ch02_s17_shishe` 上一场走完直接进（33） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「限期自行答问，列清路费与日期」（141）；`ch02_s20_hanyuan` 选 A「三处联署，列清避嫌与申辩办法」（132） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（273） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（139）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（134） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（142）；`ch02_s22_shuge` 选 A「我在门边等你」（131） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文书，准备逐项比较」（273） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（273） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 B「今夜想独处，改日再问」（104）；`ch02_s24_shuge` 选 C「我只约你明日论议」（98）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（71） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「反对的话和我的说明一起送查」（157）；`ch03_s01_shuge` 选 B「先补证再公开，错过本轮查证」（116） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（150）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（123） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（142）；`ch03_s03_yeting` 选 B「请另两人代班，我付钱并交班」（131） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（137）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（136） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（144）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（129） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她做的事，我只署总管」（149）；`ch03_s06_shuge` 选 A「简录只列我，底簿留她的名」（124） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（273） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「减为两处，付足钱并办好代送」（161）；`ch03_s08_hanyuan` 选 C「先办代送并查卷，下月经费待补」（60）；`ch03_s08_hanyuan` 选 B「先保经费，留人查卷，代送缓办」（52） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（0%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（1）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（3）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（3）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（120）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（113）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（17）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（12）；`ch03_s09c_yuanye` 上一场走完直接进（3）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（3）；`ch03_s09b_yuanye` 上一场走完直接进（3）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（1）；`ch03_s09a_yuanye` 上一场走完直接进（1） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（273） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（273） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（273） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（273） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「签明交清，带走柳的凭据」（273） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（273） |  |
| 65 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（16%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（44）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 66 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（25%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（68）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 67 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（22%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（61）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 68 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（19%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（52）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 69 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（18%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（48） |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s18_yuanye` 上一场走完直接进（68）；`ch03_s20_yuanye` 上一场走完直接进（61）；`ch03_s19_shishe` 上一场走完直接进（52）；`ch03_s21_nvguan` 上一场走完直接进（48）；`ch03_s17_shuge` 上一场走完直接进（44） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（273） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（273） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（273） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 B「写下曌」（98）；`ch04_s01_zhaoyang` 选 C「仍用添」（91）；`ch04_s01_zhaoyang` 选 A「写下天」（84） |  |
| 75 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s02_hanyuan` 选 A「把反对原话与我的答复一起存」（273）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 76 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s03_shuge` 选 A「保存原件，按准许的范围查阅」（273）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」（141）；`ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」（132）<br/>进入条件：flag.enthroned |  |
| 78 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（273） |  |
| 79 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（54）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（52）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（45）；`ch04_s05p_shuge` 选 G「独自过一阵」（44）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（37）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（29）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（12） |  |
| 80 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（12） |  |
| 81 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（261）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（69）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（66）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（53）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（35）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（12） |  |
| 82 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（24%） | `ch04_s05c_shuge` 换场（66） |  |
| 83 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（19%） | `ch04_s05c_shuge` 换场（53） |  |
| 84 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（25%） | `ch04_s05c_shuge` 换场（69） |  |
| 85 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（13%） | `ch04_s05c_shuge` 换场（35） |  |
| 86 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（273）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（29）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（28）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（24）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（22）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（21）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（20）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（17）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（12）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（5）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（5）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（3）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（2） |  |
| 87 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（42） |  |
| 88 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（21%） | `ch04_s05q_shuge` 换场（59） |  |
| 89 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（48） |  |
| 90 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（14%） | `ch04_s05q_shuge` 换场（39） |  |
| 91 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（273） |  |
| 92 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s05r_shuge` 换场（273）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 93 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 3 次都经过它） | `ch04_s05z_yeting` 选 A「收好今日的交付凭」（273）<br/>进入条件：flag.enthroned |  |
| 94 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 4 次都经过它） | `ch04_s06_zhaoyang` 上一场走完直接进（273）<br/>进入条件：flag.enthroned |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 A「许多处荐人，并收反对的话」（273） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 A「收好今次交付的回凭」（273） |  |

## 3. 未竟之诏（`weijingzhizhao`）

判定：flag.enthroned。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 2 个结局都不成立。

走到这里的路 1581 条，不同的场次序列 1109 种，每条 73—83 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `enthroned` 要真：
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「减为两处，付足钱并办好代送」 写成真）（935 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代送并查卷，下月经费待补」 写成真）（330 条）
  - `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」 写成真 ← 这一项要 `ch03_accept_offer` 来自 `ch03_s11_hanyuan` 选 A「我受这一席」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「先保经费，留人查卷，代送缓办」 写成真）（316 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 ch04_originals_destroyed、ch04_nomination_closed（291）；缺 ch04_originals_destroyed（267）；缺 ch04_dissent_removed、ch04_nomination_closed（260）；缺 ch04_nomination_closed（259）；缺 ch04_dissent_removed、ch04_originals_destroyed（257）；缺 ch04_dissent_removed（247） |
| 无字之碑 | 缺 public_review（810）；缺 public_review、ch04_nomination_open（514）；缺 ch04_nomination_open（257） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（1581） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（1581） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（1581） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（801）；`ch01_s02_zhaoyang` 选 B「逐张补明改处，我签名备查」（780） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（1581） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（791）；`ch01_s04_shuge` 对诗输（790） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（1581） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等布线齐了，我留下补抄」（794）；`ch01_s06_yeting` 选 A「先领布，我记下缺线再追领」（787） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「陪你逐项查清，再问归期」（815）；`ch01_s07_yuanye` 选 A「陪你催欠钱，不替你许归期」（766） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 A「先收六份，满额便明示」（810）；`ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（771） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（795）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（786） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（1581） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（835）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（746） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（229）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（21%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（332）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（42%） | `ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（337）；`ch01_s12_shuge` 选 C「去听温荞说纸声」（332） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（22%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（351）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（669）；`ch01_s16_yuanye` 上一场走完直接进（351）；`ch01_s14_yuanye` 上一场走完直接进（332）；`ch01_s13_shuge` 上一场走完直接进（229）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「先追呈文，请宋才人陪你」（793）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（788）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（1581） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（1581） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项查清，请门外的人散去」（805）；`ch02_s02_yeting` 选 B「午后再查，给她留半日」（776） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（1581） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 A「一起读。读完也想见你」（407）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（398）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（390）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（386） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（1581） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余下三件另催」（808）；`ch02_s06_yeting` 选 A「先垫修栏的钱，今日付清」（773） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「这回不接，请另找人查」（534）；`ch02_s07_yuanye` 选 B「我查行程，你列齐粮数」（532）；`ch02_s07_yuanye` 选 A「我查欠了什么，你去问她」（515） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（814）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（767） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（544）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（521）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（516） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（1581） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先查原封，再收住议抄」（811）；`ch02_s11_hanyuan` 选 A「先收住议抄，再查原封」（770） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（1581） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「整封限人查阅，另抄公务部分」（801）；`ch02_s13_hanyuan` 选 B「核存公务部分，把私信退还」（780） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（18%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（285）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（272）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（14%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（229）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（24%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（382）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（413） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s19_nvguan` 上一场走完直接进（413）；`ch02_s18_yuanye` 上一场走完直接进（382）；`ch02_s15_shuge` 上一场走完直接进（285）；`ch02_s16_yuanye` 上一场走完直接进（272）；`ch02_s17_shishe` 上一场走完直接进（229） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「限期自行答问，列清路费与日期」（804）；`ch02_s20_hanyuan` 选 A「三处联署，列清避嫌与申辩办法」（777） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（1581） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（807）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（774） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（817）；`ch02_s22_shuge` 选 A「我在门边等你」（764） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文书，准备逐项比较」（1581） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（1581） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（535）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（524）；`ch02_s24_shuge` 选 C「我只约你明日论议」（522） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「反对的话和我的说明一起送查」（949）；`ch03_s01_shuge` 选 B「先补证再公开，错过本轮查证」（632） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（804）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（777） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（794）；`ch03_s03_yeting` 选 B「请另两人代班，我付钱并交班」（787） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（792）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（789） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（818）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（763） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「简录只列我，底簿留她的名」（812）；`ch03_s06_shuge` 选 B「并列她做的事，我只署总管」（769） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（1581） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「减为两处，付足钱并办好代送」（935）；`ch03_s08_hanyuan` 选 C「先办代送并查卷，下月经费待补」（330）；`ch03_s08_hanyuan` 选 B「先保经费，留人查卷，代送缓办」（316） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（23）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（16）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（2%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（31）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（687）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（667）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（69）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（58）；`ch03_s09c_yuanye` 上一场走完直接进（31）；`ch03_s09a_yuanye` 上一场走完直接进（23）；`ch03_s09b_yuanye` 上一场走完直接进（16）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（16）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（14） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（1581） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 A「我受这一席」（1581） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 A「收下新卷，去交清旧差」（1581） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（1581） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「签明交清，带走柳的凭据」（1581） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（1581） |  |
| 65 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（19%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（301）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 66 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（21%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（338）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 67 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（20%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（321）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 68 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（18%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（292）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 69 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（21%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（329） |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s20_yuanye` 上一场走完直接进（338）；`ch03_s21_nvguan` 上一场走完直接进（329）；`ch03_s19_shishe` 上一场走完直接进（321）；`ch03_s18_yuanye` 上一场走完直接进（301）；`ch03_s17_shuge` 上一场走完直接进（292） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（1581） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（1581） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（1581） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 B「写下曌」（556）；`ch04_s01_zhaoyang` 选 A「写下天」（522）；`ch04_s01_zhaoyang` 选 C「仍用添」（503） |  |
| 75 | `ch04_s03_shuge` | 原页不能再生 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 18 次都经过它） | `ch04_s02_hanyuan` 选 B「议录只留我答的，反对原话另存」（817）；`ch04_s02_hanyuan` 选 A「把反对原话与我的答复一起存」（764）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s08_shuge`（要 非 flag.enthroned） |  |
| 76 | `ch04_s04_zhaoyang` | 谁能签两个人 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 16 次都经过它） | `ch04_s03_shuge` 选 C「保存原件，按准许的范围查阅」（558）；`ch04_s03_shuge` 选 B「确认焚毁原案，不可恢复」（507）；`ch04_s03_shuge` 选 D「确认焚毁原案，不可恢复」（259）；`ch04_s03_shuge` 选 A「保存原件，按准许的范围查阅」（257）<br/>进入条件：flag.enthroned |  |
| 77 | `ch04_s05_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 16 次都经过它） | `ch04_s04_zhaoyang` 选 B「颁行个人分别授权的办法」（420）；`ch04_s04_zhaoyang` 选 A「颁行双方自愿入籍的办法」（395）；`ch04_s04_zhaoyang` 选 D「颁行个人分别授权的办法」（392）；`ch04_s04_zhaoyang` 选 C「颁行双方自愿入籍的办法」（374）<br/>进入条件：flag.enthroned |  |
| 78 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s05_yeting` 上一场走完直接进（1581） |  |
| 79 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 G「独自过一阵」（330）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（292）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（272）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（262）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（230）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（138）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（57） |  |
| 80 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（57） |  |
| 81 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1524）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（426）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（330）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（220）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（202）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（57） |  |
| 82 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（13%） | `ch04_s05c_shuge` 换场（202） |  |
| 83 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（330） |  |
| 84 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（27%） | `ch04_s05c_shuge` 换场（426） |  |
| 85 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（14%） | `ch04_s05c_shuge` 换场（220） |  |
| 86 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（1581）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（147）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（139）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（137）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（136）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（125）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（108）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（73）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（65）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（18）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（15）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（8）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（6） |  |
| 87 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（293） |  |
| 88 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（16%） | `ch04_s05q_shuge` 换场（253） |  |
| 89 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（9%） | `ch04_s05q_shuge` 换场（144） |  |
| 90 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（287） |  |
| 91 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（1581） |  |
| 92 | `ch04_s05z_yeting` | 钱到了谁手里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 19 次都经过它） | `ch04_s05r_shuge` 换场（1581）<br/>进入条件：flag.enthroned<br/>上一场的另一条去向：`ch04_s05rl_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 93 | `ch04_s06_zhaoyang` | 灯油添到这里 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 14 次都经过它） | `ch04_s05z_yeting` 选 B「收好今日的交付凭」（817）；`ch04_s05z_yeting` 选 C「收好今日的交付凭」（507）；`ch04_s05z_yeting` 选 A「收好今日的交付凭」（257）<br/>进入条件：flag.enthroned |  |
| 94 | `ch04_s07_hanyuan` | 下一份荐名 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 11 次都经过它） | `ch04_s06_zhaoyang` 上一场走完直接进（1581）<br/>进入条件：flag.enthroned |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s07_hanyuan` 选 A「许多处荐人，并收反对的话」（810）；`ch04_s07_hanyuan` 选 B「只许在位者荐人」（771） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 A「收好今次交付的回凭」（810）；`ch04_s17_nvguan` 选 B「收好今次交付的回凭」（771） |  |

## 4. 两席之间（`liangxizhijian`）

判定：flag.liqinghe_won 且 flag.liqinghe_together 且 非 flag.enthroned 且 非 flag.declined_crown 且 非 flag.founded_school 且 非 flag.road_agreement。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 3 个结局都不成立。

走到这里的路 87 条，不同的场次序列 85 种，每条 74—80 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `liqinghe_won` 要真：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成真 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「六处提案不撤，先交已有凭据」 写成假）（87 条）
- `liqinghe_together` 要真：
  - `ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」 写成真（39 条）
  - `ch04_s09_yuanye` 选 A「先留京，再约时辰」 写成真（24 条）
  - `ch04_s09_yuanye` 选 C「行路的事仍要去问」 写成真（13 条）
  - `ch04_s09_yuanye` 选 B「办学的事仍要去问」 写成真（11 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「六处提案不撤，先交已有凭据」 写成假）（87 条）
- `declined_crown` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「六处提案不撤，先交已有凭据」 写成假）（87 条）
- `founded_school` 要假：
  - 从没被写过，保持初始的假（87 条）
- `road_agreement` 要假：
  - 从没被写过，保持初始的假（87 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（87） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（87） |
| 未竟之诏 | 缺 enthroned（87） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（87） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（87） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（87） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张补明改处，我签名备查」（46）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（41） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（87） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（50）；`ch01_s04_shuge` 对诗输（37） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（87） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等布线齐了，我留下补抄」（49）；`ch01_s06_yeting` 选 A「先领布，我记下缺线再追领」（38） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 B「陪你逐项查清，再问归期」（46）；`ch01_s07_yuanye` 选 A「陪你催欠钱，不替你许归期」（41） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（54）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（33） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（45）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（42） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（87） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（47）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（40） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（17%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（15）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（23%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（20）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（36%） | `ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（17）；`ch01_s12_shuge` 选 C「去听温荞说纸声」（14） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（24%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（21）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（31）；`ch01_s16_yuanye` 上一场走完直接进（21）；`ch01_s14_yuanye` 上一场走完直接进（20）；`ch01_s13_shuge` 上一场走完直接进（15）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（49）；`ch01_s17_yeting` 选 A「先追呈文，请宋才人陪你」（38）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（87） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（87） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项查清，请门外的人散去」（46）；`ch02_s02_yeting` 选 B「午后再查，给她留半日」（41） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（87） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（24）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（24）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（22）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（17） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（87） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「先垫修栏的钱，今日付清」（46）；`ch02_s06_yeting` 选 B「先付六件，余下三件另催」（41） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「这回不接，请另找人查」（35）；`ch02_s07_yuanye` 选 B「我查行程，你列齐粮数」（27）；`ch02_s07_yuanye` 选 A「我查欠了什么，你去问她」（25） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（46）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（41） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（29）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（29）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（29） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（87） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先查原封，再收住议抄」（48）；`ch02_s11_hanyuan` 选 A「先收住议抄，再查原封」（39） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（87） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「整封限人查阅，另抄公务部分」（48）；`ch02_s13_hanyuan` 选 B「核存公务部分，把私信退还」（39） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（18%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（16）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（8%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（7）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（20%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（17）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（24%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（21）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（30%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（26） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s19_nvguan` 上一场走完直接进（26）；`ch02_s18_yuanye` 上一场走完直接进（21）；`ch02_s17_shishe` 上一场走完直接进（17）；`ch02_s15_shuge` 上一场走完直接进（16）；`ch02_s16_yuanye` 上一场走完直接进（7） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「限期自行答问，列清路费与日期」（48）；`ch02_s20_hanyuan` 选 A「三处联署，列清避嫌与申辩办法」（39） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（87） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（45）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（42） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 A「我在门边等你」（44）；`ch02_s22_shuge` 选 B「今日先走，你慢慢收」（43） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文书，准备逐项比较」（87） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（87） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（36）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（35）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（16） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「先补证再公开，错过本轮查证」（57）；`ch03_s01_shuge` 选 A「反对的话和我的说明一起送查」（30） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（44）；`ch03_s02_shuge` 选 B「今日先走，异议照留」（43） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「请另两人代班，我付钱并交班」（55）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（32） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（45）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（42） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（45）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（42） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「简录只列我，底簿留她的名」（52）；`ch03_s06_shuge` 选 B「并列她做的事，我只署总管」（35） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（87） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「六处提案不撤，先交已有凭据」（87） |  |
| 55 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（3%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（3）<br/>进入条件：flag.li_ch03_multi_told |  |
| 56 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（1）<br/>进入条件：flag.li_ch03_private_paused |  |
| 57 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 D「一起走。明日照实争」（36）；`ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（24）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（12）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（8）；`ch03_s09b_yuanye` 上一场走完直接进（3）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（3）；`ch03_s09c_yuanye` 上一场走完直接进（1） |  |
| 58 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（87） |  |
| 59 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（87） |  |
| 60 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（87） |  |
| 61 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（87） |  |
| 62 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「签明交清，带走柳的凭据」（87） |  |
| 63 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（87） |  |
| 64 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（17%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（15）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 65 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（9%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（8）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 66 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（14%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（12）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 67 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（15%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（13）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 68 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（45%） | `ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（16）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（14）；`ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（9） |  |
| 69 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（39）；`ch03_s17_shuge` 上一场走完直接进（15）；`ch03_s19_shishe` 上一场走完直接进（13）；`ch03_s20_yuanye` 上一场走完直接进（12）；`ch03_s18_yuanye` 上一场走完直接进（8） |  |
| 70 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（87） |  |
| 71 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（87） |  |
| 72 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（87） |  |
| 73 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（87） |  |
| 74 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s02_hanyuan` 选 C「交自己的意见，取一份留存」（87）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 75 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（87） |  |
| 76 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（87） |  |
| 77 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（87）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（29）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（24）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（24） |  |
| 78 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（28%） | `ch04_s05c_shuge` 换场（24） |  |
| 79 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（33%） | `ch04_s05c_shuge` 换场（29） |  |
| 80 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（28%） | `ch04_s05c_shuge` 换场（24） |  |
| 81 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（87）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（87） |  |
| 82 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s05q_shuge` 换场（87）<br/>上一场的另一条去向：`ch04_s05qa_shuge`（无进入条件，但本线的选项没有走向它）、`ch04_s05qb_yuanye`（无进入条件，但本线的选项没有走向它）、`ch04_s05qc_shishe`（无进入条件，但本线的选项没有走向它）、`ch04_s05r_shuge`（无进入条件，但本线的选项没有走向它） |  |
| 83 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（87） |  |
| 84 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s05r_shuge` 换场（87）<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned）、`ch04_s08z_shuge`（要 非 flag.enthroned） |  |
| 85 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 1 次都经过它） | `ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（87）<br/>进入条件：非 flag.enthroned |  |
| 86 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（55%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（48）<br/>进入条件：flag.liqinghe_won |  |
| 87 | `ch04_s14_shuge` | 归期写在前面 | 选出来的（34%） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（17）；`ch04_s09_yuanye` 选 C「行路的事仍要去问」（13）<br/>进入条件：flag.liqinghe_won |  |
| 88 | `ch04_s11_nvguan` | 三日以后谁付 | 选出来的（38%） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（22）；`ch04_s09_yuanye` 选 B「办学的事仍要去问」（11）<br/>进入条件：flag.liqinghe_won |  |
| 89 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s11_nvguan` 选 B「这回先不接」（33）；`ch04_s14_shuge` 选 B「这回不接，归期的纸我留着」（30）；`ch04_s09_yuanye` 选 A「先留京，再约时辰」（24）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s12_nvguan`（要 flag.ch04_school_contract）、`ch04_s14_shuge`（要 flag.liqinghe_won）、`ch04_s15_yilu`（要 flag.ch04_road_contract） |  |
| 90 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（87） |  |
| 91 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（87） |  |

## 5. 开门授字（`kaimenshouzi`）

判定：flag.founded_school 且 非 flag.enthroned 且 非 flag.declined_crown。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 4 个结局都不成立。

走到这里的路 623 条，不同的场次序列 557 种，每条 72—87 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `founded_school` 要真：
  - `ch04_s12_nvguan` 选 A「收好今日的课页」 写成真（623 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「六处提案不撤，先交已有凭据」 写成假）（623 条）
- `declined_crown` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「六处提案不撤，先交已有凭据」 写成假）（623 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（623） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（623） |
| 未竟之诏 | 缺 enthroned（623） |
| 两席之间 | 缺 liqinghe_together、非 founded_school（584）；缺 非 founded_school（39） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（623） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（623） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（623） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张补明改处，我签名备查」（327）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（296） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（623） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗赢（313）；`ch01_s04_shuge` 对诗输（310） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（623） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先领布，我记下缺线再追领」（320）；`ch01_s06_yeting` 选 B「等布线齐了，我留下补抄」（303） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「陪你催欠钱，不替你许归期」（323）；`ch01_s07_yuanye` 选 B「陪你逐项查清，再问归期」（300） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（313）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（310） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（315）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（308） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（623） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（319）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（304） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（88）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（21%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（130）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（47%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（153）；`ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（140） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（18%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（112）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（293）；`ch01_s14_yuanye` 上一场走完直接进（130）；`ch01_s16_yuanye` 上一场走完直接进（112）；`ch01_s13_shuge` 上一场走完直接进（88）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 A「先追呈文，请宋才人陪你」（321）；`ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（302）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（623） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（623） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项查清，请门外的人散去」（319）；`ch02_s02_yeting` 选 B「午后再查，给她留半日」（304） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（623） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 D「这次陪读我也接不下」（163）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（160）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（150）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（150） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（623） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「先垫修栏的钱，今日付清」（342）；`ch02_s06_yeting` 选 B「先付六件，余下三件另催」（281） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「这回不接，请另找人查」（214）；`ch02_s07_yuanye` 选 A「我查欠了什么，你去问她」（211）；`ch02_s07_yuanye` 选 B「我查行程，你列齐粮数」（198） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 A「连往返按半日给俸」（317）；`ch02_s08_shuge` 选 B「按次给俸，往返另记」（306） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（225）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（208）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（190） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（623） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先查原封，再收住议抄」（335）；`ch02_s11_hanyuan` 选 A「先收住议抄，再查原封」（288） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（623） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「整封限人查阅，另抄公务部分」（315）；`ch02_s13_hanyuan` 选 B「核存公务部分，把私信退还」（308） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（18%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（110）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（92）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（93）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（27%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（171）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（157） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（171）；`ch02_s19_nvguan` 上一场走完直接进（157）；`ch02_s15_shuge` 上一场走完直接进（110）；`ch02_s17_shishe` 上一场走完直接进（93）；`ch02_s16_yuanye` 上一场走完直接进（92） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 A「三处联署，列清避嫌与申辩办法」（314）；`ch02_s20_hanyuan` 选 B「限期自行答问，列清路费与日期」（309） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（623） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（326）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（297） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（312）；`ch02_s22_shuge` 选 A「我在门边等你」（311） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文书，准备逐项比较」（623） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（623） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（217）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（206）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（200） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「先补证再公开，错过本轮查证」（414）；`ch03_s01_shuge` 选 A「反对的话和我的说明一起送查」（209） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（317）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（306） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「请另两人代班，我付钱并交班」（322）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（301） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（315）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（308） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（312）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（311） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她做的事，我只署总管」（317）；`ch03_s06_shuge` 选 A「简录只列我，底簿留她的名」（306） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（623） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「六处提案不撤，先交已有凭据」（623） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（5）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（7）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（2%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（12）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（274）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（260）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（28）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（26）；`ch03_s09c_yuanye` 上一场走完直接进（12）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（9）；`ch03_s09b_yuanye` 上一场走完直接进（7）；`ch03_s09a_yuanye` 上一场走完直接进（5）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（2） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（623） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（623） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（623） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（623） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「签明交清，带走柳的凭据」（623） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（623） |  |
| 65 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（13%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（83）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 66 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（12%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（76）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 67 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（46%） | `ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（107）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（91）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（91） |  |
| 68 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（13%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（81）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 69 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（15%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（94）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（289）；`ch03_s20_yuanye` 上一场走完直接进（94）；`ch03_s19_shishe` 上一场走完直接进（83）；`ch03_s18_yuanye` 上一场走完直接进（81）；`ch03_s17_shuge` 上一场走完直接进（76） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（623） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（623） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（623） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（623） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 16 次都经过它） | `ch04_s02_hanyuan` 选 C「交自己的意见，取一份留存」（623）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（623） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（114）；`ch04_s05p_shuge` 选 G「独自过一阵」（106）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（101）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（100）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（94）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（82）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（26） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（26） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（597）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（176）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（168）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（128）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（86）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（26） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（28%） | `ch04_s05c_shuge` 换场（176） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（21%） | `ch04_s05c_shuge` 换场（128） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（27%） | `ch04_s05c_shuge` 换场（168） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（14%） | `ch04_s05c_shuge` 换场（86） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（623）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（63）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（57）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（54）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（49）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（46）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（43）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（39）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（31）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（9）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（9）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（6）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（3） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（17%） | `ch04_s05q_shuge` 换场（103） |  |
| 86 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（17%） | `ch04_s05q_shuge` 换场（109） |  |
| 87 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（17%） | `ch04_s05q_shuge` 换场（109） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（14%） | `ch04_s05q_shuge` 换场（88） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（623） |  |
| 90 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 选出来的（6%） | `ch04_s05r_shuge` 换场（39） |  |
| 91 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 15 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（584）；`ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（39）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 92 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（38%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（235）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s11_nvguan` | 三日以后谁付 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（388）；`ch04_s09_yuanye` 选 E「今后只谈公事，我去问办学」（225）；`ch04_s09_yuanye` 选 B「办学的事仍要去问」（10）<br/>进入条件：flag.liqinghe_won<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s14_shuge`（要 flag.liqinghe_won） |  |
| 94 | `ch04_s12_nvguan` | 半日也算来过 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s11_nvguan` 选 A「按这一月的约定办」（623）<br/>进入条件：flag.ch04_school_contract<br/>上一场的另一条去向：`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s11_nvguan`（要 flag.liqinghe_won） | ✓ |
| 95 | `ch04_s13_nvguan` | 她们收自己的席 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s12_nvguan` 选 A「收好今日的课页」（623）<br/>进入条件：flag.founded_school | ✓ |
| 96 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s13_nvguan` 上一场走完直接进（623） |  |
| 97 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（623） |  |

## 6. 不受（`bushou`）

判定：flag.declined_crown 且 非 flag.enthroned。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 5 个结局都不成立。

走到这里的路 2040 条，不同的场次序列 1310 种，每条 70—83 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `declined_crown` 要真：
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「减为两处，付足钱并办好代送」 写成真）（1230 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代送并查卷，下月经费待补」 写成真）（406 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成真 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「先保经费，留人查卷，代送缓办」 写成真）（404 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 A「减为两处，付足钱并办好代送」 写成真）（1230 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 C「先办代送并查卷，下月经费待补」 写成真）（406 条）
  - `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」 写成假 ← 这一项要 `ch03_decline_offer` 来自 `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 B「先保经费，留人查卷，代送缓办」 写成真）（404 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（2040） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（2040） |
| 未竟之诏 | 缺 enthroned（2040） |
| 两席之间 | 缺 liqinghe_won、liqinghe_together、非 declined_crown（2040） |
| 开门授字 | 缺 founded_school、非 declined_crown（2040） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（2040） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（2040） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（2040） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张补明改处，我签名备查」（1033）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（1007） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（2040） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（1038）；`ch01_s04_shuge` 对诗赢（1002） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（2040） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先领布，我记下缺线再追领」（1037）；`ch01_s06_yeting` 选 B「等布线齐了，我留下补抄」（1003） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「陪你催欠钱，不替你许归期」（1038）；`ch01_s07_yuanye` 选 B「陪你逐项查清，再问归期」（1002） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（1061）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（979） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（1057）；`ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（983） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（2040） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（1029）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（1011） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（13%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（257）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（21%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（438）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（44%） | `ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（451）；`ch01_s12_shuge` 选 C「去听温荞说纸声」（438） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（22%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（456）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（889）；`ch01_s16_yuanye` 上一场走完直接进（456）；`ch01_s14_yuanye` 上一场走完直接进（438）；`ch01_s13_shuge` 上一场走完直接进（257）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（1029）；`ch01_s17_yeting` 选 A「先追呈文，请宋才人陪你」（1011）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（2040） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（2040） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再查，给她留半日」（1037）；`ch02_s02_yeting` 选 A「现在逐项查清，请门外的人散去」（1003） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（2040） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 A「一起读。读完也想见你」（532）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（529）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（490）；`ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（489） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（2040） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余下三件另催」（1063）；`ch02_s06_yeting` 选 A「先垫修栏的钱，今日付清」（977） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「这回不接，请另找人查」（693）；`ch02_s07_yuanye` 选 A「我查欠了什么，你去问她」（692）；`ch02_s07_yuanye` 选 B「我查行程，你列齐粮数」（655） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（1032）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（1008） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 B「我先听完，再逐句说」（710）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（675）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（655） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（2040） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 A「先收住议抄，再查原封」（1028）；`ch02_s11_hanyuan` 选 B「先查原封，再收住议抄」（1012） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（2040） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「核存公务部分，把私信退还」（1057）；`ch02_s13_hanyuan` 选 A「整封限人查阅，另抄公务部分」（983） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（17%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（347）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（310）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（314）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（27%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（549）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（520） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（549）；`ch02_s19_nvguan` 上一场走完直接进（520）；`ch02_s15_shuge` 上一场走完直接进（347）；`ch02_s17_shishe` 上一场走完直接进（314）；`ch02_s16_yuanye` 上一场走完直接进（310） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 B「限期自行答问，列清路费与日期」（1030）；`ch02_s20_hanyuan` 选 A「三处联署，列清避嫌与申辩办法」（1010） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（2040） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（1029）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（1011） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 A「我在门边等你」（1023）；`ch02_s22_shuge` 选 B「今日先走，你慢慢收」（1017） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文书，准备逐项比较」（2040） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（2040） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（713）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（668）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（659） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 A「反对的话和我的说明一起送查」（1226）；`ch03_s01_shuge` 选 B「先补证再公开，错过本轮查证」（814） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（1080）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（960） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（1061）；`ch03_s03_yeting` 选 B「请另两人代班，我付钱并交班」（979） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（1026）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（1014） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（1029）；`ch03_s05_shishe` 选 B「稿照实付，合唱另约」（1011） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 A「简录只列我，底簿留她的名」（1022）；`ch03_s06_shuge` 选 B「并列她做的事，我只署总管」（1018） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（2040） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 A「减为两处，付足钱并办好代送」（1230）；`ch03_s08_hanyuan` 选 C「先办代送并查卷，下月经费待补」（406）；`ch03_s08_hanyuan` 选 B「先保经费，留人查卷，代送缓办」（404） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（19）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（27）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（24）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（884）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（871）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（97）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（83）；`ch03_s09b_yuanye` 上一场走完直接进（27）；`ch03_s09c_yuanye` 上一场走完直接进（24）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（21）；`ch03_s09a_yuanye` 上一场走完直接进（19）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（14） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（2040） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 B「我不受，请依原议重推」（2040） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 B「辞受已办，去交清余项」（2040） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（2040） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「签明交清，带走柳的凭据」（2040） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（2040） |  |
| 65 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（15%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（305）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 66 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（12%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（245）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 67 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（13%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（270）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 68 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（44%） | `ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（310）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（296）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（293） |  |
| 69 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（16%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（321）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（899）；`ch03_s20_yuanye` 上一场走完直接进（321）；`ch03_s18_yuanye` 上一场走完直接进（305）；`ch03_s19_shishe` 上一场走完直接进（270）；`ch03_s17_shuge` 上一场走完直接进（245） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（2040） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（2040） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（2040） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 D「领回自己的东西」（2040） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 22 次都经过它） | `ch04_s02_hanyuan` 选 C「交自己的意见，取一份留存」（2040）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（2040） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（406）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（348）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（319）；`ch04_s05p_shuge` 选 G「独自过一阵」（319）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（294）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（283）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（71） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（3%） | `ch04_s05pe_shuge` 换场（71） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1969）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（539）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（538）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（414）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（305）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（71） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（26%） | `ch04_s05c_shuge` 换场（538） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（20%） | `ch04_s05c_shuge` 换场（414） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（26%） | `ch04_s05c_shuge` 换场（539） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（15%） | `ch04_s05c_shuge` 换场（305） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（2040）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（186）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（186）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（162）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（156）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（155）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（153）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（139）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（139）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（26）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（21）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（17）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（12） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（374） |  |
| 86 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（307） |  |
| 87 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（17%） | `ch04_s05q_shuge` 换场（360） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（311） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（2040） |  |
| 90 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 19 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（2040）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 91 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 16 次都经过它） | `ch04_s08z_shuge` 选 A「今日不定去处，出去吃点东西」（2040）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s14_shuge`（要 flag.liqinghe_won） |  |
| 92 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（2040） |  |
| 93 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（2040） |  |

## 7. 关山有信（`guanshanyouxin`）

判定：flag.road_agreement 且 非 flag.enthroned 且 非 flag.declined_crown。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 6 个结局都不成立。

走到这里的路 638 条，不同的场次序列 572 种，每条 72—86 场。

### 判定用到的 flag 是在哪里写下的

每条先写最后一次把它写成这个值的选项；那个选项自己有进入条件的，← 后面接着写满足条件的那个更早的选项（最多追两步）。第四章的决定多是两步：先在一场里选意向，后一场只放行对应的选项，**真正做决定的是 ← 后面那一格**。

- `road_agreement` 要真：
  - `ch04_s15_yilu` 选 A「随车到第一处交接」 写成真（638 条）
- `enthroned` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「六处提案不撤，先交已有凭据」 写成假）（638 条）
- `declined_crown` 要假：
  - `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」 写成假 ← 这一项要 `ch03_offer_li` 来自 `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」 写成真（它又要 `ch03_evidence_majority` 来自 `ch03_s08_hanyuan` 选 D「六处提案不撤，先交已有凭据」 写成假）（638 条）

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（638） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（638） |
| 未竟之诏 | 缺 enthroned（638） |
| 两席之间 | 缺 liqinghe_together、非 road_agreement（598）；缺 非 road_agreement（40） |
| 开门授字 | 缺 founded_school（638） |
| 不受 | 缺 declined_crown（638） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（638） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（638） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（638） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（342）；`ch01_s02_zhaoyang` 选 B「逐张补明改处，我签名备查」（296） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（638） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（332）；`ch01_s04_shuge` 对诗赢（306） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（638） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 A「先领布，我记下缺线再追领」（327）；`ch01_s06_yeting` 选 B「等布线齐了，我留下补抄」（311） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「陪你催欠钱，不替你许归期」（325）；`ch01_s07_yuanye` 选 B「陪你逐项查清，再问归期」（313） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（345）；`ch01_s08_shuge` 选 A「先收六份，满额便明示」（293） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（332）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（306） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（638） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（329）；`ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（309） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（88）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（24%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（153）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（38%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（123）；`ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（122） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（24%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（152）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（245）；`ch01_s14_yuanye` 上一场走完直接进（153）；`ch01_s16_yuanye` 上一场走完直接进（152）；`ch01_s13_shuge` 上一场走完直接进（88）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（326）；`ch01_s17_yeting` 选 A「先追呈文，请宋才人陪你」（312）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（638） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（638） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 A「现在逐项查清，请门外的人散去」（328）；`ch02_s02_yeting` 选 B「午后再查，给她留半日」（310） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（638） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（167）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（161）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（155）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（155） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（638） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 A「先垫修栏的钱，今日付清」（330）；`ch02_s06_yeting` 选 B「先付六件，余下三件另催」（308） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 C「这回不接，请另找人查」（234）；`ch02_s07_yuanye` 选 B「我查行程，你列齐粮数」（203）；`ch02_s07_yuanye` 选 A「我查欠了什么，你去问她」（201） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 A「连往返按半日给俸」（319）；`ch02_s08_shuge` 选 B「按次给俸，往返另记」（319） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（224）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（212）；`ch02_s09_shishe` 选 C「这次我也没余力陪读」（202） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（638） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 B「先查原封，再收住议抄」（328）；`ch02_s11_hanyuan` 选 A「先收住议抄，再查原封」（310） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（638） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 B「核存公务部分，把私信退还」（331）；`ch02_s13_hanyuan` 选 A「整封限人查阅，另抄公务部分」（307） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（18%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（114）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（13%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（85）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（103）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（164）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（27%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（172） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s19_nvguan` 上一场走完直接进（172）；`ch02_s18_yuanye` 上一场走完直接进（164）；`ch02_s15_shuge` 上一场走完直接进（114）；`ch02_s17_shishe` 上一场走完直接进（103）；`ch02_s16_yuanye` 上一场走完直接进（85） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 A「三处联署，列清避嫌与申辩办法」（333）；`ch02_s20_hanyuan` 选 B「限期自行答问，列清路费与日期」（305） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（638） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（328）；`ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（310） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 A「我在门边等你」（331）；`ch02_s22_shuge` 选 B「今日先走，你慢慢收」（307） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文书，准备逐项比较」（638） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（638） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 B「今夜想独处，改日再问」（237）；`ch02_s24_shuge` 选 C「我只约你明日论议」（202）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（199） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「先补证再公开，错过本轮查证」（416）；`ch03_s01_shuge` 选 A「反对的话和我的说明一起送查」（222） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（328）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（310） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 B「请另两人代班，我付钱并交班」（322）；`ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（316） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（320）；`ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（318） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（324）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（314） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她做的事，我只署总管」（319）；`ch03_s06_shuge` 选 A「简录只列我，底簿留她的名」（319） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（638） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「六处提案不撤，先交已有凭据」（638） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（7）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（5）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（9）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（278）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（263）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（34）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（32）；`ch03_s09c_yuanye` 上一场走完直接进（9）；`ch03_s09a_yuanye` 上一场走完直接进（7）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（6）；`ch03_s09b_yuanye` 上一场走完直接进（5）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（4） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（638） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（638） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（638） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（638） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「签明交清，带走柳的凭据」（638） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（638） |  |
| 65 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（43%） | `ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（102）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（97）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（78） |  |
| 66 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（14%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（91）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 67 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（14%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（89）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 68 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（16%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（101）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 69 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（13%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（80）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（277）；`ch03_s20_yuanye` 上一场走完直接进（101）；`ch03_s17_shuge` 上一场走完直接进（91）；`ch03_s18_yuanye` 上一场走完直接进（89）；`ch03_s19_shishe` 上一场走完直接进（80） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（638） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（638） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（638） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（638） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 21 次都经过它） | `ch04_s02_hanyuan` 选 C「交自己的意见，取一份留存」（638）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（638） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（128）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（119）；`ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（111）；`ch04_s05p_shuge` 选 G「独自过一阵」（90）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（88）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（76）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（26） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（4%） | `ch04_s05pe_shuge` 换场（26） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（612）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（164）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（156）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（125）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（99）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（26） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（26%） | `ch04_s05c_shuge` 换场（164） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（20%） | `ch04_s05c_shuge` 换场（125） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（24%） | `ch04_s05c_shuge` 换场（156） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（16%） | `ch04_s05c_shuge` 换场（99） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（638）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（66）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（66）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（62）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（60）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（58）；`ch04_s05qd_yuanye` 选 A「我也愿意，只与你相爱」（40）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（38）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（36）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（11）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（8）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（7）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（1） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（22%） | `ch04_s05q_shuge` 换场（139） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（20%） | `ch04_s05q_shuge` 换场（134） |  |
| 87 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（13%） | `ch04_s05q_shuge` 换场（83） |  |
| 88 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（15%） | `ch04_s05q_shuge` 换场（97） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（638） |  |
| 90 | `ch04_s05rl_yuanye` | 相见不替她定去处 | 选出来的（6%） | `ch04_s05r_shuge` 换场（40） |  |
| 91 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 15 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（598）；`ch04_s05rl_yuanye` 选 A「约好再见，收好自己的稿」（40）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 92 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（37%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（235）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s14_shuge` | 归期写在前面 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（403）；`ch04_s09_yuanye` 选 F「今后只谈公事，我去问行路」（223）；`ch04_s09_yuanye` 选 C「行路的事仍要去问」（12）<br/>进入条件：flag.liqinghe_won<br/>上一场的另一条去向：`ch04_s09_yuanye`（要 flag.liqinghe_won）、`ch04_s10_yuanye`（要 非 flag.enthroned）、`ch04_s11_nvguan`（要 flag.liqinghe_won） |  |
| 94 | `ch04_s15_yilu` | 各自领一份 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s14_shuge` 选 A「接这一月的差，明早领款」（638）<br/>进入条件：flag.ch04_road_contract<br/>上一场的另一条去向：`ch04_s10_yuanye`（要 非 flag.enthroned） | ✓ |
| 95 | `ch04_s16_yilu` | 驿旁不是归处 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s15_yilu` 选 A「随车到第一处交接」（638）<br/>进入条件：flag.road_agreement | ✓ |
| 96 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s16_yilu` 上一场走完直接进（638） |  |
| 97 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（638） |  |

## 8. 纸上有名（`zhishangyouming`）

判定：无条件（兜底：前面七个都不成立时落到这里）。结局表按顺序判，第一个成立的就是结局，所以这条线还要求前面 7 个结局都不成立。

走到这里的路 1214 条，不同的场次序列 1103 种，每条 71—84 场。

### 判定用到的 flag 是在哪里写下的

无：兜底结局不看 flag。

### 为什么没落到更靠前的结局

| 更靠前的结局 | 这条线上的路缺了什么（路数） |
|---|---|
| 满殿无声 | 缺 enthroned、ch04_dissent_removed、ch04_originals_destroyed、ch04_nomination_closed（1214） |
| 无字之碑 | 缺 enthroned、public_review、ch04_nomination_open（1214） |
| 未竟之诏 | 缺 enthroned（1214） |
| 两席之间 | 缺 liqinghe_together（1214） |
| 开门授字 | 缺 founded_school（1214） |
| 不受 | 缺 declined_crown（1214） |
| 关山有信 | 缺 road_agreement（1214） |

### 场次

| # | 场次 | 标题 | 必经／选出来的 | 从哪里进来 | 只在本线 |
|---|---|---|---|---|---|
| 1 | `ch01_s00_zhaoyang` | 宫门未暖 | 必经（图上绕不开） | 起点（1214） |  |
| 2 | `ch01_s01_zhaoyang` | 先签的自愿 | 必经（图上绕不开） | `ch01_s00_zhaoyang` 上一场走完直接进（1214） |  |
| 3 | `ch01_s02_zhaoyang` | 马不识公文 | 必经（图上绕不开） | `ch01_s01_zhaoyang` 上一场走完直接进（1214） |  |
| 4 | `ch01_s03_yeting` | 一寸旧线 | 必经（图上绕不开） | `ch01_s02_zhaoyang` 选 B「逐张补明改处，我签名备查」（616）；`ch01_s02_zhaoyang` 选 A「全批重抄，我补误掉的抄工」（598） |  |
| 5 | `ch01_s04_shuge` | 半句留给你 | 必经（图上绕不开） | `ch01_s03_yeting` 上一场走完直接进（1214） |  |
| 6 | `ch01_s05_yuanye` | 学不像的鸟 | 必经（图上绕不开） | `ch01_s04_shuge` 对诗输（609）；`ch01_s04_shuge` 对诗赢（605） |  |
| 7 | `ch01_s06_yeting` | 各领各的 | 必经（图上绕不开） | `ch01_s05_yuanye` 上一场走完直接进（1214） |  |
| 8 | `ch01_s07_yuanye` | 还没付清的行囊 | 必经（图上绕不开） | `ch01_s06_yeting` 选 B「等布线齐了，我留下补抄」（654）；`ch01_s06_yeting` 选 A「先领布，我记下缺线再追领」（560） |  |
| 9 | `ch01_s08_shuge` | 榜外也收卷 | 必经（图上绕不开） | `ch01_s07_yuanye` 选 A「陪你催欠钱，不替你许归期」（608）；`ch01_s07_yuanye` 选 B「陪你逐项查清，再问归期」（606） |  |
| 10 | `ch01_s09_shuge` | 不借母亲的话 | 必经（图上绕不开） | `ch01_s08_shuge` 选 A「先收六份，满额便明示」（615）；`ch01_s08_shuge` 选 B「午后前都收，评卷顺延」（599） |  |
| 11 | `ch01_s10_yeting` | 没有她的商量 | 必经（图上绕不开） | `ch01_s09_shuge` 选 A「我来当面挑，也听你驳我」（635）；`ch01_s09_shuge` 选 B「先各自写，免得我顺着你说」（579） |  |
| 12 | `ch01_s11_shishe` | 纸的背面 | 必经（图上绕不开） | `ch01_s10_yeting` 上一场走完直接进（1214） |  |
| 13 | `ch01_s12_shuge` | 擅添的一行 | 必经（图上绕不开） | `ch01_s11_shishe` 选 B「今日不借你的话，只买这一张纸」（620）；`ch01_s11_shishe` 选 A「请你挑错，呈文由我自己署」（594） |  |
| 14 | `ch01_s13_shuge` | 两杯一样凉 | 选出来的（14%） | `ch01_s12_shuge` 选 A「和沈衡坐片刻」（170）<br/>进入条件：affinity.shenheng >= 4 |  |
| 15 | `ch01_s14_yuanye` | 解结不论兵 | 选出来的（22%） | `ch01_s12_shuge` 选 B「到园里找裴照夜」（269）<br/>进入条件：affinity.peizhaoye >= 4 |  |
| 16 | `ch01_s15_shishe` | 只猜纸声 | 选出来的（41%） | `ch01_s12_shuge` 选 C「去听温荞说纸声」（252）；`ch01_s12_shuge` 选 E「到诗社歇脚，再去找阿荻」（246） |  |
| 17 | `ch01_s16_yuanye` | 不记这一局 | 选出来的（23%） | `ch01_s12_shuge` 选 D「和公主玩一会儿」（277）<br/>进入条件：affinity.liqinghe >= 4 |  |
| 18 | `ch01_s17_yeting` | 只说给你听 | 必经（图上绕不开） | `ch01_s15_shishe` 上一场走完直接进（498）；`ch01_s16_yuanye` 上一场走完直接进（277）；`ch01_s14_yuanye` 上一场走完直接进（269）；`ch01_s13_shuge` 上一场走完直接进（170）<br/>进入条件：flag.petition_sent |  |
| 19 | `ch01_s18_zhaoyang` | 回牒不找她 | 必经（图上绕不开） | `ch01_s17_yeting` 选 B「先把话说全，再带补说明去」（611）；`ch01_s17_yeting` 选 A「先追呈文，请宋才人陪你」（603）<br/>进入条件：flag.petition_sent |  |
| 20 | `ch02_s01_yeting` | 先问她 | 必经（图上绕不开） | `ch01_s18_zhaoyang` 上一场走完直接进（1214） |  |
| 21 | `ch02_s02_yeting` | 复一遍再记 | 必经（图上绕不开） | `ch02_s01_yeting` 上一场走完直接进（1214） |  |
| 22 | `ch02_s03_nvguan` | 门不能替人开 | 必经（图上绕不开） | `ch02_s02_yeting` 选 B「午后再查，给她留半日」（638）；`ch02_s02_yeting` 选 A「现在逐项查清，请门外的人散去」（576） |  |
| 23 | `ch02_s04_shuge` | 请你替我读 | 必经（图上绕不开） | `ch02_s03_nvguan` 上一场走完直接进（1214） |  |
| 24 | `ch02_s05_yeting` | 折不到一个角 | 必经（图上绕不开） | `ch02_s04_shuge` 选 B「一起读，私下相见先缓缓」（318）；`ch02_s04_shuge` 选 A「一起读。读完也想见你」（309）；`ch02_s04_shuge` 选 D「这次陪读我也接不下」（301）；`ch02_s04_shuge` 选 C「我只核这卷，不约私见」（286） |  |
| 25 | `ch02_s06_yeting` | 钱与去处分开算 | 必经（图上绕不开） | `ch02_s05_yeting` 上一场走完直接进（1214） |  |
| 26 | `ch02_s07_yuanye` | 把这一头交给我 | 必经（图上绕不开） | `ch02_s06_yeting` 选 B「先付六件，余下三件另催」（608）；`ch02_s06_yeting` 选 A「先垫修栏的钱，今日付清」（606） |  |
| 27 | `ch02_s08_shuge` | 这也算差务 | 必经（图上绕不开） | `ch02_s07_yuanye` 选 B「我查行程，你列齐粮数」（419）；`ch02_s07_yuanye` 选 C「这回不接，请另找人查」（399）；`ch02_s07_yuanye` 选 A「我查欠了什么，你去问她」（396） |  |
| 28 | `ch02_s09_shishe` | 这句先让我听见 | 必经（图上绕不开） | `ch02_s08_shuge` 选 B「按次给俸，往返另记」（648）；`ch02_s08_shuge` 选 A「连往返按半日给俸」（566） |  |
| 29 | `ch02_s10_nvguan` | 夜谈二：不算数，就不算吗 | 必经（图上绕不开） | `ch02_s09_shishe` 选 C「这次我也没余力陪读」（420）；`ch02_s09_shishe` 选 B「我先听完，再逐句说」（413）；`ch02_s09_shishe` 选 A「我陪读，有刺耳的就停」（381） |  |
| 30 | `ch02_s11_hanyuan` | 谁准拆这封信 | 必经（图上绕不开） | `ch02_s10_nvguan` 上一场走完直接进（1214） |  |
| 31 | `ch02_s12_yeting` | 别请我替你说好话 | 必经（图上绕不开） | `ch02_s11_hanyuan` 选 A「先收住议抄，再查原封」（616）；`ch02_s11_hanyuan` 选 B「先查原封，再收住议抄」（598） |  |
| 32 | `ch02_s13_hanyuan` | 封到哪，读到哪 | 必经（图上绕不开） | `ch02_s12_yeting` 上一场走完直接进（1214） |  |
| 33 | `ch02_s14_zhaoyang` | 披帛留不住人 | 必经（图上绕不开） | `ch02_s13_hanyuan` 选 A「整封限人查阅，另抄公务部分」（612）；`ch02_s13_hanyuan` 选 B「核存公务部分，把私信退还」（602） |  |
| 34 | `ch02_s15_shuge` | 墨渍像什么 | 选出来的（16%） | `ch02_s14_zhaoyang` 选 A「去沈衡那里看墨渍」（195）<br/>进入条件：affinity.shenheng >= 8 且 flag.shen_joint_reading |  |
| 35 | `ch02_s16_yuanye` | 两块总不一样 | 选出来的（18%） | `ch02_s14_zhaoyang` 选 B「和裴照夜分一块饼」（213）<br/>进入条件：affinity.peizhaoye >= 8 且 flag.pei_shared_check |  |
| 36 | `ch02_s17_shishe` | 给影子起怪名 | 选出来的（15%） | `ch02_s14_zhaoyang` 选 C「去温荞那里看窗影」（181）<br/>进入条件：affinity.wenqiao >= 8 且 flag.wen_reader_help |  |
| 37 | `ch02_s18_yuanye` | 歪枝还往哪里弯 | 选出来的（26%） | `ch02_s14_zhaoyang` 选 D「与李令仪看那根歪枝」（321）<br/>进入条件：affinity.liqinghe >= 8 且 flag.liqinghe_cost_check |  |
| 38 | `ch02_s19_nvguan` | 这一颗也酸 | 选出来的（25%） | `ch02_s14_zhaoyang` 选 E「到观里歇一会儿」（304） |  |
| 39 | `ch02_s20_hanyuan` | 资格不是许诺 | 必经（图上绕不开） | `ch02_s18_yuanye` 上一场走完直接进（321）；`ch02_s19_nvguan` 上一场走完直接进（304）；`ch02_s16_yuanye` 上一场走完直接进（213）；`ch02_s15_shuge` 上一场走完直接进（195）；`ch02_s17_shishe` 上一场走完直接进（181） |  |
| 40 | `ch02_s21_nvguan` | 她们另定一个时辰 | 必经（图上绕不开） | `ch02_s20_hanyuan` 选 A「三处联署，列清避嫌与申辩办法」（622）；`ch02_s20_hanyuan` 选 B「限期自行答问，列清路费与日期」（592） |  |
| 41 | `ch02_s25_yeting` | 那天我在 | 必经（图上绕不开） | `ch02_s21_nvguan` 上一场走完直接进（1214） |  |
| 42 | `ch02_s22_shuge` | 不只写赞成 | 必经（图上绕不开） | `ch02_s25_yeting` 选 B「撤回代答，我自己另排时辰」（629）；`ch02_s25_yeting` 选 A「今夜交给你，我去备稿」（585） |  |
| 43 | `ch02_s23_hanyuan` | 名单有两行 | 必经（图上绕不开） | `ch02_s22_shuge` 选 B「今日先走，你慢慢收」（617）；`ch02_s22_shuge` 选 A「我在门边等你」（597） |  |
| 44 | `ch02_s26_shuge` | 剩下的正好 | 必经（图上绕不开） | `ch02_s23_hanyuan` 选 A「收下候选文书，准备逐项比较」（1214） |  |
| 45 | `ch02_s24_shuge` | 两份都给你 | 必经（图上绕不开） | `ch02_s26_shuge` 上一场走完直接进（1214） |  |
| 46 | `ch03_s01_shuge` | 抽去这一页 | 必经（图上绕不开） | `ch02_s24_shuge` 选 C「我只约你明日论议」（420）；`ch02_s24_shuge` 选 A「留一会儿。明日我仍会驳你」（403）；`ch02_s24_shuge` 选 B「今夜想独处，改日再问」（391） |  |
| 47 | `ch03_s02_shuge` | 你还认得这行字 | 必经（图上绕不开） | `ch03_s01_shuge` 选 B「先补证再公开，错过本轮查证」（821）；`ch03_s01_shuge` 选 A「反对的话和我的说明一起送查」（393） |  |
| 48 | `ch03_s03_yeting` | 三夜都替你 | 必经（图上绕不开） | `ch03_s02_shuge` 选 B「今日先走，异议照留」（611）；`ch03_s02_shuge` 选 A「留下坐一会儿，异议照留」（603） |  |
| 49 | `ch03_s04_yuanye` | 兵符留在匣里 | 必经（图上绕不开） | `ch03_s03_yeting` 选 A「接下三夜，记清她原有的休假」（610）；`ch03_s03_yeting` 选 B「请另两人代班，我付钱并交班」（604） |  |
| 50 | `ch03_s05_shishe` | 不替你写这句 | 必经（图上绕不开） | `ch03_s04_yuanye` 选 A「抱一下。队列照样不添」（645）；`ch03_s04_yuanye` 选 B「陪我站一会儿，先不抱」（569） |  |
| 51 | `ch03_s06_shuge` | 这一行署谁 | 必经（图上绕不开） | `ch03_s05_shishe` 选 B「稿照实付，合唱另约」（608）；`ch03_s05_shishe` 选 A「稿照实付，今夜一起唱」（606） |  |
| 52 | `ch03_s07_yeting` | 两个人的交班 | 必经（图上绕不开） | `ch03_s06_shuge` 选 B「并列她做的事，我只署总管」（628）；`ch03_s06_shuge` 选 A「简录只列我，底簿留她的名」（586） |  |
| 53 | `ch03_s08_hanyuan` | 先把账铺开 | 必经（图上绕不开） | `ch03_s07_yeting` 上一场走完直接进（1214） |  |
| 54 | `ch03_s09_yuanye` | 今夜不作答卷 | 必经（图上绕不开） | `ch03_s08_hanyuan` 选 D「六处提案不撤，先交已有凭据」（1214） |  |
| 55 | `ch03_s09a_yuanye` | 说完再来 | 选出来的（1%） | `ch03_s09_yuanye` 选 A「想只同你相爱，我去说清楚」（10）<br/>进入条件：flag.li_ch03_only_intent |  |
| 56 | `ch03_s09b_yuanye` | 先别约我 | 选出来的（1%） | `ch03_s09_yuanye` 选 B「我还想见她，也想见你」（14）<br/>进入条件：flag.li_ch03_multi_told |  |
| 57 | `ch03_s09c_yuanye` | 明日的稿照送 | 选出来的（1%） | `ch03_s09_yuanye` 选 C「答不出，先停我们的私约」（13）<br/>进入条件：flag.li_ch03_private_paused |  |
| 58 | `ch03_s10_nvguan` | 水到这里 | 必经（图上绕不开） | `ch03_s09_yuanye` 选 E「今夜各回。明日照实争」（542）；`ch03_s09_yuanye` 选 D「一起走。明日照实争」（511）；`ch03_s09_yuanye` 选 F「一起走。明日照实争」（54）；`ch03_s09_yuanye` 选 G「今夜各回。明日照实争」（47）；`ch03_s09_yuanye` 选 H「一起走。明日照实争」（16）；`ch03_s09b_yuanye` 上一场走完直接进（14）；`ch03_s09c_yuanye` 上一场走完直接进（13）；`ch03_s09a_yuanye` 上一场走完直接进（10）；`ch03_s09_yuanye` 选 I「今夜各回。明日照实争」（7） |  |
| 59 | `ch03_s11_hanyuan` | 两份答复 | 必经（图上绕不开） | `ch03_s10_nvguan` 上一场走完直接进（1214） |  |
| 60 | `ch03_s12_hanyuan` | 受不受这一席 | 必经（图上绕不开） | `ch03_s11_hanyuan` 选 C「听完制书，收好自己的提案」（1214） |  |
| 61 | `ch03_s13_yeting` | 她要带走的针包 | 必经（图上绕不开） | `ch03_s12_hanyuan` 选 C「收好提案，去交清旧差」（1214） |  |
| 62 | `ch03_s14_shuge` | 谁还欠哪一班 | 必经（图上绕不开） | `ch03_s13_yeting` 上一场走完直接进（1214） |  |
| 63 | `ch03_s15_yeting` | 这个你自己定 | 必经（图上绕不开） | `ch03_s14_shuge` 选 A「签明交清，带走柳的凭据」（1214） |  |
| 64 | `ch03_s16_shuge` | 不替明日全答 | 必经（图上绕不开） | `ch03_s15_yeting` 选 A「收好绳，把她的纸留在她手边」（1214） |  |
| 65 | `ch03_s21_nvguan` | 灯花落在哪边 | 选出来的（47%） | `ch03_s16_shuge` 选 F「去观里坐坐，晚些问路」（206）；`ch03_s16_shuge` 选 G「到观里坐一会儿，别的先不定」（189）；`ch03_s16_shuge` 选 E「去观里坐坐，再看看教读」（172） |  |
| 66 | `ch03_s18_yuanye` | 谁先被鸟吵醒 | 选出来的（14%） | `ch03_s16_shuge` 选 B「去园里和裴照夜坐坐」（174）<br/>进入条件：affinity.peizhaoye >= 14 且 flag.pei_meng_no_troops |  |
| 67 | `ch03_s20_yuanye` | 这一口先不猜 | 选出来的（14%） | `ch03_s16_shuge` 选 D「和李令仪慢慢吃一颗果子」（169）<br/>进入条件：affinity.liqinghe >= 14 且 flag.li_meng_real_competition |  |
| 68 | `ch03_s19_shishe` | 哪边坐着有风 | 选出来的（14%） | `ch03_s16_shuge` 选 C「去诗社找温荞乘凉」（167）<br/>进入条件：affinity.wenqiao >= 14 且 flag.wen_meng_no_praise |  |
| 69 | `ch03_s17_shuge` | 雨没下到这里 | 选出来的（11%） | `ch03_s16_shuge` 选 A「去沈衡那里听檐雨」（137）<br/>进入条件：affinity.shenheng >= 14 且 flag.shen_meng_boundary |  |
| 70 | `ch03_s22_nvguan` | 这屋不等诏来 | 必经（图上绕不开） | `ch03_s21_nvguan` 上一场走完直接进（567）；`ch03_s18_yuanye` 上一场走完直接进（174）；`ch03_s20_yuanye` 上一场走完直接进（169）；`ch03_s19_shishe` 上一场走完直接进（167）；`ch03_s17_shuge` 上一场走完直接进（137） |  |
| 71 | `ch03_s23_yeting` | 一块方光 | 必经（图上绕不开） | `ch03_s22_nvguan` 选 A「按价买纸，下回另问她们」（1214） |  |
| 72 | `ch03_s24_shuge` | 案上第一件 | 必经（图上绕不开） | `ch03_s23_yeting` 上一场走完直接进（1214） |  |
| 73 | `ch04_s01_zhaoyang` | 自己落这一笔 | 必经（图上绕不开） | `ch03_s24_shuge` 上一场走完直接进（1214） |  |
| 74 | `ch04_s02_hanyuan` | 谁的话附在后面 | 必经（图上绕不开） | `ch04_s01_zhaoyang` 选 E「带上自己的议件」（1214） |  |
| 75 | `ch04_s08_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 13 次都经过它） | `ch04_s02_hanyuan` 选 C「交自己的意见，取一份留存」（1214）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s03_shuge`（要 flag.enthroned） |  |
| 76 | `ch04_s05p_shuge` | 往后怎样见面 | 必经（图上绕不开） | `ch04_s08_shuge` 上一场走完直接进（1214） |  |
| 77 | `ch04_s05pe_shuge` | 出门以前 | 必经（图上绕不开） | `ch04_s05p_shuge` 选 F「先停私约，独自过一阵」（233）；`ch04_s05p_shuge` 选 G「独自过一阵」（222）；`ch04_s05p_shuge` 选 B「去见裴照夜，我想只同她相爱」（213）；`ch04_s05p_shuge` 选 A「去见沈衡，我想只同她相爱」（205）；`ch04_s05p_shuge` 选 C「去见温荞，我想只同她相爱」（197）；`ch04_s05p_shuge` 选 D「去见李令仪，我想只同她相爱」（89）；`ch04_s05p_shuge` 选 E「还想见不止一人，逐个说清」（55） |  |
| 78 | `ch04_s05m_shuge` | 把名字想清楚 | 选出来的（5%） | `ch04_s05pe_shuge` 换场（55） |  |
| 79 | `ch04_s05c_shuge` | 先把旧约说完 | 必经（图上绕不开） | `ch04_s05pe_shuge` 上一场走完直接进（1159）；`ch04_s05ca_shuge` 选 A「说到这里，收回私约」（274）；`ch04_s05cc_shishe` 选 A「说到这里，收回私约」（270）；`ch04_s05cb_yuanye` 选 A「说到这里，收回私约」（265）；`ch04_s05cd_yuanye` 选 A「说到这里，收回私约」（212）；`ch04_s05m_shuge` 选 E「就这些，分别去说」（55） |  |
| 80 | `ch04_s05ca_shuge` | 同沈衡说停 | 选出来的（23%） | `ch04_s05c_shuge` 换场（274） |  |
| 81 | `ch04_s05cb_yuanye` | 同裴照夜说停 | 选出来的（22%） | `ch04_s05c_shuge` 换场（265） |  |
| 82 | `ch04_s05cc_shishe` | 同温荞说停 | 选出来的（22%） | `ch04_s05c_shuge` 换场（270） |  |
| 83 | `ch04_s05cd_yuanye` | 同李令仪说停 | 选出来的（17%） | `ch04_s05c_shuge` 换场（212） |  |
| 84 | `ch04_s05q_shuge` | 还没有听完的答复 | 必经（图上绕不开） | `ch04_s05c_shuge` 上一场走完直接进（1214）；`ch04_s05qb_yuanye` 选 C「我还做不到，先停私约」（120）；`ch04_s05qa_shuge` 选 C「我还做不到，先停私约」（112）；`ch04_s05qb_yuanye` 选 A「我也愿意，只与你相爱」（111）；`ch04_s05qc_shishe` 选 C「我还做不到，先停私约」（111）；`ch04_s05qc_shishe` 选 A「我也愿意，只与你相爱」（103）；`ch04_s05qa_shuge` 选 A「我也愿意，只与你相爱」（93）；`ch04_s05qd_yuanye` 选 C「我还做不到，先停私约」（89）；`ch04_s05qa_shuge` 选 B「听见了，不再这样约」（21）；`ch04_s05qd_yuanye` 选 B「听见了，不再这样约」（14）；`ch04_s05qb_yuanye` 选 B「按说清的这样继续」（11）；`ch04_s05qc_shishe` 选 B「按说清的这样继续」（11） |  |
| 85 | `ch04_s05qa_shuge` | 听沈衡自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（226） |  |
| 86 | `ch04_s05qb_yuanye` | 听裴照夜自己答 | 选出来的（19%） | `ch04_s05q_shuge` 换场（242） |  |
| 87 | `ch04_s05qc_shishe` | 听温荞自己答 | 选出来的（18%） | `ch04_s05q_shuge` 换场（225） |  |
| 88 | `ch04_s05qd_yuanye` | 听李令仪自己答 | 选出来的（8%） | `ch04_s05q_shuge` 换场（103） |  |
| 89 | `ch04_s05r_shuge` | 各自答过以后 | 必经（图上绕不开） | `ch04_s05q_shuge` 上一场走完直接进（1214） |  |
| 90 | `ch04_s08z_shuge` | 这份只署我 | 必经（条件绕不开：绕着它走 60 次，走到本结局的 12 次都经过它） | `ch04_s05r_shuge` 上一场走完直接进（1214）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s05z_yeting`（要 flag.enthroned） |  |
| 91 | `ch04_s09_yuanye` | 见面不列朝班 | 选出来的（48%） | `ch04_s08z_shuge` 选 B「去见李令仪，私话另答」（586）<br/>进入条件：flag.liqinghe_won |  |
| 92 | `ch04_s11_nvguan` | 三日以后谁付 | 选出来的（38%） | `ch04_s08z_shuge` 选 C「明日去问借屋教字」（303）；`ch04_s09_yuanye` 选 E「今后只谈公事，我去问办学」（159）<br/>进入条件：flag.liqinghe_won |  |
| 93 | `ch04_s14_shuge` | 归期写在前面 | 选出来的（39%） | `ch04_s08z_shuge` 选 D「去问一份独立差程」（325）；`ch04_s09_yuanye` 选 F「今后只谈公事，我去问行路」（146）<br/>进入条件：flag.liqinghe_won |  |
| 94 | `ch04_s10_yuanye` | 一张饼够了 | 必经（条件绕不开：绕着它走 60 次，一次也没走到本结局） | `ch04_s14_shuge` 选 B「这回不接，归期的纸我留着」（471）；`ch04_s11_nvguan` 选 B「这回先不接」（462）；`ch04_s09_yuanye` 选 D「今后只谈公事，我先留京」（281）<br/>进入条件：非 flag.enthroned<br/>上一场的另一条去向：`ch04_s11_nvguan`（要 flag.liqinghe_won）、`ch04_s12_nvguan`（要 flag.ch04_school_contract）、`ch04_s14_shuge`（要 flag.liqinghe_won）、`ch04_s15_yilu`（要 flag.ch04_road_contract） |  |
| 95 | `ch04_s17_nvguan` | 只有这边看得到 | 必经（图上绕不开） | `ch04_s10_yuanye` 上一场走完直接进（1214） |  |
| 96 | `ch04_s18_wuzibei` | 留白以后 | 必经（图上绕不开） | `ch04_s17_nvguan` 选 C「到晚间，再去见许」（1214） |  |

## 附：必经的复核记录

抽样里「每条都经过」、但图上绕得开的场，都朝那个结局专门绕着走过（每场最多 60 次，绕开一次就停）。绕开了的，那条路已经算进这条线，这一场随之变成「选出来的」。

- 复核 39 处，绕开 0 处，留作必经 39 处。

| 结局 | 场次 | 结果 |
|---|---|---|
| 不受 | `ch04_s08_shuge` | 没绕开：试 60 次，22 次走到本结局 |
| 不受 | `ch04_s08z_shuge` | 没绕开：试 60 次，19 次走到本结局 |
| 不受 | `ch04_s10_yuanye` | 没绕开：试 60 次，16 次走到本结局 |
| 关山有信 | `ch04_s08_shuge` | 没绕开：试 60 次，21 次走到本结局 |
| 关山有信 | `ch04_s08z_shuge` | 没绕开：试 60 次，15 次走到本结局 |
| 关山有信 | `ch04_s14_shuge` | 没绕开：试 60 次，0 次走到本结局 |
| 关山有信 | `ch04_s15_yilu` | 没绕开：试 60 次，0 次走到本结局 |
| 关山有信 | `ch04_s16_yilu` | 没绕开：试 60 次，0 次走到本结局 |
| 开门授字 | `ch04_s08_shuge` | 没绕开：试 60 次，16 次走到本结局 |
| 开门授字 | `ch04_s08z_shuge` | 没绕开：试 60 次，15 次走到本结局 |
| 开门授字 | `ch04_s11_nvguan` | 没绕开：试 60 次，0 次走到本结局 |
| 开门授字 | `ch04_s12_nvguan` | 没绕开：试 60 次，0 次走到本结局 |
| 开门授字 | `ch04_s13_nvguan` | 没绕开：试 60 次，0 次走到本结局 |
| 两席之间 | `ch04_s05qd_yuanye` | 没绕开：试 60 次，0 次走到本结局 |
| 两席之间 | `ch04_s05rl_yuanye` | 没绕开：试 60 次，0 次走到本结局 |
| 两席之间 | `ch04_s08_shuge` | 没绕开：试 60 次，0 次走到本结局 |
| 两席之间 | `ch04_s08z_shuge` | 没绕开：试 60 次，1 次走到本结局 |
| 两席之间 | `ch04_s10_yuanye` | 没绕开：试 60 次，0 次走到本结局 |
| 满殿无声 | `ch04_s03_shuge` | 没绕开：试 60 次，0 次走到本结局 |
| 满殿无声 | `ch04_s04_zhaoyang` | 没绕开：试 60 次，3 次走到本结局 |
| 满殿无声 | `ch04_s05_yeting` | 没绕开：试 60 次，5 次走到本结局 |
| 满殿无声 | `ch04_s05z_yeting` | 没绕开：试 60 次，2 次走到本结局 |
| 满殿无声 | `ch04_s06_zhaoyang` | 没绕开：试 60 次，1 次走到本结局 |
| 满殿无声 | `ch04_s07_hanyuan` | 没绕开：试 60 次，2 次走到本结局 |
| 未竟之诏 | `ch04_s03_shuge` | 没绕开：试 60 次，18 次走到本结局 |
| 未竟之诏 | `ch04_s04_zhaoyang` | 没绕开：试 60 次，16 次走到本结局 |
| 未竟之诏 | `ch04_s05_yeting` | 没绕开：试 60 次，16 次走到本结局 |
| 未竟之诏 | `ch04_s05z_yeting` | 没绕开：试 60 次，19 次走到本结局 |
| 未竟之诏 | `ch04_s06_zhaoyang` | 没绕开：试 60 次，14 次走到本结局 |
| 未竟之诏 | `ch04_s07_hanyuan` | 没绕开：试 60 次，11 次走到本结局 |
| 无字之碑 | `ch04_s03_shuge` | 没绕开：试 60 次，3 次走到本结局 |
| 无字之碑 | `ch04_s04_zhaoyang` | 没绕开：试 60 次，3 次走到本结局 |
| 无字之碑 | `ch04_s05_yeting` | 没绕开：试 60 次，1 次走到本结局 |
| 无字之碑 | `ch04_s05z_yeting` | 没绕开：试 60 次，3 次走到本结局 |
| 无字之碑 | `ch04_s06_zhaoyang` | 没绕开：试 60 次，3 次走到本结局 |
| 无字之碑 | `ch04_s07_hanyuan` | 没绕开：试 60 次，4 次走到本结局 |
| 纸上有名 | `ch04_s08_shuge` | 没绕开：试 60 次，13 次走到本结局 |
| 纸上有名 | `ch04_s08z_shuge` | 没绕开：试 60 次，12 次走到本结局 |
| 纸上有名 | `ch04_s10_yuanye` | 没绕开：试 60 次，0 次走到本结局 |

