---
name: art-style
description: 《吾则天》水墨唐风视觉规范（主角吾则添，登基后改名吾则天）。双色板：水墨属于她，金碧属于朝廷。生成、挑选、审核、修改这个项目的任何视觉资产时都要用——包括角色立绘、场景背景、UI 组件、字体与排版、转场动效、结局卡片、图标、分享图、3D 场景的着色与配色。写 CSS 颜色值、调 Three.js 材质、给 AI 绘图工具写 prompt、评价一张图能不能用，全部走这里。只要产出物会被玩家看见，先读这份技能再动手。
---

# 吾则天 · 水墨视觉规范

## 一条总原则

**留白就是她的权力。无字碑是这个游戏的视觉母题。**

水墨画里最有力量的是没画的部分。这个游戏讲的是一个女人拒绝被定义，所以画面里"空着的地方"必须比"画满的地方"更有分量。任何时候你想往画面里加东西，先问：拿掉它会不会更强。

这条不是修辞。它对应两个可检查的硬指标：留白面积和朱砂占比。见 `references/composition.md`。

## 什么时候读哪个文件

按需读，不用一次全读。

| 你在做什么 | 读 |
| --- | --- |
| 定颜色、写 CSS 变量、调材质 | `references/palette.md` |
| 排版面、决定主体位置、审构图 | `references/composition.md` |
| 画立绘、写立绘 prompt、做表情差分 | `references/character.md` |
| 做场景背景、定 3D 机位与光 | `references/scene.md` |
| 做对话框、选项、状态条、字体、动效 | `references/ui.md` |
| 觉得一张图"哪里怪" | `references/negative.md` |

## 审核任何视觉资产的六条检查

拿到一张图或一个界面，逐条过。任何一条不过就退回。

1. **留白够不够。** 场景背景留白 ≥ 40%，UI 界面负空间 ≥ 35%。目测不准就截图数格子。
2. **当前色板外颜色为零。** 先确认这一屏属于哪个色板（水墨还是金碧），再查。两板合计 12 个值，混用两板也是错的。受限值只有两个：`--c-ink-wash`（水墨侵入金碧用的墨）和 `--c-purple`（结契者的一点紫），各有自己的规矩，见 `references/palette.md`。
3. **朱砂用对没有。** 朱砂是她的欲望和决断，不是装饰。全屏占比 ≤ 3%，且必须能说出这一点红"代表她的哪个动作"。说不出就删掉。
   **金碧场景里出现朱砂，必须对应她的一个具体决定。** 金碧板本身没有红，所以朝廷画面里的每一点朱砂都是叙事事件，不能因为"好看"而加。
   **紫同理，而且更严：** 只在结契者身上，只在水墨板，≤ 0.5%，且小于同屏的朱砂点。
4. **有没有恐怖谷。** 面部不做写实细节。看到眼白、瞳孔高光、鼻影、写实嘴唇，退回。
5. **是不是"仙侠"了。** 发光、粒子、光晕、飘带特效，一律不要。这是唐朝的宫廷，不是修真界。
6. **换成男主角会不会一样。** 这条是从 `docs/吾则天-女性主义精神指南.md` 第 4 节借来的。构图上，她是被观看的对象还是观看的主体？镜头有没有在窥视她？如果一张立绘的姿态是"供人欣赏"，重做。

## 给 AI 绘图工具写 prompt 的骨架

不要每次现编。用这个结构，把中括号换掉：

```
Chinese ink wash painting (shuimo), Tang dynasty court, [主体],
silhouette-forward, minimal facial detail, calligraphic brushstrokes,
[水墨场景：five ink tones only, near-black to pale grey, on aged xuan paper]
[金碧场景：blue-green and gold mineral pigments on aged silk, no red],
[仅水墨场景] single deep vermilion accent at [朱砂点位置],
[留白方向] 60% negative space, subject offset to [方位],
[光线], [情绪关键词],
flat, no gradient, no glow, no rim light, no anime, no photorealism, no 3D render
```

负面词固定加：`glowing, neon, particles, lens flare, large anime eyes, photorealistic face, saturated colors, symmetrical portrait, modern typography`。

为什么强调 silhouette-forward 和 minimal facial detail：AI 生成的人脸在同一角色的多张图之间很难保持一致，而且容易掉进恐怖谷。剪影风把识别负担转移到轮廓、服饰和姿态上，这三样 AI 反而稳定，也更接近水墨本身的语言。

## 文件与命名

```
public/bg/<场景key>_<时段>.webp        # 例：shuge_afternoon.webp
public/char/<角色key>_<表情>.webp      # 例：shangguan_guarded.webp
public/ui/<组件>_<状态>.svg            # UI 尽量用 SVG，墨线可缩放
```

角色 key 用拼音无声调，场景 key 见 `references/scene.md` 的八个场景表。所有位图导出 webp，质量 82，导出前确认长边不超过 1536。
