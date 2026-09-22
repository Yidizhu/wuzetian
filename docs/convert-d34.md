# CC2 D34：C54 正式转换与验收

正式转换已写入 src/data/converted/，指纹 **a156f6191d52**。交 CC1 集成；本报告不表示测试站已部署。

## 输入与输出

- C54 源稿提交：8a53b402f1da7a4b481001499c0839f37fdd1b78；解锁记录：279de49；UTC：2026-09-22T10:11:33Z。
- 八份变化稿的磁盘 SHA256 = 源稿提交 = C54 声明，mtime 早于解锁；其余六份输入与 D32 相同。正式输入逐份摘要在 [manifest](../src/data/converted/manifest.json) 和 [机器验收记录](../tools/convert-d34-audit.json)。收诗 schema 与 3 分钟下限已落地。
- D32 指纹 a98717d7815e → D34 a156f6191d52；107 场、3925 格、31 首诗、5 局对诗、21 封信、8 结局。
- 对照转换前快照，变化仅有四个场景 JSON、21 个信件 JSON 和 manifest；其余产物逐字节相同。两次正式转换的 132 个文件逐字节一致。
- 指纹算法沿用 convert-routes：排序读入场景与信件，SHA256(JSON.stringify([scenes, letters, duels, endings])) 前 12 位。

## 收诗与格迁移

| 场／格 | poem key | 变化 |
|---|---|---|
| ch01_s03_yeting.l66 | yuxuanji_youchongzhenguan | 原格添加收诗 |
| ch02_s10_nvguan.l3 | liye_bazhi | 原格添加收诗 |
| ch03_s10_nvguan.l14 | poem_236e745594cc1f8d | 原格添加收诗 |
| ch04_s01_zhaoyang.l30 | yuxuanji_tiyinwuting | 三身份共同段的新格 |

第四章 01 原 1–28 格逐项保留，末尾追加 29–32，选项仍在正文之后；其他原格 id、文本、条件与顺序不变。第一至三章只添加 poem 属性。转换器按列名识别可选「收诗」，与「条件」「画面」共存，空列不写字段，未知诗 key 交正式校验器报错。

四个实际锚点分别核验首次阅读收录、章归属、存读档后重读不重复提示；收诗不改数值、好感、flag、关系。原有对诗奖励保留。条件未满足不收的行为由 B47 引擎回归覆盖。四首诗均沿用既有诗库，4 首 × 21 信共 84 组以诗代答按既有意象标签判定，效果与原回复定义一致，不能重复结算。

## 21 信时序

| 信件 | 分钟：旧 → 新 | 保留的触发／场次门 |
|---|---|---|
| lt_ch01_liqinghe_01 | 26 → 6 | ch01_s09_shuge 之后再过 2 场 |
| lt_ch01_peizhaoye_01 | 8 → 3 | ch01_s07_yuanye 之后再过 2 场 |
| lt_ch01_shenheng_01 | 18 → 5 | ch01_s04_shuge 之后再过 3 场 |
| lt_ch01_wenqiao_01 | 12 → 4 | ch01_s11_shishe 之后再过 1 场 |
| lt_ch02_liqinghe_01 | 26 → 6 | ch02_s24_shuge 之后再过 2 场 |
| lt_ch02_liuchenghuan_01 | 5 → 3 | ch02_s26_shuge 之后再过 1 场 |
| lt_ch02_peizhaoye_01 | 8 → 3 | ch02_s07_yuanye 之后再过 2 场 |
| lt_ch02_shenheng_01 | 15 → 5 | ch02_s04_shuge 之后再过 2 场 |
| lt_ch02_wenqiao_01 | 12 → 4 | ch02_s09_shishe 之后再过 2 场 |
| lt_ch03_liqinghe_01 | 26 → 6 | ch03_s09_yuanye 之后再过 1 场 |
| lt_ch03_peizhaoye_01 | 8 → 3 | ch03_s04_yuanye 之后再过 1 场 |
| lt_ch03_shenheng_01 | 18 → 5 | ch03_s02_shuge 之后再过 2 场 |
| lt_ch03_wenqiao_01 | 12 → 4 | ch03_s05_shishe 之后再过 1 场 |
| lt_ch04_liqinghe_01 | 16 → 6 | ch04_s02_hanyuan 之后再过 2 场 |
| lt_ch04_peizhaoye_01 | 5 → 3 | ch04_s02_hanyuan 之后再过 1 场 |
| lt_ch04_shenheng_01 | 8 → 5 | ch04_s02_hanyuan 之后再过 1 场 |
| lt_ch04_wenqiao_01 | 10 → 4 | ch04_s02_hanyuan 之后再过 2 场 |
| lt_season_chongyang_liqinghe | 5 → 3 | chongyang；好感 5；本章闲场 |
| lt_season_hanshi_shenheng | 5 → 3 | hanshi；好感 4；本章闲场 |
| lt_season_shangyuan_wenqiao | 5 → 3 | shangyuan；好感 3；本章闲场 |
| lt_season_zhongqiu_peizhaoye | 5 → 3 | zhongqiu；好感 5；本章闲场 |

逐信实跑：触发场本身不扣 N；即使时钟先走一天，场次门未过仍不送。N 场完成后开始计时，截止前 1ms 不到、截止时到；序列化后越过截止再读档送达一次。节令信另核闲场与好感门槛。承欢保持 ch02_s26 之后再过一场、再等 3 分钟。

每封信验 6 类队列，共 126 例：有 startedAt、仅 dueAt、即将到达、场次未完、已到、已回。已有起算时间按起算＋新分钟数缩短；已到／已回不回退。

**旧档例外：** 无 startedAt 的旧队列没有按历史版本重建起算时间，本轮 B47 使用 min(旧 dueAt, 当前时间＋新延迟)。不会延长旧剩余时间，但不能保证追溯扣除全部已等待时长。旧档已经读过诗锚点而尚未收诗，也不会仅凭已读列表自动补入；重读锚点获取。不得向玩家宣称旧档已自动补齐。

## 截获、迟读与图片

- 沈衡固定截获点验 pending／arrived／read／intercepted／replied 五种状态：前四种到固定场截获，已回复不再截；未读超限提前截下也不提前跳场。
- 21 信同时到达压力检查：只截剧本允许截且有去向的信，其他信保留；节令不被截。
- 承欢在接纳、归还、拒绝标记下分别跑六回法，共 18 例：反应有内容，数值／好感／flag／关系均不变，无额外跳转，重复回复不再结算。
- 121 处 image（113 个 key）、独立 cg 格 0，与 D32 完全相同；本轮无新增图片需求，也没有重做美术质量验收。图片资产替换仍以 CC3 最新报告为准。

## 检查与集成

- npm test：231/231；TypeScript：通过。
- validate-story 对准 converted 的完整五类数据：107 场、31 诗、5 对诗、21 信，0 错误、56 警告；转换问题单原有 4 条待交付项保留。
- smoke:converted：1075 条路径，107/107 场、8/8 结局；6 条推时钟路径经过截获场，3 条指定回信路径到齐，16/16 关系小场覆盖，无卡点。
- 另在真引擎烟测上逐次监听落幕，1476 次结局事件全部持有四章主线诗，章归属均为 1／2／3／4；三身份分别为受位 270、辞受 209、落选 997 次，8 结局到齐。其中 709 次对诗全输，仍全部持有四首；全输样本覆盖 7 个结局，未将其冒称为全输也覆盖 8 结局。
- 既有选项、效果、条件、去向、截获字段与回复定义全部与 D32 深比较一致；诗库、对诗、结局逐字节一致。正式 poems/endings 原文件未由本轮修改。
- CC1 接入时核格迁移与存档策略，采用本轮指纹；D32 路线报告是历史采样，不能把它的旧指纹当作 D34。
