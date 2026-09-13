# flag 体检

> 由 `tools/convert-story.ts` 在每次转换后生成，读的是 `src/data/converted/` 加结局表。不要手改。

已发布的章：第 1、2、3 章。待发布章节：第 4 章（试转，不落盘）。全库读取 94 个 flag、写入 138 个。

「已知预期」两类：**①** 对面在还没发布的章里；**②** 对面那一场这一轮没转出来，属于连带假警报。「引擎读取」是引擎代码直接用的，也不算空转。只有「真正的空缺／空转」需要有人去补。

## 一、被读取，但已发布的章里没有写入点（8）

### 真正的空缺（0）

无。

### 已知预期（8）

| flag | 在哪里 | 引擎代码提到 | 缺口清单 | 已知预期 |
|---|---|---|---|---|
| `ch04_dissent_removed` | `结局 mandianwusheng` | — | 新 | ① 写入点在待发布章节（ch04-03，试转未过） |
| `ch04_nomination_closed` | `结局 mandianwusheng` | 有 | 新 | ① 写入点在待发布章节（ch04-17，试转未过） |
| `ch04_nomination_open` | `结局 wuzibei` | 有 | 新 | ① 写入点在待发布章节（ch04-17，试转未过） |
| `ch04_originals_destroyed` | `结局 mandianwusheng` | — | 新 | ① 写入点在待发布章节（ch04-04，试转未过） |
| `founded_school` | `结局 liangxizhijian`、`结局 kaimenshouzi` | 有 | 已点名 | ① 写入点在待发布章节（ch04-12、ch04-15，试转未过） |
| `liqinghe_together` | `结局 liangxizhijian` | 有 | 已点名 | ① 写入点在待发布章节（ch04-09，试转未过） |
| `public_review` | `结局 wuzibei` | — | 已点名 | ① 写入点在待发布章节（ch04-05，试转未过） |
| `road_agreement` | `结局 liangxizhijian`、`结局 guanshanyouxin` | 有 | 已点名 | ① 写入点在待发布章节（ch04-12、ch04-15，试转未过） |

## 二、被写入，但已发布的章里没有读取者（52）

### 真正的空转（34）

| flag | 在哪里 | 引擎代码提到 | 缺口清单 | 已知预期 |
|---|---|---|---|---|
| `ch03_handover_done` | `ch03_s14_shuge.cA` | — | 新 | — |
| `ch03_paper_paid` | `ch03_s22_nvguan.cA` | — | 新 | — |
| `ch03_scope_closed` | `ch03_s16_shuge.cA`、`ch03_s16_shuge.cB`、`ch03_s16_shuge.cC` 等 7 处 | — | 新 | — |
| `li_ch02_letter_after_debate` | `lt_ch02_liqinghe_01.rB` | — | 新 | — |
| `li_ch02_letter_public_only` | `lt_ch02_liqinghe_01.rC` | — | 新 | — |
| `li_ch03_letter_separate` | `lt_ch03_liqinghe_01.rB` | — | 新 | — |
| `li_ch03_letter_silent` | `lt_ch03_liqinghe_01 不回` | — | 新 | — |
| `li_ch03_letter_stop` | `lt_ch03_liqinghe_01.rC` | — | 新 | — |
| `li_ch03_letter_walk` | `lt_ch03_liqinghe_01.rA` | — | 新 | — |
| `liqinghe_open_debate` | `ch01_s09_shuge.cA` | — | 新 | — |
| `liqinghe_separate_draft` | `ch01_s09_shuge.cB` | — | 新 | — |
| `pei_ch02_check_again` | `lt_ch02_peizhaoye_01.rB` | — | 新 | — |
| `pei_ch02_pause_help` | `lt_ch02_peizhaoye_01.rC` | — | 新 | — |
| `pei_ch03_letter_meal` | `lt_ch03_peizhaoye_01.rA` | — | 新 | — |
| `pei_ch03_letter_no_date` | `lt_ch03_peizhaoye_01.rB` | — | 新 | — |
| `pei_ch03_letter_silent` | `lt_ch03_peizhaoye_01 不回` | — | 新 | — |
| `pei_ch03_letter_stop` | `lt_ch03_peizhaoye_01.rC` | — | 新 | — |
| `pei_no_departure_date` | `ch01_s07_yuanye.cA` | — | 新 | — |
| `pei_seek_departure_date` | `ch01_s07_yuanye.cB` | — | 新 | — |
| `shen_after_intercept_private_stop` | `lt_ch02_shenheng_01.rC` | — | 新 | — |
| `shen_after_intercept_scope` | `lt_ch02_shenheng_01.rB` | — | 新 | — |
| `shen_ch03_letter_meet` | `lt_ch03_shenheng_01.rA` | — | 新 | — |
| `shen_ch03_letter_silent` | `lt_ch03_shenheng_01 不回` | — | 新 | — |
| `shen_ch03_letter_stop` | `lt_ch03_shenheng_01.rC` | — | 新 | — |
| `shen_ch03_letter_wait` | `lt_ch03_shenheng_01.rB` | — | 新 | — |
| `wen_ch02_keep_without_pardon` | `lt_ch02_wenqiao_01.rB` | — | 新 | — |
| `wen_ch02_leave_first` | `ch02_s22_shuge.cB` | — | 新 | — |
| `wen_ch02_private_pause` | `lt_ch02_wenqiao_01.rC` | — | 新 | — |
| `wen_ch02_wait_together` | `ch02_s22_shuge.cA` | — | 新 | — |
| `wen_ch03_letter_fair_pay` | `lt_ch03_wenqiao_01.rB` | — | 新 | — |
| `wen_ch03_letter_silent` | `lt_ch03_wenqiao_01 不回` | — | 新 | — |
| `wen_ch03_letter_sing` | `lt_ch03_wenqiao_01.rA` | — | 新 | — |
| `wen_ch03_letter_stop` | `lt_ch03_wenqiao_01.rC` | — | 新 | — |
| `wen_help_declined` | `ch02_s09_shishe.cC` | — | 新 | — |

### 已知预期（18）

| flag | 在哪里 | 引擎代码提到 | 缺口清单 | 已知预期 |
|---|---|---|---|---|
| `ch03_offer_wuze` | `ch03_s11_hanyuan.cA`、`ch03_s11_hanyuan.cB`、`ch03_s11_hanyuan.cC` | — | 新 | ① 未发布章节的大纲提到 |
| `chenghuan_returned` | `ch03_s15_yeting.cA` | 有 | 新 | 引擎读取 |
| `li_ch02_letter_meet` | `lt_ch02_liqinghe_01.rA` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |
| `li_ch02_letter_poem` | `lt_ch02_liqinghe_01 诗答·合`、`lt_ch02_liqinghe_01 诗答·不合` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |
| `li_ch02_letter_silent` | `lt_ch02_liqinghe_01 不回` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |
| `li_ch02_private_no` | `ch02_s24_shuge.cC` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |
| `li_ch02_private_wait` | `ch02_s24_shuge.cB` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |
| `li_ch02_private_yes` | `ch02_s24_shuge.cA` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |
| `pei_ch02_letter_poem` | `lt_ch02_peizhaoye_01 诗答·合`、`lt_ch02_peizhaoye_01 诗答·不合` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |
| `pei_ch02_letter_silent` | `lt_ch02_peizhaoye_01 不回` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |
| `pei_ch02_spare_time` | `lt_ch02_peizhaoye_01.rA` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |
| `shen_after_intercept_meet` | `lt_ch02_shenheng_01.rA` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |
| `shen_ch02_letter_poem` | `lt_ch02_shenheng_01 诗答·合`、`lt_ch02_shenheng_01 诗答·不合` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |
| `shen_ch02_letter_silent` | `lt_ch02_shenheng_01 不回` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |
| `succession_open` | `ch02_s23_hanyuan.cA` | 有 | 新 | 引擎读取 |
| `wen_ch02_letter_poem` | `lt_ch02_wenqiao_01 诗答·合`、`lt_ch02_wenqiao_01 诗答·不合` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |
| `wen_ch02_letter_silent` | `lt_ch02_wenqiao_01 不回` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |
| `wen_ch02_read_again` | `lt_ch02_wenqiao_01.rA` | — | 新 | ① 读取者在待发布章节（ch04-05、ch04-08，试转未过） |

## 三、回信的回声（D-061）

每封信、每种回法写下的 flag，之后有没有人读。✓ 是已发布的章里读了；「待发布」是还没发布的章里读了（那一章转进来之后会变成 ✓）；**无** 是玩家这样回了、之后谁也没提。以诗代答只看「合意象」那一栏。

| 信 | 直言 A | 直言 B | 直言 C | 以诗代答 | 不回 |
|---|---|---|---|---|---|
| `lt_ch01_liqinghe_01` | ✓ `ch02_s24_shuge.l22` | ✓ `ch02_s24_shuge.l21` | ✓ `ch02_s24_shuge.l20` | （不写 flag） | ✓ `ch02_s24_shuge.l23` |
| `lt_ch01_peizhaoye_01` | ✓ `ch02_s07_yuanye.l8` | ✓ `ch02_s07_yuanye.l9` | ✓ `ch02_s07_yuanye.l10` | （不写 flag） | ✓ `ch02_s07_yuanye.l11` |
| `lt_ch01_shenheng_01` | ✓ `ch02_s04_shuge.l2` | ✓ `ch02_s04_shuge.l3` | ✓ `ch02_s04_shuge.l4` | （不写 flag） | ✓ `ch02_s04_shuge.l5` |
| `lt_ch01_wenqiao_01` | ✓ `ch02_s09_shishe.l2` | ✓ `ch02_s09_shishe.l3` | ✓ `ch02_s09_shishe.l4` | （不写 flag） | ✓ `ch02_s09_shishe.l5` |
| `lt_ch02_liqinghe_01` | 待发布 ch04-05、ch04-08（试转未过） | **无** | **无** | 待发布 ch04-05、ch04-08（试转未过） | 待发布 ch04-05、ch04-08（试转未过） |
| `lt_ch02_peizhaoye_01` | 待发布 ch04-05、ch04-08（试转未过） | **无** | **无** | 待发布 ch04-05、ch04-08（试转未过） | 待发布 ch04-05、ch04-08（试转未过） |
| `lt_ch02_shenheng_01` | 待发布 ch04-05、ch04-08（试转未过） | **无** | **无** | 待发布 ch04-05、ch04-08（试转未过） | 待发布 ch04-05、ch04-08（试转未过） |
| `lt_ch02_wenqiao_01` | 待发布 ch04-05、ch04-08（试转未过） | **无** | **无** | 待发布 ch04-05、ch04-08（试转未过） | 待发布 ch04-05、ch04-08（试转未过） |
| `lt_ch03_liqinghe_01` | **无** | **无** | **无** | （不写 flag） | **无** |
| `lt_ch03_peizhaoye_01` | **无** | **无** | **无** | （不写 flag） | **无** |
| `lt_ch03_shenheng_01` | **无** | **无** | **无** | （不写 flag） | **无** |
| `lt_ch03_wenqiao_01` | **无** | **无** | **无** | （不写 flag） | **无** |
