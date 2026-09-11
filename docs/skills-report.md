# 技能与外部资源调研报告

> 执行者：Claude Code
> 依据：`docs/00-指挥日志.md` 的 Prompt A
> 日期：2026-09-10
> 结论一句话：**账号内技能库依然为零，但库外找到一个高质量的游戏开发技能合集，值得挑四个装。**
>
> **修订（同日）**：第五节的四项待拍板已由 D-006 到 D-010 全部答复，四个技能已装（见第六节），朱砂改为 `#A8232A`，七色板改为双色板。本报告的调研过程原样保留，结论以指挥日志为准。

---

## 一、账号内技能库与插件市场

### 1.1 搜索记录

两轮检索，全部返回空或不相关。

| 轮次 | 工具 | 关键词 | 结果 |
|---|---|---|---|
| 第一轮 | `SearchSkills` | game development, phaser, html5 game, visual novel, three.js, pixel art, music sound effects, deploy web app | **空** |
| 第一轮 | `SearchPlugins` | game engine, phaser godot, web game, deployment vercel, art asset generation | **空** |
| 第二轮 | `SearchSkills` | art direction, visual design, color palette, shader, three.js, webgl, toon shading, character design | 仅 `canvas-design2` |
| 第二轮 | `SearchSkills` | ink wash, ui skin, motion design, typography, illustration, postprocessing, 3d, animation | 仅 `public-speaking`、`data-viz-storytelling`，均不相关 |
| 第二轮 | `SearchPlugins` | art direction, shader graph, unity, webgl three.js, ui skin motion design, typography, illustration, postprocessing | **空** |
| 第二轮 | `SearchPlugins` | unity, game | **空** |

### 1.2 关于 Unity 官方插件

指挥日志的 Prompt A 要求评估市场里的 Unity 官方插件（含 `urp-postprocessing`、`shader-graph-create-custom-node`、`optimize-web`）。

**在这个账号的插件目录里搜不到它。** 用 `unity` 单独搜也是空。可能是区域可见性差异，也可能是插件目录本身没同步。这一点我确认不了，需要 YIDI 在客户端的插件市场界面里自己看一眼。

不过即使它在，结论不变，理由有两条：

1. **Unity WebGL 不能用。** 手机端首屏 20 到 50 MB 是常态，与「一条链接点开即玩」的目标直接冲突。精神指南第 6 节已经写了这一条。
2. **那三个技能的思路可以借鉴，但不需要装插件才能拿到。** `urp-postprocessing` 讲的后处理链顺序（描边、色调、纸纹）我已经写进 `art-style/references/scene.md`；`shader-graph-create-custom-node` 是 Unity 的节点式着色器编辑器，对手写 GLSL 没有迁移价值；`optimize-web` 的通用结论（压纹理、控面数、合批）也已落到场景表的「不超过两万面」和性能闸门里。

**采用结论：不装。**

### 1.3 账号内可复用的现有技能

| 技能 | 用在哪一步 | 采用 |
|---|---|---|
| `canvas-design2` | 标题画面、结局卡片、分享图这类静态图 | 用 |
| `design` | Day 1 定 UI 排版与界面流程图 | 用 |
| `artifact-design` / `artifact-capabilities` | Day 3 的手机 demo 走 Artifact 发布 | 用 |
| `humanizer` | ChatGPT 台词定稿前去 AI 腔 | 用 |
| `agent-reach` | 唐代职官、礼制、同类游戏调研 | 用 |
| `skill-creator` | 已用于建 `art-style` | 已用 |
| `run` / `code-review` / `security-review` | 常规开发辅助 | 用 |

---

## 二、技能库之外

### 2.1 主要发现：awesome-gamedev-agent-skills

**https://github.com/gamedev-skills/awesome-gamedev-agent-skills**

- 926 star，Apache-2.0
- 73 个技能，标准 `SKILL.md` 格式，Claude Code / Cursor / Codex / Copilot 通用
- 目录：`godot`、`unity`、`unreal`、`web-engines`、`other-engines`、`disciplines`、`genres`、`workflows`，另有 `router/SKILL.md` 自动按引擎路由

我抽查了 `disciplines/dialogue-systems` 的正文，质量是真的。它独立得出了和我们开发计划一样的结论：分支对话建模成图、Ink 与 Yarn 与自定义 JSON runner 的取舍、用 line ID 而非硬编码字符串、校验每条分支都能走到终点。不是凑数的目录。

和本项目直接相关的技能：

| 技能 | 路径 | 能干什么 | 用在哪一步 | 采用 |
|---|---|---|---|---|
| `dialogue-systems` | `disciplines/` | 分支对话的节点、条件、变量建模 | Day 1 到 2 定 story-schema | **装** |
| `visual-novel` | `genres/` | 立绘显示、文本框、分支脚本的成套做法 | Day 1 到 3 引擎骨架 | **装** |
| `save-systems` | `disciplines/` | 存档结构、版本迁移 | Day 1 存读档；Day 6 剧情改了旧档不崩 | **装** |
| `threejs-scene-setup` | `web-engines/` | 场景、相机、渲染器、动画循环 | Day 4 的 `ThreeStageRenderer` | **装** |
| `threejs-materials-lighting` | `web-engines/` | 材质与光照 | Day 4 到 5 水墨着色 | 可选 |
| `game-ui-ux` | `disciplines/` | HUD、菜单、分辨率缩放、焦点导航 | Day 4 到 5 UI | 可选 |
| `audio-design` | `disciplines/` | 音频总线、自适应音乐、SFX、ducking | Day 4 音频 | 可选 |
| `itch-publish` | `workflows/` | 用 butler 发布与更新 itch.io | Day 7 发行 | 可选 |
| `shader-programming` | `disciplines/` | 着色器通用写法 | 墨线与纸纹 | 可选 |
| `create-game-assets` | `disciplines/` | 美术方向与资产生产管线 | 与我们的 `art-style` 重叠 | **不装** |
| `phaser-core`、`pixijs-rendering` | `web-engines/` | Phaser 4.2 与 PixiJS v8 | 我们不用这两个引擎 | 不装 |
| `router` | 根目录 | 自动检测引擎并加载相关技能 | 73 个全量装才需要 | 不装 |

`create-game-assets` 明确不装。它是通用的美术管线技能，而我们的 `art-style` 绑死了水墨唐风和女性主义构图规则。两者同时在场会互相稀释，审图时给出矛盾建议。

**安装方式的一条提醒。** 官方给的是一条命令装全部 73 个：

```bash
npx skills add gamedev-skills/awesome-gamedev-agent-skills
```

**不建议这么装**，两个原因。一是 73 个技能的描述会一直占着上下文，绝大多数（Unreal、Roblox、tower-defense）和我们无关。二是第三方 `SKILL.md` 的正文是 agent 会照着执行的指令，等于把别人写的提示词接进我们的工作流。

建议改成：clone 仓库，人工读过上面标「装」的那四个 `SKILL.md` 正文，确认无误后复制到 `.claude/skills/` 下。四个文件，十分钟的事。装不装、装哪几个，等 YIDI 拍板。

### 2.2 其他技能合集

搜到的都是通用向，没有游戏内容，不采用：`JayZeeDesign/awesome-claude-skills`、`ComposioHQ/awesome-claude-skills`、`karanb192/awesome-claude-skills`、`VoltAgent/awesome-agent-skills`、`GetBindu/awesome-claude-code-and-skills`。

Snyk 有一篇《Top 8 Claude Skills for 3D Modeling, Game Dev, and Shader Programming》可作二次线索，但它推荐的多数指向上面那个 gamedev 合集，没有新增信息。

### 2.3 three.js 官方与社区资源：可直接复用的三个

已写进 `.claude/skills/art-style/references/scene.md`，这里列来源与理由。

1. **Toon Material with OutlineEffect**。`MeshToonMaterial` 加 `OutlineEffect` 的完整用法，直接对应我们要的平涂五级色阶加焦墨描边。这是主路线。
   https://threejs.org/examples/webgl_materials_toon
2. **Sobel 边缘检测后处理**。官方 `webgl_postprocessing_sobel`。当反向法线外扩描边在复杂几何（窗棂、柱列）上出锯齿时，改用后处理描边的备选方案。
   https://threejs.org/examples/webgl_postprocessing_sobel.html
3. **Sketchy Pencil Effect（Codrops）**。把 Sobel 描边与主渲染合成、再叠纸纹抖动的完整实现。我们要的「墨线加宣纸」合成方式和它结构一致，换掉色板即可用。
   https://tympanus.net/codrops/2022/11/29/sketchy-pencil-effect-with-three-js-post-processing/

技术细节记一笔：`gradientMap` 的 `minFilter` 和 `magFilter` 必须设成 `NearestFilter`，否则五级色阶会被插值成渐变，平涂效果就没了。这是这条路线上最常见的坑。

精神指南引用的 Codrops WebGPU 水墨庭园案例效果很好，但它走 WebGPU 加 TSL，移动端兼容面比 WebGL 窄。第一周不跟，留作后续参照。

### 2.4 three.js 文档类 MCP：结论是不接

找到三个：

| MCP | 做什么 | 评估 |
|---|---|---|
| `deya-0x/ThreeJSMCP` | three.js 文档查询，返回文档链接、代码示例、说明 | 不接 |
| MCP 官方 `ext-apps` 的 `threejs-server` | 执行 JS 创建并流式预览 3D 场景 | 不接 |
| `locchung/three-js` | 通过 WebSocket 增删移动场景里的 3D 对象 | 不接 |

理由：我们要用的 three.js 面很窄，就是 `MeshToonMaterial`、`OutlineEffect`、`EffectComposer` 加一个正交相机。这些 API 稳定多年，需要核对时直接查官方文档即可。接 MCP 要付配置成本和常驻的工具描述上下文，换来的是我们用不到的广度。

第三个（WebSocket 实时操控场景）在做**相机机位调试**时理论上有价值，八个固定机位需要反复微调位置和焦距。但机位在 `scene.md` 里已经用文字定死了（平视、仰视、俯视，远近，光向），直接写进代码再截图看更快。**如果 Day 4 的机位调试真的卡住**，可以回头再评估它。第一周不接。

---

## 三、`art-style` 技能已建成

位置：`.claude/skills/art-style/`，项目本地，随仓库走。

```
.claude/skills/art-style/
├── SKILL.md              # 总原则、审核六条检查、AI 绘图 prompt 骨架、文件命名
└── references/
    ├── palette.md        # 双色板、朱砂使用规则、CSS 变量、gradientMap 做法
    ├── composition.md    # 留白下限、三段式、主体偏左下、无字碑母题
    ├── character.md      # 立绘规格、三种差分、剪影区分法、朱砂点、唐代服饰
    ├── scene.md          # 八个场景的机位与光线、low-poly 约定、三个参考资源
    ├── ui.md             # 对话框、选项、状态条、字体、墨晕转场、移动端
    └── negative.md       # 禁止项
```

比指挥日志 6.3 节的骨架多了两处，说明一下。

- **参考文件放进 `references/`**，而不是和 `SKILL.md` 平铺。这是技能的标准分层加载约定：`SKILL.md` 常驻上下文，参考文件按需读。SKILL.md 里有一张对照表，说明在做什么事就读哪个文件。
- **加了「审核六条检查」**。原骨架只有规范，没有验收动作。第六条是从精神指南第 4 节借来的：构图上她是观看的主体还是被观看的对象。这条把美学和主题接上了，否则 `art-style` 就只是一份色卡。

三条硬指标可以机器或半机器检查：留白不低于 40%、朱砂占比不超过 3%、色板外颜色为零。最后一条可以直接 grep 代码里的十六进制颜色。

两处需要 YIDI 过目的具体取值：朱砂初值定在 `#C3272B`，纸色定在 `#EDE7DA`。**已由 D-008 改判：朱砂改为 `#A8232A`**，干了的印泥而不是鲜红，理由是它要能和墨共处而不跳出来喊。纸色维持。

**关于 skill-creator 的完整流程。** 它规定要写 test case、跑带技能与不带技能的对照、生成 benchmark 和评审页面。这一步我跳过了。skill-creator 自己写着「输出主观的技能（写作风格、美术）通常不需要 test case」，`art-style` 正是这一类，产出好不好只能靠人看。真要跑评估，得先有真实立绘和场景，等 Day 5 有资产了再回来做更有意义。

---

## 四、开发计划已按 D-003 修订

`开发计划.md` 改了七处。

| 位置 | 改了什么 |
|---|---|
| 文件头 | 加文档优先级说明（指挥日志优先于开发计划）和相关文档索引 |
| 3.1 关键决策 | 「不用 Three.js」改成「3D 舞台加 2D 对话」分层方案，附 `SceneRenderer` 接口定义和退出闸门 |
| 3.2 技术栈表 | 渲染拆成对话层与背景层两行，另加 3D 一行 |
| 3.5 目录树 | 加 `src/scene/`（接口加两个实现）、`public/scene/`（模型）、`public/tex/`（色阶图与纸纹） |
| Day 1 | 背景层从第一天起走接口，当天要演示一次换渲染器 |
| Day 4 | 改成「关系系统加 3D 舞台立起来」，两个场景跑通，书阁和含元殿 |
| Day 5 | 改成「美术铺满加性能闸门」，收工前跑帧率不低于 30 且首屏不超过 3 秒，不过就当场退回 CSS 版 |

设计上我多加了一条 Day 1 的验收动作：**注册一个什么都不画的空渲染器，游戏要照常跑完三段文本**。D-003 的退路能不能用，取决于分层是不是真的干净。这件事只有在第一天验证才便宜，等到 Day 5 才发现耦合就晚了。

---

## 五、待 YIDI 拍板

1. **要不要装 gamedev-skills 的那四个技能**（`dialogue-systems`、`visual-novel`、`save-systems`、`threejs-scene-setup`）。建议装，但用人工 clone 加复制的方式，不用一条命令装 73 个。
2. **Unity 插件在你的插件市场界面里能不能看到。** 我这边搜不到。看得到也建议不装，只是想确认是不是可见性问题。
3. **朱砂与纸色的具体取值**是否认可，见第三节。
4. 指挥日志里原有的两项：**游戏名**（《吾则天》还是《吾泽添》）和**主角的名字与登基后自造的那个字**。名字一天不定，所有文档就得一直挂「暂名」。

---

## 附：本次调研的来源

- [awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills)
- [Top 8 Claude Skills for 3D Modeling, Game Dev, and Shader Programming (Snyk)](https://snyk.io/articles/top-claude-skills-3d-modeling-game-dev-shader-programming/)
- [three.js Toon Material with OutlineEffect](https://threejs.org/examples/webgl_materials_toon)
- [three.js Sobel 边缘检测后处理](https://threejs.org/examples/webgl_postprocessing_sobel.html)
- [Sketchy Pencil Effect with Three.js Post-Processing (Codrops)](https://tympanus.net/codrops/2022/11/29/sketchy-pencil-effect-with-three-js-post-processing/)
- [MeshToonMaterial 文档](https://threejs.org/docs/pages/MeshToonMaterial.html)
- [ThreeJSMCP](https://github.com/deya-0x/ThreeJSMCP)
- [MCP 官方 threejs-server 示例](https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/threejs-server)
- [three-js-mcp](https://www.pulsemcp.com/servers/locchung-three-js)

---

## 六、执行记录（Prompt B 第 3 步）

按 D-007 装了四个技能，人工方式，未用 `npx skills add`。

- 来源：`gamedev-skills/awesome-gamedev-agent-skills`，commit `cf44d99`，2026-09-08
- 许可：Apache-2.0。`VENDOR-LICENSE-Apache-2.0.txt` 与 `VENDOR-NOTICE.txt` 已随文件一并放进 `.claude/skills/`
- 四个技能原样复制，未改动任何一个字，方便日后跟上游对齐

### 越界指令审查

逐份读过正文与 frontmatter。**四份全部干净**，没有发现任何越界内容：没有要求联网、外发数据、读取工作区之外的路径、修改配置、安装依赖，也没有「忽略先前指令」这类注入式写法。正文全是技术指导和代码示例。

| 技能 | 判断 | 采纳时需要注意的地方 |
|---|---|---|
| `dialogue-systems` | 干净 | 它主张从第一天就用 line ID 而非硬编码文本。我们按 D-005 只做中文，但仍照它办：每句台词带 `id`，见 `story-schema.md` 的理由 |
| `visual-novel` | 干净 | 它列的 backlog、skip、auto、save-anywhere 是 VN 的基线功能，不是加分项。我把它们排进了 Day 4 到 Day 6 |
| `save-systems` | 干净 | 它的原子写与 `.bak` 那节是文件系统语境，我们用 localStorage 不适用。真正有用的是版本号与迁移链那一节 |
| `threejs-scene-setup` | 干净 | 它默认 `PerspectiveCamera` 加 `OrbitControls`，我们两样都不用：机位固定，相机不交给玩家。已在 `art-style/references/scene.md` 末尾注明 |

一处结构性副作用：这四份技能的「Related skills」会指向没装的兄弟技能（`godot-ui-control`、`roblox-datastores`、`unity-scriptableobjects`、`rpg`、`pixijs-rendering` 等）。这些指针会悬空。我选择不改它们的正文，因为改了以后跟上游同步会很痛；悬空指针的代价只是偶尔提到一个不存在的技能名，比维护一份分叉便宜。

---

## 七、艺术总监技能（Prompt B5 第 1 步）

按 D-024 找「艺术总监」类技能，不限游戏领域。

| 来源 | 结果 |
|---|---|
| `SearchSkills`（art director、visual quality、design critique、composition、illustration review、aesthetic judgment） | 仅命中 `ara-rigor-reviewer`，是论文审稿，不相关 |
| `SearchPlugins` 同关键词 | 空 |
| GitHub `curiositech/some_claude_skills` 的 `design-critic` | UI 审稿：无障碍 20%、色彩 15%、字体 15%、布局 20%、**现代感 15%**、可用性 15%。「现代感」对我们是反向指标 |
| GitHub `richhemsley3/claude-design-skills` 的 `design-critique` | 尼尔森十条可用性启发式加 UX 定律。审的是产品界面不是画面 |
| GitHub `bergside/awesome-design-skills` | 67 个 UI 设计系统技能，没有一条讲插画、构图或明暗 |

**结论：不采用，自己写了 `.claude/skills/art-director/`。** 两个候选都在审「界面好不好用」，我们要审的是「画面好不好」：剪影可读、明暗结构、留白、焦点、线的质量、色的关系、姿态传情、尺度、层级、动的节奏。这十条各 10 分，`references/rubric.md` 每条给了差、中、好三档描述。它和 art-style 的分工：art-style 管风格一致（过或退回），art-director 管水准高低（打分，且必须说出最该改的一条）。

## 八、B5 第 2、3 步的执行记录

- **立绘**：`tools/gen-char.ts` 参数化生成 10 人 × 3 表情，落在 `src/char/`，构建期打进包里。发髻、服饰、主调、道具、朱砂点十人设定表冻结在 `art-style/references/character.md`。朱砂点用 `var(--c-accent, var(--c-ink-4))`，金碧场景自动转泥金。
- **3D 舞台**：`src/scene/ThreeStageRenderer.ts`，昭阳殿（金碧，有马）与书阁（水墨夜景，一盏灯）两个程序化场景，三级灰阶 ramp 加逐物件色板色，反向法线外扩描边，按舞台宽度定视角，一次缓慢推镜。three.js 动态加载，默认 CSS 版不背它。
- **两份产物**：`npm run build:artifact` 出 CSS 主版，`npm run build:3d` 出 three 内联的 3D 试玩版。`?renderer=three` 在主版里会退回 CSS 而不是白屏。
- **性能**：桌面上昭阳殿 896 面约 0.7ms 一帧，书阁 572 面约 0.4ms 一帧，都远在 33ms 门槛之内。**中端安卓的数据没有，要 YIDI 用 3D 试玩版在真机上看左上角的读数。** D-003 的闸门要真机过。

---

## 九、作家／编剧类技能（Prompt B6 第 6 步）

按 D-032 找「写得像人」和「写得好」两类技能。技能库与插件市场仍然为空，GitHub 上有货。

| 候选 | 管什么 | 对中文古风对白有没有用 | 采用 |
|---|---|---|---|
| [`haowjy/creative-writing-skills`](https://github.com/haowjy/creative-writing-skills) 的 `creative-writing-craft` | **写得好。** 心理距离、自由间接引语、节奏、感官落地、场景入口、对白的潜台词 | 有用。讲的是小说怎么在页面上运作，和语言无关 | **装** |
| 同一仓库的 `story-review` | **写得像人。** `resources/prose-critique/antipatterns.md` 逐条列 AI 文本的可测特征，注明研究来源（Kobak 2024、RAID、Ghostbuster 等），还有一份分级编辑流程 | 有用，而且是这批里最有用的一份。「对白没有潜台词」「内心是被总结的不是被经历的」「干净但空」三条跨语言成立 | **装** |
| [`forjd/better-writing`](https://github.com/forjd/better-writing)（MIT） | 写得像人，但目标是邮件、报告、文档、UI 文案 | 它的语气旋钮和「为读者写」那套对产品文案有用，对唐代宫廷对白没用 | 不装 |
| 同仓库的 `llm-writing` | 写得像人。删除清单质量高 | 清单是英文非虚构的（Moreover、Furthermore）。只有「不是 X，而是 Y」这条在中文里同样是 AI 腔，我把它抄进了 prose-style，没装整个技能 | 不装 |
| `danjdewhurst/story-skills`、`cjdavis62/claude-creative-writing` | 故事圣经、角色档案、世界观文件的项目格式 | 我们已经有 tone-bible、角色圣经、story-schema，重复 | 不装 |

**来源**：`haowjy/creative-writing-skills`，commit `fd7a3ad`，Apache-2.0，454 star。LICENSE 已随文件放进 `.claude/skills/VENDOR-LICENSE-cws-Apache-2.0.txt`。

**越界指令审查：两份都干净。** 没有联网、外发、读工作区外路径、改配置，也没有注入式写法。`story-review` 带一个 `resources/prose-critique/analyze.py`：只用标准库，无网络无写盘，但它的分词是 `[A-Za-z]+`、断句靠 `.!?`，**对中文完全无效**，别指望它出的数。

两份的「Related skills」会指向没装的兄弟技能（`/reader-sim`、`/writing-principles`、`/creative-writing-modes`）。悬空指针，代价只是偶尔提到一个不存在的技能名，比维护一份分叉便宜——和 gamedev 那批同一个取舍。

## 十、prose-style 技能（Prompt B6 第 7 步）

`.claude/skills/prose-style/SKILL.md`，按 D-032 搭了骨架：

- **三条总纲**：先给动作再给情绪；句子按重量排长短；每个人只说自己那种话。
- **句长节奏表**：四类用途对应四档长度，落实 R-004 的「每场至少两句 20 到 40 字」。
- **AI 腔禁用词与句式**：七类禁用词、六条禁用句式，外加从 `story-review` 借来的三条更难看见的（对白没有潜台词、内心是被总结的、干净但空）。
- **十个人的说话指纹**：从角色圣经的「原创示范台词」提取，每人给句法习惯、怎么拒绝、怎么表达在意。附一条自查：把这句话换到另一个人嘴里如果照样成立，就是没写出指纹。
- **唐代语感从哪里来**：不是之乎者也。一张现代抽象词到唐代具体词的对照表，加「短、不铺垫」的句法要求。
- **九条交稿自审清单**。
- 第七节留了正负例的空位，等 Cowork 提供二十句好的十句差的。

第八节写明：**玩家看得见的每一句中文都归这份管**，不只是剧本。选项文本、对诗题面、信的三层、结局题跋、界面上的字都算——界面最容易写成产品腔。

