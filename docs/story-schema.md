# story-schema：剧情数据格式

> 这份文件是全项目的地基。ChatGPT 按第一部分交付，Codex 按第二部分转换和校验，Claude Code 按第二部分写引擎。
> 三方读同一份规范，才不会互相打架。任何一方觉得规范不够用，改这份文件，不要各自变通。

---

## 谁读哪一部分

| 你是 | 读 | 不用读 |
|---|---|---|
| ChatGPT（编剧） | **第一部分**，还有第三部分的对照示例 | 第二部分（JSON 与 zod） |
| Codex（转换） | 全部 | |
| Claude Code（引擎） | 第二、四部分 | |

**ChatGPT 只交 markdown 表格和纯文本，不写 JSON，不写 id。** 机器 id 由 Codex 生成，人写 id 一定会重复和错字。

---

# 第一部分 · ChatGPT 的交付格式

## 1.1 全局约定

- **角色一律用 key**，不用中文名。三个特殊的说话人：`self`（主角内心独白）、`narr`（旁白）、**题记**（D-063）。
- **题记**：说话人一栏写「题记」，转换出来是 `who: "tiji"`。连续几句题记会被收成一张纸，竖排、墨晕进出，不进对话框。序幕开头和第二、三章开头的短序都这么写。**一处题记三句以内**——三句写不完说明还没想清楚（剧本结构指南七点五节），多了校验器报警告。
- **地点 key 九个**：`yeting` 掖庭、`zhaoyang` 昭阳殿、`shuge` 书阁、`nvguan` 女冠观、`shishe` 诗社、`yuanye` 御花园、`hanyuan` 含元殿、`wuzibei` 无字碑、**`yilu` 驿路**（D-062，第四章行路线用）。
- **角色 key 由指挥日志 D-016 冻结，写进了 schema 的 enum**：`wuze`、`shenheng`、`peizhaoye`、`wenqiao`、`liqinghe`、`songhuizhen`、`hetaihou`、`xujinghe`、`tangjian`、`adi`、`liuchenghuan`（第十一个，D-045 加）。写别的会被校验器当场拦下。
  **冻结的意思是「不改」，不是「不加」**：加一个新 key 不动任何已有存档、结局判定或立绘；改名或删 key 才动。要加人，先在指挥日志记一条。
- **主角显示名不要写死。** 需要出现主角名字的地方写 `{名}`，引擎会替换成当时的名字（改名前是「吾则添」，改名后是玩家选的那个字）。
- **数值只有四个**：`shi`（势）、`ming`（名）、`cai`（才）、`xin`（心）。范围 0 到 20，开局各 3。
- **好感写成 `好感.角色key`**，范围 0 到 20，四档：疏 0-3、识 4-7、契 8-13、盟 14-20（D-065 把契、盟的门槛从 10、16 降到 8、14，D-078 把识从 5 降到 4）。**专属场的好感门槛只写档位下限：4、8、14**，写别的数校验器会报警告。
- **flag 写成 `flag.名字`**，只有真假两种值，名字用英文小写下划线，见名知意（`flag.took_seal`、`flag.refused_marriage`）。
- **flag 名不许出现同音撞车。** 改名 beat 的三个 flag 已经定死为 `flag.name_tian`（天）、`flag.name_zhao`（曌）、`flag.name_kept`（不改），不要再用「添」的拼音另起一个。
- **一次改动不要超过 4 点。** 数值变化太大玩家会去猜阈值，而不是去想她是谁。

## 1.2 场景表（每个场景一张）

```
### 场景 ch01-03 昭阳殿一角

| 字段 | 值 |
|---|---|
| 章 | 1 |
| 幕 | 1 |
| 地点 key | zhaoyang |
| 色板 | gold |
| 在场 | shenheng, wuze |
| 进入条件 | flag.entered_palace |
| 无用场景 | 否 |
| 对诗 | pd_songjianyue |
| 终局判定 | 否 |
| 章末 | 否 |
| 布置 | |
| 去向 | ch01-04 |
| 一句话目的 | 她第一次被上位者当作一个人试探，而不是当作一个才人清点 |
```

后三行多数场景都留空：

- **对诗**：填一个对局 id，台词读完先打这一局，再进选项。输赢的效果写在对局表里。
- **终局判定**：全游戏只填一次「是」。走到那一场就按结局表从上往下取首个满足者。别的场景要指定结局请直接写去向。
- **去向**：这一场没有选项表时，台词读完往哪走。有选项表就不要填，去向写在选项表里。

**「章末」是一章最后一场的标记（D-034、D-039 第 1 条）。** 填「是」，玩家读完这一场先看章末结算页——这一章的四项数值、已识之人、本章所得的诗——再翻页。

**章末和去向并存**，各管各的：

```
| 章末 | 是 |
| 去向 | ch02-01 |
```

翻过结算页就进 `ch02-01`。下一章还没交的时候，**去向照样写 `ch02-01`**：那一场不存在，引擎就停在结算页显示「下章待续」，校验器只报一条警告，不是错误。等第二章交上来，什么都不用改，它自己就接上了。

去向也可以留空，那就是「这一章之后没有下一章了」——终章用这个写法。

**章末场可以带选项表**（D-043）。第二章最后一场就是这样：先让玩家答一句，再出结算页。
那一问是整章最后一个由玩家出手的动作，挪到别处会削掉整章的收尾。写法见 1.4。

**「布置」这一行是场景的陈设**（D-046）。现在只有一个值：`公议`（多几张案、一面收封簿）。
空 = 平常的样子。要标的场次：第二章 11、13，第三章 08、11、12。

为什么写在场景表里而不是让美术按场景 id 列一张名单：场景 id 是从标题生成的，
而标题会改（改内容本来就该零影响）。名单等于给剧本加一道暗锁——改一句标题就悄悄少了一排案，
还没有任何东西会报错。写在这里，剧本改到哪儿它跟到哪儿。

不要在「去向」里写「章末」「第二章（待交）」「待续」这类话。
（旧稿里 `| 去向 | 章末 |` 那个写法 D-039 之后不再用，转换器仍然认它，但新交的稿子按上面写。）

**「无用场景」这一列是硬要求，不是装饰。** 每一幕至少要有一个填「是」的场景：不加数值、不推剧情、只是两个女人在一起。这条对应精神指南 2.2 节，校验工具会检查，缺了会报错。这些场景反而是玩家记住这个游戏的地方。

「一句话目的」用来自查：如果一个场景说不出目的，它就该被合并或删掉。

## 1.3 台词表

```
| # | 说话人 | 表情 | 类型 | 条件 | 台词 |
|---|---|---|---|---|---|
| 1 | narr | | 旁白 | | 砚台推过来半寸，停住。 |
| 2 | shenheng | guarded | 说 | | 才人识得这方砚么？ |
| 3 | self | | 内心 | flag.trial_recopy | （她在试我，试的是上回那卷。） |
| 4 | self | | 内心 | 非 flag.trial_recopy | （她在试我。） |
| 5 | wuze | default | 说 | | 不识。但识得用它的人。 |
```

- 表情只有三个值：`default`、`guarded`、`open`。`narr` 和 `self` 不填。
- 类型：`说` / `内心` / `旁白` / `诗`。类型「诗」的会用诗词排版（居中、加字距、放宽行高）。
- **「条件」列（D-026）**：写法同选项表的「需要」列（`flag.x`、`非 flag.x`、`cai >= 6`，多个用 `且`）。空 = 总是播放。引擎逐句求值，不满足就跳过。**同一场里按 flag 分岔的段落就这样写，条件行和无条件行按顺序混排**，不再分「入场承接 A / 承接 B / 公共正文」。
- 一句台词不超过 40 字。超了就断成两句，手机屏幕装不下。

### 1.3.1 「画面」列（D-223，B45 起，可选）

写景、写动作的那一句，图要和字**同一拍**出来——不是先读完一句，再点一下弹一张图。台词表可以多一列「画面」，填 `src/scene/cgs.ts` 里的图 key：

```
| # | 说话人 | 表情 | 类型 | 条件 | 台词 | 画面 |
|---|---|---|---|---|---|---|
| 7 | shenheng | | 说 | | 这里。 | |
| 8 | narr | | 旁白 | | 你照她指的地方伸手，一滴没接到。指背挨上窗框，沾了一条灰。 | shenheng_3_zhibei |
| 9 | wuze | | 说 | | 它知道我要接，就……往一边。 | shenheng_3_zhibei |
| 10 | shenheng | | 说 | | …… | |
```

**运行时怎么演**（引擎已经做好，写稿的人只管填 key）：

- 这一格的字和图**同时**出来，对话框压在图上照常读；**台上的立绘收起**（图里已经有人）。
- **下一格没写画面，就退回舞台**，人回来。
- **连着几格写同一个 key，图不闪**、不重铺。换一个 key：新图淡进来盖住旧图，不先空一下。
- 空镜格（`empty`）也能写画面：人下台、图铺上。
- 主角是绯、表里有这张图的绯版：自动铺绯版（D-216）。**只写原图 key**，不写 `_fei`。
- 这一格有条件没满足：整格跳过，它的画面也不出。
- 这张图第一次**真的铺出来**，才记进回廊和存档。读档读到这一格，图照样在。
- 做决定（选项）、对诗、题记、换场、结局：画面都收起。
- 点开看的事件图格（说话人写「事件图」、台词写 key）**照旧能用**，两种不冲突。已经有事件图格的地方不用改；要改成同一拍，把那一格删掉、key 挪到前后要配图的台词格的「画面」列里（**不要两种都写同一张**，会弹两次）。

**规矩**（校验器 `npm run validate` 查）：

| 情况 | 结果 |
|---|---|
| 这一列整列不写（旧稿） | 正常 |
| 一格空着 | 这一格没画面，舞台照常 |
| key 不在 `cgs.ts` 表里 | **错误**。新图先请 CC1 登记（本轮 `cgs.ts` 只由 CC1 写） |
| 写了结局图的 key | **错误**：结局图只由结局卡铺 |
| 写了 `_fei` 绯版 | **错误**：写原图 key |
| 题记格、事件图格写了画面 | **错误**：它们自己就是一整屏 |
| key 在表里、图还没上线 | 警告：这一格照常读字、舞台不换。图上线就自动有 |

**转出来的 JSON**：`"image": "<key>"`，挂在那一格上，没写就不出这个字段。转换器（CC2）只照这个接口转，不另设语义：

```json
{ "id": "ch03_s17_shuge.l8", "who": "narr", "kind": "aside",
  "text": "你照她指的地方伸手，一滴没接到。指背挨上窗框，沾了一条灰。",
  "image": "shenheng_3_zhibei" }
```

### 1.3.2 「收诗」列（D-238，B47 起，可选）

主线读到一首诗就把它收进收藏，**不用赢对诗**。台词表再多一列「收诗」，填 `src/data/poems.json` 里那首诗的 key：

```
| # | 说话人 | 表情 | 类型 | 条件 | 台词 | 画面 | 收诗 |
|---|---|---|---|---|---|---|---|
| 12 | shenheng | | 说 | | 明月松间照，清泉石上流。 | | wangwei_shanjuqiuming |
| 13 | wuze | | 说 | | 这两句我抄下来。 | | |
```

**运行时怎么算**（引擎已经做好，写稿的人只管填 key）：

- **这一格真的显示出来才收**：条件（`when`）不满足、整格被跳过，就不收。
- **同一首只收一次**：重复读到不再收，也**不再提示**。
- **提示**：第一次收到时，顶上一行小字「得诗　王维《山居秋暝》」，2.8 秒自己收。不挡对白、不挡画面中间的人，点它不影响翻页。
- **收在第几章记进存档**：章末结算页的「本章所得」读它。**读档回来不会丢**（原来只在内存里，读档就空了）。
- **老档**：以前收过的诗照旧在收藏里，但算不出是哪一章收的，章末不给它们编一个归属（D-238）。这一章没有新收的诗时，结算页写「本章尚未收录新的诗。」
- **对诗照旧**：赢了对局照样收那一首，两条路同一个收法（同一首不会收两次）。
- 一格可以同时写「画面」和「收诗」。

**规矩**（`npm run validate` 查）：

| 情况 | 结果 |
|---|---|
| 这一列整列不写（旧稿） | 正常 |
| key 不在 `src/data/poems.json` 里 | **错误** |
| 题记格、事件图格写收诗 | **错误**：收诗要落在玩家读到的那一句上 |

**转出来的 JSON**：`"poem": "<key>"`，挂在那一格上，没写就不出这个字段：

```json
{ "id": "ch01_s06_shuge.l12", "who": "shenheng", "kind": "say",
  "text": "明月松间照，清泉石上流。", "poem": "wangwei_shanjuqiuming" }
```

## 1.4 选项表

```
| # | 选项文本 | 需要 | 效果 | 去向 | 备注 |
|---|---|---|---|---|---|
| A | 如实说不识 | | xin +1, 好感.shenheng +2 | ch01-04a | |
| B | 顺着砚台谈虞世南的书法 | cai >= 6 | cai +2, ming +1, 好感.shenheng +4 | ch01-04b | 不满足时提示「才 不足」 |
| C | 把砚推回去 | | 好感.shenheng -1, flag.pushed_back = 真 | ch01-04c | 不可逆，会亮朱砂 |
```

- **「需要」列的写法**：`cai >= 6`、`好感.shenheng >= 10`、`flag.took_seal`、`非 flag.refused_marriage`。多个条件用 `且` 连接。
- 条件不满足时选项不隐藏，转清墨并标出缺什么。**不给理由的灰选项是在惩罚玩家，不是在设计。**
- 「备注」列写不可逆、写朱砂、写任何给 Claude Code 的提示。
- **章末场的选项，去向写 `章末`**（D-043）。意思是：结算这个选项的效果 → 章末结算页 → 场景级的去向。
  这一场的场景表仍旧照 D-039 写 `| 章末 | 是 |` 和 `| 去向 | ch03-01 |`，两处各管各的。
  只在标了章末的场里能这么写；别的场景写了去向为空就是死路，校验器会拦。

## 1.5 对诗对局表

```
### 对诗 pd-01 · 场景 ch01-06 · 对手 shenheng

| 字段 | 值 |
|---|---|
| 出句 | 明月松间照 |
| 出处 | 王维《山居秋暝》 |
| 难度 | 1 |
| 题面 | 接五字句：自然物、处所、动作三层相应；末字用平声。 |
| 判题重点 | 词组结构、句脚；不要求玩家背整首 |

| 选项 | 对句 | 对错 | 为什么 |
|---|---|---|---|
| A | 清泉穿石冷 | 错 | 末字「冷」为上声，未满足题面要求的平声句脚。不是泉水这个意象本身不合 |
| B | 清泉石上流 | 对 | 「清泉／石上／流」与「明月／松间／照」三层相应，「流」是平声，也正是原诗的对句 |
| C | 昨夜有归舟 | 错 | 「昨夜」是时间，「有归舟」是存在叙述，没有按题面把自然物、处所、动作逐层对应 |
| D | 清泉石上长流 | 错 | 六个字，多了一个「长」，不满足本局五字句的字数与节奏限制 |

| 结果 | 效果 | 去向 | 她说 |
|---|---|---|---|
| 赢 | cai +3, 好感.shenheng +4 | ch01-07win | shenheng：接得好。方才那句话，我仍不同意。 |
| 输 | xin +1, 好感.shenheng +1 | ch01-07lose | shenheng：这句不合题。方才的话，可没因此算你输。 |
```

- **「她说」列（D-026）**：胜负各自一句专属台词，格式 `角色key：台词`，可空。判题页摊完四个理由之后，这一句由普通对话框播出，玩家点一下再往下走。它是人物的话，不是判题解释，两者不混。
- **对诗可以是一场的出口**：场景表写 `| 对诗 | pd-01 |`，赢和输的「去向」各自把玩家带走。这种场景可以没有选项表，但**两条去向都必须填**。
- **第四列是台词，不是散文。** 表头写「她说」或「台词」都认。赢一句、输一句，各自由对手在普通对话框里说出来——不要把胜负反馈写在判题页的解释里，那是教学，这是戏。写成 `shenheng：接得好。` 可以指定说话人，不写说话人就默认是表头那个对手。

**「题面」这一行是这套题的关键，不是装饰。** 题面写明本局限定了什么（几个字、哪个字位的平仄、末字平仄、不许引入什么），错项就是「没满足写明的限制」，而不是「意境不对」这种说不清的判词。没有题面，四个选项里往往不止一个在文学上成立，玩家答错了也不服。

**「为什么」这一列必须指回题面。** 这是游戏唯一的教学环节，玩家答错时看到的就是这句话。写不出具体理由的错项说明这个题目本身有问题，换一个。校验器会拦下用「意境不对」「感觉不对」这类词的错项。

**两条不能当作通则的东西**（这一版据 C0-2 的意见更正，此前的示例写错了）：

- **对仗不是一概禁止重字。** 李冶《八至》通篇反复「至」就是修辞。要禁重字，得在题面里写明这一局禁。
- **山水诗不是不许写人。** 《山居秋暝》原诗后半就有「竹喧归浣女，莲动下渔舟」。用「出现了人所以意象冲突」判错是错的。

**输不是死路。** 输了走另一条对话分支，而且也给一点好感（对方欣赏她敢接），这对应精神指南 2.2 节的「允许失败」。

## 1.6 结局表

```
| 字段 | 值 |
|---|---|
| 结局 key | wuzibei |
| 标题 | 无字之碑 |
| 判定 | shi >= 14 且 xin >= 12 且 flag.name_tian |
| 色板 | ink |
| 主题 | 她把评价权留给后人，拒绝被任何人定义 |
| 正文 | （两百字左右） |
```

四条硬要求：

1. **判定条件用数值阈值和 flag 表达，不要用文学化描述。** 「如果她已经足够坚定」没法执行。
2. **至少一个不登基但更好的结局，至少一个「她选择不要」的结局。** 登基不是通关，这是 D-002 的红线。
3. **如果这个结局是「她变成了她推翻的那个人」（势高心低），色板填 `gold`。** 画面回到金碧就是判词，正文里不用再说破。
4. **判定里不许出现 `flag.name_tian` / `name_zhao` / `name_kept`。** 这是 D-020：改名三选通向的是不同的自我命名方式，不是好坏分级。一旦拿它当门槛，改名那一幕就有了「正确答案」，整个 beat 就废了。校验器会当场拦下。

判定按表格顺序从上往下取第一个满足的，**所以最后一个结局的判定必须留空**，作为兜底。除最后一条之外，任何一条判定留空都会吃掉它后面所有的结局，校验器也会拦。

### 1.6.1 登基结局要写三段正文

登基之后的名字是玩家亲手选的，结局卡不能对此毫无反应（R-003）。所以**要求 `flag.enthroned` 的结局，正文写三段变体**，格式是三行而不是一行：

```
| 正文 · 天 | （选「天」时读到的这一版） |
| 正文 · 曌 | （选「曌」时读到的这一版） |
| 正文 · 不改 | （选不改时读到的这一版） |
```

三段的主体可以一样，差别落在名字出现的那一两句上。三段之间**不分高下**，不要写成「选天最圆满、不改最遗憾」。

非登基结局只写一行 `| 正文 |`，因为改名只发生在登基线上，那些结局拿不到 name_* ，读不到变体。这两条校验器都会查。

## 1.7 改名 beat

全游戏只有一处，格式单独说明。

```
### 改名 ch03-18

| 字段 | 值 |
|---|---|
| 候选 | 天 / 曌 / 不改 |
| 天 · 含义 | 我即为天。她给自己的名字 |
| 天 · 通向 | 结局判定加 flag.name_tian |
| 曌 · 含义 | 日月当空。造一个字，连字本身都是新的 |
| 曌 · 通向 | flag.name_zhao |
| 不改 · 含义 | 她留下别人给的名字，但意思由她定 |
| 不改 · 通向 | flag.name_kept |
```

「添」是别人给她的名字，添丁、添福、锦上添花，一个被期待去增补别人的女人。「天」是她给自己的名字。**这一幕写成她第一次自己命名自己，不是加冕的炫耀。**

## 1.8 信件表（笺系统）

机制见 `机制设计-v1.md` 第 1 节。信不是额外内容，是这个世界里关系真正发生的地方——唐代宫中不能随便见面，信是唯一能穿过墙的东西。

### 1.8.1 场景表要加一列

哪一场戏结束时她「有话没说完」，就在那一场的场景表里加一行：

```
| 留信 | shenheng |
```

一场可以留多封（写成 `shenheng, wenqiao`），也可以不留。**同游场景必须留信**，写的是她没当面说的那句。

### 1.8.2 信件表

```
### 信 lt-ch01-shenheng-01

| 字段 | 值 |
|---|---|
| 发信人 | shenheng |
| 触发 | 场景 ch01-06 之后第 3 场 |
| 节气 | （空。节气信才填：上元 / 寒食 / 七夕 / 中秋） |
| 笺 | 黄麻纸 |
| 明面 | （她信上真的写了的话，三到五句） |
| 引诗 | 鱼玄机《游崇真观南楼》· 自恨罗衣掩诗句 |
| 引诗要说的 | （这句诗在这封信里替她说了什么，一句话） |
| 空白 | （她没写的。玩家点信纸空白处，主角内心独白，两三句） |
| 她可能不回 | 好感.shenheng < 5 |
| 会被截 | 是 |
| 截获场景 | ch02-11 |
| 被截去向 | ch02-11 |

| 回信 | 内容 | 效果 | 去向 |
|---|---|---|---|
| 直言 A | （回信文本） | 好感.shenheng +2 | |
| 直言 B | （回信文本） | xin +1 | |
| 直言 C | （回信文本） | 好感.shenheng -1 | |
| 以诗代答 · 合意象 | 不甘, 才名 | 好感.shenheng +4, cai +1 | |
| 以诗代答 · 不合 | | 好感.shenheng +1 | |
| 不回 | | 好感.shenheng -1, flag.silent_to_shenheng = 真 | |

| 回信 | 她的反应 |
|---|---|
| 直言 A | （她下次见面第一句话） |
| 以诗代答 · 合意象 | （她读到那句诗之后的反应） |
| 不回 | （不回也是回答。她会记得） |
```

### 1.8.2.1 附页表（一封信、几段正文）

一封信在不同路线上说不同的话（D-044）。这不是几封信，是一封——拆开的话，
案上会多出几封根本不存在的信。明面和引诗照旧，永远显示；附页按当时的 flag 各取一段。

```
| 附页 | 条件 | 正文 | 宣读 |
|---|---|---|---|
| 公共 | | （谁都看得到的那一段） | |
| 取印 | flag.took_seal | （只有拿了印的人看得到） | 是 |
| 末句 | | （尚未宣读的末句） | 否 |
```

- **条件**列写法同选项表的「需要」列，空 = 总是出现。顺序就是表格里的顺序。
- **宣读**列填 是／否，空 = 是。它决定这一段在**信被截、当众念出来**的时候会不会被念到。

填「否」的那一段是整封信的戏眼：**被截的伤害不在于念了什么，在于她还有一句
没来得及给你，而所有人都听见了前面那些。** 丢掉这一列，这封信就只是一次剧情事故。

### 1.8.3 五条写信规则

1. **三层结构缺一不可。** 明面、引诗、空白。「空白」那一层是这套机制的核心：她没写的话比写了的更重要，玩家点一下空白处才看得到主角怎么猜。只写明面的信会被退回。
2. **引诗必须是唐及唐以前**，见 tone-bible 第六节。诗从 `C0-2-诗词库与对诗.md` 里挑，写清楚是哪首哪句。
3. **「以诗代答 · 合意象」那一行填的是意象标签，不是具体某首诗。** 玩家从图鉴里挑任意一首，只要标签命中就算合。这样诗词库越大玩家的表达空间越大，而不是猜一个正确答案。
4. **她可以不回。** 「她可能不回」那一列写条件。好感低，或者主角在朝堂上做了她反对的事，信就石沉大海，直到当面把话说开。关系是双向的，不是进度条。
5. **第二幕至少一封信要被截并在朝堂上念出来。** 「会被截」填是，「被截去向」填那个朝廷场景。这是 tone-bible 「关系有政治后果」最直接的实现，也让玩家写信时真的会掂量。

**「截获场景」这一列是钉死的截获点（D-039 第 2 条）。** 填了它，玩家一走进那一场，这封信不管还在路上、还是到了没读、还是读了没回，一律当场被截，然后进「被截去向」。

为什么要钉死：不填的话，被截与否取决于真实延迟和案上未读了几封——快的人早就读完回完了，慢的人还没收到。可这封信被当众展开是第二幕的支点，不能看运气。

两个规矩：**「会被截」必须同时填是**（两处别打架，校验器会拦）；**已经回过的信不再被截**——她要是已经把话说完了，那一幕就变成重复交代一件玩家处理完的事。

「被截去向」通常就填截获场景本身：信是在那一场被展开的，人本来就在那里。

**两个下限（R-006 放宽过一次）**：「延迟分钟」5 到 180，「之后第 N 场」N 取 1 到 4。军中素笺本来就该快——裴照夜隔一场、过五分钟就到，是对的。再短就不像「过了一会儿」，像系统弹窗。

### 1.8.4 每个角色的笺

笺本身进图鉴，所以要固定，不要一封一个样。

| 角色类型 | 笺 | 送信快慢 |
|---|---|---|
| 女官 | 秘书省黄麻纸 | 中 |
| 女将 | 军中素笺 | 快 |
| 公主 | 泥金笺 | 慢，信要绕道 |
| 女诗人 | 自制花笺 | 中 |
| 其他 | 常笺 | 中 |

---

# 第二部分 · 机器格式

## 2.1 场景 JSON

```json
{
  "id": "ch01_s03_zhaoyang",
  "chapter": 1,
  "act": 1,
  "scene": "zhaoyang",
  "palette": "gold",
  "bgm": "bgm/court_quiet.mp3",
  "cast": ["shenheng", "wuze"],
  "require": { "flag.entered_palace": true },
  "weightless": false,
  "purpose": "她第一次被上位者当作一个人试探",
  "lines": [
    { "id": "ch01_s03.l1", "who": "narr", "kind": "aside", "text": "砚台推过来半寸，停住。" },
    { "id": "ch01_s03.l2", "who": "shenheng", "expr": "guarded", "kind": "say", "text": "才人识得这方砚么？" },
    { "id": "ch01_s03.l3", "who": "self", "kind": "inner", "text": "（她在试我。）" }
  ],
  "choices": [
    {
      "id": "ch01_s03.cA",
      "text": "如实说不识",
      "effects": { "xin": 1, "affinity.shenheng": 2 },
      "goto": "ch01_s04a"
    },
    {
      "id": "ch01_s03.cB",
      "text": "顺着砚台谈虞世南的书法",
      "require": { "cai": { "gte": 6 } },
      "lockHint": "才 不足",
      "effects": { "cai": 2, "ming": 1, "affinity.shenheng": 4 },
      "goto": "ch01_s04b"
    },
    {
      "id": "ch01_s03.cC",
      "text": "把砚推回去",
      "irreversible": true,
      "effects": { "affinity.shenheng": -1, "flag.pushed_back": true },
      "goto": "ch01_s04c"
    }
  ]
}
```

`irreversible` 为真时，选中的一瞬间亮朱砂。在 `palette: "gold"` 的场景里，这是整屏唯一的红。

## 2.2 zod schema（Codex 用这个校验）

```ts
import { z } from "zod";

const StatKey = z.enum(["shi", "ming", "cai", "xin"]);
const Cmp = z.object({
  gte: z.number().optional(), lte: z.number().optional(),
  gt: z.number().optional(),  lt: z.number().optional(),
  eq: z.number().optional(),
});

/** 条件：键是 "cai" | "affinity.<key>" | "flag.<name>"；值是比较式或布尔 */
const Condition = z.record(z.string(), z.union([Cmp, z.boolean()]));

/** 效果：数值键是增量（可负），flag 键是绝对值 */
const Effects = z.record(z.string(), z.union([z.number(), z.boolean()]));

const Line = z.object({
  id: z.string(),
  who: z.string(),                                   // 角色 key | "self" | "narr"
  expr: z.enum(["default", "guarded", "open"]).optional(),
  kind: z.enum(["say", "inner", "aside", "poem"]).default("say"),
  text: z.string().max(40, "一句台词不超过 40 字，手机装不下"),
});

const Choice = z.object({
  id: z.string(),
  text: z.string().max(24),
  require: Condition.optional(),
  lockHint: z.string().optional(),                   // 条件不满足时显示的原因
  effects: Effects.optional(),
  irreversible: z.boolean().default(false),
  goto: z.string(),
});

export const Scene = z.object({
  id: z.string(),
  chapter: z.number().int(),
  act: z.number().int().min(1).max(4),              // D-066：第四章是第四幕
  scene: z.enum(["yeting","zhaoyang","shuge","nvguan","shishe","yuanye","hanyuan","wuzibei","yilu"]),
  palette: z.enum(["ink", "gold"]),
  bgm: z.string().optional(),
  cast: z.array(z.string()),
  require: Condition.optional(),
  weightless: z.boolean().default(false),
  /** 这一场结束时谁「有话没说完」。对应场景表的「留信」一列。同游场景必须非空。 */
  leavesLetter: z.array(z.string()).default([]),
  purpose: z.string().min(1, "说不出目的的场景应该被合并或删掉"),
  lines: z.array(Line).min(1),
  duel: z.string().optional(),                       // 台词读完先打一局对诗
  judgeEnding: z.boolean().optional(),               // 按结局表判定，全游戏一处
  chapterEnd: z.boolean().optional(),                // 章末结算页（D-034）；可与 goto 并存（D-039）、可带选项（D-043）
  dressing: z.string().optional(),                   // 场景陈设，现在只有 "gongyi"（D-046）
  choices: z.array(Choice).optional(),
  goto: z.string().optional(),                       // 无选项时的线性去向
  ending: z.string().optional(),                     // 直接进结局
}).refine(
  s => !!(s.choices?.length || s.goto || s.ending || s.judgeEnding || s.duel || s.chapterEnd),
  "场景必须有出口：choices、goto、ending、judgeEnding、duel、chapterEnd 六者至少一个，否则玩家会卡死在这里"
);

// chapterEnd 与 ending / judgeEnding 互斥：章末是翻页，结局是落幕。
// chapterEnd 的 goto 指向下一章第一场；没写、或那一场还不存在，就停在结算页显示「下章待续」。
// Letter 另有 interceptAt：走进那一场就强制截信（D-039 第 2 条）。
// 这一段是摘录，以 src/engine/schema.ts 为准。

export const PoemDuel = z.object({
  id: z.string(),
  title: z.string(),
  sceneId: z.string().optional(),                    // 场景定稿时再绑
  opponent: CharacterKey.optional(),
  prompt: z.string(),                                // 出句
  poemRef: z.string(),                               // 出句来自诗词库哪一首
  brief: z.string(),                                 // 给玩家的题面：本局限定了什么
  judgingFocus: z.string(),
  difficulty: z.number().int().min(1).max(3),
  options: z.array(z.object({
    key: z.string().length(1),
    text: z.string(),
    correct: z.boolean(),
    why: z.string().min(10, "错项必须说得出理由，这是游戏唯一的教学环节"),
  })).length(4),
  onWin:  z.object({ effects: Effects.optional(), goto: z.string().optional() }).optional(),
  onLose: z.object({ effects: Effects.optional(), goto: z.string().optional() }).optional(),
}).refine(o => o.options.filter(x => x.correct).length === 1, "有且只有一个正确对句");

export const Ending = z.object({
  key: z.string(),
  title: z.string(),
  require: Condition.optional(),                     // 留空 = 兜底
  palette: z.enum(["ink", "gold"]),
  theme: z.string(),
  body: z.string(),
  card: z.string().optional(),
});

export const RenameBeat = z.object({
  id: z.string(),
  candidates: z.array(z.object({
    char: z.string().length(1),
    meaning: z.string(),
    effects: Effects,
  })).min(2),
});
```

## 2.2.1 剧本结构版本 `DATA_VERSION`（D-037 第 3 条）

存档记的是「哪一场、第几句」。剧本一改行数，旧档里那个句号就指到别的话上去了——
玩家读到的是一段接不上的对白，而且没有任何提示告诉她发生了什么。

所以 `src/engine/types.ts` 里有一个整数 `DATA_VERSION`，写进每一份存档。

**什么时候 +1**：改了场景 id、增删场景、增删或重排任何一场的台词行。
只改字、不改行数不用动。忘了 bump 的代价是老玩家读到错位的台词；
多 bump 一次的代价只是她回到本章开头。两者不对称，**拿不准就 bump**。

版本对不上时引擎做三件事：位置退回该章开头（章首认的是「没有同章场景指向它」的那一场，
不是 id 最小的那场）；数值、好感、flag、收到的诗、案上的信**全部保留**；
顶上出一条不会自己消失的提示，说清楚重来的是哪一章、保住的是什么。

> 定义放在 `types.ts` 而不是 `schema.ts`，因为 `schema.ts` 依赖 zod。
> 运行时从那边取任何一个值，整个 zod 都会被打进玩家下载的包里（实测 +62 KB）。
> `schema.ts` 把它再导出一次，文档上那里仍是它的家。`tools/check-bundle.ts` 每次构建都查这条。

## 2.3 存档结构

```ts
export const SaveV1 = z.object({
  version: z.literal(1),
  savedAt: z.number(),                               // epoch ms
  sceneId: z.string(),
  lineIndex: z.number().int(),                       // 存到具体哪一句，不是存到章
  stats: z.object({ shi: z.number(), ming: z.number(), cai: z.number(), xin: z.number() }),
  affinity: z.record(z.string(), z.number()),
  flags: z.record(z.string(), z.boolean()),
  protagonistName: z.string(),                       // 快照，不是渲染时查全局
  seenLineIds: z.array(z.string()),                  // skip 只跳读过的
  poemsCollected: z.array(z.string()),
  endingsUnlocked: z.array(z.string()),
  /** 信箱。真实时间延迟靠 dueAt 这个时间戳，见 2.4 */
  letters: z.array(z.object({
    id: z.string(),
    state: z.enum(["pending", "arrived", "read", "replied", "intercepted", "lost"]),
    dueAt: z.number(),                               // epoch ms，到点才算送达
    repliedWith: z.string().nullable().default(null),
  })).default([]),
  /** 上次关掉游戏的时刻。回来时用它算这段时间里有哪些信到了 */
  lastSeenAt: z.number(),
});
```

五条要点，前四条来自已装的 `save-systems` 和 `visual-novel` 技能，都吃过亏：

1. **`version` 从第一天就有。** 第一次改剧情结构时，没有版本号的旧存档就是一堆猜谜。迁移函数写成 `v -> v+1` 的纯函数链。
2. **随处可存。** 存 `sceneId` 加 `lineIndex`，不是存章节检查点。视觉小说的玩家期望读档回到同一句话。
3. **`protagonistName` 存的是当时的快照。** 改名前的存档回看仍显示「添」，这是叙事要求，不是实现细节。
4. **`seenLineIds` 决定 skip 的范围。** 只跳读过的文本，否则玩家会一路跳过没看过的内容然后抱怨没剧情。
5. **信箱存的是 `dueAt` 绝对时间戳，不是剩余分钟数。** 存倒计时的话，关掉游戏这段时间就白等了，等于变相要求玩家挂着——那正是我们不做的东西。存绝对时间，关多久信就走多久。

存档写 localStorage。`save-systems` 里那套临时文件加重命名的原子写是文件系统语境，这里不适用；对应的做法是写之前先把旧值抄进 `<slot>.bak`，解析失败时回退。

## 2.4 信件 JSON 与 zod

```json
{
  "id": "lt_ch01_shenheng_01",
  "from": "shenheng",
  "trigger": { "kind": "scene", "sceneId": "ch01_s06_shuge", "afterScenes": 3 },
  "delayMinutes": 18,
  "paper": "huangma",
  "body": {
    "surface": "……砚是虞世南旧物，你既说识得用它的人，便该识得它的来处。",
    "poem": { "ref": "yuxuanji_youchongzhenguan", "line": "自恨罗衣掩诗句" },
    "poemMeans": "她在说自己也曾被一身衣裳挡住过",
    "blank": "（她把这一句抄在最后，抄完又空了三行。三行能写很多字。）"
  },
  "sheMayNotReply": { "affinity.shenheng": { "lt": 5 } },
  "interceptable": true,
  "onIntercept": { "goto": "ch02_s11_zhaoyang" },
  "replies": {
    "plain": [
      { "id": "a", "text": "来处我不问，用处我记住了。",
        "effects": { "affinity.shenheng": 2 }, "reaction": "她下次见你，先开口。" },
      { "id": "b", "text": "我识得的是你。",
        "effects": { "xin": 1 }, "reaction": "她没接这句，但把砚留下了。" },
      { "id": "c", "text": "秘书省的纸，写这个太贵。",
        "effects": { "affinity.shenheng": -1 }, "reaction": "她此后只写公文体。" }
    ],
    "poem": {
      "resonantTags": ["不甘", "才名"],
      "onResonant": { "effects": { "affinity.shenheng": 4, "cai": 1 },
                      "reaction": "她把你抄的那句压在砚下，压了很久。" },
      "onMismatch": { "effects": { "affinity.shenheng": 1 },
                      "reaction": "她说：好诗。只说了这两个字。" }
    },
    "silence": { "effects": { "affinity.shenheng": -1, "flag.silent_to_shenheng": true },
                 "reaction": "她再没提过那方砚。" }
  }
}
```

```ts
const SolarTerm = z.enum(["shangyuan", "hanshi", "qixi", "zhongqiu"]);

const LetterTrigger = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("scene"),
    sceneId: z.string(),
    afterScenes: z.number().int().min(2).max(4),      // 过 2 到 4 场戏才送来
  }),
  z.object({
    kind: z.literal("solarTerm"),
    term: SolarTerm,
    minAffinity: z.number().int().default(5),         // 好感到「识」才收得到
  }),
]);

const ReplyOutcome = z.object({
  effects: Effects.optional(),
  reaction: z.string().min(1, "每种回信都要有她的反应，否则回信就是没有后果的按钮"),
  goto: z.string().optional(),
});

export const Letter = z.object({
  id: z.string(),
  from: z.string(),
  trigger: LetterTrigger,
  /** 真实时间延迟。角色不同速度不同：女将快，公主要绕道。下限 5（R-006） */
  delayMinutes: z.number().int().min(5).max(180),
  paper: z.enum(["huangma", "junzhong", "nijin", "huajian", "chang"]),
  body: z.object({
    surface: z.string().min(1),                       // 明面上说的事
    poem: z.object({ ref: z.string(), line: z.string() }).optional(),
    poemMeans: z.string().optional(),                 // 这句诗替她说了什么
    blank: z.string().min(1),                         // 她没写的。点空白处才看得到
  }),
  /** 满足这个条件时，玩家的回信石沉大海，直到当面把话说开 */
  sheMayNotReply: Condition.optional(),
  interceptable: z.boolean().default(false),
  onIntercept: z.object({ goto: z.string() }).optional(),
  replies: z.object({
    plain: z.array(ReplyOutcome.extend({
      id: z.string(), text: z.string().max(30),
    })).length(3),
    poem: z.object({
      resonantTags: z.array(z.string()).min(1),       // 意象标签，不是指定某一首
      onResonant: ReplyOutcome,
      onMismatch: ReplyOutcome,
    }),
    silence: ReplyOutcome,                            // 不回也是回答
  }),
}).refine(
  (l) => !l.interceptable || !!l.onIntercept,
  "会被截的信必须写明被截之后去哪一场"
);
```

### 三条实现要点

**不堆积。** 未读上限 3 封。第 4 封到达时，最旧的一封转成 `intercepted`，跳它的 `onIntercept`。这不是惩罚，是剧情：宫里有人在看你的信。

**不绑架。** 玩家回来时，把 `lastSeenAt` 到现在之间所有 `dueAt` 已过的信一次性送达，一封不少。任何内容都不会因为「没登录」而错过。节气信错过了明年还有，诗词图鉴里会留一句「那年上元，有一封信没送到」。

**节气日期必须打表，不能算。** 上元（正月十五）、七夕（七月初七）、中秋（八月十五）都是农历，公历日期逐年不同；寒食在清明前一两日，清明是节气可以算，但和另外三个不是一套历法。为这个引一个农历库不值得，Codex 出一张 2026 到 2032 年的日期表就够了，七年之后这个游戏要么早已经改版要么已经没人玩。

---

# 第三部分 · 从 markdown 到 JSON 的对照

Codex 的转换规则，一一对应，不要发挥。

| ChatGPT 写的 | 转成 |
|---|---|
| 表头「场景 ch01-03 昭阳殿一角」 | `id: "ch01_s03_zhaoyang"`，短横改下划线，序号补零，尾部接地点 key |
| 台词表第 n 行 | `lines[n-1]`，`id` 自动生成为 `<sceneId>.l<n>` |
| 选项表第 A 行 | `choices[0]`，`id` 自动生成为 `<sceneId>.cA` |
| 类型「说 / 内心 / 旁白 / 诗」 | `kind: "say" / "inner" / "aside" / "poem"` |
| `cai >= 6` | `require: { cai: { gte: 6 } }` |
| `好感.shenheng >= 10` | `require: { "affinity.shenheng": { gte: 10 } }` |
| `非 flag.refused_marriage` | `require: { "flag.refused_marriage": false }` |
| `cai +2, ming +1` | `effects: { cai: 2, ming: 1 }` |
| `flag.took_seal = 真` | `effects: { "flag.took_seal": true }` |
| 备注含「不可逆」 | `irreversible: true` |
| 台词表「条件」列 | `lines[n].when`，写法同 require |
| 对诗表「她说」列 `shenheng：……` | `onWin.line` / `onLose.line`，一个完整的 Line（id 由转换器生成 `<duelId>.win` / `<duelId>.lose`） |
| 场景表「对诗」行 | `duel: "<duelId>"`，赢输的 goto 即出口 |
| 场景表「章末 \| 是」 | `chapterEnd: true`。和 `goto` 并存：先结算页，再进 goto（D-039 第 1 条） |
| 场景表「去向 \| 章末」（旧写法） | 同上，但不生成 goto。新稿子不要再这么写 |
| 信件表「截获场景」 | `interceptAt: "<sceneId>"`，要求同时有 `interceptable: true` 和 `onIntercept.goto`（D-039 第 2 条） |
| 选项表「去向 \| 章末」 | `Choice.goto` 留空。只有标了章末的场景允许（D-043） |
| 场景表「布置 \| 公议」 | `dressing: "gongyi"`（D-046 第 2 条） |
| 信件附页表 | `body.pages: [{ key, when?, text, readAloud }]`，「宣读」列空 = `true`（D-044） |
| 无用场景「是」 | `weightless: true` |
| 场景表的「留信 \| shenheng」 | `leavesLetter: ["shenheng"]` |
| 信件表头「信 lt-ch01-shenheng-01」 | `id: "lt_ch01_shenheng_01"` |
| 触发「场景 ch01-06 之后第 3 场」 | `trigger: { kind: "scene", sceneId: "ch01_s06_...", afterScenes: 3 }` |
| 节气「七夕」 | `trigger: { kind: "solarTerm", term: "qixi" }` |
| 笺「黄麻纸 / 军中素笺 / 泥金笺 / 自制花笺 / 常笺」 | `paper: "huangma" / "junzhong" / "nijin" / "huajian" / "chang"` |
| 「以诗代答 · 合意象」那一格的标签 | `replies.poem.resonantTags` |
| 「她可能不回」 | `sheMayNotReply`，写法同 require |
| 「会被截」是 + 「被截去向」 | `interceptable: true` 加 `onIntercept.goto` |
| `{名}` | 保留原样，引擎运行时替换 |

**id 由 Codex 生成，ChatGPT 不写 id。** 人写 id 一定会重复和错字，而机器生成的 id 天然唯一且可回溯到出处。

关于 line id 的一句说明：按 D-005 我们只做中文，本来可以直接内联文本、不要 id。仍然给每句配 id，是因为存档要记「读到哪一句」、skip 要记「哪些读过」、诗词图鉴要记「收过哪一句」，这三件事都需要一个稳定的句级标识。顺带把日后抽字符串表做外语版的路留着了，代价接近于零。

---

# 第四部分 · 校验工具要查什么

`tools/validate-story.ts` 的检查清单。前四条是硬错误，后五条是警告。

校验器已实现，跑法：

```bash
npm run validate        # 查真实数据
npm run validate:demo   # 拿一份故意写错的文件演示报错长什么样
npm run graph           # 导出 docs/story-graph.md
npm test                # 引擎单测：数值夹取、flag 互斥、结局判定顺序与变体
npm run build           # validate + test + 类型检查 + 打包，任何一步不过就停
npm run build:artifact  # 再压成一份单文件 HTML，用来发 Artifact 或 itch.io
```

`npm run build` 会先跑 validate，硬错误直接挡住构建。

**硬错误（不通过就不能进构建）**

1. **schema 不合法**，任何一条 zod 规则不过。
2. **死路**：`goto` 指向不存在的场景 id；或场景没有任何出口。这一条对着原始 JSON 里的 id 查，不对着通过校验的场景查——否则一份文件的形状错误会把它的断链一起藏起来，也会让指向它的场景全都报假错。
3. **孤儿**：从开场走不到的场景。
4. **结局不可达**：有结局的判定条件在任何一条路径上都无法满足。这条要靠遍历所有路径的数值上下界来算，不能只看有没有引用。

**警告（要人看一眼）**

5. **某一幕没有 `weightless: true` 的场景。** 对应精神指南 2.2，这是我们最容易在赶工时丢掉的东西，所以让机器盯着。
6. **某个对诗的错项 `why` 少于 10 个字。** 敷衍的理由等于没有理由。
7. **单次数值改动超过 4 点。**
8. **`palette: "gold"` 的场景里有 `irreversible: true` 之外的朱砂引用。** 金碧板没有红，见 art-style。
9. **某个角色连续三个场景没出现却仍在 `cast` 里。**

**结局与 flag 相关**

10. 硬错误：最后一个结局的判定不为空，或者中间某个结局的判定为空。
11. 硬错误：任何结局的判定里出现 `flag.name_*`（D-020）。
12. 硬错误：非登基结局写了三段变体（拿不到 name_* ，读不到）。
13. 警告：登基结局只写了一段正文。
14. 硬错误：同一个选项同时把两个互斥的 flag 置真（互斥表见 C-B 结局树第四节，已编码进 `src/engine/types.ts` 的 `FLAG_CONFLICTS`）。
15. 警告：某个 flag 有地方置真，但全剧本没有任何地方置真它依赖的前置 flag。
16. 警告：有多于一个场景标了终局判定。C-B 约定终局快照只取一次。

引擎在运行时也守着互斥表：一个 flag 置真会把与它冲突的那些清掉，并在控制台 warn 出来。选择清掉而不是报错退出，是因为一份已经存在的档里同时挂着登基和拒位，会让结局判定取到错的那一个，玩家看到的是一个和自己经历对不上的结尾；清掉能自愈，warn 保证作者看得见。

**信件相关**

17. 硬错误：`leavesLetter` 里的角色 key 不存在，或者没有任何一封信的 `trigger.sceneId` 指向这一场。留了信却没写信是最容易漏的。
18. 硬错误：`interceptable` 为真但 `onIntercept.goto` 指向不存在的场景。
19. 硬错误：`replies.plain` 不是三条。
20. 警告：某封信的 `body.blank` 少于 15 个字。三层结构里「她没写的」那一层最容易被敷衍成一句话。
21. 警告：整个第二幕没有一封 `interceptable` 的信。tone-bible 要求关系有政治后果，这是它的实现。
22. 警告：某个同游场景的 `leavesLetter` 是空的。同游结束必定来信，写的是她没当面说的那句。
23. 警告：`body.poem` 引的诗不在诗词库里，或者诗词库里标了它是唐以后的。

分支图 `docs/story-graph.md` 由 CC2 的转换器每次转换后重画（D-063），读转换产物、从序幕起画三章。`npm run graph` 就是跑一次完整转换。

---

## 附：字段速查

| 概念 | markdown 列 | JSON 字段 |
|---|---|---|
| 势 | `shi` | `stats.shi` |
| 名 | `ming` | `stats.ming` |
| 才 | `cai` | `stats.cai` |
| 心 | `xin` | `stats.xin` |
| 好感 | `好感.<key>` | `affinity.<key>` |
| 标记 | `flag.<name>` | `flags.<name>` |
| 主角内心 | `self` | `who: "self"` |
| 旁白 | `narr` | `who: "narr"` |
| 主角名占位 | `{名}` | 运行时替换 `protagonistName` |
