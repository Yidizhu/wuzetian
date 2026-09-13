# flag 体检

> 由 `tools/convert-story.ts` 在每次转换后生成，读的是 `src/data/converted/` 加结局表。不要手改。

已发布的章：第 1、2、3、4 章。没有提供待发布章节。全库读取 150 个 flag、写入 167 个。

「已知预期」两类：**①** 对面在还没发布的章里；**②** 对面那一场这一轮没转出来，属于连带假警报。「引擎读取」是引擎代码直接用的，也不算空转。只有「真正的空缺／空转」需要有人去补。

## 一、被读取，但已发布的章里没有写入点（0）

### 真正的空缺（0）

无。

### 已知预期（0）

无。

## 二、被写入，但已发布的章里没有读取者（17）

### 真正的空转（12）

| flag | 在哪里 | 引擎代码提到 | 缺口清单 | 已知预期 |
|---|---|---|---|---|
| `ch03_handover_done` | `ch03_s14_shuge.cA` | — | 新 | — |
| `ch03_offer_wuze` | `ch03_s11_hanyuan.cA`、`ch03_s11_hanyuan.cB`、`ch03_s11_hanyuan.cC` | — | 新 | — |
| `ch03_paper_paid` | `ch03_s22_nvguan.cA` | — | 新 | — |
| `ch03_scope_closed` | `ch03_s16_shuge.cA`、`ch03_s16_shuge.cB`、`ch03_s16_shuge.cC` 等 7 处 | — | 新 | — |
| `ch04_labor_paid` | `ch04_s05_yeting.cA`、`ch04_s05_yeting.cB`、`ch04_s05_yeting.cC` | — | 新 | — |
| `liqinghe_open_debate` | `ch01_s09_shuge.cA` | — | 新 | — |
| `liqinghe_separate_draft` | `ch01_s09_shuge.cB` | — | 新 | — |
| `pei_no_departure_date` | `ch01_s07_yuanye.cA` | — | 新 | — |
| `pei_seek_departure_date` | `ch01_s07_yuanye.cB` | — | 新 | — |
| `wen_ch02_leave_first` | `ch02_s22_shuge.cB` | — | 新 | — |
| `wen_ch02_wait_together` | `ch02_s22_shuge.cA` | — | 新 | — |
| `wen_help_declined` | `ch02_s09_shishe.cC` | — | 新 | — |

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
| `lt_ch01_liqinghe_01` | ✓ `ch02_s24_shuge.l22` | ✓ `ch02_s24_shuge.l21` | ✓ `ch02_s24_shuge.l20` | （不写 flag） | ✓ `ch02_s24_shuge.l23` |
| `lt_ch01_peizhaoye_01` | ✓ `ch02_s07_yuanye.l8` | ✓ `ch02_s07_yuanye.l9` | ✓ `ch02_s07_yuanye.l10` | （不写 flag） | ✓ `ch02_s07_yuanye.l11` |
| `lt_ch01_shenheng_01` | ✓ `ch02_s04_shuge.l2` | ✓ `ch02_s04_shuge.l3` | ✓ `ch02_s04_shuge.l4` | （不写 flag） | ✓ `ch02_s04_shuge.l5` |
| `lt_ch01_wenqiao_01` | ✓ `ch02_s09_shishe.l2` | ✓ `ch02_s09_shishe.l3` | ✓ `ch02_s09_shishe.l4` | （不写 flag） | ✓ `ch02_s09_shishe.l5` |
| `lt_ch02_liqinghe_01` | ✓ `ch04_s05_yeting.l53`、`ch04_s08_shuge.l43` | ✓ `ch04_s05_yeting.l56`、`ch04_s08_shuge.l46` | ✓ `ch04_s05_yeting.l57`、`ch04_s08_shuge.l47` | ✓ `ch04_s05_yeting.l54`、`ch04_s08_shuge.l44` | ✓ `ch04_s05_yeting.l55`、`ch04_s08_shuge.l45` |
| `lt_ch02_peizhaoye_01` | ✓ `ch04_s05_yeting.l28`、`ch04_s08_shuge.l19` | ✓ `ch04_s05_yeting.l31`、`ch04_s08_shuge.l22` | ✓ `ch04_s05_yeting.l32`、`ch04_s08_shuge.l23` | ✓ `ch04_s05_yeting.l29`、`ch04_s08_shuge.l20` | ✓ `ch04_s05_yeting.l30`、`ch04_s08_shuge.l21` |
| `lt_ch02_shenheng_01` | ✓ `ch04_s05_yeting.l15`、`ch04_s08_shuge.l8` | ✓ `ch04_s05_yeting.l18`、`ch04_s08_shuge.l11` | ✓ `ch04_s05_yeting.l19`、`ch04_s08_shuge.l12` | ✓ `ch04_s05_yeting.l16`、`ch04_s08_shuge.l9` | ✓ `ch04_s05_yeting.l17`、`ch04_s08_shuge.l10` |
| `lt_ch02_wenqiao_01` | ✓ `ch04_s05_yeting.l41`、`ch04_s08_shuge.l31` | ✓ `ch04_s05_yeting.l44`、`ch04_s08_shuge.l34` | ✓ `ch04_s05_yeting.l45`、`ch04_s08_shuge.l35` | ✓ `ch04_s05_yeting.l42`、`ch04_s08_shuge.l32` | ✓ `ch04_s05_yeting.l43`、`ch04_s08_shuge.l33` |
| `lt_ch03_liqinghe_01` | ✓ `ch04_s05_yeting.l58`、`ch04_s08_shuge.l48` | ✓ `ch04_s05_yeting.l59`、`ch04_s08_shuge.l49` | ✓ `ch04_s05_yeting.l60`、`ch04_s08_shuge.l50` | ✓ `ch04_s05_yeting.l61`、`ch04_s08_shuge.l51` | ✓ `ch04_s05_yeting.l62`、`ch04_s08_shuge.l52` |
| `lt_ch03_peizhaoye_01` | ✓ `ch04_s05_yeting.l33`、`ch04_s08_shuge.l24` | ✓ `ch04_s05_yeting.l34`、`ch04_s08_shuge.l25` | ✓ `ch04_s05_yeting.l35`、`ch04_s08_shuge.l26` | ✓ `ch04_s05_yeting.l36`、`ch04_s08_shuge.l27` | ✓ `ch04_s05_yeting.l37`、`ch04_s08_shuge.l28` |
| `lt_ch03_shenheng_01` | ✓ `ch04_s05_yeting.l20`、`ch04_s08_shuge.l13` | ✓ `ch04_s05_yeting.l21`、`ch04_s08_shuge.l14` | ✓ `ch04_s05_yeting.l22`、`ch04_s08_shuge.l15` | ✓ `ch04_s05_yeting.l23`、`ch04_s08_shuge.l16` | ✓ `ch04_s05_yeting.l24`、`ch04_s08_shuge.l17` |
| `lt_ch03_wenqiao_01` | ✓ `ch04_s05_yeting.l46`、`ch04_s08_shuge.l36` | ✓ `ch04_s05_yeting.l47`、`ch04_s08_shuge.l37` | ✓ `ch04_s05_yeting.l48`、`ch04_s08_shuge.l38` | ✓ `ch04_s05_yeting.l49`、`ch04_s08_shuge.l39` | ✓ `ch04_s05_yeting.l50`、`ch04_s08_shuge.l40` |
| `lt_ch04_liqinghe_01` | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） |
| `lt_ch04_peizhaoye_01` | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） |
| `lt_ch04_shenheng_01` | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） |
| `lt_ch04_wenqiao_01` | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） | （不写 flag） |
