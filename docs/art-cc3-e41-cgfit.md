**哪些生效、哪些没有（D-097）**：
- **已提交、没部署**：手机上 CG 只显示一角的问题已修，改了三个文件，本地正式剧情流程里验过。线上要等 CC1 下一次发布才生效。
- 没改剧本、没重出图、没动音频规则、没动普通舞台背景。
- `CgLayer.ts` 是 CC1 的文件，`cg.css`、`picture.css` 是 CC1 建、CC3 调的文件。改动处都标了「CC3 E41 改，待协调」。

# CC3 · E41 插单：手机 CG 被放大截断

## 一、根因

**不是原图的问题，是显示方法在微信里的 WebKit 上失效。**

**用户两张截图各是哪张图**：
- 「你看她持笔的手……」是 `ch01_s01_zhaoyang.l4` → `shenheng_1_tengxie`；
- 「你低头看阿荻的手……」是 `ch01_s03_yeting.l16` → `adi_1_buxiu`。

两格都走剧本的 image 列，也就是同拍画面 `.cg[data-role="line"]`。D32 之后全剧 121 格图都走这一条，剧本里已经没有旧的独立 `who: "cg"` 格。

**截图里看到的东西，和原图左上角一块正好对得上**：
- 第一张：大柱子和窗子是 `shenheng_1_tengxie` 左边三分之一；
- 第二张：主角的头在右、陶罐在左下，是 `adi_1_buxiu` 左上角约 390×480 那一块。

也就是说，微信把 `.cg` 元素**自己的背景图按原图尺寸、从左上角**画了出来。

**旧写法**（E40 的 `picture.css` 和 `cg.css` 的 contain 模式）：
- 图挂在 `.cg` 元素自己的 `background-image` 上，再用 `background-size: 0 0` 把它藏起来；
- 另用 `::before`／`::after` 两个伪元素 `background-image: inherit`，一张 cover 虚化垫底，一张 contain 整张。

**在微信里失效的是两处**：
- `0 0` 没把本体那张藏住，它按原图尺寸画在了左上角；
- 伪元素上 contain 的那一张没显示出来。

桌面 Chrome 两处都正常，所以 E40 的组件截图和这次本地复现看起来都是好的。这台机器没有 WebKit 可跑，**失效的具体是哪一条 WebKit 行为，我只能按截图倒推**。新写法不依赖这两处中的任何一处，所以不管是哪一条，都不会再出现。

**线上 CSS 就是现在的代码**：我取了 `wuzetianle.vercel.app` 当前的 css，`#app[data-picture]` 那几条和仓库一致。所以截图就是这套写法在手机上的样子，不是旧包没更新。

## 二、改动

| 文件 | 改了什么 |
|---|---|
| `src/ui/CgLayer.ts` | `mount()` 不再给 `.cg` 挂背景图，改为放两张真的 `<img>`：`.cg__fill` 在下，虚化垫底；`.cg__img` 在上，是图本身，它的 `object-position` 写 `cgs.ts` 的 focus。印（`.cg__seal`）照旧后放，压在图上 |
| `src/styles/cg.css` | `.cg` 只留纸色底，加 `overflow: hidden`；偏移不用 `inset` 简写，改写 top/right/bottom/left，老 iOS 不认简写。铺满用 `object-fit: cover`；contain 模式用 `object-fit: contain`，同时露出虚化垫底。删掉伪元素 inherit 那一套 |
| `src/styles/picture.css` | 同拍画面永远 `contain`、居中，露虚化垫底；删掉伪元素和 `background-size: 0 0` |

**所有 CG 都走这一条**：同拍画面、点开的事件图（`show`）、结局图（`holdEnding`，带印的无字之碑）都用 `mount()`，一起改了，不是只给两张打补丁。

**不改的**：
- **铺法规则不变**：
  - 同拍画面是整张 contain，放在 HUD 和对白之间，空处用同一张图虚化垫；
  - 点开的事件图和结局图照 D-150：竖图上手机铺满，裁两侧各约 15%，这是公共段里写好的安全区；竖图上宽屏 contain。
- **别的路径不变**：
  - 连续同 key 不重铺、退图前隐藏旧层，这两处逻辑没动；
  - 回廊（`Gallery.ts`）本来就是 `<img>` + `object-fit`，不受影响；
  - 普通舞台背景、立绘、音频一概没动。

## 三、验证

**走的是正式剧情引擎**：用存档把 `sceneId`、`lineIndex` 写到图格前一句，重载后真点一下进到图格。数据是 D32 正式产物，不是组件预览。

截图在 `Claude outputs/screens/e41-cgfit/`：

| 视口 | 持笔（`shenheng_1_tengxie`） | 补袖（`adi_1_buxiu`） |
|---|---|---|
| 390×844 | `after-ch01_s01_zhaoyang-390x844.png` | `after-ch01_s03_yeting-390x844.png` |
| 320×568 | `after-ch01_s01_zhaoyang-320x568.png` | `after-ch01_s03_yeting-320x568.png` |
| 844×390 横屏 | `after-ch01_s01_zhaoyang-844x390.png` | `after-ch01_s03_yeting-844x390.png` |

- **三个视口都是整张图**：
  - 沈衡的脸、持笔的手、笔尖、纸都在；
  - 阿荻、主角、阿荻捏针的手、主角的手腕、灯都在。
- **不遮挡**：
  - 对白在图下面，横屏时在图旁边，不压图；
  - HUD 在图上面那一行，不压图。
- **390×844 实测**：图格是 390×602（y 112–714），`object-fit: contain`，虚化垫底 `display: block`，`.cg` 本体 `background-image: none`。
- **结局图也验了**（同一个 `mount()`）：`after-ending-390x844.png`、`after-ending-844x390.png`，照旧 D-150 的铺法，正常。
- **修复前的样子**：本机 Chrome 复现不出来，用户的两张微信截图就是修复前的证据。**修复后在真 iPhone 微信里的样子，要等 CC1 发布后由 YIDI 再看一次**，我这里只能证明新写法不再依赖失效的那两处。
- **门禁**：`build:web` 通过；`npm test` 226/226；`tsc` 0 错误。

## 四、交 CC1

1. **发布**：三个文件已提交，SHA 见本轮回报。下次 `npm run release -- --deploy` 带上即可，不需要改表或剧本。
2. **YIDI 真机复核**：iPhone 微信，开第一章「你看她持笔的手」和「你低头看阿荻的手」两格；再随便开一张点开的事件图、一张结局图。看到的应该是整张图，不是一角。
