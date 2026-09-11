# 剧情分支图

> 由 `tools/story-graph.ts` 生成，不要手改。数据变了重新跑 `npm run graph`。
> 生成时间：2026-09-10 23:46

绢色是金碧场景，纸色是水墨场景，**朱砂描边的是从开场走不到的孤儿场景**。
带锁的边表示这个选项有条件。

```mermaid
flowchart TD
  ch01_s01_zhaoyang["ch01_s01_zhaoyang<br/>zhaoyang · 金"]
  ch01_s02_zhaoyang["ch01_s02_zhaoyang<br/>zhaoyang · 金"]
  ch01_s03_yeting["ch01_s03_yeting<br/>yeting · 墨"]
  ch01_s04_shuge["ch01_s04_shuge<br/>shuge · 墨 留信:shenheng"]
  ch01_s05_yuanye["ch01_s05_yuanye<br/>yuanye · 墨 无用"]
  ch01_s06_yeting["ch01_s06_yeting<br/>yeting · 墨"]
  ch01_s07_yuanye["ch01_s07_yuanye<br/>yuanye · 墨 留信:peizhaoye"]
  ch01_s08_shuge["ch01_s08_shuge<br/>shuge · 金"]
  ch01_s09_shuge["ch01_s09_shuge<br/>shuge · 墨 留信:liqinghe"]
  ch01_s10_yeting["ch01_s10_yeting<br/>yeting · 墨"]
  ch01_s11_shishe["ch01_s11_shishe<br/>shishe · 墨 留信:wenqiao"]
  ch01_s12_shuge["ch01_s12_shuge<br/>shuge · 金"]
  ch01_s13_shuge["ch01_s13_shuge<br/>shuge · 墨 无用"]
  ch01_s14_yuanye["ch01_s14_yuanye<br/>yuanye · 墨 无用"]
  ch01_s15_shishe["ch01_s15_shishe<br/>shishe · 墨 无用"]
  ch01_s16_yuanye["ch01_s16_yuanye<br/>yuanye · 墨 无用"]
  ch01_s17_yeting["ch01_s17_yeting<br/>yeting · 墨"]
  ch01_s18_zhaoyang["ch01_s18_zhaoyang<br/>zhaoyang · 金"]
  ch01_s01_zhaoyang --> ch01_s02_zhaoyang
  ch01_s02_zhaoyang -->|"全批重抄，我补误掉的抄工"| ch01_s03_yeting
  ch01_s02_zhaoyang -->|"逐张附改，我留名备查"| ch01_s03_yeting
  ch01_s03_yeting --> ch01_s04_shuge
  ch01_s04_shuge -->|"对诗·赢"| ch01_s05_yuanye
  ch01_s04_shuge -->|"对诗·输"| ch01_s05_yuanye
  ch01_s05_yuanye --> ch01_s06_yeting
  ch01_s06_yeting -->|"先发已核的，我记余数追领"| ch01_s07_yuanye
  ch01_s06_yeting -->|"等核齐，我来补夜里的抄工"| ch01_s07_yuanye
  ch01_s07_yuanye -->|"我陪你催，但不替你许归期"| ch01_s08_shuge
  ch01_s07_yuanye -->|"日子仍要问，我陪你逐项核"| ch01_s08_shuge
  ch01_s08_shuge -->|"先收六份，满额便明示"| ch01_s09_shuge
  ch01_s08_shuge -->|"午后前都收，评卷顺延"| ch01_s09_shuge
  ch01_s09_shuge -->|"我来当面挑，也听你驳我"| ch01_s10_yeting
  ch01_s09_shuge -->|"先各自写，免得我顺着你说"| ch01_s10_yeting
  ch01_s10_yeting --> ch01_s11_shishe
  ch01_s11_shishe -->|"请你挑错，呈文由我自己署"| ch01_s12_shuge
  ch01_s11_shishe -->|"今日不借你的话，只买这一张纸"| ch01_s12_shuge
  ch01_s12_shuge -->|"和沈衡坐片刻 🔒"| ch01_s13_shuge
  ch01_s12_shuge -->|"到园里找裴照夜 🔒"| ch01_s14_yuanye
  ch01_s12_shuge -->|"去听温荞说纸声 🔒"| ch01_s15_shishe
  ch01_s12_shuge -->|"和公主玩一会儿 🔒"| ch01_s16_yuanye
  ch01_s12_shuge -->|"直接去找阿荻"| ch01_s17_yeting
  ch01_s13_shuge --> ch01_s17_yeting
  ch01_s14_yuanye --> ch01_s17_yeting
  ch01_s15_shishe --> ch01_s17_yeting
  ch01_s16_yuanye --> ch01_s17_yeting
  ch01_s17_yeting -->|"我先追原牒，请宋才人陪你"| ch01_s18_zhaoyang
  ch01_s17_yeting -->|"先把话说全，再带补说明去"| ch01_s18_zhaoyang
  ch01_s18_zhaoyang --> END_ch01_s18_zhaoyang(("终"))
  classDef gold fill:#E6D9B9,stroke:#1A1815,color:#1A1815;
  classDef ink  fill:#EDE7DA,stroke:#1A1815,color:#33302B;
  classDef lost fill:#EDE7DA,stroke:#A8232A,stroke-width:2px,color:#A8232A;
  class ch01_s01_zhaoyang,ch01_s02_zhaoyang,ch01_s08_shuge,ch01_s12_shuge,ch01_s18_zhaoyang gold;
  class ch01_s03_yeting,ch01_s04_shuge,ch01_s05_yuanye,ch01_s06_yeting,ch01_s07_yuanye,ch01_s09_shuge,ch01_s10_yeting,ch01_s11_shishe,ch01_s13_shuge,ch01_s14_yuanye,ch01_s15_shishe,ch01_s16_yuanye,ch01_s17_yeting ink;
```

## 摘要

| 项 | 数 |
|---|---|
| 场景 | 18 |
| 其中金碧 | 5 |
| 其中无用场景 | 5 |
| 留信的场景 | 4 |
| 走不到的孤儿 | 0 |
| 终点（无出口） | 1 |

## 按幕

**第 1 幕**（18 场，无用场景 5 场）

- `ch01_s01_zhaoyang` zhaoyang／金碧　发现先签自愿的试项与牵马人的实际安排不符
- `ch01_s02_zhaoyang` zhaoyang／金碧　把先告知再署名写进本批试才手续，并承担更正成本
- `ch01_s03_yeting` yeting／水墨　得到具体的照料和私下倾诉，为后来误用私话留下可信根源
- `ch01_s04_shuge` shuge／水墨　两人对沉默如何入卷互不让步，却愿意继续相处
- `ch01_s05_yuanye` yuanye／水墨　两个人容许自己什么也不做成
- `ch01_s06_yeting` yeting／水墨　改掉缺一人便扣整组领物的办法，并分担核账成本
- `ch01_s07_yuanye` yuanye／水墨　亲手接近那匹马，也看见裴照夜不敢轻许归期的缘由
- `ch01_s08_shuge` shuge／金碧　宫内策问试收无荐卷，以明确限额或时限分担经办成本
- `ch01_s09_shuge` shuge／水墨　看见公主既有自己的判断，也被母亲的评价遮住
- `ch01_s10_yeting` yeting／水墨　两个经办女人自行安排病舍核领，不等主角来解题
- `ch01_s11_shishe` shishe／水墨　雨中抢收纸张，温荞先付抄工，再让主角看自己被撤掉的署名
- `ch01_s12_shuge` shuge／金碧　主角把阿荻私话写成可辨认的匿名例证，自以为署名就能承担后果
- `ch01_s13_shuge` shuge／水墨　两个人为茶的浓淡认真一会儿，又不必分出答案
- `ch01_s14_yuanye` yuanye／水墨　两人慢慢拆开一个越帮越紧的衣带结
- `ch01_s15_shishe` shishe／水墨　只听两张纸的声音，猜错也可以笑
- `ch01_s16_yuanye` yuanye／水墨　公主与主角用落叶投石缝，风把输赢一起吹走
- `ch01_s17_yeting` yeting／水墨　玩家先看见阿荻认出细节，再看主角发现善意并没有取得许可
- `ch01_s18_zhaoyang` zhaoyang／金碧　补件不能抹去原牒，首次核问已经沿细节指向阿荻
