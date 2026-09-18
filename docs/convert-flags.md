# flag 体检

> 由 `tools/convert-story.ts` 在每次转换后生成，读的是 `src/data/converted/` 加结局表。不要手改。

已发布的章：第 1、2、3、4 章。没有提供待发布章节。全库读取 153 个 flag、写入 162 个。

「已知预期」两类：**①** 对面在还没发布的章里；**②** 对面那一场这一轮没转出来，属于连带假警报。「引擎读取」是引擎代码直接用的，也不算空转。只有「真正的空缺／空转」需要有人去补。

D-091 之后立绘按 flag 选，没人读的 flag 和拼错的 flag 在数据里长得一模一样。所以真正的空缺／空转不许悬着：没登记的挡转换，登记表在 `tools/convert-flag-ledger.json`。

## 一、被读取，但已发布的章里没有写入点（0）

### 真正的空缺（0）

未登记的 0 个挡转换；登记了判定的 0 个降为待交付，等「了结」那一栏写的人处理。

未登记：无。

### 已知预期（0）

无。

## 二、被写入，但已发布的章里没有读取者（9）

### 真正的空转（4）

未登记的 0 个挡转换；登记了判定的 4 个降为待交付，等「了结」那一栏写的人处理。

未登记：无。

| flag | 在哪里 | 判定 | 为什么 | 了结 |
|---|---|---|---|---|
| `liqinghe_open_debate` | `ch01_s09_shuge.cA` | 漏读 | ch01-09 二选一的 A。C-3 备注点名了读取者「C-4邀请保留反驳权」，可 lt-ch01-liqinghe-01 的正文不分岔，谁也没读它 | ChatGPT：C-4 lt-ch01-liqinghe-01 加附页（D-044），条件 flag.liqinghe_open_debate |
| `liqinghe_separate_draft` | `ch01_s09_shuge.cB` | 漏读 | ch01-09 二选一的 B。C-3 备注点名了读取者「C-4让各留原稿」，可 lt-ch01-liqinghe-01 的正文不分岔，谁也没读它 | ChatGPT：C-4 lt-ch01-liqinghe-01 加附页（D-044），条件 flag.liqinghe_separate_draft |
| `pei_no_departure_date` | `ch01_s07_yuanye.cA` | 漏读 | ch01-07 二选一的 A。C-3 备注点名了读取者「C-4裴信保留未定归期」，可 lt-ch01-peizhaoye-01 的正文不分岔，谁也没读它 | ChatGPT：C-4 lt-ch01-peizhaoye-01 加附页（D-044），条件 flag.pei_no_departure_date；转换器与引擎都已支持附页 |
| `pei_seek_departure_date` | `ch01_s07_yuanye.cB` | 漏读 | ch01-07 二选一的 B。C-3 备注点名了读取者「C-4裴信明确催核与保证之别」，可 lt-ch01-peizhaoye-01 的正文不分岔，谁也没读它 | ChatGPT：C-4 lt-ch01-peizhaoye-01 加附页（D-044），条件 flag.pei_seek_departure_date |

### 已知预期（5）

| flag | 在哪里 | 引擎代码提到 | 缺口清单 | 已知预期 |
|---|---|---|---|---|
| `chenghuan_returned` | `ch03_s15_yeting.cA` | 有 | 新 | 引擎读取 |
| `name_kept` | `ch04_s01_zhaoyang.cA`、`ch04_s01_zhaoyang.cB`、`ch04_s01_zhaoyang.cC` | 有 | 新 | 引擎读取 |
| `name_tian` | `ch04_s01_zhaoyang.cA`、`ch04_s01_zhaoyang.cB`、`ch04_s01_zhaoyang.cC` | 有 | 新 | 引擎读取 |
| `name_zhao` | `ch04_s01_zhaoyang.cA`、`ch04_s01_zhaoyang.cB`、`ch04_s01_zhaoyang.cC` | 有 | 新 | 引擎读取 |
| `succession_open` | `ch02_s23_hanyuan.cA` | 有 | 新 | 引擎读取 |

## 三、回信的回声（D-061）

每封信、每种回法写下的 flag，之后有没有人读。✓ 是已发布的章里读了；「待发布」是还没发布的章里读了（那一章转进来之后会变成 ✓）；**无** 是玩家这样回了、之后谁也没提。以诗代答只看「合意象」那一栏。

| 信 | 直言 A | 直言 B | 直言 C | 以诗代答 | 不回 |
|---|---|---|---|---|---|
| `lt_ch01_liqinghe_01` | ✓ `ch02_s24_shuge.l35`、`ch02_s24_shuge.l36` | ✓ `ch02_s24_shuge.l33`、`ch02_s24_shuge.l34` | ✓ `ch02_s24_shuge.l31`、`ch02_s24_shuge.l32` | （不写 flag） | ✓ `ch02_s24_shuge.l37`、`ch02_s24_shuge.l38` |
| `lt_ch01_peizhaoye_01` | ✓ `ch02_s07_yuanye.l11`、`ch02_s07_yuanye.l12` | ✓ `ch02_s07_yuanye.l13`、`ch02_s07_yuanye.l14` | ✓ `ch02_s07_yuanye.l15`、`ch02_s07_yuanye.l16` | （不写 flag） | ✓ `ch02_s07_yuanye.l17`、`ch02_s07_yuanye.l18` |
| `lt_ch01_shenheng_01` | ✓ `ch02_s04_shuge.l3`、`ch02_s04_shuge.l4` | ✓ `ch02_s04_shuge.l5`、`ch02_s04_shuge.l6` | ✓ `ch02_s04_shuge.l7`、`ch02_s04_shuge.l8` | （不写 flag） | ✓ `ch02_s04_shuge.l9`、`ch02_s04_shuge.l10` |
| `lt_ch01_wenqiao_01` | ✓ `ch02_s09_shishe.l3`、`ch02_s09_shishe.l4` | ✓ `ch02_s09_shishe.l5`、`ch02_s09_shishe.l6` | ✓ `ch02_s09_shishe.l7`、`ch02_s09_shishe.l8` | （不写 flag） | ✓ `ch02_s09_shishe.l9`、`ch02_s09_shishe.l10` |
| `lt_ch02_liqinghe_01` | ✓ `ch04_s05z_yeting.l105`、`ch04_s05z_yeting.l106`、`ch04_s08z_shuge.l100` 等 4 处 | ✓ `ch04_s05z_yeting.l111`、`ch04_s05z_yeting.l112`、`ch04_s08z_shuge.l106` 等 4 处 | ✓ `ch04_s05z_yeting.l113`、`ch04_s05z_yeting.l114`、`ch04_s08z_shuge.l108` 等 4 处 | ✓ `ch04_s05z_yeting.l107`、`ch04_s05z_yeting.l108`、`ch04_s08z_shuge.l102` 等 4 处 | ✓ `ch04_s05z_yeting.l109`、`ch04_s05z_yeting.l110`、`ch04_s08z_shuge.l104` 等 4 处 |
| `lt_ch02_liuchenghuan_01` | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） |
| `lt_ch02_peizhaoye_01` | ✓ `ch04_s05z_yeting.l37`、`ch04_s05z_yeting.l38`、`ch04_s08z_shuge.l32` 等 4 处 | ✓ `ch04_s05z_yeting.l43`、`ch04_s05z_yeting.l44`、`ch04_s08z_shuge.l38` 等 4 处 | ✓ `ch04_s05z_yeting.l45`、`ch04_s05z_yeting.l46`、`ch04_s08z_shuge.l40` 等 4 处 | ✓ `ch04_s05z_yeting.l39`、`ch04_s05z_yeting.l40`、`ch04_s08z_shuge.l34` 等 4 处 | ✓ `ch04_s05z_yeting.l41`、`ch04_s05z_yeting.l42`、`ch04_s08z_shuge.l36` 等 4 处 |
| `lt_ch02_shenheng_01` | ✓ `ch04_s05z_yeting.l2`、`ch04_s05z_yeting.l3`、`ch04_s08z_shuge.l1` 等 4 处 | ✓ `ch04_s05z_yeting.l8`、`ch04_s05z_yeting.l9`、`ch04_s08z_shuge.l7` 等 4 处 | ✓ `ch04_s05z_yeting.l10`、`ch04_s05z_yeting.l11`、`ch04_s08z_shuge.l9` 等 4 处 | ✓ `ch04_s05z_yeting.l4`、`ch04_s05z_yeting.l5`、`ch04_s08z_shuge.l3` 等 4 处 | ✓ `ch04_s05z_yeting.l6`、`ch04_s05z_yeting.l7`、`ch04_s08z_shuge.l5` 等 4 处 |
| `lt_ch02_wenqiao_01` | ✓ `ch04_s05z_yeting.l72`、`ch04_s05z_yeting.l73`、`ch04_s08z_shuge.l66` 等 4 处 | ✓ `ch04_s05z_yeting.l78`、`ch04_s05z_yeting.l79`、`ch04_s08z_shuge.l72` 等 4 处 | ✓ `ch04_s05z_yeting.l80`、`ch04_s05z_yeting.l81`、`ch04_s08z_shuge.l74` 等 4 处 | ✓ `ch04_s05z_yeting.l74`、`ch04_s05z_yeting.l75`、`ch04_s08z_shuge.l68` 等 4 处 | ✓ `ch04_s05z_yeting.l76`、`ch04_s05z_yeting.l77`、`ch04_s08z_shuge.l70` 等 4 处 |
| `lt_ch03_liqinghe_01` | ✓ `ch04_s05z_yeting.l115`、`ch04_s05z_yeting.l116`、`ch04_s08z_shuge.l110` 等 4 处 | ✓ `ch04_s05z_yeting.l117`、`ch04_s05z_yeting.l118`、`ch04_s08z_shuge.l112` 等 4 处 | ✓ `ch04_s05z_yeting.l119`、`ch04_s05z_yeting.l120`、`ch04_s08z_shuge.l114` 等 4 处 | ✓ `ch04_s05z_yeting.l121`、`ch04_s05z_yeting.l122`、`ch04_s08z_shuge.l116` 等 4 处 | ✓ `ch04_s05z_yeting.l123`、`ch04_s05z_yeting.l124`、`ch04_s08z_shuge.l118` 等 4 处 |
| `lt_ch03_peizhaoye_01` | ✓ `ch04_s05z_yeting.l47`、`ch04_s05z_yeting.l48`、`ch04_s08z_shuge.l42` 等 4 处 | ✓ `ch04_s05z_yeting.l49`、`ch04_s05z_yeting.l50`、`ch04_s08z_shuge.l44` 等 4 处 | ✓ `ch04_s05z_yeting.l51`、`ch04_s05z_yeting.l52`、`ch04_s08z_shuge.l46` 等 4 处 | ✓ `ch04_s05z_yeting.l53`、`ch04_s05z_yeting.l54`、`ch04_s08z_shuge.l48` 等 4 处 | ✓ `ch04_s05z_yeting.l55`、`ch04_s05z_yeting.l56`、`ch04_s08z_shuge.l50` 等 4 处 |
| `lt_ch03_shenheng_01` | ✓ `ch04_s05z_yeting.l12`、`ch04_s05z_yeting.l13`、`ch04_s08z_shuge.l11` 等 4 处 | ✓ `ch04_s05z_yeting.l14`、`ch04_s05z_yeting.l15`、`ch04_s08z_shuge.l13` 等 4 处 | ✓ `ch04_s05z_yeting.l16`、`ch04_s05z_yeting.l17`、`ch04_s08z_shuge.l15` 等 4 处 | ✓ `ch04_s05z_yeting.l18`、`ch04_s05z_yeting.l19`、`ch04_s08z_shuge.l17` 等 4 处 | ✓ `ch04_s05z_yeting.l20`、`ch04_s05z_yeting.l21`、`ch04_s08z_shuge.l19` 等 4 处 |
| `lt_ch03_wenqiao_01` | ✓ `ch04_s05z_yeting.l82`、`ch04_s05z_yeting.l83`、`ch04_s08z_shuge.l76` 等 4 处 | ✓ `ch04_s05z_yeting.l84`、`ch04_s05z_yeting.l85`、`ch04_s08z_shuge.l78` 等 4 处 | ✓ `ch04_s05z_yeting.l86`、`ch04_s05z_yeting.l87`、`ch04_s08z_shuge.l80` 等 4 处 | ✓ `ch04_s05z_yeting.l88`、`ch04_s05z_yeting.l89`、`ch04_s08z_shuge.l82` 等 4 处 | ✓ `ch04_s05z_yeting.l90`、`ch04_s05z_yeting.l91`、`ch04_s08z_shuge.l84` 等 4 处 |
| `lt_ch04_liqinghe_01` | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） |
| `lt_ch04_peizhaoye_01` | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） |
| `lt_ch04_shenheng_01` | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） |
| `lt_ch04_wenqiao_01` | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） |
| `lt_season_chongyang_liqinghe` | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） |
| `lt_season_hanshi_shenheng` | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） |
| `lt_season_shangyuan_wenqiao` | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） |
| `lt_season_zhongqiu_peizhaoye` | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） |
