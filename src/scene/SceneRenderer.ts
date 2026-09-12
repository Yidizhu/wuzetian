import type { Palette, SceneKey } from "../engine/types.ts";

/**
 * 背景层接口。CSS 视差版和 Three.js 舞台版实现同一个接口。
 *
 * 这是 D-003 那条退路的全部依据：M5 结束前如果手机上帧率或首屏不达标，
 * 换一行注册代码就退回 CSS 版，对话层一个字都不用改。
 * 所以这个接口只能有背景层自己的事，绝不能漏进任何对话、数值、UI 的概念。
 */
export interface SceneDescriptor {
  key: SceneKey;
  palette: Palette;
  act: number;
  /**
   * 场景布置（D-046 第 2 条）。自由字符串，现在只有 `"gongyi"`（公议：多几张案、一面收封簿）。
   * 由剧本的场景表给，不由场景 id 推——id 是从标题生成的，标题会改。
   */
  dressing?: string;
}

export interface SceneRenderer {
  /** renderer 自己决定往这个容器里塞什么，或者什么都不塞 */
  mount(root: HTMLElement): void;
  /** 预载资源，不显示 */
  load(d: SceneDescriptor): Promise<void>;
  /** 切场景，自带墨晕转场 */
  show(d: SceneDescriptor): Promise<void>;
  /** 关键 beat 的缓慢推拉。CSS 版做轻微缩放，3D 版动相机 */
  beat(name: string): void;
  /**
   * 水墨侵入朝廷的覆盖面积，0–1（D-010 第 3 条）。引擎每次换场算一次，见 engine/ink.ts。
   *
   * 可选：没实现的 renderer（空渲染器、CSS 版）当它不存在，引擎不会因此少做别的事。
   * 这一层只在金碧场景上显形，那个判断归 renderer——引擎不该知道墨叠在什么上面。
   */
  setInk?(v: number): void;
  /**
   * 场景布置（D-046 第 2 条）。空串 = 平常；现有 `gongyi`、`yeyu`、`shouwei`。
   * 可选，和 setInk 同一个用法：引擎在 show 之后每场调一次。值由剧本给，引擎不解释它。
   */
  setDressing?(name: string): void;
  resize(w: number, h: number): void;
  dispose(): void;
}
