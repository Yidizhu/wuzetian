# 八个场景

每个场景一个固定机位。相机不交给玩家控制，只在场景切换和关键 beat 做缓慢推拉，像舞台灯光而不是第一人称视角。这既省性能，也让每一幕保持构图控制权。

如果 3D 方案在 Day 5 退回 CSS 视差版（见指挥日志 D-003），下面的机位、时段、光线、情绪关键词全部照用，只是从 3D 相机变成分层图的透视安排。

## 场景表

`palette` 一列是场景 JSON 里那个字段的值，`SceneRenderer` 和 UI 都读它。

| key | 场景 | palette | 机位 | 时段与光 | 情绪关键词 | 无字碑母题的落点 |
|---|---|---|---|---|---|---|
| `yeting` | 掖庭偏院 | `ink` | 平视略仰，近 | 清晨薄雾，侧逆光 | 局促、观察、尚未被看见 | 未写名的门牌 |
| `zhaoyang` | 昭阳殿一角 | `gold` → 见下 | 低机位仰视柱列 | 正午硬光，影子短而硬 | 秩序、压迫、规矩 | 素屏风 |
| `shuge` | 秘书省书阁 | `gold` → 见下 | 平视，中景 | 午后斜光穿窗棂，光柱里有浮尘 | 智性、试探、势均力敌 | 摊开未写的笺 |
| `nvguan` | 女冠观 | `ink` | 平视稍远 | 阴天漫射，几乎没有影子 | 自由、脱离、松弛 | 空白的符纸 |
| `shishe` | 诗社水榭 | `ink` | 轻俯视 | 黄昏，水面反光 | 结盟、才华、愉悦 | 未题字的团扇 |
| `yuanye` | 御花园夜 | `ink` | 近景平视 | 月光冷，只见轮廓 | 亲密、私语、无用时刻 | 对话框留空只余一线 |
| `hanyuan` | 含元殿 | `gold` → 见下 | 极远景大俯视，人极小 | 逆光剪影 | 权力、孤高、不可逆 | 未展开的诏书 |
| `wuzibei` | 无字碑 | `ink` | 正视，天占七成 | 正面平光，无方向 | 留白、拒绝被定义、终局 | 碑面本身，只有一枚朱砂印 |

五个私人场景永远是水墨板。**三个朝廷场景的色板会随幕数变化**，这是 D-010 的第三条硬规则，也是全游戏最重要的一条视觉叙事线。

## 朝廷场景的色板演进

`zhaoyang`、`shuge`、`hanyuan` 三个场景各有三套资产，按幕取用。**水墨侵入朝廷的进度就是她的权力进度。**

| 幕 | palette | 画面上的具体变化 |
|---|---|---|
| 第一幕 | `gold` | 全金碧。石青的柱、泥金的匾、绢底。她在这里是一个外来者 |
| 第二幕 | `gold` | 仍是金碧，但画面里出现**一个**水墨元素：她带进来的屏风，或墙上她写的字。只有一个，要显眼 |
| 第三幕 | `ink` | 以水墨为主，金碧只剩残余：褪色的泥金匾、角落一块没换掉的石绿帷幔 |
| 登基那一场 | `gold` → `ink` | 转场本身就是内容：金碧被墨晕整片盖掉。这一幕不要剪掉，要让玩家看完 |

文件命名带幕号：`hanyuan_act1.glb`、`hanyuan_act2.glb`、`hanyuan_act3.glb`。CSS 视差版同理。

结局分支上还有一条反向规则：**如果结局是「她变成了她推翻的那个人」（势高心低），画面回到金碧。** 这是视觉上的判词，不需要旁白说一个字。

## 建模与着色约定

- **low-poly**，每个场景三角面控制在两万以内。手机上要跑 30fps。
- 材质统一 `MeshToonMaterial`。`gradientMap` 每套色板一张 1×5 像素图，见 `palette.md`。切色板时换 gradientMap，不换几何。
- 轮廓线两板都用焦墨，反向法线外扩（inverted hull），宽度随距离衰减。远处的线要细到接近消失，才有淡墨远山的感觉。
- 地面墨晕用 `smoothstep` 加噪声，不要用规整椭圆阴影。边缘软、内部不均。
- 全屏最后叠纸纹，`multiply`，不透明度 0.25 到 0.35。水墨场景叠宣纸纹，金碧场景叠绢纹（更细、更规整、略带经纬）。

## 可直接参考的三个 three.js 资源

1. **Toon Material with OutlineEffect** — 官方示例 `webgl_materials_toon`，`MeshToonMaterial` 加 `OutlineEffect` 的完整用法，直接对应我们的平涂加墨线。
   https://threejs.org/examples/webgl_materials_toon
2. **Sobel 边缘检测后处理** — 官方示例 `webgl_postprocessing_sobel`。当 inverted hull 在复杂几何（窗棂、柱列）上出锯齿时，改用后处理描边的备选方案。
   https://threejs.org/examples/webgl_postprocessing_sobel.html
3. **Sketchy Pencil Effect（Codrops）** — 把 Sobel 描边和主渲染合成、并加纸纹抖动的完整实现。我们要的「墨线加纸纹」合成方式和它结构一致，换掉色板即可。
   https://tympanus.net/codrops/2022/11/29/sketchy-pencil-effect-with-three-js-post-processing/

另有 Codrops 2026 年 9 月的 WebGPU 水墨庭园案例可作效果参照，但它用 WebGPU 加 TSL，移动端兼容面比 WebGL 窄，第一周不要跟。

场景搭建的通用做法（import map、场景相机渲染器三件套、`setAnimationLoop`、响应式 resize）见已装的 `threejs-scene-setup` 技能。注意它默认用 `PerspectiveCamera` 加 `OrbitControls`，我们两样都不用：机位固定，相机不交给玩家。
