# 剧情分支图

> 由 `tools/convert-story.ts` 在每次转换后生成，读的是 `src/data/converted/`（CC2 转换产物），覆盖已交付的所有章。不要手改。
> CC1 的 `npm run graph` 读正式数据，正式数据接入之前它只画得出第一章；两者不一致时以这一份为准。

起点 `ch01_s00_zhaoyang`。纸色是水墨、绢色是金碧；**朱砂描边是从起点走不到的孤儿**；虚线框是还没交付、只被指向的场；🔒 是有条件的选项；虚线箭头是章末结算后的去向。

## 摘要

| 章 | 场数 | 从起点可达 | 孤儿 | 章末 | 无用场景 | 有布置 | 指向未交付 |
|---|---|---|---|---|---|---|---|
| 1 | 19 | 19 | 0 | 1 | 5 | 5 | 无 |
| 2 | 26 | 26 | 0 | 1 | 7 | 3 | 无 |
| 3 | 27 | 27 | 0 | 1 | 7 | 5 | 无 |
| 4 | 35 | 35 | 0 | 0 | 5 | 9 | 无 |

## 第 1 章

```mermaid
flowchart TD
  classDef ink fill:#f4efe6,stroke:#3a3a3a,color:#1a1a1a
  classDef gold fill:#efe2bf,stroke:#8a6a2a,color:#1a1a1a
  classDef orphan stroke:#b23a2a,stroke-width:3px
  classDef pending fill:#ffffff,stroke:#999,stroke-dasharray:4 3,color:#666
  ch01_s00_zhaoyang["00_zhaoyang 宫门未暖<br/>zhaoyang"]:::ink
  ch01_s01_zhaoyang["01_zhaoyang 先签的自愿<br/>zhaoyang"]:::gold
  ch01_s02_zhaoyang["02_zhaoyang 马不识公文<br/>zhaoyang"]:::gold
  ch01_s03_yeting["03_yeting 一寸旧线<br/>yeting"]:::ink
  ch01_s04_shuge["04_shuge 半句留给你<br/>shuge · 夜灯·对诗"]:::ink
  ch01_s05_yuanye["05_yuanye 学不像的鸟<br/>yuanye · 无用"]:::ink
  ch01_s06_yeting["06_yeting 各领各的<br/>yeting"]:::ink
  ch01_s07_yuanye["07_yuanye 还没付清的行囊<br/>yuanye · 晴光"]:::ink
  ch01_s08_shuge["08_shuge 榜外也收卷<br/>shuge · 公议"]:::gold
  ch01_s09_shuge["09_shuge 不借母亲的话<br/>shuge"]:::ink
  ch01_s10_yeting["10_yeting 没有她的商量<br/>yeting"]:::ink
  ch01_s11_shishe["11_shishe 纸的背面<br/>shishe"]:::ink
  ch01_s12_shuge["12_shuge 擅添的一行<br/>shuge"]:::gold
  ch01_s13_shuge["13_shuge 两杯一样凉<br/>shuge · 无用"]:::ink
  ch01_s14_yuanye["14_yuanye 解结不论兵<br/>yuanye · 无用·晴光"]:::ink
  ch01_s15_shishe["15_shishe 只猜纸声<br/>shishe · 无用"]:::ink
  ch01_s16_yuanye["16_yuanye 不记这一局<br/>yuanye · 无用·晴光"]:::ink
  ch01_s17_yeting["17_yeting 只说给你听<br/>yeting"]:::ink
  ch01_s18_zhaoyang["18_zhaoyang 回牒不找她<br/>zhaoyang · 章末"]:::gold
  ch01_s00_zhaoyang --> ch01_s01_zhaoyang
  ch01_s01_zhaoyang --> ch01_s02_zhaoyang
  ch01_s02_zhaoyang -->|"A 全批重抄，我补误掉的抄工"| ch01_s03_yeting
  ch01_s02_zhaoyang -->|"B 逐张补明改处，我签名备查"| ch01_s03_yeting
  ch01_s03_yeting --> ch01_s04_shuge
  ch01_s04_shuge -->|"对诗·赢"| ch01_s05_yuanye
  ch01_s04_shuge -->|"对诗·输"| ch01_s05_yuanye
  ch01_s05_yuanye --> ch01_s06_yeting
  ch01_s06_yeting -->|"A 先领布，我记下缺线再追领"| ch01_s07_yuanye
  ch01_s06_yeting -->|"B 等布线齐了，我留下补抄"| ch01_s07_yuanye
  ch01_s07_yuanye -->|"A 陪你催欠钱，不替你许归期"| ch01_s08_shuge
  ch01_s07_yuanye -->|"B 陪你逐项查清，再问归期"| ch01_s08_shuge
  ch01_s08_shuge -->|"A 先收六份，满额便明示"| ch01_s09_shuge
  ch01_s08_shuge -->|"B 午后前都收，评卷顺延"| ch01_s09_shuge
  ch01_s09_shuge -->|"A 我来当面挑，也听你驳我"| ch01_s10_yeting
  ch01_s09_shuge -->|"B 先各自写，免得我顺着你说"| ch01_s10_yeting
  ch01_s10_yeting --> ch01_s11_shishe
  ch01_s11_shishe -->|"A 请你挑错，呈文由我自己署"| ch01_s12_shuge
  ch01_s11_shishe -->|"B 今日不借你的话，只买这一"| ch01_s12_shuge
  ch01_s12_shuge -->|"🔒 A 和沈衡坐片刻"| ch01_s13_shuge
  ch01_s12_shuge -->|"🔒 B 到园里找裴照夜"| ch01_s14_yuanye
  ch01_s12_shuge -->|"🔒 C 去听温荞说纸声"| ch01_s15_shishe
  ch01_s12_shuge -->|"🔒 D 和公主玩一会儿"| ch01_s16_yuanye
  ch01_s12_shuge -->|"E 到诗社歇脚，再去找阿荻"| ch01_s15_shishe
  ch01_s13_shuge --> ch01_s17_yeting
  ch01_s14_yuanye --> ch01_s17_yeting
  ch01_s15_shishe --> ch01_s17_yeting
  ch01_s16_yuanye --> ch01_s17_yeting
  ch01_s17_yeting -->|"A 先追呈文，请宋才人陪你"| ch01_s18_zhaoyang
  ch01_s17_yeting -->|"B 先把话说全，再带补说明去"| ch01_s18_zhaoyang
  ch01_s18_zhaoyang -.->|"章末"| ch02_s01_yeting
  ch02_s01_yeting["→ 第 2 章 01_yeting"]:::pending
```

## 第 2 章

```mermaid
flowchart TD
  classDef ink fill:#f4efe6,stroke:#3a3a3a,color:#1a1a1a
  classDef gold fill:#efe2bf,stroke:#8a6a2a,color:#1a1a1a
  classDef orphan stroke:#b23a2a,stroke-width:3px
  classDef pending fill:#ffffff,stroke:#999,stroke-dasharray:4 3,color:#666
  ch02_s01_yeting["01_yeting 先问她<br/>yeting"]:::ink
  ch02_s02_yeting["02_yeting 复一遍再记<br/>yeting"]:::ink
  ch02_s03_nvguan["03_nvguan 门不能替人开<br/>nvguan"]:::ink
  ch02_s04_shuge["04_shuge 请你替我读<br/>shuge"]:::ink
  ch02_s05_yeting["05_yeting 折不到一个角<br/>yeting · 无用"]:::ink
  ch02_s06_yeting["06_yeting 钱与去处分开算<br/>yeting"]:::ink
  ch02_s07_yuanye["07_yuanye 把这一头交给我<br/>yuanye"]:::ink
  ch02_s08_shuge["08_shuge 这也算差务<br/>shuge"]:::gold
  ch02_s09_shishe["09_shishe 这句先让我听见<br/>shishe"]:::ink
  ch02_s10_nvguan["10_nvguan 夜谈二：不算数，就不算吗<br/>nvguan · 无用"]:::ink
  ch02_s11_hanyuan["11_hanyuan 谁准拆这封信<br/>hanyuan · 公议"]:::gold
  ch02_s12_yeting["12_yeting 别请我替你说好话<br/>yeting · 夜灯"]:::ink
  ch02_s13_hanyuan["13_hanyuan 封到哪，读到哪<br/>hanyuan · 公议"]:::gold
  ch02_s14_zhaoyang["14_zhaoyang 披帛留不住人<br/>zhaoyang"]:::gold
  ch02_s15_shuge["15_shuge 墨渍像什么<br/>shuge · 无用"]:::ink
  ch02_s16_yuanye["16_yuanye 两块总不一样<br/>yuanye · 无用"]:::ink
  ch02_s17_shishe["17_shishe 给影子起怪名<br/>shishe · 无用"]:::ink
  ch02_s18_yuanye["18_yuanye 歪枝还往哪里弯<br/>yuanye · 无用"]:::ink
  ch02_s19_nvguan["19_nvguan 这一颗也酸<br/>nvguan · 无用"]:::ink
  ch02_s20_hanyuan["20_hanyuan 资格不是许诺<br/>hanyuan"]:::gold
  ch02_s21_nvguan["21_nvguan 她们另定一个时辰<br/>nvguan"]:::ink
  ch02_s22_shuge["22_shuge 不只写赞成<br/>shuge"]:::gold
  ch02_s23_hanyuan["23_hanyuan 名单有两行<br/>hanyuan"]:::gold
  ch02_s24_shuge["24_shuge 两份都给你<br/>shuge · 章末"]:::ink
  ch02_s25_yeting["25_yeting 那天我在<br/>yeting"]:::ink
  ch02_s26_shuge["26_shuge 剩下的正好<br/>shuge"]:::ink
  ch02_s01_yeting --> ch02_s02_yeting
  ch02_s02_yeting -->|"A 现在逐项查清，请门外的人"| ch02_s03_nvguan
  ch02_s02_yeting -->|"B 午后再查，给她留半日"| ch02_s03_nvguan
  ch02_s03_nvguan --> ch02_s04_shuge
  ch02_s04_shuge -->|"A 一起读。读完也想见你"| ch02_s05_yeting
  ch02_s04_shuge -->|"B 一起读，私下相见先缓缓"| ch02_s05_yeting
  ch02_s04_shuge -->|"C 我只核这卷，不约私见"| ch02_s05_yeting
  ch02_s04_shuge -->|"D 这次陪读我也接不下"| ch02_s05_yeting
  ch02_s05_yeting --> ch02_s06_yeting
  ch02_s06_yeting -->|"A 先垫修栏的钱，今日付清"| ch02_s07_yuanye
  ch02_s06_yeting -->|"B 先付六件，余下三件另催"| ch02_s07_yuanye
  ch02_s07_yuanye -->|"A 我查欠了什么，你去问她"| ch02_s08_shuge
  ch02_s07_yuanye -->|"B 我查行程，你列齐粮数"| ch02_s08_shuge
  ch02_s07_yuanye -->|"C 这回不接，请另找人查"| ch02_s08_shuge
  ch02_s08_shuge -->|"A 连往返按半日给俸"| ch02_s09_shishe
  ch02_s08_shuge -->|"B 按次给俸，往返另记"| ch02_s09_shishe
  ch02_s09_shishe -->|"A 我陪读，有刺耳的就停"| ch02_s10_nvguan
  ch02_s09_shishe -->|"B 我先听完，再逐句说"| ch02_s10_nvguan
  ch02_s09_shishe -->|"C 这次我也没余力陪读"| ch02_s10_nvguan
  ch02_s10_nvguan --> ch02_s11_hanyuan
  ch02_s11_hanyuan -->|"A 先收住议抄，再查原封"| ch02_s12_yeting
  ch02_s11_hanyuan -->|"B 先查原封，再收住议抄"| ch02_s12_yeting
  ch02_s12_yeting --> ch02_s13_hanyuan
  ch02_s13_hanyuan -->|"A 整封限人查阅，另抄公务部"| ch02_s14_zhaoyang
  ch02_s13_hanyuan -->|"B 核存公务部分，把私信退还"| ch02_s14_zhaoyang
  ch02_s14_zhaoyang -->|"🔒 A 去沈衡那里看墨渍"| ch02_s15_shuge
  ch02_s14_zhaoyang -->|"🔒 B 和裴照夜分一块饼"| ch02_s16_yuanye
  ch02_s14_zhaoyang -->|"🔒 C 去温荞那里看窗影"| ch02_s17_shishe
  ch02_s14_zhaoyang -->|"🔒 D 与李令仪看那根歪枝"| ch02_s18_yuanye
  ch02_s14_zhaoyang -->|"E 到观里歇一会儿"| ch02_s19_nvguan
  ch02_s15_shuge --> ch02_s20_hanyuan
  ch02_s16_yuanye --> ch02_s20_hanyuan
  ch02_s17_shishe --> ch02_s20_hanyuan
  ch02_s18_yuanye --> ch02_s20_hanyuan
  ch02_s19_nvguan --> ch02_s20_hanyuan
  ch02_s20_hanyuan -->|"A 三处联署，列清避嫌与申辩"| ch02_s21_nvguan
  ch02_s20_hanyuan -->|"B 限期自行答问，列清路费与"| ch02_s21_nvguan
  ch02_s21_nvguan --> ch02_s25_yeting
  ch02_s25_yeting -->|"A 今夜交给你，我去备稿"| ch02_s22_shuge
  ch02_s25_yeting -->|"B 撤回代答，我自己另排时辰"| ch02_s22_shuge
  ch02_s22_shuge -->|"A 我在门边等你"| ch02_s23_hanyuan
  ch02_s22_shuge -->|"B 今日先走，你慢慢收"| ch02_s23_hanyuan
  ch02_s23_hanyuan -->|"A 收下候选文书，准备逐项比"| ch02_s26_shuge
  ch02_s26_shuge --> ch02_s24_shuge
  ch02_s24_shuge -.->|"章末"| ch03_s01_shuge
  ch03_s01_shuge["→ 第 3 章 01_shuge"]:::pending
```

## 第 3 章

```mermaid
flowchart TD
  classDef ink fill:#f4efe6,stroke:#3a3a3a,color:#1a1a1a
  classDef gold fill:#efe2bf,stroke:#8a6a2a,color:#1a1a1a
  classDef orphan stroke:#b23a2a,stroke-width:3px
  classDef pending fill:#ffffff,stroke:#999,stroke-dasharray:4 3,color:#666
  ch03_s01_shuge["01_shuge 抽去这一页<br/>shuge"]:::gold
  ch03_s02_shuge["02_shuge 你还认得这行字<br/>shuge"]:::ink
  ch03_s03_yeting["03_yeting 三夜都替你<br/>yeting"]:::ink
  ch03_s04_yuanye["04_yuanye 兵符留在匣里<br/>yuanye"]:::ink
  ch03_s05_shishe["05_shishe 不替你写这句<br/>shishe"]:::ink
  ch03_s06_shuge["06_shuge 这一行署谁<br/>shuge"]:::gold
  ch03_s07_yeting["07_yeting 两个人的交班<br/>yeting"]:::ink
  ch03_s08_hanyuan["08_hanyuan 先把账铺开<br/>hanyuan · 公议"]:::gold
  ch03_s09_yuanye["09_yuanye 今夜不作答卷<br/>yuanye"]:::ink
  ch03_s09a_yuanye["09a_yuanye 说完再来<br/>yuanye"]:::ink
  ch03_s09b_yuanye["09b_yuanye 先别约我<br/>yuanye"]:::ink
  ch03_s09c_yuanye["09c_yuanye 明日的稿照送<br/>yuanye"]:::ink
  ch03_s10_nvguan["10_nvguan 水到这里<br/>nvguan · 无用·夜雨"]:::ink
  ch03_s11_hanyuan["11_hanyuan 两份答复<br/>hanyuan · 公议"]:::gold
  ch03_s12_hanyuan["12_hanyuan 受不受这一席<br/>hanyuan · 受位"]:::gold
  ch03_s13_yeting["13_yeting 她要带走的针包<br/>yeting"]:::ink
  ch03_s14_shuge["14_shuge 谁还欠哪一班<br/>shuge"]:::gold
  ch03_s15_yeting["15_yeting 这个你自己定<br/>yeting"]:::ink
  ch03_s16_shuge["16_shuge 不替明日全答<br/>shuge"]:::gold
  ch03_s17_shuge["17_shuge 雨没下到这里<br/>shuge · 无用"]:::ink
  ch03_s18_yuanye["18_yuanye 谁先被鸟吵醒<br/>yuanye · 无用"]:::ink
  ch03_s19_shishe["19_shishe 哪边坐着有风<br/>shishe · 无用"]:::ink
  ch03_s20_yuanye["20_yuanye 这一口先不猜<br/>yuanye · 无用·晴光"]:::ink
  ch03_s21_nvguan["21_nvguan 灯花落在哪边<br/>nvguan · 无用"]:::ink
  ch03_s22_nvguan["22_nvguan 这屋不等诏来<br/>nvguan"]:::ink
  ch03_s23_yeting["23_yeting 一块方光<br/>yeting · 无用"]:::ink
  ch03_s24_shuge["24_shuge 案上第一件<br/>shuge · 章末"]:::ink
  ch03_s01_shuge -->|"A 反对的话和我的说明一起送"| ch03_s02_shuge
  ch03_s01_shuge -->|"B 先补证再公开，错过本轮查"| ch03_s02_shuge
  ch03_s02_shuge -->|"A 留下坐一会儿，异议照留"| ch03_s03_yeting
  ch03_s02_shuge -->|"B 今日先走，异议照留"| ch03_s03_yeting
  ch03_s03_yeting -->|"A 接下三夜，记清她原有的休"| ch03_s04_yuanye
  ch03_s03_yeting -->|"B 请另两人代班，我付钱并交"| ch03_s04_yuanye
  ch03_s04_yuanye -->|"A 抱一下。队列照样不添"| ch03_s05_shishe
  ch03_s04_yuanye -->|"B 陪我站一会儿，先不抱"| ch03_s05_shishe
  ch03_s05_shishe -->|"A 稿照实付，今夜一起唱"| ch03_s06_shuge
  ch03_s05_shishe -->|"B 稿照实付，合唱另约"| ch03_s06_shuge
  ch03_s06_shuge -->|"A 简录只列我，底簿留她的名"| ch03_s07_yeting
  ch03_s06_shuge -->|"B 并列她做的事，我只署总管"| ch03_s07_yeting
  ch03_s07_yeting --> ch03_s08_hanyuan
  ch03_s08_hanyuan -->|"A 减为两处，付足钱并办好代"| ch03_s09_yuanye
  ch03_s08_hanyuan -->|"🔒 B 先保经费，留人查卷，代送"| ch03_s09_yuanye
  ch03_s08_hanyuan -->|"🔒 C 先办代送并查卷，下月经费"| ch03_s09_yuanye
  ch03_s08_hanyuan -->|"D 六处提案不撤，先交已有凭"| ch03_s09_yuanye
  ch03_s08_hanyuan -->|"🔒 E 追问这笔支出的来源"| ch03_s08_hanyuan
  ch03_s09_yuanye -->|"🔒 A 想只同你相爱，我去说清楚"| ch03_s09a_yuanye
  ch03_s09_yuanye -->|"🔒 B 我还想见她，也想见你"| ch03_s09b_yuanye
  ch03_s09_yuanye -->|"🔒 C 答不出，先停我们的私约"| ch03_s09c_yuanye
  ch03_s09_yuanye -->|"🔒 D 一起走。明日照实争"| ch03_s10_nvguan
  ch03_s09_yuanye -->|"🔒 E 今夜各回。明日照实争"| ch03_s10_nvguan
  ch03_s09_yuanye -->|"🔒 F 一起走。明日照实争"| ch03_s10_nvguan
  ch03_s09_yuanye -->|"🔒 G 今夜各回。明日照实争"| ch03_s10_nvguan
  ch03_s09_yuanye -->|"🔒 H 一起走。明日照实争"| ch03_s10_nvguan
  ch03_s09_yuanye -->|"🔒 I 今夜各回。明日照实争"| ch03_s10_nvguan
  ch03_s09a_yuanye --> ch03_s10_nvguan
  ch03_s09b_yuanye --> ch03_s10_nvguan
  ch03_s09c_yuanye --> ch03_s10_nvguan
  ch03_s10_nvguan --> ch03_s11_hanyuan
  ch03_s11_hanyuan -->|"🔒 A 我受这一席"| ch03_s12_hanyuan
  ch03_s11_hanyuan -->|"🔒 B 我不受，请依原议重推"| ch03_s12_hanyuan
  ch03_s11_hanyuan -->|"🔒 C 听完制书，收好自己的提案"| ch03_s12_hanyuan
  ch03_s12_hanyuan -->|"🔒 A 收下新卷，去交清旧差"| ch03_s13_yeting
  ch03_s12_hanyuan -->|"🔒 B 辞受已办，去交清余项"| ch03_s13_yeting
  ch03_s12_hanyuan -->|"🔒 C 收好提案，去交清旧差"| ch03_s13_yeting
  ch03_s13_yeting --> ch03_s14_shuge
  ch03_s14_shuge -->|"A 签明交清，带走柳的凭据"| ch03_s15_yeting
  ch03_s15_yeting -->|"A 收好绳，把她的纸留在她手"| ch03_s16_shuge
  ch03_s16_shuge -->|"🔒 A 去沈衡那里听檐雨"| ch03_s17_shuge
  ch03_s16_shuge -->|"🔒 B 去园里和裴照夜坐坐"| ch03_s18_yuanye
  ch03_s16_shuge -->|"🔒 C 去诗社找温荞乘凉"| ch03_s19_shishe
  ch03_s16_shuge -->|"🔒 D 和李令仪慢慢吃一颗果子"| ch03_s20_yuanye
  ch03_s16_shuge -->|"🔒 E 去观里坐坐，再看看教读"| ch03_s21_nvguan
  ch03_s16_shuge -->|"🔒 F 去观里坐坐，晚些问路"| ch03_s21_nvguan
  ch03_s16_shuge -->|"G 到观里坐一会儿，别的先不"| ch03_s21_nvguan
  ch03_s17_shuge --> ch03_s22_nvguan
  ch03_s18_yuanye --> ch03_s22_nvguan
  ch03_s19_shishe --> ch03_s22_nvguan
  ch03_s20_yuanye --> ch03_s22_nvguan
  ch03_s21_nvguan --> ch03_s22_nvguan
  ch03_s22_nvguan -->|"A 按价买纸，下回另问她们"| ch03_s23_yeting
  ch03_s23_yeting --> ch03_s24_shuge
  ch03_s24_shuge -.->|"章末"| ch04_s01_zhaoyang
  ch04_s01_zhaoyang["→ 第 4 章 01_zhaoyang"]:::pending
```

## 第 4 章

```mermaid
flowchart TD
  classDef ink fill:#f4efe6,stroke:#3a3a3a,color:#1a1a1a
  classDef gold fill:#efe2bf,stroke:#8a6a2a,color:#1a1a1a
  classDef orphan stroke:#b23a2a,stroke-width:3px
  classDef pending fill:#ffffff,stroke:#999,stroke-dasharray:4 3,color:#666
  ch04_s01_zhaoyang["01_zhaoyang 自己落这一笔<br/>zhaoyang"]:::ink
  ch04_s02_hanyuan["02_hanyuan 谁的话附在后面<br/>hanyuan · 公议"]:::gold
  ch04_s03_shuge["03_shuge 原页不能再生<br/>shuge"]:::gold
  ch04_s04_zhaoyang["04_zhaoyang 谁能签两个人<br/>zhaoyang"]:::ink
  ch04_s05_yeting["05_yeting 钱到了谁手里<br/>yeting"]:::ink
  ch04_s05c_shuge["05c_shuge 先把旧约说完<br/>shuge"]:::ink
  ch04_s05ca_shuge["05ca_shuge 同沈衡说停<br/>shuge"]:::ink
  ch04_s05cb_yuanye["05cb_yuanye 同裴照夜说停<br/>yuanye"]:::ink
  ch04_s05cc_shishe["05cc_shishe 同温荞说停<br/>shishe"]:::ink
  ch04_s05cd_yuanye["05cd_yuanye 同李令仪说停<br/>yuanye"]:::ink
  ch04_s05m_shuge["05m_shuge 把名字想清楚<br/>shuge"]:::ink
  ch04_s05p_shuge["05p_shuge 往后怎样见面<br/>shuge"]:::ink
  ch04_s05pe_shuge["05pe_shuge 出门以前<br/>shuge"]:::ink
  ch04_s05q_shuge["05q_shuge 还没有听完的答复<br/>shuge"]:::ink
  ch04_s05qa_shuge["05qa_shuge 听沈衡自己答<br/>shuge"]:::ink
  ch04_s05qb_yuanye["05qb_yuanye 听裴照夜自己答<br/>yuanye · 晴光"]:::ink
  ch04_s05qc_shishe["05qc_shishe 听温荞自己答<br/>shishe"]:::ink
  ch04_s05qd_yuanye["05qd_yuanye 听李令仪自己答<br/>yuanye · 晴光"]:::ink
  ch04_s05r_shuge["05r_shuge 各自答过以后<br/>shuge"]:::ink
  ch04_s05rl_yuanye["05rl_yuanye 相见不替她定去处<br/>yuanye"]:::ink
  ch04_s05z_yeting["05z_yeting 钱到了谁手里<br/>yeting"]:::ink
  ch04_s06_zhaoyang["06_zhaoyang 灯油添到这里<br/>zhaoyang · 无用"]:::ink
  ch04_s07_hanyuan["07_hanyuan 下一份荐名<br/>hanyuan · 公议"]:::gold
  ch04_s08_shuge["08_shuge 这份只署我<br/>shuge"]:::ink
  ch04_s08z_shuge["08z_shuge 这份只署我<br/>shuge"]:::ink
  ch04_s09_yuanye["09_yuanye 见面不列朝班<br/>yuanye"]:::ink
  ch04_s10_yuanye["10_yuanye 一张饼够了<br/>yuanye · 无用"]:::ink
  ch04_s11_nvguan["11_nvguan 三日以后谁付<br/>nvguan"]:::ink
  ch04_s12_nvguan["12_nvguan 半日也算来过<br/>nvguan · 开课"]:::ink
  ch04_s13_nvguan["13_nvguan 她们收自己的席<br/>nvguan · 无用·开课"]:::ink
  ch04_s14_shuge["14_shuge 归期写在前面<br/>shuge"]:::ink
  ch04_s15_yilu["15_yilu 各自领一份<br/>yilu · 启程"]:::ink
  ch04_s16_yilu["16_yilu 驿旁不是归处<br/>yilu · 无用·驿旁"]:::ink
  ch04_s17_nvguan["17_nvguan 只有这边看得到<br/>nvguan"]:::ink
  ch04_s18_wuzibei["18_wuzibei 留白以后<br/>wuzibei · 无用·碑样"]:::ink
  ch04_s05p_shuge -->|"🔒 A 去见沈衡，我想只同她相爱"| ch04_s05pe_shuge
  ch04_s05p_shuge -->|"🔒 B 去见裴照夜，我想只同她相"| ch04_s05pe_shuge
  ch04_s05p_shuge -->|"🔒 C 去见温荞，我想只同她相爱"| ch04_s05pe_shuge
  ch04_s05p_shuge -->|"🔒 D 去见李令仪，我想只同她相"| ch04_s05pe_shuge
  ch04_s05p_shuge -->|"🔒 E 还想见不止一人，逐个说清"| ch04_s05pe_shuge
  ch04_s05p_shuge -->|"🔒 F 先停私约，独自过一阵"| ch04_s05pe_shuge
  ch04_s05p_shuge -->|"🔒 G 独自过一阵"| ch04_s05pe_shuge
  ch04_s05pe_shuge -->|"🔒 自动1"| ch04_s05m_shuge
  ch04_s05pe_shuge --> ch04_s05c_shuge
  ch04_s05m_shuge -->|"🔒 A 还想问沈衡"| ch04_s05m_shuge
  ch04_s05m_shuge -->|"🔒 B 还想问裴照夜"| ch04_s05m_shuge
  ch04_s05m_shuge -->|"🔒 C 还想问温荞"| ch04_s05m_shuge
  ch04_s05m_shuge -->|"🔒 D 还想问李令仪"| ch04_s05m_shuge
  ch04_s05m_shuge -->|"E 就这些，分别去说"| ch04_s05c_shuge
  ch04_s05c_shuge -->|"🔒 自动1"| ch04_s05ca_shuge
  ch04_s05c_shuge -->|"🔒 自动2"| ch04_s05cb_yuanye
  ch04_s05c_shuge -->|"🔒 自动3"| ch04_s05cc_shishe
  ch04_s05c_shuge -->|"🔒 自动4"| ch04_s05cd_yuanye
  ch04_s05c_shuge --> ch04_s05q_shuge
  ch04_s05ca_shuge -->|"A 说到这里，收回私约"| ch04_s05c_shuge
  ch04_s05cb_yuanye -->|"A 说到这里，收回私约"| ch04_s05c_shuge
  ch04_s05cc_shishe -->|"A 说到这里，收回私约"| ch04_s05c_shuge
  ch04_s05cd_yuanye -->|"A 说到这里，收回私约"| ch04_s05c_shuge
  ch04_s05q_shuge -->|"🔒 自动1"| ch04_s05qa_shuge
  ch04_s05q_shuge -->|"🔒 自动2"| ch04_s05qb_yuanye
  ch04_s05q_shuge -->|"🔒 自动3"| ch04_s05qc_shishe
  ch04_s05q_shuge -->|"🔒 自动4"| ch04_s05qd_yuanye
  ch04_s05q_shuge --> ch04_s05r_shuge
  ch04_s05qa_shuge -->|"🔒 A 我也愿意，只与你相爱"| ch04_s05q_shuge
  ch04_s05qa_shuge -->|"🔒 B 听见了，不再这样约"| ch04_s05q_shuge
  ch04_s05qa_shuge -->|"🔒 C 我还做不到，先停私约"| ch04_s05q_shuge
  ch04_s05qb_yuanye -->|"🔒 A 我也愿意，只与你相爱"| ch04_s05q_shuge
  ch04_s05qb_yuanye -->|"🔒 B 按说清的这样继续"| ch04_s05q_shuge
  ch04_s05qb_yuanye -->|"C 我还做不到，先停私约"| ch04_s05q_shuge
  ch04_s05qc_shishe -->|"🔒 A 我也愿意，只与你相爱"| ch04_s05q_shuge
  ch04_s05qc_shishe -->|"🔒 B 按说清的这样继续"| ch04_s05q_shuge
  ch04_s05qc_shishe -->|"C 我还做不到，先停私约"| ch04_s05q_shuge
  ch04_s05qd_yuanye -->|"🔒 A 我也愿意，只与你相爱"| ch04_s05q_shuge
  ch04_s05qd_yuanye -->|"🔒 B 听见了，不再这样约"| ch04_s05q_shuge
  ch04_s05qd_yuanye -->|"🔒 C 我还做不到，先停私约"| ch04_s05q_shuge
  ch04_s05r_shuge -->|"🔒 自动1"| ch04_s05z_yeting
  ch04_s05r_shuge -->|"🔒 自动2"| ch04_s05rl_yuanye
  ch04_s05r_shuge --> ch04_s08z_shuge
  ch04_s05z_yeting -->|"🔒 A 收好今日的交付凭"| ch04_s06_zhaoyang
  ch04_s05z_yeting -->|"🔒 B 收好今日的交付凭"| ch04_s06_zhaoyang
  ch04_s05z_yeting -->|"🔒 C 收好今日的交付凭"| ch04_s06_zhaoyang
  ch04_s08z_shuge -->|"🔒 A 今日不定去处，出去吃点东"| ch04_s10_yuanye
  ch04_s08z_shuge -->|"🔒 B 去见李令仪，私话另答"| ch04_s09_yuanye
  ch04_s08z_shuge -->|"🔒 C 明日去问借屋教字"| ch04_s11_nvguan
  ch04_s08z_shuge -->|"🔒 D 去问一份独立差程"| ch04_s14_shuge
  ch04_s01_zhaoyang -->|"🔒 A 写下天"| ch04_s02_hanyuan
  ch04_s01_zhaoyang -->|"🔒 B 写下曌"| ch04_s02_hanyuan
  ch04_s01_zhaoyang -->|"🔒 C 仍用添"| ch04_s02_hanyuan
  ch04_s01_zhaoyang -->|"🔒 D 领回自己的东西"| ch04_s02_hanyuan
  ch04_s01_zhaoyang -->|"🔒 E 带上自己的议件"| ch04_s02_hanyuan
  ch04_s02_hanyuan -->|"🔒 A 把反对原话与我的答复一起"| ch04_s03_shuge
  ch04_s02_hanyuan -->|"🔒 B 议录只留我答的，反对原话"| ch04_s03_shuge
  ch04_s02_hanyuan -->|"🔒 C 交自己的意见，取一份留存"| ch04_s08_shuge
  ch04_s03_shuge -->|"🔒 A 保存原件，按准许的范围查"| ch04_s04_zhaoyang
  ch04_s03_shuge -->|"🔒 B 确认焚毁原案，不可恢复"| ch04_s04_zhaoyang
  ch04_s03_shuge -->|"🔒 C 保存原件，按准许的范围查"| ch04_s04_zhaoyang
  ch04_s03_shuge -->|"🔒 D 确认焚毁原案，不可恢复"| ch04_s04_zhaoyang
  ch04_s04_zhaoyang -->|"🔒 A 颁行双方自愿入籍的办法"| ch04_s05_yeting
  ch04_s04_zhaoyang -->|"🔒 B 颁行个人分别授权的办法"| ch04_s05_yeting
  ch04_s04_zhaoyang -->|"🔒 C 颁行双方自愿入籍的办法"| ch04_s05_yeting
  ch04_s04_zhaoyang -->|"🔒 D 颁行个人分别授权的办法"| ch04_s05_yeting
  ch04_s05_yeting --> ch04_s05p_shuge
  ch04_s07_hanyuan -->|"A 许多处荐人，并收反对的话"| ch04_s17_nvguan
  ch04_s07_hanyuan -->|"B 只许在位者荐人"| ch04_s17_nvguan
  ch04_s08_shuge --> ch04_s05p_shuge
  ch04_s10_yuanye --> ch04_s17_nvguan
  ch04_s05rl_yuanye -->|"🔒 A 约好再见，收好自己的稿"| ch04_s08z_shuge
  ch04_s06_zhaoyang --> ch04_s07_hanyuan
  ch04_s09_yuanye -->|"🔒 A 先留京，再约时辰"| ch04_s10_yuanye
  ch04_s09_yuanye -->|"🔒 B 办学的事仍要去问"| ch04_s11_nvguan
  ch04_s09_yuanye -->|"🔒 C 行路的事仍要去问"| ch04_s14_shuge
  ch04_s09_yuanye -->|"🔒 D 今后只谈公事，我先留京"| ch04_s10_yuanye
  ch04_s09_yuanye -->|"🔒 E 今后只谈公事，我去问办学"| ch04_s11_nvguan
  ch04_s09_yuanye -->|"🔒 F 今后只谈公事，我去问行路"| ch04_s14_shuge
  ch04_s11_nvguan -->|"A 按这一月的约定办"| ch04_s12_nvguan
  ch04_s11_nvguan -->|"B 这回先不接"| ch04_s10_yuanye
  ch04_s11_nvguan -->|"🔒 C 追问无人来时怎样付钱"| ch04_s11_nvguan
  ch04_s12_nvguan -->|"A 收好今日的课页"| ch04_s13_nvguan
  ch04_s13_nvguan --> ch04_s17_nvguan
  ch04_s14_shuge -->|"A 接这一月的差，明早领款"| ch04_s15_yilu
  ch04_s14_shuge -->|"B 这回不接，归期的纸我留着"| ch04_s10_yuanye
  ch04_s15_yilu -->|"A 随车到第一处交接"| ch04_s16_yilu
  ch04_s16_yilu --> ch04_s17_nvguan
  ch04_s17_nvguan -->|"🔒 A 收好今次交付的回凭"| ch04_s18_wuzibei
  ch04_s17_nvguan -->|"🔒 B 收好今次交付的回凭"| ch04_s18_wuzibei
  ch04_s17_nvguan -->|"🔒 C 到晚间，再去见许"| ch04_s18_wuzibei
```
