# 剧情分支图

> 由 `tools/convert-story.ts` 在每次转换后生成，读的是 `src/data/converted/`（CC2 转换产物），覆盖已交付的所有章。不要手改。
> CC1 的 `npm run graph` 读正式数据，正式数据接入之前它只画得出第一章；两者不一致时以这一份为准。

起点 `ch01_s00_zhaoyang`。纸色是水墨、绢色是金碧；**朱砂描边是从起点走不到的孤儿**；虚线框是还没交付、只被指向的场；🔒 是有条件的选项；虚线箭头是章末结算后的去向。

## 摘要

| 章 | 场数 | 从起点可达 | 孤儿 | 章末 | 无用场景 | 公议布置 | 指向未交付 |
|---|---|---|---|---|---|---|---|
| 1 | 19 | 19 | 0 | 1 | 5 | 0 | 无 |
| 2 | 26 | 26 | 0 | 1 | 7 | 2 | 无 |
| 3 | 24 | 24 | 0 | 1 | 7 | 3 | `ch04_s01_zhaoyang` |

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
  ch01_s04_shuge["04_shuge 半句留给你<br/>shuge · 对诗"]:::ink
  ch01_s05_yuanye["05_yuanye 学不像的鸟<br/>yuanye · 无用"]:::ink
  ch01_s06_yeting["06_yeting 各领各的<br/>yeting"]:::ink
  ch01_s07_yuanye["07_yuanye 还没付清的行囊<br/>yuanye"]:::ink
  ch01_s08_shuge["08_shuge 榜外也收卷<br/>shuge"]:::gold
  ch01_s09_shuge["09_shuge 不借母亲的话<br/>shuge"]:::ink
  ch01_s10_yeting["10_yeting 没有她的商量<br/>yeting"]:::ink
  ch01_s11_shishe["11_shishe 纸的背面<br/>shishe"]:::ink
  ch01_s12_shuge["12_shuge 擅添的一行<br/>shuge"]:::gold
  ch01_s13_shuge["13_shuge 两杯一样凉<br/>shuge · 无用"]:::ink
  ch01_s14_yuanye["14_yuanye 解结不论兵<br/>yuanye · 无用"]:::ink
  ch01_s15_shishe["15_shishe 只猜纸声<br/>shishe · 无用"]:::ink
  ch01_s16_yuanye["16_yuanye 不记这一局<br/>yuanye · 无用"]:::ink
  ch01_s17_yeting["17_yeting 只说给你听<br/>yeting"]:::ink
  ch01_s18_zhaoyang["18_zhaoyang 回牒不找她<br/>zhaoyang · 章末"]:::gold
  ch01_s00_zhaoyang --> ch01_s01_zhaoyang
  ch01_s01_zhaoyang --> ch01_s02_zhaoyang
  ch01_s02_zhaoyang -->|"A 全批重抄，我补误掉的抄工"| ch01_s03_yeting
  ch01_s02_zhaoyang -->|"B 逐张附改，我留名备查"| ch01_s03_yeting
  ch01_s03_yeting --> ch01_s04_shuge
  ch01_s04_shuge -->|"对诗·赢"| ch01_s05_yuanye
  ch01_s04_shuge -->|"对诗·输"| ch01_s05_yuanye
  ch01_s05_yuanye --> ch01_s06_yeting
  ch01_s06_yeting -->|"A 先发已核的，我记余数追领"| ch01_s07_yuanye
  ch01_s06_yeting -->|"B 等核齐，我来补夜里的抄工"| ch01_s07_yuanye
  ch01_s07_yuanye -->|"A 我陪你催，但不替你许归期"| ch01_s08_shuge
  ch01_s07_yuanye -->|"B 日子仍要问，我陪你逐项核"| ch01_s08_shuge
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
  ch01_s12_shuge -->|"E 直接去找阿荻"| ch01_s17_yeting
  ch01_s13_shuge --> ch01_s17_yeting
  ch01_s14_yuanye --> ch01_s17_yeting
  ch01_s15_shishe --> ch01_s17_yeting
  ch01_s16_yuanye --> ch01_s17_yeting
  ch01_s17_yeting -->|"A 我先追原牒，请宋才人陪你"| ch01_s18_zhaoyang
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
  ch02_s12_yeting["12_yeting 别请我替你说好话<br/>yeting"]:::ink
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
  ch02_s02_yeting -->|"A 现在逐项核，门外散去"| ch02_s03_nvguan
  ch02_s02_yeting -->|"B 午后再核，给她留半日"| ch02_s03_nvguan
  ch02_s03_nvguan --> ch02_s04_shuge
  ch02_s04_shuge -->|"A 一起读。读完也想见你"| ch02_s05_yeting
  ch02_s04_shuge -->|"B 一起读，私下相见先缓缓"| ch02_s05_yeting
  ch02_s04_shuge -->|"C 我只核这卷，不约私见"| ch02_s05_yeting
  ch02_s04_shuge -->|"D 这次陪读我也接不下"| ch02_s05_yeting
  ch02_s05_yeting --> ch02_s06_yeting
  ch02_s06_yeting -->|"A 暂垫补栏款，今日付清"| ch02_s07_yuanye
  ch02_s06_yeting -->|"B 先付六件，余款催原项"| ch02_s07_yuanye
  ch02_s07_yuanye -->|"A 我核欠项，你去问她"| ch02_s08_shuge
  ch02_s07_yuanye -->|"B 我核脚程，你把粮数列齐"| ch02_s08_shuge
  ch02_s07_yuanye -->|"C 我今日接不下，另请人核"| ch02_s08_shuge
  ch02_s08_shuge -->|"A 连往返按半日给俸"| ch02_s09_shishe
  ch02_s08_shuge -->|"B 按次给俸，往返另记"| ch02_s09_shishe
  ch02_s09_shishe -->|"A 我陪读，有刺耳的就停"| ch02_s10_nvguan
  ch02_s09_shishe -->|"B 我先听完，再逐句说"| ch02_s10_nvguan
  ch02_s09_shishe -->|"C 这次我也没余力陪读"| ch02_s10_nvguan
  ch02_s10_nvguan --> ch02_s11_hanyuan
  ch02_s11_hanyuan -->|"A 先收议抄，再一同验封"| ch02_s12_yeting
  ch02_s11_hanyuan -->|"B 先验封原件，再收议抄"| ch02_s12_yeting
  ch02_s12_yeting --> ch02_s13_hanyuan
  ch02_s13_hanyuan -->|"A 全笺限阅，另存公务摘录"| ch02_s14_zhaoyang
  ch02_s13_hanyuan -->|"B 验存公务摘录，退还私笺"| ch02_s14_zhaoyang
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
  ch02_s20_hanyuan -->|"A 试联署核验，列回避与申辩"| ch02_s21_nvguan
  ch02_s20_hanyuan -->|"B 试限期问策，列旅费与评期"| ch02_s21_nvguan
  ch02_s21_nvguan --> ch02_s25_yeting
  ch02_s25_yeting -->|"A 今夜交给你，我去备稿"| ch02_s22_shuge
  ch02_s25_yeting -->|"B 撤回代答，我自己另排时辰"| ch02_s22_shuge
  ch02_s22_shuge -->|"A 我在门边等你"| ch02_s23_hanyuan
  ch02_s22_shuge -->|"B 今日先走，你慢慢收"| ch02_s23_hanyuan
  ch02_s23_hanyuan -->|"A 收下候选文牒，准备比较"| ch02_s26_shuge
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
  ch03_s10_nvguan["10_nvguan 水到这里<br/>nvguan · 无用"]:::ink
  ch03_s11_hanyuan["11_hanyuan 两份答复<br/>hanyuan · 公议"]:::gold
  ch03_s12_hanyuan["12_hanyuan 受不受这一席<br/>hanyuan · 公议"]:::gold
  ch03_s13_yeting["13_yeting 她要带走的针包<br/>yeting"]:::ink
  ch03_s14_shuge["14_shuge 谁还欠哪一班<br/>shuge"]:::gold
  ch03_s15_yeting["15_yeting 这个你自己定<br/>yeting"]:::ink
  ch03_s16_shuge["16_shuge 不替明日全答<br/>shuge"]:::gold
  ch03_s17_shuge["17_shuge 雨没下到这里<br/>shuge · 无用"]:::ink
  ch03_s18_yuanye["18_yuanye 谁先被鸟吵醒<br/>yuanye · 无用"]:::ink
  ch03_s19_shishe["19_shishe 哪边坐着有风<br/>shishe · 无用"]:::ink
  ch03_s20_yuanye["20_yuanye 这一口先不猜<br/>yuanye · 无用"]:::ink
  ch03_s21_nvguan["21_nvguan 灯花落在哪边<br/>nvguan · 无用"]:::ink
  ch03_s22_nvguan["22_nvguan 这屋不等诏来<br/>nvguan"]:::ink
  ch03_s23_yeting["23_yeting 一块方光<br/>yeting · 无用"]:::ink
  ch03_s24_shuge["24_shuge 案上第一件<br/>shuge · 章末"]:::ink
  ch03_s01_shuge -->|"A 不利页与补答一同交核"| ch03_s02_shuge
  ch03_s01_shuge -->|"B 暂缓公开，先补证"| ch03_s02_shuge
  ch03_s02_shuge -->|"A 留下坐一会儿，异议照留"| ch03_s03_yeting
  ch03_s02_shuge -->|"B 今日先走，异议照留"| ch03_s03_yeting
  ch03_s03_yeting -->|"A 接下三夜，记清她原有的休"| ch03_s04_yuanye
  ch03_s03_yeting -->|"B 撤回代答，我出工费并交班"| ch03_s04_yuanye
  ch03_s04_yuanye -->|"A 抱一下。队列照样不添"| ch03_s05_shishe
  ch03_s04_yuanye -->|"B 陪我站一会儿，先不抱"| ch03_s05_shishe
  ch03_s05_shishe -->|"A 稿照实付，今夜一起唱"| ch03_s06_shuge
  ch03_s05_shishe -->|"B 稿照实付，合唱另约"| ch03_s06_shuge
  ch03_s06_shuge -->|"A 收下合记摘要，底簿照留"| ch03_s07_yeting
  ch03_s06_shuge -->|"B 并列她的经手，我只署总办"| ch03_s07_yeting
  ch03_s07_yeting --> ch03_s08_hanyuan
  ch03_s08_hanyuan -->|"A 缩为两处，先付钱并办实代"| ch03_s09_yuanye
  ch03_s08_hanyuan -->|"🔒 B 缩办保经费，留人核卷"| ch03_s09_yuanye
  ch03_s08_hanyuan -->|"🔒 C 先办代递，留人核卷"| ch03_s09_yuanye
  ch03_s08_hanyuan -->|"D 保留六处扩办案，先交现有"| ch03_s09_yuanye
  ch03_s08_hanyuan -->|"🔒 E 追问这笔支出的来源"| ch03_s08_hanyuan
  ch03_s09_yuanye -->|"A 一起走。明日照实争"| ch03_s10_nvguan
  ch03_s09_yuanye -->|"B 今夜各回。明日照实争"| ch03_s10_nvguan
  ch03_s10_nvguan --> ch03_s11_hanyuan
  ch03_s11_hanyuan -->|"🔒 A 我受这一席"| ch03_s12_hanyuan
  ch03_s11_hanyuan -->|"🔒 B 我不受，请依原议重推"| ch03_s12_hanyuan
  ch03_s11_hanyuan -->|"🔒 C 听完制书，收好自己的提案"| ch03_s12_hanyuan
  ch03_s12_hanyuan -->|"🔒 A 收下新卷，去交清旧差"| ch03_s13_yeting
  ch03_s12_hanyuan -->|"🔒 B 辞受已办，去交清余项"| ch03_s13_yeting
  ch03_s12_hanyuan -->|"🔒 C 收好提案，去交清旧差"| ch03_s13_yeting
  ch03_s13_yeting --> ch03_s14_shuge
  ch03_s14_shuge -->|"A 署下交讫，带走柳的凭据"| ch03_s15_yeting
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
  ch04_s01_zhaoyang["未交付 ch04_s01_zhaoyang"]:::pending
```
