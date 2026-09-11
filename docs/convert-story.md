# 转换交接（CC2）

> Prompt D3。转换方由 Codex 换成 CC2（指挥日志 D-025）。
> 边界：只碰 `tools/convert-story.ts`、`tests/convert.test.ts`、`src/data/converted/`、`docs/convert-*.md`。
> 不改 schema、引擎、ChatGPT 原文。需要接口的事写进问题单，由 CC1 处理。

## 第一章转完了

**18 场、31 首诗、5 局对诗、4 封信、8 个结局，0 个转换问题。** 拿 CC1 的烟测跑真引擎：18 场全部走得到，121 条路径，没有卡住的地方。

| 对象 | 数量 | 位置 |
|---|---|---|
| 场景 | 18／18 | `src/data/converted/chapters/ch01/` |
| 信 | 4／4 | `src/data/converted/letters/` |
| 对诗 | 5 | `src/data/converted/duels.json`，04 场那局含胜负两句台词 |
| 诗 | 31 | 同步到 `src/data/poems.json` |
| 结局 | 8 | 同步到 `src/data/endings.json` |

第 18 场的去向是「章末」，转成 `chapterEnd: true`（D-034），不再需要第二章的场景就能收住。

## markdown 到 JSON 的对照（D-026、D-034 新增的四条）

| 原文写法 | JSON |
|---|---|
| 台词表第六列「条件」，空 = 总是播放 | `Line.when` |
| 场景表 `\| 对诗 \| pd-01 \|` | `Scene.duel`，赢输两条去向把玩家带走 |
| 结果表第四列「她说」，写 `角色key：台词` 或只写台词 | `PoemDuel.onWin/onLose.line` |
| `\| 去向 \| 章末 \|` | `chapterEnd: true` |

第四列 story-schema 1.5 叫「她说」，C-2 现在写的是「台词」，两个列名都认。只写台词时说话人取对诗表头的「对手」，两种写法都不从中文名猜角色 key。

## 跑法

```bash
node --experimental-strip-types tools/convert-story.ts docs/C-2-第一章前六场.md docs/C-3-第一章后十二场.md docs/C-4-第一章书信.md docs/C0-2-诗词库与对诗.md docs/C-B-结局树.md
npm test && npm run validate && npm run smoke:converted
```

`--all` 读 `docs/C*.md`。退出码：0 无问题；1 有问题且已写出成功的部分；2 调用或读写失败。同一份 markdown 转两次逐字节相同。

两条写盘上的规矩：

- **问题单末尾的人工补记不会被冲掉。** `<!-- 人工补记 -->` 那一行以下原样保留，CC1、CC3 的处理记录都写在下面。
- **输入盖过上一批时，`poems/duels/endings` 按本批重写**，把改过 id 的旧条目清出去（`pd_ch01_s04_shuge` 就是这样清掉的）。只转其中一两份文件时仍然只合并。正式数据 `src/data/` 那边一律只合并，不替 CC1 删东西。

## 这一轮修的四件事（R-006 派给 CC2 的）

1. **诗库 30→31 的断言**：改成从原文表格行数推导，以后再补诗不会再红。
2. **对局重复 id**：`pd_ch01_s04_shuge` 是更早一轮留下的，现在由重写规则清掉，只剩 `pd_01`。
3. **胜负台词**：C-2 改好结果表之后转出来了，id 是 `pd_01.win` / `pd_01.lose`。
4. **两封被下限挡住的信**：CC1 把 schema 放宽到延迟 ≥ 5、隔场 ≥ 1 之后，裴照夜和温荞的信都转出来了。

## 结局数据换成了 D-028 的规则（已和 CC1 对上）

同步 C-B 的新结局之后，`tests/engine.test.ts` 里按旧规则写的两条一度变红：ChatGPT 按 D-028 把登基线的三个结局改成看第四章的行为 flag，不再看数值堆到多少，而那两条只置了 `enthroned` 和 `public_review`，于是都落到 `weijingzhizhao`。CC1 当天就按 D-028 重写了那几条，现在全绿。

转换是照 C-B 原样转的：八个结局顺序不变，最后一条判定为空兜底。数值不再决定登基线的落点，这是 D-028 要的效果，不是转换偏差。

## 另外两条留给 CC1 的小事

- **`story-schema.md` 没写「章末」。** 1.2 的场景表字段表里没有这一行，第二部分的 zod 片段也还写着 `delayMinutes: min(10)`（实际已放宽到 5）。ChatGPT 下一章照文档写就会踩空。
- **校验器跑目录时仍会报假孤儿。** 带参数跑不加载 `duels.json`，对诗出口看不见。现在第 18 场补上之后这条不再挡路，但报错数依然不能当验收依据；`npm run smoke:converted` 可以。

## 验证

- **67 项测试**（转换 50 + 引擎与存档 17）里 65 绿，2 红是上面那件 D-028 的事。`tsc --noEmit` 干净。
- **`npm run validate` 全部通过**；**`npm run smoke:converted` 18／18 场、121 条路径零卡死**。
- 新增用例覆盖：章末出口、「她说」列与角色前缀、陈旧 id 的合并与重写两种行为、人工补记不被覆盖、放宽后的信件下限、整章 18 场可达且只有一个章末。
