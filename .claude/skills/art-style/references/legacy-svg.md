# 旧管线：SVG 剪影与 3D 舞台的审核规矩（E11 起退役，保留备查）

> D-095 把立绘和背景换成 AI 生成的光栅图之后，`SKILL.md` 的门槛改成了「验收生成图」的七道。
> 下面是原来那一版，**原样搬过来**，没有改一个字。它仍然适用于两处：还在当 fallback 的 `src/char/*.svg`、和 3D 舞台（`ThreeStageRenderer`）——直到对应的 PNG 验收过、CC1 接上。
> 旧 SVG 一张不删（D-095）。

## 审核任何视觉资产的六条检查

拿到一张图或一个界面，逐条过。任何一条不过就退回。

1. **留白够不够。** 场景背景留白 ≥ 40%，UI 界面负空间 ≥ 35%。目测不准就截图数格子。
2. **当前色板外颜色为零。** 先确认这一屏属于哪个色板（水墨还是金碧），再查。两板合计 12 个值，混用两板也是错的。受限值只有两个：`--c-ink-wash`（水墨侵入金碧用的墨）和 `--c-purple`（结契者的一点紫），各有自己的规矩，见 `references/palette.md`。
3. **朱砂用对没有。** 朱砂是她的欲望和决断，不是装饰。全屏占比 ≤ 3%，且必须能说出这一点红"代表她的哪个动作"。说不出就删掉。
   **金碧场景里出现朱砂，必须对应她的一个具体决定。** 金碧板本身没有红，所以朝廷画面里的每一点朱砂都是叙事事件，不能因为"好看"而加。
   **紫同理，而且更严：** 只在结契者身上，只在水墨板，≤ 0.5%，且小于同屏的朱砂点。
   **人身上不许出现色板色。** 金碧只属于场景与器物，立绘永远走墨色——
   见 `references/character.md`「人不随色板变」。
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
